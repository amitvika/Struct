from OCC.Core.TopoDS import TopoDS_Wire

from .base import BaseObject


class Wire(TopoDS_Wire, BaseObject):
    def __init__(self, wire):
        '''
        '''
        assert isinstance(wire, TopoDS_Wire), 'need a TopoDS_Wire, got a %s' % wire.__class__
        assert not wire.IsNull()
        super(Wire, self).__init__()
        BaseObject.__init__(self, 'wire')
        # we need to copy the base shape using the following three
        # lines
        assert self.IsNull()
        self.TShape(wire.TShape())
        self.Location(wire.Location())
        self.Orientation(wire.Orientation())
        assert not self.IsNull()
