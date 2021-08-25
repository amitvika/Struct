from math import radians, ceil, floor
from numpy import zeros
import sys

from OCC.Core.BRepBndLib import brepbndlib_Add, brepbndlib_AddOptimal, brepbndlib_AddOBB
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox, BRepPrimAPI_MakePrism
from OCC.Core.BRepBuilderAPI import (BRepBuilderAPI_MakeEdge,
                                     BRepBuilderAPI_MakeVertex,
                                     BRepBuilderAPI_MakeWire,
                                     BRepBuilderAPI_MakeFace, BRepBuilderAPI_MakeEdge2d,
                                     BRepBuilderAPI_Transform, BRepBuilderAPI_GTransform)
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Section, BRepAlgoAPI_Common, BRepAlgoAPI_Fuse

from OCC.Core.BRepExtrema import BRepExtrema_DistShapeShape
from OCC.Core.BRepFill import BRepFill_Filling
from OCC.Core.Bnd import Bnd_Box, Bnd_OBB
from OCC.Core.GeomAbs import (GeomAbs_C0, 
                              GeomAbs_Plane, GeomAbs_Cylinder, GeomAbs_Cone,GeomAbs_Sphere, GeomAbs_Torus,
                              GeomAbs_BezierSurface, GeomAbs_BSplineSurface,GeomAbs_SurfaceOfRevolution, 
                              GeomAbs_SurfaceOfExtrusion, GeomAbs_OffsetSurface, GeomAbs_OtherSurface,                               
                              GeomAbs_Line, GeomAbs_Circle, GeomAbs_Ellipse, GeomAbs_Ellipse,GeomAbs_Hyperbola,
                              GeomAbs_Parabola, GeomAbs_BezierCurve, GeomAbs_BSplineCurve, GeomAbs_OtherCurve)
from OCC.Core.BRepAdaptor import BRepAdaptor_Surface, BRepAdaptor_Curve
from OCC.Core.GeomAPI import GeomAPI_PointsToBSpline
from OCC.Core.GProp import GProp_GProps
from OCC.Core.BRepGProp import (brepgprop_LinearProperties,
                                brepgprop_SurfaceProperties,
                                brepgprop_VolumeProperties)
from OCC.Core.TColgp import TColgp_Array1OfPnt
from OCC.Core.TopoDS import (TopoDS_Face, TopoDS_Edge, TopoDS_Shape)

from OCC.Core.TopAbs import (TopAbs_FACE, TopAbs_Orientation)
from OCC.Core.gp import (gp_Vec, gp_Pnt, gp_Trsf, gp_OX, gp_OY,
                         gp_OZ, gp_XYZ, gp_Ax2, gp_Dir, gp_GTrsf, gp_Mat)

from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.TColStd import (TColStd_Array1OfInteger, TColStd_Array1OfReal, TColStd_Array2OfReal)
from OCC.Core.TColgp import TColgp_Array1OfPnt, TColgp_Array2OfPnt

from .TopologyUtils import is_edge, is_face, TopologyExplorer
import pickle

#
# assert utils
#
def assert_shape_not_null(shp):
    if shp is None:
        raise AssertionError("Shape is Null.")


def assert_isdone(inst, message):
    if not inst.IsDone():
        raise AssertionError(message)


def point_list_to_TColgp_Array1OfPnt(li):
    pts = TColgp_Array1OfPnt(0, len(li) - 1)
    for n, i in enumerate(li):
        pts.SetValue(n, i)
    return pts

#
# 0D
def make_vertex(*args):
    vert = BRepBuilderAPI_MakeVertex(*args)
    assert_isdone(vert, 'failed to produce edge')
    result = vert.Vertex()
    return result

#
# 1D
#
def make_edge(*args):
    edge = BRepBuilderAPI_MakeEdge(*args)
    assert_isdone(edge, 'failed to produce edge')
    result = edge.Edge()
    return result


def make_edge2d(*args):
    edge = BRepBuilderAPI_MakeEdge2d(*args)
    assert_isdone(edge, 'failed to produce edge')
    result = edge.Edge()
    return result


def make_wire(*args):
    # if we get an iterable, than add all edges to wire builder
    if isinstance(args[0], (list, tuple)):
        wire = BRepBuilderAPI_MakeWire()
        for i in args[0]:
            wire.Add(i)
        wire.Build()
        return wire.Wire()
    wire = BRepBuilderAPI_MakeWire(*args)
    assert_isdone(wire, 'failed to produce wire')
    return wire.Wire()


def points_to_bspline(pnts):
    pts = TColgp_Array1OfPnt(0, len(pnts) - 1)
    for n, i in enumerate(pnts):
        pts.SetValue(n, i)
    crv = GeomAPI_PointsToBSpline(pts)
    return crv.Curve()


def edge_to_bezier(topods_edge):
    """ take an edge and returns:
    * a bool is_bezier
    * the bezier curve
    * degrees
    * poles
    """
    ad = BRepAdaptor_Curve(topods_edge)
    if ad.IsRational():
        return True, ad.Bezier(), ad.Degree()
    else:
        return False, None, None
#
# 2D
#
def make_n_sided(edges, continuity=GeomAbs_C0):
    n_sided = BRepFill_Filling()
    for edg in edges:
        n_sided.Add(edg, continuity)
    n_sided.Build()
    assert_isdone(n_sided, 'failed to produce n_sided')
    face = n_sided.Face()
    return face


def make_face(*args):
    face = BRepBuilderAPI_MakeFace(*args)
    assert_isdone(face, 'failed to produce face')
    result = face.Face()
    return result


def get_aligned_boundingbox(shape, tol=1e-6, optimal_BB=True):
    """ return the bounding box of the TopoDS_Shape `shape`

    Parameters
    ----------

    shape : TopoDS_Shape or a subclass such as TopoDS_Face
        the shape to compute the bounding box from

    tol: float
        tolerance of the computed boundingbox

    use_triangulation : bool, True by default
        This makes the computation more accurate

    Returns
    -------
        if `as_pnt` is True, return a tuple of gp_Pnt instances
         for the lower and another for the upper X,Y,Z values representing the bounding box

        if `as_pnt` is False, return a tuple of lower and then upper X,Y,Z values
         representing the bounding box
    """
    bbox = Bnd_Box()
    bbox.SetGap(tol)

    # note: useTriangulation is True by default, we set it explicitely, but t's not necessary
    if optimal_BB:
        use_triangulation = True
        use_shapetolerance = True
        brepbndlib_AddOptimal(shape, bbox, use_triangulation, use_shapetolerance)
    else:
        brepbndlib_Add(shape, bbox)
    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
    corner1 = gp_Pnt(xmin, ymin, zmin)
    corner2 = gp_Pnt(xmax, ymax, zmax)
    center = midpoint(corner1, corner2)
    dx = xmax - xmin
    dy = ymax - ymin
    dz = zmax - zmin
    box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
    return center, [dx, dy, dz], box_shp

def swap(first,second):
    temp=first
    first = second
    second = temp
    return first, second

def get_bounding_details(shape, tol=1e-6, optimal_BB=True):
    """ return the bounding box of the TopoDS_Shape `shape`

    Parameters
    ----------

    shape : TopoDS_Shape or a subclass such as TopoDS_Face
        the shape to compute the bounding box from

    tol: float
        tolerance of the computed boundingbox

    use_triangulation : bool, True by default
        This makes the computation more accurate

    Returns
    -------
        if `as_pnt` is True, return a tuple of gp_Pnt instances
         for the lower and another for the upper X,Y,Z values representing the bounding box

        if `as_pnt` is False, return a tuple of lower and then upper X,Y,Z values
         representing the bounding box
    """
    bbox = Bnd_Box()
    bbox.SetGap(tol)
    try:
        if optimal_BB:
            use_triangulation = True
            use_shapetolerance = True
            
            brepbndlib_AddOptimal(shape, bbox, use_triangulation, use_shapetolerance)
        else:
            brepbndlib_Add(shape, bbox)
    except Exception as e:
        print("Unable to find bounding box,",e)        
    # note: useTriangulation is True by default, we set it explicitely, but t's not necessary
    
    xmin, ymin, zmin, xmax, ymax, zmax = 0, 0, 0, 0, 0, 0
    try:
        xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
    except Exception as e:
        pass
        #print("Empty box,",e)  
    #round off to 3 digits..
    max_all = max(abs(xmin), abs(ymin), abs(zmin), abs(xmax), abs(ymax), abs(zmax))
    multiplier = 1
    if(sys.maxsize/1000 > max_all) :
        multiplier = 1000
    else:
        if(sys.maxsize/100 > max_all) :
            multiplier = 100
        else:
            if(sys.maxsize/10 > max_all) :
                multiplier = 10
            else:
                multiplier = 1    
    xmin = ceil(xmin*multiplier)/multiplier
    ymin = ceil(ymin*multiplier)/multiplier
    zmin = ceil(zmin*multiplier)/multiplier
    xmax = floor(xmax*multiplier)/multiplier
    ymax = floor(ymax*multiplier)/multiplier
    zmax = floor(zmax*multiplier)/multiplier
    if xmin > xmax:
        xmin, xmax = swap(xmin,xmax)
    if ymin > ymax:
        ymin, ymax = swap(ymin,ymax)
    if zmin > zmax:
        zmin, zmax = swap(zmin,zmax) 
    return  (xmin, ymin, zmin, xmax, ymax, zmax)

