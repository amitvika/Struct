from __future__ import print_function

from OCC.Core.gp import (gp_Lin, gp_Circ, gp_Elips, gp_Hypr, gp_Parab, gp_Other)
from OCC.Core.Geom import (Geom_BezierCurve, Geom_BSplineCurve, Geom_OffsetCurve, Geom_TrimmedCurve )

__all__ = ['Topo', 'WireExplorer', 'dumpTopology', 'dumpTopologyStructures',\
     'getFacesEdgesVerticesFromShapes', 'dumpTopologyFacesEdgesVertices', 'dumpTopologySolids',\
         'recognize_face_entity_info','recognize_edge_entity_info','recognize_vertex_entity_info',\
             'recognize_shape_entity_info','recognize_by_threejs']

import sys
from numpy import zeros

from OCC.Core.BRep import BRep_Tool

from OCC.Core.BRepTools import BRepTools_WireExplorer
from OCC.Core.TopAbs import (TopAbs_VERTEX, TopAbs_EDGE, TopAbs_FACE, TopAbs_WIRE,
                        TopAbs_SHELL, TopAbs_SOLID, TopAbs_COMPOUND,
                        TopAbs_COMPSOLID,TopAbs_Orientation)
from OCC.Core.TopExp import TopExp_Explorer, topexp_MapShapesAndAncestors
from OCC.Core.TopTools import (TopTools_ListOfShape,
                          TopTools_ListIteratorOfListOfShape,
                          TopTools_IndexedDataMapOfShapeListOfShape)
from OCC.Core.TopoDS import (topods, TopoDS_Wire, TopoDS_Vertex, TopoDS_Edge,
                        TopoDS_Face, TopoDS_Shell, TopoDS_Solid, TopoDS_Shape, 
                        TopoDS_Compound, TopoDS_CompSolid, topods_Edge,
                        topods_Vertex, TopoDS_Iterator)
from OCC.Core.GeomAbs import (GeomAbs_C0, 
                              GeomAbs_Plane, GeomAbs_Cylinder, GeomAbs_Cone,GeomAbs_Sphere, GeomAbs_Torus,
                              GeomAbs_BezierSurface, GeomAbs_BSplineSurface,GeomAbs_SurfaceOfRevolution, 
                              GeomAbs_SurfaceOfExtrusion, GeomAbs_OffsetSurface, GeomAbs_OtherSurface,                               
                              GeomAbs_Line, GeomAbs_Circle, GeomAbs_Ellipse, GeomAbs_Ellipse,GeomAbs_Hyperbola,
                              GeomAbs_Parabola, GeomAbs_BezierCurve, GeomAbs_BSplineCurve, GeomAbs_OtherCurve,
                              GeomAbs_OffsetCurve)
from OCC.Core.BRepAdaptor import BRepAdaptor_Surface, BRepAdaptor_Curve
from OCC.Core.TColStd import (TColStd_Array1OfInteger, TColStd_Array1OfReal, TColStd_Array2OfReal)
from OCC.Core.TColgp import (TColgp_Array1OfPnt, TColgp_Array2OfPnt)
#from ..OCCExtend.ShapeFactory import (recognize_edge, recognize_face, recognize_shape)
from ..gltfDictionary import gltfdict
gltf_Dict = gltfdict()

class WireExplorer(object):
    '''
    Wire traversal
    '''
    def __init__(self, wire):
        assert isinstance(wire, TopoDS_Wire), 'not a TopoDS_Wire'
        self.wire = wire
        self.wire_explorer = BRepTools_WireExplorer(self.wire)
        self.done = False

    def _reinitialize(self):
        self.wire_explorer = BRepTools_WireExplorer(self.wire)
        self.done = False

    def _loop_topo(self, edges=True):
        if self.done:
            self._reinitialize()
        topologyType = topods_Edge if edges else topods_Vertex
        seq = []
        hashes = []  # list that stores hashes to avoid redundancy
        occ_seq = TopTools_ListOfShape()
        while self.wire_explorer.More():
            # loop edges
            if edges:
                current_item = self.wire_explorer.Current()
            # loop vertices
            else:
                current_item = self.wire_explorer.CurrentVertex()
            current_item_hash = current_item.__hash__()
            if not current_item_hash in hashes:
                hashes.append(current_item_hash)
                occ_seq.Append(current_item)
            self.wire_explorer.Next()

        # Convert occ_seq to python list
        occ_iterator = TopTools_ListIteratorOfListOfShape(occ_seq)
        while occ_iterator.More():
            topo_to_add = topologyType(occ_iterator.Value())
            seq.append(topo_to_add)
            occ_iterator.Next()
        self.done = True
        return iter(seq)

    def ordered_edges(self):
        return self._loop_topo(edges=True)

    def ordered_vertices(self):
        return self._loop_topo(edges=False)


