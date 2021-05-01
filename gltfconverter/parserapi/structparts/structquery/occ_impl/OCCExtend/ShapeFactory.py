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

    # note: useTriangulation is True by default, we set it explicitely, but t's not necessary
    if optimal_BB:
        use_triangulation = True
        use_shapetolerance = True
        brepbndlib_AddOptimal(shape, bbox, use_triangulation, use_shapetolerance)
    else:
        brepbndlib_Add(shape, bbox)
    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
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
    return  xmin, ymin, zmin, xmax, ymax, zmax

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
                "dimension":get_bounding_details(myShape)
            }]

        else:
            entityarray=[]
            for aface in faceiiterror:
                print("I Could get faces",aface)
                entityarray.append({
                    "face": "Hole" if (aface.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Solid",
                    "dimension":get_bounding_details(aface)
                })
            return entityarray
    else:
        return [{
                "face":"Unknown",
                "dimension":dimension
            }]

def get_part_stackable_right(part, dimension, face_dict, tol=0.1):
    xmin, ymin, zmin, xmax, ymax, zmax = dimension    
    xpos = xmax-tol
    if xpos < xmin:
        xpos = xmin 
    if(xpos==xmax):
        return [{
                "face":"Surface",
                "dimension":dimension
            }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(xmax-xmaxs) <= tol:
            faces.append({"face":face, "dimension":boundingitems})
    if(len(faces)==0):
         return [{
                "face":"Open",
                "dimension":dimension
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
                "face":"Surface",
                "dimension":dimension
            }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(xmin-xmins) <= tol:
            faces.append({"face":face, "dimension":boundingitems})
    if(len(faces)==0):
         return [{
                "face":"Open",
                "dimension":dimension
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
                "face":"Surface",
                "dimension":dimension
            }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(ymax-ymaxs) <= tol:
            faces.append({"face":face, "dimension":boundingitems})
    if(len(faces)==0):
         return [{
                "face":"Open",
                "dimension":dimension
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
                "face":"Surface",
                "dimension":dimension
            }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(ymin-ymins) <= tol:
            faces.append({"face":face, "dimension":boundingitems})
    if(len(faces)==0):
         return [{
                "face":"Open",
                "dimension":dimension
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
                "face":"Surface",
                "dimension":dimension
            }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(zmin-zmins) <= tol:
            faces.append({"face":face, "dimension":boundingitems})
    if(len(faces)==0):
         return [{
                "face":"Open",
                "dimension":dimension
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
                "face":"Surface",
                "dimension":dimension
            }] 
    faces = []
    for hash_solidface, (solidface, boundingitems, face) in face_dict.items():
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = boundingitems   
        if abs(zmax-zmaxs) <= tol:
            faces.append({"face":face, "dimension":boundingitems})
    if(len(faces)==0):
         return [{
                "face":"Open",
                "dimension":dimension
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

def get_part_stackable_positions(part, face_dict, tol=0.1, anggap=0.5):
    dimension = get_bounding_details(part)
    ret_dict = {}      
    try:
        print("Checking Top")
        ret_dict["top"]=get_part_stackable_top(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["top"]=str(e)
        except:
            ret_dict["top"]="Error"
    try:
        print("Checking Bottom")
        ret_dict["bottom"]=get_part_stackable_bottom(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["bottom"]=str(e)
        except:
            ret_dict["bottom"]="Error"
    try:
        print("Checking Right")
        ret_dict["right"]=get_part_stackable_right(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["right"]=str(e)
        except:
            ret_dict["right"]="Error"
    try:
        print("Checking Left")
        ret_dict["left"]=get_part_stackable_left(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["left"]=str(e)
        except:
            ret_dict["left"]="Error"
    try:
        print("Checking Front")
        ret_dict["front"]=get_part_stackable_front(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["front"]=str(e)
        except:
            ret_dict["front"]="Error"
    try:
        print("Checking Back")
        ret_dict["back"]=get_part_stackable_back(part, dimension, face_dict, tol)
    except Exception as e:
        try:
            ret_dict["back"]=str(e)
        except:
            ret_dict["back"]="Error"    
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


def getXYZ(co_ord):
    return co_ord
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
        entity['location']  = getXYZ(gp_pln.Location().Coord())  # a point of the plane
        entity['normaldir'] = getXYZ(gp_pln.Position().Direction().Coord())  # the plane normal
        entity['normalloc'] = getXYZ(gp_pln.Position().Location().Coord())  # the plane normal
        return entity
    elif surf_type == GeomAbs_Cylinder:
        # look for the properties of the cylinder
        # first get the related gp_Cyl
        gp_cyl = surf.Cylinder()         
       
        entity['kind'] = "Cylinder"
        entity['location'] = getXYZ(gp_cyl.Position().Location().Coord()) # a point of the axis
        entity['direction'] = getXYZ(gp_cyl.Position().Direction().Coord()) # the cylinder axis
        entity['radius'] = gp_cyl.Radius()
        #entity['coefficients'] = gp_cyl.Coefficients()
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Cone:
        
        gp_cone = surf.Cone()
       
        entity['kind'] = "Cone"
        entity['location'] =  getXYZ(gp_cone.Position().Location().Coord())  # a point of the axis       
        entity['direction'] =  getXYZ(gp_cone.Position().Direction().Coord())  # a local coordinate point of the axis
        entity['refradius'] = gp_cone.RefRadius()
        entity['semiangle'] = gp_cone.SemiAngle()
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Sphere:
        
        gp_sphere = surf.Sphere()
      
        entity['kind'] = "Sphere"
        entity['location'] = getXYZ(gp_sphere.Position().Location().Coord())  # a point of the axis
        entity['direction'] =  getXYZ(gp_sphere.Position().Direction().Coord())  # a local coordinate point of the axis
        entity['radius'] = gp_sphere.Radius()
        #axis = gp_sphere.Axis().Direction()  # the sphere axis
        # then export location and normal to the console output
        return entity
    elif surf_type == GeomAbs_Torus:
        
        gp_torus = surf.Torus()
       
        entity['kind'] = "Torus"
        entity['location'] = getXYZ(gp_torus.Position().Location().Coord())  # a point of the axis
        entity['direction'] =  getXYZ(gp_torus.Position().Direction().Coord())  # a local coordinate point of the axis
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
                    poles.append(getXYZ(gp_bezier.Pole(i,j).Coord()))
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
        entity['location'] = getXYZ(gp_Line.Location().Coord()) 
        entity['dirlocation'] = getXYZ(gp_Line.Position().Location().Coord())  # a point of the axis
        entity['direction'] = getXYZ(gp_Line.Position().Direction().Coord())
    elif curve_type == GeomAbs_Circle:
        entity['kind'] = "Circle"   
        gp_circle = curve.Circle()
        entity['radius'] = gp_circle.Radius()
        entity['center'] = getXYZ(gp_circle.Location().Coord())
    elif curve_type == GeomAbs_Ellipse:
        entity['kind'] = "Ellipse"   
        gp_ellipse = curve.Ellipse()
        entity['majorradius'] = gp_ellipse.MajorRadius()
        entity['minorradius'] = gp_ellipse.MinorRadius()
        entity['center'] = getXYZ(gp_ellipse.Location().Coord())     
    elif curve_type == GeomAbs_Hyperbola:
        entity['kind'] = "Hyperbola" 
        gp_hyperbola = curve.Hyperbola()
        entity['major'] = gp_hyperbola.MajorRadius()
        entity['minor'] = gp_hyperbola.MinorRadius()
        entity['location'] = getXYZ(gp_hyperbola.Position().Location().Coord())  # a point of the axis
        entity['direction'] = getXYZ(gp_hyperbola.Position().Direction().Coord())
        entity['center'] = getXYZ(gp_hyperbola.Location().Coord())       
    elif curve_type == GeomAbs_Parabola:
        entity['kind'] = "Parabola"   
        gp_parabola = curve.Parabola()
        entity['focal'] = gp_parabola.Focal()        
        entity['location'] = getXYZ(gp_parabola.Position().Location().Coord())  # a point of the axis
        entity['direction'] = getXYZ(gp_parabola.Position().Direction().Coord())
        entity['center'] = getXYZ(gp_parabola.Location().Coord())         
    elif curve_type == GeomAbs_BezierCurve:
        entity['kind'] = "Bezier"   
        gp_bezier = curve.Bezier()   
        entity['degree'] = gp_bezier.Degree() 
        entity['start'] = getXYZ(gp_bezier.StartPoint().Coord())
        entity['end'] = getXYZ(gp_bezier.EndPoint().Coord())
        no_poles = gp_bezier.NbPoles() 
        entity['pole']=no_poles
        poles = []
        weights = []
        for i in range(1,no_poles+1):
            try:
                poles.append(getXYZ(gp_bezier.Pole(i).Coord()))
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
        entity['start'] = getXYZ(gp_nurbs.StartPoint().Coord())
        entity['end'] = getXYZ(gp_nurbs.EndPoint().Coord())
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
