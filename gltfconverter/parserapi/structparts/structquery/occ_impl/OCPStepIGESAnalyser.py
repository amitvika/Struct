import os
#import sys
#import unicodedata
#from pathlib import Path
import shutil
import re
import struct
import base64
import zlib
from io import BytesIO
#from itertools import chain
from copy import  deepcopy
import json
#from OCC.Core.Plate import Plate_SequenceOfLinearScalarConstraint
#from collections import defaultdict
import numpy
from time import time
from datetime import datetime
from contextlib import contextmanager
#import jinja2
import html
import math
import pickle
import threading
import uuid

#from glob import glob

import logging

from six import MovedAttribute
log = logging.getLogger(__name__)

from OCC.Core.STEPControl import  STEPControl_Writer, STEPControl_AsIs
from OCC.Core.Interface import Interface_Static_SetCVal
from OCC.Core.IFSelect import IFSelect_RetDone
from OCC.Core.TDF import TDF_Label, TDF_LabelSequence
from OCC.Core.TCollection import TCollection_ExtendedString
from OCC.Core.TDocStd import TDocStd_Document
from OCC.Core.XCAFApp import XCAFApp_Application_GetApplication
from OCC.Core.XCAFDoc import (
    #XCAFDoc_DocumentTool, 
    XCAFDoc_DocumentTool_ShapeTool, 
    XCAFDoc_DocumentTool_ColorTool, 
    XCAFDoc_ColorType)
from OCC.Core.TDataStd import TDataStd_Name
#from OCC.Core.XmlDrivers import (
#    XmlDrivers_DocumentStorageDriver,
#    XmlDrivers_DocumentRetrievalDriver,
#)
#from OCC.Core.PCDM import PCDM_StoreStatus
from OCC.Core.STEPCAFControl import STEPCAFControl_Reader, STEPCAFControl_Writer
from OCC.Core.IGESCAFControl import IGESCAFControl_Reader
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.BRepBuilderAPI import (
    BRepBuilderAPI_Transform, BRepBuilderAPI_MakeEdge, BRepBuilderAPI_MakeWire, 
    BRepBuilderAPI_MakeFace, BRepBuilderAPI_MakePolygon )
#from OCC.Core.Tesselator import ShapeTesselator
from OCC.Core.BRep import BRep_Tool
from OCC.Core.BRepOffsetAPI import BRepOffsetAPI_MakePipe
#from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Fuse
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.BRepAdaptor import BRepAdaptor_Curve
#from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopoDS import (
    TopoDS_Compound, topods_Face,TopoDS_Vertex, topods_Vertex, TopoDS_Iterator, TopoDS_Builder, TopoDS_Shape)
from OCC.Core.BRepCheck import (BRepCheck_Shell, BRepCheck_Status)
from OCC.Core.XSControl import XSControl_WorkSession
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.gp import gp_Pnt, gp_Vec, gp_Dir, gp_XYZ, gp_Pnt2d, gp_Ax2, gp_Circ
#from OCC.Core.GProp import GProp_GProps
#from OCC.Core.BRepGProp import brepgprop_LinearProperties
#from OCC.Core.ShapeBuild import ShapeBuild_ReShape
from OCC.Core.TopAbs import (TopAbs_VERTEX, TopAbs_EDGE, TopAbs_FACE, TopAbs_WIRE,
                        TopAbs_SHELL, TopAbs_SOLID, TopAbs_COMPOUND,
                        TopAbs_COMPSOLID, TopAbs_Orientation)
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeSphere, BRepPrimAPI_MakeBox
from OCC.Core.GeomAbs import GeomAbs_Line, GeomAbs_Circle
#from OCC.Core.GCPnts import GCPnts_AbscissaPoint
#from .OCCUtils.vertex import Vertex
#from .OCCUtils import Topology
from .OCCUtils.Topology import (dumpTopologyStructures, 
                                dumpTopologyFacesEdgesVertices,
                                dumpTopologySolids,
                                shapeString, 
                                recognize_edge_entity_info,
                                recognize_face_entity_info,
                                recognize_vertex_entity_info,
                                recognize_by_threejs,
                                Topo )

from .OCCExtend.TopologyUtils import list_of_shapes_to_compound
from .. import assembly #,cq
 
from .OCPShapes import Shape
from .OCPAssembly import Color

#from ... import Assembly
from .OCCExtend.ShapeFactory import recognize_direction, recognize_curve, recognize_face_entity, get_circle_info
from ....thumbnail.thumbnail import createThumbnail
from .gltfDictionary import gltfdict
from .Quaternion import Quaternion

from ....settingscopy import (DISPLAY_URL,MEDIA_URL,COPY_PATH)
from ....assemblyorder import FindAssemblingOrder

@contextmanager
def measure_time(log, name):
    start_time = time()
    yield
    taken = time() - start_time
    log.debug("    %-25s (took: %gms)", name, round(taken * 1000, 3))


class StepGL:
    """
    Enumeration container (nothing special).    
    This class purely exists to make the code more readable.
   
    """

    # accessor.componentType
    BYTE = 5120
    UNSIGNED_BYTE = 5121
    SHORT = 5122
    UNSIGNED_SHORT = 5123
    UNSIGNED_INT = 5125
    FLOAT = 5126

    # bufferView.target
    ARRAY_BUFFER = 34962
    ELEMENT_ARRAY_BUFFER = 34963

    # mesh.primative.mode
    POINTS = 0
    LINES = 1
    LINE_LOOP = 2
    LINE_STRIP = 3
    TRIANGLES = 4
    TRIANGLE_STRIP = 5
    TRIANGLE_FAN = 6


def _list3_min(l_a, l_b):
    return [min((a, b)) for (a, b) in zip(l_a if l_a else l_b, l_b)]


def _list3_max(l_a, l_b):
    return [max((a, b)) for (a, b) in zip(l_a if l_a else l_b, l_b)]


class ShapeBuffer(object):
    """
    Write byte buffer for a set of polygons

    To create a buffer for a single polygon:

    .. doctest::

        
        >>> sb = ShapeBuffer()

        >>> # Populate data
        >>> sb.add_vertex(0, 0, 0)  # [0]
        >>> sb.add_vertex(1, 0, 0)  # [1]
        >>> sb.add_vertex(0, 1, 0)  # [2]
        >>> sb.add_poly_index(0, 1, 2)

        >>> # write to file
        >>> with open('single-poly.bin', 'wb') as fh:  # doctest: +SKIP
        ...     for chunk in sb.buffer_iter():  # doctest: +SKIP
        ...         fh.write(chunk)  # doctest: +SKIP

        >>> # get sizes (relevant for bufferViews, and accessors)
        >>> (sb.vert_len, sb.vert_offset, sb.vert_size)
        (36L, 0, 3L)
        >>> (sb.idx_len, sb.idx_offset, sb.idx_size)
        (3L, 36L, 3L)
    """
    def __init__(self, max_index=0xff):
        """
        :param max_index: maximum index number, if > 65535, 4-byte integers are used
        :type max_index: :class:`long`
        """
        self.vert_data = BytesIO()  # vertex positions
        self.idx_data = BytesIO()  # indices connecting vertices into polygons

        # vertices min/max2
        self.vert_min = None
        self.vert_max = None
        
        # indices number format
        self.max_index = max_index
        if max_index > 0xffff:
            (self.idx_fmt, self.idx_type, self.idx_bytelen) = ('<I', StepGL.UNSIGNED_INT, 4)
        elif max_index > 0xff:
            (self.idx_fmt, self.idx_type, self.idx_bytelen) = ('<H', StepGL.UNSIGNED_SHORT, 2)
        else:
            (self.idx_fmt, self.idx_type, self.idx_bytelen) = ('B', StepGL.UNSIGNED_BYTE, 1)

    @property
    def vert_len(self):
        """
        Number of bytes in ``vert_data`` buffer.
        """
        return self.vert_data.tell()

    @property
    def vert_offset(self):
        """
        Offset (in bytes) of the ``vert_data`` buffer.
        """
        return 0

    @property
    def vert_size(self):
        r"""
        Size of ``vert_data`` in groups of 3 floats
        (ie: number of :math:`3 \times 4` byte groups)
        
        """
        # size of position buffer, in groups of 3 floats
        return self.vert_len / (3 * 4)

    @property
    def idx_len(self):
        """
        Number of bytes in ``idx_data`` buffer.
        """
        return self.idx_data.tell()

    @property
    def idx_offset(self):
        """
        Offset (in bytes) of the ``idx_data`` buffer.
        """
        # after vert_data
        return self.vert_offset + self.vert_len

    @property
    def idx_size(self):
        """
        Number of ``idx_data`` elements.
        (ie: number of 2 or 4 byte groups)
       
        """
        return self.idx_len / self.idx_bytelen

    def __len__(self):
        return self.vert_len + self.idx_len

    def add_vertex(self, x, y, z):
        """
        Add a ``VEC3`` of ``floats`` to the ``vert_data`` buffer
        """
        self.vert_data.write(
            struct.pack('<f', x) +
            struct.pack('<f', y) +
            struct.pack('<f', z)
        )

        # retain min/max values
        self.vert_min = _list3_min(self.vert_min, (x, y, z))
        self.vert_max = _list3_max(self.vert_max, (x, y, z))

    def add_poly_index(self, i, j, k):
        """
        Add 3 ``SCALAR`` of ``uint`` to the ``idx_data`` buffer.
        """
        self.idx_data.write(
            struct.pack(self.idx_fmt, i) +
            struct.pack(self.idx_fmt, j) +
            struct.pack(self.idx_fmt, k)
        )

    def buffer_iter(self, block_size=1024):
        """
        Iterate through chunks of the vertices, and indices buffers seamlessly.

        .. note::

            To see a usage example, look at the :class:`ShapeBuffer` description.
        """
        streams = (
            self.vert_data,
            self.idx_data,
        )

        # Chain streams seamlessly
        for stream in streams:
            stream.seek(0)
            while True:
                chunk = stream.read(block_size)
                if chunk:
                    yield chunk
                else:
                    break

        # When complete, each stream position should be reset;
        #   back to the end of the stream.

    def read(self):
        """
        Read buffer out as a single stream.

        .. warning::

            Avoid using this function!

            **Why?** This is a *convenience* function; it doesn't encourage good
            memory management.

            All memory required for a mesh is duplicated, and returned as a
            single :class:`str`. So at best, using this function will double
            the memory required for a single model.

            **Instead:** Wherever possible, please use :meth:`buffer_iter`.
        """
        buffer = BytesIO()
        for chunk in self.buffer_iter():
            log.debug('buffer.write(%r)', chunk)
            buffer.write(chunk)
        buffer.seek(0)
        return buffer.read()

class UVBuffer(object):
    
    def __init__(self, max_index=0xff):
        """
        :param max_index: maximum index number, if > 65535, 4-byte integers are used
        :type max_index: :class:`long`
        """
        self.uv_data = BytesIO()  # uv positions
        

        # indices number format
        self.max_index = max_index
        

    @property
    def uv_len(self):
        """
        Number of bytes in ``uv_data`` buffer.
        """
        return self.uv_data.tell()

    @property
    def uv_offset(self):
        """
        Offset (in bytes) of the ``uv_data`` buffer.
        """
        return 0

    @property
    def uv_size(self):
        r"""
        Size of ``uv_data`` in groups of 2 floats
        (ie: number of :math:`2 \times 4` byte groups)
        
        """
        # size of position buffer, in groups of 2 floats
        return self.uv_len / (2 * 4)

   

    def __len__(self):
        return self.uv_len 

    def add_uv(self, u, v):
        """
        Add a ``VEC2` of ``floats`` to the ``uv_data`` buffer
        """
        self.uv_data.write(
            struct.pack('<f', u) +
            struct.pack('<f', v) 
        )

    def buffer_iter(self, block_size=1024):
        """
        Iterate through chunks of the vertices, and indices buffers seamlessly.

        .. note::

            To see a usage example, look at the :class:`ShapeBuffer` description.
        """
        streams = (
            self.uv_data,
        )
        #print("UVData=",self.uv_data)
        #print("UVDstreamsata=",streams)
        # Chain streams seamlessly
        for stream in streams:
            stream.seek(0)
            while True:
                chunk = stream.read(block_size)
                #print("chunk=",chunk)
                if chunk:
                    yield chunk
                else:
                    break

        # When complete, each stream position should be reset;
        #   back to the end of the stream.

    def read(self):
        """
        Read buffer out as a single stream.

        .. warning::

            Avoid using this function!

            **Why?** This is a *convenience* function; it doesn't encourage good
            memory management.

            All memory required for a mesh is duplicated, and returned as a
            single :class:`str`. So at best, using this function will double
            the memory required for a single model.

            **Instead:** Wherever possible, please use :meth:`buffer_iter`.
        """
        buffer = BytesIO()
        for chunk in self.buffer_iter():
            log.debug('buffer.write(%r)', chunk)
            buffer.write(chunk)
        buffer.seek(0)
        return buffer.read()


class TimeBuffer(object):
    
    def __init__(self, max_index=0xff):
        """
        :param max_index: maximum index number, if > 65535, 4-byte integers are used
        :type max_index: :class:`long`
        """
        self.time_data = BytesIO()  # uv positions
         # retain min/max values
        self.time_min = 1e10
        self.time_max = -1e10

        # indices number format
        self.max_index = max_index
        

    @property
    def time_len(self):
        """
        Number of bytes in ``time_data`` buffer.
        """
        return self.time_data.tell()

    @property
    def time_offset(self):
        """
        Offset (in bytes) of the ``time_data`` buffer.
        """
        return 0

    @property
    def time_size(self):
        r"""
        Size of ``time_data`` in groups of 1 float
        (ie: number of :math:`1 \times 4` byte groups)
        
        """
        # size of position buffer, in groups of 1 float
        return self.time_len / (1 * 4)

   

    def __len__(self):
        return self.time_len 

    def add_time(self, u):
        """
        Add a ``SCALAR` of ``floats`` to the ``time_data`` buffer
        """
        if self.time_len==0:
            self.time_min = u
            self.time_max = u
        else:
            if self.time_min > u:
                self.time_min = u
            if self.time_max < u:
                self.time_max = u

        self.time_data.write(
            struct.pack('<f', u) 
        )

    def buffer_iter(self, block_size=1024):
        """
        Iterate through chunks of the vertices, and indices buffers seamlessly.

        .. note::

            To see a usage example, look at the :class:`ShapeBuffer` description.
        """
        streams = (
            self.time_data,
        )
        #print("UVData=",self.uv_data)
        #print("UVDstreamsata=",streams)
        # Chain streams seamlessly
        for stream in streams:
            stream.seek(0)
            while True:
                chunk = stream.read(block_size)
                #print("chunk=",chunk)
                if chunk:
                    yield chunk
                else:
                    break

        # When complete, each stream position should be reset;
        #   back to the end of the stream.

    def read(self):
        """
        Read buffer out as a single stream.

        .. warning::

            Avoid using this function!

            **Why?** This is a *convenience* function; it doesn't encourage good
            memory management.

            All memory required for a mesh is duplicated, and returned as a
            single :class:`str`. So at best, using this function will double
            the memory required for a single model.

            **Instead:** Wherever possible, please use :meth:`buffer_iter`.
        """
        buffer = BytesIO()
        for chunk in self.buffer_iter():
            log.debug('buffer.write(%r)', chunk)
            buffer.write(chunk)
        buffer.seek(0)
        return buffer.read()

class TranslationBuffer(object):
    
    def __init__(self, max_index=0xff):
        """
        :param max_index: maximum index number, if > 65535, 4-byte integers are used
        :type max_index: :class:`long`
        """
        self.translation_data = BytesIO()  # uv positions
        self.translation_umin = 1e10
        self.translation_umax = -1e10
        self.translation_vmin = 1e10
        self.translation_vmax = -1e10
        self.translation_wmin = 1e10
        self.translation_wmax = -1e10
        # indices number format
        self.max_index = max_index
        

    @property
    def translation_len(self):
        """
        Number of bytes in ``translation_data`` buffer.
        """
        return self.translation_data.tell()

    @property
    def translation_offset(self):
        """
        Offset (in bytes) of the ``translation_data`` buffer.
        """
        return 0

    @property
    def translation_size(self):
        r"""
        Size of ``translation_data`` in groups of 3 floats
        (ie: number of :math:`3 \times 4` byte groups)
        
        """
        # size of position buffer, in groups of 3 floats
        return self.translation_len / (3 * 4)

   

    def __len__(self):
        return self.translation_len 

    def return_boundary(self):
        return ( (self.translation_umin, self.translation_vmin, self.translation_wmin), 
            (self.translation_umax, self.translation_vmax, self.translation_wmax)
        )

    def add_translation(self, u, v, w):
        """
        Add a ``VEC3` of ``floats`` to the ``translation_data`` buffer
        """
        if self.translation_len==0:
            self.translation_umin = u
            self.translation_umax = u
            self.translation_vmin = v
            self.translation_vmax = v
            self.translation_wmin = w
            self.translation_wmax = w
        else:
            if self.translation_umin > u:
                self.translation_umin = u
            if self.translation_umax < u:
                self.translation_umax = u
            if self.translation_vmin > v:
                self.translation_vmin = v
            if self.translation_vmax < v:
                self.translation_vmax = v
            if self.translation_wmin > w:
                self.translation_wmin = w
            if self.translation_wmax < w:
                self.translation_wmax = w
        #print("Translation",self.translation_len,self.translation_umin,self.translation_umax,self.translation_vmin,self.translation_vmax,self.translation_wmin,self.translation_wmax)
        self.translation_data.write(
            struct.pack('<f', u) +
            struct.pack('<f', v) +
            struct.pack('<f', w)
        )
   

    def buffer_iter(self, block_size=1024):
        """
        Iterate through chunks of the vertices, and indices buffers seamlessly.

        .. note::

            To see a usage example, look at the :class:`ShapeBuffer` description.
        """
        streams = (
            self.translation_data,
        )
        #print("UVData=",self.uv_data)
        #print("UVDstreamsata=",streams)
        # Chain streams seamlessly
        for stream in streams:
            stream.seek(0)
            while True:
                chunk = stream.read(block_size)
                #print("chunk=",chunk)
                if chunk:
                    yield chunk
                else:
                    break

        # When complete, each stream position should be reset;
        #   back to the end of the stream.

    def read(self):
        """
        Read buffer out as a single stream.

        .. warning::

            Avoid using this function!

            **Why?** This is a *convenience* function; it doesn't encourage good
            memory management.

            All memory required for a mesh is duplicated, and returned as a
            single :class:`str`. So at best, using this function will double
            the memory required for a single model.

            **Instead:** Wherever possible, please use :meth:`buffer_iter`.
        """
        buffer = BytesIO()
        for chunk in self.buffer_iter():
            log.debug('buffer.write(%r)', chunk)
            buffer.write(chunk)
        buffer.seek(0)
        return buffer.read()

class RotationBuffer(object):
    
    def __init__(self, max_index=0xff):
        """
        :param max_index: maximum index number, if > 65535, 4-byte integers are used
        :type max_index: :class:`long`
        """
        self.rotation_data = BytesIO()  # uv positions
        self.rotation_umin = 1e10
        self.rotation_umax = -1e10
        self.rotation_vmin = 1e10
        self.rotation_vmax = -1e10
        self.rotation_wmin = 1e10
        self.rotation_wmax = -1e10
        self.rotation_xmin = 1e10
        self.rotation_xmax = -1e10
        # indices number format
        self.max_index = max_index
        

    @property
    def rotation_len(self):
        """
        Number of bytes in ``rotation_data`` buffer.
        """
        return self.rotation_data.tell()

    @property
    def rotation_offset(self):
        """
        Offset (in bytes) of the ``rotation_data`` buffer.
        """
        return 0

    @property
    def rotation_size(self):
        r"""
        Size of ``rotation_data`` in groups of 4 floats
        (ie: number of :math:`4 \times 4` byte groups)
        
        """
        # size of position buffer, in groups of 3 floats
        return self.rotation_len / (4 * 4)


    def __len__(self):
        return self.rotation_len 

    def add_rotation(self, u, v, w, x):
        """
        Add a ``VEC4` of ``floats`` to the ``rotation_data`` buffer
        """
        if self.rotation_len==0:
            self.rotation_umin = u
            self.rotation_umax = u
            self.rotation_vmin = v
            self.rotation_vmax = v
            self.rotation_wmin = w
            self.rotation_wmax = w
            self.rotation_wmin = w
            self.rotation_wmax = w
            self.rotation_xmin = x
            self.rotation_xmax = x
        else:
            if self.rotation_umin > u:
                self.rotation_umin = u
            if self.rotation_umax < u:
                self.rotation_umax = u
            if self.rotation_vmin > v:
                self.rotation_vmin = v
            if self.rotation_vmax < v:
                self.rotation_vmax = v
            if self.rotation_wmin > w:
                self.rotation_wmin = w
            if self.rotation_wmax < w:
                self.rotation_wmax = w
            if self.rotation_xmin > x:
                self.rotation_xmin = x
            if self.rotation_xmax < x:
                self.rotation_xmax = x
        self.rotation_data.write(
            struct.pack('<f', u) +
            struct.pack('<f', v) +
            struct.pack('<f', w) +
            struct.pack('<f', x)
        )
  
    
    def buffer_iter(self, block_size=1024):
        """
        Iterate through chunks of the vertices, and indices buffers seamlessly.

        .. note::

            To see a usage example, look at the :class:`ShapeBuffer` description.
        """
        streams = (
            self.rotation_data,
        )
        #print("UVData=",self.uv_data)
        #print("UVDstreamsata=",streams)
        # Chain streams seamlessly
        for stream in streams:
            stream.seek(0)
            while True:
                chunk = stream.read(block_size)
                #print("chunk=",chunk)
                if chunk:
                    yield chunk
                else:
                    break

        # When complete, each stream position should be reset;
        #   back to the end of the stream.

    def read(self):
        """
        Read buffer out as a single stream.

        .. warning::

            Avoid using this function!

            **Why?** This is a *convenience* function; it doesn't encourage good
            memory management.

            All memory required for a mesh is duplicated, and returned as a
            single :class:`str`. So at best, using this function will double
            the memory required for a single model.

            **Instead:** Wherever possible, please use :meth:`buffer_iter`.
        """
        buffer = BytesIO()
        for chunk in self.buffer_iter():
            log.debug('buffer.write(%r)', chunk)
            buffer.write(chunk)
        buffer.seek(0)
        return buffer.read()

def isTessellatable(shape) :        
   
    try:
        topologyExplorer = Topo(shape,ignore_orientation=False)
        faceiterator = topologyExplorer.faces()
    except Exception as e:
        print("Tessllation Error:", e) 
        return False 

     
    list_of_faces = list(faceiterator)
        
    if(len(list_of_faces) > 0):
        #print("I have reached here 0")
        BRepMesh_IncrementalMesh(shape, 0.2, True, 1)
        #print("I have ok reached here 1")
        offset = 0
        bt = BRep_Tool()
        
        facecount = 0
        
        for face in list_of_faces:  
            facecount+=1
            location = TopLoc_Location()
            facing = (bt.Triangulation(face, location))
            if facing:
                
                #print(reverse,face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED,fill=="Hole",fill)
                #print(reverse,face,location)
                vert = facing.Nodes()
                tri = facing.Triangles()
                if( (len(tri)>0) and (len(vert)>0) ):
                    return True
                             
                                    
                offset += facing.NbNodes()
            else:
                print("No facing info for", face)
        
    else:
        print("No faces for the shape",shape)
    
    
    return False  

