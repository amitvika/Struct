import functools

from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Copy
from OCC.Core.BRepGProp import (brepgprop_VolumeProperties,
                                brepgprop_LinearProperties,
                                brepgprop_SurfaceProperties)
from OCC.Core.BRepCheck import (BRepCheck_Vertex, BRepCheck_Edge, BRepCheck_Wire,
                                BRepCheck_Face, BRepCheck_Shell, BRepCheck_Analyzer)
from OCC.Core.GProp import GProp_GProps
from OCC.Display.SimpleGui import init_display

from .Common import get_boundingbox
from .Construct import (make_vertex, TOLERANCE)
from .types_lut import shape_lut, topo_lut, curve_lut, surface_lut

#===========================================================================
# DISPLAY
#===========================================================================
global display


class singleton(object):
    def __init__(self, cls):
        self.cls = cls
        self.instance_container = []

    def __call__(self, *args, **kwargs):
        if not len(self.instance_container):
            cls = functools.partial(self.cls, *args, **kwargs)
            self.instance_container.append(cls())
        return self.instance_container[0]


@singleton
class Display(object):
    def __init__(self):
        self.display, self.start_display, self.add_menu, self.add_function_to_menu = init_display()

    def __call__(self, *args, **kwargs):
        return self.display.DisplayShape(*args, **kwargs)

#============
# base class
#============


class BaseObject(object):
    """base class for all objects"""
    def __init__(self, name=None, tolerance=TOLERANCE):
        self.GlobalProperties = GlobalProperties(self)
        self.name = name
        self._dirty = False
        self.tolerance = tolerance
        self.display_set = False

    @property
    def is_dirty(self):
        '''when an object is dirty, its topology will be
        rebuild when update is called'''
        return self._dirty

    @is_dirty.setter
    def is_dirty(self, _bool):
        self._dirty = bool(_bool)

    @property
    def topo_type(self):
        return topo_lut[self.ShapeType()]

    @property
    def geom_type(self):
        if self.topo_type == 'edge':
            return curve_lut[self.ShapeType()]
        if self.topo_type == 'face':
            return surface_lut[self.adaptor.GetType()]
        else:
            raise ValueError('geom_type works only for edges and faces...')

    def set_display(self, display):
        if hasattr(display, 'DisplayShape'):
            self.display_set = True
            self.display = display
        else:
            raise ValueError('not a display')

    def check(self):
        """
        """
        _check = dict(vertex=BRepCheck_Vertex, edge=BRepCheck_Edge,
                      wire=BRepCheck_Wire, face=BRepCheck_Face,
                      shell=BRepCheck_Shell)
        _check[self.topo_type]
        # TODO: BRepCheck will be able to inform *what* actually is the matter,
        # though implementing this still is a bit of work...
        raise NotImplementedError

    def is_valid(self):
        analyse = BRepCheck_Analyzer(self)
        ok = analyse.IsValid()
        if ok:
            return True
        else:
            return False

    def copy(self):
        """

        :return:
        """
        cp = BRepBuilderAPI_Copy(self)
        cp.Perform(self)
        # get the class, construct a new instance
        # cast the cp.Shape() to its specific TopoDS topology
        _copy = self.__class__(shape_lut(cp.Shape()))
        return _copy

    def distance(self, other):
        '''
        return the minimum distance

         :return: minimum distance,
             minimum distance points on shp1
             minimum distance points on shp2
        '''
        return minimum_distance(self, other)

    def show(self, *args, **kwargs):
        """
        renders the topological entity in the viewer

        :param update: redraw the scene or not
        """
        if not self.display_set:
            Display()(self, *args, **kwargs)
        else:
            self.disp.DisplayShape(*args, **kwargs)

    def build(self):
        if self.name.startswith('Vertex'):
            self = make_vertex(self)

    def __eq__(self, other):
        return self.IsEqual(other)

    def __ne__(self, other):
        return not self.__eq__(other)


class GlobalProperties(object):
    '''
    global properties for all topologies
    '''
    def __init__(self, instance):
        self.instance = instance

    @property
    def system(self):
        self._system = GProp_GProps()
        # todo, type should be abstracted with TopoDS...
        _topo_type = self.instance.topo_type
        if _topo_type == 'face' or _topo_type == 'shell':
            brepgprop_SurfaceProperties(self.instance, self._system)
        elif _topo_type == 'edge':
            brepgprop_LinearProperties(self.instance, self._system)
        elif _topo_type == 'solid':
            brepgprop_VolumeProperties(self.instance, self._system)
        return self._system

    def centre(self):
        """
        :return: centre of the entity
        """
        return self.system.CentreOfMass()

    def inertia(self):
        '''returns the inertia matrix'''
        return self.system.MatrixOfInertia(), self.system.MomentOfInertia()

    def area(self):
        '''returns the area of the surface'''
        return self.system.Mass()

    def bbox(self):
        '''
        returns the bounding box of the face
        '''
        return get_boundingbox(self.instance)
