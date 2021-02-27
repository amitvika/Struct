
import re

from ..structquery.occ_impl.OCPExporters import exportShape

from . import Exporter, register_exporter
from .. import Part


@register_exporter('stl', Part)
class STLExporter(Exporter):
    """
    Export shape to STL format.

    =============== ======================
    **Name**        ``stl``
    **Exports**     :class:`Part`
    =============== ======================

    .. note::

        Object is passed to :meth:`structquery.occ_impl.OCPExporters.exportShape`
        for exporting.

    """

    def __call__(self, filename='out.stl', world=False, tolerance=0.1):

        # Getting structquery Shape
        workplane = self.obj.world_obj if world else self.obj.local_obj
        shape = workplane.val()

        # call cadquery exporter
        with open(filename, 'w') as fh:
            exportShape(
                w=shape,
                exportType='STL',
                fileLike=fh,
                tolerance=tolerance,
            )
