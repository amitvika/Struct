from OCC.Core.TopoDS import TopoDS_Shell
from OCC.Core.ShapeAnalysis import ShapeAnalysis_Shell

from .Topology import Topo
from .base import BaseObject, GlobalProperties


class Shell(TopoDS_Shell, BaseObject):
    _n = 0

    def __init__(self, shell):
        assert isinstance(shell, TopoDS_Shell), 'need a TopoDS_Shell, got a %s' % shell.__class__
        assert not shell.IsNull()
        super(Shell, self).__init__()
        BaseObject.__init__(self, 'shell')
        # we need to copy the base shape using the following three
        # lines
        assert self.IsNull()
        self.TShape(shell.TShape())
        self.Location(shell.Location())
        self.Orientation(shell.Orientation())
        assert not self.IsNull()

        self.GlobalProperties = GlobalProperties(self)
        self._n += 1

    def analyse(self):
        """

        :return:
        """
        ss = ShapeAnalysis_Shell(self)
        if ss.HasFreeEdges():
            bad_edges = [e for e in Topo(ss.BadEdges()).edges()]
        return bad_edges

    def Faces(self):
        """

        :return:
        """
        return Topo(self, True).faces()

    def Wires(self):
        """
        :return:
        """
        return Topo(self, True).wires()

    def Edges(self):
        return Topo(self, True).edges()
