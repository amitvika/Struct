from typing import Any, Iterable, Iterator, List, Optional, Tuple
from .OCPShapes import (Vertex, Edge, Face, Wire, Shell, Solid, Compound, Mixin3D)
from OCC.Core.BRep import BRep_Tool, BRep_Builder
from OCC.Core.BRepTools import BRepTools_WireExplorer
from OCC.Core.gp import gp_Ax2, gp_Dir, gp_Pnt
from OCC.Core.HLRBRep import HLRBRep_Algo, HLRBRep_HLRToShape
from OCC.Core.HLRAlgo import HLRAlgo_Projector
from OCC.Core.TopAbs import (TopAbs_VERTEX, TopAbs_EDGE, TopAbs_FACE, TopAbs_WIRE,
                             TopAbs_SHELL, TopAbs_SOLID, TopAbs_COMPOUND,
                             TopAbs_COMPSOLID, TopAbs_ShapeEnum)
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopTools import (TopTools_IndexedDataMapOfShapeListOfShape)
from OCC.Core.TopoDS import (topods, TopoDS_Wire, TopoDS_Vertex, TopoDS_Edge,
                             TopoDS_Face, TopoDS_Shell, TopoDS_Solid, TopoDS_Shape,
                             TopoDS_Compound, TopoDS_CompSolid, topods_Edge,
                             topods_Vertex, TopoDS_Iterator)
from OCC.Core.GCPnts import (GCPnts_UniformAbscissa,
                             GCPnts_QuasiUniformDeflection,
                             GCPnts_UniformDeflection)
 
from OCC.Core.GeomAbs import (GeomAbs_C0, 
                              GeomAbs_Plane, GeomAbs_Cylinder, GeomAbs_Cone,GeomAbs_Sphere, GeomAbs_Torus,
                              GeomAbs_BezierSurface, GeomAbs_BSplineSurface,GeomAbs_SurfaceOfRevolution, 
                              GeomAbs_SurfaceOfExtrusion, GeomAbs_OffsetSurface, GeomAbs_OtherSurface,                               
                              GeomAbs_Line, GeomAbs_Circle, GeomAbs_Ellipse, GeomAbs_Ellipse,GeomAbs_Hyperbola,
                              GeomAbs_Parabola, GeomAbs_BezierCurve, GeomAbs_BSplineCurve, GeomAbs_OtherCurve)

from OCC.Core.BRepAdaptor import BRepAdaptor_Surface, BRepAdaptor_Curve
from .OCPShapes import Shape

class WireExplorer:
    '''
    Wire traversal
    '''
    def __init__(self, wire: TopoDS_Wire) -> None:
        if not isinstance(wire, TopoDS_Wire):
            raise AssertionError('not a TopoDS_Wire')
        self.wire = wire
        self.wire_explorer = BRepTools_WireExplorer(self.wire)
        self.done = False

    def _reinitialize(self) -> None:
        self.wire_explorer = BRepTools_WireExplorer(self.wire)
        self.done = False

    def _loop_topo(self, edges: Optional[bool] = True) -> Iterator[Any]:
        if self.done:
            self._reinitialize()
        topologyType = TopoDS_Edge if edges else TopoDS_Vertex
        seq = []

        while self.wire_explorer.More():
            # loop edges
            if edges:
                current_item = self.wire_explorer.Current()
            # loop vertices
            else:
                current_item = self.wire_explorer.CurrentVertex()
            seq.append(topologyType(current_item))
            self.wire_explorer.Next()

        self.done = True
        return iter(seq)

    def ordered_edges(self) -> Iterator[TopoDS_Edge]:
        return self._loop_topo(edges=True)

    def ordered_vertices(self) -> Iterator[TopoDS_Vertex]:
        return self._loop_topo(edges=False)