class Topo(object):
    '''
    Topology traversal
    '''

    def __init__(self, myShape, ignore_orientation=False):
        """

        implements topology traversal from any TopoDS_Shape
        this class lets you find how various topological entities are connected from one to another
        find the faces connected to an edge, find the vertices this edge is made from, get all faces connected to
        a vertex, and find out how many topological elements are connected from a source

        *note* when traversing TopoDS_Wire entities, its advised to use the specialized
        ``WireExplorer`` class, which will return the vertices / edges in the expected order

        :param myShape: the shape which topology will be traversed

        :param ignore_orientation: filter out TopoDS_* entities of similar TShape but different Orientation

        for instance, a cube has 24 edges, 4 edges for each of 6 faces

        that results in 48 vertices, while there are only 8 vertices that have a unique
        geometric coordinate

        in certain cases ( computing a graph from the topology ) its preferable to return
        topological entities that share similar geometry, though differ in orientation
        by setting the ``ignore_orientation`` variable
        to True, in case of a cube, just 12 edges and only 8 vertices will be returned

        for further reference see TopoDS_Shape IsEqual / IsSame methods

        """
        self.myShape = myShape
        self.ignore_orientation = ignore_orientation

        # the topoFactory dicts maps topology types and functions that can
        # create this topology
        self.topoFactory = {
            TopAbs_VERTEX: topods.Vertex,
            TopAbs_EDGE: topods.Edge,
            TopAbs_FACE: topods.Face,
            TopAbs_WIRE: topods.Wire,
            TopAbs_SHELL: topods.Shell,
            TopAbs_SOLID: topods.Solid,
            TopAbs_COMPOUND: topods.Compound,
            TopAbs_COMPSOLID: topods.CompSolid
        }

    def _loop_topo(self, topologyType, topologicalEntity=None, topologyTypeToAvoid=None):
        '''
        this could be a faces generator for a python TopoShape class
        that way you can just do:
        for face in srf.faces:
            processFace(face)
        '''
        topoTypes = {TopAbs_VERTEX: TopoDS_Vertex,
                     TopAbs_EDGE: TopoDS_Edge,
                     TopAbs_FACE: TopoDS_Face,
                     TopAbs_WIRE: TopoDS_Wire,
                     TopAbs_SHELL: TopoDS_Shell,
                     TopAbs_SOLID: TopoDS_Solid,
                     TopAbs_COMPOUND: TopoDS_Compound,
                     TopAbs_COMPSOLID: TopoDS_CompSolid}

        assert topologyType in topoTypes.keys(), '%s not one of %s' % (topologyType, topoTypes.keys())
        self.topExp = TopExp_Explorer()
        # use self.myShape if nothing is specified
        if topologicalEntity is None and topologyTypeToAvoid is None:
            self.topExp.Init(self.myShape, topologyType)
        elif topologicalEntity is None and topologyTypeToAvoid is not None:
            self.topExp.Init(self.myShape, topologyType, topologyTypeToAvoid)
        elif topologyTypeToAvoid is None:
            self.topExp.Init(topologicalEntity, topologyType)
        elif topologyTypeToAvoid:
            self.topExp.Init(topologicalEntity,
                             topologyType,
                             topologyTypeToAvoid)
        seq = []
        hashes = []  # list that stores hashes to avoid redundancy
        occ_seq = TopTools_ListOfShape()
        while self.topExp.More():
            current_item = self.topExp.Current()
            current_item_hash = current_item.__hash__()

            if not current_item_hash in hashes:
                hashes.append(current_item_hash)
                occ_seq.Append(current_item)

            self.topExp.Next()
        # Convert occ_seq to python list
        occ_iterator = TopTools_ListIteratorOfListOfShape(occ_seq)
        while occ_iterator.More():
            topo_to_add = self.topoFactory[topologyType](occ_iterator.Value())
            seq.append(topo_to_add)
            occ_iterator.Next()

        if self.ignore_orientation:
            # filter out those entities that share the same TShape
            # but do *not* share the same orientation
            filter_orientation_seq = []
            for i in seq:
                _present = False
                for j in filter_orientation_seq:
                    if i.IsSame(j):
                        _present = True
                        break
                if _present is False:
                    filter_orientation_seq.append(i)
            return filter_orientation_seq
        else:
            return iter(seq)

    def faces(self):
        '''
        loops over all faces
        '''
        return self._loop_topo(TopAbs_FACE)

    def _number_of_topo(self, iterable):
        n = 0
        for _ in iterable:
            n += 1
        return n

    def number_of_faces(self):
        return self._number_of_topo(self.faces())

    def vertices(self):
        '''
        loops over all vertices
        '''
        return self._loop_topo(TopAbs_VERTEX)

    def number_of_vertices(self):
        return self._number_of_topo(self.vertices())

    def edges(self):
        '''
        loops over all edges
        '''
        return self._loop_topo(TopAbs_EDGE)

    def number_of_edges(self):
        return self._number_of_topo(self.edges())

    def wires(self):
        '''
        loops over all wires
        '''
        return self._loop_topo(TopAbs_WIRE)

    def number_of_wires(self):
        return self._number_of_topo(self.wires())

    def shells(self):
        '''
        loops over all shells
        '''
        return self._loop_topo(TopAbs_SHELL, None)

    def number_of_shells(self):
        return self._number_of_topo(self.shells())

    def solids(self):
        '''
        loops over all solids
        '''
        return self._loop_topo(TopAbs_SOLID, None)

    def number_of_solids(self):
        return self._number_of_topo(self.solids())

    def comp_solids(self):
        '''
        loops over all compound solids
        '''
        return self._loop_topo(TopAbs_COMPSOLID)

    def number_of_comp_solids(self):
        return self._number_of_topo(self.comp_solids())

    def compounds(self):
        '''
        loops over all compounds
        '''
        return self._loop_topo(TopAbs_COMPOUND)

    def number_of_compounds(self):
        return self._number_of_topo(self.compounds())

    def ordered_vertices_from_wire(self, wire):
        '''
        @param wire: TopoDS_Wire
        '''
        we = WireExplorer(wire)
        return we.ordered_vertices()

    def number_of_ordered_vertices_from_wire(self, wire):
        return self._number_of_topo(self.ordered_vertices_from_wire(wire))

    def ordered_edges_from_wire(self, wire):
        '''
        @param wire: TopoDS_Wire
        '''
        we = WireExplorer(wire)
        return we.ordered_edges()

    def number_of_ordered_edges_from_wire(self, wire):
        return self._number_of_topo(self.ordered_edges_from_wire(wire))

    def _map_shapes_and_ancestors(self, topoTypeA, topoTypeB, topologicalEntity):
        '''
        using the same method
        @param topoTypeA:
        @param topoTypeB:
        @param topologicalEntity:
        '''
        topo_set = set()
        _map = TopTools_IndexedDataMapOfShapeListOfShape()
        topexp_MapShapesAndAncestors(self.myShape, topoTypeA, topoTypeB, _map)
        results = _map.FindFromKey(topologicalEntity)
        if results.Size() == 0:
            yield None

        topology_iterator = TopTools_ListIteratorOfListOfShape(results)
        while topology_iterator.More():

            topo_entity = self.topoFactory[topoTypeB](topology_iterator.Value())

            # return the entity if not in set
            # to assure we're not returning entities several times
            if not topo_entity in topo_set:
                if self.ignore_orientation:
                    unique = True
                    for i in topo_set:
                        if i.IsSame(topo_entity):
                            unique = False
                            break
                    if unique:
                        yield topo_entity
                else:
                    yield topo_entity

            topo_set.add(topo_entity)
            topology_iterator.Next()

    def _number_shapes_ancestors(self, topoTypeA, topoTypeB, topologicalEntity):
        '''returns the number of shape ancestors
        If you want to know how many edges a faces has:
        _number_shapes_ancestors(self, TopAbs_EDGE, TopAbs_FACE, edg)
        will return the number of edges a faces has   
        @param topoTypeA:
        @param topoTypeB:
        @param topologicalEntity:
        '''
        topo_set = set()
        _map = TopTools_IndexedDataMapOfShapeListOfShape()
        topexp_MapShapesAndAncestors(self.myShape, topoTypeA, topoTypeB, _map)
        results = _map.FindFromKey(topologicalEntity)
        if results.Size() == 0:
            return None
        topology_iterator = TopTools_ListIteratorOfListOfShape(results)
        while topology_iterator.More():
            topo_set.add(topology_iterator.Value())
            topology_iterator.Next()
        return len(topo_set)

    # ======================================================================
    # EDGE <-> FACE
    # ======================================================================
    def faces_from_edge(self, edge):
        """

        :param edge:
        :return:
        """
        return self._map_shapes_and_ancestors(TopAbs_EDGE, TopAbs_FACE, edge)

    def number_of_faces_from_edge(self, edge):
        """

        :param edge:
        :return:
        """
        return self._number_shapes_ancestors(TopAbs_EDGE, TopAbs_FACE, edge)

    def edges_from_face(self, face):
        """

        :param face:
        :return:
        """
        return self._loop_topo(TopAbs_EDGE, face)

    def number_of_edges_from_face(self, face):
        cnt = 0
        for _ in self._loop_topo(TopAbs_EDGE, face):
            cnt += 1
        return cnt

    # ======================================================================
    # VERTEX <-> EDGE
    # ======================================================================
    def vertices_from_edge(self, edg):
        return self._loop_topo(TopAbs_VERTEX, edg)

    def number_of_vertices_from_edge(self, edg):
        cnt = 0
        for _ in self._loop_topo(TopAbs_VERTEX, edg):
            cnt += 1
        return cnt

    def edges_from_vertex(self, vertex):
        return self._map_shapes_and_ancestors(TopAbs_VERTEX, TopAbs_EDGE, vertex)

    def number_of_edges_from_vertex(self, vertex):
        return self._number_shapes_ancestors(TopAbs_VERTEX, TopAbs_EDGE, vertex)

    # ======================================================================
    # WIRE <-> EDGE
    # ======================================================================
    def edges_from_wire(self, wire):
        return self._loop_topo(TopAbs_EDGE, wire)

    def number_of_edges_from_wire(self, wire):
        cnt = 0
        for _ in self._loop_topo(TopAbs_EDGE, wire):
            cnt += 1
        return cnt

    def wires_from_edge(self, edg):
        return self._map_shapes_and_ancestors(TopAbs_EDGE, TopAbs_WIRE, edg)

    def wires_from_vertex(self, edg):
        return self._map_shapes_and_ancestors(TopAbs_VERTEX, TopAbs_WIRE, edg)

    def number_of_wires_from_edge(self, edg):
        return self._number_shapes_ancestors(TopAbs_EDGE, TopAbs_WIRE, edg)

    # ======================================================================
    # WIRE <-> FACE
    # ======================================================================
    def wires_from_face(self, face):
        return self._loop_topo(TopAbs_WIRE, face)

    def number_of_wires_from_face(self, face):
        cnt = 0
        for _ in self._loop_topo(TopAbs_WIRE, face):
            cnt += 1
        return cnt

    def faces_from_wire(self, wire):
        return self._map_shapes_and_ancestors(TopAbs_WIRE, TopAbs_FACE, wire)

    def number_of_faces_from_wires(self, wire):
        return self._number_shapes_ancestors(TopAbs_WIRE, TopAbs_FACE, wire)

    # ======================================================================
    # VERTEX <-> FACE
    # ======================================================================
    def faces_from_vertex(self, vertex):
        return self._map_shapes_and_ancestors(TopAbs_VERTEX, TopAbs_FACE, vertex)

    def number_of_faces_from_vertex(self, vertex):
        return self._number_shapes_ancestors(TopAbs_VERTEX, TopAbs_FACE, vertex)

    def vertices_from_face(self, face):
        return self._loop_topo(TopAbs_VERTEX, face)

    def number_of_vertices_from_face(self, face):
        cnt = 0
        for _ in self._loop_topo(TopAbs_VERTEX, face):
            cnt += 1
        return cnt

    # ======================================================================
    # FACE <-> SOLID
    # ======================================================================
    def solids_from_face(self, face):
        return self._map_shapes_and_ancestors(TopAbs_FACE, TopAbs_SOLID, face)

    def number_of_solids_from_face(self, face):
        return self._number_shapes_ancestors(TopAbs_FACE, TopAbs_SOLID, face)

    def faces_from_solids(self, solid):
        return self._loop_topo(TopAbs_FACE, solid)

    def number_of_faces_from_solids(self, solid):
        cnt = 0
        for _ in self._loop_topo(TopAbs_FACE, solid):
            cnt += 1
        return cnt

