# these items point to the OCC implementation
from .occ_impl.OCPGeometry import Plane, BoundBox, Vector, Matrix, Location
from .occ_impl.OCPShapes import (
    Shape,
    Vertex,
    Edge,
    Face,
    Wire,
    Solid,
    Shell,
    Compound,
    sortWiresByBuildOrder,
)
from .occ_impl import OCPExporters
from .occ_impl import OCPImporters

# these items are the common implementation

# the order of these matter
from .selectors import (
    NearestToPointSelector,
    ParallelDirSelector,
    DirectionSelector,
    PerpendicularDirSelector,
    TypeSelector,
    DirectionMinMaxSelector,
    StringSyntaxSelector,
    Selector,
)
from .cq import CQ, Workplane
from .assembly import Assembly, Color, Constraint
from . import selectors



__all__ = [
    "CQ",
    "Workplane",
    "Assembly",
    "Color",
    "Constraint",
    "selectors",
    "Plane",
    "BoundBox",
    "Matrix",
    "Vector",
    "Location",
    "sortWiresByBuildOrder",
    "Shape",
    "Vertex",
    "Edge",
    "Wire",
    "Face",
    "Solid",
    "Shell",
    "Compound",
    "OCPExporters",
    "OCPImporters",
    "NearestToPointSelector",
    "ParallelDirSelector",
    "DirectionSelector",
    "PerpendicularDirSelector",
    "TypeSelector",
    "DirectionMinMaxSelector",
    "StringSyntaxSelector",
    "Selector",
    
]

__version__ = "2.1"