def get_bounding_details_common(shape, tol=1e-6, optimal_BB=True):
    """ return the bounding box of the TopoDS_Shape `shape`

    Parameters
    ----------

    shape : TopoDS_Shape or a subclass such as TopoDS_Face
        the shape to compute the bounding box from

    tol: float
        tolerance of the computed boundingbox

    use_triangulation : bool, True by default
        This makes the computation more accurate

    Returns
    -------
        if `as_pnt` is True, return a tuple of gp_Pnt instances
         for the lower and another for the upper X,Y,Z values representing the bounding box

        if `as_pnt` is False, return a tuple of lower and then upper X,Y,Z values
         representing the bounding box
    """
    bbox = Bnd_Box()
    bbox.SetGap(tol)
    try:
        if optimal_BB:
            use_triangulation = True
            use_shapetolerance = True
            topologyExplorer = TopologyExplorer(shape,ignore_orientation=False)
            faceiterator = list(topologyExplorer.faces())
            for aface in faceiterator:
                brepbndlib_AddOptimal(aface, bbox, use_triangulation, use_shapetolerance)
        else:
            brepbndlib_Add(shape, bbox)
    except Exception as e:
        print("Unable to find bounding box,",e)        
    # note: useTriangulation is True by default, we set it explicitely, but t's not necessary
    
    xmin, ymin, zmin, xmax, ymax, zmax = 0, 0, 0, 0, 0, 0
    try:
        xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
    except Exception as e:
        pass
        #print("Empty box,",e)  
    #round off to 3 digits..
    max_all = max(abs(xmin), abs(ymin), abs(zmin), abs(xmax), abs(ymax), abs(zmax))
    multiplier = 1
    if(sys.maxsize/1000 > max_all) :
        multiplier = 1000
    else:
        if(sys.maxsize/100 > max_all) :
            multiplier = 100
        else:
            if(sys.maxsize/10 > max_all) :
                multiplier = 10
            else:
                multiplier = 1    
    xmin = ceil(xmin*multiplier)/multiplier
    ymin = ceil(ymin*multiplier)/multiplier
    zmin = ceil(zmin*multiplier)/multiplier
    xmax = floor(xmax*multiplier)/multiplier
    ymax = floor(ymax*multiplier)/multiplier
    zmax = floor(zmax*multiplier)/multiplier
    if xmin > xmax:
        xmin, xmax = swap(xmin,xmax)
    if ymin > ymax:
        ymin, ymax = swap(ymin,ymax)
    if zmin > zmax:
        zmin, zmax = swap(zmin,zmax) 
    return  (xmin, ymin, zmin, xmax, ymax, zmax)

def roundOffMe(dimension):
    x1, x2, x3, x4, x5, x6 = dimension
    y1, y2, y3, y4, y5, y6 = round(roundoff(x1),2), round(roundoff(x2),2), round(roundoff(x3),2), round(roundoff(x4),2), round(roundoff(x5),2), round(roundoff(x6),2)
    #print(y1,y2,y3,y4,y5,y6)
    return  y1, y2, y3, y4, y5, y6

def roundOffMaxMin(Max,Min):
    x1, x2, x3 = Max
    x4, x5, x6 = Min
    y1, y2, y3, y4, y5, y6 = round(roundoff(x1),2), round(roundoff(x2),2), round(roundoff(x3),2), round(roundoff(x4),2), round(roundoff(x5),2), round(roundoff(x6),2)
    #print(y1,y2,y3," Split ",y4,y5,y6)
    return (y1, y2, y3), (y4, y5, y6)
   
  

def returnStackableFaces(part,corner1, corner2, dimension):
    box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
    xmin, ymin, zmin, xmax, ymax, zmax = dimension
    partcorner1 = gp_Pnt(xmin, ymin, zmin)
    partcorner2 = gp_Pnt(xmax, ymax, zmax)
    box_part = BRepPrimAPI_MakeBox(partcorner1, partcorner2).Shape()
    section_shp = BRepAlgoAPI_Common(part, box_shp)
    
    if section_shp.IsDone():
        print("I Could make it",section_shp,corner1.X(),corner1.Y(),corner1.Z(),corner2.X(),corner2.Y(),corner2.Z())
        myShape = section_shp.Shape()
        topologyExplorer = TopologyExplorer(myShape,ignore_orientation=False)
        soliditerror = list(topologyExplorer.solids())
        faceiiterror = list(topologyExplorer.faces()) 
        edgeiiterror = list(topologyExplorer.edges())
        vertiiterror = list(topologyExplorer.vertices())
        if len(faceiiterror)==0:
            print("I Could make not get faces",section_shp)
            print(faceiiterror,len(soliditerror),"Solids",(edgeiiterror),"Edges", len(vertiiterror), "Vertices")
            return [{
                "face":"Open",
                "dimension":roundOffMe(get_bounding_details(myShape))
            }]

        else:
            entityarray=[]
            for aface in faceiiterror:
                print("I Could get faces",aface)
                entityarray.append({
                    "face": "Hole" if (aface.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Solid",
                    "dimension":roundOffMe(get_bounding_details(aface))
                })
            return entityarray
    else:
        return [{
                "face":"Unknown",
                "dimension":roundOffMe(dimension)
            }]

def get_depth(face, xmin, ymin, zmin, xmax, ymax, zmax, xmins, ymins, zmins, xmaxs, ymaxs, zmaxs):
    if(face=="Hole"):
        #print("I am hole")
        xdirection = abs(xmaxs-xmins)
        ydirection = abs(ymaxs-ymins)
        zdirection = abs(zmaxs-zmins)
        if ( (xdirection<ydirection) and (xdirection<zdirection) ):
            #return abs(xmins-xmin)
            return abs(xmaxs-xmin)
        if ( (ydirection<xdirection) and (ydirection<zdirection) ):
            #return abs(ymins-ymin)
            return abs(ymaxs-ymin)
        if ( (zdirection<xdirection) and (zdirection<ydirection) ):
            #return abs(zmins-zmin)
            return abs(zmaxs-zmin)        
        return min(abs(xmax-xmin),abs(ymax-ymin),abs(zmax-zmin))
    #print("I am not a hole")
    return 0

def get_part_stackable_right(part, dimension, face_dict, tol=0.1):
    xmin, ymin, zmin, xmax, ymax, zmax = dimension    
    xpos = xmax-tol
    if xpos < xmin:
        xpos = xmin 
    if(xpos==xmax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face, direction, facetype ) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(xmax-xmaxs) <= tol:
            faces.append({
                "face":facetype,
                "surface":face, 
                "id":hash_solidface, 
                "dimension":roundOffMe(boundingitems),
                "direction": direction,
                "depth":roundoff(get_depth(face, xmin, ymin, zmin, xmax, ymax, zmax, xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))
                })    
    if(len(faces)==0):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0            
        }] 
    return faces    
    """ corner1 = gp_Pnt(xmax-1, ymin, zmin)
    corner2 = gp_Pnt(xmax+1, ymax, zmax)
    return returnStackableFaces(part, corner1, corner2, dimension)   

    min_dist = 0
    for i in range(ymin,ymax):
        touchingpoint=False
        for j in range(zmin, zmax):
            corner1 = gp_Pnt(xpos, i, j)
            corner2 = gp_Pnt(xmax, i+1, j+1)
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole" 
    for j in range(zmin, zmax):
        touchingpoint=False
        for i in range(ymin,ymax):
            corner1 = gp_Pnt(xpos, i, j)
            corner2 = gp_Pnt(xmax, i+1, j+1) 
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole"
    if (min_dist > 0) and (touchingpoint==False):
        return "Open" """
    return "Close"   

def get_part_stackable_left(part, dimension, face_dict, tol=0.1):
    xmin, ymin, zmin, xmax, ymax, zmax = dimension    
    xpos = xmin+tol
    if xpos > xmax:
        xpos = xmax 
    if(xpos==xmin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face, direction, facetype ) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(xmin-xmins) <= tol:
            faces.append({
                "face":facetype,
                "surface":face, 
                "id":hash_solidface, 
                "dimension":roundOffMe(boundingitems),
                "direction": direction,
                "depth":roundoff(get_depth(face, xmin, ymin, zmin, xmax, ymax, zmax, xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))
                })    
    if(len(faces)==0):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    return faces    
    """ corner1 = gp_Pnt(xmin-1, ymin, zmin)
    corner2 = gp_Pnt(xmin+1, ymax, zmax)      
    return returnStackableFaces(part, corner1, corner2, dimension) 
    if(xpos==xmin): 
        return "Surface" 
    min_dist = 0
    for i in range(ymin,ymax):
        touchingpoint=False
        for j in range(zmin, zmax):
            corner1 = gp_Pnt(xmin, i-1, j-1)
            corner2 = gp_Pnt(xpos, i, j) 
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole"        
    for j in range(zmin, zmax):
        touchingpoint=False
        for i in range(ymin,ymax):
            corner1 = gp_Pnt(xmin, i-1, j-1)
            corner2 = gp_Pnt(xpos, i, j) 
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole"
    if (min_dist > 0) and (touchingpoint==False):
        return "Open"
    return "Close" """

def get_part_stackable_front(part, dimension, face_dict, tol=0.1):
    xmin, ymin, zmin, xmax, ymax, zmax = dimension      
    ypos = ymax-tol
    if ypos < ymin:
        ypos = ymin 
    if(ypos==ymax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face, direction, facetype ) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(ymax-ymaxs) <= tol:
            faces.append({
                "face":facetype,
                "surface":face, 
                "id":hash_solidface, 
                "dimension":roundOffMe(boundingitems),
                "direction": direction,
                "depth":roundoff(get_depth(face, xmin, ymin, zmin, xmax, ymax, zmax, xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))
                })    
    if(len(faces)==0):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    return faces    
    """ corner1 = gp_Pnt(xmin, ymax-1, zmin)
    corner2 = gp_Pnt(xmax, ymax+1, zmax)      
    return returnStackableFaces(part, corner1, corner2, dimension) 
    min_dist = 0
    for i in range(zmin,zmax):
        touchingpoint=False
        for j in range(xmin, xmax):
            corner1 = gp_Pnt(j, ypos, i)
            corner2 = gp_Pnt(j+1, ymax, i+1)
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole" 
    for j in range(xmin, xmax):
        touchingpoint=False
        for i in range(zmin,zmax):
            corner1 = gp_Pnt(j, ypos, i)
            corner2 = gp_Pnt(j+1, ymax, i+1)
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole"
    if (min_dist > 0) and (touchingpoint==False):
        return "Open"
    return "Close"  """

def get_part_stackable_back(part, dimension, face_dict, tol=0.1):
    xmin, ymin, zmin, xmax, ymax, zmax = dimension      
    ypos = ymin+tol
    if ypos > ymax:
        ypos = ymax 
    if(ypos==ymin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face, direction, facetype ) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(ymin-ymins) <= tol:
            faces.append({
                "face":facetype,
                "surface":face, 
                "id":hash_solidface, 
                "dimension":roundOffMe(boundingitems),
                "direction": direction,
                "depth":roundoff(get_depth(face, xmin, ymin, zmin, xmax, ymax, zmax, xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))
                })    
    if(len(faces)==0):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    return faces    
    """ corner1 = gp_Pnt(xmin, ymin-1, zmin)
    corner2 = gp_Pnt(xmax, ymin+1, zmax)      
    return returnStackableFaces(part, corner1, corner2, dimension) 
    min_dist = 0
    for i in range(zmin,zmax):
        touchingpoint=False
        for j in range(xmin, xmax):
            corner1 = gp_Pnt(j-1, ymin, i-1)
            corner2 = gp_Pnt(j, ypos, i) 
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole" 
    for j in range(xmin, xmax):
        touchingpoint=False
        for i in range(zmin,zmax):
            corner1 = gp_Pnt(j-1, ymin, i-1)
            corner2 = gp_Pnt(j, ypos, i) 
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole"
    if (min_dist > 0) and (touchingpoint==False):
        return "Open"
    return "Close" """   