class StepExportWithColor(object):
    '''
    STEP export that support layers & colors
    '''
    gltf_dict = gltfdict()
    
    def __init__(self, shape=None, color=None, name=None): 
        if(shape):
            # Create the application
            self.app = XCAFApp_Application_GetApplication()
            self.doc = TDocStd_Document(TCollection_ExtendedString("XmlOcaf"))
            self.app.InitDocument(self.doc)
            self.shapetool =  XCAFDoc_DocumentTool_ShapeTool(self.doc.Main())  
            self.shapetool.SetAutoNaming(False)              
            self.colortool = XCAFDoc_DocumentTool_ColorTool(self.doc.Main())
            # add root    
            if name is None:
                name =  "Struct Assembly"  
            self.assembly = self.shapetool.NewShape()
            TDataStd_Name.Set(self.assembly, TCollection_ExtendedString(name))        
            self.part = self.shapetool.NewShape()
            comp = TopoDS_Compound()
            comp_builder = TopoDS_Builder()
            comp_builder.MakeCompound(comp)        
            comp_builder.Add(comp, shape)
            self.shapetool.SetShape(self.part,comp) 
            TDataStd_Name.Set(self.part, TCollection_ExtendedString(f"{name}_part"))
            if color:
                self.colortool.SetColor(self.part,color,XCAFDoc_ColorType.XCAFDoc_ColorSurf) 
            #self.subassembly = self.shapetool.NewShape()
            #TDataStd_Name.Set(self.subassembly, TCollection_ExtendedString(name))        
            #self.shapetool.AddComponent( self.subassembly,self.part,TopLoc_Location())
            #self.shapetool.AddComponent( self.assembly, self.subassembly,TopLoc_Location())  
            self.shapetool.AddComponent( self.assembly, self.part,TopLoc_Location())  
            self.shapetool.UpdateAssemblies()
        
    def write_file(self, filename):
        """ folder, fname = os.path.split(filename)
        name, ext = os.path.splitext(fname)
        ext = ext[1:] if ext[0] == "." else ext """

        session = XSControl_WorkSession()
        writer = STEPCAFControl_Writer(session, False)
        writer.SetColorMode(True)
        writer.SetLayerMode(True)
        writer.SetNameMode(True)
        writer.Transfer(self.doc, STEPControl_AsIs)

        status = writer.Write(filename)

        return status == IFSelect_RetDone
        """ #self.app = XCAFApp_Application_GetApplication()
        store = XmlDrivers_DocumentStorageDriver(
            TCollection_ExtendedString("Copyright: Open Cascade, 2001-2002")
        )
        ret = XmlDrivers_DocumentRetrievalDriver()
        
        self.app.DefineFormat(
            TCollection_AsciiString("XmlOcaf"),
            TCollection_AsciiString("Xml XCAF Document"),
            TCollection_AsciiString(ext),
            ret,
            store,
        )
        self.doc.SetRequestedFolder(TCollection_ExtendedString(folder))
        self.doc.SetRequestedName(TCollection_ExtendedString(name))
        status = self.app.SaveAs(self.doc, TCollection_ExtendedString(filename))
        self.app.Close(self.doc)
        return status == PCDM_StoreStatus.PCDM_SS_OK  """ 
    def tessellate(self, shape) :
        
        vertices = []
        triangles = []
        try:
            topologyExplorer = Topo(shape,ignore_orientation=False)
        except Exception as e:
            print("Tessllation Error:", e) 
            return False 
       
        faceiterator = topologyExplorer.faces() 
        list_of_faces = list(faceiterator)
          
        if(len(list_of_faces) > 0):
            #print("I have reached here 0")
            BRepMesh_IncrementalMesh(shape, self.distancegap, True, self.anglegap)
            #print("I have ok reached here 1")
            offset = 0
            bt = BRep_Tool()
            
            facecount = 0
            
            for face in list_of_faces:  
                facecount+=1
                #fill, _, _ = recognize_direction(face)  
                fill = "Hole" if (face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) else "Solid"
               
                #print(facecount, face)     
                
                location = TopLoc_Location()
                facing = (bt.Triangulation(face, location))
                if facing:
                    Trsf = location.Transformation()
                    reverse = (
                        True
                        if (face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) or (fill=="Hole")
                        else False
                    )
                    #print(reverse,face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED,fill=="Hole",fill)
                    #print(reverse,face,location)
                    vert = facing.Nodes()
                    tri = facing.Triangles()
                    
                    
                    # add vertices
                    vertices += [
                        (v.X(),v.Y(),v.Z()) 
                        for v in (v.Transformed(Trsf) for v in vert)
                    ]
                    #print(offset,len(vert))
                    #length_vert = len(vert)
                            
                    # add triangles
                    triangles += [
                        (
                            t.Value(1) + offset - 1,
                            t.Value(3) + offset - 1,
                            t.Value(2) + offset - 1,
                        )
                        if reverse
                        else (
                            t.Value(1) + offset - 1,
                            t.Value(2) + offset - 1,
                            t.Value(3) + offset - 1,
                        )
                        for t in tri
                    ]                
                                       
                    offset += facing.NbNodes()
                else:
                    print("No facing info for", face)
            
        else:
            print("No faces for the shape",shape)
        
        
        return (vertices, triangles) 

    def findSubShapeName(self,myParent,myTree):
        for aTree in myTree:
            if aTree[self.gltf_dict['id']]==myParent :
                thisParent  = aTree[self.gltf_dict['parentId']]
                if thisParent == 1:
                    return aTree[self.gltf_dict['name']]
                if thisParent:
                    return self.findSubShapeName(thisParent,myTree)
                else:
                    return "NoParent"
        return "NoParent"

    def findAssemblyShapeName(self,myParent,myTree):
        for aTree in myTree:
            if aTree[self.gltf_dict['id']]==myParent :             
                return aTree[self.gltf_dict['name']]      
        return "NoParent"

    def findMyShapeByTreeID(self,shapes,treeID):
        #print ("outside loop",shapes,len(shapes.items()))
        for hash_shape, item in shapes.items():
            #print("Inside loop",item)
            [shape_to_disp, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, (uvPlane, solidfound, buff, uvbuff)] = item
            if myId == treeID:
                return item
        return None
    
    def getShapesFromOutPutShapes(self,shapes,myParent,mytree,treeLength):
        assemblyCount, myAssemblies, myAssemblyName  = self.GetFirstLevelAssemblyOutPutShapesForOrder(shapes,myParent,mytree,treeLength)
        retshapes=[]
        onlyshapes=[]
        if (myAssemblies is None) or (assemblyCount==0):
            myAssemblies = []
        R,G,B=0.3,0.32,0.37
        for (aShape, aName, aR, aG, aB) in myAssemblies:
            if aShape:
                onlyshapes.append(aShape)
                retshapes.append((aShape,aName,Quantity_Color(aR,aG,aB,Quantity_TOC_RGB)))
                R,G,B=aR,aG,aB
        return (retshapes,onlyshapes,myAssemblies,myAssemblyName,(R,G,B))

    def writeStatus(self,basefilename,displaypath,percentage,starttime,createdirectory):
        currenttime = datetime.utcnow()  
        mystatusdict =  {
                "percent":(percentage),
                "start":starttime.strftime("%H-%M-%S"),
                "current":currenttime.strftime("%H-%M-%S") }
        statusfilename = displaypath+basefilename+".status" 
        try:   
            if(createdirectory):
                os.makedirs(os.path.dirname(statusfilename), exist_ok=True)
            print("Writing",statusfilename,"Percentage",percentage) 
            with open(statusfilename, 'w') as fh:
                fh.write(json.dumps(mystatusdict, sort_keys=True, indent=2 ))            
        except Exception as e:
            print("Error while wrting",statusfilename,e)
        return mystatusdict


    def getShapesFromOutPutShapes_old(self,shapes,myParent,mytree,treeLength):
        retshapes=[]
        subshapes=[]
        onlyshapes=[]
        retcoloredshapes=[]
        subshapesStarted = False
        subShapeName = ''
        subShapeColor=None
        for aTree in mytree:
            myTreeID = aTree[self.gltf_dict['id']]
            item = self.findMyShapeByTreeID(shapes,myTreeID) 
            myTreeParent = aTree[self.gltf_dict['parentId']]
            if(myTreeParent==myParent):
                if(len(subshapes)>0):
                    if(len(subshapes)>1):
                        mergedshape,_ =  list_of_shapes_to_compound(subshapes)
                    else:
                        mergedshape = subshapes[0]
                    retshapes.append((mergedshape,subShapeName,subShapeColor))
                    onlyshapes.append(mergedshape)
                    red = 0
                    green = 0
                    blue = 0
                    if subShapeColor:
                        red = subShapeColor.Red()
                        green = subShapeColor.Green()
                        blue = subShapeColor.Blue()
                    retcoloredshapes.append((mergedshape,subShapeName,red,green,blue))
                    subshapes=[]
                    subshapesStarted=False
                    subShapeName=''
                    subShapeColor=None 
            if item != None:
                [shape_to_disp, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, (uvPlane, solidfound, buff, uvbuff)] = item
                #print(shape_to_disp, subName, subEntry, c, myId, myParent )
                if (subshapesStarted == False) :
                    if myTreeParent == myParent:
                        myParentName = subName
                    else:
                        myParentName = self.findSubShapeName(myParent,mytree)
                    if ((subShapeName == '') and (myParentName != '')) :
                        subShapeName=myParentName 
                        subshapesStarted=True
                subShapeColor=c
                subshapes.append(shape_to_disp)
        if(len(subshapes)>0):
            #mergedshape,_ =  list_of_shapes_to_compound(subshapes)
            if(len(subshapes)>1):
                mergedshape,_ =  list_of_shapes_to_compound(subshapes)
            else:
                mergedshape = subshapes[0]
            retshapes.append((mergedshape,subShapeName,subShapeColor))   
            onlyshapes.append(mergedshape) 
            red = 0
            green = 0
            blue = 0
            if subShapeColor:
                red = subShapeColor.Red()
                green = subShapeColor.Green()
                blue = subShapeColor.Blue()
            retcoloredshapes.append((mergedshape,subShapeName,red,green,blue))
        #print(retshapes,onlyshapes)
        return (retshapes,onlyshapes,retcoloredshapes,self.findAssemblyShapeName(myParent,mytree))
    
    def GetSelfAndTreeFromOutputShapes(self,assembly,aTree,shapes,myTree,treeLength):
        treeID = aTree[self.gltf_dict['id']]
        treeName = aTree[self.gltf_dict['name']]
        treeDisplay =  aTree[self.gltf_dict['display']]
        treeName = '' if (treeName is None) else treeName.strip()
        treeDisplay = '' if (treeDisplay is None) else treeDisplay.strip()
        if treeName == '':
            treeName =  "Struct Part " + str(treeID)
        if treeDisplay=='':
            treeDisplay=treeName
        if  aTree[self.gltf_dict['leaf']]==True:
            #print("Finding a shape",treeName,aTree)
            item = self.findMyShapeByTreeID(shapes,treeID)
            if item != None:
                [shape, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, (uvPlane, solidfound, buff, uvbuff)] = item
            else:
                shape=None
            if(shape):
                R=aTree[self.gltf_dict['R']]
                G=aTree[self.gltf_dict['G']]
                B=aTree[self.gltf_dict['B']]
                c=Quantity_Color(R,G,B,Quantity_TOC_RGB)
                part = self.shapetool.NewShape()
                comp = TopoDS_Compound()
                comp_builder = TopoDS_Builder()
                comp_builder.MakeCompound(comp)        
                comp_builder.Add(comp, shape)
                self.shapetool.SetShape(part,comp) 
                TDataStd_Name.Set(part, TCollection_ExtendedString(treeDisplay))
                #print("Adding a shape",treeName,aTree)
                self.colortool.SetColor(part,c,XCAFDoc_ColorType.XCAFDoc_ColorSurf) 
                self.shapetool.AddComponent(assembly, part,TopLoc_Location())  
                self.shapetool.UpdateAssemblies()
        else:     
            #print("Recursing a shape",treeName,aTree)      
            subassembly=self.GetAssemblyOutPutShapes(treeID,myTree,shapes,treeName,treeLength)
            self.shapetool.AddComponent(assembly, subassembly,TopLoc_Location())  
            self.shapetool.UpdateAssemblies()

    def GetAssemblyOutPutShapes(self,myParent,myTree,shapes,name,treeLength):        
        assembly = self.shapetool.NewShape()
        if name is None:
            name =  "Struct Assembly "+str(myParent)
        TDataStd_Name.Set(assembly, TCollection_ExtendedString(name))      
        lengthCheck=0
        for aTree in myTree:
            if aTree[self.gltf_dict['parentId']]==myParent : 
                self.GetSelfAndTreeFromOutputShapes(assembly,aTree,shapes,myTree,treeLength)
            lengthCheck+=1
            if lengthCheck >=treeLength:
                break
        return assembly

    def WriteAssemblyOutPutShapes(self,shapes,filename,myParent,myTree,treeLength,\
        includeparts,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight, \
            logging, seperateparts,edgesize, vertexsize, maximumfacestoinclude):
        name = None
        lengthCheck = 0
        #print("Passed",myTree)
        for aTree in myTree:
            #print("My aTree",aTree)
            if aTree[self.gltf_dict['id']]==myParent :
                name=aTree[self.gltf_dict['name']]
                if name is None:
                    name =  "Struct Assembly "+str(myParent)
                break
            lengthCheck+=1
            if lengthCheck >=treeLength:
                break
        addedAssembly = 0
        assemblyCount=0
        if name:
            lengthCheck = 0
            myParentId=myParent
            for aTree in myTree:
                if aTree[self.gltf_dict['parentId']]==myParent : 
                    myParentId = aTree[self.gltf_dict['id']]
                    assemblyCount +=1
                    if assemblyCount > 1:
                        break
                lengthCheck+=1
                if lengthCheck >=treeLength:
                    break
            if assemblyCount>1:
                myParentId=myParent
            elif assemblyCount==1:
                assemblyCount=0
                lengthCheck = 0
                for aTree in myTree:
                    if aTree[self.gltf_dict['parentId']]==myParentId : 
                        assemblyCount +=1
                        break
                    lengthCheck+=1
                    if lengthCheck >=treeLength:
                        break
                if assemblyCount == 0:
                    #myParentId = myParent
                    assemblyCount=1

        if (name) and (assemblyCount>=1):
            assemblyNames = []
            lengthCheck = 0
            for aTree in myTree:
                if aTree[self.gltf_dict['parentId']]==myParentId :                     
                    self.app = XCAFApp_Application_GetApplication()
                    self.doc = TDocStd_Document(TCollection_ExtendedString("XmlOcaf"))
                    self.app.InitDocument(self.doc)
                    self.shapetool =  XCAFDoc_DocumentTool_ShapeTool(self.doc.Main())  
                    self.shapetool.SetAutoNaming(False)              
                    self.colortool = XCAFDoc_DocumentTool_ColorTool(self.doc.Main())
                    assembly = self.shapetool.NewShape()
                    TDataStd_Name.Set(assembly, TCollection_ExtendedString(name))
                    treeID = aTree[self.gltf_dict['id']]
                    treeName = aTree[self.gltf_dict['name']]
                    #print("Getting a shape",treeName,aTree)
                    self.GetSelfAndTreeFromOutputShapes(assembly,aTree,shapes,myTree,treeLength)
                    uuidname = str(uuid.uuid4())
                    uniquename=filename+" "+str(treeID)
                    addedAssembly+=1
                    fullpath = 'Media/'+uuidname+'/'+uniquename+".step"
                    os.makedirs(os.path.dirname(fullpath), exist_ok=True)
                    if(self.write_file(fullpath)):  
                        #print("Assigning a shape",uuidname,uniquename,treeName,aTree)                    
                        assemblyNames.append((uuidname,uniquename,treeName))
                        StepIgesAnalyser(filename=fullpath,includeparts=includeparts,\
                            distancegap=distancegap,anglegap=anglegap,disectparts=disectparts,\
                                moverotate=moverotate,thumbwidth=thumbwidth,thumbheight=thumbheight,\
                                    logging=logging,seperateparts=seperateparts, edgesize=edgesize,\
                                        vertexsize=vertexsize,maximumfacestoinclude=maximumfacestoinclude).dump(False) 
                                        #in thread background thumbnail creation is not working Hence forcing dump to be thread free.
                lengthCheck+=1
                if lengthCheck >=treeLength:
                    break
            return  (addedAssembly,assemblyNames) 
        return (addedAssembly,None)

    def GetFirstLevelSelfAndTreeFromOutputShapes(self,aTree,shapes,myTree,treeLength):
        treeID = aTree[self.gltf_dict['id']]
        treeName = aTree[self.gltf_dict['name']]
        treeDisplay =  aTree[self.gltf_dict['display']]
        treeName = '' if (treeName is None) else treeName.strip()
        treeDisplay = '' if (treeDisplay is None) else treeDisplay.strip()
        if treeName == '':
            treeName =  "Struct Part " + str(treeID)
        if treeDisplay=='':
            treeDisplay=treeName
        if  aTree[self.gltf_dict['leaf']]==True:
            #print("Finding a shape",treeName,aTree)
            item = self.findMyShapeByTreeID(shapes,treeID)
            if item != None:
                [shape, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, (uvPlane, solidfound, buff, uvbuff)] = item
            else:
                shape=None
            R=aTree[self.gltf_dict['R']]
            G=aTree[self.gltf_dict['G']]
            B=aTree[self.gltf_dict['B']]
                #c=Quantity_Color(R,G,B,Quantity_TOC_RGB)
            return (shape,treeDisplay,R,G,B)
        else:     
            #print("Recursing a shape",treeName,aTree)      
            subassembly=self.GetFirstLevelAssemblyOutPutShapes(treeID,myTree,shapes,treeName,treeLength)
            return subassembly

    def GetFirstLevelAssemblyOutPutShapes(self,myParent,myTree,shapes,name,treeLength): 
        comp = TopoDS_Compound()
        comp_builder = TopoDS_Builder()
        comp_builder.MakeCompound(comp)        
        if name is None:
            name =  "Struct Assembly "+str(myParent)
        R,G,B=0.3,0.32,0.37
        lengthCheck=0
        oneItemAdded = 0
        for aTree in myTree:
            if aTree[self.gltf_dict['parentId']]==myParent : 
                (shape, treeDisplay, R_, G_, B_) =  self.GetFirstLevelSelfAndTreeFromOutputShapes(aTree,shapes,myTree,treeLength)
                if shape:
                    comp_builder.Add(comp, shape)
                    oneItemAdded+=1
                    R,G,B=R_,G_,B_
            lengthCheck+=1
            if lengthCheck >=treeLength:
                break
        if oneItemAdded>0:
            return (comp, treeDisplay, R, G, B)
        else:
            return (None, treeDisplay, R, G, B)

    def GetFirstLevelAssemblyOutPutShapesForOrder(self,shapes,myParent,myTree,treeLength):
        name = None
        lengthCheck = 0
        #print("Passed",myTree)
        for aTree in myTree:
            #print("My aTree",aTree)
            if aTree[self.gltf_dict['id']]==myParent :
                name=aTree[self.gltf_dict['name']]
                if name is None:
                    name =  "Struct Assembly "+str(myParent)
                break
            lengthCheck+=1
            if lengthCheck >=treeLength:
                break
        addedAssembly = 0
        assemblyCount=0
        if name:
            lengthCheck = 0
            myParentId=myParent
            for aTree in myTree:
                if aTree[self.gltf_dict['parentId']]==myParent : 
                    myParentId = aTree[self.gltf_dict['id']]
                    assemblyCount +=1
                    if assemblyCount > 1:
                        break
                lengthCheck+=1
                if lengthCheck >=treeLength:
                    break
            if assemblyCount>1:
                myParentId=myParent
            elif assemblyCount==1:
                assemblyCount=0
                lengthCheck = 0
                for aTree in myTree:
                    if aTree[self.gltf_dict['parentId']]==myParentId : 
                        assemblyCount +=1
                        break
                    lengthCheck+=1
                    if lengthCheck >=treeLength:
                        break
                if assemblyCount == 0:
                    myParentId = myParent
                    assemblyCount=1
        if (name) and (assemblyCount>=1):
            firstLevelAssemblies = []
            lengthCheck = 0
            for aTree in myTree:
                if aTree[self.gltf_dict['parentId']]==myParentId :   
                    (shape, treeDisplay, R, G, B) = self.GetFirstLevelSelfAndTreeFromOutputShapes(aTree,shapes,myTree,treeLength)
                    if shape:
                        firstLevelAssemblies.append((shape, treeDisplay, R, G, B)) 
                        addedAssembly+=1
                lengthCheck+=1
                if lengthCheck >=treeLength:
                    break
            return  addedAssembly,firstLevelAssemblies,name
        return addedAssembly,None,name

