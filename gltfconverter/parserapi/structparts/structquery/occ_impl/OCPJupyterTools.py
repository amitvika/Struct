from IPython.display import SVG

from .OCPExporters.svg import getSVG


def display(shape):

    return SVG(getSVG(shape))