def get_part_stackable_top(part, dimension, face_dict, tol=0.1):
    xmin, ymin, zmin, xmax, ymax, zmax = dimension      
    zpos = zmin+tol
    if zpos > zmax:
        zpos = zmax 
    if(zpos==zmin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face, direction, facetype ) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(zmin-zmins) <= tol:
            faces.append({
                "face":facetype,
                "surface":face, 
                "id":hash_solidface, 
                "dimension":roundOffMe(boundingitems),
                "direction": direction,
                "depth":roundoff(get_depth(face, xmin, ymin, zmin, xmax, ymax, zmax, xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))
                })    
    if(len(faces)==0):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    return faces    
    """ corner1 = gp_Pnt(xmin, ymin, zmin-1)
    corner2 = gp_Pnt(xmax, ymax, zmin+1)      
    return returnStackableFaces(part, corner1, corner2, dimension)     
    min_dist = 0
    for i in range(xmin,xmax):
        touchingpoint=False
        for j in range(ymin, ymax):
            #print(i,j,ymin, ymax,xmin,xmax)
            corner1 = gp_Pnt(i-1, j-1, zmin)
            corner2 = gp_Pnt(i, j, zpos)
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole" 
    for j in range(ymin, ymax):
        touchingpoint=False
        for i in range(xmin,xmax):
            corner1 = gp_Pnt(i-1, j-1, zmin)
            corner2 = gp_Pnt(i, j, zpos)
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole"
    if (min_dist > 0) and (touchingpoint==False):
        return "Open"
    return "Close"  """  

def get_part_stackable_bottom(part, dimension, face_dict, tol=0.1):
    xmin, ymin, zmin, xmax, ymax, zmax = dimension      
    zpos = zmax-tol
    if zpos < zmin:
        zpos = zmin 
    if(zpos==zmax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face, direction, facetype ) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(zmax-zmaxs) <= tol:
            faces.append({
                "face":facetype,
                "surface":face, 
                "id":hash_solidface, 
                "dimension":roundOffMe(boundingitems),
                "direction": direction,
                "depth":roundoff(get_depth(face, xmin, ymin, zmin, xmax, ymax, zmax, xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))
                })    
    if(len(faces)==0):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    return faces    
    """ corner1 = gp_Pnt(xmin, ymin, zmax-1)
    corner2 = gp_Pnt(xmax, ymax, zmax+1)      
    return returnStackableFaces(part, corner1, corner2, dimension) 
    min_dist = 0
    for i in range(xmin,xmax):
        touchingpoint=False
        for j in range(ymin, ymax):
            corner1 = gp_Pnt(i, j, zpos)
            corner2 = gp_Pnt(i+1, j+1, zmax)
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole" 
    for j in range(ymin, ymax):
        touchingpoint=False
        for i in range(xmin,xmax):
            corner1 = gp_Pnt(i, j, zpos)
            corner2 = gp_Pnt(i+1, j+1, zmax)
            box_shp = BRepPrimAPI_MakeBox(corner1, corner2).Shape()
            bdss = BRepExtrema_DistShapeShape(part, box_shp)
            bdss.Perform()
            assert_isdone(bdss, 'failed computing minimum distances')
            min_dist = bdss.Value()
            if (min_dist==0) and (touchingpoint==False):
                touchingpoint=True
            if (min_dist>0) and (touchingpoint):
                return "Hole"
    if (min_dist > 0) and (touchingpoint==False):
        return "Open"
    return "Close"  """