def dumpTopologyStructures(shape, level=0, parentId=[], returnStructure=[], faceInfo=None, depth=0):
    """
     Print the details of an object from the top down
    """
    if shape:
        brt = BRep_Tool()
        s = shape.ShapeType()
        myhash = hash(shape)
        dict = {"id":myhash,
                "parentId":parentId[-1],
                "type":shapeString(shape),
                "indent": level,
                "leaf": False}
        if s == TopAbs_VERTEX:
            pnt = brt.Pnt(topods_Vertex(shape))        
            dict["Info"] =  {"x":pnt.X(),"y": pnt.Y(), "z":pnt.Z(), "kind":"Point"}
            dict["leaf"] = True
        elif s == TopAbs_FACE:
            dict["Info"] = recognize_face(shape)        
        elif s == TopAbs_EDGE:        
            dict["Info"] = recognize_edge(shape,faceInfo)
        else:
            dict["Info"] = recognize_shape_entity_info(shape)
        returnStructure.append(dict)
        it = TopoDS_Iterator(shape)
        parentId.append(myhash)
        while it.More():
            shp = it.Value()
            it.Next()
            if( (depth==0) or ((level+1) < depth) ):
                dumpTopologyStructures(shp, level + 1,parentId=parentId, returnStructure=returnStructure,faceInfo=dict["Info"])
        parentId.pop()
    return len(returnStructure)

def hashTransCode(transform):
    hashcode = ''
    for i in range(1,4):
        for j in range(1,5):
            hashcode += str(transform.Value(i,j))
    return hashcode

def dumpTopologySolids(shape, maxlevel=1, level=0, solid_dict={}, comp_dict={}, compsolid_dict={} ):
    """
     Print the details of an object from the top down
    """
    #brt = BRep_Tool()
    if(level>0):
        myhash = str(hash(shape)) 
        s = shape.ShapeType()   
        #toproceed=False 
        if s == TopAbs_SOLID:
            if not myhash in solid_dict:
                solid_dict[myhash]=shape 
            #toproceed=True
        elif s == TopAbs_COMPOUND:
            if not myhash in comp_dict:
                comp_dict[myhash]=shape 
            #toproceed=True
        elif s == TopAbs_COMPSOLID:
            if not myhash in compsolid_dict:
                compsolid_dict[myhash]=shape
        #toproceed=True 
    it = TopoDS_Iterator(shape)    
    while it.More():
        shp = it.Value()
        it.Next()
        level+=1
        if(level <=maxlevel):
            dumpTopologySolids(shp, level=level, solid_dict=solid_dict, comp_dict=comp_dict, compsolid_dict=compsolid_dict)
        level-=1
    return True

def roundoff(point):
    multiplier = 1
    if(sys.maxsize/100000 > point) :
        multiplier = 100000
    else:
        if(sys.maxsize/10000 > point) :
            multiplier = 10000
        else:
            if(sys.maxsize/1000 > point) :
                multiplier = 1000
            else:
                if(sys.maxsize/100 > point) :
                    multiplier = 100
                else:
                    if(sys.maxsize/10 > point) :
                        multiplier = 10
                    else:
                        multiplier = 1  
    return round(point*multiplier,3) / multiplier

def getXYZ(co_ord):
    return (roundoff(co_ord.Coord(1)),roundoff(co_ord.Coord(2)),roundoff(co_ord.Coord(3)))

def getPoint(pt):
    return (roundoff(pt.X()),roundoff(pt.Y()),roundoff(pt.Z()))

def to_np_from_tcolstd_array1_real(tcol_array):
    """
    Convert OCC data to NumPy array.

    :param tcol_array: OCC array of floats.
    :type tcol_array: TColStd_Array1OfReal

    :return: NumPy array of floats.
    :rtype: ndarray
    """
    n = tcol_array.Length()
    array = zeros(n, dtype=float)
    for i in range(n):
        x = tcol_array.Value(i + 1)
        array[i] = x
    return array.tolist()


