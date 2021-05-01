from typing import Iterable, Tuple, Dict, overload, Optional
from typing_extensions import Protocol

from OCC.Core.TDocStd import TDocStd_Document
from OCC.Core.TCollection import TCollection_ExtendedString
from OCC.Core.XCAFDoc import XCAFDoc_DocumentTool_ShapeTool, XCAFDoc_DocumentTool_ColorTool, XCAFDoc_ColorType
from OCC.Core.TDataStd import TDataStd_Name
from OCC.Core.TDF import TDF_Label
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.Quantity import Quantity_ColorRGBA

from .OCPGeometry import Location
from .OCPShapes import Shape, Compound
from OCC.Core.XCAFApp import XCAFApp_Application_GetApplication

class Color(object):
    """
    Wrapper for the OCC Core color object Quantity_ColorRGBA.
    """

    wrapped: Quantity_ColorRGBA

    @overload
    def __init__(self, name: str):
        """
        Construct a Color from a name.

        :param name: name of the color, e.g. green
        """
        ...

    @overload
    def __init__(self, r: float, g: float, b: float, a: float = 0):
        """
        Construct a Color from RGB(A) values.

        :param r: red value, 0-1
        :param g: green value, 0-1
        :param b: blue value, 0-1
        :param a: alpha value, 0-1 (default: 0)
        """
        ...

    def __init__(self, *args, **kwargs):

        if len(args) == 1:
            self.wrapped = Quantity_ColorRGBA()
            exists = Quantity_ColorRGBA.ColorFromName(args[0], self.wrapped)
            if not exists:
                raise ValueError(f"Unknown color name: {args[0]}")
        elif len(args) == 3:
            r, g, b = args
            self.wrapped = Quantity_ColorRGBA(r, g, b, 1)
            if kwargs.get("a"):
                self.wrapped.SetAlpha(kwargs.get("a"))
        elif len(args) == 4:
            r, g, b, a = args
            self.wrapped = Quantity_ColorRGBA(r, g, b, a)
        else:
            raise ValueError(f"Unsupported arguments: {args}, {kwargs}")


class AssemblyProtocol(Protocol):
    @property
    def loc(self) -> Location:
        ...

    @property
    def name(self) -> str:
        ...

    @property
    def parent(self) -> Optional["AssemblyProtocol"]:
        ...

    @property
    def color(self) -> Optional[Color]:
        ...

    @property
    def shapes(self) -> Iterable[Shape]:
        ...

    @property
    def children(self) -> Iterable["AssemblyProtocol"]:
        ...

    def traverse(self) -> Iterable[Tuple[str, "AssemblyProtocol"]]:
        ...


def setName(l: TDF_Label, name: str, tool):

    TDataStd_Name.Set(l, TCollection_ExtendedString(name))


def setColor(l: TDF_Label, color: Color, tool):

    tool.SetColor(l, color.wrapped, XCAFDoc_ColorType.XCAFDoc_ColorSurf)


def toCAF(
    assy: AssemblyProtocol, coloredSTEP: bool = False
) -> Tuple[TDF_Label, TDocStd_Document]:

    # prepare a doc
    app = XCAFApp_Application_GetApplication()                                           
    doc = TDocStd_Document(TCollection_ExtendedString("XmlOcaf"))
    app.InitDocument(doc)                    
    tool = XCAFDoc_DocumentTool_ShapeTool(doc.Main())
    tool.SetAutoNaming(False)
    ctool = XCAFDoc_DocumentTool_ColorTool(doc.Main())

    # add root
    top = tool.NewShape()
    TDataStd_Name.Set(top, TCollection_ExtendedString("Struct Assembly"))

    # add leafs and subassemblies
    subassys: Dict[str, Tuple[TDF_Label, Location]] = {}
    for k, v in assy.traverse():
        # leaf part
        #print(len(v.children),k)
        lab = tool.NewShape()
        tool.SetShape(lab, Compound.makeCompound(v.shapes).wrapped)
        setName(lab, f"{k}_part", tool)
        
        # assy part
        subassy = tool.NewShape()
        tool.AddComponent(subassy, lab, TopLoc_Location())
        setName(subassy, k, tool)

        # handle colors - this logic is needed for proper STEP export
        color = v.color
        tmp = v
        if coloredSTEP:
            while not color and tmp.parent:
                tmp = tmp.parent
                color = tmp.color
            if color:
                setColor(lab, color, ctool)
        else:
            if color:
                setColor(subassy, color, ctool)

        subassys[k] = (subassy, v.loc)

        for ch in v.children:
            tool.AddComponent(
                subassy, subassys[ch.name][0], subassys[ch.name][1].wrapped
            )

    tool.AddComponent(top, subassys[assy.name][0], assy.loc.wrapped)
    tool.UpdateAssemblies()

    return top, doc