def get_part_stackable_directions(part, dimension, face_dict, tol=0.1):
    xmin, ymin, zmin, xmax, ymax, zmax = dimension      
    zpos = zmax-tol
    if zpos < zmin:
        zpos = zmin 
    if(zpos==zmax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    zpos = zmin+tol
    if zpos > zmax:
        zpos = zmax 
    if(zpos==zmin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    ypos = ymin+tol
    if ypos > ymax:
        ypos = ymax 
    if(ypos==ymin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    ypos = ymax-tol
    if ypos < ymin:
        ypos = ymin 
    if(ypos==ymax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    xpos = xmin+tol
    if xpos > xmax:
        xpos = xmax 
    if(xpos==xmin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    xpos = xmax-tol
    if xpos < xmin:
        xpos = xmin 
    if(xpos==xmax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face, direction, facetype ) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if (
            (abs(zmax-zmaxs) <= tol) or
            (abs(zmin-zmins) <= tol) or
            (abs(ymin-ymins) <= tol) or
            (abs(ymax-ymaxs) <= tol) or
            (abs(xmin-xmins) <= tol) or
            (abs(xmax-xmaxs) <= tol) ):

            faces.append({
                "face":facetype,
                "surface":face, 
                "id":hash_solidface, 
                "dimension":roundOffMe(boundingitems),
                "direction": direction,
                "depth":roundoff(get_depth(face, xmin, ymin, zmin, xmax, ymax, zmax, xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))
                })
        

    if(len(faces)==0):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    return faces    
    


def get_part_stackable_positions(part, face_dict, tol=0.1, anggap=0.5):
    dimension = get_bounding_details(part)
    ret_dict = {}      
    try:
        #print("Checking Top")
        ret_dict["top"]=get_part_stackable_top(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["top"]=str(e)
        except:
            ret_dict["top"]="Error"
    try:
        #print("Checking Bottom")
        ret_dict["bottom"]=get_part_stackable_bottom(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["bottom"]=str(e)
        except:
            ret_dict["bottom"]="Error"
    try:
        #print("Checking Right")
        ret_dict["right"]=get_part_stackable_right(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["right"]=str(e)
        except:
            ret_dict["right"]="Error"
    try:
        #print("Checking Left")
        ret_dict["left"]=get_part_stackable_left(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["left"]=str(e)
        except:
            ret_dict["left"]="Error"
    try:
        #print("Checking Front")
        ret_dict["front"]=get_part_stackable_front(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["front"]=str(e)
        except:
            ret_dict["front"]="Error"   
    
    try:
        #print("Checking Back")
        ret_dict["back"]=get_part_stackable_back(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["back"]=str(e)
        except:
            ret_dict["back"]="Error" 
    
    try:
        #print("Checking Back")
        ret_dict["direction"]=get_part_stackable_directions(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["direction"]=str(e)
        except:
            ret_dict["direction"]="Error"  

    return ret_dict
""" 
def getDepthRight(uvPlane, hash_face, face, xmax ):
    if(face=="Hole"):        
        maxDist =  1e10
        depth = 1e10
        for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
            if (face=="Solid") and (position=="YZ") and (hash_solidface != hash_face):                   
                xmaxs, _, _ = faces_max   
                if (position=="YZ") and ((xmax-xmaxs) <= maxDist):
                    depth = xmax-xmaxs
                    maxDist = depth
        return depth 
    else:        
        minDist =  0
        depth = 0
        for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
            if (face=="Hole") and (position=="YZ") and (hash_solidface != hash_face):                   
                xmaxs, _, _ = faces_max   
                if (position=="YZ") and ((xmaxs-xmax) >= minDist):
                    depth = xmaxs-xmax
                    minDist = depth
        return depth              
          

def getDepthLeft(uvPlane, hash_face, face, xmin):
    if(face=="Hole"):
        maxDist =  1e10
        depth = 1e10
        for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
            if (face=="Solid") and (position=="YZ") and (hash_solidface != hash_face):
                xmins, _, _ = faces_min                     
                if (position=="YZ") and ((xmins-xmin) <= maxDist):
                    depth = xmins-xmin
                    maxDist = depth
        return depth 
    else:
        minDist =  0
        depth = 0
        for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
            if (face=="Hole") and (position=="YZ") and (hash_solidface != hash_face):
                xmins, _, _ = faces_min                     
                if (position=="YZ") and ((xmin-xmins) >= minDist):
                    depth = xmin-xmins
                    minDist = depth
        return depth             
           

def getDepthBack(uvPlane, hash_face, face, ymax):
    if(face=="Hole"):
        maxDist =  1e10
        depth = 1e10
        for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
            if (face=="Solid") and (position=="XZ") and (hash_solidface != hash_face):                   
                _, ymaxs, _ = faces_max   
                if (position=="XZ") and ((ymax-ymaxs) <= maxDist):
                    depth = ymax-ymaxs
                    maxDist = depth
        return depth 
    else:
        minDist =  0
        depth = 0
        for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
            if (face=="Solid") and (position=="XZ") and (hash_solidface != hash_face):                   
                _, ymaxs, _ = faces_max   
                if (position=="XZ") and ((ymaxs-ymax) >= minDist):
                    depth = ymaxs-ymax
                    minDist = depth
        return depth     

def getDepthFront(uvPlane, hash_face, face, ymin):
    if(face=="Hole"):
        maxDist =  1e10
        depth = 1e10
        for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
            if (face=="Solid") and (position=="XZ") and (hash_solidface != hash_face):
                _, ymins, _ = faces_min                     
                if (position=="XZ") and ((ymins-ymin) <= maxDist):
                    depth = ymins-ymin
                    maxDist = depth
        return depth    
    else:
        minDist =  0
        depth = 0
        for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
            if (face=="Hole") and (position=="XZ") and (hash_solidface != hash_face):
                _, ymins, _ = faces_min                     
                if (position=="XZ") and ((ymin-ymins) >= minDist):
                    depth = ymin-ymins
                    minDist = depth
        return depth           

def getDepthTop(uvPlane, hash_face, face, zmax):
    if(face=="Hole"):
        maxDist =  1e10
        depth = 1e10
        print (uvPlane,"Hole")
        for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
            if (face=="Solid") and (position=="XY") and (hash_solidface != hash_face):                    
                _, _, zmaxs = faces_max   
                if (position=="XY") and ((zmax-zmaxs) <= maxDist):
                    depth = zmax-zmaxs
                    maxDist = depth
        print("Depth got is", depth)
        return depth
    else:
        minDist =  0
        depth = 0
        print (uvPlane,"Solid")
        for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
            if (face=="Solid") and (position=="XY") and (hash_solidface != hash_face):                    
                _, _, zmaxs = faces_max   
                if (position=="XY") and ((zmaxs-zmax) >= minDist):
                    depth = zmaxs-zmax
                    minDist = depth
        print("Depth got is", depth)
        return depth   
    
def getDepthBottom(uvPlane, hash_face, face, zmin):
    if(face=="Hole"):
        maxDist =  1e10
        depth = 1e10
        for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
            if (face=="Solid") and (position=="YZ") and (hash_solidface != hash_face):
                _, _, zmins = faces_min                      
                if (position=="XY") and ((zmins-zmin) <= maxDist):
                    depth = zmins-zmin
                    maxDist = depth
        return depth             
    else:
        minDist =  0
        depth = 0
        for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
            if (face=="Hole") and (position=="YZ") and (hash_solidface != hash_face):
                _, _, zmins = faces_min                      
                if (position=="XY") and ((zmin-zmins) >= minDist):
                    depth = zmin-zmins
                    minDist = depth
        return depth             
          

def getDepth(uvPlane, hash_face, face, plane, xmin, ymin, zmin, xmax, ymax, zmax):
    if(face=="Hole"):
        if plane=="Right":
            maxDist =  1e10
            depth = 1e10
            for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
                if (face=="Solid") and (plane=="YZ") and (hash_solidface != hash_face):                   
                    xmaxs, _, _ = faces_max   
                    if (position=="YZ") and ((xmax-xmaxs) <= maxDist):
                        depth = xmax-xmaxs
                        maxDist = depth
            return depth              
        if plane=="Back":    
            maxDist =  1e10
            depth = 1e10
            for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
                if (face=="Solid") and (position=="XZ") and (hash_solidface != hash_face):                   
                    _, ymaxs, _ = faces_max   
                    if (position=="XZ") and ((ymax-ymaxs) <= maxDist):
                        depth = ymax-ymaxs
                        maxDist = depth
            return depth            
        if plane=="Top": 
            maxDist =  1e10
            depth = 1e10
            for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
                if (face=="Solid") and (position=="XY") and (hash_solidface != hash_face):                    
                    _, _, zmaxs = faces_max   
                    if (position=="XY") and ((zmax-zmaxs) <= maxDist):
                        depth = zmax-zmaxs
                        maxDist = depth
            return depth             
        if plane=="Left":
            maxDist =  1e10
            depth = 1e10
            for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
                if (face=="Solid") and (position=="YZ") and (hash_solidface != hash_face):
                    xmins, _, _ = faces_min                     
                    if (position=="YZ") and ((xmins-xmin) <= maxDist):
                        depth = xmins-xmin
                        maxDist = depth
            return depth             
        if plane=="Front":
            maxDist =  1e10
            depth = 1e10
            for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
                if (face=="Solid") and (position=="XZ") and (hash_solidface != hash_face):
                    _, ymins, _ = faces_min                     
                    if (position=="XZ") and ((ymins-ymin) <= maxDist):
                        depth = ymins-ymin
                        maxDist = depth
            return depth    
        if plane=="Bottom": 
            maxDist =  1e10
            depth = 1e10
            for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
                if (face=="Solid") and (position=="YZ") and (hash_solidface != hash_face):
                    _, _, zmins = faces_min                      
                    if (position=="XY") and ((zmins-zmin) <= maxDist):
                        depth = zmins-zmin
                        maxDist = depth
            return depth             
        return 0
    else:
        if plane=="Right":
            minDist =  0
            depth = 0
            for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
                if (face=="Hole") and (position=="YZ") and (hash_solidface != hash_face):                   
                    xmaxs, _, _ = faces_max   
                    if (position=="YZ") and ((xmaxs-xmax) >= minDist):
                        depth = xmaxs-xmax
                        minDist = depth
            return depth              
        if plane=="Back":    
            minDist =  0
            depth = 0
            for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
                if (face=="Solid") and (position=="XZ") and (hash_solidface != hash_face):                   
                    _, ymaxs, _ = faces_max   
                    if (position=="XZ") and ((ymaxs-ymax) >= minDist):
                        depth = ymaxs-ymax
                        minDist = depth
            return depth            
        if plane=="Top": 
            minDist =  0
            depth = 0
            for (position,_, faces_max, _, hash_solidface, face, _, _) in uvPlane:
                if (face=="Solid") and (position=="XY") and (hash_solidface != hash_face):                    
                    _, _, zmaxs = faces_max   
                    if (position=="XY") and ((zmaxs-zmax) >= minDist):
                        depth = zmaxs-zmax
                        minDist = depth
            return depth             
        if plane=="Left":
            minDist =  0
            depth = 0
            for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
                if (face=="Hole") and (position=="YZ") and (hash_solidface != hash_face):
                    xmins, _, _ = faces_min                     
                    if (position=="YZ") and ((xmin-xmins) >= minDist):
                        depth = xmin-xmins
                        minDist = depth
            return depth             
        if plane=="Front":
            minDist =  0
            depth = 0
            for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
                if (face=="Hole") and (position=="XZ") and (hash_solidface != hash_face):
                    _, ymins, _ = faces_min                     
                    if (position=="XZ") and ((ymin-ymins) >= minDist):
                        depth = ymin-ymins
                        minDist = depth
            return depth    
        if plane=="Bottom": 
            minDist =  0
            depth = 0
            for (position,_, _, faces_min, hash_solidface, face, _, _) in uvPlane:
                if (face=="Hole") and (position=="YZ") and (hash_solidface != hash_face):
                    _, _, zmins = faces_min                      
                    if (position=="XY") and ((zmin-zmins) >= minDist):
                        depth = zmin-zmins
                        minDist = depth
            return depth             
        return 0  """   
""" def getDepthRight(uvPlane, xmax, ytol, ztol):            
    minDist, myface = -1e10 , ((1e10,1e10,1e10), (-1e10,-1e10,-1e10), "No Face", "Not Known", "No Direction" , "UnKnown")            
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="YZ") or (position=="ZY") :                   
            #xmaxs, _, _ = faces_max  

            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max
            
            if (xmaxs > minDist) and ((ymaxs-ymins) > ytol) and ((zmaxs-zmins) > ztol) :
                minDist, myface = xmaxs, (faces_max, faces_min, hash_solidface, face, direction, facetype) 
    if minDist== -1e10:  
        return 0, myface
    else:                
        return (xmax-minDist), myface              
          

def getDepthLeft(uvPlane, xmin, ytol, ztol):    
    maxDist, myface = 1e10, ((1e10,1e10,1e10), (-1e10,-1e10,-1e10), "No Face", "Not Known", "No Direction" , "UnKnown")          
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="YZ") or (position=="ZY") :
            #xmins, _, _ = faces_min 
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max                    
            if (xmins < maxDist) and ((ymaxs-ymins) > ytol) and ((zmaxs-zmins) > ztol) :
                maxDist, myface = xmins, (faces_max, faces_min, hash_solidface, face, direction, facetype)                   
    if maxDist == 1e10:  
        return 0, myface
    else:                
        return (maxDist-xmin), myface                
           

def getDepthBack(uvPlane, ymax, ztol, xtol):    
    minDist, myface = -1e10 , ((1e10,1e10,1e10), (-1e10,-1e10,-1e10), "No Face", "Not Known", "No Direction" , "UnKnown")        
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        #osition,facetype)
        if (position=="XZ") or (position=="ZX") :                   
            #_, ymaxs, _ = faces_max 
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max   
            if (ymaxs > minDist) and ((xmaxs-xmins) > xtol) and ((zmaxs-zmins) > ztol) :
                minDist, myface = ymaxs, (faces_max, faces_min, hash_solidface, face, direction, facetype)                    
    if minDist== -1e10:  
        return 0, myface
    else:                
        return (ymax-minDist), myface     

def getDepthFront(uvPlane, ymin, ztol, xtol):     
    maxDist, myface = 1e10, ((1e10,1e10,1e10), (-1e10,-1e10,-1e10), "No Face", "Not Known", "No Direction" , "UnKnown")                 
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="XZ") or (position=="ZX") :
            #_, ymins, _ = faces_min
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max                      
            if (ymins < maxDist) and ((xmaxs-xmins) > xtol) and ((zmaxs-zmins) > ztol) :
                maxDist, myface = ymins, (faces_max, faces_min, hash_solidface, face, direction, facetype)                    
    if maxDist == 1e10:  
        return 0, myface
    else:                
        return (maxDist-ymin), myface            

def getDepthTop(uvPlane, zmax, xtol, ytol):    
    minDist, myface = -1e10, ((1e10,1e10,1e10), (-1e10,-1e10,-1e10), "No Face", "Not Known", "No Direction" , "UnKnown")         
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="XY") or (position=="YX"):                    
            #_, _, zmaxs = faces_max
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max    
            #print("Getting",(xmaxs-xmins),xtol,(ymaxs-ymins),ytol, ((xmaxs-xmins) > xtol) and ((ymaxs-ymins) > ytol) )
            if (zmaxs > minDist) and ((xmaxs-xmins) > xtol) and ((ymaxs-ymins) > ytol) :                   
                minDist, myface = zmaxs, (faces_max, faces_min, hash_solidface, face, direction, facetype)        
    if minDist== -1e10:  
        return 0, myface
    else:                
        return (zmax-minDist), myface    
    
def getDepthBottom(uvPlane, zmin, xtol, ytol):     
    maxDist, myface =  1e10 , ((1e10,1e10,1e10), (-1e10,-1e10,-1e10), "No Face", "Not Known", "No Direction" , "UnKnown") 
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="XY") or (position=="YX"): 
            #_, _, zmins = faces_min 
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max                      
            if (zmins < maxDist) and ((xmaxs-xmins) > xtol) and ((ymaxs-ymins) > ytol) :                    
                maxDist, myface = zmins, (faces_max, faces_min, hash_solidface, face, direction, facetype)
    if maxDist == 1e10:  
        return 0, myface
    else:                
        return (maxDist-zmin), myface  """

def getDepthRight(uvPlane, xmax, ytol, ztol):            
    minDist, myface = -1e10 , []            
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="YZ") or (position=="ZY") :                   
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max
            if (xmaxs > minDist) and ((ymaxs-ymins) > ytol) and ((zmaxs-zmins) > ztol) :
                minDist = xmaxs 
    if minDist== -1e10:  
        return 0, myface
    else:   
        for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
            if (position=="YZ") or (position=="ZY") :              
                xmins, ymins, zmins = faces_min
                xmaxs, ymaxs, zmaxs = faces_max                
                if (xmaxs == minDist) and ((ymaxs-ymins) > ytol) and ((zmaxs-zmins) > ztol) :
                   myface.append((faces_max, faces_min, hash_solidface, face, direction, facetype))             
        return (xmax-minDist), myface              
          

def getDepthLeft(uvPlane, xmin, ytol, ztol):    
    maxDist, myface = 1e10, []         
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="YZ") or (position=="ZY") :
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max                    
            if (xmins < maxDist) and ((ymaxs-ymins) > ytol) and ((zmaxs-zmins) > ztol) :
                maxDist = xmins                   
    if maxDist == 1e10:  
        return 0, myface
    else: 
        for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
            if (position=="YZ") or (position=="ZY") :
                xmins, ymins, zmins = faces_min
                xmaxs, ymaxs, zmaxs = faces_max                    
                if (xmins == maxDist) and ((ymaxs-ymins) > ytol) and ((zmaxs-zmins) > ztol) :
                    myface.append((faces_max, faces_min, hash_solidface, face, direction, facetype))                
        return (maxDist-xmin), myface                
           

def getDepthBack(uvPlane, ymax, ztol, xtol):    
    minDist, myface = -1e10 , []       
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="XZ") or (position=="ZX") :                   
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max   
            if (ymaxs > minDist) and ((xmaxs-xmins) > xtol) and ((zmaxs-zmins) > ztol) :
                minDist = ymaxs                   
    if minDist== -1e10:  
        return 0, myface
    else:   
        for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
            if (position=="XZ") or (position=="ZX") :                   
                xmins, ymins, zmins = faces_min
                xmaxs, ymaxs, zmaxs = faces_max   
                if (ymaxs == minDist) and ((xmaxs-xmins) > xtol) and ((zmaxs-zmins) > ztol) :
                    myface.append((faces_max, faces_min, hash_solidface, face, direction, facetype))              
        return (ymax-minDist), myface     

def getDepthFront(uvPlane, ymin, ztol, xtol):     
    maxDist, myface = 1e10, []                
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="XZ") or (position=="ZX") :            
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max                      
            if (ymins < maxDist) and ((xmaxs-xmins) > xtol) and ((zmaxs-zmins) > ztol) :
                maxDist = ymins                    
    if maxDist == 1e10:  
        return 0, myface
    else:    
        for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
            if (position=="XZ") or (position=="ZX") :            
                xmins, ymins, zmins = faces_min
                xmaxs, ymaxs, zmaxs = faces_max                      
                if (ymins == maxDist) and ((xmaxs-xmins) > xtol) and ((zmaxs-zmins) > ztol) :
                    myface.append((faces_max, faces_min, hash_solidface, face, direction, facetype))             
        return (maxDist-ymin), myface            

def getDepthTop(uvPlane, zmax, xtol, ytol):    
    minDist, myface = -1e10, []        
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="XY") or (position=="YX"): 
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max    
            #print("Getting",(xmaxs-xmins),xtol,(ymaxs-ymins),ytol, ((xmaxs-xmins) > xtol) and ((ymaxs-ymins) > ytol) )
            if (zmaxs > minDist) and ((xmaxs-xmins) > xtol) and ((ymaxs-ymins) > ytol) :                   
                minDist = zmaxs         
    if minDist== -1e10:  
        return 0, myface
    else: 
        for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
            if (position=="XY") or (position=="YX"): 
                xmins, ymins, zmins = faces_min
                xmaxs, ymaxs, zmaxs = faces_max    
                #print("Getting",(xmaxs-xmins),xtol,(ymaxs-ymins),ytol, ((xmaxs-xmins) > xtol) and ((ymaxs-ymins) > ytol) )
                if (zmaxs == minDist) and ((xmaxs-xmins) > xtol) and ((ymaxs-ymins) > ytol) :                   
                    myface.append((faces_max, faces_min, hash_solidface, face, direction, facetype))                 
        return (zmax-minDist), myface    
    
def getDepthBottom(uvPlane, zmin, xtol, ytol):     
    maxDist, myface =  1e10 , [] 
    for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
        if (position=="XY") or (position=="YX"): 
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max                      
            if (zmins < maxDist) and ((xmaxs-xmins) > xtol) and ((ymaxs-ymins) > ytol) :                    
                maxDist = zmins
    if maxDist == 1e10:  
        return 0, myface
    else:    
        for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
            if (position=="XY") or (position=="YX"): 
                xmins, ymins, zmins = faces_min
                xmaxs, ymaxs, zmaxs = faces_max                      
                if (zmins == maxDist) and ((xmaxs-xmins) > xtol) and ((ymaxs-ymins) > ytol) :                    
                    myface.append((faces_max, faces_min, hash_solidface, face, direction, facetype))            
        return (maxDist-zmin), myface 
 
def getDepth(uvPlane, plane, xmin, ymin, zmin, xmax, ymax, zmax, xtol, ytol, ztol):    
    if plane=="Right":
        return getDepthRight(uvPlane,xmax, ytol, ztol)              
    if plane=="Back":    
        return getDepthBack(uvPlane,ymax, ztol, xtol)        
    if plane=="Top": 
        return getDepthTop(uvPlane,zmax, xtol, ytol)            
    if plane=="Left":
        return getDepthLeft(uvPlane,xmin, ytol, ztol)        
    if plane=="Front":
        return getDepthFront(uvPlane,ymin, ztol, xtol)   
    if plane=="Bottom": 
        return getDepthBottom(uvPlane,zmin, xtol, ytol)              
    return 0, ((1e10,1e10,1e10), (-1e10,-1e10,-1e10), "No Face", "Not Known", "No Direction" , "UnKnown") 
  
def minimumDepth(faces, dimension):
    myface = {
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0            
        }
    if(len(faces)==0):
        return [myface]
    minDepth = 1e10     
    for oneFace in faces:
        if(oneFace["depth"] < minDepth):            
            minDepth = oneFace["depth"]
    retfaces = []
    for oneFace in faces:
        if(oneFace["depth"] == minDepth):
            retfaces.append(oneFace)
    return retfaces
           
def getPartStackableRight(face_dict, tol=0.1, anggap=0.1):
    dimension, outputShapes = face_dict 
    #xmin, _, _, xmax, _, _ = dimension 
    xmin, ymin, zmin, xmax, ymax, zmax = dimension    
    xpos = xmax-tol
    if xpos < xmin:
        xpos = xmin 
    if(xpos==xmax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    ytol = abs(ymax-ymin)*anggap
    ztol = abs(zmax-zmin)*anggap
    faces = []
    for _, (_,_, _, _, _, _, _, _, _,_, uvPlane)  in outputShapes.items():
        depth, myFaces = getDepthRight(uvPlane,xmax,ytol,ztol)
        for (faces_max, faces_min, hash_solidface, face, direction, facetype) in myFaces:
            if(hash_solidface != "No Face"):
                faces.append({
                    "face":facetype,
                    "surface":face, 
                    "id":hash_solidface, 
                    "dimension":roundOffMaxMin(faces_min,faces_max),
                    "direction": direction,
                    "depth":roundoff(depth) 
                    }) 
    return minimumDepth(faces,dimension)

def getPartStackableLeft(face_dict, tol=0.1, anggap=0.1):
    dimension, outputShapes = face_dict 
    #xmin, _, _, xmax, _, _ = dimension 
    xmin, ymin, zmin, xmax, ymax, zmax = dimension   
    xpos = xmin+tol
    if xpos > xmax:
        xpos = xmax 
    if(xpos==xmin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    ytol = abs(ymax-ymin)*anggap
    ztol = abs(zmax-zmin)*anggap
    faces = []
    for _, (_,_, _, _, _, _, _, _, _,_, uvPlane)  in outputShapes.items():
        depth, myFaces = getDepthLeft(uvPlane,xmin,ytol,ztol)
        for (faces_max, faces_min, hash_solidface, face, direction, facetype) in myFaces:
            if(hash_solidface != "No Face"):
                faces.append({
                    "face":facetype,
                    "surface":face, 
                    "id":hash_solidface, 
                    "dimension":roundOffMaxMin(faces_min,faces_max),
                    "direction": direction,
                    "depth":roundoff(depth) 
                    })     
    return minimumDepth(faces,dimension)        

def getPartStackableBack(face_dict, tol=0.1, anggap=0.1):
    dimension, outputShapes = face_dict 
    #_, ymin, _, _, ymax, _ = dimension   
    xmin, ymin, zmin, xmax, ymax, zmax = dimension        
    ypos = ymax-tol
    if ypos < ymin:
        ypos = ymin 
    if(ypos==ymax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    xtol = abs(xmax-xmin)*anggap
    ztol = abs(zmax-zmin)*anggap
    faces = []
    for _, (_,_, _, _, _, _, _, _, _,_, uvPlane)  in outputShapes.items():
        depth, myFaces = getDepthBack(uvPlane,ymax,ztol,xtol)
        for (faces_max, faces_min, hash_solidface, face, direction, facetype) in myFaces:
            if(hash_solidface != "No Face"):
                faces.append({
                    "face":facetype,
                    "surface":face, 
                    "id":hash_solidface, 
                    "dimension":roundOffMaxMin(faces_min,faces_max),
                    "direction": direction,
                    "depth":roundoff(depth) 
                    })      
    return minimumDepth(faces,dimension)  
    

def getPartStackableFront(face_dict, tol=0.1, anggap=0.1):
    dimension, outputShapes = face_dict 
    #_, ymin, _, _, ymax, _ = dimension   
    xmin, ymin, zmin, xmax, ymax, zmax = dimension          
    ypos = ymin+tol
    if ypos > ymax:
        ypos = ymax 
    if(ypos==ymin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    xtol = abs(xmax-xmin)*anggap
    ztol = abs(zmax-zmin)*anggap
    faces = []
    for _, (_,_, _, _, _, _, _, _, _,_, uvPlane)  in outputShapes.items():
        depth, myFaces = getDepthFront(uvPlane,ymin,ztol,xtol)
        for (faces_max, faces_min, hash_solidface, face, direction, facetype) in myFaces:
            if(hash_solidface != "No Face"):
                faces.append({
                    "face":facetype,
                    "surface":face, 
                    "id":hash_solidface, 
                    "dimension":roundOffMaxMin(faces_min,faces_max),
                    "direction": direction,
                    "depth":roundoff(depth) 
                    })      
    return minimumDepth(faces,dimension)      

def getPartStackableBottom(face_dict, tol=0.1, anggap=0.1):
    dimension, outputShapes = face_dict 
    #_, _, zmin, _, _, zmax = dimension
    xmin, ymin, zmin, xmax, ymax, zmax = dimension      
    zpos = zmin+tol
    if zpos > zmax:
        zpos = zmax 
    if(zpos==zmin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    ytol = abs(ymax-ymin)*anggap
    xtol = abs(xmax-xmin)*anggap
    faces = []
    for _, (_,_, _, _, _, _, _, _, _,_, uvPlane)  in outputShapes.items():
        depth, myFaces = getDepthBottom(uvPlane,zmin,xtol,ytol)
        for (faces_max, faces_min, hash_solidface, face, direction, facetype) in myFaces:
            if(hash_solidface != "No Face"):
                faces.append({
                    "face":facetype,
                    "surface":face, 
                    "id":hash_solidface, 
                    "dimension":roundOffMaxMin(faces_min,faces_max),
                    "direction": direction,
                    "depth":roundoff(depth) 
                    })       
    return minimumDepth(faces,dimension)      

def getPartStackableTop(face_dict, tol=0.1, anggap=0.1):
    #print(face_dict)
    #print("Done1")
    dimension, outputShapes = face_dict 
    #print(dimension)
    #print("Done2")
    #print(outputShapes)
    #print("Done3")
    #print("Total Dimension", dimension)

    #_, _, zmin, _, _, zmax = dimension
    xmin, ymin, zmin, xmax, ymax, zmax = dimension       
    zpos = zmax-tol
    if zpos < zmin:
        zpos = zmin 
    if(zpos==zmax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    
    ytol = abs(ymax-ymin)*anggap
    xtol = abs(xmax-xmin)*anggap
    faces = []
    #print("Before for loooooooooooooooooop")
    for _, (_,_, _, _, _, _, _, _, _,basename, uvPlane) in outputShapes.items():  

        """ try:

            with open("Display/"+basename+".pickle", 'rb') as f:
                # The protocol version used is detected automatically, so we do not
                # have to specify it.
                myface = pickle.load(f)  
                afterSave = recognize_direction(myface)
                print("AfterSave", afterSave)

        except Exception as e:
            print("Error while loading",basename,e)  """ 
        #print("Processing face", basename)
        #print(uvPlane)
        #print("Done ,,,,,,yvplane")        
        depth, myFaces = getDepthTop(uvPlane,zmax,xtol,ytol)
        for (faces_max, faces_min, hash_solidface, face, direction, facetype) in myFaces:
            if(hash_solidface != "No Face"):
                faces.append({
                    "face":facetype,
                    "surface":face, 
                    "id":hash_solidface, 
                    "dimension":roundOffMaxMin(faces_min,faces_max),
                    "direction": direction,
                    "depth":roundoff(depth) 
                    })
            #print("Faces Dimension", faces_max, faces_min)      
    #print("Done my duty")
    return minimumDepth(faces,dimension)    
    
def getPartStackableDirections(face_dict, tol=0.1, anggap=0.1):
    dimension, outputShapes = face_dict 
    xmin, ymin, zmin, xmax, ymax, zmax = dimension      
    zpos = zmax-tol
    if zpos < zmin:
        zpos = zmin 
    if(zpos==zmax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    zpos = zmin+tol
    if zpos > zmax:
        zpos = zmax 
    if(zpos==zmin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    ypos = ymin+tol
    if ypos > ymax:
        ypos = ymax 
    if(ypos==ymin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    ypos = ymax-tol
    if ypos < ymin:
        ypos = ymin 
    if(ypos==ymax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    xpos = xmin+tol
    if xpos > xmax:
        xpos = xmax 
    if(xpos==xmin):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    xpos = xmax-tol
    if xpos < xmin:
        xpos = xmin 
    if(xpos==xmax):
        return [{
            "face":"No Face",
            "surface":"Unknown",
            "id":"No Id",
            "dimension":roundOffMe(dimension),
            "direction":"No Direction",
            "depth":0
        }] 
    xtol = abs(xmax-xmin)*anggap
    ytol = abs(ymax-ymin)*anggap
    ztol = abs(zmax-zmin)*anggap
    faces = []
    #print(outputShapes)
    TopNotFound = True
    BottomNotFound = True
    FrontNotFound = True
    BackNotFound = True
    RightNotFound = True
    LeftNotFound = True
    for _, (_,_, _, _, _, _, _, _, _,_, uvPlane)  in outputShapes.items():
        for (position,_, faces_max, faces_min, hash_solidface, face, direction, facetype) in uvPlane:
            xmins, ymins, zmins = faces_min
            xmaxs, ymaxs, zmaxs = faces_max
            plane = ""  
            if (abs(zmax-zmaxs) <= tol) and ( (position=="XY") or (position=="YX") )  and TopNotFound:
                plane = "Top" 
                TopNotFound=False
            if  (abs(zmin-zmins) <= tol) and ( (position=="XY") or (position=="YX") ) and BottomNotFound:
                plane = "Bottom" 
                BottomNotFound=False
            if (abs(ymin-ymins) <= tol)  and ( (position=="XZ") or (position=="ZX") ) and FrontNotFound:
                plane = "Front" 
                FrontNotFound=False    
            if (abs(ymax-ymaxs) <= tol) and ( (position=="XZ") or (position=="ZX") ) and BackNotFound:
                plane = "Back" 
                BackNotFound=False   
            if  (abs(xmin-xmins) <= tol) and ( (position=="YZ") or (position=="ZY") )  and LeftNotFound:
                plane = "Left" 
                LeftNotFound=False
            if (abs(xmax-xmaxs) <= tol)  and ( (position=="YZ") or (position=="ZY") ) and RightNotFound:
                plane = "Right" 
                RightNotFound=False
            if ( plane != "" ):               
                depth, myFaces = getDepth(uvPlane,plane,xmin, ymin, zmin, xmax, ymax, zmax, xtol, ytol, ztol)
                for (faces_max, faces_min, hash_solidface, face, direction, facetype) in myFaces:
                    if(hash_solidface == "No Face"):
                        if ( plane == "Top" ):               
                            TopNotFound=True
                        if ( plane == "Bottom" ):               
                            BottomNotFound=True
                        if ( plane == "Front" ):               
                            FrontNotFound=True
                        if ( plane == "Back" ):               
                            BackNotFound=True
                        if ( plane == "Left" ):               
                            LeftNotFound=True
                        if ( plane == "Right" ):               
                            RightNotFound=True            
                    else:
                        faces.append({
                            "face":facetype,
                            "surface":face, 
                            "id":hash_solidface, 
                            "dimension":roundOffMaxMin(faces_min,faces_max),
                            "direction": direction,
                            "depth":roundoff(depth) 
                            })               
    return minimumDepth(faces,dimension)   


def getPartStackablePositions(face_dict, tol=0.1, anggap=0.5): 
    #dimension = get_bounding_details(part)
    #print("Getting for positions",tol,anggap)
    ret_dict = {}      
    try:
        print("Checking Top")
        ret_dict["top"]=getPartStackableTop(face_dict, tol, anggap)
    except Exception as e:
        try:
            ret_dict["top"]=str(e)
        except:
            ret_dict["top"]="Error"
    try:
        print("Checking Bottom")
        ret_dict["bottom"]=getPartStackableBottom(face_dict, tol, anggap)
    except Exception as e:
        try:
            ret_dict["bottom"]=str(e)
        except:
            ret_dict["bottom"]="Error"
    try:
        print("Checking Right")
        ret_dict["right"]=getPartStackableRight(face_dict, tol, anggap)
    except Exception as e:
        try:
            ret_dict["right"]=str(e)
        except:
            ret_dict["right"]="Error"
    try:
        print("Checking Left")
        ret_dict["left"]=getPartStackableLeft(face_dict, tol, anggap)
    except Exception as e:
        try:
            ret_dict["left"]=str(e)
        except:
            ret_dict["left"]="Error"
    try:
        print("Checking Front")
        ret_dict["front"]=getPartStackableFront(face_dict, tol, anggap)
    except Exception as e:
        try:
            ret_dict["front"]=str(e)
        except:
            ret_dict["front"]="Error"   
    
    try:
        print("Checking Back")
        ret_dict["back"]=getPartStackableBack(face_dict, tol, anggap)
    except Exception as e:
        try:
            ret_dict["back"]=str(e)
        except:
            ret_dict["back"]="Error" 
    
    try:
        print("Checking Directions")
        ret_dict["direction"]=getPartStackableDirections(face_dict, tol, anggap)
    except Exception as e:
        try:
            ret_dict["direction"]=str(e)
        except:
            ret_dict["direction"]="Error"  

    return ret_dict

def get_oriented_boundingbox(shape, optimal_OBB=True):
    """ return the oriented bounding box of the TopoDS_Shape `shape`

    Parameters
    ----------

    shape : TopoDS_Shape or a subclass such as TopoDS_Face
        the shape to compute the bounding box from
    optimal_OBB : bool, True by default. If set to True, compute the
        optimal (i.e. the smallest oriented bounding box). Optimal OBB is
        a bit longer.
    Returns
    -------
        a list with center, x, y and z sizes

        a shape
    """
    obb = Bnd_OBB()
    if optimal_OBB:
        is_triangulationUsed = True
        is_optimal = True
        is_shapeToleranceUsed = False
        brepbndlib_AddOBB(shape, obb, is_triangulationUsed, is_optimal, is_shapeToleranceUsed)
    else:
        brepbndlib_AddOBB(shape, obb)

    # converts the bounding box to a shape
    aBaryCenter = obb.Center()
    aXDir = obb.XDirection()
    aYDir = obb.YDirection()
    aZDir = obb.ZDirection()
    aHalfX = obb.XHSize()
    aHalfY = obb.YHSize()
    aHalfZ = obb.ZHSize()

    ax = gp_XYZ(aXDir.X(), aXDir.Y(), aXDir.Z())
    ay = gp_XYZ(aYDir.X(), aYDir.Y(), aYDir.Z())
    az = gp_XYZ(aZDir.X(), aZDir.Y(), aZDir.Z())
    p = gp_Pnt(aBaryCenter.X(), aBaryCenter.Y(), aBaryCenter.Z())
    anAxes = gp_Ax2(p, gp_Dir(aZDir), gp_Dir(aXDir))
    anAxes.SetLocation(gp_Pnt(p.XYZ() - ax*aHalfX - ay*aHalfY - az*aHalfZ))
    aBox = BRepPrimAPI_MakeBox(anAxes, 2.0*aHalfX, 2.0*aHalfY, 2.0*aHalfZ).Shape()
    return aBaryCenter, [aHalfX, aHalfY, aHalfZ], aBox


def midpoint(pntA, pntB):
    """ computes the point that lies in the middle between pntA and pntB

    Parameters
    ----------

    pntA, pntB : gp_Pnt

    Returns
    -------

    gp_Pnt

    """
    vec1 = gp_Vec(pntA.XYZ())
    vec2 = gp_Vec(pntB.XYZ())
    veccie = (vec1 + vec2) * 0.5
    return gp_Pnt(veccie.XYZ())


def get_boundingbox(shape, tol=1e-6, use_mesh=True):
    """ return the bounding box of the TopoDS_Shape `shape`
    Parameters
    ----------
    shape : TopoDS_Shape or a subclass such as TopoDS_Face
        the shape to compute the bounding box from
    tol: float
        tolerance of the computed boundingbox
    use_mesh : bool
        a flag that tells whether or not the shape has first to be meshed before the bbox
        computation. This produces more accurate results
    """
    bbox = Bnd_Box()
    bbox.SetGap(tol)
    if use_mesh:
        mesh = BRepMesh_IncrementalMesh()
        mesh.SetParallelDefault(True)
        mesh.SetShape(shape)
        mesh.Perform()
        if not mesh.IsDone():
            raise AssertionError("Mesh not done.")
    brepbndlib_Add(shape, bbox, use_mesh)

    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
    return xmin, ymin, zmin, xmax, ymax, zmax

def center_boundingbox(shape):
    """ compute the center point of a TopoDS_Shape, based on its bounding box

    Parameters
    ----------

    shape : TopoDS_Shape instance or a subclass like TopoDS_Face

    Returns
    -------

    gp_Pnt

    """
    xmin, ymin, zmin, xmax, ymax, zmax = get_boundingbox(shape, 1e-6)
    return midpoint(gp_Pnt(xmin, ymin, zmin), gp_Pnt(xmax, ymax, zmax))


def translate_shp(shp, x,y,z, copy=False):
    trns = gp_Trsf()
    trns.SetTranslation(gp_Vec(x,y,z))
    brep_trns = BRepBuilderAPI_Transform(shp, trns, copy)
    brep_trns.Build()
    return brep_trns.Shape()


def rotate_shape(shape, axis, angle, unite="deg"):
    """ Rotate a shape around an axis, with a given angle.

    @param shape : the shape to rotate
    @point : the origin of the axis
    @vector : the axis direction
    @angle : the value of the rotation

    @return: the rotated shape.
    """
    assert_shape_not_null(shape)
    if unite == "deg":  # convert angle to radians
        angle = radians(angle)
    trns = gp_Trsf()
    trns.SetRotation(axis, angle)
    brep_trns = BRepBuilderAPI_Transform(shape, trns, False)
    brep_trns.Build()
    shp = brep_trns.Shape()
    return shp


def rotate_shp_3_axis(shape, rx, ry, rz, unity="deg", copy=False):
    """ Rotate a shape around (O,x), (O,y) and (O,z).

    @param rx_degree : rotation around (O,x)
    @param ry_degree : rotation around (O,y)
    @param rz_degree : rotation around (O,z)

    @return : the rotated shape.
    """
    assert_shape_not_null(shape)
    if unity == "deg" or unity == "degree" :  # convert angle to radians
        rx = radians(rx)
        ry = radians(ry)
        rz = radians(rz)
    alpha = gp_Trsf()
    alpha.SetRotation(gp_OX(), rx)
    beta = gp_Trsf()
    beta.SetRotation(gp_OY(), ry)
    gamma = gp_Trsf()
    gamma.SetRotation(gp_OZ(), rz)
    brep_trns = BRepBuilderAPI_Transform(shape, alpha*beta*gamma, copy)
    shp = brep_trns.Shape()
    return shp


def scale_shape(shape, fx, fy, fz):
    """ Scale a shape along the 3 directions
    @param fx : scale factor in the x direction
    @param fy : scale factor in the y direction
    @param fz : scale factor in the z direction

    @return : the scaled shape
    """
    assert_shape_not_null(shape)
    scale_trsf = gp_GTrsf()
    rot = gp_Mat(fx, 0., 0., 0., fy, 0., 0., 0., fz)
    scale_trsf.SetVectorialPart(rot)
    shp = BRepBuilderAPI_GTransform(shape, scale_trsf).Shape()
    return shp


def make_extrusion(face, length, vector=gp_Vec(0., 0., 1.)):
    ''' creates a extrusion from a face, along the vector vector.
    with a distance legnth. Note that the normal vector does not
    necessary be normalized.
    By default, the extrusion is along the z axis.
    '''
    vector.Normalize()
    vector.Scale(length)
    return BRepPrimAPI_MakePrism(face, vector).Shape()

def minimum_distance(shp1, shp2):
    '''
    compute minimum distance between 2 BREP's
    @param shp1:    any TopoDS_*
    @param shp2:    any TopoDS_*
    @return: minimum distance,
             minimum distance points on shp1
             minimum distance points on shp2
    '''    
    bdss = BRepExtrema_DistShapeShape(shp1, shp2)
    bdss.Perform()
    assert_isdone(bdss, 'failed computing minimum distances')
    min_dist = bdss.Value()
    min_dist_shp1, min_dist_shp2 = [], []
    for i in range(1, bdss.NbSolution()+1):
        min_dist_shp1.append(bdss.PointOnShape1(i).Coord())
        min_dist_shp2.append(bdss.PointOnShape2(i).Coord())
    return min_dist, min_dist_shp1, min_dist_shp2

def minimum_z_distance(shp1, shp2):
    '''
    compute minimum distance between 2 BREP's
    @param shp1:    any TopoDS_*
    @param shp2:    any TopoDS_*
    @return: minimum distance,
             minimum distance points on shp1
             minimum distance points on shp2
    '''    
    bdss = BRepExtrema_DistShapeShape(shp1, shp2)
    bdss.Perform()
    assert_isdone(bdss, 'failed computing minimum distances')
    min_dist = bdss.Value()
    min_dist_shp1, min_dist_shp2 = [], []
    min_z_dist = min_dist
    for i in range(1, bdss.NbSolution()+1):
        p1 = bdss.PointOnShape1(i).Coord()
        p2 = bdss.PointOnShape2(i).Coord()
        min_dist_shp1.append(p1)
        min_dist_shp2.append(p2)
        abs_z_dist = abs(p1[2]-p2[2])
        if min_z_dist > abs_z_dist:
            min_z_dist = abs_z_dist
     
    return min_z_dist, min_dist, min_dist_shp1, min_dist_shp2


def roundoff(point):
    multiplier = 1
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
    
    return round(point*multiplier,2) / multiplier

def getXYZ(co_ord):
    return (roundoff(co_ord.Coord(1)),roundoff(co_ord.Coord(2)),roundoff(co_ord.Coord(3)))
    #return (co_ord.X(), co_ord.Y(), co_ord.Z())

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
##################################
# Recognize functions
##################################
def recognize_edge_entity(topods_edge):
    """ returns True if the TopoDS_Face is a planar surface
    """
    entity = {}   
    entity['location'] = None
    entity['position'] = None  
    entity['type'] ="Edge"
    if not isinstance(topods_edge, TopoDS_Edge):
        entity['kind'] = "Not an edge"
        entity['type'] = "Point"
        return entity

    curve = BRepAdaptor_Curve(topods_edge)
    curve_type = curve.GetType()
     
    entity['Fill'] = "Cut" if (topods_edge.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Joint"
   #entity['dump'] = topods_face.DumpJsonToString()
    xmin, ymin, zmin, xmax, ymax, zmax = get_bounding_details(topods_edge)
    entity['bound']=xmin, ymin, zmin, xmax, ymax, zmax
    entity['center']= (xmin+xmax)/2.0, (ymin+ymax)/2.0, (zmin+zmax)/2.0
    # nothing found
    #entity['firstU'] = curve.FirstParameter()
    #entity['lastU'] = curve.LastParameter() 
    if  curve_type == GeomAbs_Line:
        entity['kind'] = "Line" 
        gp_Line = curve.Line()
        entity['location'] = gp_Line.Location() 
        axis1=gp_Line.Position()
        entity['position'] = gp_Ax2( axis1.Location(),axis1.Direction() )  # a point of the axis
        
    elif curve_type == GeomAbs_Circle:
        entity['kind'] = "Circle"   
        gp_circle = curve.Circle()
        entity['location'] = gp_circle.Location() 
        entity['position'] = gp_circle.Position() 
        entity['radius'] = gp_circle.Radius()
        entity['center'] = getXYZ(gp_circle.Location())
    elif curve_type == GeomAbs_Ellipse:
        entity['kind'] = "Ellipse"   
        gp_ellipse = curve.Ellipse()
        entity['location'] = gp_ellipse.Location() 
        entity['position'] = gp_ellipse.Position() 
        entity['majorradius'] = gp_ellipse.MajorRadius()
        entity['minorradius'] = gp_ellipse.MinorRadius()
        entity['center'] = getXYZ(gp_ellipse.Location())     
    elif curve_type == GeomAbs_Hyperbola:
        entity['kind'] = "Hyperbola" 
        gp_hyperbola = curve.Hyperbola()
        entity['location'] = gp_hyperbola.Location() 
        entity['position'] = gp_hyperbola.Position() 
        entity['major'] = gp_hyperbola.MajorRadius()
        entity['minor'] = gp_hyperbola.MinorRadius()
        entity['location'] = getXYZ(gp_hyperbola.Position().Location())  # a point of the axis
        entity['direction'] = getXYZ(gp_hyperbola.Position().Direction())
        entity['center'] = getXYZ(gp_hyperbola.Location())       
    elif curve_type == GeomAbs_Parabola:
        entity['kind'] = "Parabola"   
        gp_parabola = curve.Parabola()
        entity['location'] = gp_parabola.Location() 
        entity['position'] = gp_parabola.Position() 
        entity['focal'] = gp_parabola.Focal()        
        entity['location'] = getXYZ(gp_parabola.Position().Location())  # a point of the axis
        entity['direction'] = getXYZ(gp_parabola.Position().Direction())
        entity['center'] = getXYZ(gp_parabola.Location())         
    elif curve_type == GeomAbs_BezierCurve:
        entity['kind'] = "Bezier"   
                  
    elif curve_type == GeomAbs_BSplineCurve:
        entity['kind'] = "BSpline"   
        
    elif curve_type == GeomAbs_OtherCurve:
        entity['kind'] = "Other Curves" 
    else:
        entity['kind'] = "Unknown"   
    return entity

def recognize_entity(topods_face):
    """ returns True if the TopoDS_Face is a planar surface
    """
    entity = {}
    entity['kind'] = "Unknown"
    entity['location'] = None
    entity['position'] = None   
    entity['type'] ="Face" 
    if not isinstance(topods_face, TopoDS_Face):
        return recognize_edge_entity(topods_face)
        #entity['kind'] = "Not a face"       
        #return entity
    entity['Fill'] = "Hole" if (topods_face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Solid"
    #entity['dump'] = topods_face.DumpJsonToString()
    xmin, ymin, zmin, xmax, ymax, zmax = get_bounding_details(topods_face)
    entity['bound']=xmin, ymin, zmin, xmax, ymax, zmax
    entity['center']= (xmin+xmax)/2.0, (ymin+ymax)/2.0, (zmin+zmax)/2.0
    surf = BRepAdaptor_Surface(topods_face, True)
    surf_type = surf.GetType()
    if  surf_type == GeomAbs_Plane:
        # look for the properties of the plane
        # first get the related gp_Pln
        gp_pln = surf.Plane()
       
        entity['kind'] = "Plane"       
        entity['location']  = gp_pln.Location()   # a point of the plane
        entity['position'] = gp_pln.Position()  # the plane normal
        
        return entity
    elif surf_type == GeomAbs_Cylinder:
        # look for the properties of the cylinder
        # first get the related gp_Cyl
        gp_cyl = surf.Cylinder()         
       
        entity['kind'] = "Cylinder"
        entity['location'] =  gp_cyl.Location()  # a point of the axis
        entity['position'] =  gp_cyl.Position()   # the cylinder axis
        entity['radius'] = gp_cyl.Radius()
        #entity['coefficients'] = gp_cyl.Coefficients()
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Cone:
        
        gp_cone = surf.Cone()
       
        entity['kind'] = "Cone"
        entity['location'] =   gp_cone.Location()   # a point of the axis       
        entity['position'] =   gp_cone.Position()    # a local coordinate point of the axis
        entity['radius'] = gp_cone.RefRadius()
        entity['semiangle'] = gp_cone.SemiAngle()
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Sphere:
        
        gp_sphere = surf.Sphere()
      
        entity['kind'] = "Sphere"
        entity['location'] =  gp_sphere.Location()   # a point of the axis
        entity['position'] =   gp_sphere.Position()   # a local coordinate point of the axis
        entity['radius'] = gp_sphere.Radius()
        #axis = gp_sphere.Axis().Direction()  # the sphere axis
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Torus:
        
        gp_torus = surf.Torus()
       
        entity['kind'] = "Torus"
        entity['location'] =  gp_torus.Location()   # a point of the axis
        entity['position'] =   gp_torus.Position()    # a local coordinate point of the axis
        entity['minorradius'] = gp_torus.MinorRadius()
        entity['majorradius'] = gp_torus.MajorRadius()
        #axis = gp_torus.Axis().Direction()  # the sphere axis
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_BezierSurface:      
        
        entity['kind'] = "Bezier"
       
        
        return entity
    elif surf_type == GeomAbs_BSplineSurface:
        #gp_bspline = surf.BSpline()  
        entity['kind'] = "BSpline"
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
    
    return entity



def recognize_direction(topods_face):
    """ returns True if the TopoDS_Face is a planar surface
    """
    entity = {}
    if not isinstance(topods_face, TopoDS_Face):
        return "Unknown", "No Direction", "Not a Face"

    fill = "Hole" if (topods_face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Solid"
    #entity['dump'] = topods_face.DumpJsonToString()
    direction = "Unknown"
    facetype = "Unknown"
    surf = BRepAdaptor_Surface(topods_face, True)
    surf_type = surf.GetType()
    if  surf_type == GeomAbs_Plane:
        # look for the properties of the plane
        # first get the related gp_Pln
        facetype = "Plane"
        gp_pln = surf.Plane()      
       
        direction = getXYZ(gp_pln.Position().Direction())  # the plane normal
       
         
    elif surf_type == GeomAbs_Cylinder:
        # look for the properties of the cylinder
        # first get the related gp_Cyl
        facetype = "Cylinder"
        gp_cyl = surf.Cylinder()         
       
        
        direction = getXYZ(gp_cyl.Position().Direction()) # the cylinder axis
        
        #entity['coefficients'] = gp_cyl.Coefficients()
        # then export location and normal to the console output
         
    elif surf_type == GeomAbs_Cone:
        facetype = "Cone"
        gp_cone = surf.Cone()
       
        direction  =  getXYZ(gp_cone.Position().Direction())  # a local coordinate point of the axis
      
        # then export location and normal to the console output
         
    elif surf_type == GeomAbs_Sphere:
        facetype = "Sphere"
        gp_sphere = surf.Sphere()
        direction  =  getXYZ(gp_sphere.Position().Direction())  # a local coordinate point of the axis
         
        #axis = gp_sphere.Axis().Direction()  # the sphere axis
        # then export location and normal to the console output
       
    elif surf_type == GeomAbs_Torus:
        facetype = "Torus"
        gp_torus = surf.Torus()
       
        direction  =  getXYZ(gp_torus.Position().Direction())  # a local coordinate point of the axis
        
        #axis = gp_torus.Axis().Direction()  # the sphere axis
        # then export location and normal to the console output
        
    elif surf_type == GeomAbs_BezierSurface:      
        facetype = "Bezier"
        direction = "Bezier"
        
    elif surf_type == GeomAbs_BSplineSurface:
        #gp_bspline = surf.BSpline()
        facetype = "BSpline"  
        direction = "BSpline"
        
    elif surf_type == GeomAbs_SurfaceOfRevolution:
        facetype = "Revolution"
        direction = "Revolution"
        
    elif surf_type == GeomAbs_SurfaceOfExtrusion:
        facetype = "Extrusion"
        direction = "Extrusion"
        
    elif surf_type == GeomAbs_OffsetSurface:
        facetype = "Offset"
        direction = "Offset"
         
    elif surf_type == GeomAbs_OtherSurface:
        facetype = "Others"
        direction = "Others"
         
    # nothing found
   
    return fill, direction, facetype

##################################
# Recognize functions
##################################
def recognize_face(topods_face):
    """ returns True if the TopoDS_Face is a planar surface
    """
    entity = {}
    if not isinstance(topods_face, TopoDS_Face):
        entity['kind'] = "Not a face"
        return entity

    entity['Fill'] = "Hole" if (topods_face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Solid"
    #entity['dump'] = topods_face.DumpJsonToString()

    surf = BRepAdaptor_Surface(topods_face, True)
    surf_type = surf.GetType()
    if  surf_type == GeomAbs_Plane:
        # look for the properties of the plane
        # first get the related gp_Pln
        gp_pln = surf.Plane()
       
        entity['kind'] = "Plane"       
        entity['location']  = getXYZ(gp_pln.Location())  # a point of the plane
        entity['normaldir'] = getXYZ(gp_pln.Position().Direction())  # the plane normal
        entity['normalloc'] = getXYZ(gp_pln.Position().Location())  # the plane normal
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

##################################
# Recognize functions
##################################
def recognize_curve(topods_edge):
    """ returns True if the TopoDS_Face is a planar surface
    """
    #entity = "Not an edge" 
    if not isinstance(topods_edge, TopoDS_Edge):
        return "Not an edge" , 0

    curve = BRepAdaptor_Curve(topods_edge)
    curve_type = curve.GetType()
    firstU = curve.FirstParameter()
    lastU = curve.LastParameter()
    firstP = curve.Value(firstU)
    lastP = curve.Value(lastU)
    closedDistance = firstP.SquareDistance(lastP)
    # nothing found
    #entity['firstU'] = curve.FirstParameter()
    #entity['lastU'] = curve.LastParameter() 
    if  curve_type == GeomAbs_Line:
        return "Line", closedDistance
        
    elif curve_type == GeomAbs_Circle:
        
        return "Circle" , closedDistance  
       
    elif curve_type == GeomAbs_Ellipse:
        return "Ellipse" , closedDistance   
      
    elif curve_type == GeomAbs_Hyperbola:
        return "Hyperbola" , closedDistance 
              
    elif curve_type == GeomAbs_Parabola:
        return "Parabola" , closedDistance   
       
    elif curve_type == GeomAbs_BezierCurve:
        return "Bezier" , closedDistance   
                   
    elif curve_type == GeomAbs_BSplineCurve:
        return "BSpline" , closedDistance  
        
    elif curve_type == GeomAbs_OtherCurve:
        return "Other Curves" , closedDistance 
    else:
        return "Unknown" , closedDistance   
    #return "Not an edge" 

##################################
# Recognize functions
##################################
def recognize_edge(topods_edge):
    """ returns True if the TopoDS_Face is a planar surface
    """
    entity = {}   
    if not isinstance(topods_edge, TopoDS_Edge):
        entity['kind'] = "Not an edge"
        return entity

    curve = BRepAdaptor_Curve(topods_edge)
    curve_type = curve.GetType()
     
    entity['Fill'] = "Cut" if (topods_edge.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Joint"
    # nothing found
    #entity['firstU'] = curve.FirstParameter()
    #entity['lastU'] = curve.LastParameter() 
    if  curve_type == GeomAbs_Line:
        entity['kind'] = "Line" 
        gp_Line = curve.Line()
        entity['location'] = getXYZ(gp_Line.Location()) 
        entity['dirlocation'] = getXYZ(gp_Line.Position().Location())  # a point of the axis
        entity['direction'] = getXYZ(gp_Line.Position().Direction())
    elif curve_type == GeomAbs_Circle:
        entity['kind'] = "Circle"   
        gp_circle = curve.Circle()
        entity['radius'] = gp_circle.Radius()
        entity['center'] = getXYZ(gp_circle.Location())
    elif curve_type == GeomAbs_Ellipse:
        entity['kind'] = "Ellipse"   
        gp_ellipse = curve.Ellipse()
        entity['majorradius'] = gp_ellipse.MajorRadius()
        entity['minorradius'] = gp_ellipse.MinorRadius()
        entity['center'] = getXYZ(gp_ellipse.Location())     
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

##################################
# Recognize functions
##################################
def recognize_shape(topods_shape):
    """ returns True if the TopoDS_Face is a planar surface
    """
    entity = {}
    if not isinstance(topods_shape, TopoDS_Shape):
        entity['kind'] = "Not a Shape"
        return entity
    transform = topods_shape.Location().Transformation()
    entity['transformation'] = []
    for i in range(1,4):
        for j in range(1,5):
             entity['transformation'].append(transform.Value(i,j))
    entity['orientation'] = "Reverse" if (topods_shape.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Forward"
    return entity

##############################################################################
# Measure functions
##############################################################################
def measure_shape_volume(shape):
    """ Returns shape volume """
    inertia_props = GProp_GProps()
    brepgprop_VolumeProperties(shape, inertia_props)
    mass = inertia_props.Mass()
    return mass


def measure_shape_mass_center_of_gravity(shape):
    """ Returns the shape center of gravity
    Returns a gp_Pnt if requested (set as_Pnt to True)
    or a list of 3 coordinates, by default."""
    inertia_props = GProp_GProps()
    if is_edge(shape):
        brepgprop_LinearProperties(shape, inertia_props)
        mass_property = "Length"
    elif is_face(shape):
        brepgprop_SurfaceProperties(shape, inertia_props)
        mass_property = "Area"
    else:
        brepgprop_VolumeProperties(shape, inertia_props)
        mass_property = "Volume"
    cog = inertia_props.CentreOfMass()
    mass = inertia_props.Mass()
    return cog, mass, mass_property