class TopologyExplorer:
    '''
    Topology traversal
    '''

    def __init__(self, myShape: TopoDS_Shape, ignore_orientation: Optional[bool]=True) -> None:
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
            TopAbs_VERTEX: Vertex,
            TopAbs_EDGE: Edge,
            TopAbs_FACE: Face,
            TopAbs_WIRE: Wire,
            TopAbs_SHELL: Shell,
            TopAbs_SOLID: Solid,
            TopAbs_COMPOUND: Compound,
            TopAbs_COMPSOLID: Mixin3D
        }
       

    def _loop_topo(self,
                   topologyType: TopAbs_ShapeEnum,
                   topologicalEntity=None,
                   topologyTypeToAvoid=None) -> Iterator[Any]:
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
        
        topExp = TopExp_Explorer()
       
        if topologyType not in topoTypes.keys():
           
            raise AssertionError("%s not one of %s" % (topologyType, topoTypes.keys()))
        # use self.myShape if nothing is specified
        if topologicalEntity is None and topologyTypeToAvoid is None:
            topExp.Init(self.myShape, topologyType)
        elif topologicalEntity is None and topologyTypeToAvoid is not None:
            topExp.Init(self.myShape, topologyType, topologyTypeToAvoid)
        elif topologyTypeToAvoid is None:
            topExp.Init(topologicalEntity, topologyType)
        elif topologyTypeToAvoid:
            topExp.Init(topologicalEntity,
                        topologyType,
                        topologyTypeToAvoid)
        seq = []
        while topExp.More():
            current_item = topExp.Current()

            #topo_to_add = self.topoFactory[topologyType](current_item)            
            #seq.append(topo_to_add)
            
            seq.append(current_item)
            topExp.Next()

        if self.ignore_orientation:
            # filter out those entities that share the same TShape
            # but do *not* share the same orientation
            #filter_orientation_seq = []
            filter_orientation_seq: List = []
            for i in seq:
                _present = False
                for j in filter_orientation_seq:
                    if i.IsSame(j):
                        _present = True
                        break
                if _present is False:
                    filter_orientation_seq.append(i)
            return iter(filter_orientation_seq)
        else:
            return iter(seq)

    def faces(self) -> Iterator[TopoDS_Face]:
        '''
        loops over all faces
        '''
        return self._loop_topo(TopAbs_FACE)

    def _number_of_topo(self, iterable: Iterable) -> int:
        n = 0
        for _ in iterable:
            n += 1
        return n

    def number_of_faces(self) -> int:
        return self._number_of_topo(self.faces())

    def vertices(self) -> Iterator[TopoDS_Vertex]:
        '''
        loops over all vertices
        '''
        return self._loop_topo(TopAbs_VERTEX)

    def number_of_vertices(self) -> int:
        return self._number_of_topo(self.vertices())

    def edges(self) -> Iterator[TopoDS_Edge]:
        '''
        loops over all edges
        '''
        return self._loop_topo(TopAbs_EDGE)

    def number_of_edges(self) -> int:
        return self._number_of_topo(self.edges())

    def wires(self) -> Iterator[TopoDS_Wire]:
        '''
        loops over all wires
        '''
        return self._loop_topo(TopAbs_WIRE)

    def number_of_wires(self) -> int:
        return self._number_of_topo(self.wires())

    def shells(self) -> Iterator[TopoDS_Shell]:
        '''
        loops over all shells
        '''
        return self._loop_topo(TopAbs_SHELL, None)

    def number_of_shells(self) -> int:
        return self._number_of_topo(self.shells())

    def solids(self) -> Iterator[TopoDS_Solid]:
        '''
        loops over all solids
        '''
        return self._loop_topo(TopAbs_SOLID, None)

    def number_of_solids(self) -> int:
        return self._number_of_topo(self.solids())

    def comp_solids(self) -> Iterator[TopoDS_CompSolid]:
        '''
        loops over all compound solids
        '''
        return self._loop_topo(TopAbs_COMPSOLID)

    def number_of_comp_solids(self) -> int:
        return self._number_of_topo(self.comp_solids())

    def compounds(self) -> Iterator[TopoDS_Compound]:
        '''
        loops over all compounds
        '''
        return self._loop_topo(TopAbs_COMPOUND)

    def number_of_compounds(self) -> int:
        return self._number_of_topo(self.compounds())

    def ordered_vertices_from_wire(self, wire: TopoDS_Wire) -> Iterator[TopoDS_Vertex]:
        '''
        @param wire: TopoDS_Wire
        '''
        we = WireExplorer(wire)
        return we.ordered_vertices()

    def number_of_ordered_vertices_from_wire(self, wire: TopoDS_Wire) -> int:
        return self._number_of_topo(self.ordered_vertices_from_wire(wire))

    def ordered_edges_from_wire(self, wire: TopoDS_Wire) -> Iterator[TopoDS_Edge]:
        '''
        @param wire: TopoDS_Wire
        '''
        we = WireExplorer(wire)
        return we.ordered_edges()

    def number_of_ordered_edges_from_wire(self, wire: TopoDS_Wire) -> int:
        return self._number_of_topo(self.ordered_edges_from_wire(wire))
    

    """  # ======================================================================
    # EDGE <-> FACE
    # ======================================================================
    def faces_from_edge(self, edge: TopoDS_Edge):
        

        :param edge:
        :return:
        
        return self._map_shapes_and_ancestors(TopAbs_EDGE, TopAbs_FACE, edge)

    def number_of_faces_from_edge(self, edge: TopoDS_Edge) -> int:
        

        :param edge:
        :return:
        
        return self._number_shapes_ancestors(TopAbs_EDGE, TopAbs_FACE, edge) """

    def edges_from_face(self, face: TopoDS_Face) -> Iterator[TopoDS_Edge]:
        """

        :param face:
        :return:
        """
        return self._loop_topo(TopAbs_EDGE, face)

    def number_of_edges_from_face(self, face: TopoDS_Face) -> int:
        cnt = 0
        for _ in self._loop_topo(TopAbs_EDGE, face):
            cnt += 1
        return cnt

    # ======================================================================
    # VERTEX <-> EDGE
    # ======================================================================
    def vertices_from_edge(self, edge: TopoDS_Edge) -> Iterator[TopoDS_Vertex]:
        return self._loop_topo(TopAbs_VERTEX, edge)

    def number_of_vertices_from_edge(self, edge: TopoDS_Edge) -> int:
        cnt = 0
        for _ in self._loop_topo(TopAbs_VERTEX, edge):
            cnt += 1
        return cnt

    def edges_from_vertex(self, vertex):
        return self._map_shapes_and_ancestors(TopAbs_VERTEX, TopAbs_EDGE, vertex)

    def number_of_edges_from_vertex(self, vertex: TopoDS_Vertex) -> int:
        return self._number_shapes_ancestors(TopAbs_VERTEX, TopAbs_EDGE, vertex)

    # ======================================================================
    # WIRE <-> EDGE
    # ======================================================================
    def edges_from_wire(self, wire: TopoDS_Wire) -> Iterator[TopoDS_Edge]:
        return self._loop_topo(TopAbs_EDGE, wire)

    def number_of_edges_from_wire(self, wire: TopoDS_Wire) -> int:
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
    def wires_from_face(self, face: TopoDS_Face) -> Iterator[TopoDS_Wire]:
        return self._loop_topo(TopAbs_WIRE, face)

    def number_of_wires_from_face(self, face: TopoDS_Face) -> int:
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

    def vertices_from_face(self, face: TopoDS_Face) -> Iterator[TopoDS_Vertex]:
        return self._loop_topo(TopAbs_VERTEX, face)

    def number_of_vertices_from_face(self, face: TopoDS_Face) -> int:
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

    def faces_from_solids(self, solid: TopoDS_Solid) -> Iterator[TopoDS_Face]:
        return self._loop_topo(TopAbs_FACE, solid)

    def number_of_faces_from_solids(self, solid: TopoDS_Solid) -> int:
        cnt = 0
        for _ in self._loop_topo(TopAbs_FACE, solid):
            cnt += 1
        return cnt