def to_np_from_tcolstd_array1_integer(tcol_array):
    """
    Convert OCC data to NumPy array.

    :param tcol_array: OCC array of integers.
    :type tcol_array: TColStd_Array1OfInteger

    :return: NumPy array of integers.
    :rtype: ndarray
    """
    n = tcol_array.Length()
    array = zeros(n, dtype=int)
    for i in range(n):
        x = tcol_array.Value(i + 1)
        array[i] = x
    return array.tolist()


def to_np_from_tcolgp_array1_pnt(tcol_array):
    """
    Convert OCC data to NumPy array.

    :param tcol_array: OCC array of points.
    :type tcol_array: TColgp_Array1OfPnt

    :return: NumPy array of points.
    :rtype: ndarray
    """
    n = tcol_array.Length()
    array = zeros((n, 3), dtype=float)
    for i in range(n):
        p = tcol_array.Value(i + 1)
        array[i, :] = p.X(), p.Y(), p.Z()
    return array.tolist()


def to_np_from_tcolgp_array2_pnt(tcol_array):
    """
    Convert OCC data to NumPy array.

    :param tcol_array: OCC array of points.
    :type tcol_array: TColgp_Array2OfPnt

    :return: NumPy array of points.
    :rtype: ndarray
    """
    n, m = tcol_array.ColLength(), tcol_array.RowLength()
    array = zeros((n, m, 3), dtype=float)
    for i in range(n):
        for j in range(m):
            p = tcol_array.Value(i + 1, j + 1)
            array[i, j, :] = p.X(), p.Y(), p.Z()
    return array.tolist()


def to_np_from_tcolstd_array2_real(tcol_array):
    """
    Convert OCC data to NumPy array.

    :param tcol_array: OCC array of floats.
    :type tcol_array: TColStd_Array2OfReal

    :return: NumPy array of floats.
    :rtype: ndarray
    """
    n, m = tcol_array.ColLength(), tcol_array.RowLength()
    array = zeros((n, m), dtype=float)
    for i in range(n):
        for j in range(m):
            x = tcol_array.Value(i + 1, j + 1)
            array[i, j] = x
    return array.tolist()
##################################
# Recognize functions
##################################
def recognize_basiccurve(topods_curve):
    entity = {}
    try:
        firstU = topods_curve.FirstParameter()
        lastU = topods_curve.LastParameter()
        firstP = topods_curve.Value(firstU)
        lastP = topods_curve.Value(lastU)
        entity['distance'] = firstP.SquareDistance(lastP)
        entity["first"]=getPoint(firstP)
        entity["last"]=getPoint(lastP)
    except:
        entity['distance'] = 0
    if isinstance(topods_curve, gp_Lin):
        entity['kind'] = "Line"        
        entity["code"]="L"
    elif isinstance(topods_curve, gp_Circ):
        entity['kind'] = "Circle" 
        gp_circle = topods_curve
        entity['radius'] = gp_circle.Radius()
        entity['center'] = getXYZ(gp_circle.Position().Location())
        entity['xdir'] = getPoint(gp_circle.Position().XDirection())
        entity['ydir'] = getPoint(gp_circle.Position().YDirection())
        entity["code"]="C"  
    elif isinstance(topods_curve, gp_Elips):
        entity['kind'] = "Ellipse"
        gp_ellipse = topods_curve
        entity['major'] = gp_ellipse.MajorRadius()
        entity['minor'] = gp_ellipse.MinorRadius()
        entity['center'] = getXYZ(gp_ellipse.Position().Location())  
        entity['xdir'] = getPoint(gp_ellipse.Position().XDirection())  
        entity['ydir'] = getPoint(gp_ellipse.Position().YDirection())   
        entity["code"]="E"  
    elif isinstance(topods_curve, gp_Hypr):
        entity['kind'] = "Hyperbola" 
        gp_hyperbola = topods_curve
        entity['major'] = gp_hyperbola.MajorRadius()
        entity['minor'] = gp_hyperbola.MinorRadius()
        entity['center'] = getXYZ(gp_hyperbola.Position().Location())
        entity['xdir'] = getPoint(gp_hyperbola.Position().XDirection()) 
        entity['ydir'] = getPoint(gp_hyperbola.Position().YDirection()) 
        entity["code"]="H" 
    elif isinstance(topods_curve, gp_Parab):
        entity['kind'] = "Parabola"   
        gp_parabola = topods_curve
        entity['focal'] = gp_parabola.Focal()        
        entity['center'] = getXYZ(gp_parabola.Position().Location())
        entity['xdir'] = getPoint(gp_parabola.Position().XDirection()) 
        entity['ydir'] = getPoint(gp_parabola.Position().YDirection())
        entity["code"]="P"
    elif isinstance(topods_curve, Geom_BezierCurve):
        entity['kind'] = "Bezier"   
        gp_bezier = topods_curve   
        entity['degree'] = gp_bezier.Degree() 
        entity['start'] = getXYZ(gp_bezier.StartPoint())
        entity['end'] = getXYZ(gp_bezier.EndPoint())
        no_poles = gp_bezier.NbPoles() 
        entity['pole']=no_poles
        poles = []
        weights = []
        for i in range(1,no_poles+1):
            try:
                poles.append(getXYZ(gp_bezier.Pole(i)))
                weights.append(gp_bezier.Weight(i)) 
            except:
                pass
        entity['poles']=poles
        entity['weights']=weights 
    elif isinstance(topods_curve, Geom_BSplineCurve):
        entity['kind'] = "BSpline"   
        gp_nurbs=topods_curve  
        degree = gp_nurbs.Degree()        
        knot = gp_nurbs.NbKnots()
        pole = gp_nurbs.NbPoles()
        entity['degree']=degree
        entity['periodic']=gp_nurbs.IsPeriodic()
        entity['rational']=gp_nurbs.IsRational()
        entity['start'] = getXYZ(gp_nurbs.StartPoint())
        entity['end'] = getXYZ(gp_nurbs.EndPoint())
        tcol_array = TColStd_Array1OfReal(1, knot)
        try:
            gp_nurbs.Knots(tcol_array) 
        except:
            pass       
        entity['knots']=to_np_from_tcolstd_array1_real(tcol_array)  
        tcol_array = TColStd_Array1OfInteger(1, knot)
        try:
            gp_nurbs.Multiplicities(tcol_array)
        except:
            pass
        entity['multiplicities']=to_np_from_tcolstd_array1_integer(tcol_array)
        tcol_knot_seq = TColStd_Array1OfReal(1, pole + degree + 1)
        try:
            gp_nurbs.KnotSequence(tcol_knot_seq)
        except:
            pass
        entity['sequences']=to_np_from_tcolstd_array1_real(tcol_knot_seq)
        tcol_array = TColgp_Array1OfPnt(1, pole)
        try:
            gp_nurbs.Poles(tcol_array)
        except:
            pass        
        entity['poles']=to_np_from_tcolgp_array1_pnt(tcol_array)
        tcol_array = TColStd_Array1OfReal(1, gp_nurbs.NbPoles())
        try:
            gp_nurbs.Weights(tcol_array)
        except:
            pass
        entity['weights']=to_np_from_tcolstd_array1_real(tcol_array)
    elif isinstance(topods_curve, Geom_OffsetCurve):
        entity['kind'] = "Offset"  
        gp_offset = topods_curve 
        entity['offset'] = gp_offset.Offset()
        entity['direction'] = getXYZ(gp_offset.Direction()) 
        entity['curve'] = recognize_basiccurve(gp_offset.BasisCurve())
    elif isinstance(topods_curve, Geom_TrimmedCurve):
        entity['kind'] = "Trimmed"
        gp_trimmed = topods_curve
        entity['u1']=gp_trimmed.FirstParameter()
        entity['u2']=gp_trimmed.LastParameter()
        entity['periodic']=gp_trimmed.IsPeriodic()
        entity['curve'] = recognize_basiccurve(gp_trimmed.BasisCurve())
    else:
        entity['kind'] = "Other"
    return entity

