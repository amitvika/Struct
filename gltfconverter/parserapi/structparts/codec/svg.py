
import re

from ..structquery.occ_impl.OCPExporters import exportShape

from . import Exporter, register_exporter
from .. import Part


@register_exporter('svg', Part)
class SVGExporter(Exporter):
    """
    Export shape to AMF format.

    =============== ======================
    **Name**        ``svg``
    **Exports**     :class:`Part`
    =============== ======================

    .. note::

        Object is passed to :meth:`structquery.occ_impl.OCPExporters.exportShape`
        for exporting.

    """

    def __call__(self, filename='out.svg', world=False):

        # Getting stuctquery Shape
        workplane = self.obj.world_obj if world else self.obj.local_obj
        shape = workplane.val()

        # call structquery exporter
        with open(filename, 'w') as fh:
            exportShape(
                w=shape,
                exportType='SVG',
                fileLike=fh,
            )