def dumpTopologyStructures(shape, level=0, parentId=[], returnStructure=[]):
    """
     Print the details of an object from the top down
    """
    brt = BRep_Tool()
    s = shape.ShapeType()
    myhash = hash(shape)
    dict = {"id":myhash,
            "parentId":parentId[-1],
            "type":shapeString(shape),
            "indent": level,
            "leaf": False}
    if s == TopAbs_VERTEX:
        pnt = brt.Pnt(TopoDS_Vertex(shape))        
        dict["Info"] =  {"x":pnt.X(),"y": pnt.Y(),"z": pnt.Z()}
        dict["leaf"] = True
    elif s == TopAbs_FACE:
        dict["Info"] = recognize_face(shape)        
    elif s == TopAbs_EDGE:        
        dict["Info"] = recognize_edge(shape)
    returnStructure.append(dict)
    #it = TopoDS_Iterator(Shape(shape))
    #parentId.append(myhash)
    #while it.More() and level < 10:
    #    shp = it.Value()
    #    it.Next()
    #    dumpTopologyStructures(shp, level + 1,parentId=parentId, returnStructure=returnStructure)
    #parentId.pop()
    return len(returnStructure)

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

def getXYZ(co_ord):
    return co_ord
    #return (co_ord.X(), co_ord.Y(), co_ord.Z())