def recognize_by_threejs(curve):
    curve_type = curve.GetType()
    if  curve_type == GeomAbs_Line:
        return True
        
    elif curve_type == GeomAbs_Circle:
        
        return True  
       
    elif curve_type == GeomAbs_Ellipse:
        return True  
      
    elif curve_type == GeomAbs_Hyperbola:
        return True
              
    elif curve_type == GeomAbs_Parabola:
        return True 
       
    elif curve_type == GeomAbs_BezierCurve:
        return True 
                   
    elif curve_type == GeomAbs_BSplineCurve:
        return True  
    elif curve_type == GeomAbs_OtherCurve:
        return False  
    elif curve_type == GeomAbs_OtherCurve:
        return False
    else:
        return False 

def recognize_edge_entity_info(topods_edge):
    """ returns True if the TopoDS_Face is a planar surface
    """
    entity = {}   
    if not isinstance(topods_edge, TopoDS_Edge):       
        entity[gltf_Dict['code']] = "A"
        return entity

    curve = BRepAdaptor_Curve(topods_edge)
    curve_type = curve.GetType()
    try:
        firstU = curve.FirstParameter()
        lastU = curve.LastParameter()
        entity[gltf_Dict['firstU']]=firstU
        entity[gltf_Dict['lastU']]=lastU
        firstP = curve.Value(firstU)
        lastP = curve.Value(lastU)
        entity[gltf_Dict['distance']] = firstP.SquareDistance(lastP)
        
    except:
        entity[gltf_Dict['distance']] = 0

    entity['wire'] = "Cut" if (topods_edge.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Joint"
    
    if  curve_type == GeomAbs_Line:              
        entity[gltf_Dict['code']]="L"  
        entity[gltf_Dict['firstP']]=getPoint(firstP)
        entity[gltf_Dict['lastP']]=getPoint(lastP)
    elif curve_type == GeomAbs_Circle:
        gp_circle = curve.Circle()
        entity[gltf_Dict['radius']] = gp_circle.Radius()
        entity[gltf_Dict['center']] = getXYZ(gp_circle.Position().Location())
        entity[gltf_Dict['xdir']] = getPoint(gp_circle.Position().XDirection())
        entity[gltf_Dict['ydir']] = getPoint(gp_circle.Position().YDirection())
        entity[gltf_Dict['code']]="C"  
    elif curve_type == GeomAbs_Ellipse:        
        gp_ellipse = curve.Ellipse()
        entity[gltf_Dict['major']] = gp_ellipse.MajorRadius()
        entity[gltf_Dict['minor']] = gp_ellipse.MinorRadius()
        entity[gltf_Dict['center']] = getXYZ(gp_ellipse.Position().Location())  
        entity[gltf_Dict['xdir']] = getPoint(gp_ellipse.Position().XDirection())  
        entity[gltf_Dict['ydir']] = getPoint(gp_ellipse.Position().YDirection())   
        entity[gltf_Dict['code']]="E"  
    elif curve_type == GeomAbs_Hyperbola:       
        gp_hyperbola = curve.Hyperbola()
        entity[gltf_Dict['major']] = gp_hyperbola.MajorRadius()
        entity[gltf_Dict['minor']] = gp_hyperbola.MinorRadius()
        entity[gltf_Dict['center']] = getXYZ(gp_hyperbola.Position().Location())
        entity[gltf_Dict['xdir']] = getPoint(gp_hyperbola.Position().XDirection()) 
        entity[gltf_Dict['ydir']] = getPoint(gp_hyperbola.Position().YDirection()) 
        entity[gltf_Dict['code']]="H"                
    elif curve_type == GeomAbs_Parabola:
        gp_parabola = curve.Parabola()
        entity[gltf_Dict['focal']] = gp_parabola.Focal()        
        entity[gltf_Dict['center']] = getXYZ(gp_parabola.Position().Location())
        entity[gltf_Dict['xdir']] = getPoint(gp_parabola.Position().XDirection()) 
        entity[gltf_Dict['ydir']] = getPoint(gp_parabola.Position().YDirection())
        entity[gltf_Dict['code']]="P"                
    elif curve_type == GeomAbs_BezierCurve:
        gp_bezier = curve.Bezier()   
        entity[gltf_Dict['degree']] = gp_bezier.Degree() 
        entity[gltf_Dict['start']] = getXYZ(gp_bezier.StartPoint())
        entity[gltf_Dict['end']] = getXYZ(gp_bezier.EndPoint())
        no_poles = gp_bezier.NbPoles() 
        entity[gltf_Dict['pole']]=no_poles
        poles = []
        weights = []
        for i in range(1,no_poles+1):
            try:
                poles.append(getXYZ(gp_bezier.Pole(i)))
                weights.append(gp_bezier.Weight(i)) 
            except:
                pass
        entity[gltf_Dict['poles']]=poles
        entity[gltf_Dict['weights']]=weights    
        entity[gltf_Dict['code']]="B"         
    elif curve_type == GeomAbs_BSplineCurve:           
        gp_nurbs=curve.BSpline()  
        degree = gp_nurbs.Degree()        
        knot = gp_nurbs.NbKnots()
        pole = gp_nurbs.NbPoles()
        entity[gltf_Dict['degree']]=degree
        entity[gltf_Dict['periodic']]=gp_nurbs.IsPeriodic()
        entity[gltf_Dict['rational']]=gp_nurbs.IsRational()
        entity[gltf_Dict['start']] = gp_nurbs.FirstUKnotIndex()
        entity[gltf_Dict['end']] = gp_nurbs.LastUKnotIndex()
        entity[gltf_Dict['knot']] = knot
        entity[gltf_Dict['pole']] = pole  
        tcol_array = TColStd_Array1OfReal(1, knot)
        try:
            gp_nurbs.Knots(tcol_array) 
        except:
            pass       
        entity[gltf_Dict['knots']]=to_np_from_tcolstd_array1_real(tcol_array)  
        tcol_array = TColStd_Array1OfInteger(1, knot)
        try:
            gp_nurbs.Multiplicities(tcol_array)
        except:
            pass
        entity[gltf_Dict['multiplicities']]=to_np_from_tcolstd_array1_integer(tcol_array)
        tcol_knot_seq = TColStd_Array1OfReal(1, pole + degree + 1)
        try:
            gp_nurbs.KnotSequence(tcol_knot_seq)
        except:
            pass
        entity[gltf_Dict['sequences']]=to_np_from_tcolstd_array1_real(tcol_knot_seq)
        tcol_array = TColgp_Array1OfPnt(1, pole)
        try:
            gp_nurbs.Poles(tcol_array)
        except:
            pass        
        entity[gltf_Dict['poles']]=to_np_from_tcolgp_array1_pnt(tcol_array)
        tcol_array = TColStd_Array1OfReal(1, gp_nurbs.NbPoles())
        try:
            gp_nurbs.Weights(tcol_array)
        except:
            pass
        entity[gltf_Dict['weights']]=to_np_from_tcolstd_array1_real(tcol_array)
        entity[gltf_Dict['code']]="I"  
    elif curve_type == GeomAbs_OffsetCurve:        
        gp_offset = curve.OffsetCurve()
        entity[gltf_Dict['offset']] = gp_offset.Offset()
        entity[gltf_Dict['direction']] = getXYZ(gp_offset.Direction()) 
        entity[gltf_Dict['curve']] = recognize_basiccurve(gp_offset.BasisCurve())
        entity[gltf_Dict['code']]="O"  
    elif curve_type == GeomAbs_OtherCurve:        
        entity[gltf_Dict['curve']] = recognize_basiccurve(curve)
        entity[gltf_Dict['code']]="V"  
    else:       
        entity[gltf_Dict['curve']] = recognize_basiccurve(curve)  
        entity[gltf_Dict['code']]="U"  
    return entity

def recognize_face(topods_face):
    """ returns True if the TopoDS_Face is a planar surface
    """
    entity = {}
    if not isinstance(topods_face, TopoDS_Face):
        entity['kind'] = "Not a face"
        return entity

    entity['fill'] = "Hole" if (topods_face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Solid"
    #entity['dump'] = topods_face.DumpJsonToString()

    surf = BRepAdaptor_Surface(topods_face, True)
    surf_type = surf.GetType()
    if  surf_type == GeomAbs_Plane:
        # look for the properties of the plane
        # first get the related gp_Pln
        gp_pln = surf.Plane()
       
        entity['kind'] = "Plane"       
        entity['normalloc']  = getXYZ(gp_pln.Location())  # a point of the plane
        entity['normaldir'] = getXYZ(gp_pln.Position().Direction())  # the plane normal
        entity['location'] = getXYZ(gp_pln.Position().Location())  # the plane normal
        entity['direction'] = getXYZ(gp_pln.Position().Direction())  # the plane normal
        return entity
    elif surf_type == GeomAbs_Cylinder:
        # look for the properties of the cylinder
        # first get the related gp_Cyl
        gp_cyl = surf.Cylinder()         
       
        entity['kind'] = "Cylinder"
        entity['location'] = getXYZ(gp_cyl.Position().Location()) # a point of the axis
        entity['direction'] = getXYZ(gp_cyl.Position().Direction()) # the cylinder axis
        entity['radius'] = gp_cyl.Radius()
        #entity['coefficients'] = gp_cyl.Coefficients()
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Cone:
        
        gp_cone = surf.Cone()
       
        entity['kind'] = "Cone"
        entity['location'] =  getXYZ(gp_cone.Position().Location())  # a point of the axis       
        entity['direction'] =  getXYZ(gp_cone.Position().Direction())  # a local coordinate point of the axis
        entity['refradius'] = gp_cone.RefRadius()
        entity['semiangle'] = gp_cone.SemiAngle()
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Sphere:
        
        gp_sphere = surf.Sphere()
      
        entity['kind'] = "Sphere"
        entity['location'] = getXYZ(gp_sphere.Position().Location())  # a point of the axis
        entity['direction'] =  getXYZ(gp_sphere.Position().Direction())  # a local coordinate point of the axis
        entity['radius'] = gp_sphere.Radius()
        #axis = gp_sphere.Axis().Direction()  # the sphere axis
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Torus:
        
        gp_torus = surf.Torus()
       
        entity['kind'] = "Torus"
        entity['location'] = getXYZ(gp_torus.Position().Location())  # a point of the axis
        entity['direction'] =  getXYZ(gp_torus.Position().Direction())  # a local coordinate point of the axis
        entity['minorradius'] = gp_torus.MinorRadius()
        entity['majorradius'] = gp_torus.MajorRadius()
        #axis = gp_torus.Axis().Direction()  # the sphere axis
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_BezierSurface:      
        
        entity['kind'] = "Bezier"
        gp_bezier = surf.Bezier()

        entity['udegree'] = gp_bezier.UDegree()         
        no_upoles = gp_bezier.NbUPoles() 
        entity['upole']=no_upoles
        entity['vdegree'] = gp_bezier.VDegree()         
        no_vpoles = gp_bezier.NbVPoles() 
        entity['vpole']=no_vpoles
        poles = []
        weights = []
        for i in range(1,no_upoles+1):
            for j in range(1, no_vpoles+1):
                try:
                    poles.append(getXYZ(gp_bezier.Pole(i,j)))
                    weights.append(gp_bezier.Weight(i,j)) 
                except:
                    pass
        entity['poles']=poles
        entity['weights']=weights  
        
        return entity
    elif surf_type == GeomAbs_BSplineSurface:
        #gp_bspline = surf.BSpline()  
        entity['kind'] = "BSpline"
        nurbs =  surf.BSpline()   
      
        entity['udegree']=nurbs.UDegree()
        entity['uperiodic']=nurbs.IsUPeriodic()
        entity['urational']=nurbs.IsURational()
        tcol_array = TColStd_Array1OfReal(1, nurbs.NbUKnots())
        try:
            nurbs.UKnots(tcol_array)
        except:
            pass

        entity['uknots']=to_np_from_tcolstd_array1_real(tcol_array)       
        tcol_array = TColStd_Array1OfInteger(1, nurbs.NbUKnots())
        try:
            nurbs.UMultiplicities(tcol_array)
        except:
            pass
        entity['umultipilicities']=to_np_from_tcolstd_array1_integer(tcol_array)
        tcol_knot_seq = TColStd_Array1OfReal(1, nurbs.NbUPoles() + nurbs.UDegree() + 1)
        try:
            nurbs.UKnotSequence(tcol_knot_seq)
        except:
            pass
        entity['usequences']=to_np_from_tcolstd_array1_real(tcol_knot_seq)
        
        entity['vdegree']=nurbs.VDegree()
        entity['vperiodic']=nurbs.IsVPeriodic()
        entity['vrational']=nurbs.IsVRational()
        tcol_array = TColStd_Array1OfReal(1, nurbs.NbVKnots())
        try:
            nurbs.VKnots(tcol_array)
        except:
            pass    
        entity['vknots']=to_np_from_tcolstd_array1_real(tcol_array)       
        tcol_array = TColStd_Array1OfInteger(1, nurbs.NbVKnots())
        try:
            nurbs.VMultiplicities(tcol_array)
        except:
            pass
        entity['vmultipilicities']=to_np_from_tcolstd_array1_integer(tcol_array)
        tcol_knot_seq = TColStd_Array1OfReal(1, nurbs.NbVPoles() + nurbs.VDegree() + 1)
        #print("Vseq",nurbs.NbVPoles(),nurbs.VDegree())
        try:
            nurbs.VKnotSequence(tcol_knot_seq)
        except:
            pass
        #print("I have got errors here?")
        entity['vsequences']=to_np_from_tcolstd_array1_real(tcol_knot_seq)

        tcol_array = TColgp_Array2OfPnt(1, nurbs.NbUPoles(), 1, nurbs.NbVPoles())
        try:
            nurbs.Poles(tcol_array)
        except:
            pass
        entity['poles'] = to_np_from_tcolgp_array2_pnt(tcol_array)
        tcol_array = TColStd_Array2OfReal(1, nurbs.NbUPoles(), 1, nurbs.NbVPoles())
        try:
            nurbs.Weights(tcol_array)
        except:
            pass
        entity['weights'] = to_np_from_tcolstd_array2_real(tcol_array)
        return entity
    elif surf_type == GeomAbs_SurfaceOfRevolution:
        entity['kind'] = "Revolution"
        return entity
    elif surf_type == GeomAbs_SurfaceOfExtrusion:
        entity['kind'] = "Extrusion"
        return entity
    elif surf_type == GeomAbs_OffsetSurface:
        entity['kind'] = "Offset"

        return entity
    elif surf_type == GeomAbs_OtherSurface:
        entity['kind'] = "Others"
        return entity
    # nothing found
    entity['kind'] = "Unknown"
    return entity

def recognize_face_entity_info(topods_face):
    """ returns True if the TopoDS_Face is a planar surface
    """
    #entity = "check face" 
    entity = {}
    if not isinstance(topods_face, TopoDS_Face):
        entity["kind"]="Not a Face"
        entity["code"]="A"
        return entity     
    surf = BRepAdaptor_Surface(topods_face, True)
    surf_type = surf.GetType()
    if  surf_type == GeomAbs_Plane:
        entity["kind"]="Plane"
        entity["code"]="L"  
    elif surf_type == GeomAbs_Cylinder:
        entity["kind"]="Cylinder"
        entity["code"]="C"           
    elif surf_type == GeomAbs_Cone:
        entity["kind"]="Cone", 
        entity["code"]="N"            
    elif surf_type == GeomAbs_Sphere:            
        entity["kind"]="Sphere"
        entity["code"]="S"            
    elif surf_type == GeomAbs_Torus:            
        entity["kind"]="Torus", 
        entity["code"]="T" 
    elif surf_type == GeomAbs_BezierSurface:      
        entity["kind"]="Bezier"
        entity["code"]="B"         
    elif surf_type == GeomAbs_BSplineSurface:
        entity["kind"]="BSpline"
        entity["code"]="I"            
    elif surf_type == GeomAbs_SurfaceOfRevolution:
        entity["kind"]="Revolution"
        entity["code"]="R"         
    elif surf_type == GeomAbs_SurfaceOfExtrusion:
        entity["kind"]="Extrusion"
        entity["code"]="E"   
    elif surf_type == GeomAbs_OffsetSurface:
        entity["kind"]="Offset"
        entity["code"]="O"
    elif surf_type == GeomAbs_OtherSurface:
        entity["kind"]="Others"
        entity["code"]="V"
    else:
        entity["kind"]="Unknown"
        entity["code"]="U"
    return entity

def recognize_vertex_entity_info(topods_vertx):
    entity = {}
    if not isinstance(topods_vertx, TopoDS_Vertex):
        entity['kind'] = "Not a Vertex"
        return entity
    brt = BRep_Tool()  
    pnt = brt.Pnt(topods_Vertex(topods_vertx))  
    entity["kind"] = "Point"
    entity["point"] = getPoint(pnt)
    entity["code"] = "P" 
    return entity

def recognize_shape_entity_info(topods_shape):
    """ returns True if the TopoDS_Face is a planar surface
    """
    entity = {}
    if not isinstance(topods_shape, TopoDS_Shape):
        entity['kind'] = "Not a Shape"
        return entity
    transform = topods_shape.Location().Transformation()
    entity["kind"]="Shape"
    entity['transformation'] = []
    for i in range(1,4):
        for j in range(1,5):
             entity['transformation'].append(transform.Value(i,j))
    entity['orientation'] = "Reverse" if (topods_shape.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Forward"
    return entity

def recognize_edge(topods_edge,face_info):
    """ returns True if the TopoDS_Face is a planar surface
    """
    entity = {}   
    if not isinstance(topods_edge, TopoDS_Edge):
        entity['kind'] = "Not an edge"
        return entity

    curve = BRepAdaptor_Curve(topods_edge)
    curve_type = curve.GetType()
     
    entity['wire'] = "Cut" if (topods_edge.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Joint"
    if face_info:
        if 'fill' in face_info:
            entity['fill'] = face_info['fill']
    # nothing found
    #entity['firstU'] = curve.FirstParameter()
    #entity['lastU'] = curve.LastParameter() 
    if  curve_type == GeomAbs_Line:
        entity['kind'] = "Line" 
        gp_Line = curve.Line()
        entity['dirlocation'] = getXYZ(gp_Line.Location()) 
        entity['location'] = getXYZ(gp_Line.Position().Location())  # a point of the axis
        entity['direction'] = getXYZ(gp_Line.Position().Direction())
    elif curve_type == GeomAbs_Circle:
        entity['kind'] = "Circle"   
        gp_circle = curve.Circle()
        entity['radius'] = gp_circle.Radius()
        entity['center'] = getXYZ(gp_circle.Location())
        entity['direction'] = getXYZ(gp_circle.Position().Direction())
    elif curve_type == GeomAbs_Ellipse:
        entity['kind'] = "Ellipse"   
        gp_ellipse = curve.Ellipse()
        entity['majorradius'] = gp_ellipse.MajorRadius()
        entity['minorradius'] = gp_ellipse.MinorRadius()
        entity['center'] = getXYZ(gp_ellipse.Location())  
        entity['direction'] = getXYZ(gp_ellipse.Position().Direction())   
    elif curve_type == GeomAbs_Hyperbola:
        entity['kind'] = "Hyperbola" 
        gp_hyperbola = curve.Hyperbola()
        entity['major'] = gp_hyperbola.MajorRadius()
        entity['minor'] = gp_hyperbola.MinorRadius()
        entity['location'] = getXYZ(gp_hyperbola.Position().Location())  # a point of the axis
        entity['direction'] = getXYZ(gp_hyperbola.Position().Direction())
        entity['center'] = getXYZ(gp_hyperbola.Location())       
    elif curve_type == GeomAbs_Parabola:
        entity['kind'] = "Parabola"   
        gp_parabola = curve.Parabola()
        entity['focal'] = gp_parabola.Focal()        
        entity['location'] = getXYZ(gp_parabola.Position().Location())  # a point of the axis
        entity['direction'] = getXYZ(gp_parabola.Position().Direction())
        entity['center'] = getXYZ(gp_parabola.Location())         
    elif curve_type == GeomAbs_BezierCurve:
        entity['kind'] = "Bezier"   
        gp_bezier = curve.Bezier()   
        entity['degree'] = gp_bezier.Degree() 
        entity['start'] = getXYZ(gp_bezier.StartPoint())
        entity['end'] = getXYZ(gp_bezier.EndPoint())
        no_poles = gp_bezier.NbPoles() 
        entity['pole']=no_poles
        poles = []
        weights = []
        for i in range(1,no_poles+1):
            try:
                poles.append(getXYZ(gp_bezier.Pole(i)))
                weights.append(gp_bezier.Weight(i)) 
            except:
                pass
        entity['poles']=poles
        entity['weights']=weights           
    elif curve_type == GeomAbs_BSplineCurve:
        entity['kind'] = "BSpline"   
        gp_nurbs=curve.BSpline()  
        degree = gp_nurbs.Degree()        
        knot = gp_nurbs.NbKnots()
        pole = gp_nurbs.NbPoles()
        entity['degree']=degree
        entity['periodic']=gp_nurbs.IsPeriodic()
        entity['rational']=gp_nurbs.IsRational()
        entity['start'] = getXYZ(gp_nurbs.StartPoint())
        entity['end'] = getXYZ(gp_nurbs.EndPoint())
        tcol_array = TColStd_Array1OfReal(1, knot)
        try:
            gp_nurbs.Knots(tcol_array) 
        except:
            pass       
        entity['knots']=to_np_from_tcolstd_array1_real(tcol_array)  
        tcol_array = TColStd_Array1OfInteger(1, knot)
        try:
            gp_nurbs.Multiplicities(tcol_array)
        except:
            pass
        entity['multiplicities']=to_np_from_tcolstd_array1_integer(tcol_array)
        tcol_knot_seq = TColStd_Array1OfReal(1, pole + degree + 1)
        try:
            gp_nurbs.KnotSequence(tcol_knot_seq)
        except:
            pass
        entity['sequences']=to_np_from_tcolstd_array1_real(tcol_knot_seq)
        tcol_array = TColgp_Array1OfPnt(1, pole)
        try:
            gp_nurbs.Poles(tcol_array)
        except:
            pass        
        entity['poles']=to_np_from_tcolgp_array1_pnt(tcol_array)
        tcol_array = TColStd_Array1OfReal(1, gp_nurbs.NbPoles())
        try:
            gp_nurbs.Weights(tcol_array)
        except:
            pass
        entity['weights']=to_np_from_tcolstd_array1_real(tcol_array)
    elif curve_type == GeomAbs_OtherCurve:
        entity['kind'] = "Other Curves" 
    else:
        entity['kind'] = "Unknown"   
    return entity

def getFacesEdgesVerticesFromShapes(shape, face_dict={}, edge_dict={}, vertex_dict={}, level=0,\
     parentId=[], returnStructure=[]):
    """
     Print the details of an object from the top down
    """
    #brt = BRep_Tool()
    s = shape.ShapeType()
    if s==TopAbs_EDGE:
        hashedge = hashTransCode(shape.Location().Transformation())
        #myhash = str(hash(shape))+str(shape.Orientation())+hashedge
        myhash = str(hash(shape))+hashedge
        #print(str(hash(shape)),str(shape.Orientation()),hashedge)
    else:
        myhash = str(hash(shape))   
    dict = {"id":myhash,
            "parentId":parentId[-1],
            "type":shapeString(shape),
            "indent": level,
            "leaf": False} 
    if s == TopAbs_VERTEX:
        if not myhash in vertex_dict:            
            entity={}
            entity["Info"] =  recognize_vertex_entity_info(shape)
            vertex_dict[myhash]=(shape,entity)
        dict["leaf"] = True 
            
    elif s == TopAbs_FACE:
        if not myhash in face_dict:            
            entity={}
            entity["Info"] = recognize_face_entity_info(shape)  
            face_dict[myhash]=(shape,entity)       
    elif s == TopAbs_EDGE:        
        if not myhash in edge_dict:           
            entity={}
            entity["Info"] = recognize_edge_entity_info(shape) 
            edge_dict[myhash]=(shape,entity)
    else:
        dict["Info"] = recognize_shape_entity_info(shape)
    returnStructure.append(dict)  
    it = TopoDS_Iterator(shape) 
    #isMoreThere=True   
    parentId.append(myhash)
    while it.More():
        shp = it.Value() 
        it.Next()        
        getFacesEdgesVerticesFromShapes(shp,\
            face_dict=face_dict, edge_dict=edge_dict, vertex_dict=vertex_dict, level=level + 1,\
                 parentId=parentId, returnStructure=returnStructure)
    parentId.pop()    
    return None



def dumpTopologyFacesEdgesVertices(shape, face_dict={}, edge_dict={}, vertex_dict={}):
    """
     Print the details of an object from the top down
    """
    #brt = BRep_Tool()
    s = shape.ShapeType()
    if s==TopAbs_EDGE:
        hashedge = hashTransCode(shape.Location().Transformation())
        #myhash = str(hash(shape))+str(shape.Orientation())+hashedge
        myhash = str(hash(shape))+hashedge
        #print(str(hash(shape)),str(shape.Orientation()),hashedge)
    else:
        myhash = str(hash(shape))    
    if s == TopAbs_VERTEX:
        if not myhash in vertex_dict:
            vertex_dict[myhash]=shape        
    elif s == TopAbs_FACE:
        if not myhash in face_dict:
            face_dict[myhash]=shape         
    elif s == TopAbs_EDGE:        
        if not myhash in edge_dict:
            edge_dict[myhash]=shape     
    it = TopoDS_Iterator(shape) 
    #isMoreThere=True   
    while it.More():
        shp = it.Value() 
        it.Next()
        dumpTopologyFacesEdgesVertices(shp, face_dict=face_dict, edge_dict=edge_dict, vertex_dict=vertex_dict)
        

    return True

def dumpTopology(shape, level=0):
    """
     Print the details of an object from the top down
    """
    brt = BRep_Tool()
    s = shape.ShapeType()
    if s == TopAbs_VERTEX:
        pnt = brt.Pnt(topods_Vertex(shape))
        print(".." * level  + "<Vertex %i: %s %s %s>" % (hash(shape), pnt.X(), pnt.Y(), pnt.Z()))
    else:
        print(".." * level, end="")
        print(shapeTypeString(shape))
    it = TopoDS_Iterator(shape)
    while it.More():
        shp = it.Value()
        it.Next()
        dumpTopology(shp, level + 1)


def shapeTypeString(shape):
    st = shape.ShapeType()
    s = "?"
    if st == TopAbs_VERTEX:
        s = "Vertex"
    if st == TopAbs_SOLID:
        s = "Solid"
    if st == TopAbs_EDGE:
        s = "Edge"
    if st == TopAbs_FACE:
        s = "Face"
    if st == TopAbs_SHELL:
        s = "Shell"
    if st == TopAbs_WIRE:
        s = "Wire"
    if st == TopAbs_COMPOUND:
        s = "Compound."
    if st == TopAbs_COMPSOLID:
        s = "Compsolid."
    return "%s: %i" % (s, hash(shape))

def shapeString(shape):
    st = shape.ShapeType()
    s = "?"
    if st == TopAbs_VERTEX:
        s = "Vertex"
    if st == TopAbs_SOLID:
        s = "Solid"
    if st == TopAbs_EDGE:
        s = "Edge"
    if st == TopAbs_FACE:
        s = "Face"
    if st == TopAbs_SHELL:
        s = "Shell"
    if st == TopAbs_WIRE:
        s = "Wire"
    if st == TopAbs_COMPOUND:
        s = "Compound."
    if st == TopAbs_COMPSOLID:
        s = "Compsolid."
    return s
