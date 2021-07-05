
import re

from ..structquery.occ_impl.OCPExporters import exportShape

from . import Exporter, register_exporter
from .. import Part


@register_exporter('amf', Part)
class AMFExporter(Exporter):
    """
    Export shape to AMF format.

    =============== ======================
    **Name**        ``amf``
    **Exports**     :class:`Part`
    =============== ======================

    .. note::

        Object is passed to :meth:`exportShape`
        for exporting.
    """

    def __call__(self, filename='out.amf', world=False, tolerance=0.1):

        # Getting structquery Shape
        workplane = self.obj.world_obj if world else self.obj.local_obj
        shape = workplane.val()

        # call structquery exporter
        with open(filename, 'wb') as fh:
            exportShape(
                w=shape,
                exportType='AMF',
                fileLike=fh,
                tolerance=tolerance,
            )