##################################
# Recognize functions
##################################
def recognize_face(topods_face):
    """ returns True if the TopoDS_Face is a planar surface
    """
    if not isinstance(topods_face, TopoDS_Face):
        return "Not a face", None, None
    surf = BRepAdaptor_Surface(topods_face, True)
    surf_type = surf.GetType()
    if  surf_type == GeomAbs_Plane:
        # look for the properties of the plane
        # first get the related gp_Pln
        gp_pln = surf.Plane()
        entity = {}
        entity['kind'] = "Plane"       
        entity['location']  = getXYZ(gp_pln.Location().Coord())  # a point of the plane
        entity['normal'] = getXYZ(gp_pln.Axis().Direction().Coord())  # the plane normal
        return entity
    elif surf_type == GeomAbs_Cylinder:
        # look for the properties of the cylinder
        # first get the related gp_Cyl
        gp_cyl = surf.Cylinder()         
        entity = {}
        entity['kind'] = "Cylinder"
        entity['location'] = getXYZ(gp_cyl.Axis().Location().Coord()) # a point of the axis
        entity['direction'] = getXYZ(gp_cyl.Axis().Direction().Coord()) # the cylinder axis
        entity['radius'] = gp_cyl.Radius()
        entity['coefficients'] = gp_cyl.Coefficients()
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Cone:
        
        gp_cone = surf.Cone()
        entity = {}
        entity['kind'] = "Cone"
        entity['location'] =  getXYZ(gp_cone.Location().Coord())  # a point of the axis
        entity['direction'] =  getXYZ(gp_cone.Axis().Direction().Coord())  # the cone axis
        entity['position'] =  getXYZ(gp_cone.Position().Direction().Coord())  # a local coordinate point of the axis
        entity['refradius'] = gp_cone.RefRadius()
        entity['semiangle'] = gp_cone.SemiAngle()
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Sphere:
        
        gp_sphere = surf.Sphere()
        entity = {}
        entity['kind'] = "Sphere"
        entity['location'] = getXYZ(gp_sphere.Location().Coord())  # a point of the axis
        entity['position'] =  getXYZ(gp_sphere.Position().Direction().Coord())  # a local coordinate point of the axis
        entity['radius'] = gp_sphere.Radius()
        #axis = gp_sphere.Axis().Direction()  # the sphere axis
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Torus:
        
        gp_torus = surf.Torus()
        entity = {}
        entity['kind'] = "Torus"
        entity['location'] = getXYZ(gp_torus.Location().Coord())  # a point of the axis
        entity['direction'] =  getXYZ(gp_torus.Axis().Direction().Coord())  # a local coordinate point of the axis
        entity['minorradius'] = gp_torus.MinorRadius()
        entity['majorradius'] = gp_torus.MajorRadius()
        #axis = gp_torus.Axis().Direction()  # the sphere axis
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_BezierSurface:
        kind = "Bezier"
        #gp_bezier = surf.Bezier()
        #location = gp_bezier.Location()  # a point of the axis
        #axis = gp_bezier.Axis().Direction()  # the bezier axis
        # then export location and normal to the console output
        return kind
    elif surf_type == GeomAbs_BSplineSurface:
        kind = "BSpline"
        #gp_bspline = surf.BSpline()
        #location = gp_bspline.Location()  # a point of the axis
        #axis = gp_bezier.Axis().Direction()  # the BSpline axis
        # then export location and normal to the console output
        return kind
    elif surf_type == GeomAbs_SurfaceOfRevolution:
        kind = "Revolution"
        return kind
    elif surf_type == GeomAbs_SurfaceOfExtrusion:
        kind = "Extrusion"
        return kind
    elif surf_type == GeomAbs_OffsetSurface:
        kind = "Offset"
        return kind
    elif surf_type == GeomAbs_OtherSurface:
        kind = "Others"
        return kind
    # nothing found
    return "Unknown"

##################################
# Recognize functions
##################################
def recognize_edge(topods_edge):
    """ returns True if the TopoDS_Face is a planar surface
    """
    if not isinstance(topods_edge, TopoDS_Edge):
        return "Not a face", None, None
    curve = BRepAdaptor_Curve(topods_edge)
    curve_type = curve.GetType()
    # nothing found
    kind = "Unknown"
    if  curve_type == GeomAbs_Line:
        kind = "Line"              
    elif curve_type == GeomAbs_Circle:
        kind = "Circle"       
    elif curve_type == GeomAbs_Ellipse:
        kind = "Ellipse"        
    elif curve_type == GeomAbs_Hyperbola:
        kind = "Hyperbola"        
    elif curve_type == GeomAbs_Parabola:
        kind = "Parabola"        
    elif curve_type == GeomAbs_BezierCurve:
        kind = "Bezier"        
    elif curve_type == GeomAbs_BSplineCurve:
        kind = "BSpline"       
    elif curve_type == GeomAbs_OtherCurve:
        kind = "Other Curves"    
    return kind