class StepIgesAnalyser():
    """A class that analyzes the structure of an OCAF document."""
    scale = 0.001  # mm to meters
    __version__ = "3.7.4"   
    gltf_Dict = gltfdict()

    """ gltf_Dict = {
            "id":"i",
            "parentId":"p",
            "step":"s",
            "name":"n", 
            "topLeft" : "t",
            "bottomRight" : "b",
            "indent": "d", 
            "leaf":"l",
            "R":"R",
            "G":"G",
            "B":"B",
            "A":"A",
            "texture":"T",
            "metallicFactor":"m",
            "roughnessFactor":"r",
            "structures" : "S",  
            "bin":"I",  
            "display":"D",
            "subfeatures":"f",
            "element":"e"    
            } """

    TEMPLATE = {
        # Static values
        "asset": {
            "generator": "structparts_%s" % __version__,
            "version": "2.0"  # glTF version
        },
        "scene": 0,

        # Populated by adding parts
        "scenes": [{"nodes": [0]}],
        #"download" : "",
        "nodes": [
            {
                "children": [],  # will be appended to before writing to file
                # scene rotation to suit glTF coordinate system
                "matrix": [
                    1.0 * scale, 0.0, 0.0, 0.0,
                    0.0, 0.0,-1.0 * scale, 0.0,
                    0.0, 1.0 * scale, 0.0, 0.0,
                    0.0, 0.0, 0.0, 1.0,
                ],
            },
        ],
        "meshes": [],
        "accessors": [],
        "materials": [],
        "bufferViews": [],
        "buffers": []
    }
    
    # glTF matrix is column major; needs to be tranposed
                
    transformed_matrix = {
        'matrix': [
            1.0,0.0,0.0,0.0,
            0.0,1.0,0.0,0.0,
            0.0,0.0,1.0,0.0,
            0.0,0.0,0.0,1.0]}

    default_material = {
        "alphaCutoff":1.0,
        "alphaMode":"BLEND",
        "pbrMetallicRoughness":{
            "baseColorFactor":[0.3,0.32,0.37,1.0],
            "metallicFactor":0.1,
            "roughnessFactor":0.7
            }
        }
    def __init__(
        self, document=None, filename=None, shapeslist=None, includeparts=False, ascompound=False, 
        distancegap=0.1, anglegap=0.5, disectparts=False, moverotate=0, edgesize=0.3, vertexsize=1.0, 
        maximumfacestoinclude=48, animations=None, delay=1.0, shapeorder=[], kinematicanimation=None,
        thumbheight=96, thumbwidth=96, multipleGLTF=1200, addfeaturesThread=False, suffixname='',
        writethread=False, writepickle=True, writefiles=True, logging=None,
        includeUV=False, traversesubshapes=False, writeStep=False, writeColorStep=False, 
        defaultR=0.3,defaultG=0.32,defaultB=0.37,seperateparts=False,seperatecompounds=True,
        recursiveShapes=None,recursiveTree=None,recursiveID=1,AutoAssemblyOrder=False,
        explodegap=10.0,center=True,holescale=0.77,removegap=8.0,recreatefororder=False):
        """Supply one or the other: document or STEP filename or Shapes."""
        self.starttime = datetime.utcnow()
        self.percentage = 0
        self.byThread=False
        #self.write_status()
        self.uid = 1
        self.indent = 0
        self.uniqueid = 0
        self.parentIDs=[]
        self.childfiles=[]
        self.output = ""
        #self.tree = ""
        self._share_dict = {'0:1:1': 0} 
        self.fname = filename
        self.moverotate = moverotate
        self.createFiles = (moverotate==0)
        self.edgeGapStr = str(math.trunc(edgesize*10))
        self.writefiles = writefiles
        self.logging = logging
        self.addfeaturesThread = addfeaturesThread
        self.maximumfacestoinclude=maximumfacestoinclude
        self.seperateparts = seperateparts
        self.seperatecompounds = seperatecompounds
        self.recursiveShapes = recursiveShapes
        self.explodegap = explodegap 
        self.center = center 
        self.holescale = holescale   
        if holescale <= 0:
            self.holescale=1.0
        if self.holescale < 1.0 :
            self.onebyholescale = 1/self.holescale
        else:
            self.onebyholescale = self.holescale
        self.removegap = removegap
        self.recreatefororder = recreatefororder
        self.AutoAssemblyOrder = AutoAssemblyOrder
        try:
            self.commonpipe = BRepPrimAPI_MakeBox(gp_Pnt(0,0,0),0.1,0.1,0.1).Shape()
            self.commoncompound, _ = list_of_shapes_to_compound(self.commonpipe)
        except Exception as e:
            self.commonpipe = None
            self.commoncompound = None
        #print("I m initializing")
        if filename:
            head, tail = os.path.split(self.fname)
            if(head[:-1]!="/"):
                #print("Head does not contain last /",head)
                head = head + "/"
            #else:
            #    #print("Head contains last /",head)
            #    #pass
            MediaURLLength = len(MEDIA_URL)
            if head[0:MediaURLLength]==MEDIA_URL:
                self.displaypath = DISPLAY_URL+head[MediaURLLength:]
            else:
                self.displaypath = head
            print("Conversion path",self.displaypath)
            pathfilename, file_extension = os.path.splitext(tail)
            if file_extension:
                file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
                file_extension_lower = file_extension.lower()
            else:
                file_extension_lower = "stp"
            #self.fileextension=self.fname
            self.stepiges = (file_extension_lower) == "stp" or (file_extension_lower == "step")
            self.suffixname = suffixname
            if (animations!=None and len(animations) > 0) or ((suffixname=="M") or (suffixname=="S")):
                if (shapeorder!=None and len(shapeorder) > 0) or (suffixname=="M"):
                    self.basefilename = pathfilename+"M"+self.edgeGapStr
                    self.suffixname = "M"
                else:    
                    self.basefilename = pathfilename+"S"+self.edgeGapStr
                    self.suffixname = "S"
                self.writethread = False
            elif (kinematicanimation!=None) or (suffixname=="K"):
                self.basefilename = pathfilename+"K"+self.edgeGapStr
                self.writethread = False
                self.suffixname = "K"
            else:
                self.basefilename = pathfilename+self.edgeGapStr
                self.writethread = writethread
            if (ascompound) and (suffixname==''):
                self.basefilename = self.basefilename + "A" 
                self.writethread = False
                self.suffixname = "A"
        else:
            self.basefilename = "./"
            self.fname = "NoName"
            self.stepiges=True
            self.writethread = writethread
            self.displaypath= DISPLAY_URL
        self.progressfile = self.displaypath+pathfilename+".progress"
        #print(self.fname,self.basefilename)
        self.kinematicanimation=kinematicanimation
        self.includeparts = includeparts
        self.ascompound = ascompound
        if self.includeparts:
            self.fileprefix = "I"
        else:
            self.fileprefix = "H"
        self.disectparts = disectparts        
        self.distancegap = distancegap
        self.anglegap = anglegap
        self.edgesize = edgesize
        self.vertexsize = vertexsize
        self.direntry = ""
        self.mstep_dict = deepcopy(self.TEMPLATE)
        self.tstep_dict = {'tree':[]}
        self.prevParent = None
        self.scene_min = None
        self.scene_max = None
        self.validFilenameChars = "-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        self.shapeslist = None
        self.defaultColor = Quantity_Color(defaultR,defaultG,defaultB, Quantity_TOC_RGB)
        self.animations = animations
        self.delay = delay
        self.shapeorder = shapeorder
        self.thumbheight = thumbheight
        self.thumbwidth = thumbwidth     
        self.multiplegltf = multipleGLTF 
        if (self.edgesize == 0) and (self.vertexsize==0):
            self.writeStep = False
            self.writeColorStep = False
            self.writepickle = False
            self.traversesubshapes = False
            self.includeUV = False
        else:
            self.writeStep = writeStep
            self.writeColorStep = writeColorStep
            self.writepickle = writepickle
            self.traversesubshapes = traversesubshapes
            self.includeUV = includeUV
        try:
            if shapeslist:
                #print("shapes",shapeslist)
                self.shapeslist = shapeslist
            elif recursiveShapes:
                self.recursiveShapes = recursiveShapes
                self.recursiveTree = recursiveTree
                self.recursiveID = recursiveID
            elif filename:
                #print("shapres",shapeslist)
                self.doc = self.read_file(filename)
            elif document:
                self.doc = document
                self.shape_tool = XCAFDoc_DocumentTool_ShapeTool(self.doc.Main())
                self.color_tool = XCAFDoc_DocumentTool_ColorTool(self.doc.Main())
            else:
                print("Supply one or the other: document, STEP/IGES/STL/BREP filename, Shapes or recursive Shapes.")
        except Exception as e:
            print("Error1:", e)
        finally:
            self.endtime = datetime.utcnow()
            print("Reading Start",self.starttime.strftime("%H-%M-%S"))  
            print("Reading End",self.endtime.strftime("%H-%M-%S"))    
    def read_file(self, fname):
        """Read STEP file and return <TDocStd_Document>."""

        # Create the application, empty document and shape_tool
        if self.stepiges:
            doc = TDocStd_Document(TCollection_ExtendedString("STEP"))
        else:
            doc = TDocStd_Document(TCollection_ExtendedString("IGES"))
        app = XCAFApp_Application_GetApplication()
        app.NewDocument(TCollection_ExtendedString("MDTV-XCAF"), doc)
        self.shape_tool = XCAFDoc_DocumentTool_ShapeTool(doc.Main())
        self.color_tool = XCAFDoc_DocumentTool_ColorTool(doc.Main())
        self.shape_tool.SetAutoNaming(True)

        # Read file and return populated doc
        if self.stepiges:
            file_reader = STEPCAFControl_Reader()
        else:
            file_reader = IGESCAFControl_Reader()
        file_reader.SetColorMode(True)
        file_reader.SetLayerMode(True)
        file_reader.SetNameMode(True)
        if self.stepiges:
            file_reader.SetMatMode(True)
        status = file_reader.ReadFile(fname)
        if status == IFSelect_RetDone:
            file_reader.Transfer(doc)
        return doc
    
    def CreateSphereFromVertex(self, vertex,circular=False):
        brt = BRep_Tool()
        center = brt.Pnt(topods_Vertex(vertex))
        if circular:
            return BRepPrimAPI_MakeSphere(center, self.vertexsize).Shape(), [(center.X(), center.Y(), center.Z())]
        else:
            corner = gp_Pnt(center.X()-self.vertexsize, center.Y()-self.vertexsize, center.Z()-self.vertexsize)
            return BRepPrimAPI_MakeBox(corner,self.vertexsize*2,self.vertexsize*2,self.vertexsize*2).Shape(), [(center.X(), center.Y(), center.Z())]
   

    def createPipeFromPoints(self, point1, point2,circular=False):
        makeWire = BRepBuilderAPI_MakeWire()
        edge = BRepBuilderAPI_MakeEdge(point1, point2).Edge()
        makeWire.Add(edge)
        makeWire.Build()
        wire = makeWire.Wire()
        if circular:
            dir = gp_Dir(point2.X() - point1.X(), point2.Y() - point1.Y(), point2.Z() - point1.Z())
            circle = gp_Circ(gp_Ax2(point1,dir), self.edgesize)
            profile_edge = BRepBuilderAPI_MakeEdge(circle).Edge()
            profile_wire = BRepBuilderAPI_MakeWire(profile_edge).Wire()
            profile_face = BRepBuilderAPI_MakeFace(profile_wire).Face()
        else:
            xdist,ydist,zdist = abs(point2.X() - point1.X()), abs(point2.Y() - point1.Y()), abs(point2.Z() - point1.Z())
            if(zdist>xdist) and (zdist>ydist): #XYPlane
                p1 = gp_Pnt(point1.X()-self.edgesize,point1.Y()-self.edgesize, point1.Z())
                p2 = gp_Pnt(point1.X()-self.edgesize,point1.Y()+self.edgesize, point1.Z())
                p3 = gp_Pnt(point1.X()+self.edgesize,point1.Y()+self.edgesize, point1.Z())
                p4 = gp_Pnt(point1.X()+self.edgesize,point1.Y()-self.edgesize, point1.Z())
            elif (ydist>zdist) and (ydist>xdist): #XZPlane
                p1 = gp_Pnt(point1.X()-self.edgesize,point1.Y(), point1.Z()-self.edgesize)
                p2 = gp_Pnt(point1.X()-self.edgesize,point1.Y(), point1.Z()+self.edgesize)
                p3 = gp_Pnt(point1.X()+self.edgesize,point1.Y(), point1.Z()+self.edgesize)
                p4 = gp_Pnt(point1.X()+self.edgesize,point1.Y(), point1.Z()-self.edgesize)
            else:
                p1 = gp_Pnt(point1.X(),point1.Y()-self.edgesize, point1.Z()-self.edgesize)
                p2 = gp_Pnt(point1.X(),point1.Y()+self.edgesize, point1.Z()-self.edgesize)
                p3 = gp_Pnt(point1.X(),point1.Y()+self.edgesize, point1.Z()+self.edgesize)
                p4 = gp_Pnt(point1.X(),point1.Y()-self.edgesize, point1.Z()+self.edgesize)
            #print(p1x,p1y,p1z,p2x,p2y,p2z,p3x,p3y,p3z,p4x,p4y,p4z)
            poly = BRepBuilderAPI_MakePolygon(p1, p2, p3, p4, True).Wire()
            profile_face = BRepBuilderAPI_MakeFace(poly).Face()            
        return BRepOffsetAPI_MakePipe(wire, profile_face).Shape()
    
    def createPipesFromEdge(self,anEdge,circular=False):
        curve = BRepAdaptor_Curve(anEdge)
        firstU = curve.FirstParameter()
        lastU = curve.LastParameter()
        
        ranges = lastU-firstU
        if ranges < 0:
            firstU = curve.LastParameter()
            lastU = curve.FirstParameter()
            ranges = -ranges
       
        if recognize_by_threejs(curve):
            length = 1
        else:
            length = ranges+1
            """ try:
                #gProp = GProp_GProps()  
                #liner = brepgprop_LinearProperties(curve, gProp)
                #length = liner.Mass()
                length = GCPnts_AbscissaPoint().Length(curve, firstU, lastU, self.distancegap)
            except Exception as e:
                print("Unable to find length of the curve",e) """
            if curve.GetType() == GeomAbs_Circle:
                entity_circle = get_circle_info(curve)   
                radius = entity_circle["radius"] 
                if radius > 12:
                    radius = 12                          
                length = length * radius * 0.08 / self.distancegap 
                #print(entity_circle,length)
            else:
                length = (length/self.distancegap)
            length = round(length)
            if length<=0:
                length = 1
        pipes=[]
        edgePoints=[]
        currentP = curve.Value(firstU)
        edgePoints.append((currentP.X(),currentP.Y(),currentP.Z()))
        for eachP in range(length): 
            if eachP==length-1:
                nextP = curve.Value(lastU)
            else:            
                nextP = curve.Value(firstU+(ranges*(eachP+1)/(length)))
            if (currentP.SquareDistance(nextP) >= self.distancegap): # or (length==1):
                edgePoints.append((nextP.X(),nextP.Y(),nextP.Z()))
                """ aPipe = self.createPipeFromPoints(currentP, nextP, circular)
                if aPipe:
                    pipes.append(aPipe)
                    currentP = nextP """
            else:
                if eachP==length-1:
                    edgePoints.append((nextP.X(),nextP.Y(),nextP.Z()))
        if(len(pipes)>0):
            compound, _ = list_of_shapes_to_compound(pipes)
            #if (anEdge.Orientation() == TopAbs_Orientation.TopAbs_REVERSED):
            #    if compound:
            #        return compound.Reverse()
            #    else:
            #        return None
            #else:
            #    return compound
            return compound, edgePoints
        else:
            #print("NO edges found",firstU,lastU)
            if circular:
                pipes =  [BRepPrimAPI_MakeSphere(currentP, 0.1).Shape()]
                compound, _ = list_of_shapes_to_compound(pipes)
            else:
                if self.commoncompound:
                    compound = self.commoncompound 
                else: 
                    pipes = [self.commonpipe] if self.commonpipe else [BRepPrimAPI_MakeBox(currentP,0.1,0.1,0.1).Shape()]
                    compound, _ = list_of_shapes_to_compound(pipes)
            return compound, edgePoints
        
    

    def checkOpenShell(self, aShape):
        if aShape.ShapeType()==TopAbs_SHELL:
            mystatus = BRepCheck_Shell(aShape).Closed() 
            return (mystatus==BRepCheck_Status.BRepCheck_NotClosed or mystatus==BRepCheck_Status.BRepCheck_NoSurface )            
        else:
            return False
    
    def setColor(self, aShape, parentLabel, defaultColor=None,parentShape=None):    
        if defaultColor:                # default color
            c = defaultColor
        else:
            if self.defaultColor:
                c = self.defaultColor
            else:
                c = Quantity_Color(0.3, 0.32, 0.37, Quantity_TOC_RGB)
            
        color_set = False

        if (self.color_tool.GetInstanceColor(aShape, 0, c) or
                self.color_tool.GetInstanceColor(aShape, 1, c) or
                self.color_tool.GetInstanceColor(aShape, 2, c)):
            if parentShape is None:
                pass
            else:
                self.color_tool.SetInstanceColor(aShape, 0, c)
                self.color_tool.SetInstanceColor(aShape, 1, c)
                self.color_tool.SetInstanceColor(aShape, 2, c)
            color_set = True

        if not color_set:
            if (self.color_tool.GetColor(parentLabel, 0, c) or
                    self.color_tool.GetColor(parentLabel, 2, c) or
                    self.color_tool.GetColor(parentLabel, 1, c)):
                color_set = True

        if color_set:            
            if parentShape is None:
                self.color_tool.SetInstanceColor(aShape, 0, c)
                self.color_tool.SetInstanceColor(aShape, 1, c)
                self.color_tool.SetInstanceColor(aShape, 2, c)
            else:
                self.color_tool.SetInstanceColor(parentShape, 0, c)
                self.color_tool.SetInstanceColor(parentShape, 1, c)
                self.color_tool.SetInstanceColor(parentShape, 2, c)
        return c, color_set
    
    def hashCode(self, transform):
        hashcode = ''
        for i in range(1,4):
            for j in range(1,5):
                hashcode += str(transform.Value(i,j))
        return hashcode
    
    def findShapeLabel(self, solidFace):
        faceLabel = TDF_Label() 
        found = self.shape_tool.FindShape(solidFace, faceLabel)
        if found:
            #print("I got from findShapeLabel")
            return faceLabel
        else:
            return None

    def findLabelFromSubShapes(self,subShapesFromParent,solidFaceHash):
        mysubShapes = []
        for i in range(subShapesFromParent.Length()):
            labelForSubShapes = subShapesFromParent.Value(i+1)
            shapeForSubShapes = self.shape_tool.GetShape(labelForSubShapes)
            if (hash(shapeForSubShapes)==solidFaceHash):
                mysubShapes.append(labelForSubShapes)
        return mysubShapes

    def findFaceLabel(self,subLabel,solidFace,subShapesFromParent,solidFaceHash):
        if subShapesFromParent:
            faceLabels = self.findLabelFromSubShapes(subShapesFromParent,solidFaceHash)
            found = len(faceLabels)
            if found>1:
                print("got more than one shape label",found,faceLabels)
                return faceLabels[found-1], True
            elif found==1:
                #print("I got from findfaceLabel")
                return faceLabels[0], True
            #else:
            #    #print("No shapes found from subshapes")
            #    #return None
        faceLabel = TDF_Label() 
        found = self.shape_tool.FindSubShape(subLabel, solidFace, faceLabel)                
        if found:
            #print("I got from FindSubShape")
            return faceLabel, True
        return self.findShapeLabel(solidFace), False
    
    def getFacesEdgesVertices(self, aShape,localTransform,transformHash) : # somehow this is not working..
        topologyExplorer = Topo(aShape,ignore_orientation=False)
        list_of_faces = list(topologyExplorer.faces())
        list_of_wires = list(topologyExplorer.wires())
        list_of_edges = list(topologyExplorer.edges())
        list_of_vertices = list(topologyExplorer.vertices())
        vertices_dict = {}
        for vertex in list_of_vertices: 
            hash_vertex = str(hash(vertex))+transformHash
            if(not hash_vertex in vertices_dict):
                shape_vertex = BRepBuilderAPI_Transform(vertex, localTransform).Shape()
                vertices_dict[hash_vertex]=shape_vertex
        edges_dict = {}
        for edge in list_of_edges: 
            hash_edge = str(hash(edge))+transformHash
            if(not hash_edge in edges_dict):
                shape_edge = BRepBuilderAPI_Transform(edge, localTransform).Shape()                
                edges_dict[hash_edge]=shape_edge
                topologyEdge = Topo(edge,ignore_orientation=False)
                list_of_vertices = list(topologyEdge.vertices())
                for vertex in list_of_vertices: 
                    hash_vertex = str(hash(vertex))+transformHash
                    if(not hash_vertex in vertices_dict):
                        shape_vertex = BRepBuilderAPI_Transform(vertex, localTransform).Shape()
                        vertices_dict[hash_vertex]=shape_vertex        
        for wire in list_of_wires:
            topologyWire = Topo(wire,ignore_orientation=False)
            list_of_edges = list(topologyWire.edges())
            list_of_vertices = list(topologyWire.vertices())        
            for vertex in list_of_vertices: 
                hash_vertex = str(hash(vertex))+transformHash
                if(not hash_vertex in vertices_dict):
                    shape_vertex = BRepBuilderAPI_Transform(vertex, localTransform).Shape()
                    vertices_dict[hash_vertex]=shape_vertex
            for edge in list_of_edges: 
                hash_edge = str(hash(edge))+transformHash
                if(not hash_edge in edges_dict):
                    shape_edge = BRepBuilderAPI_Transform(edge, localTransform).Shape()                
                    edges_dict[hash_edge]=shape_edge
                    topologyEdge = Topo(edge,ignore_orientation=False)
                    list_of_vertices = list(topologyEdge.vertices())
                    for vertex in list_of_vertices: 
                        hash_vertex = str(hash(vertex))+transformHash
                        if(not hash_vertex in vertices_dict):
                            shape_vertex = BRepBuilderAPI_Transform(vertex, localTransform).Shape()
                            vertices_dict[hash_vertex]=shape_vertex
        for face in list_of_faces:
            topologyFace = Topo(face,ignore_orientation=False)
            list_of_wires = list(topologyFace.wires())
            list_of_edges = list(topologyFace.edges())
            list_of_vertices = list(topologyFace.vertices())
            for vertex in list_of_vertices: 
                hash_vertex = str(hash(vertex))+transformHash
                if(not hash_vertex in vertices_dict):
                    shape_vertex = BRepBuilderAPI_Transform(vertex, localTransform).Shape()
                    vertices_dict[hash_vertex]=shape_vertex
            for edge in list_of_edges: 
                hash_edge = str(hash(edge))+transformHash
                if(not hash_edge in edges_dict):
                    shape_edge = BRepBuilderAPI_Transform(edge, localTransform).Shape()                
                    edges_dict[hash_edge]=shape_edge
                    topologyEdge = Topo(edge,ignore_orientation=False)
                    list_of_vertices = list(topologyEdge.vertices())
                    for vertex in list_of_vertices: 
                        hash_vertex = str(hash(vertex))+transformHash
                        if(not hash_vertex in vertices_dict):
                            shape_vertex = BRepBuilderAPI_Transform(vertex, localTransform).Shape()
                            vertices_dict[hash_vertex]=shape_vertex
            for wire in list_of_wires:
                topologyWire = Topo(wire,ignore_orientation=False)
                list_of_edges = list(topologyWire.edges())
                list_of_vertices = list(topologyWire.vertices())        
                for vertex in list_of_vertices: 
                    hash_vertex = str(hash(vertex))+transformHash
                    if(not hash_vertex in vertices_dict):
                        shape_vertex = BRepBuilderAPI_Transform(vertex, localTransform).Shape()
                        vertices_dict[hash_vertex]=shape_vertex
                for edge in list_of_edges: 
                    hash_edge = str(hash(edge))+transformHash
                    if(not hash_edge in edges_dict):
                        shape_edge = BRepBuilderAPI_Transform(edge, localTransform).Shape()                
                        edges_dict[hash_edge]=shape_edge
                        topologyEdge = Topo(edge,ignore_orientation=False)
                        list_of_vertices = list(topologyEdge.vertices())
                        for vertex in list_of_vertices: 
                            hash_vertex = str(hash(vertex))+transformHash
                            if(not hash_vertex in vertices_dict):
                                shape_vertex = BRepBuilderAPI_Transform(vertex, localTransform).Shape()
                                vertices_dict[hash_vertex]=shape_vertex  

        return list_of_faces, edges_dict, vertices_dict
    
    def NotFoundIn(self,arrItems,item):
        #print(arrItems,item)
        itemR = item.Red()
        itemG = item.Green()
        itemB = item.Blue()
        for (R,G,B) in arrItems:
            #print("Inside array Loop",items.Red(),item.Red(),items.Green(),item.Green(),items.Blue(),item.Blue())
            #print(R,G,B,itemR,itemG,itemB)
            if(R==itemR and G==itemG and B==itemB):
                return False
        return True

    def hashTransCode(self,transform):
        hashcode = ''
        for i in range(1,4):
            for j in range(1,5):
                hashcode += str(transform.Value(i,j))
        return hashcode

    def getFeaturesFromShape(self, aShape, subLabel, localTransform, parentColor, subShapes, parentShape=None, disectparts=True, doCompact=True, doParts=False, percentincrement=0.1, fromCompound=False):
        if aShape.IsNull():
            print("No shape was formed when"+str(self.uid)+"\n") 
            return [],[],None, None, " ", False
        else:
            if self.checkOpenShell(aShape) :#
                print("There is no need to add outer infinity shell to the shapes",aShape.Infinite(), aShape.ShapeType())
                return [],[],None, None, " ", False
        #if self.includeparts:
        #    disectparts = True        
        transformationHash = self.hashCode(localTransform)
        if disectparts:  
            faces_dict = {}
            edges_dict = {}
            vertices_dict = {}
            dumpTopologyFacesEdgesVertices(aShape,faces_dict,edges_dict,vertices_dict)
            print("No of faces, edges, vertices",len(faces_dict),len(edges_dict),len(vertices_dict))
            reduced_edges_dict = None
            reduced_corners_dict = None
            if self.edgesize > 0:
                reduced_edges_dict = {}
                #print("Reach here faces",len(faces_dict))
                findEdgesAgain=False
                if findEdgesAgain:
                    for _, face in faces_dict.items():
                        topologyExplorer = Topo(face,ignore_orientation=False)
                        #print("Reach here list",topologyExplorer)
                        mygotedges = list( topologyExplorer.edges() )
                        #print("Reach here mygotedges",len(mygotedges))
                        for edge in mygotedges:
                            hashcode = str(hash(edge))+str(edge.Orientation())+self.hashTransCode(edge.Location().Transformation())
                            if (not hashcode in self.outputEdges):
                                self.outputEdges[hashcode] = (edge)
                                reduced_edges_dict[hashcode]=edge
                #print("Reach here list1",len(reduced_edges_dict))
                for hash_edge, edge in edges_dict.items():
                    hashcode = hash_edge+transformationHash
                    if (not hashcode in self.outputEdges):
                        self.outputEdges[hashcode] = (edge)
                        reduced_edges_dict[hashcode]=edge
                
            if self.vertexsize > 0: 
                reduced_corners_dict = {}  
                findCornersAgain=False
                if findCornersAgain:
                    for _, face in faces_dict.items():
                        topologyExplorer = Topo(face,ignore_orientation=False)
                        mygotcorners = list( topologyExplorer.vertices() )
                        #print("Reach here mygotcorners",mygotcorners)
                        for corner in mygotcorners:
                            hashcode = str(hash(corner))+self.hashTransCode(corner.Location().Transformation())
                            if (not hashcode in self.outputCorners):
                                self.outputCorners[hashcode] = (corner)
                                reduced_corners_dict[hashcode]=corner           
                for hash_corner, corner in vertices_dict.items():
                    hashcode = hash_corner+transformationHash
                    if (not hashcode in self.outputCorners):
                        self.outputCorners[hashcode] = (corner)
                        reduced_corners_dict[hashcode]=corner 
            #print("After reduction, No of faces, edges, vertices",len(faces_dict),len(reduced_edges_dict),len(reduced_corners_dict))
            #list_of_faces, edges_dict, vertices_dict = self.getFacesEdgesVertices(aShape,localTransform,transformationHash)            
            #print(len(list_of_faces),aShape)
            list_of_solids = []
            list_of_compounds=[]
            only_soilds = []
            only_Colors=[(parentColor.Red(),parentColor.Green(),parentColor.Blue())]
            mylenFaceDict = ( len(faces_dict) if faces_dict else 0 )
            print("\t"*self.indent,"No of Faces",mylenFaceDict)
            if (mylenFaceDict > self.maximumfacestoinclude) or (fromCompound) or (self.seperateparts):
                doCompact = True            
            for hash_solidface, solidface in faces_dict.items(): 
                #hash_solidface = hash(solidface)
                #currenttime = datetime.now()
                #suffix = currenttime.strftime("%H-%M-%S") 
                #print(hash_solidface,solidface,suffix)
                #if (len(only_Colors)<=2) or (not doParts) or (len(faces_dict) < self.multiplegltf):
                facelabel, shape_not_set = self.findFaceLabel(subLabel, solidface, subShapes, hash_solidface) 
                self.percentage += (0.5/mylenFaceDict)*percentincrement
                self.write_status()
                #currenttime = datetime.now()
                #suffix = currenttime.strftime("%H-%M-%S")   
                #print(hash_solidface,solidface,suffix)                            
                if facelabel:
                    faceColor, color_set = self.setColor(solidface,facelabel,parentColor,parentShape)
                    #print("faceColor",faceColor.Red(),faceColor.Green(),faceColor.Blue(),color_set,facelabel.GetLabelName())
                    if (not color_set) and (shape_not_set):
                        facelabel = self.findShapeLabel(solidface)                               
                        if facelabel:
                            faceColor, color_set = self.setColor(solidface,facelabel,parentColor,parentShape)
                            #print("faceColor again",faceColor.Red(),faceColor.Green(),faceColor.Blue(),color_set,facelabel.GetLabelName())
                        else:
                            faceColor = parentColor
                            #print("I am unable to find shapecolor with label and hence setting the color",faceColor.Red(),faceColor.Green(),faceColor.Blue())
                else: 
                    faceColor = parentColor
                    #print("I am unable to find shapecolor and hence setting the color",faceColor.Red(),faceColor.Green(),faceColor.Blue())
                hashcode = hash_solidface+transformationHash
                if (not hashcode in self.outputFaces):                    
                    shape_disp = BRepBuilderAPI_Transform(solidface, localTransform).Shape()
                    if shape_disp.IsNull():
                        print("No shape was formed when"+str(self.uid)+"\n")
                    else:
                        #hashcode = hash_solidface+transformationHash
                        self.outputFaces[hashcode] = (shape_disp,Quantity_Color(faceColor.Red(),faceColor.Green(),faceColor.Blue(), Quantity_TOC_RGB))
                        list_of_solids.append((shape_disp,Quantity_Color(faceColor.Red(),faceColor.Green(),faceColor.Blue(), Quantity_TOC_RGB),hashcode) )  
                        #print(faceColor.Red(),faceColor.Green(),faceColor.Blue())
                        if doCompact:
                            only_soilds.append(shape_disp)
                            if self.NotFoundIn(only_Colors,faceColor ):
                                only_Colors.append((faceColor.Red(),faceColor.Green(),faceColor.Blue())) 
                        """    else:
                                print("Found",faceColor.Red(),faceColor.Green(),faceColor.Blue())                     
                         else:
                            only_soilds.append(shape_disp)
                            if self.NotFoundIn(only_Colors,faceColor ):
                               only_Colors.append((faceColor.Red(),faceColor.Green(),faceColor.Blue())) 
                            else:
                                print("Found",faceColor.Red(),faceColor.Green(),faceColor.Blue())   """     
                    #print(hashcode,localTransform)
            if doCompact:                
                len_color_arr = ( len(only_Colors) if only_Colors else 0 )
                print("\t"*self.indent,"No of colors found",len_color_arr,"Faces",mylenFaceDict)
                if (len_color_arr<=2) or doParts or (mylenFaceDict > self.multiplegltf) or (fromCompound) or (self.seperateparts):
                    (R,G,B)=only_Colors[len_color_arr-1]
                    #print("Colors",R,G,B,len_color_arr,len(only_soilds))
                    mycompound = BRepBuilderAPI_Transform(aShape, localTransform).Shape()
                    if mycompound.IsNull(): 
                        if(len(only_soilds)!=1):
                            print("I am coming here","PARTS",self.fname)
                            mycompound,_ = list_of_shapes_to_compound(only_soilds)
                        else:
                            print("I am coming here","PART1",self.fname)
                            mycompound = only_soilds[0] 
                        hashcode = str(hash(mycompound))+transformationHash
                    else:
                        print("I am doing direct","PART",self.fname)
                        hashcode = str(hash(aShape))+transformationHash
                    list_of_compounds.append((mycompound,Quantity_Color(R*0.98,G*0.98,B*0.98, Quantity_TOC_RGB),hashcode))                 
                    return list_of_compounds, list_of_solids, reduced_edges_dict, reduced_corners_dict, "PART" , ((mylenFaceDict < self.maximumfacestoinclude) and (not fromCompound) and (not self.seperateparts)) # (len_color_arr>2) and (len(faces_dict) < self.multiplegltf)
                else:
                    print("I am coming here","FACE",self.fname)
                    return list_of_solids, list_of_solids, reduced_edges_dict, reduced_corners_dict, "FACE", False
            #else:
            #    #print("Colors",len(only_Colors),len(only_soilds))                    
            #    #return list_of_solids, edges_dict, vertices_dict            
            return list_of_solids, list_of_solids, reduced_edges_dict, reduced_corners_dict, "FACE", False
        else:
            list_of_solids = []
            shape_disp = BRepBuilderAPI_Transform(aShape, localTransform).Shape()
            if shape_disp.IsNull():
                print("No shape was formed when"+str(self.uid)+"\n")
            else:
                hashcode = str(hash(aShape))+transformationHash
                list_of_solids.append((shape_disp,Quantity_Color(parentColor.Red(),parentColor.Green(),parentColor.Blue(), Quantity_TOC_RGB),hashcode))
                #print(hashcode,localTransform) 
            print("I am doing direct","PART",self.fname)
            return list_of_solids,list_of_solids, None, None, "PART", False
                
    def getDarken(self, faceColor, factor):
        faceR = (faceColor.Red())*factor
        faceG = (faceColor.Green())*factor
        faceB = (faceColor.Blue())*factor
        minRGB = min(faceR,faceG,faceB)
        if minRGB < 0.1:
            faceR = faceR + 0.1
            faceG = faceG + 0.1
            faceB = faceB + 0.1
        maxRGB = max(faceR,faceG,faceB)
        if maxRGB >= 1:
            faceR = faceR - 0.1
            faceG = faceG - 0.1
            faceB = faceB - 0.1
        return Quantity_Color(faceR, faceG, faceB, Quantity_TOC_RGB)
    
    def addAllFeatures(self,shape,subLabel,localTransformation,subShapesFromParent,subName,subEntry,parentName,parentEntry,parent_node_index,percentincrement,fromCompound):
        transformationHash = self.hashCode(localTransformation)
        myshapename = shapeString(shape)
        print(myshapename)
        if ( ( (((myshapename=="Compound.") or (myshapename=="Compsolid.")) and (self.includeparts))) and (self.seperatecompounds) ):
            solids_dict = {}
            compounds_dict = {}
            compsolids_dict = {}
            dumpTopologySolids(shape,1,0,solids_dict,compounds_dict,compsolids_dict) 
            solidstotalcount = len(solids_dict)+len(compounds_dict)+len(compsolids_dict)
            print("solids_dict",len(solids_dict),solids_dict)
            print("compounds_dict",len(compounds_dict),compounds_dict)
            print("compsolids_dict",len(compsolids_dict),compsolids_dict)
            reduced_compounds_dict = {}
            for hash_compound, compound in compounds_dict.items():
                hashcode = hash_compound+transformationHash
                if (not hashcode in self.outputCompounds):
                    self.outputCompounds[hashcode] = (compound)
                    reduced_compounds_dict[hashcode]=compound
            for reduced_hash_code, reduced_compounds in reduced_compounds_dict.items(): 
                mesherDict=self.updateParentChild(subName+" "+subEntry,shape)
                my_parent_id = mesherDict[self.gltf_Dict["id"]]                            
                self.parentIDs.append(my_parent_id)
                self.indent += 1
                mydirectory = self.validFileName(subName+subEntry)
                mydirectorylen = ( len(self.direntry) if self.direntry else 0)
                self.direntry += "/"+mydirectory                
                self.addAllFeatures(
                    reduced_compounds,subLabel,localTransformation,subShapesFromParent,
                    subName,subEntry,parentName,parentEntry,parent_node_index,
                    percentincrement/(solidstotalcount+1),True)        
                self.indent -= 1 
                self.parentIDs.pop()          
                self.direntry = self.direntry[:mydirectorylen]  
            reduced_compsolids_dict = {}
            for hash_compound, compound in compsolids_dict.items():
                hashcode = hash_compound+transformationHash
                if (not hashcode in self.outputCompSolids):
                    self.outputCompSolids[hashcode] = (compound)
                    reduced_compsolids_dict[hashcode]=compound
            for reduced_hash_code, reduced_compsolids in reduced_compsolids_dict.items():
                mesherDict=self.updateParentChild(subName+" "+subEntry,shape)
                my_parent_id = mesherDict[self.gltf_Dict["id"]]                            
                self.parentIDs.append(my_parent_id)
                self.indent += 1
                mydirectory = self.validFileName(subName+subEntry)
                mydirectorylen = ( len(self.direntry) if self.direntry else 0)
                self.direntry += "/"+mydirectory  
                self.addAllFeatures(
                    reduced_compsolids,subLabel,localTransformation,subShapesFromParent,
                    subName,subEntry,parentName,parentEntry,parent_node_index,
                    percentincrement/(solidstotalcount+1),True)  
                self.indent -= 1 
                self.parentIDs.pop()          
                self.direntry = self.direntry[:mydirectorylen]                 
            if(len(solids_dict)>0):
                mesherDict=self.updateParentChild(subName+" "+subEntry,shape)
                my_parent_id = mesherDict[self.gltf_Dict["id"]]                            
                self.parentIDs.append(my_parent_id)
                self.indent += 1
                mydirectory = self.validFileName(subName+subEntry)
                mydirectorylen = ( len(self.direntry) if self.direntry else 0)
                self.direntry += "/"+mydirectory                 
                for hash_solid, solid in solids_dict.items():
                    self.addOneFeature(
                        solid,subLabel,localTransformation,subShapesFromParent,
                        subName,subEntry,parentName,parentEntry,parent_node_index,
                        percentincrement/(solidstotalcount+1),True)            
                self.indent -= 1 
                self.parentIDs.pop()          
                self.direntry = self.direntry[:mydirectorylen]
            if(solidstotalcount==0):
                print("I am doing the compound as solid since solidstotalcount is zero")
                self.addOneFeature(
                    shape,subLabel,localTransformation,subShapesFromParent,
                    subName,subEntry,parentName,parentEntry,parent_node_index,
                    percentincrement,True)
        else:
            self.addOneFeature(
                    shape,subLabel,localTransformation,subShapesFromParent,
                    subName,subEntry,parentName,parentEntry,parent_node_index,
                    percentincrement,fromCompound)

    def addOneFeature(self,shape,subLabel,localTransformation,subShapesFromParent,subName,subEntry,parentName,parentEntry,parent_node_index,percentincrement,fromCompound):
        #print("Reaching here 1")
        currentColor, _ = self.setColor(shape,subLabel)
        #print("Reaching here 2")
        my_parent_id = self.parentIDs[-1]
        #print("Reaching here 3")
        myPartMeshID = None
        atleastOneItemAdded = 0  
        toAddFaces = True 
        keep_faces = False  
        parentIDNotAdded = True
        myLenShapeCompounds = 0
        
        #print("Reaching here 4")
        myFaceType=[]
        if self.multiplegltf!=0 or (self.edgesize==0 and self.vertexsize==0) :
            shape_compounds, shape_faces, shape_edges, shape_vertices, disect_type, keep_faces = \
                self.getFeaturesFromShape(shape, subLabel,localTransformation , currentColor, subShapesFromParent, None, self.includeparts, True, (self.edgesize!=0 or self.vertexsize!=0 or self.ascompound), percentincrement,fromCompound)
            #atleastOneItemAdded = 0
            #myFaceType=[]
            #print(shape_faces)
            #print("Reaching here 5")
            toAddFaces = (disect_type=="PART")
            myLenShapeCompounds = ( len(shape_compounds) if shape_compounds else 0 )
            print("\t"*self.indent,"No of subparts",myLenShapeCompounds)
            myLenShapeCompounds += (len(shape_faces) if shape_faces else 0) +\
                (len(shape_edges) if shape_edges else 0)  + \
                    (len(shape_vertices) if shape_vertices else 0)
            parentIDNotAdded = True
            for shape_disp,faceColor,shapeInFile in shape_compounds:
                #print("I have reached here 16")
                #shape_disp = BRepBuilderAPI_Transform(shape, subLocation.Transformation()).Shape()
                if self.includeparts and parentIDNotAdded and (disect_type=="FACE"):                            
                    mesherDict=self.updateParentChild(subName+" "+subEntry,shape)
                    my_parent_id = mesherDict[self.gltf_Dict["id"]]                            
                    self.parentIDs.append(my_parent_id)
                    self.indent += 1
                    mydirectory = self.validFileName(subName+subEntry)
                    mydirectorylen = ( len(self.direntry) if self.direntry else 0)
                    self.direntry += "/"+mydirectory  
                    parentIDNotAdded = False 
                if shape_disp.IsNull():
                    print("No shape was formed when"+str(self.uid)+"\n")
                else:
                    if self.checkOpenShell(shape_disp) :#or shape_disp.ShapeType()==TopAbs_SHELL:
                        print("There is no need to add outer infinity shell to the shapes",shape_disp.Infinite(), shape_disp.ShapeType())
                    else:
                    #print("I have reached here 17")
                        if not shapeInFile in self.outputShapes:
                            self.fileId += 1
                            atleastOneItemAdded += 1
                            (filefullname, basename) = self.write_step_file(shape_disp,subName+parentName,faceColor)
                            #_, _, face_entity = recognize_direction(shape_disp)
                            #if(face_entity=="Cylinder"):                                 
                            #    myFaceType.append(face_entity)
                            #print("I am writing Full Parts",disect_type,self.fileId, basename,shapeInFile)
                            """ stype = shape_disp.ShapeType()
                            if(stype==TopAbs_VERTEX):
                                print("Serving TopAbs_VERTEX")                        
                            if(stype==TopAbs_EDGE):
                                    print("Serving TopAbs_EDGE")
                            if(stype==TopAbs_FACE):
                                    print("Serving TopAbs_FACE")
                            if(stype==TopAbs_WIRE):
                                    print("Serving TopAbs_WIRE")
                            if(stype==TopAbs_SHELL):
                                    print("Serving TopAbs_EDGE")
                            if(stype==TopAbs_SOLID):
                                    print("Serving TopAbs_SOLID")
                            if(stype==TopAbs_COMPOUND):
                                    print("Serving TopAbs_COMPOUND")
                            if(stype==TopAbs_COMPSOLID):
                                    print("Serving TopAbs_COMPSOLID")                        
                            print("I have written lowest node",basename,shape_disp.ShapeType() ) """
                            if(disect_type=="FACE"):
                                face_entity, myCurveCode = recognize_face_entity(shape_disp)
                                if((face_entity=="Cylinder") and (len(shape_faces)==3)):  #PURE CYLINDER
                                    print("NO of faced faces in the cylinder",len(shape_faces))                               
                                    myFaceType.append(face_entity)
                            else:
                                myCurveCode = ""
                            mycurvepoints = None
                            myentity = recognize_face_entity_info(shape_disp) 
                            (myPartMeshID,meshname,uvPlane,solidFoundHere,buffHere,uvbuffHere)=self.add_part(
                                shape_disp,
                                part_color=faceColor,
                                filenameuri=filefullname,
                                filetype= disect_type,
                                name=disect_type+myCurveCode+subName+parentName,
                                parent_idx=parent_node_index, 
                                curvecode=myCurveCode,
                                curvepoints=mycurvepoints,
                                entity= myentity                  
                            ) 
                            if solidFoundHere > 0 :
                                self.outputShapes[shapeInFile] = [shape_disp, myCurveCode, mycurvepoints,\
                                    faceColor, myPartMeshID, my_parent_id, disect_type, myentity, meshname,\
                                        disect_type+myCurveCode+subName+parentName, (uvPlane, solidFoundHere, buffHere, uvbuffHere)]
                                #print("ShapeInFile",self.outputShapes[shapeInFile])
                            if self.includeparts and parentIDNotAdded:
                                if myPartMeshID:
                                    my_parent_id = myPartMeshID 
                                else:
                                    mesherDict=self.updateParentChild(subName+" "+subEntry,shape)
                                    my_parent_id = mesherDict[self.gltf_Dict["id"]]
                                
                                self.parentIDs.append(my_parent_id)
                                self.indent += 1
                                mydirectory = self.validFileName(subName+subEntry)
                                mydirectorylen = ( len(self.direntry) if self.direntry else 0)
                                self.direntry += "/"+mydirectory  
                                parentIDNotAdded = False 
                            #print("I am setting with shape color in simple parts",faceColor.Red(),faceColor.Green(),faceColor.Blue())
                            #print("ShapeInFile",self.outputShapes[shapeInFile])
                        #else:
                        #    diffColor = self.outputShapes[shapeInFile][3]
                        #    #print(diffColor, faceColor)
                        #    #print("I am not writing with shape color in simpleshape",faceColor.Red(),diffColor.Red(),faceColor.Green(),diffColor.Green(),faceColor.Blue(),diffColor.Blue(),subName, subEntry)
                self.percentage += (0.5/myLenShapeCompounds)*percentincrement
                self.write_status()
        else:
            #print("Reaching here 6")
            _, shape_faces, shape_edges, shape_vertices, disect_type, keep_faces  = \
                self.getFeaturesFromShape(shape, subLabel,localTransformation , currentColor, subShapesFromParent, None, self.includeparts, False, False,percentincrement,fromCompound)
            myLenShapeCompounds += (len(shape_faces) if shape_faces else 0) +\
                (len(shape_edges) if shape_edges else 0)  + \
                    (len(shape_vertices) if shape_vertices else 0)
            if self.includeparts:
                #print("sub include",subName)
                mesherDict=self.updateParentChild(subName+" "+subEntry,shape)
                my_parent_id = mesherDict[self.gltf_Dict["id"]]
                self.parentIDs.append(my_parent_id)
                self.indent += 1
                mydirectory = self.validFileName(subName+subEntry)
                mydirectorylen = ( len(self.direntry) if self.direntry else 0)
                self.direntry += "/"+mydirectory
                parentIDNotAdded = False
        #atleastOneItemAdded = 0
        
        myFeaturesFaces=[]
        myFeaturesEdges=[]
        myFeaturesVertices=[]
        if(self.edgesize!=0 or self.vertexsize!=0):
            #print("Doing1",self.multiplegltf,self.edgesize,self.vertexsize)                                      
            if(toAddFaces):
                if keep_faces:
                    atleastOneItemAdded=0  
                for shape_disp,faceColor,shapeInFile in shape_faces:
                    #print("I have reached here",shapeInFile,disect_type)
                    #shape_disp = BRepBuilderAPI_Transform(shape, subLocation.Transformation()).Shape()
                    if shape_disp.IsNull():
                        print("No shape was formed when"+str(self.uid)+"\n")
                    else:
                        if self.checkOpenShell(shape_disp) :#or shape_disp.ShapeType()==TopAbs_SHELL:
                            print("There is no need to add outer infinity shell to the shapes",shape_disp.Infinite(), shape_disp.ShapeType())
                        else:
                        #print("I have reached here 17")
                            if not shapeInFile in self.outputShapes:
                                self.fileId += 1
                                atleastOneItemAdded += 1
                                (filefullname, basename) = self.write_step_file(shape_disp,subName+parentName,faceColor)
                                
                                face_entity, myCurveCode = recognize_face_entity(shape_disp)                                       
                                #_, _, face_entity = recognize_direction(shape_disp)
                                if((face_entity=="Cylinder") and (len(shape_faces)==3)):  #PURE CYLINDER 
                                    print("NO of edged faces in the cylinder",len(shape_faces))                               
                                    myFaceType.append(face_entity)
                                #print("I am writing",disect_type,self.fileId, basename)
                                """ stype = shape_disp.ShapeType()
                                if(stype==TopAbs_VERTEX):
                                    print("Serving TopAbs_VERTEX")                        
                                if(stype==TopAbs_EDGE):
                                        print("Serving TopAbs_EDGE")
                                if(stype==TopAbs_FACE):
                                        print("Serving TopAbs_FACE")
                                if(stype==TopAbs_WIRE):
                                        print("Serving TopAbs_WIRE")
                                if(stype==TopAbs_SHELL):
                                        print("Serving TopAbs_EDGE")
                                if(stype==TopAbs_SOLID):
                                        print("Serving TopAbs_SOLID")
                                if(stype==TopAbs_COMPOUND):
                                        print("Serving TopAbs_COMPOUND")
                                if(stype==TopAbs_COMPSOLID):
                                        print("Serving TopAbs_COMPSOLID")                        
                                print("I have written lowest node",basename,shape_disp.ShapeType() ) """
                                myMeshID=self.uid+20000
                                mycurvepoints=None
                                entity=recognize_face_entity_info(shape_disp)
                                #print("My Entity Face",entity)
                                if (self.multiplegltf!=0) and (keep_faces==False):
                                    meshname="FACE"
                                    uvPlane=my_parent_id
                                    solidFoundHere=0
                                    buffHere=None
                                    uvbuffHere=None
                                    myFeaturesFaces.append(
                                        (shape_disp,
                                        faceColor,
                                        filefullname,
                                        "FACE"+myCurveCode+subName+parentName,
                                        "FACE", 
                                        myCurveCode,
                                        None,
                                        entity))
                                    
                                else:   
                                    (myMeshID,meshname,uvPlane,solidFoundHere,buffHere,uvbuffHere)=self.add_part(
                                        shape_disp,
                                        part_color=faceColor,
                                        filenameuri=filefullname,
                                        filetype="FACE",
                                        name="FACE"+myCurveCode+subName+parentName,
                                        parent_idx=parent_node_index,
                                        curvecode=myCurveCode,
                                        curvepoints=mycurvepoints,
                                        entity=entity                        
                                    ) 
                                if (solidFoundHere > 0) or ((self.multiplegltf!=0) and (keep_faces==False)) :
                                    self.outputShapes[shapeInFile] = [shape_disp, myCurveCode, mycurvepoints,\
                                        faceColor, myMeshID, my_parent_id, "FACE", entity, meshname,\
                                            "FACE"+myCurveCode+subName+parentName, (uvPlane, solidFoundHere, buffHere, uvbuffHere)]
                                #print("I am setting with shape color in simple parts",faceColor.Red(),faceColor.Green(),faceColor.Blue())

                            #else:
                            #    diffColor = self.outputShapes[shapeInFile][3]
                            #    #print(diffColor, faceColor)
                            #    #print("I am not writing with shape color in simpleshape",faceColor.Red(),diffColor.Red(),faceColor.Green(),diffColor.Green(),faceColor.Blue(),diffColor.Blue(),subName, subEntry)
                    self.percentage += (0.5/myLenShapeCompounds)*percentincrement  
                    self.write_status()   
            else: 
                self.percentage += ( ( len(shape_faces) if shape_faces else 0 )/myLenShapeCompounds)*percentincrement     
                self.write_status()       
        if self.includeparts and (atleastOneItemAdded>0):
            #print(shape_edges)
            #print(shape_vertices)  
            #print("Doing2",self.multiplegltf,self.edgesize,self.vertexsize,self.includeparts,atleastOneItemAdded)         
            toAddCorners = True
            if self.edgesize > 0:
                edgeColor = self.getDarken(faceColor,0.50)                        
                if  (len(myFaceType)==1)  :
                    for _, shape_edge  in shape_edges.items():
                        myCurveType, Distance, myCurveCode = recognize_curve(shape_edge)
                        #print("MyCurve",myCurveType, Distance)
                        if (myCurveType=="Circle") and (Distance<=0.0001):
                            toAddCorners=False
                #print("Got edges for",len(shape_edges),"To add Corners",toAddCorners)
                edgenumber=0
                for shape_hash_edge, shape_edge  in shape_edges.items():
                    toAddAsAnEdge=True
                    edgenumber+=1
                    myCurveType, Distance, myCurveCode = recognize_curve(shape_edge)
                    if (toAddCorners==False):
                        #print("MyCurve",myCurveType)
                        toAddAsAnEdge=(myCurveType=="Circle")
                    #else :
                    #print("Got edges for",edgenumber,"To add edge",toAddAsAnEdge)
                    if (toAddAsAnEdge) and (not shape_hash_edge in self.outputShapes):
                        self.fileId += 1
                        shape_transform = BRepBuilderAPI_Transform(shape_edge, localTransformation).Shape()
                        (filefullname, basename) = self.write_step_file(shape_transform,subName+parentName,faceColor)
                        #print("I am writing Edge",self.fileId, basename)                       
                        shape_disp, edge_points = self.createPipesFromEdge(shape_transform)  

                        myMeshID = self.uid+20000
                        entity=recognize_edge_entity_info(shape_transform)
                        #print("My Entity Edge",entity)
                        if self.multiplegltf!=0:
                            meshname="EDGE"
                            uvPlane=my_parent_id
                            solidFoundHere=0
                            buffHere=None
                            uvbuffHere=None
                            myFeaturesEdges.append(
                                (shape_disp,
                                edgeColor,
                                filefullname,
                                "EDGE"+myCurveCode+subName+parentName,
                                "EDGE",
                                myCurveCode,
                                edge_points,
                                entity))                            
                        else:  
                            (myMeshID,meshname,uvPlane,solidFoundHere,buffHere,uvbuffHere)=self.add_part(
                                shape_disp,
                                part_color=edgeColor,
                                filenameuri=filefullname,
                                filetype= "EDGE",
                                name="EDGE"+myCurveCode+subName+parentName,
                                parent_idx=parent_node_index,  
                                curvecode=myCurveCode,
                                curvepoints=edge_points,
                                entity=entity                      
                            ) 
                        if (solidFoundHere > 0) or ((self.multiplegltf!=0)) :                                        
                            self.outputShapes[shape_hash_edge] = [shape_disp, myCurveCode, edge_points, edgeColor,\
                                myMeshID, my_parent_id, "EDGE", entity, meshname, "EDGE"+myCurveCode+subName+parentName,\
                                    (uvPlane, solidFoundHere, buffHere, uvbuffHere)]
                        #print("I am setting with shape color in simple parts",faceColor.Red(),faceColor.Green(),faceColor.Blue())
                    self.percentage += (0.5/myLenShapeCompounds)*percentincrement
                    self.write_status()
            else:
                self.percentage += ( (len(shape_edges) if shape_edges else 0)/myLenShapeCompounds)*percentincrement
                self.write_status()    
            if (self.vertexsize > 0) and (toAddCorners==True):  
                #print("Doing3",self.multiplegltf,self.edgesize,self.vertexsize,self.includeparts,atleastOneItemAdded)         
            
                vertexColor = self.getDarken(faceColor,0.75)  
                for shape_hash_vertex, shape_vertex  in shape_vertices.items():
                    if  (not shape_hash_vertex in self.outputShapes):
                        self.fileId += 1
                        shape_transform = BRepBuilderAPI_Transform(shape_vertex, localTransformation).Shape()        
                        (filefullname, basename) = self.write_step_file(shape_transform,subName+parentName,faceColor)
                        #print("I am writing Vertex",self.fileId, basename)                       
                        shape_disp,vertex_point = self.CreateSphereFromVertex(shape_transform) 
                        myMeshID = self.uid+20000
                        entity=recognize_vertex_entity_info(shape_transform)
                        #print("My Entity Vertex",entity)
                        if self.multiplegltf!=0:
                            meshname="VERTEX"
                            uvPlane=my_parent_id
                            solidFoundHere=0
                            buffHere=None
                            uvbuffHere=None
                            myFeaturesVertices.append((
                                shape_disp,
                                edgeColor,
                                filefullname,
                                "VERTEX"+subName+parentName,
                                "VERTEX",
                                " ",
                                vertex_point,
                                entity))
                            
                        else:            
                            (_,meshname,uvPlane,solidFoundHere,buffHere,uvbuffHere)=self.add_part(
                                shape_disp,
                                part_color=vertexColor,
                                filenameuri=filefullname,
                                filetype= "VERTEX",
                                name="VERTEX"+subName+parentName,
                                parent_idx=parent_node_index, 
                                curvecode=" ",
                                curvepoints=vertex_point,
                                entity=entity                     
                            ) 
                        if (solidFoundHere > 0) or ((self.multiplegltf!=0)) :                                        
                            self.outputShapes[shape_hash_vertex] = [shape_disp, " ", vertex_point,\
                                vertexColor, myMeshID, my_parent_id, "VERTEX", entity, meshname,\
                                     "VERTEX"+subName+parentName, (uvPlane, solidFoundHere, buffHere, uvbuffHere)]
                        self.percentage += (0.5/myLenShapeCompounds)*percentincrement
                        self.write_status()
                    #print("I am setting with shape color in simple parts",faceColor.Red(),faceColor.Green(),faceColor.Blue())
            else:
                self.percentage += ( (len(shape_vertices) if shape_vertices else 0 )/myLenShapeCompounds)*percentincrement
                self.write_status()   
        #print("Doing4",self.multiplegltf,self.edgesize,self.vertexsize,self.includeparts,atleastOneItemAdded, myFeatures)         
            
        self.outputFeatures.append(
            {"Id":my_parent_id,
            "f":myFeaturesFaces,
            "e":myFeaturesEdges,
            "v":myFeaturesVertices})
        #print(len(shape_faces),"Got above subshapers")

        if self.includeparts and parentIDNotAdded==False:
            self.indent -= 1 
            self.parentIDs.pop()          
            self.direntry = self.direntry[:mydirectorylen]


    def getSubShapes(self, subLabel, subLocation, subName, subEntry, parentName, parentEntry, filename, name, parent_node_index=0,percentincrement=0.1):
    
        subShapesFromParent = TDF_LabelSequence()
        self.shape_tool.GetSubShapes(subLabel, subShapesFromParent)
        #print("Nb subshapes   :", subShapesFromParent.Length())
        subComponentsFromParent = TDF_LabelSequence()
        self.shape_tool.GetComponents(subLabel, subComponentsFromParent)
        #print("Nb components  :", subComponentsFromParent.Length())
        #print()
        #name = subLabel.GetLabelName()
        #print("Name :", name)
        #print("I have reached here 1")
        IsAnAssembly = self.shape_tool.IsAssembly(subLabel)
        SubLengthHere = subComponentsFromParent.Length()
        myPercentage = self.percentage
        if IsAnAssembly or SubLengthHere > 0:
            try:
                shape = self.shape_tool.GetShape(subLabel)
            except Exception as e:
                print("Error while extracting shape",e)
                shape = None

            mesherDict=self.updateParentChild(subName+" "+subEntry, shape)
            #print("In Assembly",subName)
            self.parentIDs.append(mesherDict[self.gltf_Dict["id"]])
            self.indent += 1
            #self.parentIDs.append(len(self.mstep_dict['tree'])-1)            
            #self.tree+="<ul id=\"myUL\"><li><span class=\"caret\">"+html.escape(subName+" "+subEntry+" ")+str(self.uid)+"</span><ul class=\"nested\">"    
            #self.output+="\nXOXO"+subName+subEntry+"\n"
            #print("I have reached here 2")
            mydirectory = self.validFileName(subName+subEntry)
            mydirectorylen = ( len(self.direntry) if self.direntry else 0 )
            self.direntry += "/"+mydirectory
            
            split = os.path.splitext(filename)
            node_index = 0
            # Add empty node to serve as a parent Thhe hirearchical display does not work for smooth selection of portions and hence commenting.
           
            """  node_index = len(self.mstep_dict['nodes'])
            node = {}
            node.update(self.transformed_matrix)
            self.updateName(name,node)
            self.mstep_dict['nodes'].append(node)

            # Add this node to its parent
            parent_node = self.mstep_dict['nodes'][parent_node_index]
            parent_node['children'] = parent_node.get('children', []) + [node_index] """
            #SubLengthHere = subComponentsFromParent.Length()
            if(SubLengthHere==0):
                print("Skipping",SubLengthHere,self.indent)
            for i in range(SubLengthHere):
                printindent = "\t" * self.indent
                printoutput = f"{printindent}Processing{i}{SubLengthHere}{self.indent}"
                print(printoutput)
                #print("I have reached here 3")
                subLabelFromComponents = subComponentsFromParent.Value(i+1)
                subLabelEntry = subLabelFromComponents.EntryDumpToString()
                subLabelName = subLabelFromComponents.GetLabelName()
                #print("I have reached here 4")
                #self.update_output(subLabelName, subLabelEntry, subName, subEntry)
                if self.shape_tool.IsReference(subLabelFromComponents):
                    #print("\n########  reference label :", label)
                    #print("I have reached here 5")
                    labelReference = TDF_Label()
                    self.shape_tool.GetReferredShape(subLabelFromComponents, labelReference)
                    #print("I have reached here 6")
                    subLocation = self.shape_tool.GetLocation(subLabelFromComponents)
                    #print("I have reached here 7")
                    self.parentLocations.append(subLocation)
                    refEntry = labelReference.EntryDumpToString()
                    refName = labelReference.GetLabelName()               
                    self.updateOutput(refName, refEntry, subLabelName, subLabelEntry, False) 
                    #print("I have reached here 8")                   
                    self.getSubShapes(
                        labelReference, subLocation, refName, refEntry, subLabelName, subLabelEntry,
                        filename="%s.%s%s" % (split[0], self.validFileName(subLabelName) ,split[1]),
                        name="%s.%s" % (name, subLabelName+refName),
                        parent_node_index=node_index,percentincrement=(1/SubLengthHere)*percentincrement
                        )
                    self.percentage = myPercentage + ((i+1)/SubLengthHere)*percentincrement
                    self.write_status()
                    #print("I have reached here 9")
                    #lvl -= 1
                    #print("<<<<")
                    self.parentLocations.pop()
                    #print("I have reached here 10")
                #else:
                #    self.update_output(subLabelName, subLabelEntry, subName, subEntry) 
            self.indent -= 1 
            self.parentIDs.pop()
            #self.tree+="</ul></li></ul>"    
            
            self.direntry = self.direntry[:mydirectorylen]
        if (not IsAnAssembly) or (SubLengthHere==0) : 
            #print("Sub names", subName)
            #print("I have reached here 11")
            #elif self.shape_tool.IsSimpleShape(subLabel) :
            #print("\n########  simpleshape label :", subLabel)
            #print("I have reached here 12")
            """ if self.shape_tool.IsCompound(subLabel):
                print("I got a compound in simpleshape?")
            else:
                print("I got a csimpleshape?") """
            try:
                shape = self.shape_tool.GetShape(subLabel)
            except Exception as e:
                print("Error while extracting shape",e)
                shape = None
            #print("I have reached here 13")
            if shape:
                subLocation = TopLoc_Location()
                for currentLocation in self.parentLocations:
                    #print("    take subLocation       :", l)
                    subLocation = subLocation.Multiplied(currentLocation)
                
                
                
                """ if self.includeparts:
                    #print("sub include",subName)
                    mesherDict=self.updateParentChild(subName+" "+subEntry,shape)
                    my_parent_id = mesherDict[self.gltf_Dict["id"]]
                    self.parentIDs.append(my_parent_id)
                    self.indent += 1
                    mydirectory = self.validFileName(subName+subEntry)
                    mydirectorylen = len(self.direntry)
                    self.direntry += "/"+mydirectory  """  
                                   
                localTransformation = subLocation.Transformation()  
                self.addAllFeatures(
                    shape,subLabel,localTransformation,subShapesFromParent,
                    subName,subEntry,parentName,parentEntry,parent_node_index,
                    percentincrement,False)
            #if(len(self.outputShapes)<=1):       
            #print("I have reached here 18")
            
            if self.includeparts and (self.edgesize > 0) and self.traversesubshapes:
                #print("I have toIncludeSubShapes gltf for lowest node",basename ) 
                #print("Inside inculdeparts",subName)
                my_parent_id = mesherDict[self.gltf_Dict["id"]]
                mesherDict=self.updateParentChild(subName+" "+subEntry,shape)
                self.parentIDs.append(my_parent_id)
                self.indent += 1
                #self.parentIDs.append(len(self.mstep_dict['tree'])-1)
                #self.tree+="<ul id=\"myUL\"><li><span class=\"caret\">"+html.escape(subName+" "+subEntry+" ")+str(self.uid)+"</span><ul class=\"nested\">"    
            
                mydirectory = self.validFileName(subName+subEntry)
                mydirectorylen = ( len(self.direntry) if self.direntry else 0)
                self.direntry += "/"+mydirectory
                defaultSubcolor = Quantity_Color(0.3, 0.3, 0.3, Quantity_TOC_RGB)  # default color
                myshapecount = 0
                for i in range(subShapesFromParent.Length()):
                    labelForSubShapes = subShapesFromParent.Value(i+1)
                    #print("\n########  simpleshape subshape label :", subLabel)
                    #print("I have reached here 19")
                    shapeForSubShapes = self.shape_tool.GetShape(labelForSubShapes)
                    currentColor, _ = self.setColor(shapeForSubShapes,labelForSubShapes,defaultSubcolor,shape)
                    """ #print("I have reached here 20")
                    
                    colorSet = False
                    if (self.color_tool.GetInstanceColor(shapeForSubShapes, 0, c) or
                            self.color_tool.GetInstanceColor(shapeForSubShapes, 1, c) or
                            self.color_tool.GetInstanceColor(shapeForSubShapes, 2, c)):
                        self.color_tool.SetInstanceColor(shapeForSubShapes, 0, c)
                        self.color_tool.SetInstanceColor(shapeForSubShapes, 1, c)
                        self.color_tool.SetInstanceColor(shapeForSubShapes, 2, c)
                        colorSet = True                    
                    #print("I have reached here 21")
                    if not colorSet:
                        if (self.color_tool.GetColor(labelForSubShapes, 0, c) or
                                self.color_tool.GetColor(labelForSubShapes, 1, c) or
                                self.color_tool.GetColor(labelForSubShapes, 2, c)):
                            self.color_tool.SetInstanceColor(shape, 0, c)
                            self.color_tool.SetInstanceColor(shape, 1, c)
                            self.color_tool.SetInstanceColor(shape, 2, c) """
                    labelForSubShapesName = labelForSubShapes.GetLabelName()
                    labelForSubShapesEntry = labelForSubShapes.EntryDumpToString()                    
                    #print("I have reached here 22")
                                       
                    _, shape_faces, shape_edges, shape_vertices, disect_type, keep_faces = \
                        self.getFeaturesFromShape(shapeForSubShapes,labelForSubShapes,subLocation.Transformation(),currentColor,None, shape, False, False,percentincrement)                    
                    """  shape_disps = []
                    shape_to_disp = BRepBuilderAPI_Transform(shapeForSubShapes, subLocation.Transformation()).Shape()
                    shape_disps.append((shape_to_disp,currentColor)) """
                    
                    for shape_to_disp,faceColor,shapeInFile in shape_faces:
                        myshapecount += 1
                        if shape_to_disp.IsNull():
                            print("No shape was formed when"+str(self.uid)+"\n")
                        else:
                            if self.checkOpenShell(shape_to_disp) :#or shape_to_disp.ShapeType()==TopAbs_SHELL:
                                print("There is no need to add inner infinity shell to the shapes",shape_to_disp.Infinite(), shape_to_disp.ShapeType())
                            else:
                                #print("I have reached here 23")     
                                # position the subshape to display
                                if not shapeInFile in self.outputShapes:
                                    self.fileId += 1
                                    #print("I am writing gltf lowest node",basename,disect_type,self.fileId, shape_to_disp.ShapeType() )
                                    self.updateOutput(subName, subEntry, labelForSubShapesName, labelForSubShapesEntry,  False)
                                    #print("I have reached here 24")
                                    (filefullname, basename) = self.write_step_file(shape_to_disp,labelForSubShapesName+subName,faceColor)
                                    if(disect_type=="FACE"):
                                       _, myCurveCode = recognize_face_entity(shape_to_disp)
                                       entity = recognize_face_entity_info(shape_to_disp)
                                    else:
                                        myCurveCode = ""
                                        entity={}
                                    mycurvepoints=None
                                    #print("My Entity sub Face",entity)
                                    (myMeshID, meshname, uvPlane, solidFoundHere,buffHere,uvbuffHere)=self.add_part(
                                        shape_to_disp,
                                        part_color=faceColor,
                                        filenameuri=filefullname,
                                        filetype= disect_type,
                                        name=disect_type+myCurveCode+labelForSubShapesName+subName,
                                        parent_idx=parent_node_index,
                                        curvecode=myCurveCode,
                                        curvepoints=mycurvepoints,
                                        entity=entity
                                    )
                                    if (solidFoundHere > 0) :                                        
                                        self.outputShapes[shapeInFile] = [shape_to_disp,myCurveCode, mycurvepoints,\
                                            faceColor, myMeshID, my_parent_id, disect_type,\
                                                entity, meshname, disect_type+myCurveCode+labelForSubShapesName+subName,\
                                                    (uvPlane, solidFoundHere, buffHere, uvbuffHere)]
                                    #print(myshapecount,"I am setting with shape color in simple parts",faceColor.Red(),faceColor.Green(),faceColor.Blue())

                                #else:
                                #    diffColor = self.outputShapes[shapeInFile][3]
                                #    #print(myshapecount,"I am not writing with shape color in simple parts",faceColor.Red(),diffColor.Red(),faceColor.Green(),diffColor.Green(),faceColor.Blue(),diffColor.Blue(),labelForSubShapesName, labelForSubShapesEntry)

                            #print("I have reached here 25")                    
                self.indent -= 1
                self.parentIDs.pop()
                #self.tree+="</ul></li></ul>"            
                self.direntry = self.direntry[:mydirectorylen]
            #print("I have reached here 26")
        """ elif self.shape_tool.IsCompound(subLabel) :
            try:
                shape = self.shape_tool.GetShape(subLabel)
            except Exception as e:
                print("Error while extracting shape",e)
                shape = None
            print("I got a compound ?")
            mesherDict=self.updateParentChild(subName+" "+subEntry, shape)
            #print(mesherDict)
            self.parentIDs.append(mesherDict[self.gltf_Dict["id"]])
            self.indent += 1
            #self.parentIDs.append(len(self.mstep_dict['tree'])-1)            
            #self.tree+="<ul id=\"myUL\"><li><span class=\"caret\">"+html.escape(subName+" "+subEntry+" ")+str(self.uid)+"</span><ul class=\"nested\">"    
            #self.output+="\nXOXO"+subName+subEntry+"\n"
            #print("I have reached here 2")
            mydirectory = self.validFileName(subName+subEntry)
            mydirectorylen = len(self.direntry)
            self.direntry += "/"+mydirectory
            
            split = os.path.splitext(filename)
            node_index = 0
            subLocation = TopLoc_Location()
            for currentLocation in self.parentLocations:
                #print("    take subLocation       :", l)
                subLocation = subLocation.Multiplied(currentLocation)
            c = Quantity_Color(0.5, 0.5, 0.5, Quantity_TOC_RGB)
            it = TopoDS_Iterator(shape)            
            while it.More():
                shp = it.Value()
                it.Next()
                shape_to_disp = BRepBuilderAPI_Transform(shp, subLocation.Transformation()).Shape()
                if shape_to_disp.IsNull():
                    print("No shape was formed when"+str(self.uid)+"\n")
                else:
                    #print("I have reached here 23")     
                    # position the subshape to display
                    if not shape_to_disp in self.outputShapes:
                        self.fileId += 1
                        labelForSubShapesName = "Compound"+str(self.fileId)
                        labelForSubShapesEntry = "CompoundEntry"+str(self.fileId)
                        #print("I am writing gltf lowest node",basename,shape_to_disp.ShapeType() )
                        self.updateOutput(subName, subEntry, labelForSubShapesName, labelForSubShapesEntry,  False)
                        print("I have reached here 24")
                        self.outputShapes[shape_to_disp] = [subName, subEntry, c, self.uid, self.indent, labelForSubShapesName, labelForSubShapesEntry]
                        (filefullname, basename) = self.write_step_file(shape_to_disp,labelForSubShapesName+labelForSubShapesEntry)
                        self.add_part(
                            shape_to_disp,
                            part_color=c,
                            filenameuri=filefullname,
                            filename= filename,
                            name=labelForSubShapesName+subName,
                            parent_idx=parent_node_index,
                            ) 
                        print("I have reached here 25")
            self.indent -= 1
            self.parentIDs.pop()
            #self.tree+="</ul></li></ul>"            
            self.direntry = self.direntry[:mydirectorylen]
        else:
            print("I can not do anything with this shape?") """
        self.percentage = myPercentage + percentincrement
        self.write_status()
    
    def updateName(self,name,forNodes,addOne=0,display=False):
        suffix = self.fileprefix+str(self.distancegap)+str(self.anglegap)+" "+str(self.uniqueid+addOne)         
        if name:
            nameForNode = html.escape(self.validFileName(name+" "+suffix))            
        else:
            nameForNode = html.escape(self.validFileName("No Name"+" "+suffix))             
        
        if display:
            forNodes[self.gltf_Dict["name"]] = nameForNode
            if name:
                forNodes[self.gltf_Dict["display"]] = html.escape(name+" "+suffix)
            else:
                forNodes[self.gltf_Dict["display"]] = html.escape("No Name"+" "+suffix)
        else:
            forNodes['name'] = nameForNode

    def getShapes(self):
        #print("I have reached here in getshapes 1")
        labels = TDF_LabelSequence()
        self.shape_tool.GetFreeShapes(labels)
        #self.shape_tool.GetShapes(labels)
        #print("I have reached here in getshapes 2")
        topLevelItems = labels.Length()
        if topLevelItems<1 :            
            print("No Labels, going further",self.fname)
            self.shape_tool.GetShapes(labels)
            topLevelItems = labels.Length()
        if topLevelItems<1 :
            print("Not supported, ",self.fname)   
            rootlabel = '' # First label at root
            #print("I have reached here in getshapes 3")
            # Get information from root label
            rootName = ''
            rootEntry = ''
            isAssembly = False
            subComponentsFromParent = None
            uid = ''
        else: 
            rootlabel = labels.Value(1) # First label at root
            #print("I have reached here in getshapes 3")
            # Get information from root label
            rootName = rootlabel.GetLabelName()
            rootEntry = rootlabel.EntryDumpToString()
            isAssembly = self.shape_tool.IsAssembly(rootlabel)
            subComponentsFromParent = TDF_LabelSequence()
            self.shape_tool.GetComponents(rootlabel, subComponentsFromParent)
            isAssembly = isAssembly or subComponentsFromParent.Length() > 0
            uid = self.get_uid_from_entry(rootEntry)
        
            print("root label",rootName, topLevelItems,"items")
        filename = self.displaypath+self.basefilename+".gltf"
        split = os.path.splitext(filename)
        name = self.basefilename #os.path.basename(filename)
        self.outputShapes = {} #dictionary
        self.outputFaces = {}
        self.outputEdges = {}
        self.outputCorners = {}
        self.outputFeatures=[]
        self.outputCompounds={}
        self.outputCompSolids={}

        self.parentLocations = [] #list
        self.uid = 0
        self.fileId = 0 
        self.binId = 0   
        
        self.output += f"{self.uid}--{uid}\t[{rootEntry}] {rootName}\t"        
        self.uid += 1
        self.indent += 1
        self.output += f"Number of labels at root = {topLevelItems}\n"
        self.direntry = self.displaypath+self.validFileName(name+rootName+rootEntry)
        parent_node_index = 0
        node_index = 0
        self.parentIDs.append(None)
        if isAssembly:
            print("Is Assembly", isAssembly, "Components", subComponentsFromParent.Length() )
        else: #manually create the assembly
            #print("Outside",rootName)
            mesherDict = self.updateParentChild(name+" "+rootName+" "+rootEntry,None)
            self.parentIDs.append(mesherDict[self.gltf_Dict["id"]])
            #self.tree+="<ul id=\"myUL\"><li><span class=\"caret\">"+html.escape(name+" "+rootName+" "+rootEntry+" ")+str(self.uid)+"</span><ul class=\"nested\">"    

        node_index = len(self.mstep_dict['nodes'])
        node = {}
        #node.update(self.transformed_matrix)
        if isAssembly:
            self.updateName(name,node,1)
        else:
            self.updateName(name,node)
        self.mstep_dict['nodes'].append(node)

        # Add this node to its parent
        parent_node = self.mstep_dict['nodes'][parent_node_index]
        parent_node['children'] = parent_node.get('children', []) + [node_index]
        #print("I have reached here in getshapes 4",self.output)
        for i in range(topLevelItems):
            #print("I have reached here in getshapes 5")
            topLevelItem = labels.Value(i+1) 
            #print("I have reached here in getshapes 6")          
            topLevelName = topLevelItem.GetLabelName()
            #print("I have reached here in getshapes 7")
            topLevelEntry = topLevelItem.EntryDumpToString()
            #print("I have reached here in getshapes 8")
            print(i, topLevelName, topLevelEntry)
            #print("I have reached here in getshapes 9")
            try:
                self.getSubShapes(
                    topLevelItem, None, topLevelName, topLevelEntry, "root", "root",
                    filename="%s.%s%s" % (split[0], self.validFileName(topLevelName), split[1]),
                    name="%s.%s" % (name, topLevelName),
                    parent_node_index=node_index, percentincrement=(1/topLevelItems)*80
                    )
            except Exception as e:
                print("Error",e)
            self.percentage = ((i+1) / topLevelItems) * 80
            self.write_status()
        #self.percentage = 100
        self.write_status()
        #print("I have reached here in getshapes 10")
        if isAssembly:
            print("Assembly is splitted")
        else: #manually create the assembly
            print("Part is sliced")
            #self.tree+="</ul></li></ul>" 

    def findMyShapeByTreeID(self,treeID):
        #print ("outside loop",shapes,len(shapes.items()))
        for hash_shape, item in self.recursiveShapes.items():
            #print("Inside loop",item)
            [shape_to_disp, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, (uvPlane, solidfound, buff, uvbuff)] = item
            if myId == treeID:
                return item
        return None

    def findMyShapeByTreeName(self,treeName):
        #print ("outside loop",shapes,len(shapes.items()))
        for hash_shape, item in self.recursiveShapes.items():
            #print("Inside loop",item)
            [shape_to_disp, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, (uvPlane, solidfound, buff, uvbuff)] = item
            if basenamehere == treeName:
                return item
        return None

    
    
    def addShapes(self):        
        
       
        filename = self.displaypath+self.basefilename+".gltf"
        #split = os.path.splitext(filename)
        name = os.path.basename(filename)
        rootEntry = filename
        rootName = self.basefilename
        
        uid = self.get_uid_from_entry(rootEntry)
        
        self.outputShapes = {} #dictionary
        self.parentLocations = [] #list
        self.outputFeatures = []
        self.uid = 0
        self.fileId = 0 
        self.binId = 0   
        
        self.output += f"{self.uid}--{uid}\t[{rootEntry}] {rootName}\t"        
        self.uid += 1
        self.indent += 1
        self.output += f"Number of labels at root = {filename}\n"
        self.direntry = self.displaypath+self.validFileName(name+rootName+rootEntry)
        parent_node_index = 0
        node_index = 0
        self.parentIDs.append(None)
        mesherDict = self.updateParentChild(name+" "+rootName,None)
        self.parentIDs.append(mesherDict[self.gltf_Dict["id"]])
        
        node_index = len(self.mstep_dict['nodes'])
        node = {}
        #node.update(self.transformed_matrix)
        self.updateName(name,node)
        self.mstep_dict['nodes'].append(node)
        if self.defaultColor:
            c = self.defaultColor
        else:
            c = Quantity_Color(0.3, 0.32, 0.37, Quantity_TOC_RGB) 
        # Add this node to its parent
        parent_node = self.mstep_dict['nodes'][parent_node_index]
        parent_node['children'] = parent_node.get('children', []) + [node_index]
        #print("I have reached here in getshapes 4",self.output)
        myLenShapesList = len(self.shapeslist)
        for a_shape_to_disp in self.shapeslist:
            shape_to_disp, shape_name, shape_color = a_shape_to_disp
            if shape_color==None:
                shape_color = c
            hash_shape = hash(shape_to_disp)
            try:
               if not hash_shape in self.outputShapes:
                    self.fileId += 1
                    subName = self.basefilename+str(self.fileId)
                    subEntry = subName
                    #print("I am writing gltf lowest node",basename,shape_to_disp.ShapeType() )
                    self.updateOutput(subName, subEntry, rootName, rootEntry,  False)
                    #print("I have reached here 24")
                    (filefullname, basenamehere) = self.write_step_file(shape_to_disp,shape_name,shape_color)
                    (myMeshID,meshname, uvPlane,solidFoundHere,buffHere,uvbuffHere)=self.add_part(
                        shape_to_disp,
                        part_color=shape_color,
                        filenameuri=filefullname,
                        filetype= "PART",
                        name="PART"+shape_name,
                        parent_idx=parent_node_index,
                        curvecode=" ",
                        curvepoints=None,
                        entity={}
                    )  
                    if(solidFoundHere>0):                  
                        self.outputShapes[hash_shape] = [shape_to_disp, " ", None, c, myMeshID,\
                            self.parentIDs[-1], "PART", None, meshname, "PART"+shape_name,\
                                (uvPlane, solidFoundHere, buffHere, uvbuffHere)]
 
            except Exception as e:
                print("Error",e)
            self.percentage += (1/myLenShapesList)*80
            self.write_status()
            #print("I have reached here in getshapes 10")
        print("Part is seperated")
            #self.tree+="</ul></li></ul>" 
    
    def addFeature(self,outputFeature,parentID, treeLen, myFeatureName):  
        #print("I have reached here in getshapes 0",self.output)      
        if self.fname:
            self.output += f"Assembly structure of file: {self.fname}\n\n"
        else:
            self.output += "Assembly structure of doc:\n\n"
        self.indent = 0
        #print("I have reached here in getshapes 1",self.output)
        filename = self.displaypath+self.basefilename+".gltf"
        #split = os.path.splitext(filename)
        name = os.path.basename(filename)
        rootEntry = filename
        rootName = self.basefilename
        
        uid = self.get_uid_from_entry(rootEntry)
        #print("I have reached here in getshapes 2",self.output)
        self.outputShapes = {} #dictionary
        self.parentLocations = [] #list
        self.outputFeatures = []
        self.uid = 0
        self.fileId = 0 
        self.binId = 0   
        
        self.output += f"{self.uid}--{uid}\t[{rootEntry}] {rootName}\t"        
        self.uid += 1
        self.indent += 1
        self.output += f"Number of labels at root = {filename}\n"
        self.direntry = self.displaypath+self.validFileName(name+rootName+rootEntry)
        parent_node_index = 0
        node_index = 0
        self.parentIDs.append(None)
        myFeatureDisplay = ""
        if myFeatureName=="f":
            myFeatureDisplay = "FACE"
        elif myFeatureName=="e":
            myFeatureDisplay="EDGE"
        elif myFeatureName=="v":
            myFeatureDisplay="VERTEX"

        mesherDict = self.updateParentChild(name+" "+myFeatureDisplay,None)
        mesherDict[self.gltf_Dict["element"]]=myFeatureName
        self.parentIDs.append(mesherDict[self.gltf_Dict["id"]])
        #print("I have reached here in getshapes 3",self.output)
        node_index = len(self.mstep_dict['nodes'])
        node = {}
        #node.update(self.transformed_matrix)
        self.updateName(name,node)
        self.mstep_dict['nodes'].append(node)
        if self.defaultColor:
            c = self.defaultColor
        else:
            c = Quantity_Color(0.3, 0.32, 0.37, Quantity_TOC_RGB)
        # Add this node to its parent
        parent_node = self.mstep_dict['nodes'][parent_node_index]
        parent_node['children'] = parent_node.get('children', []) + [node_index]
        #print("I have reached here in getshapes 4",self.output)
        for (shape_to_disp,myColor,myfilename,myname,mytype,mycurvecode,mycurvepoints,entities) in outputFeature:
            #print(shape_to_disp,myColor,myfilename,myname) 
            hash_shape = hash(shape_to_disp)
            #print("My Entity features",entities)
            try:
               if not hash_shape in self.outputShapes:
                    self.fileId += 1
                    subName = self.basefilename+str(self.fileId)
                    subEntry = subName
                    #print("I am writing gltf lowest node",basename,shape_to_disp.ShapeType() )
                    self.updateOutput(subName, subEntry, rootName, rootEntry,  False)
                    #print("I have reached here 24")
                    #(filefullname, myfullname) = myfilename,myname
                    self.add_part(
                        shape_to_disp,
                        part_color=myColor,
                        filenameuri=myfilename,
                        filetype= mytype,
                        name=myname,
                        parent_idx=parent_node_index,
                        curvecode=mycurvecode,
                        curvepoints=mycurvepoints,
                        entity=entities
                    )                    
                    #self.outputShapes[hash_shape] = [shape_to_disp, subName, subEntry, c, self.uid, self.indent, rootName, rootEntry, meshname, basenamehere, uvPlane]
 
            except Exception as e:
                print("Error",e)
            #print("I have reached here in getshapes 10")
        for mesh_dict in self.tstep_dict['tree']:
            mesh_dict[self.gltf_Dict["id"]]+=treeLen
            if mesh_dict[self.gltf_Dict["parentId"]]:
                mesh_dict[self.gltf_Dict["parentId"]]+=treeLen
            else:
                mesh_dict[self.gltf_Dict["parentId"]]=parentID
            mesh_dict[self.gltf_Dict["subfeatures"]]=myFeatureName
        dict_return = {
            "gltf":self.mstep_dict,
            "tree":self.tstep_dict['tree'],
            "store":self.basefilename,
            "load":self.fname,
            "gdttable":[{ "edges":[],
                          "selectedObjects":[],
                          "parentObjects":[],
                          "mates":[],
                          "mateValues": [False,False,False,False,False,False],
                          "angle":0,
                          "offset":0,
                          "option":26,
                          "key":"" }],
            "status": {"percent":self.percentage,
                        "start":self.starttime.strftime("%H-%M-%S"),
                        "current":datetime.utcnow().strftime("%H-%M-%S") },
             "display":COPY_PATH+self.displaypath
        }
        if self.writethread:
            mythread = threading.Thread(target=self.write_in_thread, daemon=True, args=(dict_return,False,False))
            mythread.start()
        else:
            self.write_in_thread(dict_return,False,False)
        """ mythread = threading.Thread(target=self.write_in_thread,args=(dict_return,False))
        mythread.start() """
        print(self.basefilename,"Features are seperated")
        
        return len(self.tstep_dict['tree'])
            #self.tree+="</ul></li></ul>" 
    
    def convertToBase64(self,points):
        if points:
            lenPoints = len(points)
            if lenPoints>0:
                floatBuff = TranslationBuffer(
                    max_index=lenPoints
                )            
                for steps in range(lenPoints):
                    x,y,z=points[steps]
                    floatBuff.add_translation(x,y,z)
                    #print(x,y,z)  
                base64data = base64.b64encode(floatBuff.read()).decode('ascii')
                retString = "{data}".format(
                    data=base64data,
                )  
                return retString, floatBuff.return_boundary()
            else:
                return "", ((0,0,0),(0,0,0))
        else:
            return points, ((0,0,0),(0,0,0))
    
    def convertEntityToBase64(self,entity):        
        #print("outside", (self.gltf_Dict['xdir']), entity, ((self.gltf_Dict['xdir']) in entity) )
        if  self.gltf_Dict['xdir'] in entity:
            #print("inside",entity)
            floatBuff = TimeBuffer(15)
            xdir = entity[self.gltf_Dict['xdir']]
            floatBuff.add_time(xdir[0])
            floatBuff.add_time(xdir[1])
            floatBuff.add_time(xdir[2])
            ydir = entity[self.gltf_Dict['ydir']]
            floatBuff.add_time(ydir[0])
            floatBuff.add_time(ydir[1])
            floatBuff.add_time(ydir[2])
            center = entity[self.gltf_Dict['center']]
            floatBuff.add_time(center[0])
            floatBuff.add_time(center[1])
            floatBuff.add_time(center[2])
            floatBuff.add_time(entity[self.gltf_Dict['firstU']])
            floatBuff.add_time(entity[self.gltf_Dict['lastU']])
            floatBuff.add_time(entity[self.gltf_Dict[ ('radius') if entity[self.gltf_Dict['code']]=='C' else\
                 ('focal' if entity[self.gltf_Dict['code']]=='P' else 'major')]] )
            if (entity[self.gltf_Dict['code']]!='C') and (entity[self.gltf_Dict['code']]!='P') :
                floatBuff.add_time(entity[self.gltf_Dict[ ('minor')]])            
            base64data = base64.b64encode(floatBuff.read()).decode('ascii')
            retString = "{data}".format(
                    data=base64data,
            )  
            return {
                self.gltf_Dict['code']:entity[self.gltf_Dict['code']],
                self.gltf_Dict['basic']:retString           
            }
        elif self.gltf_Dict['degree'] in entity:
            floatBuff = TimeBuffer(255)
            floater = 0
            if entity[self.gltf_Dict['code']]=='I':                
                floater = entity[self.gltf_Dict['periodic']]+\
                    (entity[self.gltf_Dict['rational']]*2.0)+\
                        (entity[self.gltf_Dict['degree']]*4.0) #packing 4 bytes..
                floatBuff.add_time(floater)
                #print("What I got Spline",floater,len_pole,len_knot,entity[self.gltf_Dict['degree']])
            else:
                floater = entity[self.gltf_Dict['degree']]*4.0
                floatBuff.add_time(floater)
                #print("What I got Bezier",floater,len_pole,entity[self.gltf_Dict['degree']])
            poles = entity[self.gltf_Dict['poles']]
            len_pole = len(poles)
            len_pole = max(len_pole,entity[self.gltf_Dict['pole']],len(entity[self.gltf_Dict['weights']]))
            floatBuff.add_time(len_pole)  
            if entity[self.gltf_Dict['code']]=='I':
                knots = entity[self.gltf_Dict['knots']]
                len_knot = len(knots)
                len_knot = max(len_knot,entity[self.gltf_Dict['knot']])
                floatBuff.add_time(len_knot)
                floatBuff.add_time(entity[self.gltf_Dict['start']])
                floatBuff.add_time(entity[self.gltf_Dict['end']])
            #print("What I got Outside",floater,len_pole,entity[self.gltf_Dict['degree']],entity)
            pole_copied = 0
            lastpole = 0.0
            for pole in poles:
                pole_copied+=1
                floatBuff.add_time(pole[0])
                floatBuff.add_time(pole[1])
                floatBuff.add_time(pole[2])
                lastpole = pole
            if pole_copied != len_pole:
                print("Issue in number of poles, adjusting")
                for _ in range(len_pole-pole_copied):
                    floatBuff.add_time(lastpole[0])
                    floatBuff.add_time(lastpole[1])
                    floatBuff.add_time(lastpole[2]) 
            weights = entity[self.gltf_Dict['weights']]
            pole_copied = 0
            lastweight = 0.0
            for weight in weights:
                pole_copied+=1
                floatBuff.add_time(weight)
                lastweight = weight
            if pole_copied != len_pole:
                print("Issue in number of weights, adjusting")
                for _ in range(len_pole-pole_copied):
                    floatBuff.add_time(lastweight) 
            if entity[self.gltf_Dict['code']]=='I':
                knots = entity[self.gltf_Dict['knots']]
                knots_copied = 0
                lastknot=0
                for knot in knots:
                    knots_copied+=1
                    floatBuff.add_time(knot)
                    lastknot = knot
                if knots_copied != len_knot:
                    print("Issue in number of knots, adjusting")
                    for _ in range(len_knot-knots_copied):
                        floatBuff.add_time(lastknot)
                multiplicities=entity[self.gltf_Dict['multiplicities']]  
                for multiplicity in multiplicities:
                    floatBuff.add_time(multiplicity)
            #zippeddata = zlib.compress(floatBuff.read())
            #base64data = base64.b64encode(zippeddata).decode('ascii')
            base64data = base64.b64encode(floatBuff.read()).decode('ascii')
            retString = "{data}".format(
                    data=base64data,
            )  
            return {
                self.gltf_Dict['code']:entity[self.gltf_Dict['code']],
                self.gltf_Dict['basic']:retString           
            }
        else:            
            return {}

    def write_progress(self,maxgap=10,action='',written=False):
        currenttime = datetime.utcnow()
        timingdelta = currenttime-self.currenttime            
        if (timingdelta.total_seconds() >= maxgap) or (maxgap==0): 
            with open(self.progressfile, 'w') as fh:
                fh.write(
                    json.dumps({
                        "begin":self.lenfeature,
                        "end":self.lenFeatures,
                        "start":self.edgestarttime.strftime("%H-%M-%S"),
                        "current":currenttime.strftime("%H-%M-%S"),
                        "children":self.myParentId_Dict,
                        "action":action,
                        "finish":currenttime.strftime("%H-%M-%S") if (maxgap==0) and (self.lenfeature>0) else '',
                        "childfiles":self.childfiles,
                        "childwritten":written},
                        sort_keys=True, 
                        indent=2 ))
            self.currenttime=currenttime

    def addFeatures(self):  
        try:
            if self.logging != None and self.addfeaturesThread:
                self.logging.info("Started addFeatures Thread") 
        except Exception as e:
            print("Error while logging",e)
        head, tail = os.path.split(self.fname) 
        if(head[:-1]!="/"):
            #print("Head does not contain last /",head)
            head = head + "/"
        #else:
            #print("Head contains last /",head)       
        pathfilename, _ = os.path.splitext(tail)
        myTreeLen = len(self.tstep_dict["tree"])
        self.lenFeatures = len(self.outputFeatures)
        self.lenfeature = 0
        #newfilename = self.displaypath+pathfilename+".progress"
        self.myParentId_Dict={}
        self.edgestarttime = datetime.utcnow() 
        self.currenttime = self.edgestarttime
        #self.progressfile = newfilename
        self.lenfeature = 0
        self.write_progress(0)
        """ with open(newfilename, 'w') as fh:
            fh.write(
                json.dumps({
                    "begin":lenfeature,
                    "end":lenFeatures,
                    "start":starttime.strftime("%H-%M-%S"),
                    "current":currenttime.strftime("%H-%M-%S"),
                    "children":myParentId_Dict},
                    sort_keys=True, 
                    indent=2 )) """
        for outputFeature in self.outputFeatures:
            """ timingdelta = datetime.utcnow()-currenttime            
            if (timingdelta.seconds >= 10): 
                with open(newfilename, 'w') as fh:
                    fh.write(
                        json.dumps({
                            "begin":lenfeature,
                            "end":lenFeatures,
                            "start":starttime.strftime("%H-%M-%S"),
                            "current":currenttime.strftime("%H-%M-%S"),
                            "children":myParentId_Dict},
                            sort_keys=True, 
                            indent=2 ))
                currenttime=datetime.utcnow() """
            #print(outputFeature)
            self.write_progress()
            
            myparentID =  outputFeature["Id"]             
            self.myParentId_Dict[myparentID]={}
            for myFeatureName in ["f","e","v"]:
                self.write_progress()
                myTotalshapes = outputFeature[myFeatureName]                 
                self.myParentId_Dict[myparentID][myFeatureName]=0
                if(myTotalshapes):
                    myTotalLenShapes = len(myTotalshapes)
                    if self.multiplegltf > 0:
                        mySplitFiles =  math.ceil(myTotalLenShapes / self.multiplegltf)
                    else:
                        mySplitFiles = 1
                    start=0            
                    self.myParentId_Dict[myparentID][myFeatureName]=mySplitFiles                    
                    for iFiles in range(mySplitFiles):
                        self.write_progress()
                        if(mySplitFiles==1):
                            myshapes = myTotalshapes
                        else:
                            end = start + self.multiplegltf
                            if end > myTotalLenShapes:
                                end = myTotalLenShapes
                            #print("MyStart",start,end)
                            myshapes= myTotalshapes[start:end]
                            start = end
                        if iFiles > 0:       
                            fname = pathfilename+"-"+str(myparentID)+"-"+myFeatureName+str(iFiles)+"."
                        else:
                            fname = pathfilename+"-"+str(myparentID)+"-"+myFeatureName+"."                    
                        print("Disecting", fname, iFiles+1,"/", mySplitFiles, ",", self.lenfeature,"/",self.lenFeatures)
                        addedTrees = StepIgesAnalyser(filename=head+fname,shapeslist=["Dummy"],thumbheight=0,thumbwidth=0,addfeaturesThread=False).\
                            addFeature(myshapes,myparentID,myTreeLen,myFeatureName)
                        myTreeLen+=addedTrees
            self.lenfeature+=1
        
        try:
            if (COPY_PATH!=''):
                self.lenfeature -= 1
                if self.lenfeature < 0:
                    self.lenfeature = 0
                self.copytree(self.displaypath,COPY_PATH+self.displaypath,"Progress")
                self.lenfeature += 1
        except Exception as e:
            print("Error while copying Edges to s3",e)    
        self.lenfeature = self.lenFeatures
        self.write_progress(0)
        """ with open(newfilename, 'w') as fh:
            currenttime=datetime.utcnow()
            fh.write(
                json.dumps({
                    "begin":lenfeature,
                    "end":lenFeatures,
                    "start":starttime.strftime("%H-%M-%S"),
                    "current":currenttime.strftime("%H-%M-%S"),
                    "children":myParentId_Dict},
                    sort_keys=True, 
                    indent=2 )) """
        try:
            if self.logging != None and self.addfeaturesThread:
                self.logging.info("Completed addFeatures Thread ")
        except Exception as e:
            print("Error while logging",e)
    
    def addAnimations(self):
        if self.animations == None:
            return            
        lenAnimations = len(self.animations)        
        if( lenAnimations<=0  ):
            return
        samplers = []
        chanels = []
        lenShapeOrder = len(self.shapeorder)
        if lenShapeOrder>0:
            rotationtimebuff = TimeBuffer(
                max_index=lenAnimations+2
            )            
            rotationbuff =RotationBuffer(
                max_index=lenAnimations+2
            )
            for steps in range(lenAnimations+3):
                rotationtimebuff.add_time(steps*self.delay)
                theta = 2*math.pi*steps/(lenAnimations+2)
                rotationbuff.add_rotation(0,0,math.sin(theta),math.cos(theta))
            buffer_index = len(self.mstep_dict['buffers'])
            rotationlen = len(rotationtimebuff)
            buffer_dict = {
                "byteLength":  rotationlen                                 
            }   
            base64data = base64.b64encode(rotationtimebuff.read()).decode('ascii')
            buffer_dict['uri'] = "data:{mimetype};base64,{data}".format(
                mimetype="application/octet-stream",
                data=base64data,
            )   
            self.mstep_dict['buffers'].append(buffer_dict)          
            bufferView_index = len(self.mstep_dict['bufferViews'])
            bufferview = {
                "buffer" : buffer_index,
                "byteOffset" : 0,
                "byteLength" : rotationlen
            }            
            self.mstep_dict['bufferViews'].append(bufferview)
            buffer_index = len(self.mstep_dict['buffers'])
            rotationlen = len(rotationbuff)
            buffer_dict = {
                "byteLength":  rotationlen                                 
            }   
            base64data = base64.b64encode(rotationbuff.read()).decode('ascii')
            buffer_dict['uri'] = "data:{mimetype};base64,{data}".format(
                mimetype="application/octet-stream",
                data=base64data,
            )  
            self.mstep_dict['buffers'].append(buffer_dict) 
            bufferView_index = len(self.mstep_dict['bufferViews'])
            bufferview = {
                "buffer" : buffer_index,
                "byteOffset" : 0,
                "byteLength" : rotationlen
            }            
            self.mstep_dict['bufferViews'].append(bufferview)
            accessor_index = len(self.mstep_dict['accessors'])
            accessorview = [ {
                "bufferView" : bufferView_index-1,
                "byteOffset" : 0,
                "componentType" : 5126,
                "count" : lenAnimations+3,
                "type" : "SCALAR",
                "max" : [ rotationtimebuff.time_max ],
                "min" : [ rotationtimebuff.time_min ]
                },
                {
                "bufferView" : bufferView_index,
                "byteOffset" : 0,
                "componentType" : 5126,
                "count" : lenAnimations+3,
                "type" : "VEC4",
                "max" : [ rotationbuff.rotation_umax, rotationbuff.rotation_vmax, rotationbuff.rotation_wmax, rotationbuff.rotation_xmax ],
                "min" : [ rotationbuff.rotation_umin, rotationbuff.rotation_vmin, rotationbuff.rotation_wmin, rotationbuff.rotation_xmin ]
                } ]
            self.mstep_dict['accessors'].append(accessorview[0])
            self.mstep_dict['accessors'].append(accessorview[1])
            
            self.mstep_dict['nodes'][2]['rotation']=[ 0.0, 0.0, 0.0, 1.0 ]
            
            sampler = { 
                "input" : accessor_index,
                "interpolation" : "LINEAR",
                "output" : accessor_index+1
            }
            samplers.append(sampler)            
            chanel = {
                    "sampler" : 0,
                    "target" : {
                    "node" : 2,
                    "path" : "rotation"
                    }
                }
            chanels.append(chanel)
            startRange = 0
        else:
            startRange = 1  
                    
        for steps in range(1,lenAnimations+1):
            #print(steps,lenAnimations)
            lenOfAnimationsTime = steps+1 #or lenAnimations ; it works for both...
            timebuff = TimeBuffer(
                max_index=2
            )  
            translationbuff =TranslationBuffer(
                max_index=2
            )
            mystep = steps-1
            if lenShapeOrder > 0:
                mystep = self.shapeorder[steps-1]  
            u,v,w=self.animations[mystep]
            print("steps",steps,mystep, u,v,w)
            if lenShapeOrder > 0:
                for istep in range(lenOfAnimationsTime):  
                    timebuff.add_time(istep*self.delay)
                    if istep < steps:                 
                        translationbuff.add_translation(0,0,0)
                    else:
                        translationbuff.add_translation(-u,-v,-w)
                #timebuff.add_time(steps*self.delay)
                #print(steps-1)
                
                #print (steps-1,u,v,w)
                
            else:
                timebuff.add_time(0)
                #translationbuff.add_translation(0,0,0)
                #print(steps-1)
                #timebuff.add_time(self.delay)
                #u,v,w=self.animations[steps-1]
                #print (steps-1,u,v,w)
                translationbuff.add_translation(-u,-v,-w)
                for istep in range(1,lenOfAnimationsTime):  
                    timebuff.add_time(istep*self.delay)                 
                    translationbuff.add_translation(0,0,0)                                       
            buffer_index = len(self.mstep_dict['buffers'])
            timelen = len(timebuff)
            #print(timelen,self.rotateFirst)
            buffer_dict = {
                "byteLength":  timelen                                 
            }   
            base64data = base64.b64encode(timebuff.read()).decode('ascii')
            buffer_dict['uri'] = "data:{mimetype};base64,{data}".format(
                mimetype="application/octet-stream",
                data=base64data,
            )   
            self.mstep_dict['buffers'].append(buffer_dict)          
            bufferView_index = len(self.mstep_dict['bufferViews'])
            bufferview = {
                "buffer" : buffer_index,
                "byteOffset" : 0,
                "byteLength" : timelen
            }            
            self.mstep_dict['bufferViews'].append(bufferview)
            buffer_index = len(self.mstep_dict['buffers'])
            translationlen = len(translationbuff)
            buffer_dict = {
                "byteLength":  translationlen                                 
            }   
            base64data = base64.b64encode(translationbuff.read()).decode('ascii')
            buffer_dict['uri'] = "data:{mimetype};base64,{data}".format(
                mimetype="application/octet-stream",
                data=base64data,
            )  
            self.mstep_dict['buffers'].append(buffer_dict) 
            bufferView_index = len(self.mstep_dict['bufferViews'])
            bufferview = {
                "buffer" : buffer_index,
                "byteOffset" : 0,
                "byteLength" : translationlen
            }            
            self.mstep_dict['bufferViews'].append(bufferview)
            accessor_index = len(self.mstep_dict['accessors'])
            accessorview = [ {
                "bufferView" : bufferView_index-1,
                "byteOffset" : 0,
                "componentType" : 5126,
                "count" : lenOfAnimationsTime, #steps+1,
                "type" : "SCALAR",
                "max" : [ timebuff.time_max ],
                "min" : [ timebuff.time_min ]
                },
                {
                "bufferView" : bufferView_index,
                "byteOffset" : 0,
                "componentType" : 5126,
                "count" : lenOfAnimationsTime, #steps+1,
                "type" : "VEC3",
                "max" : [ translationbuff.translation_umax, translationbuff.translation_vmax,translationbuff.translation_wmax ],
                "min" : [ translationbuff.translation_umin,translationbuff.translation_vmin,translationbuff.translation_wmin ]
                } ]
            self.mstep_dict['accessors'].append(accessorview[0])
            self.mstep_dict['accessors'].append(accessorview[1])
            node_id = mystep+3
            if lenShapeOrder > 0:
                self.mstep_dict['nodes'][node_id]['translation']=[ 0.0, 0.0, 0.0 ]
            else:
                self.mstep_dict['nodes'][node_id]['translation']=[ -u, -v, -w]
            sampler = { 
                "input" : accessor_index,
                "interpolation" : "LINEAR",
                "output" : accessor_index+1
            }
            samplers.append(sampler)            
            chanel = {
                "sampler" : steps-startRange,
                "target" : {
                "node" : node_id,
                "path" : "translation"
                }
            }
            chanels.append(chanel)

        animationchannels = [{
            "samplers" : samplers,
            "channels" : chanels
            }
        ]
        self.mstep_dict['animations']=animationchannels

        """ animationbuffer =  {
            "uri" : "data:application/octet-stream;base64,AAAAAAAAgD4AAAA/AABAPwAAgD8AAAAAAAAAAAAAAAAAAIA/AAAAAAAAAAD0/TQ/9P00PwAAAAAAAAAAAACAPwAAAAAAAAAAAAAAAPT9ND/0/TS/AAAAAAAAAAAAAAAAAACAPw==",
            "byteLength" : 100
            }
        animationbufferview = {
            "buffer" : 1,
            "byteOffset" : 0,
            "byteLength" : rotationlen
            }
        animationaccessorview = [ {
            "bufferView" : 2,
            "byteOffset" : 0,
            "componentType" : 5126,
            "count" : 5,
            "type" : "SCALAR",
            "max" : [ 1.0 ],
            "min" : [ 0.0 ]
            },
            {
            "bufferView" : 2,
            "byteOffset" : 20,
            "componentType" : 5126,
            "count" : 5,
            "type" : "VEC4",
            "max" : [ 0.0, 0.0, 1.0, 1.0 ],
            "min" : [ 0.0, 0.0, 0.0, -0.707 ]
            } ]
        animationchannels = [{
            "samplers" : [
                {
                "input" : 2,
                "interpolation" : "LINEAR",
                "output" : 3
                }
            ],
            "channels" : [ {
                "sampler" : 0,
                "target" : {
                "node" : 2,
                "path" : "rotation"
                }
            } ]
            }
        ]
        buffer_length_current = len(self.mstep_dict['buffers'])        
        self.mstep_dict['buffers'].append(animationbuffer)
        bufferView_index = len(self.mstep_dict['bufferViews'])
        animationbufferview['buffer']=buffer_length_current
        self.mstep_dict['bufferViews'].append(animationbufferview)
        accessor_index = len(self.mstep_dict['accessors'])
        animationaccessorview[0]['bufferView']=bufferView_index
        animationaccessorview[1]['bufferView']=bufferView_index
        self.mstep_dict['accessors'].append(animationaccessorview[0])
        self.mstep_dict['accessors'].append(animationaccessorview[1])
        animationchannels[0]['samplers'][0]['input']=accessor_index
        animationchannels[0]['samplers'][0]['output']=accessor_index+1
        self.mstep_dict['nodes'][2]['rotation']=[ 0.0, 0.0, 0.0, 1.0 ]
        self.mstep_dict['animations']=animationchannels """

    def addKinematicAnimations(self):
        if self.kinematicanimation==None:
            return
        lenAnimations = len(self.kinematicanimation)
        
        if( lenAnimations<=0  ):
            return

        samplers = []
        chanels = []
        
        startRange = 1  
        lenShapeOrder = len(self.shapeorder)     
        print("Len Nodes",len(self.mstep_dict['nodes']))      
        for steps in range(1,lenAnimations+1):
            print(steps,lenAnimations,lenShapeOrder)
            lenOfAnimationsTime = steps+1 #or lenAnimations ; it works for both...
            timebuff = TimeBuffer(
                max_index=2
            )  
            
            mystep = steps-1
            if lenShapeOrder > 0:
                mystep = self.shapeorder[steps-1] 
            u,v,w,a=self.kinematicanimation[steps-1]
            print(mystep,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
            if a==0:
                translationbuff =TranslationBuffer(
                    max_index=2
                )
            else:
                dist = math.sqrt(u*u + v*v +w*w)
                if dist==0:
                    u, v, w = 1, 1, 1
                else:
                    u, v, w = u/dist, v/dist, w/dist
                
                rotationbuff =RotationBuffer(
                    max_index=2
                )   
            
            for istep in range(lenOfAnimationsTime):  
                timebuff.add_time(istep*self.delay)
                if a==0:
                    if istep < steps:                 
                        translationbuff.add_translation(0,0,0)
                    else:
                        translationbuff.add_translation(u,v,w)
                else:
                    if istep < steps:
                        rotationbuff.add_rotation(0,0,0,1)
                    else:
                        my_quaternion = Quaternion(axis=[u, v, w], angle=a)
                        my_quaternion.normalise()
                        print("My Quaternion",my_quaternion.q)
                        [a1,a2,a3,a4]=my_quaternion.q
                        rotationbuff.add_rotation(a2,a3,a4,a1)
                                                 
            buffer_index = len(self.mstep_dict['buffers'])
            timelen = len(timebuff)
            #print(timelen,self.rotateFirst)
            buffer_dict = {
                "byteLength":  timelen                                 
            }   
            base64data = base64.b64encode(timebuff.read()).decode('ascii')
            buffer_dict['uri'] = "data:{mimetype};base64,{data}".format(
                mimetype="application/octet-stream",
                data=base64data,
            )   
            self.mstep_dict['buffers'].append(buffer_dict)          
            bufferView_index = len(self.mstep_dict['bufferViews'])
            bufferview = {
                "buffer" : buffer_index,
                "byteOffset" : 0,
                "byteLength" : timelen
            }            
            self.mstep_dict['bufferViews'].append(bufferview)
            buffer_index = len(self.mstep_dict['buffers'])
            if a==0:
                translationlen = len(translationbuff)
            else:
                rotationlen = len(rotationbuff)
            buffer_dict = {
                "byteLength":  translationlen if a==0 else rotationlen                                   
            }   
            if a==0:
                base64data = base64.b64encode(translationbuff.read()).decode('ascii')
            else:
                base64data = base64.b64encode(rotationbuff.read()).decode('ascii')
            
            buffer_dict['uri'] = "data:{mimetype};base64,{data}".format(
                mimetype="application/octet-stream",
                data=base64data,
            )  
            self.mstep_dict['buffers'].append(buffer_dict) 
            bufferView_index = len(self.mstep_dict['bufferViews'])
            bufferview = {
                "buffer" : buffer_index,
                "byteOffset" : 0,
                "byteLength" : translationlen if a==0 else rotationlen
            }            
            self.mstep_dict['bufferViews'].append(bufferview)
            accessor_index = len(self.mstep_dict['accessors'])
            accessorview = [ {
                "bufferView" : bufferView_index-1,
                "byteOffset" : 0,
                "componentType" : 5126,
                "count" : lenOfAnimationsTime, #steps+1,
                "type" : "SCALAR",
                "max" : [ timebuff.time_max ],
                "min" : [ timebuff.time_min ]
                },
                {
                "bufferView" : bufferView_index,
                "byteOffset" : 0,
                "componentType" : 5126,
                "count" : lenOfAnimationsTime, #steps+1,
                "type" : "VEC3" if a==0 else "VEC4",
                "max" : [ translationbuff.translation_umax, translationbuff.translation_vmax,translationbuff.translation_wmax ] if a==0 \
                    else [ rotationbuff.rotation_umax, rotationbuff.rotation_vmax,rotationbuff.rotation_wmax ] ,
                "min" : [ translationbuff.translation_umin,translationbuff.translation_vmin,translationbuff.translation_wmin ] if a==0 \
                    else [ rotationbuff.rotation_umin,rotationbuff.rotation_vmin,rotationbuff.rotation_wmin ]
                } ]
            self.mstep_dict['accessors'].append(accessorview[0])
            self.mstep_dict['accessors'].append(accessorview[1])
            node_id = mystep+2
            print(node_id)
            if a==0:
                self.mstep_dict['nodes'][node_id]['translation']=[ 0.0, 0.0, 0.0 ]
            else:
                #my_quaternion = Quaternion(axis=[u, v, w], angle=0)
                #my_quaternion.normalise()
                #print("Initial position of rotation",my_quaternion.q)
                #[a1,a2,a3,a4] = my_quaternion.q
                self.mstep_dict['nodes'][node_id]['rotation']=[ 0.0, 0, 0, 1 ]
            #print(self.mstep_dict)
            sampler = { 
                "input" : accessor_index,
                "interpolation" : "LINEAR",
                "output" : accessor_index+1
            }
            samplers.append(sampler)            
            chanel = {
                "sampler" : steps-startRange,
                "target" : {
                "node" : node_id,
                "path" : "translation" if a==0 else "rotation"
                }
            }
            chanels.append(chanel)

        animationchannels = [{
            "samplers" : samplers,
            "channels" : chanels
            }
        ]
        self.mstep_dict['animations']=animationchannels

    def write_status(self,maxgap=10,action=''):
        currenttime = datetime.utcnow()  
        mystatusdict =  {
                "percent":(self.percentage if self.ascompound==False else self.percentage/4.0),
                "start":self.starttime.strftime("%H-%M-%S"),
                "current":currenttime.strftime("%H-%M-%S"),
                "action":action }
        if(maxgap==0 and self.percentage>0):
            mystatusdict["finish"]=currenttime.strftime("%H-%M-%S")
            mystatusdict["reset"]=currenttime.strftime("%H-%M-%S")
        elif(maxgap==0):
            mystatusdict["reset"]=currenttime.strftime("%H-%M-%S")
        try:            
            timingdelta = datetime.utcnow()-self.currenttime            
            if (timingdelta.total_seconds() >= maxgap) or (maxgap==0): 
                if(self.byThread)or(self.ascompound)or(maxgap==0):
                    if (self.writefiles) or (self.ascompound)or(maxgap==0):
                        #os.makedirs(os.path.dirname(statusfilename), exist_ok=True)
                        statusfilename = self.displaypath+self.basefilename+".status"
                        print("Writing",statusfilename,"Percentage",self.percentage)                        
                        self.currenttime = datetime.utcnow() 
                        try:
                            with open(statusfilename, 'w') as fh:
                                fh.write(json.dumps(mystatusdict, sort_keys=True, indent=2 ))
                        except Exception as e:
                            print("While Writing",statusfilename,e,self.percentage) 
                    else:
                        print("Not Writing status",self.percentage)
                else:
                    print("Percentage",self.percentage)
        except Exception as e:
            print("While Writing",statusfilename,e)   
        
        return mystatusdict

    def copyonefile(self, srcname, dstname, symlinks=False):
        errors = []
        dstpath = os.path.dirname(dstname)
        if not os.path.isdir(dstpath): 
            os.makedirs(dstpath)
        try:
            if symlinks and os.path.islink(srcname):
                linkto = os.readlink(srcname)
                os.symlink(linkto, dstname)
            else:
                shutil.copy2(srcname, dstname)
        except shutil.Error as err:
            errors.extend(err.args[0])
        except EnvironmentError as why:
            errors.append((srcname, dstname, str(why)))
        if errors:
            print(errors)

    def copytree(self, src, dst, WRITESTATUS="Progress", symlinks=False, ignored_names=['.','..']):
        names = os.listdir(src)
        if not os.path.isdir(dst): 
            os.makedirs(dst)
        errors = []
        dircount = len(names)
        if WRITESTATUS!="Progress":
            if self.percentage > 99.99:
                self.percentage = 99.99
            percentIncrement = (100-self.percentage)*0.75 / (dircount if (dircount > 0) else 1 )
        for name in names:            
            if WRITESTATUS=="Progress":
                self.write_progress(action='Copying:')  
            else:
                self.percentage += percentIncrement
                if self.percentage > 99.99:
                    self.percentage = 99.99
                self.write_status(action='Copying:')   
            
            if name in ignored_names:
                continue
            srcname = os.path.join(src, name)
            dstname = os.path.join(dst, name)
            try:
                if symlinks and os.path.islink(srcname):
                    linkto = os.readlink(srcname)
                    os.symlink(linkto, dstname)
                elif os.path.isdir(srcname):
                    self.copytree(srcname, dstname, WRITESTATUS, symlinks, ignored_names)
                else:
                    copiedname = shutil.copy2(srcname, dstname)
                    if copiedname == dstname: #if file is copied, then delete the source, else do not.
                        if (not srcname.endswith(".status")) and (not srcname.endswith(".progress")):
                            os.remove(srcname)
                    else:
                        print("Error while copying",srcname,dstname,copiedname)
            except shutil.Error as err:
                errors.extend(err.args[0])
            except EnvironmentError as why:
                errors.append((srcname, dstname, str(why)))
        try:
            shutil.copystat(src, dst)
        except OSError as why:
            if WindowsError is not None and isinstance(why, WindowsError):
                # Copying file access times may fail on Windows
                pass
            else:
                errors.extend((src, dst, str(why)))
        if errors:
            print(errors)

    def write_in_thread(self,dict,imagePNG,notFromFeature):
        try:
            if logging != None and self.writethread:
                logging.info("Started writing gltf files in Thread ")
        except Exception as e:
            print("Error while logging",e)
        try:
            if (COPY_PATH!='') and notFromFeature:
                print("Copying Display File",self.displaypath,COPY_PATH+self.displaypath)
                self.copytree(self.displaypath,COPY_PATH+self.displaypath,"Status")
                print("Copying Media File",self.fname,COPY_PATH+self.fname)
                self.copyonefile(self.fname,COPY_PATH+self.fname)
                self.copytree(self.displaypath,COPY_PATH+self.displaypath,"Status")
        except Exception as e:
            print("Error while copying to s3",e)
        try:
            newfilename = COPY_PATH+self.displaypath+dict["store"]+".gltf"
            if self.writefiles:
                print("Writing",newfilename)
                with open(newfilename, 'w') as fh:
                    fh.write(json.dumps(dict["gltf"], sort_keys=True, indent=2 ))
            else:
                print("Not Writing",newfilename)
        except Exception as e:
            print("While Writing",newfilename,e)
        try:
            treefilename = COPY_PATH+self.displaypath+dict["store"]+".tree"
            if self.writefiles:
                print("Writing",treefilename)
                with open(treefilename, 'w') as fh:
                    fh.write(json.dumps(dict["tree"], sort_keys=True, indent=2 ))
            else:
                print("Not Writing",treefilename)
        except Exception as e:
            print("While Writing",treefilename,e)
        if notFromFeature:
            """ try:
                statusfilename = COPY_PATH+self.displaypath+dict["store"]+".status"
                if (self.writefiles) or (self.ascompound):
                    print("Writing",statusfilename)                
                    with open(statusfilename, 'w') as fh:
                        fh.write(json.dumps(dict["status"], sort_keys=True, indent=2 ))
                else:
                    print("Not Writing",statusfilename)
            except Exception as e:
                print("While Writing",statusfilename,e) """
            if ((self.edgesize!=0) or (self.vertexsize !=0)) and self.writefiles:
                try:
                    gdtfile = COPY_PATH+self.displaypath+dict["store"]+".gdt"
                    print("Writing,",gdtfile)
                    with open(gdtfile, 'w') as fh:
                        fh.write(json.dumps(dict["gdttable"], sort_keys=True, indent=2 ))
                except Exception as e:
                    print("Error while writing gdtfile",e)
            if imagePNG and self.writefiles:           
                try:
                    filestore = dict["store"][:-1]+"0"
                    imagefilename = COPY_PATH+self.displaypath+filestore+".png"
                    print("Writing",imagefilename)
                    createThumbnail(newfilename,self.thumbwidth,self.thumbheight,imagefilename)            
                except Exception as e:
                    print("While Writing",imagefilename,e)
        
        try:
            if logging != None and self.writethread:
                logging.info("Completed writing gltf files in Thread ")
        except Exception as e:
            print("Error while logging",e)

    def dumpInThread(self,byThread):
        """Return assembly structure in indented outline form.
        Format of lines:
        Component Name [entry] => Referred Label Name [entry]
        Components are shown indented w/r/t line above."""
        self.byThread = byThread
        print("I am starting thread",self.byThread,self.fname,byThread)
        if byThread:
            self.writethread = False
            self.addfeaturesThread = False
            try:
                if logging != None : 
                    logging.info("Started thread conversion"+self.fname) 
            except Exception as e:
                print("Error while logging",e)

        if self.fname:
            self.output += f"Assembly structure of file: {self.fname}\n\n"
        else:
            self.output += "Assembly structure of doc:\n\n"
        self.indent = 0
        """ fullshapes = TDF_LabelSequence() code moved to getshapes()
        self.shape_tool.GetShapes(fullshapes)
        print(fullshapes.Length())
        for i in range(1,fullshapes.Length()+1):
            refLabel = fullshapes.Value(i) 
            print(i,refLabel.GetLabelName(), refLabel.EntryDumpToString()) """
        self.percentage = 0
        self.currenttime=self.starttime
        self.write_status(0)
        if self.shapeslist:
            self.addShapes()
        else:
            self.getShapes()
        if self.delay != 0:
            self.addAnimations()
            self.addKinematicAnimations()
        
        #print("Shapes Len",len(self.animations),len(self.outputShapes))
        #self.mstep_dict['download']=self.tree
        # Write self.mstep_dict to file as JSON string       
        getPNG = False
        #newfilename = "Display/"+self.basefilename+".gltf"
               
        #if (self.thumbheight!=0) and (self.thumbwidth!=0) and (self.edgesize==0) and (self.vertexsize==0) and (self.ascompound==False):
        if (self.thumbheight!=0) and (self.thumbwidth!=0) and (self.vertexsize==0) and (self.ascompound==False):
            getPNG = True
        
        """  try:
            print("Writing",newfilename)
            with open(newfilename, 'w') as fh:
                fh.write(json.dumps(self.mstep_dict, sort_keys=True, indent=2 ))
        except Exception as e:
            print("While Writing",newfilename,e)
        if imagefilename!="":           
            try:
                print("Writing",imagefilename)
                createThumbnail(newfilename,self.thumbwidth,self.thumbheight,imagefilename)            
            except Exception as e:
                print("While Writing",imagefilename,e) """
        
        dict_return = {
            "gltf":self.mstep_dict,
            "tree":self.tstep_dict['tree'],
            "store":self.basefilename,
            "load":self.fname,
            "gdttable":[{ "edges":[],
                          "selectedObjects":[],
                          "parentObjects":[],
                          "mates":[],
                          "mateValues": [False,False,False,False,False,False],
                          "angle":0,
                          "offset":0,
                          "option":26,
                          "key":"" }],
            "status": {"percent":self.percentage,
                        "start":self.starttime.strftime("%H-%M-%S"),
                        "current":datetime.utcnow().strftime("%H-%M-%S") },
             "display":COPY_PATH+self.displaypath
        }
        if self.writethread:
            mythread = threading.Thread(target=self.write_in_thread, daemon=True, args=(dict_return,getPNG,True))
            mythread.start()
        else:
            self.write_in_thread(dict_return,getPNG,True)
        self.percentage = 100
        self.write_status(0)
        myTreeLenBeforeAddingEdgesAndVertices = len(self.tstep_dict["tree"])
        #self.mstep_dict['tree']=self.tstep_dict['tree']
        if (self.edgesize!=0) or (self.vertexsize!=0): 
            try:
                if(self.addfeaturesThread):
                    myanotherthread = threading.Thread(target=self.addFeatures, daemon=True)
                    myanotherthread.start()
                else:
                    self.addFeatures()
                    try:
                        if (COPY_PATH!=''):
                            self.lenfeature  = self.lenFeatures-1
                            if self.lenfeature < 0:
                                self.lenfeature = 0
                            self.copytree(self.displaypath,COPY_PATH+self.displaypath,"Progress")
                            self.lenfeature = self.lenFeatures
                            self.write_progress(0)
                    except Exception as e:
                        print("Error while copying Edges to s3",e)
            except Exception as e:
                print("Error while disecting",e)
        if ( (self.suffixname != "M") and (self.suffixname != "S") and (self.suffixname != "K") and (self.suffixname != "A") ):
            #orderDimension = (self.scene_min[0],self.scene_min[1],self.scene_min[2],\
            #    self.scene_max[0],self.scene_max[1],self.scene_max[2])
            (_,self.childfiles)=StepExportWithColor().WriteAssemblyOutPutShapes(\
                self.outputShapes,self.basefilename,1,self.tstep_dict["tree"],\
                    myTreeLenBeforeAddingEdgesAndVertices,self.includeparts,self.distancegap,\
                        self.anglegap,self.disectparts,self.moverotate,self.thumbwidth,self.thumbheight,\
                            self.logging, self.seperateparts, self.edgesize, self.vertexsize,\
                                 self.maximumfacestoinclude)            
            self.write_progress(maxgap=0,action='Child Items Written',written=True)
            if self.AutoAssemblyOrder:
                print("Starting Assembly order",self.fname)
                if self.recreatefororder:
                    (_, (orderDimension, outputShapesOrder), dictionaryOrder) = StepIgesAnalyser(
                            filename=self.fname,includeparts=False,distancegap=self.distancegap, logging=logging, 
                            anglegap=self.anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False,
                            edgesize=0, vertexsize=0,thumbwidth=0,thumbheight=0,suffixname="M").dump(False)
                    dictionaryOrderTree = dictionaryOrder["tree"]
                    lenDictionaryOrderTree = len(dictionaryOrderTree)
                else:
                    orderDimension = (self.scene_min[0],self.scene_min[1],self.scene_min[2],\
                        self.scene_max[0],self.scene_max[1],self.scene_max[2])
                    outputShapesOrder = self.outputShapes
                    dictionaryOrderTree=self.tstep_dict["tree"]
                    lenDictionaryOrderTree = myTreeLenBeforeAddingEdgesAndVertices
                shapeArrayOrder,shapeOrder,shapePicklesOrder,aNameOrder,aColorAssemblyOrder = StepExportWithColor().\
                    getShapesFromOutPutShapes(outputShapesOrder,1,dictionaryOrderTree,lenDictionaryOrderTree)
                orderStatusName = self.basefilename[:-1]+'M'
                StepExportWithColor().writeStatus(orderStatusName,COPY_PATH+self.displaypath,\
                    30,self.starttime,False)
                FindAssemblingOrder(shapeArrayOrder,shapeOrder,aNameOrder,aColorAssemblyOrder,orderDimension,self.explodegap,\
                    self.center,self.holescale,self.removegap,logging).ExplodeParts(\
                        self.fname,self.distancegap,self.anglegap,self.delay,COPY_PATH+self.displaypath,\
                            False,self.starttime)
                StepExportWithColor().writeStatus(orderStatusName,COPY_PATH+self.displaypath,\
                    100,self.starttime,False)
                print("Completing Assembly order",self.fname)
                try:
                    myPickle = {'sourceType':'Order',
                                    'sourceFileName':self.fname,
                                    'distancegap':self.distancegap,
                                    'anglegap':self.anglegap,
                                    'explodegap':self.explodegap,
                                    'center':self.center,
                                    'holescale':self.holescale,
                                    'removegap':self.removegap,
                                    'animationtime':self.delay,
                                    'colorshapes':shapePicklesOrder,
                                    'assemblyname':aNameOrder,
                                    'dimension':orderDimension} 
                    picklefile = COPY_PATH+self.displaypath+orderStatusName+".pickle"
                    with open(picklefile, 'wb') as f:
                        # Pickle the 'data' dictionary using the highest protocol available.                               
                        pickle.dump(myPickle, f, pickle.HIGHEST_PROTOCOL)
                except Exception as e:
                    print(e,"File, %s has error" % picklefile)
            
        if byThread:   
            try:
                if (COPY_PATH!=''):
                    self.copytree(self.displaypath,COPY_PATH+self.displaypath,"Status")
                    self.percentage = 100
                    self.write_status(0)
            except Exception as e:
                print("Error while copying Edges to s3",e)         
            try:
                if logging != None : 
                    logging.info("Completed thread conversion"+self.fname) 
            except Exception as e:
                print("Error while logging",e)
        else:
            return (            
                (getPNG,self.output), 
                (
                    (self.scene_min[0],self.scene_min[1],self.scene_min[2],
                    self.scene_max[0],self.scene_max[1],self.scene_max[2]),
                    self.outputShapes
                    ), 
                    dict_return )
    
    def dump(self,notByThread=True):
        """Return assembly structure in indented outline form.
        Format of lines:
        Component Name [entry] => Referred Label Name [entry]
        Components are shown indented w/r/t line above."""
        self.currenttime=self.starttime
        timingdelta = self.endtime-self.starttime
        print("Initial Loading took",timingdelta)
        if (not self.shapeslist) and (self.ascompound==False) and (notByThread):
            statusfilename = self.displaypath+self.basefilename+".status"            
            if (self.writefiles) or (self.ascompound):
                os.makedirs(os.path.dirname(statusfilename), exist_ok=True)
            self.byThread=True
            mystatus = self.write_status(0)
            dict_return = { "gltf":{},
                "tree":[],
                "store":self.basefilename,
                "load":self.fname,
                "gdttable":[{ "edges":[],
                            "selectedObjects":[],
                            "parentObjects":[],
                            "mates":[],
                            "mateValues": [False,False,False,False,False,False],
                            "angle":0,
                            "offset":0,
                            "option":26,
                            "key":"" }],
                "status": mystatus,
                "display":COPY_PATH+self.displaypath }
            byThread = True
            mythread = threading.Thread(target=self.dumpInThread, daemon=True, args=(byThread,)) #extra comma is needed,python bug in thread!
            mythread.start()
            return (            
                    (False,self.output), 
                    (
                        (None,None,None,
                        None,None,None),
                        None
                        ), 
                    dict_return )
        else:
            print(self.basefilename,timingdelta.total_seconds(),self.shapeslist,self.ascompound)
            statusfilename = self.displaypath+self.basefilename+".status"            
            if (self.writefiles) or (self.ascompound):
                os.makedirs(os.path.dirname(statusfilename), exist_ok=True)
            self.write_status(0)
            mydict = self.dumpInThread(False)        
            return mydict
        
    
    def get_uid_from_entry(self, entry):
        """Generate uid from label entry

        In order to distinguish among multiple instances of shared data
        a uid is comprised of 'entry.serial_number', starting with 0.
        """
        if entry in self._share_dict:
            value = self._share_dict[entry]+1
        else:
            value = 0        
        # update serial number in self._share_dict
        self._share_dict[entry] = value
        return entry + '.' + str(value)   
    
    def updateParentChild(self,name,aShape):
        dictionaryLen = len(self.tstep_dict['tree'])
        self.uniqueid = dictionaryLen+1
        mesher_dict = {
            self.gltf_Dict["id"]:self.uniqueid,
            self.gltf_Dict["parentId"]:self.parentIDs[-1],
            self.gltf_Dict["step"]:None,
            self.gltf_Dict["name"]:None, 
            self.gltf_Dict["topLeft"] : [None,None,None],
            self.gltf_Dict["bottomRight"] : [None,None,None],
            self.gltf_Dict["indent"]: self.indent, 
            self.gltf_Dict["leaf"]:False,
            self.gltf_Dict["R"]:None,
            self.gltf_Dict["G"]:None,
            self.gltf_Dict["B"]:None,
            self.gltf_Dict["A"]:None,
            self.gltf_Dict["texture"]:None,
            self.gltf_Dict["metallicFactor"]:None,
            self.gltf_Dict["roughnessFactor"]:None,
            self.gltf_Dict["structures"] : [],  
            self.gltf_Dict["bin"]:None,   
            self.gltf_Dict["element"]:" ",  
            self.gltf_Dict["points"]:None,
            self.gltf_Dict["entity"]:{}
            }
        self.updateName(name,mesher_dict,0,True)
        if aShape and self.disectparts:
            returnDict = []
            dumpTopologyStructures(aShape,level=0,parentId=[None],returnStructure=returnDict,faceInfo=None)
            mesher_dict[self.gltf_Dict["structures"]] = returnDict        
        self.tstep_dict['tree'].append(mesher_dict)
        return mesher_dict
    
    def updateParentDimensions(self, currentdict):
        for parentDict in self.tstep_dict['tree'] :
            #print(parentDict,currentdict)
            if parentDict[self.gltf_Dict["id"]] == currentdict[self.gltf_Dict["parentId"]]:
                if currentdict[self.gltf_Dict["bin"]] is not None:
                    parentDict[self.gltf_Dict["bin"]] = currentdict[self.gltf_Dict["bin"]]
                if currentdict[self.gltf_Dict["topLeft"]][0] is not None:
                    if parentDict[self.gltf_Dict["topLeft"]][0] is not None:
                        parentDict[self.gltf_Dict["topLeft"]] = _list3_min(
                        parentDict[self.gltf_Dict["topLeft"]], currentdict[self.gltf_Dict["topLeft"]]
                        )
                    else:
                        parentDict[self.gltf_Dict["topLeft"]] = currentdict[self.gltf_Dict["topLeft"]]
                if currentdict[self.gltf_Dict["bottomRight"]][0] is not None:
                    if parentDict[self.gltf_Dict["bottomRight"]][0] is not None:
                        parentDict[self.gltf_Dict["bottomRight"]] = _list3_max(
                        parentDict[self.gltf_Dict["bottomRight"]], currentdict[self.gltf_Dict["bottomRight"]]
                        )
                    else:               
                        parentDict[self.gltf_Dict["bottomRight"]] = currentdict[self.gltf_Dict["bottomRight"]]
                if(parentDict[self.gltf_Dict["parentId"]]) :
                    self.updateParentDimensions(parentDict)
       
    def findDictionary(self, currentdict) :
        dictionaryLen = len(self.tstep_dict['tree'])
        currentPos = currentdict[self.gltf_Dict["id"]]
        #print(dictionaryLen,currentPos,currentdict)
        if dictionaryLen > (currentPos-1)  and currentPos >= 1:
            lastOne = self.tstep_dict['tree'][currentPos-1]
            if lastOne[self.gltf_Dict["id"]] == currentPos:
                return lastOne        
            for parentDict in self.tstep_dict['tree'] :
                #print(parentDict,currentdict)
                if parentDict[self.gltf_Dict["id"]] == currentPos:
                    return parentDict
        return {}

    def updateOutput(self, childName, childEntry, parentName, parentEntry, forDuplication):
        #print("I jave reached 1")
        #tree update moved to add_part..
        #self.tree+="<li>"+html.escape(childEntry+" "+childName+" "+parentEntry+" "+parentName+" "+str(self.uid)+"</li>"
        indent = "\t" * self.indent
        uid = self.get_uid_from_entry(childEntry)
        #print("I jave reached 2")
        self.output += f"{self.uid}--{uid}--{self.fileId}{indent}[{childEntry}] {childName}" 
        #print("I jave reached 3")
        
        if forDuplication:
            self.output +=   f" => [{parentEntry}] {parentName} => Duplicate: {forDuplication}\n"
            #self.uid -= 1
        else:
            self.output += f" => [{parentEntry}] {parentName}\n"
            #print("I jave reached 4")
            self.uid += 1 
            #print("I jave reached 6")
    
    def _to_unicode(self,match):
        return chr(int(match.group(1), 16))

    def _unescape_XML(self,name):
        # remove trailing whitespaces
        new_name = name.strip()
        # https://stackoverflow.com/questions/730133/what-are-invalid-characters-in-xml
        replace_dict = {"&": "&amp;", ">": "&gt;", "<": "&lt;", "'": "&apos;", '"': '&quot;'}
        for key, value in replace_dict.items():
            new_name = new_name.replace(key, value)
        reg1 = re.compile(r'\\X\\(..)')
        reg2 = re.compile(r'\\X2\\(....)\\X0\\')
        reg3 = re.compile(r'\\X4\\(........)\\X0\\')
        new_name = reg3.sub(self._to_unicode, reg2.sub(self._to_unicode, reg1.sub(self._to_unicode, new_name)))

        return new_name


    def validFileName(self,filename):
        try:
            cleanedFilename = filename #unicodedata.normalize('NFKD', filename).encode('ASCII', 'ignore')
            #print("CleanedFileName",cleanedFilename)
            #print("Valid chars", self.validFilenameChars)
            return ''.join(c for c in cleanedFilename if c in self.validFilenameChars)
        except Exception as e:
            print("Error2:",e)
    
    def getBaseFileName(self):
        return self.basefilename+self.fileprefix+str(self.distancegap)+str(self.anglegap)+str(self.fileId)
    
    def write_step_color_file(self, a_shape, outname, colorname, filename):
        
        #obj = cq.Workplane("XY").newObject([Shape.cast(a_shape)]).val()
      
        assembly.Assembly(
                Shape.cast(a_shape),name=self._unescape_XML(outname),
                color=Color(colorname.Red(),colorname.Green(),colorname.Blue())).save(filename)  
        """  
        #If Direct calling is not working, then we can import and export..
        myassemblies = Assembly.importer("shape")([a_shape],filename)        
        for (child_name, child) in myassemblies.components.items():
            #print(child_name)
            assembly.Assembly(
                child.local_obj.val(),name=self._unescape_XML(outname),
                color=Color(colorname.Red(),colorname.Green(),colorname.Blue())).save(filename) 
        """         
    def write_step_file_in_thread(self, a_shape, outname, colorname, basename, newfilename):
        """ exports a shape to a STEP file
        a_shape: the topods_shape to export (a compound, a solid etc.)
        outname: FileName to store
        """
        try:
            if logging != None and self.writethread:
                logging.info("Started writing step files in Thread ")
        except Exception as e:
            print("Error while logging",e)
        
        #basename = self.validFileName(outname)+str(self.fileId)+".step"
        #newfilename = self.direntry+"/"+ basename
        if self.createFiles :
            os.makedirs(os.path.dirname(newfilename), exist_ok=True)
            if self.writeStep:
                if os.path.isfile(newfilename):
                    print("Warning: %s file already exists and will be replaced" % newfilename)
                # creates and initialise the step exporter
                step_writer = STEPControl_Writer()
                Interface_Static_SetCVal("write.step.schema", "AP242DIS")
                # transfer shapes and write file
                step_writer.Transfer(a_shape, STEPControl_AsIs)
                status = step_writer.Write(newfilename)
                if not status == IFSelect_RetDone:
                    print("Error while writing shape to STEP file.")
                if not os.path.isfile(newfilename):
                    print("File %s was not saved to filesystem." % newfilename)
            if self.writepickle and self.writefiles:
                try:
                    picklefile = self.displaypath+basename+".pickle"
                    with open(picklefile, 'wb') as f:
                        # Pickle the 'data' dictionary using the highest protocol available.
                        pickle.dump(a_shape, f, pickle.HIGHEST_PROTOCOL)
                except Exception as e:
                    print(e,"File, %s has error" % picklefile)
            #Direct setting from pythonocc is not working, but from CQ same calls are working. Don't know why//
            if self.writeColorStep:
                try:
                    colorfile = self.displaypath+basename+"_COLOR.step"               
                    StepExportWithColor(shape=a_shape,color=colorname,name=outname).write_file(filename=colorfile)
                except Exception as e:
                    print(e,"File, %s has error" % colorfile)  
            #Following is using cadquery code and hence removed..       
            """ try:
                 colorfile = "Display/"+"C"+basename+"C.step"
                self.write_step_color_file(a_shape, outname, colorname, colorfile)                
            except Exception as e:
                print(e,"File, %s has error" % colorfile) """
        else:
            print("File, %s is not saved since it is meant for analysis" % newfilename)
        
        try:
            if logging != None and self.writethread:
                logging.info("Complted writing step files in Thread ")
        except Exception as e:
            print("Error while logging",e)
       
    def write_step_file(self, a_shape, outname, colorname):
        """ exports a shape to a STEP file
        a_shape: the topods_shape to export (a compound, a solid etc.)
        outname: FileName to store """
        
        basename = self.getBaseFileName()
        newfilename = self.displaypath+basename+".step"
        if self.writethread:
            mythread = threading.Thread(target=self.write_step_file_in_thread, daemon=True, args=(a_shape, outname, colorname, basename, newfilename))
            mythread.start()
        else:
            self.write_step_file_in_thread(a_shape, outname, colorname, basename, newfilename)        
        """ mythread = threading.Thread(target=self.write_step_file_in_thread,args=(a_shape, outname, colorname, basename, newfilename))
        mythread.start() """
        return (newfilename, basename) 



    def write_step_file_with_out_thread(self, a_shape, outname, colorname):
        """ exports a shape to a STEP file
        a_shape: the topods_shape to export (a compound, a solid etc.)
        outname: FileName to store
        """
        
        basename = self.getBaseFileName()
        newfilename = self.displaypath+basename+".step"
        #basename = self.validFileName(outname)+str(self.fileId)+".step"
        #newfilename = self.direntry+"/"+ basename
        if self.createFiles :
            os.makedirs(os.path.dirname(newfilename), exist_ok=True)
            if self.writeStep:
                if os.path.isfile(newfilename):
                    print("Warning: %s file already exists and will be replaced" % newfilename)
                # creates and initialise the step exporter
                step_writer = STEPControl_Writer()
                Interface_Static_SetCVal("write.step.schema", "AP242DIS")
                # transfer shapes and write file
                step_writer.Transfer(a_shape, STEPControl_AsIs)
                status = step_writer.Write(newfilename)
                if not status == IFSelect_RetDone:
                    print("Error while writing shape to STEP file.")
                if not os.path.isfile(newfilename):
                    print("File %s was not saved to filesystem." % newfilename)
            if self.writepickle and self.writefiles:
                try:
                    picklefile = self.displaypath+basename+".pickle"
                    with open(picklefile, 'wb') as f:
                        # Pickle the 'data' dictionary using the highest protocol available.
                        pickle.dump(a_shape, f, pickle.HIGHEST_PROTOCOL)
                except Exception as e:
                    print(e,"File, %s has error" % picklefile)
            #Direct setting from pythonocc is not working, but from CQ same calls are working. Don't know why//
            if self.writeColorStep:
                try:
                    colorfile = self.displaypath+basename+"_COLOR.step"               
                    StepExportWithColor(shape=a_shape,color=colorname,name=outname).write_file(filename=colorfile)
                except Exception as e:
                    print(e,"File, %s has error" % colorfile)  
            #Following is using cadquery code and hence removed..       
            """ try:
                 colorfile = "Display/"+"C"+basename+"C.step"
                self.write_step_color_file(a_shape, outname, colorname, colorfile)                
            except Exception as e:
                print(e,"File, %s has error" % colorfile) """
        else:
            print("File, %s is not saved since it is meant for analysis" % newfilename)
        return (newfilename, basename) 
    
    """ def normalizeTriangle(self,v1,v2,v3,vmin,vmag):
         
        p1x, p1y, p1z = v1
        
        p2x, p2y, p2z = v2
        
        p3x, p3y, p3z = v3
        
        Ux,Uy,Uz = p2x-p1x, p2y-p1y, p2z-p1z
         
        Vx,Vy,Vz = p3x-p1x, p3y-p1y, p3z-p1z
        
        Umagnitude = Ux*Ux+Uy*Uy+Uz*Uz        
        Vmagnitude = Vx*Vx+Vy*Vy+Vz*Vz
        if(Umagnitude==0):
            Umagnitude = 1
        if(Vmagnitude==0) :
            Vmagnitude = 1
        Magnitude = math.sqrt(Umagnitude * Vmagnitude)
        Normal = (Uy*Vz - Uz*Vy)/Magnitude, (Uz*Vx - Ux*Vz)/Magnitude, (Ux*Vy - Uy*Vx)/Magnitude
        #print(Normal)
        return Normal """
    

    def minmaxsum3D(self, max,min, sum, data):
        #print("max,min,data", max, min,data)
        xmax,ymax,zmax = max
        xmin,ymin,zmin = min    
        sx, sy, sz = sum  
        x,y,z = data

        if xmax < x:
            xmax = x
        if xmin > x:
            xmin = x 
        if ymax < y:
            ymax = y
        if ymin > y:
            ymin = y 
        if zmax < z:
            zmax = z
        if zmin > z:
            zmin = z 

        
        max = (xmax,ymax,zmax)
        min = (xmin,ymin,zmin)
        sum = (sx+x, sy+y, sz+z)
        return max, min, sum
   
    def max3D(self, max,min, udata, vdata):
        #print("max,min,data", max, min,data)
        xmax,ymax,zmax = max
        xmin,ymin,zmin = min    
            
        x,y,z = udata

        if xmax < x:
            xmax = x        
        if ymax < y:
            ymax = y
        if zmax < z:
            zmax = z

        x,y,z = vdata

        if xmin > x:
            xmin = x 
        if ymin > y:
            ymin = y         
        if zmin > z:
            zmin = z 

        
        max = (xmax,ymax,zmax)
        min = (xmin,ymin,zmin)
        return max, min  

    """ def max2D(self, umax,vmax,udata,vdata):
        #print("max,min,data", max, min,data)
        
        if umax < udata:
            umax = udata       
        if vmax < vdata:
            vmax = vdata
        
        return umax,vmax  """

    def tessellate(self, shape) :
        #print("I have started Tesselating")
        #self.mesh(part, distancegap, angularTolerance)
        #print("I have checked mesh Tesselating")
        vertices = []
        triangles = []
        topologyExplorer = Topo(shape,ignore_orientation=False)
        """  print(dumpTopology(shape))
        compiterror = list(topologyExplorer.comp_solids())
        soliditerror = list(topologyExplorer.solids())
        shelliterror = list(topologyExplorer.shells())
        faceiiterror = list(topologyExplorer.faces())
        wiresiterror = list(topologyExplorer.wires())
        edgeiteror = list(topologyExplorer.edges())
        vertexiteror = list(topologyExplorer.vertices())
        print("Combosolids",compiterror)
        print("Solids",soliditerror)
        print("Shells",shelliterror)
        print("Faces",faceiiterror)
        print("Wires",wiresiterror)
        print("Edges",edgeiteror)
        print("Verties",vertexiteror) """


        faceiterator = topologyExplorer.faces() 
        list_of_faces = list(faceiterator)
        uv=[]         
        uvPlane = []  
        if(len(list_of_faces) > 0):
            #print("I have reached here 0")
            BRepMesh_IncrementalMesh(shape, self.distancegap, True, self.anglegap)
            #print("I have ok reached here 1")
            offset = 0
            bt = BRep_Tool()
            #topologyExplorer = Topology.Topo(shape,ignore_orientation=False)
            
            facecount = 0
            #u_max, v_max = (-1e10, -1e10)
           
            plane_min = (1e10, 1e10, 1e10)
            plane_max = (-1e10, -1e10, -1e10)
            uvPlane = []
            
            for face in list_of_faces:  
                facecount+=1
                fill, dir, facetype = recognize_direction(face)  
               
                #print(facecount, face)     
                
                location = TopLoc_Location()
                facing = (bt.Triangulation(face, location))
                if facing:
                    Trsf = location.Transformation()
                    reverse = (
                        True
                        if (face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED) or (fill=="Hole")
                        else False
                    )
                    #print(reverse,face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED,fill=="Hole",fill)
                    #print(reverse,face,location)
                    vert = facing.Nodes()
                    tri = facing.Triangles()
                    
                    
                    # add vertices
                    vertices += [
                        (v.X(),v.Y(),v.Z()) 
                        for v in (v.Transformed(Trsf) for v in vert)
                    ]
                    #print(offset,len(vert))
                    length_vert = len(vert)
                    if (self.includeUV or self.ascompound) :
                        faces_min = (1e10, 1e10, 1e10)
                        faces_max = (-1e10, -1e10, -1e10)
                        faces_sum = (0,0,0)
                       
                        for i in range(length_vert):
                            #print(vertices[i+offset])
                            faces_max, faces_min, faces_sum = self.minmaxsum3D( faces_max, faces_min, faces_sum, vertices[i+offset] )                        
                            
                    # add triangles
                    triangles += [
                        (
                            t.Value(1) + offset - 1,
                            t.Value(3) + offset - 1,
                            t.Value(2) + offset - 1,
                        )
                        if reverse
                        else (
                            t.Value(1) + offset - 1,
                            t.Value(2) + offset - 1,
                            t.Value(3) + offset - 1,
                        )
                        for t in tri
                    ]                
                   
                    if ((length_vert>0) and (self.includeUV or self.ascompound)) :
                        xmax,ymax,zmax = faces_max
                        xmin,ymin,zmin = faces_min 
                        sx, sy, sz = faces_sum
                        plane_max, plane_min = self.max3D(plane_max, plane_min, faces_max, faces_min)
                        deviationx = 0
                        deviationy = 0
                        deviationz = 0
                        for i in range(length_vert):
                            x,y,z = vertices[i+offset]
                            deviationx += (x*length_vert-sx)*(x*length_vert-sx) 
                            deviationy += (y*length_vert-sy)*(y*length_vert-sy) 
                            deviationz += (z*length_vert-sz)*(z*length_vert-sz)

                        if deviationx <= deviationy and deviationx <= deviationz :
                            #u_max, v_max = self.max2D(u_max,v_max,ymax-ymin,zmax-zmin)
                            uvPlane +=[("YZ",length_vert, faces_max, faces_min, hash(face), fill, dir, facetype)]                           
                        elif deviationy <= deviationx and deviationy <= deviationz :
                            #u_max, v_max = self.max2D(u_max,v_max,zmax-zmin,xmax-xmin)
                            uvPlane +=[("ZX",length_vert, faces_max, faces_min, hash(face), fill, dir, facetype)]   
                        else:                            
                            #u_max, v_max = self.max2D(u_max,v_max,xmax-xmin,ymax-ymin)
                            uvPlane +=[("XY",length_vert, faces_max, faces_min, hash(face), fill, dir, facetype)]                    
                    offset += facing.NbNodes()
                else:
                    print("No facing info for", face)
            
            """ if u_max <= 0:
                u_max = 1
            if v_max <= 0:
                v_max = 1 """
            if self.includeUV :
                xmax,ymax,zmax = plane_max
                xmin,ymin,zmin = plane_min
                uvxmax, uvymax, uvzmax = xmax-xmin, ymax-ymin, zmax-zmin
                if uvxmax <= 0:
                    uvxmax = 1
                if uvymax <= 0:
                    uvymax = 1
                if uvzmax <= 0:
                    uvzmax = 1    
                #print("UVPlane:",uvPlane)
                offset = 0
                for (planePos,vertLen,_,_,_,_,_,_,) in uvPlane:  
                    #print("Plane:",planePos,vertLen)               
                    if planePos=="YZ" :
                        for i in range(vertLen):
                            x,y,z = vertices[i+offset]
                            uv += [((y-ymin)/uvymax,(z-zmin)/uvzmax)]
                    if planePos=="ZX" :
                        for i in range(vertLen):
                            x,y,z = vertices[i+offset]
                            uv += [((z-zmin)/uvzmax,(x-xmin)/uvxmax)]                
                    if planePos=="XY" :
                        for i in range(vertLen):
                            x,y,z = vertices[i+offset]
                            uv += [((x-xmin)/uvxmax,(y-ymin)/uvymax)]
                    offset += vertLen

        else:
            print("No faces for the shape",shape)
        
            

        """ ex = TopExp_Explorer(shape, TopAbs_FACE) #low level function hence written top level routine..
        while ex.More():
            #print("I have reached here 2")
            face = topods_Face(ex.Current())
            location = TopLoc_Location()
            facing = (bt.Triangulation(face, location))
            Trsf = location.Transformation()
            reverse = (
                True
                if face.Orientation() == TopAbs_Orientation.TopAbs_REVERSED
                else False
            )
            vert = facing.Nodes()
            tri = facing.Triangles()
        
            # add vertices
            vertices += [
                (v.X(),v.Y(),v.Z()) 
                for v in (v.Transformed(Trsf) for v in vert)
            ]

            # add triangles
            triangles += [
                (
                    t.Value(1) + offset - 1,
                    t.Value(3) + offset - 1,
                    t.Value(2) + offset - 1,
                )
                if reverse
                else (
                    t.Value(1) + offset - 1,
                    t.Value(2) + offset - 1,
                    t.Value(3) + offset - 1,
                )
                for t in tri
            ]

            offset += facing.NbNodes()
            ex.Next() """
        #print(" I am about to hang after this")
        return (vertices, triangles, uv, uvPlane)

    def part_mesh(self, part):
        """
        Convert a part's object to a mesh.

        :param part: part being converted to a mesh
        :type part: :class:`Part <structparts.Part>`
        :param distancegap: distancegap level of tessellation.
        :type distancegap: :class:`float`
        :param world: if True, world coordinates are used
        :type world: :class:`bool`
        :return: list of (<vertices>, <indexes>)
        :rtype: :class:`tuple`

        Returned mesh format::

            <return value> = (
                [FreeCAD.Base.Vector(x, y, z), ... ],  # list of vertices
                [(i, j, k), ... ],  # indexes of vertices making a polygon
            )
        """
        with measure_time(log, 'buffers.part_mesh'):
            tess = ([],[],[],[])
            if part:
                try:
                    """  tessellationObj = ShapeTesselator(part)
                    tessellationObj.Compute(False, self.distancegap, True)
                    triangle_set = tessellationObj.GetVerticesPositionAsTuple()
                    # convert vertex coordinates to a numpy array
                    triangle_set_np_array = numpy.array(triangle_set)
                    nb = len(triangle_set_np_array)
                    print("Number of floats in the numpy array:", nb)
                    # reshape the array to get an array of 3 float arrays
                    vertices = triangle_set_np_array.reshape((int(nb / 3), 3))
                    print(vertices)
                    print("Length of vertices array:", len(vertices))
                    # among all these vertices, there should only be 8 different
                    unique_vertices = numpy.unique(vertices, axis=0)
                    print("Number of unique vertices:", len(unique_vertices))
                    print("Unique vertices:\n", unique_vertices)

                    indices = [numpy.where(numpy.all(unique_vertices==ar, axis=1))[0][0] for ar in vertices]
                    print("Vertices indices:\n", indices)
                    #normals = tessellationObj.GetNormalsAsTuple()
                    #normals = numpy.array(normals).reshape(int(nb / 3), 3)
                    #print("Normals: For what it is used\n",normals)
                    tess = (vertices, indices)
                    print(tess) """
                    tess = self.tessellate(part)
                    #print(tess)
                except Exception as e:
                    print("Error in tessllation:",e)
                    tess = ([],[],[],[])
            return tess

   
    def part_buffer(self, part):
        """
        Export part's geometry as an asset binary stream.
        :param part: part being converted to a mesh
        :type part: :class:`Part <structparts.Part>`
        :param distancegap: distancegap level of tessellation.
        :type distancegap: :class:`float`       
        :param world: if True, use world coordinates, otherwise use local
        :type world: :class:`bool`
        :return: byte sream of exported geometry
        :rtype: :class:`BytesIO`

        To embed binary model data into a 'uri', you can:

        .. doctest::

            >>> import structparts
            >>> from structparts_misc.basic.primatives import Cube

            >>> cube = Cube()
            >>> buff = cube.exporter('mstep').part_buffer(cube)

            >>> import base64
            >>> {'uri': "data:{mimetype};base64,{data}".format(
            ...     mimetype="application/octet-stream",
            ...     data=base64.b64encode(buff.read()).decode('ascii'),
            ... )}
            {'uri': 'data:application/octet-stream;base64,AAAAvwAAAD8AAAA/AAAAvwAAAD8AAAC/AAAAvwAAAL8AAAA/AAAAvwAAAL8AAAC/AAAAPwAAAL8AAAA/AAAAPwAAAD8AAAC/AAAAPwAAAD8AAAA/AAAAPwAAAL8AAAC/AAECAQMCBAUGBAcFAwcCAgcEAAUBBgUAAwEHBwEFBAACBgAE'}
        """
        
        # Get shape's mesh
        (vertices, indices, uv, uvPlane) = self.part_mesh(part)
        #print(vertices,indices)

        if len(indices) != 0 :
            #print("indices", len(indices))
            # Create ShapeBuffer
            buff = ShapeBuffer(
                max_index=numpy.matrix(indices).max(),
            )
            uvbuff = UVBuffer(
                max_index=numpy.matrix(indices).max(),
            )
        else :

            # Create EmptyBuffer
            buff = ShapeBuffer(
                max_index=0,
            )
            uvbuff = UVBuffer(
                max_index=0,
            )
            #print("I am here", indices)

        # Push mesh to ShapeBuffer
        for (x,y,z) in vertices:            
            buff.add_vertex(x,y,z)
        for (i, j, k) in indices:
            buff.add_poly_index(i, j, k)
        #print("UV=",uv)
        for uv2d in uv:
            #print("0",uv2d[0])
            #print("1",uv2d[1])
            uvbuff.add_uv(uv2d[0],uv2d[1])
        return buff, len(indices), uvbuff, uvPlane   
    

    def add_part(self, part, part_color=None, filenameuri=None, filetype="", name=None,  parent_idx=0, curvecode="", curvepoints=None, entity={}, fromRecursion=False, buff=None, solidfound=0, uvbuff=None, uvPlane=[] ):
        """
        Adds the given ``part`` to ``self.gltf_dict``.

        :param part: part to add to gltf and step export
        :type part: :class:`Part <structparts.Part>`
        :param filename: name of binary file to store buffer, if ``None``,
                         binary data is embedded in the *buffer's 'uri'*
        :type filename: :class:`str`
        :param name: name given to exported mesh (optional)
        :type name: :class:`str`
        :param parent_idx: index of parent node (everything is added to a hierarchy)
        :type parent_idx: :class:`int`
        :param distancegap: distancegap level of tessellation.
        :type distancegap: :class:`float`
        :return: information about additions to the mstep dict
        :rtype: ::class:`int`,:class:`int`

        **Return Format:**
        :first one is the length of buffer before append
        :second one is the length of buffer after append       
        """
        #self.tree+="<li><a href=\""+filenameuri+"\">"+html.escape(name+" ")+str(self.fileId)+"-Download</a></li>"
        #info = defaultdict(list)

        log.debug("mstep export: %r", part)
        buffer_length_so_far = len(self.mstep_dict['buffers'])
        solidfound = 0
        # ----- Adding to: buffers
        with measure_time(log, 'buffers'):
            if (filetype=="EDGE") or (filetype=="Vertex"):               
               solidfound = 0
               uvPlane=[]
               buff=None
               uvbuff=None
            else:
                if(fromRecursion==False):
                    buff, solidfound, uvbuff, uvPlane = self.part_buffer(part)
            
            mesherDict = self.updateParentChild(name,part)
            #print("add_part", mesherDict)
            mesher_dict = self.findDictionary(mesherDict)
            #print("mesh",mesher_dict)
            mesher_dict[self.gltf_Dict["step"]] = os.path.basename(filenameuri)
            myFileType = filetype[0:1]
            mesher_dict[self.gltf_Dict["element"]] = myFileType
            mesher_dict[self.gltf_Dict["geometry"]] = curvecode
            
            myconvertedentity = self.convertEntityToBase64(entity)
            mesher_dict[self.gltf_Dict["entity"]] = myconvertedentity
            lowerboundmin=(0,0,0)
            upperboundmax=(1,1,1)
            """ if self.gltf_Dict['multiplicities'] in entity:
                print("Entity Multiplicities",entity[self.gltf_Dict['multiplicities']],\
                    len(entity[self.gltf_Dict['multiplicities']]),entity[self.gltf_Dict['knot']],\
                        entity[self.gltf_Dict['pole']]) """
            if self.gltf_Dict['basic'] in myconvertedentity:
                mesher_dict[self.gltf_Dict["points"]] = None
            else:
                base64BufferString, (lowerboundmin,upperboundmax) = self.convertToBase64(curvepoints)
                mesher_dict[self.gltf_Dict["points"]] = base64BufferString
            #mesher_dict["fileId"] = self.fileId
            mesher_dict[self.gltf_Dict["leaf"]]=True
        
            if( solidfound > 0 ) :
                #print("before compare")
                self.scene_min = _list3_min(
                    self.scene_min,
                    buff.vert_min
                )
                self.scene_max = _list3_max(
                    self.scene_max,
                    buff.vert_max
                )
                #print("affter compare")
                buffer_index = len(self.mstep_dict['buffers'])
                #print(buff.vert_min)
                #print(buff.vert_max)
                buffer_dict = {
                    "byteLength": len(buff)                   
                }
                self.updateName(name, buffer_dict)
                
                mesher_dict[self.gltf_Dict["topLeft"]] = buff.vert_min
                mesher_dict[self.gltf_Dict["bottomRight"]] = buff.vert_max
                mesher_dict[self.gltf_Dict["bin"]]=True

                self.updateParentDimensions(mesher_dict)
                
                #print("affter update")
                if part_color:
                    mesher_dict[self.gltf_Dict["R"]] = part_color.Red()
                    mesher_dict[self.gltf_Dict["G"]] = part_color.Green()
                    mesher_dict[self.gltf_Dict["B"]] = part_color.Blue()
                    mesher_dict[self.gltf_Dict["A"]] = (0 if(myFileType=="E" or myFileType=="V") else 1)
                else:
                    if self.defaultColor:
                        mesher_dict[self.gltf_Dict["R"]] = self.defaultColor.Red()
                        mesher_dict[self.gltf_Dict["G"]] = self.defaultColor.Green()
                        mesher_dict[self.gltf_Dict["B"]] = self.defaultColor.Blue()
                        mesher_dict[self.gltf_Dict["A"]] = (0 if(myFileType=="E" or myFileType=="V") else 1)                       
                    else:
                        mesher_dict[self.gltf_Dict["R"]] = 0.3
                        mesher_dict[self.gltf_Dict["G"]] = 0.32
                        mesher_dict[self.gltf_Dict["B"]] = 0.37
                        mesher_dict[self.gltf_Dict["A"]] = (0 if(myFileType=="E" or myFileType=="V") else 1)
                mesher_dict[self.gltf_Dict["texture"]] = ""
                mesher_dict[self.gltf_Dict["metallicFactor"]] = 0.1
                mesher_dict[self.gltf_Dict["roughnessFactor"]] = 0.7
                # write uv file
               
                base64data = base64.b64encode(uvbuff.read()).decode('ascii')
                mesher_dict['uv64'] = "{data}".format(
                    data=base64data,
                )
                """fileWritten = False
                newfilename = "Display/"+self.getBaseFileName()+".uv"
                #print("Writing File",newfilename)
                try:

                    with open(newfilename, 'wb') as fh:
                        for chunk in uvbuff.buffer_iter():
                            fh.write(chunk)
                    fileWritten = True
                except Exception as e:
                    print("Error in writing",e)
                buffer_dict['uv'] = os.path.basename(newfilename)
                buffer_dict['uv64'] = "data:{mimetype};base64,{data}".format(
                    mimetype="application/octet-stream",
                    data=base64data,
                ) 
                mesher_dict["uv"] = os.path.basename(newfilename) """  
                newfilename = self.displaypath+self.getBaseFileName()+".bin"
                if self.createFiles and self.writefiles:
                    fileWritten = False
                    #print("Writing File",newfilename)
                    # write mesh file
                    try:
                        
                        with open(newfilename, 'wb') as fh:
                            for chunk in buff.buffer_iter():
                                fh.write(chunk)
                        fileWritten = True
                    except Exception as e:
                        print("Error in writing",e)
                else:
                    fileWritten = True
                    print("Not saving",newfilename,"due to analysis")
                
                if fileWritten:
                    self.binId += 1
                    buffer_dict['uri'] = os.path.basename(newfilename)
                    #mesher_dict[self.gltf_Dict["bin"]] = buffer_dict['uri']
                    """ mesher_dict[self.gltf_Dict["bin"]] = os.path.basename(newfilename)               
                     mesher_dict["binId"] = self.binId """             
                    #buffer_dict['step'] = os.path.basename(filenameuri)
                    #buffer_dict[self.gltf_Dict["indent"]] = self.indent

                    self.mstep_dict['buffers'].append(buffer_dict)

                    #info['buffers'].append((buffer_index, buffer_dict))

                    # ----- Adding: bufferViews
                    with measure_time(log, 'bufferViews'):
                        bufferView_index = len(self.mstep_dict['bufferViews'])

                        # vertices view
                        view = {
                            "buffer": buffer_index,
                            "byteOffset": buff.vert_offset,
                            "byteLength": buff.vert_len,
                            "byteStride": 12,
                            "target": StepGL.ARRAY_BUFFER,
                        }
                        self.mstep_dict['bufferViews'].append(view)
                        bufferView_index_vertices = bufferView_index
                        #info['bufferViews'].append((bufferView_index_vertices, view))

                        # indices view
                        view = {
                            "buffer": buffer_index,
                            "byteOffset": buff.idx_offset,
                            "byteLength": buff.idx_len,
                            "target": StepGL.ELEMENT_ARRAY_BUFFER,
                        }
                        self.mstep_dict['bufferViews'].append(view)
                        bufferView_index_indices = bufferView_index + 1
                        #info['bufferViews'].append((bufferView_index_indices, view))

                    # ----- Adding: accessors
                    with measure_time(log, 'accessors'):
                        accessor_index = len(self.mstep_dict['accessors'])

                        # vertices accessor
                        accessor = {
                            "bufferView": bufferView_index_vertices,
                            "byteOffset": 0,
                            "componentType": StepGL.FLOAT,
                            "count": math.trunc(buff.vert_size),
                            "min":  [v  for v in buff.vert_min],# [v - 0.1 for v in buff.vert_min], 
                            "max":  [v  for v in buff.vert_max],# [v + 0.1 for v in buff.vert_max],
                            "type": "VEC3",
                        }
                        self.mstep_dict['accessors'].append(accessor)
                        accessor_index_vertices = accessor_index
                        #info['accessors'].append((accessor_index_vertices, accessor))

                        # indices accessor
                        accessor = {
                            "bufferView": bufferView_index_indices,
                            "byteOffset": 0,
                            "componentType": buff.idx_type,
                            "count": math.trunc(buff.idx_size),
                            "type": "SCALAR",
                        }
                        self.mstep_dict['accessors'].append(accessor)
                        accessor_index_indices = accessor_index + 1
                        #info['accessors'].append((accessor_index_indices, accessor))

                    # ----- Adding: materials
                    with measure_time(log, 'materials'):
                        material_index = len(self.mstep_dict['materials'])
                        try:
                            if part_color:
                                material = { #'alphaCutoff': 1.0,
                                        'alphaMode': 'BLEND', 'pbrMetallicRoughness': {
                                        'baseColorFactor': [
                                            part_color.Red(),part_color.Green(),part_color.Blue(),(0 if(myFileType=="E" or myFileType=="V") else 1)
                                            ], 'metallicFactor': 0.1, 'roughnessFactor': 0.7}}
                            else:
                                material = self.default_material
                            """  material["uv64"]="data:{mimetype};base64,{data}".format(
                                mimetype="application/octet-stream",
                                data=base64data,
                            ) """
                        except Exception as e:
                            print("Error in updation", e)
                        self.mstep_dict['materials'].append(material)
                        #info['materials'].append((material_index, material))

                    # ----- Adding: meshes
                    with measure_time(log, 'meshes'):
                        mesh_index = len(self.mstep_dict['meshes'])
                        mesh = {
                            "primitives": [
                                {
                                    "attributes": {
                                        "POSITION": accessor_index_vertices,
                                    },
                                    "indices": accessor_index_indices,
                                    "mode": StepGL.TRIANGLES,
                                    "material": material_index,
                                }
                            ],
                        }
                        self.updateName(name,mesh)
                        self.mstep_dict['meshes'].append(mesh)
                        #info['meshes'].append((mesh_index, mesh))

                    # ----- Adding: nodes
                    with measure_time(log, 'nodes'):
                        node_index = len(self.mstep_dict['nodes'])
                        
                        node = {
                            "mesh": mesh_index,                        
                        }
                        self.updateName(name,node)                    
                        #node.update(self.transformed_matrix)
                        self.mstep_dict['nodes'].append(node)
                        #info['nodes'].append((node_index, node))

                    # Appending child index to its parent's children list
                    parent_node = self.mstep_dict['nodes'][parent_idx]
                    parent_node['children'] = parent_node.get('children', []) + [node_index]
            else:
                if (filetype=="EDGE") or (filetype=="Vertex"):
                    
                    mesher_dict[self.gltf_Dict["topLeft"]] = lowerboundmin
                    mesher_dict[self.gltf_Dict["bottomRight"]] = upperboundmax
                    mesher_dict[self.gltf_Dict["bin"]]=True

                    self.updateParentDimensions(mesher_dict)
                    
                    #print("affter update")
                    if part_color:
                        mesher_dict[self.gltf_Dict["R"]] = part_color.Red()
                        mesher_dict[self.gltf_Dict["G"]] = part_color.Green()
                        mesher_dict[self.gltf_Dict["B"]] = part_color.Blue()
                        mesher_dict[self.gltf_Dict["A"]] = (0 if(myFileType=="E" or myFileType=="V") else 1)
                    else:
                        if self.defaultColor:
                            mesher_dict[self.gltf_Dict["R"]] = self.defaultColor.Red()
                            mesher_dict[self.gltf_Dict["G"]] = self.defaultColor.Green()
                            mesher_dict[self.gltf_Dict["B"]] = self.defaultColor.Blue()
                            mesher_dict[self.gltf_Dict["A"]] = (0 if(myFileType=="E" or myFileType=="V") else 1)                       
                        else:
                            mesher_dict[self.gltf_Dict["R"]] = 0.3
                            mesher_dict[self.gltf_Dict["G"]] = 0.32
                            mesher_dict[self.gltf_Dict["B"]] = 0.37
                            mesher_dict[self.gltf_Dict["A"]] = (0 if(myFileType=="E" or myFileType=="V") else 1)
                    mesher_dict[self.gltf_Dict["texture"]] = ""
                    mesher_dict[self.gltf_Dict["metallicFactor"]] = 0.1
                    mesher_dict[self.gltf_Dict["roughnessFactor"]] = 0.7
                #print(" I have reache here without adding")
        #buffer_length_current = len(self.mstep_dict['buffers'])
        return mesher_dict[self.gltf_Dict["id"]], mesher_dict[self.gltf_Dict["name"]], uvPlane, solidfound, buff, uvbuff

    
