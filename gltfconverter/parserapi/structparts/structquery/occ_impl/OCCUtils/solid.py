from OCC.Core.TopoDS import TopoDS_Solid

from .Topology import Topo
from .base import GlobalProperties, BaseObject
from .shell import Shell


class Solid(TopoDS_Solid, BaseObject):
    def __init__(self, solid):
        assert isinstance(solid, TopoDS_Solid), 'need a TopoDS_Solid, got a %s' % solid.__class__
        assert not solid.IsNull()
        super(Solid, self).__init__()
        BaseObject.__init__(self, 'solid')
        # we need to copy the base shape using the following three
        # lines
        assert self.IsNull()
        self.TShape(solid.TShape())
        self.Location(solid.Location())
        self.Orientation(solid.Orientation())
        assert not self.IsNull()

        self.GlobalProperties = GlobalProperties(self)

    def shells(self):
        return (Shell(sh) for sh in Topo(self))