def dump_topology_to_string(shape: TopoDS_Shape,
                            level: Optional[int]=0,
                            buffer: Optional[str]="") -> None:
    """
    Return the details of an object from the top down
    """
    brt = BRep_Tool()
    s = shape.ShapeType()
    if s == TopAbs_VERTEX:
        pnt = brt.Pnt(TopoDS_Vertex(shape))
        print(".." * level  + "<Vertex %i: %s %s %s>\n" % (hash(shape), pnt.X(), pnt.Y(), pnt.Z()))
    else:
        print(".." * level, end="")
        print(shape)
    it = TopoDS_Iterator(shape)
    while it.More() and level < 5:  # LEVEL MAX
        shp = it.Value()
        it.Next()
        dump_topology_to_string(shp, level + 1, buffer)

#
# Edge and wire discretizers
#

def discretize_wire(a_topods_wire: TopoDS_Wire, deflection: Optional[int]=0.5) -> List[gp_Pnt]:
    """ Returns a set of points
    """
    if not is_wire(a_topods_wire):
        raise AssertionError("You must provide a TopoDS_Wire to the discretize_wire function.")
    wire_explorer = WireExplorer(a_topods_wire)
    wire_pnts = []
    # loop over ordered edges
    for edg in wire_explorer.ordered_edges():
        edg_pnts = discretize_edge(edg, deflection)
        wire_pnts += edg_pnts
    return wire_pnts


def discretize_edge(a_topods_edge: TopoDS_Edge, deflection=0.2, algorithm="QuasiUniformDeflection"):
    """ Take a TopoDS_Edge and returns a list of points
    The more deflection is small, the more the discretization is precise,
    i.e. the more points you get in the returned points
    algorithm: to choose in ["UniformAbscissa", "QuasiUniformDeflection"]
    """
    if not is_edge(a_topods_edge):
        raise AssertionError("You must provide a TopoDS_Edge to the discretize_edge function.")
    if not a_topods_edge:
        print("Warning : TopoDS_Edge is null. discretize_edge will return an empty list of points.")
        return []
    curve_adaptator = BRepAdaptor_Curve(a_topods_edge)
    first = curve_adaptator.FirstParameter()
    last = curve_adaptator.LastParameter()

    if algorithm == "QuasiUniformDeflection":
        discretizer = GCPnts_QuasiUniformDeflection()
    elif algorithm == "UniformAbscissa":
        discretizer = GCPnts_UniformAbscissa()
    elif algorithm == "UniformDeflection":
        discretizer = GCPnts_UniformDeflection()
    else:
        raise AssertionError("Unknown algorithm")
    discretizer.Initialize(curve_adaptator, deflection, first, last)

    if not discretizer.IsDone():
        raise AssertionError("Discretizer not done.")
    if not discretizer.NbPoints() > 0:
        raise AssertionError("Discretizer nb points not > 0.")

    points = []
    for i in range(1, discretizer.NbPoints() + 1):
        p = curve_adaptator.Value(discretizer.Parameter(i))
        points.append(p.Coord())
    return points

#
# TopoDS_Shape type utils
#
def is_vertex(topods_shape: TopoDS_Shape) -> bool:
    if not hasattr(topods_shape, "ShapeType"):
        return False
    return topods_shape.ShapeType() == TopAbs_VERTEX


def is_solid(topods_shape: TopoDS_Shape) -> bool:
    if not hasattr(topods_shape, "ShapeType"):
        return False
    return topods_shape.ShapeType() == TopAbs_SOLID


def is_edge(topods_shape: TopoDS_Shape) -> bool:
    if not hasattr(topods_shape, "ShapeType"):
        return False
    return topods_shape.ShapeType() == TopAbs_EDGE


def is_face(topods_shape: TopoDS_Shape) -> bool:
    if not hasattr(topods_shape, "ShapeType"):
        return False
    return topods_shape.ShapeType() == TopAbs_FACE


def is_shell(topods_shape: TopoDS_Shape) -> bool:
    if not hasattr(topods_shape, "ShapeType"):
        return False
    return topods_shape.ShapeType() == TopAbs_SHELL


def is_wire(topods_shape: TopoDS_Shape) -> bool:
    if not hasattr(topods_shape, "ShapeType"):
        return False
    return topods_shape.ShapeType() == TopAbs_WIRE


def is_compound(topods_shape: TopoDS_Shape) -> bool:
    if not hasattr(topods_shape, "ShapeType"):
        return False
    return topods_shape.ShapeType() == TopAbs_COMPOUND


def is_compsolid(topods_shape: TopoDS_Shape) -> bool:
    if not hasattr(topods_shape, "ShapeType"):
        return False
    return topods_shape.ShapeType() == TopAbs_COMPSOLID


def get_type_as_string(topods_shape: TopoDS_Shape) -> str:
    """ just get the type string, remove TopAbs_ and lowercas all ending letters
    """
    types = {TopAbs_VERTEX: "Vertex", TopAbs_COMPSOLID: "CompSolid", TopAbs_FACE: "Face",
             TopAbs_WIRE: "Wire", TopAbs_EDGE: "Edge", TopAbs_COMPOUND: "Compound",
             TopAbs_COMPSOLID: "CompSolid", TopAbs_SOLID: "Solid"}
    return types[topods_shape.ShapeType()]


def get_sorted_hlr_edges(topods_shape: TopoDS_Shape,
                         position: Optional[gp_Pnt] =gp_Pnt(),
                         direction: Optional[gp_Dir] = gp_Dir(),
                         export_hidden_edges: Optional[bool] =True) -> Tuple[List, List]:
    """ Return hidden and visible edges as two lists of edges
    """
    hlr = HLRBRep_Algo()
    hlr.Add(topods_shape)

    projector = HLRAlgo_Projector(gp_Ax2(position, direction))

    hlr.Projector(projector)
    hlr.Update()
    hlr.Hide()

    hlr_shapes = HLRBRep_HLRToShape(hlr)

    # visible edges
    visible = []
    visible_sharp_edges_as_compound = hlr_shapes.VCompound()
    if visible_sharp_edges_as_compound:
        visible += list(TopologyExplorer(visible_sharp_edges_as_compound).edges())
    visible_smooth_edges_as_compound = hlr_shapes.Rg1LineVCompound()
    if visible_smooth_edges_as_compound:
        visible += list(TopologyExplorer(visible_smooth_edges_as_compound).edges())
    #visible_sewn_edges_as_compound = hlr_shapes.RgNLineVCompound()
    #if visible_sewn_edges_as_compound:
    #    visible += list(TopologyExplorer(visible_sewn_edges_as_compound).edges())
    visible_contour_edges_as_compound = hlr_shapes.OutLineVCompound()
    if visible_contour_edges_as_compound:
        visible += list(TopologyExplorer(visible_contour_edges_as_compound).edges())
    #visible_isoparameter_edges_as_compound = hlr_shapes.IsoLineVCompound()
    #if visible_isoparameter_edges_as_compound:
    #    visible += list(TopologyExplorer(visible_isoparameter_edges_as_compound).edges())
    # hidden edges
    hidden = []
    if export_hidden_edges:
        hidden_sharp_edges_as_compound = hlr_shapes.HCompound()
        if hidden_sharp_edges_as_compound:
            hidden += list(TopologyExplorer(hidden_sharp_edges_as_compound).edges())
        hidden_contour_edges_as_compound = hlr_shapes.OutLineHCompound()
        if hidden_contour_edges_as_compound:
            hidden += list(TopologyExplorer(hidden_contour_edges_as_compound).edges())

    return visible, hidden


def list_of_shapes_to_compound(list_of_shapes: List[TopoDS_Shape]) -> Tuple[TopoDS_Compound, bool]:
    """ takes a list of shape in input, gather all shapes into one compound
    returns the compund and a boolean, True if all shapes were added to the compund,
    False otherwise
    """
    all_shapes_converted = True
    the_compound = TopoDS_Compound()
    the_builder = BRep_Builder()
    the_builder.MakeCompound(the_compound)
    for shp in list_of_shapes:
        # first ensure the shape is not Null
        if shp:
            the_builder.Add(the_compound, shp)
        else:
            all_shapes_converted = False
            continue
            
    return the_compound, all_shapes_converted
