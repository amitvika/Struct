import os
#import sys
#import unicodedata
#from pathlib import Path
import shutil
import re
import struct
import base64
#import zlib
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
from pathlib import Path

#from tinydb import Storage
#from rest_framework import status

#from six import MovedAttribute
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
from OCC.Core.TopoDS import (TopoDS_Compound, topods_Vertex, TopoDS_Builder, topods_Face) #,TopoDS_Vertex,  TopoDS_Iterator,  TopoDS_Shape)
from OCC.Core.BRepCheck import (BRepCheck_Shell, BRepCheck_Status)
from OCC.Core.XSControl import XSControl_WorkSession
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.gp import (gp_Pnt, gp_Trsf, gp_Ax3, gp_Circ, gp_Dir, gp_Ax2 )#, gp_XYZ, gp_Pnt2d,  gp_Vec)

#from OCC.Core.GProp import GProp_GProps
#from OCC.Core.BRepGProp import brepgprop_LinearProperties
#from OCC.Core.ShapeBuild import ShapeBuild_ReShape
from OCC.Core.TopAbs import (TopAbs_SHELL,TopAbs_Orientation)
#,TopAbs_VERTEX, TopAbs_EDGE, TopAbs_FACE, TopAbs_WIRE, TopAbs_SOLID, TopAbs_COMPOUND,TopAbs_COMPSOLID)
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeSphere, BRepPrimAPI_MakeBox
from OCC.Core.GeomAbs import GeomAbs_Circle #, GeomAbs_Line
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
                                getShapeLocationAndDirection,
                                Topo )

from .OCCExtend.TopologyUtils import list_of_shapes_to_compound
from . import OCPImporters
from .. import assembly #,cq
from ... import conversion
from .OCPShapes import Shape, Vertex
from .OCPAssembly import Color

#from ... import Assembly
from .OCCExtend.ShapeFactory import (
    recognize_direction, recognize_curve, recognize_face_entity, 
    get_circle_info, rotate_shape, get_oriented_bounding_details,
    getDictionaryFromOBB, translate_shp, rotate_shp_3_axis )
from ....thumbnail.thumbnail import createThumbnail
from .gltfDictionary import gltfdict
from .Quaternion import Quaternion

from ....settingscopy import (DISPLAY_URL,MEDIA_URL,COPY_PATH,S3_BUCKET)
from ....assemblyorder import FindAssemblingOrder
from ....assemblystack import FindStackability
#from ....controllers import ParsingDetailsController, ChildParsingDetailsController, EdgeParsingDetailsController, ItemDetailsController
from .... import controllers
@contextmanager
def measure_time(log, name):
    start_time = time()
    yield
    taken = time() - start_time
    log.debug("    %-25s (took: %gms)", name, round(taken * 1000, 3))

# def convertToBool(value,default):    
#     if value is not None:
#         try:
#             if isinstance(value,bool):
#                 return value
#             if value.lower()=="true":
#                 return True
#             else:
#                 if value.lower()=="false":
#                     return False
#                 else:
#                     boolvalue = bool(value)
#                     return boolvalue
#         except:
#             return default
#     else:
#         return default

# def convertToFloat(value,default):
#     if value is not None:
#         if isinstance(value,float) :
#             return value
#         try:
#             floatValue = float(value)
#             return floatValue
#         except:
#             return default
#     else:
#         return default

# def convertToInt(value,default):    
#     if value is not None:
#         if isinstance(value,int):
#             return value
#         try:
#             intValue = int(value)
#             return intValue
#         except:
#             return default
#     else:
#         return default

# def getValueFromJSONKey(jsonstruct, key):
#     if key in jsonstruct:
#         return jsonstruct[key]
#     else:
#         return None

# def saveStatusToDatabase(statusDictionary,originalFileName,referenceID,tabSuffix,alwaysNew=True):
#     try:
#         storageData = {}
#         storageData["external_ref"]=referenceID
#         storageData["tab_suffix"]=tabSuffix if tabSuffix else 'BB'
#         storageData["assemblies"]=convertToInt(getValueFromJSONKey(statusDictionary,"assemblies"),0)
#         storageData["trees"]=convertToInt(getValueFromJSONKey(statusDictionary,"trees"),0)
#         storageData["parts"]=convertToInt(getValueFromJSONKey(statusDictionary,"parts"),0)
#         storageData["faces"]=convertToInt(getValueFromJSONKey(statusDictionary,"faces"),0)
#         storageData["edges"]=convertToInt(getValueFromJSONKey(statusDictionary,"edges"),0)
#         storageData["vertices"]=convertToInt(getValueFromJSONKey(statusDictionary,"vertices"),0)
#         storageData["obb_position"]=getValueFromJSONKey(statusDictionary,"obbPosition")
#         storageData["obb_origin"]=getValueFromJSONKey(statusDictionary,"obbOrigin")
#         storageData["obb_rotated"]=getValueFromJSONKey(statusDictionary,"obbRotated")
#         cxcycz=getValueFromJSONKey(statusDictionary,"center")
#         cx,cy,cz=0,0,0
#         if cxcycz:
#             cx, cy, cz = cxcycz         
#         storageData["cx"],storageData["cy"],storageData["cz"] = convertToFloat(cx,0),convertToFloat(cy,0),convertToFloat(cz,0) 
#         cxcycz=getValueFromJSONKey(statusDictionary,"rotation")
#         rx,ry,rz=0,0,0
#         if cxcycz:
#             rx, ry, rz = cxcycz
#         storageData["rx"],storageData["ry"],storageData["rz"] = convertToFloat(rx,0),convertToFloat(ry,0),convertToFloat(rz,0) 
#         cxcycz=getValueFromJSONKey(statusDictionary,"obbRotated")
#         sx,sy,sz=0,0,0
#         if cxcycz:
#             sx,sy,sz=getValueFromJSONKey(cxcycz,"sx"),getValueFromJSONKey(cxcycz,"sy"),getValueFromJSONKey(cxcycz,"sz")
#         storageData["sx"],storageData["sy"],storageData["sz"]=convertToFloat(sx,0),convertToFloat(sy,0),convertToFloat(sz,0) 
#         storageData["zerostep"]=getValueFromJSONKey(statusDictionary,"zerostep")
#         storageData["percent"]=convertToFloat(getValueFromJSONKey(statusDictionary,"percent"),0)
#         storageData["start"]=getValueFromJSONKey(statusDictionary,"start")
#         storageData["current"]=getValueFromJSONKey(statusDictionary,"current")
#         storageData["action"]=getValueFromJSONKey(statusDictionary,"action")
#         storageData["finish"]=getValueFromJSONKey(statusDictionary,"finish")
#         storageData["reset"]=getValueFromJSONKey(statusDictionary,"reset")
#         storageData["assembly"]=getValueFromJSONKey(statusDictionary,"assembly")
#         print("Before assinging serializer",storageData,referenceID,storageData["tab_suffix"])
#         storageSerializers =[] 
#         if referenceID:
#             storageSerializers = ParsingDetails.objects.filter(external_ref=referenceID,tab_suffix=storageData["tab_suffix"])
#         else:
#             storageSerializers = ParsingDetails.objects.filter(name=originalFileName,tab_suffix=storageData["tab_suffix"])        
#         if(len(storageSerializers)>0):
#             print("Got Initial filter",storageSerializers)
#             #storageSerializers = storageSerializers.filter(tab_suffix=storageData["tab_suffix"])
#         storageSerializer=None
#         if(len(storageSerializers)==1) and (alwaysNew==False):
#             storageSerializer=storageSerializers[0]
#             print("Got storageAs",storageSerializer)            
#         elif(len(storageSerializers)==0) or (alwaysNew):
#             print("I could not get any data",ParsingDetails.objects.all())
#             storageSerializer = ParsingDetails(external_ref=storageData["external_ref"],
#                 tab_suffix=storageData["tab_suffix"])
#                 # name=originalFileName,
#                 # assemblies=storageData["assemblies"],
#                 # trees=storageData["trees"],
#                 # parts=storageData["parts"],
#                 # faces=storageData["faces"],
#                 # edges=storageData["edges"],
#                 # vertices=storageData["vertices"],
#                 # obb_position=storageData["obb_position"],
#                 # obb_origin=storageData["obb_origin"],
#                 # obb_rotated=storageData["obb_rotated"],
#                 # cx=storageData["cx"],cy=storageData["cy"],cz=storageData["cz"],                
#                 # rx=storageData["rx"],ry=storageData["ry"],rz=storageData["rz"],                 
#                 # sx=storageData["sx"],sy=storageData["sy"],sz=storageData["sz"],
#                 # zerostep=storageData["zerostep"],
#                 # percent=storageData["percent"],
#                 # start=storageData["start"],
#                 # current=storageData["current"],
#                 # action=storageData["action"],
#                 # finish=storageData["finish"],
#                 # reset=storageData["reset"],
#                 # assembly=storageData["assembly"],
#                 # external_ref=storageData["external_ref"],
#                 # tab_suffix=storageData["tab_suffix"])
#         else:
#             print("Returning Multiple Records",storageSerializers)
#             return
#         if storageSerializer:
#             storageSerializer.name=originalFileName
#             storageSerializer.assemblies=storageData["assemblies"]
#             storageSerializer.trees=storageData["trees"]
#             storageSerializer.parts=storageData["parts"]
#             storageSerializer.faces=storageData["faces"]
#             storageSerializer.edges=storageData["edges"]
#             storageSerializer.vertices=storageData["vertices"]
#             storageSerializer.obb_position=storageData["obb_position"] if storageData["obb_position"] else {}
#             storageSerializer.obb_origin=storageData["obb_origin"] if storageData["obb_origin"] else {}
#             storageSerializer.obb_rotated=storageData["obb_rotated"] if storageData["obb_rotated"] else {}
#             storageSerializer.cx=storageData["cx"]
#             storageSerializer.cy=storageData["cy"]
#             storageSerializer.cz=storageData["cz"]            
#             storageSerializer.rx=storageData["rx"]
#             storageSerializer.ry=storageData["ry"]
#             storageSerializer.rz=storageData["rz"]                 
#             storageSerializer.sx=storageData["sx"]
#             storageSerializer.sy=storageData["sy"]
#             storageSerializer.sz=storageData["sz"]
#             storageSerializer.zerostep=storageData["zerostep"]
#             storageSerializer.percent=storageData["percent"]
#             storageSerializer.start=storageData["start"]
#             storageSerializer.current=storageData["current"]
#             storageSerializer.action=storageData["action"]
#             storageSerializer.finish=storageData["finish"]
#             storageSerializer.reset=storageData["reset"]
#             storageSerializer.assembly=storageData["assembly"]
#             storageSerializer.internal_object={}
#             print("")
#             print("Storage Serializer Head", storageSerializer, "Tail")
#             print("")
#             storageSerializer.save()
        
#     except Exception as e:
#         print("Error while saving",e)
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
        #print("")
        #print("Quaternion",u,v,w,x)
        #print("")
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
            self.init_shape(shape,color,name)
            """ # Create the application
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
            self.shapetool.UpdateAssemblies() """
    
    def init_shape(self, shape=None, color=None, name=None):
        if shape:
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

    def build_shape(self, shapeArray=None, name=None):
        
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
        if shapeArray:
            for (shape,treeDisplay,R,G,B) in shapeArray:
                if(shape):
                    if R is None:
                        R=0
                    if G is None:
                        G=0
                    if B is None:
                        B=0
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
    
    def getShapesFromOutPutShapes(self,shapes,myParent,mytree,treeLength,fuuid):
        assemblyCount, myAssemblies, myAssemblyName  = self.GetFirstLevelAssemblyOutPutShapesForOrder(shapes,myParent,mytree,treeLength,fuuid)
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

    def writeStatus(self,basefilename,displaypath,percentage,starttime,createdirectory,refid,refname,fname,suffix):
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
            controllers.ParsingDetailsController().save(mystatusdict,refname,fname,refid,suffix)        
        except Exception as e:
            print("Error while wrting",statusfilename,e)
        return mystatusdict
    
    def readStatusInfo(self,sourceFileName,suffixname='3'):
        if sourceFileName:
            head, tail = os.path.split(sourceFileName)
            if(head[-1]!="/"):
                #print("Head does not contain last /",head)
                head = head + "/"
            #else:
            #    #print("Head contains last /",head)
            #    #pass
            displaypath=''
            MediaURLLength = len(MEDIA_URL)
            if head[0:MediaURLLength]==MEDIA_URL:
                displaypath = DISPLAY_URL+head[MediaURLLength:]
            else:
                displaypath = head
            print("Conversion path",displaypath)
            pathfilename, _ = os.path.splitext(tail)
            basefilename = pathfilename+suffixname
        else:
            basefilename = "./"
            displaypath= DISPLAY_URL
        statusfilename = displaypath+basefilename+".status"
        head, _ = os.path.split(statusfilename) 
        DisplayURLLength = len(DISPLAY_URL)
        if head[0:DisplayURLLength]==DISPLAY_URL:
            fileuuid = head[DisplayURLLength:]
            if fileuuid[-1]=='/':
                fileuuid=fileuuid[:-1]
        else:
            fileuuid=None
        if not os.path.isfile(statusfilename):
            statusfilename = S3_BUCKET+statusfilename
            if not os.path.isfile(statusfilename):
                print("checking existance of",statusfilename)
                statusfilename = None
        statusArray={}
        if statusfilename:
            data=None        
            with open(statusfilename, "r") as f:
                data = f.read()
            if data:
                statusArray = json.loads(data)
        print("Status Info",statusArray,fileuuid,statusfilename)
        return statusArray, fileuuid, statusfilename, basefilename

    def createShapeArray(self, shapes):
        shapeArray=[]
        myID=0
        for aShape in shapes:
            myID += 1
            shapeArray.append((aShape,"ID"+str(myID),None))
        return shapeArray

    def getOutputShapesFromSourceFile(self,originalFileName,distancegap,anglegap,statusfilename,comparedict,starttime=None,fileNo=1,statusArray={}):#,thumbwidth,thumbheight):
        """
        Imports a file based on the type (STEP, IGES, BREP, STL)    
        """
        #Now read and return the shape
    
        try:
            doNotBringToOrigin = ((statusArray is not None) and ("zerostep" in statusArray))
            if doNotBringToOrigin:
                print("Status Array",statusArray)
                sourceFileName = statusArray["zerostep"]
                if not os.path.isfile(sourceFileName):
                    doNotBringToOrigin = False
                    sourceFileName = originalFileName
            else:
                sourceFileName = originalFileName   
            print("sourceFileName To Parse",sourceFileName,originalFileName,doNotBringToOrigin)         
            dictionary={}
            _, file_extension = os.path.splitext(sourceFileName)
            file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
            file_extension = file_extension.lower()
            newfilenamewithoutext = DISPLAY_URL+Path(sourceFileName).resolve().stem
            newfilename = newfilenamewithoutext + ".step"
            outputShapes={}
            if file_extension=="stp" or file_extension=="step" or file_extension=="igs" or file_extension=="iges" :         
                
                try:
                    (_, outputShapes, dictionary) = StepIgesAnalyser(
                        filename=sourceFileName,includeparts=False,distancegap=distancegap, logging=logging, 
                        anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False,
                        edgesize=0, vertexsize=0,thumbwidth=0,thumbheight=0).dump()
                except Exception as e:
                    print("error",e)
        
            if file_extension=="stl" :            
                try:
                    shape = conversion.read_stl_file(sourceFileName, as_compound=False)
                    (_, outputShapes, dictionary) = StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=self.createShapeArray(shape),includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False, logging=logging, 
                        thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()
                except Exception as e:
                    print("error",e)
            
            if file_extension=="brep" :            
                try:
                    shape = conversion.read_brep_file(sourceFileName, as_compound=False)
                    (_, outputShapes, dictionary) = StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=self.createShapeArray(shape),includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False, logging=logging, 
                        thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()                
                except Exception as e:
                    print("error",e)
            
            if file_extension=="dxf" :            
                try:
                    shape = OCPImporters.importDXFObjects(sourceFileName, tol=distancegap )
                    (_, outputShapes, dictionary) = StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=self.createShapeArray(shape),distancegap=distancegap,
                        anglegap=anglegap,ascompound=True,writefiles=False, logging=logging, 
                        thumbwidth=0,thumbheight=0).dump()                 
                except Exception as e:
                    print("error",e)
            
            try:
                self.setComparisonDictionary(statusfilename,10*fileNo,starttime,comparedict,False)
                _, myShapes = outputShapes
                _,onlyShapes,_,_,_ = self.getShapesFromOutPutShapes(myShapes,1,dictionary["tree"],len(dictionary["tree"]),'')
                if doNotBringToOrigin:
                    fullZeroShape,_ = list_of_shapes_to_compound(onlyShapes,True)
                    dict_return = statusArray
                else:
                    partscount=len(onlyShapes)
                    fullAssemblyShape,_ = list_of_shapes_to_compound(onlyShapes,True)
                    assembly_faces_dict = {}
                    assembly_edges_dict = {}
                    assembly_vertices_dict = {}
                    dumpTopologyFacesEdgesVertices(fullAssemblyShape,assembly_faces_dict,assembly_edges_dict,assembly_vertices_dict)
                    facescount=len(assembly_faces_dict)
                    edgescount=len(assembly_edges_dict)
                    verticescount=len(assembly_vertices_dict)        
                    thisAssemblydimension = get_oriented_bounding_details(fullAssemblyShape)                        
                    thisAssemblydictionary = getDictionaryFromOBB(thisAssemblydimension,True)
                    zerostep = sourceFileName+"ZeroRotatedOrigin.step"
                    fullZeroShape, fullZeroDictionary, fullRotatedDictionary, center, rotation = self.\
                        bringToOriginAndToUnitAxis(fullAssemblyShape,thisAssemblydimension,thisAssemblydictionary,zerostep)
                    dict_return= (dictionary["status"] if "status" in dictionary else {} ) if dictionary else {} 
                    dict_return["parts"]=partscount
                    dict_return["faces"]=facescount
                    dict_return["edges"]=edgescount
                    dict_return["vertices"]=verticescount
                    dict_return["obbPosition"]=thisAssemblydictionary
                    dict_return["obbOrigin"]=fullZeroDictionary
                    dict_return["obbRotated"]=fullRotatedDictionary 
                    dict_return["center"]=center 
                    dict_return["rotation"]=rotation 
                    dict_return["zerostep"]=zerostep 
                return (fullZeroShape,dict_return)

            except Exception as e:
                print("error",e) 
                
            return (None,statusArray)
        except Exception as e:
            print("error",e) 
            return (None,statusArray)
            #raise ValueError("File Could not be loaded") 
        except:
            print("Unknown system error occured")
            return (None,statusArray)

    def compareToCheckIdentity(self,fullZeroShape1,statusArray1,sourceFileName1,sourceFileName2,distancegap,anglegap,statusfile,starttime=None,updateprogressfile=None,comparechild=0,comparesub=0):#,thumbwidth,thumbheight):
        dictionary={
            "source1":sourceFileName1,
            "source2":sourceFileName2,
            "node1":0,
            "node2":0,
            "isEqual":False,
            "vertexEquals":False }
        if (sourceFileName1 is not None) and sourceFileName1 and (sourceFileName2 is not None) and sourceFileName2:
            try:               
                statusArray2, _, _, basefilename2 = self.readStatusInfo(sourceFileName2)    
                statusfilename = statusfile+basefilename2+".status"        
                dictionary["obbstruct1"]=statusArray1
                self.setComparisonDictionary(statusfilename,15,starttime,dictionary,False,updateprogressfile,comparechild,comparesub)
                fullZeroShape2, statusArray2 = self.getOutputShapesFromSourceFile(sourceFileName2,distancegap,anglegap,statusfilename,dictionary,starttime,2,statusArray2)
                dictionary["obbstruct2"]=statusArray2
                self.setComparisonDictionary(statusfilename,25,starttime,dictionary,False,updateprogressfile,comparechild,comparesub)
                dictionary = self.compareToCheckIdentityShapesOriginated(dictionary,fullZeroShape1,fullZeroShape2,statusfilename,starttime,updateprogressfile,comparechild,comparesub)
                #OCPStepIGESAnalyser.StepExportWithColor().compareToCheckIdentityShapes(sourceFileName1,sourceFileName2,onlyShapes1,onlyShapes2,statusfilename,starttime,None)
                return dictionary
            except Exception as e:
                dictionary["error"]=str(e)
                self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,updateprogressfile,comparechild,comparesub) 
                return dictionary
        else:
            statusfilename=statusfile+"Noname"+".status"
            print("Got Empty Filename?",sourceFileName1,sourceFileName2,statusfilename)
        self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,updateprogressfile,comparechild,comparesub)
        return dictionary
        #raise ValueError("File Could not be loaded") 

    def writeProgress(self, maxgap=10, action='',childfiles=[],childpercent=0,comparechild=0,comparesub=0,comparepercent=0):
        currenttime = datetime.utcnow()
        mystatusdict =  {
            "begin":self.assemblycreatedcurrentcount,
            "end":self.totalcount,
            "start":self.starttime.strftime("%H-%M-%S"),
            "current":currenttime.strftime("%H-%M-%S"),
            "action":action,
            "createchilds":self.CreateChildSteps,
            "createorder":self.CreateAssemblyOrder,
            "createstack":self.CreateStackability,
            "childfiles":childfiles,
            "childpercent":childpercent,
            "comparechild":comparechild,
            "comparesub":comparesub,
            "comparepercent":comparepercent }
        try:            
            timingdelta = currenttime-self.currenttime            
            if (timingdelta.total_seconds() >= maxgap) or (maxgap==0):        
                paramfilename = self.displaypath+self.basefilename[:-1]+".status"
                print("Status File",paramfilename,self.assemblycreatedcurrentcount,self.totalcount,action)
                try:
                    with open(paramfilename, 'w') as fh:
                        fh.write(json.dumps(mystatusdict, sort_keys=True, indent=2 ))
                except Exception as e:
                    print("While Writing",paramfilename,e,self.assemblycreatedcurrentcount)
                controllers.ChildParsingDetailsController().save(mystatusdict,self.refname,self.basefilename,self.refid,"pd")                       
        
        except Exception as e:
                print("While Writing",e,self.assemblycreatedcurrentcount)
                           
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
    
    def getShapeFromPickle(self,fname):
        fnamepath = DISPLAY_URL+fname+".pickle"
        if not os.path.isfile(fnamepath):
            fnamepath = S3_BUCKET+DISPLAY_URL+fname+".pickle"
            if not os.path.isfile(fnamepath):
                fnamepath = None
        shellshape=None
        if fnamepath:
            with open(fnamepath, 'rb') as f:
                # The protocol version used is detected automatically, so we do not
                # have to specify it.
                shellshape = pickle.load(f)
        return fnamepath, shellshape

    def GetSelfAndTreeFromOutputShapes(self,assembly,aTree,shapes,myTree,treeLength,fuuid,writeProgressToupdateStatus=False):
        if writeProgressToupdateStatus:
            self.writeProgress()
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
            if aTree[self.gltf_dict['element']]=="P":
                if shapes:
                    item = self.findMyShapeByTreeID(shapes,treeID)
                    if item != None:
                        [shape, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, (uvPlane, solidfound, buff, uvbuff)] = item
                    else:
                        shape=None
                elif aTree[self.gltf_dict['step']]:
                    fname = aTree[self.gltf_dict['step']]
                    fname = fname[0:-5] #'.step' is removed at the end
                    guid = fuuid
                    if guid!='':
                        guid = guid+'/'
                    _,shape = self.getShapeFromPickle(guid+fname)
                else:
                    shape=None
                if(shape):
                    R=aTree[self.gltf_dict['R']]
                    G=aTree[self.gltf_dict['G']]
                    B=aTree[self.gltf_dict['B']]
                    if R is None:
                        R=0
                    if G is None:
                        G=0
                    if B is None:
                        B=0
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
            subassembly=self.GetAssemblyOutPutShapes(treeID,myTree,shapes,treeDisplay,treeLength,fuuid,writeProgressToupdateStatus)
            self.shapetool.AddComponent(assembly, subassembly,TopLoc_Location())  
            self.shapetool.UpdateAssemblies()

    def GetAssemblyOutPutShapes(self,myParent,myTree,shapes,name,treeLength,fuuid,writeProgressToupdateStatus=False):        
        assembly = self.shapetool.NewShape()
        if name is None:
            name =  "Struct Assembly "+str(myParent)
        TDataStd_Name.Set(assembly, TCollection_ExtendedString(name))      
        lengthCheck=0
        for aTree in myTree:
            if aTree[self.gltf_dict['parentId']]==myParent : 
                self.GetSelfAndTreeFromOutputShapes(assembly,aTree,shapes,myTree,treeLength,fuuid,writeProgressToupdateStatus)
            lengthCheck+=1
            if lengthCheck >=treeLength:
                break
        return assembly
    
    def compareStatusArrays(self, statusArray1, statusArray2):
        if (statusArray1["parts"]!=statusArray2["parts"]):
            print("Parts Comparision",statusArray1,statusArray2,statusArray1["parts"],statusArray2["parts"])
            return False
        [sx1, sy1, sz1] = sorted([statusArray1["obbRotated"]["sx"],statusArray1["obbRotated"]["sy"],statusArray1["obbRotated"]["sz"]])
        [sx2, sy2, sz2] = sorted([statusArray2["obbRotated"]["sx"],statusArray2["obbRotated"]["sy"],statusArray2["obbRotated"]["sz"]])
        if (abs(sx1-sx2) > 1e-6) or (abs(sy1-sy2) > 1e-6) or (abs(sz1-sz2) > 1e-6) :
            print("Size Comparision",[statusArray1["obbRotated"]["sx"],statusArray1["obbRotated"]["sy"],statusArray1["obbRotated"]["sz"]],[statusArray2["obbRotated"]["sx"],statusArray2["obbRotated"]["sy"],statusArray2["obbRotated"]["sz"]])
            return False
        if (statusArray1["vertices"]!=statusArray2["vertices"]):
            print("Vertex Comparision",statusArray1["vertices"],statusArray2["vertices"])            
            return False 
        return True

    def WriteAssemblyOutPutShapes(self,shapes,filename,myParent,myTree,treeLength,\
        includeparts,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight, \
            logging, seperateparts,edgesize, vertexsize, maximumfacestoinclude,\
                CreateChildSteps,CreateAssemblyOrder,explodegap,center,holescale,removegap,\
                    recreatefororder,CreateStackability,fuuid,displaypath='',\
                        starttime=datetime.utcnow(),totalcount=0,comparechildren=True,\
                            refid='',refname=''):
        self.basefilename=filename
        self.displaypath=displaypath
        self.starttime=starttime
        self.CreateChildSteps=CreateChildSteps
        self.CreateAssemblyOrder=CreateAssemblyOrder
        self.CreateStackability=CreateStackability
        self.totalcount=totalcount
        self.currenttime=datetime.utcnow()
        self.assemblycreatedcurrentcount=0
        self.refid=refid
        self.refname=refname
        self.writeProgress(0,"Initiated")
        name = None
        lengthCheck = 0
        #print("Passed",myTree)
        myParentCheck = myParent if myParent else 1
        for aTree in myTree:
            #print("My aTree",aTree)
            if aTree[self.gltf_dict['id']]==myParentCheck :
                name=aTree[self.gltf_dict['name']]
                if name is None:
                    name =  "Struct Assembly "+str(myParentCheck)
                break
            lengthCheck+=1
            if lengthCheck >=treeLength:
                break
        addedAssembly = 0
        assemblyCount=0
        if name:
            if myParent:
                """ lengthCheck = 0
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
                        assemblyCount=1 """
                assemblyCount, myParentId = self.getChildTreeCountAndDeepestParentID(myParent,myTree,treeLength,True)
            else:
                myParentId = None
                assemblyCount=1   
                   
        if (name) and (assemblyCount>=1):
            assemblyNames = []
            lengthCheck = 0
            self.assemblycreatedcurrentcount=0
            self.writeProgress(0,"Started")
            myChildAssemblyOutputShapes=[]
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
                    treeDisplay = aTree[self.gltf_dict['display']]
                    #print("Getting a shape",treeName,aTree)
                    self.GetSelfAndTreeFromOutputShapes(assembly,aTree,shapes,myTree,treeLength,fuuid,True)
                    uuidname = str(uuid.uuid4())
                    uniquename=filename+" "+str(treeID)
                    self.assemblycreatedcurrentcount=addedAssembly
                    addedAssembly+=1
                    self.writeProgress()
                    fullpath = 'Media/'+uuidname+'/'+uniquename+".step"
                    #CREATE A MONGODB and GET REFID and REFNAME?
                    os.makedirs(os.path.dirname(fullpath), exist_ok=True)
                    if(self.write_file(fullpath)):  
                        #print("Assigning a shape",uuidname,uniquename,treeName,aTree) 
                        ((_,_,outputFullAssemblyZeroShape),(_, _),status_dict)=StepIgesAnalyser(filename=fullpath,includeparts=includeparts,\
                            distancegap=distancegap,anglegap=anglegap,disectparts=disectparts,\
                                moverotate=moverotate,thumbwidth=thumbwidth,thumbheight=thumbheight,\
                                    logging=logging,seperateparts=seperateparts, edgesize=edgesize,\
                                        vertexsize=vertexsize,maximumfacestoinclude=maximumfacestoinclude,\
                                            CreateChildSteps=CreateChildSteps,CreateAssemblyOrder=CreateAssemblyOrder,\
                                                explodegap=explodegap, center=center, holescale=holescale,\
                                                     removegap=removegap,recreatefororder=recreatefororder,\
                                                         CreateStackability=CreateStackability,\
                                                             updateprogressfile=self.writeProgress,\
                                                                 comparechildren=comparechildren,\
                                                                     refid='',refname='').dump(False) 
                                                                 #in thread background thumbnail creation is not working Hence forcing dump to be thread free.
                        subassemblyCounthere=0
                        subassemblyTreehere=0
                        # statusArray={
                        #      "tree":status_dict["tree"],
                        #      "status":status_dict["status"]}
                        statusArrayStatus=status_dict["status"]
                        #statusTreeStatus=status_dict["tree"]
                        #statusArray={}
                        try:
                            if "status" in status_dict:
                                #statusArray=status_dict["status"]
                                if "assemblies" in statusArrayStatus:
                                    subassemblyCounthere=statusArrayStatus["assemblies"]
                                if "trees" in statusArrayStatus:
                                    subassemblyTreehere=statusArrayStatus["trees"]                                
                        except Exception as e:
                            print("There is an exception while fetching assembly count",e)
                        equalsDict=[]
                        myAssemblyChildInfo = (uuidname,uniquename,treeName,subassemblyCounthere,subassemblyTreehere,treeDisplay,statusArrayStatus,equalsDict)
                        assemblyNames.append(myAssemblyChildInfo)
                        #myChildAssemblyOutputShapes.append((statusTreeStatus,outputAssemblyShapesOrder,outputFullAssemblyZeroShape))
                        myChildAssemblyOutputShapes.append(outputFullAssemblyZeroShape)
                                         
                lengthCheck+=1
                if lengthCheck >=treeLength:
                    break
            if comparechildren:
                self.writeProgress(0,"Started Comparing Childs")
                myChildAssemblyOutputShapesLen = len(myChildAssemblyOutputShapes)
                for childShapesIndex in range(myChildAssemblyOutputShapesLen):
                    myAssemblyChildInfo = assemblyNames[childShapesIndex]
                    #statusChildTree,childOutputShapes,childFullAssemblyZeroShape = myChildAssemblyOutputShapes[childShapesIndex]
                    childFullAssemblyZeroShape = myChildAssemblyOutputShapes[childShapesIndex]
                    self.writeProgress(comparechild=childShapesIndex)
                    for compareShapesIndex in range(childShapesIndex+1,myChildAssemblyOutputShapesLen):
                        self.writeProgress(comparechild=childShapesIndex,comparesub=compareShapesIndex)
                        myAssemblyChildInfo = assemblyNames[childShapesIndex]
                        myAssemblyCompareInfo = assemblyNames[compareShapesIndex]
                        #statusCompareTree,compareOutputShapes,compareFullAssemblyZeroShape = myChildAssemblyOutputShapes[compareShapesIndex]
                        compareFullAssemblyZeroShape = myChildAssemblyOutputShapes[compareShapesIndex]
                        (uuidname1,uniquename1,treeName1,nodeCount1,treeLength1,treeDisplay1,statusArray1,equalsDict1)=myAssemblyChildInfo
                        (uuidname2,uniquename2,treeName2,nodeCount2,treeLength2,treeDisplay2,statusArray2,equalsDict2)=myAssemblyCompareInfo
                        compareStatusFileName='Display/'+uuidname1+'/'+uniquename1+uniquename2+".status"
                        #compareStepFileName='Media/'+uuidname1+'/'+uniquename1+uniquename2
                        sourceAssemblyFileName1,sourceAssemblyFileName2='Media/'+uuidname1+'/'+uniquename1,'Media/'+uuidname2+'/'+uniquename2
                        compareDictionary={
                            "source1":sourceAssemblyFileName1,
                            "source2":sourceAssemblyFileName2,
                            "node1":nodeCount1,
                            "node2":nodeCount2,
                            "isEqual":False,
                            "vertexEquals":False,
                            'obbstruct1':statusArray1,
                            'obbstruct2':statusArray2}
                        retDictionary = compareDictionary
                        self.setComparisonDictionary(compareStatusFileName,10,starttime,compareDictionary,True,self.writeProgress,childShapesIndex,compareShapesIndex)

                        if(self.compareStatusArrays(statusArray1,statusArray2)):
                            # _,onlyShapes1,_,_,_ = self.getShapesFromOutPutShapes(childOutputShapes,1,statusChildTree,treeLength1,'')
                            # self.setComparisonDictionary(compareStatusFileName,15,starttime,compareDictionary,False)
                            # _,onlyShapes2,_,_,_ = self.getShapesFromOutPutShapes(compareOutputShapes,1,statusCompareTree,treeLength2,'')
                            # self.setComparisonDictionary(compareStatusFileName,25,starttime,compareDictionary,False)
                            # retDictionary = self.compareToCheckIdentityShapes(sourceAssemblyFileName1,sourceAssemblyFileName2,onlyShapes1,onlyShapes2,compareStatusFileName,starttime,compareStepFileName)
                            retDictionary = self.compareToCheckIdentityShapesOriginated(compareDictionary,childFullAssemblyZeroShape,compareFullAssemblyZeroShape,compareStatusFileName,starttime,self.writeProgress,childShapesIndex,compareShapesIndex)
            
                        if(retDictionary["vertexEquals"] or retDictionary["isEqual"]):
                            equalsDict1.append(\
                                ((uuidname1,uniquename1,treeName1,treeDisplay1),\
                                    (uuidname2,uniquename2,treeName2,treeDisplay2),\
                                        (retDictionary["vertexEquals"],retDictionary["isEqual"])))
                            myAssemblyChildInfo=(uuidname1,uniquename1,treeName1,nodeCount1,treeLength1,treeDisplay1,statusArray1,equalsDict1)
                            assemblyNames[childShapesIndex]=myAssemblyChildInfo
                            equalsDict2.append(\
                                ((uuidname1,uniquename1,treeName1,treeDisplay1),\
                                    (uuidname2,uniquename2,treeName2,treeDisplay2),\
                                        (retDictionary["vertexEquals"],retDictionary["isEqual"])))
                            myAssemblyCompareInfo=(uuidname2,uniquename2,treeName2,nodeCount2,treeLength2,treeDisplay2,statusArray2,equalsDict2)
                            assemblyNames[compareShapesIndex]=myAssemblyCompareInfo
                self.writeProgress(0,"Completed Comparing Childs",comparechild=myChildAssemblyOutputShapesLen,comparesub=myChildAssemblyOutputShapesLen,comparepercent=100)
            
            self.assemblycreatedcurrentcount = totalcount
            self.writeProgress(0,"Completed",assemblyNames,100,\
                totalcount if comparechildren else 0, totalcount if comparechildren else 0, 100 if comparechildren else 0)
            return  (addedAssembly,assemblyNames)
        self.writeProgress(0,totalcount,"No Child") 
        return (addedAssembly,None)

    def GetFirstLevelSelfAndTreeFromOutputShapes(self,aTree,shapes,myTree,treeLength,fuuid):
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
            if  aTree[self.gltf_dict['element']]=="P":
                if shapes:
                    item = self.findMyShapeByTreeID(shapes,treeID)
                    if item != None:
                        [shape, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, (uvPlane, solidfound, buff, uvbuff)] = item
                    else:
                        shape=None
                elif aTree[self.gltf_dict['step']]:
                    fname = aTree[self.gltf_dict['step']]
                    fname = fname[0:-5] #'.step' is removed at the end
                    guid = fuuid
                    if guid!='':
                        guid = guid+'/'
                    _,shape = self.getShapeFromPickle(guid+fname)
                else:
                    shape=None
            else:
                shape=None
            R=aTree[self.gltf_dict['R']]
            G=aTree[self.gltf_dict['G']]
            B=aTree[self.gltf_dict['B']]
                #c=Quantity_Color(R,G,B,Quantity_TOC_RGB)
            return (shape,treeDisplay,R,G,B)
        else:     
            #print("Recursing a shape",treeName,aTree)      
            subassembly=self.GetFirstLevelAssemblyOutPutShapes(treeID,myTree,shapes,treeDisplay,treeLength,fuuid)
            return subassembly

    def GetFirstLevelAssemblyOutPutShapes(self,myParent,myTree,shapes,name,treeLength,fuuid): 
        comp = TopoDS_Compound()
        comp_builder = TopoDS_Builder()
        comp_builder.MakeCompound(comp)        
        if name is None:
            name =  "Struct Assembly "+str(myParent)
        R,G,B=0.3,0.32,0.37
        lengthCheck=0
        oneItemAdded = 0
        treeForDisplay = name
        #treeDisplay=''
        for aTree in myTree:
            if aTree[self.gltf_dict['parentId']]==myParent : 
                (shape, _, R_, G_, B_) =  self.GetFirstLevelSelfAndTreeFromOutputShapes(aTree,shapes,myTree,treeLength,fuuid)
                if shape:
                    try:
                        comp_builder.Add(comp, shape)
                        #treeForDisplay = treeDisplay
                        oneItemAdded+=1
                    except Exception as e:
                        print("Exception while adding compound",e)
                    R,G,B=R_,G_,B_
            lengthCheck+=1
            if lengthCheck >=treeLength:
                break
        if oneItemAdded>0:
            return (comp, treeForDisplay, R, G, B)
        else:
            return (None, treeForDisplay, R, G, B)
    
    def getChildTreeCountAndDeepestParentID(self,myParent,myTree,treeLength,checkOnlyMore):
        assemblyCount=0
        lengthCheck = 0
        myParentId = None
        for aTree in myTree:
            if aTree[self.gltf_dict['parentId']]==myParent : 
                myParentId = aTree[self.gltf_dict['id']]
                assemblyCount +=1
                if (assemblyCount > 1) and (checkOnlyMore==True):
                    break
            lengthCheck+=1
            if lengthCheck >=treeLength:
                break
        if assemblyCount==1 and myParentId!=None:
            myAssemblyCount, subParent = self.getChildTreeCountAndDeepestParentID(myParentId,myTree,treeLength,checkOnlyMore)
            print("getChildTreeCountAndDeepestParentID1",myAssemblyCount, subParent, myParentId, myParent)
            if myAssemblyCount==0:
                print("getChildTreeCountAndDeepestParentID2",myAssemblyCount, myParent)
                return 1, myParent
            elif myAssemblyCount==1:
                print("getChildTreeCountAndDeepestParentID3",myAssemblyCount, subParent)
                return 1, subParent
            else:
                print("getChildTreeCountAndDeepestParentID4",myAssemblyCount, myParentId)
                return myAssemblyCount, myParentId
        print("getChildTreeCountAndDeepestParentID5",assemblyCount, myParent)
        return assemblyCount, myParent

    def GetFirstLevelAssemblyOutPutShapesForOrder(self,shapes,myParent,myTree,treeLength,fuuid):
        name = None
        display=None
        lengthCheck = 0
        """ if myParent:
            myParentCheck = myParent
        else:
            myParentCheck = 1 """
        myParentCheck = myParent if myParent else 1
        #print("Passed",myTree)
        for aTree in myTree:
            #print("My aTree",aTree)
            if aTree[self.gltf_dict['id']]==myParentCheck :
                name=aTree[self.gltf_dict['name']]
                display=aTree[self.gltf_dict['display']]
                if name is None:
                    name =  "Struct Assembly "+str(myParentCheck)
                if display is None:
                    display=name
                break
                
            lengthCheck+=1
            if lengthCheck >=treeLength:
                break
        addedAssembly = 0
        assemblyCount=0
        if name:
            if myParent:
                """ lengthCheck = 0
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
                        assemblyCount=1 """
                assemblyCount, myParentId = self.getChildTreeCountAndDeepestParentID(myParent,myTree,treeLength,True)
            else:
                myParentId = None
                assemblyCount=1
        if (name) and (assemblyCount>=1):
            firstLevelAssemblies = []
            lengthCheck = 0
            for aTree in myTree:
                if aTree[self.gltf_dict['parentId']]==myParentId : 
                    myTreeDisplay = aTree[self.gltf_dict['display']]
                    myTreeName =  aTree[self.gltf_dict['name']] 
                    if myTreeName=='':
                        myTreeName = 'No Name '+str(aTree[self.gltf_dict['Id']])
                    if myTreeDisplay=='':
                        myTreeDisplay = myTreeName                    
                    (shape, treeDisplay, R, G, B) = self.GetFirstLevelSelfAndTreeFromOutputShapes(aTree,shapes,myTree,treeLength,fuuid)
                    if myTreeDisplay=='':
                        myTreeDisplay=treeDisplay
                    if shape:
                        firstLevelAssemblies.append((shape, myTreeDisplay, R, G, B)) 
                        addedAssembly+=1
                lengthCheck+=1
                if lengthCheck >=treeLength:
                    break
            return  addedAssembly,firstLevelAssemblies,display
        return addedAssembly,None,display
    
    def FindAssemblyCount(self,myParent,myTree,treeLength):
        name = None
        lengthCheck = 0
        """ if myParent:
            myParentCheck = myParent
        else:
            myParentCheck = 1 """
        myParentCheck = myParent if myParent else 1
        #print("Passed",myTree)
        for aTree in myTree:
            #print("My aTree",aTree)
            if aTree[self.gltf_dict['id']]==myParentCheck :
                name=aTree[self.gltf_dict['name']]
                if name is None:
                    name =  "Struct Assembly "+str(myParentCheck)
                break
            lengthCheck+=1
            if lengthCheck >=treeLength:
                break
        assemblyCount=0
        if name:
            if myParent:
                """ lengthCheck = 0
                myParentId=myParent
                for aTree in myTree:
                    if aTree[self.gltf_dict['parentId']]==myParent : 
                        myParentId = aTree[self.gltf_dict['id']]
                        assemblyCount +=1
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
                        lengthCheck+=1
                        if lengthCheck >=treeLength:
                            break
                    if assemblyCount == 0:
                        myParentId = myParent
                        assemblyCount=1 """
                assemblyCount, _ = self.getChildTreeCountAndDeepestParentID(myParent,myTree,treeLength,False)
            else:
                #myParentId = None
                assemblyCount=1
        
        return assemblyCount,name
    
    def bringToOriginAndToUnitAxis(self, fullShape1,thisdimension1,thisdictionary1,stepname):
        aBaryCenter = thisdimension1.Center()
        cx,cy,cz=  aBaryCenter.X(),aBaryCenter.Y(),aBaryCenter.Z()
        fullZeroShape1=translate_shp(fullShape1,-cx,-cy,-cz, True)
        thisRotateddimension1 = get_oriented_bounding_details(fullZeroShape1)  
        thisRotateddictionary1 = getDictionaryFromOBB(thisRotateddimension1)
        #fullZeroShape = fullZeroShape1
        print("")
        print("After translation with center",thisRotateddictionary1,thisdictionary1,cx,cy,cz)
        sx,sy,sz=thisRotateddictionary1["sx"],thisRotateddictionary1["sy"],thisRotateddictionary1["sz"]
        if(sx>0 and sy>0 or sz>0):            
            aLoc=gp_Trsf()
            aLoc.SetTransformation(gp_Ax3(),thisRotateddimension1.Position())
            brep_trns = BRepBuilderAPI_Transform(fullZeroShape1, aLoc, True)
            fullZeroShape2 = brep_trns.Shape()
            thisdimension2 = get_oriented_bounding_details(fullZeroShape2) 
            thisRotateddictionary2 = getDictionaryFromOBB(thisdimension2,True)
        else:
            fullZeroShape2=fullZeroShape1
            thisdimension2 = thisRotateddimension1 
            thisRotateddictionary2 = thisRotateddictionary1
        print("After Rotation with built in transformation",thisRotateddictionary2,thisdictionary1,cx,cy,cz)
        sx,sy,sz=thisRotateddictionary2["sx"],thisRotateddictionary2["sy"],thisRotateddictionary2["sz"]
        if( sx >= sy ) and ( sx >= sz ) and ( sy >= sz ):
            fullZeroShape3=fullZeroShape2
            rotation=(0,0,0)
        elif( sy >= sx ) and ( sx >= sz ) and ( sy >= sz ):
            fullZeroShape3 = rotate_shp_3_axis(fullZeroShape2,0,0,90, unity="deg", copy=True)
            rotation=(0,0,90) 
        elif( sx >= sy ) and ( sx >= sz ) and ( sz >= sy ):            
            fullZeroShape3 = rotate_shp_3_axis(fullZeroShape2,90,0,0, unity="deg", copy=True) 
            rotation=(90,0,0)
        elif( sx >= sy ) and ( sz >= sx ) and ( sz >= sy ):            
            fullZeroShape3 = rotate_shp_3_axis(fullZeroShape2,90,90,0, unity="deg", copy=True) 
            rotation=(90,90,0)
        elif( sy >= sx ) and ( sz >= sx ) and ( sz >= sy ):            
            fullZeroShape3 = rotate_shp_3_axis(fullZeroShape2,0,90,0, unity="deg", copy=True) 
            rotation=(0,90,0)
        elif( sy >= sx ) and ( sz >= sx ) and ( sy >= sz ):            
            fullZeroShape3 = rotate_shp_3_axis(fullZeroShape2,0,90,90, unity="deg", copy=True) 
            rotation=(0,90,90)
        else:
            fullZeroShape3=fullZeroShape2
            rotation=(0,0,0)
        thisdimension3 = get_oriented_bounding_details(fullZeroShape3) 
        thisRotateddictionary3 = getDictionaryFromOBB(thisdimension3,True)
        print("After Bringing x > y > z dimensions",thisRotateddictionary3,thisRotateddictionary2,thisdictionary1)
        
        aColor = Quantity_Color(0.3,0.32,0.37, Quantity_TOC_RGB)
        self.init_shape(shape=fullZeroShape3,color=aColor,name="ZeroOrign"+stepname)
        self.write_file(filename=stepname)
        
        print("") 
        return (fullZeroShape3,thisRotateddictionary1,thisRotateddictionary3,(cx,cy,cz),rotation)
    
    def setComparisonDictionary(self, statusfilename,percentage,starttime, mystatusdict, createdirectory,updateprogressfile=None,comparechild=0,comparesub=0):
        currenttime = datetime.utcnow()  
        
        mystatusdict["status"] =  {
                "percent":(percentage),
                "start":starttime.strftime("%H-%M-%S"),
                "current":currenttime.strftime("%H-%M-%S") }
        mystatusdict["store"] = statusfilename
        try:   
            if(createdirectory):
                os.makedirs(os.path.dirname(statusfilename), exist_ok=True)            
            print("Writing",statusfilename,mystatusdict["status"]) 
            with open(statusfilename, 'w') as fh:
                fh.write(json.dumps(mystatusdict, sort_keys=True, indent=2 ))            
        except Exception as e:
            print("Error while wrting",statusfilename,e)
        if updateprogressfile is not None:
            try:
                updateprogressfile(comparechild=comparechild,comparesub=comparesub,comparepercent=percentage)
            except Exception as e:
                print("While Updating progress file",e,percentage) 
        return mystatusdict

    def getFaceEdgeVertexStructures(self, face_dict1,edge_dict1,vertex_dict1):
        facedata1=[]                        
        faceList1 = list(face_dict1.values())
        for faces1 in range(len(faceList1)):
            facedata1.append([])
            dumpTopologyStructures(faceList1[faces1],level=0,parentId=[None],returnStructure=facedata1[faces1],faceInfo=None, depth=1, hashEquals=True)                      
        edgedata1=[]
        edgeList1 = list(edge_dict1.values())
        for edges1 in range(len(edgeList1)):
            edgedata1.append([])
            dumpTopologyStructures(edgeList1[edges1],level=0,parentId=[None],returnStructure=edgedata1[edges1],faceInfo=None, depth=1, hashEquals=True)                  
        vertexdata1=[]
        vertexList1 = list(vertex_dict1.values())
        for vertex1 in range(len(vertexList1)):
            vertexdata1.append([])
            dumpTopologyStructures(vertexList1[vertex1],level=0,parentId=[None],returnStructure=vertexdata1[vertex1],faceInfo=None, depth=1, hashEquals=True)
        return facedata1, edgedata1, vertexdata1                       

    def ordered(self, obj):
        if isinstance(obj, dict):
            return sorted((k, self.ordered(v)) for k, v in obj.items())
        if isinstance(obj, list):
            return sorted(self.ordered(x) for x in obj)
        else:
            return obj

    def compareOneToOneShape(self, faceStruct1, edgeStruct1, vertexStruct1,faceStruct2, edgeStruct2, vertexStruct2):
        #print(faceStruct1, edgeStruct1, vertexStruct1,faceStruct2, edgeStruct2, vertexStruct2)
        return faceStruct1==faceStruct2 and edgeStruct1==edgeStruct2 and vertexStruct1==vertexStruct2

    def compareToCheckIdentityShapes(self, sourceFileName1,sourceFileName2,onlyShapes1,onlyShapes2,statusfilename,starttime=None,compareStepName=None,writeprogressfile=None,comparechild=0,comparesub=0):#,thumbwidth,thumbheight):
        dictionary={
            "source1":sourceFileName1,
            "source2":sourceFileName2,
            "node1":0,
            "node2":0,
            "isEqual":False,
            "vertexEquals":False }
        if (sourceFileName1 is not None) and sourceFileName1 and (sourceFileName2 is not None) and sourceFileName2:
            try:
                dictionary["node1"]=len(onlyShapes1)
                dictionary["node2"]=len(onlyShapes2)
                dictionary["isEqual"]=dictionary["node1"]==dictionary["node2"]
                #print("Done up to this0")
                if(dictionary["isEqual"]==False):
                    self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                    return dictionary
                fullShape1,_ = list_of_shapes_to_compound(onlyShapes1,True)
                fullShape2,_ = list_of_shapes_to_compound(onlyShapes2,True)
                thisdimension1 = get_oriented_bounding_details(fullShape1)  
                #print("Done up to this1")                      
                thisdictionary1 = getDictionaryFromOBB(thisdimension1,True)
                sx1,sy1,sz1 = thisdictionary1["sx"],thisdictionary1["sy"],thisdictionary1["sz"]
                [sx1,sy1,sz1] = sorted([sx1,sy1,sz1])
                thisdimension2 = get_oriented_bounding_details(fullShape2)                        
                thisdictionary2 = getDictionaryFromOBB(thisdimension2,True)
                sx2,sy2,sz2 = thisdictionary2["sx"],thisdictionary2["sy"],thisdictionary2["sz"]
                [sx2,sy2,sz2] = sorted([sx2,sy2,sz2])
                dictionary["obb1"]=thisdictionary1
                dictionary["obb2"]=thisdictionary2
                dictionary["isEqual"] = (abs(sx1-sx2) < 1e-6) and (abs(sy1-sy2) < 1e-6) and (abs(sz1-sz2) < 1e-6)
                if(dictionary["isEqual"]==False):
                    self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                    #print("Failure",dictionary)
                    return dictionary
                #print("Done up to this1")
                stepName1 = (compareStepName if compareStepName else statusfilename)+"1.step" 
                fullZeroShape1, fullZeroDictionary1, fullRotatedDictionary1, center1,rotation1 = self.bringToOriginAndToUnitAxis(\
                    fullShape1,thisdimension1,thisdictionary1,stepName1)
                stepName2 = (compareStepName if compareStepName else statusfilename)+"2.step"                
                fullZeroShape2, fullZeroDictionary2, fullRotatedDictionary2, center2,rotation2 = self.bringToOriginAndToUnitAxis(\
                    fullShape2,thisdimension2,thisdictionary2,stepName2)
                dictionary["origin1"]=fullZeroDictionary1
                dictionary["origin2"]=fullZeroDictionary2
                dictionary["rotated1"]=fullRotatedDictionary1
                dictionary["rotated2"]=fullRotatedDictionary2
                dictionary["center1"]=center1
                dictionary["center2"]=center2
                dictionary['rotation1']=rotation1
                dictionary['rotation2']=rotation2
                dictionary["step1"]=statusfilename+"1.step"
                dictionary["step2"]=statusfilename+"2.step"
                self.setComparisonDictionary(statusfilename,30,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                face_dict1={}
                edge_dict1={}
                vertex_dict1={}
                dumpTopologyFacesEdgesVertices(fullZeroShape1,face_dict1,edge_dict1,vertex_dict1)
                dictionary["face1"]=len(face_dict1)
                dictionary["edge1"]=len(edge_dict1)
                dictionary["vertex1"]=len(vertex_dict1)
                face_dict2={}
                edge_dict2={}
                vertex_dict2={}
                dumpTopologyFacesEdgesVertices(fullZeroShape2,face_dict2,edge_dict2,vertex_dict2)
                dictionary["face2"]=len(face_dict2)
                dictionary["edge2"]=len(edge_dict2)
                dictionary["vertex2"]=len(vertex_dict2)
                dictionary["vertexEquals"]=(dictionary["vertex1"]==dictionary["vertex2"])
                dictionary["isEqual"] = (dictionary["face1"]==dictionary["face2"]) and (dictionary["edge1"]==dictionary["edge2"]) and (dictionary["vertex1"]==dictionary["vertex2"])
                if(dictionary["vertexEquals"]==False):
                    print("Failure",dictionary)
                    self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)                  
                    return dictionary
                faceStruct1, edgeStruct1, vertexStruct1 = self.getFaceEdgeVertexStructures(face_dict1,edge_dict1,vertex_dict1) 
                faceStruct2, edgeStruct2, vertexStruct2 = self.getFaceEdgeVertexStructures(face_dict2,edge_dict2,vertex_dict2) 
                
                faceStruct1, edgeStruct1, vertexStruct1 = self.ordered(faceStruct1), self.ordered(edgeStruct1), self.ordered(vertexStruct1)
                faceStruct2, edgeStruct2, vertexStruct2 = self.ordered(faceStruct2), self.ordered(edgeStruct2), self.ordered(vertexStruct2)
                faceStruct3, edgeStruct3, vertexStruct3 = faceStruct2, edgeStruct2, vertexStruct2
                sx1,sy1,sz1 = fullRotatedDictionary1["sx"],fullRotatedDictionary1["sy"],fullRotatedDictionary1["sz"]
                self.setComparisonDictionary(statusfilename,31,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                rangeForRotation = 4
                if (abs(sx1-sy1) < 1e-6) or (abs(sx1-sz1) < 1e-6) or (abs(sz1-sy1) < 1e-6):
                    rangeForRotation = 4
                else:
                    rangeForRotation = 2  
                rangeOfRotation = 360 / rangeForRotation      
                for xdir in range(rangeForRotation):
                    for ydir in range(rangeForRotation):
                        for zdir in range(rangeForRotation):
                            if xdir==0 and ydir==0 and zdir==0: 
                                sx2,sy2,sz2 = fullRotatedDictionary2["sx"],fullRotatedDictionary2["sy"],fullRotatedDictionary2["sz"]
                                dictionary["isEqual"] = (abs(sx1-sx2) < 1e-6) and (abs(sy1-sy2) < 1e-6) and (abs(sz1-sz2) < 1e-6)
                                if dictionary["isEqual"]: 
                                    print("")  
                                    print("Eligible to compare",xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation,sx1,sy1,sz1,sx2,sy2,sz2)                                                
                                    dictionary["vertexEquals"]=(vertexStruct1==vertexStruct2)
                                    if dictionary["vertexEquals"]:  
                                        dictionary["vertexCompare2"]=(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation)
                                        print(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation,"Vertex Done")
                                        dictionary["isEqual"]=faceStruct1==faceStruct2 and edgeStruct1==edgeStruct2
                                    else:
                                        dictionary["isEqual"]=False 
                            else:
                                fullZeroRotatedShape2=rotate_shp_3_axis(fullZeroShape2,xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation, unity="deg", copy=True) 
                                thisRotateddimension2 = get_oriented_bounding_details(fullZeroRotatedShape2)                        
                                fullRotatedDictionary2 = getDictionaryFromOBB(thisRotateddimension2,True)
                                sx2,sy2,sz2 = fullRotatedDictionary2["sx"],fullRotatedDictionary2["sy"],fullRotatedDictionary2["sz"]
                                dictionary["isEqual"] = (abs(sx1-sx2) < 1e-6) and (abs(sy1-sy2) < 1e-6) and (abs(sz1-sz2) < 1e-6)
                                if dictionary["isEqual"]:
                                    print("")
                                    print("Eligible to compare",xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation,sx1,sy1,sz1,sx2,sy2,sz2)
                                    face_dict2={}
                                    edge_dict2={}
                                    vertex_dict2={}
                                    dumpTopologyFacesEdgesVertices(fullZeroRotatedShape2,face_dict2,edge_dict2,vertex_dict2) 
                                    faceStruct2, edgeStruct2, vertexStruct2 = self.getFaceEdgeVertexStructures(face_dict2,edge_dict2,vertex_dict2) 
                                    faceStruct2, edgeStruct2, vertexStruct2 = self.ordered(faceStruct2), self.ordered(edgeStruct2), self.ordered(vertexStruct2)
                                    if(vertexStruct1==vertexStruct2):
                                        dictionary["isEqual"] = faceStruct1==faceStruct2 and edgeStruct1==edgeStruct2 
                                        if dictionary["vertexEquals"]==False:
                                            dictionary["vertexEquals"]=True                                                                                       
                                            dictionary["vertexCompare2"]=(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation)
                                            print(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation,"Vertex Done")
                                    else:
                                        dictionary["isEqual"]=False 
                            if dictionary["isEqual"]:
                                dictionary["compare2"]=(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation)
                                dictionary["struct1"] = (faceStruct1, edgeStruct1, vertexStruct1) 
                                dictionary["struct2First"]= (faceStruct3, edgeStruct3, vertexStruct3)
                                dictionary["struct2Last"] = (faceStruct2, edgeStruct2, vertexStruct2) 
                                self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                                print(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation,"Done")
                                return dictionary
                            self.setComparisonDictionary(statusfilename,32+zdir+ydir*4+xdir*16,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                dictionary["struct1"] = (faceStruct1, edgeStruct1, vertexStruct1) 
                dictionary["struct2First"]= (faceStruct3, edgeStruct3, vertexStruct3)
                dictionary["struct2Last"] = (faceStruct2, edgeStruct2, vertexStruct2) 
                self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                print("Equality with Vertices",dictionary["vertexEquals"],"Equality with Faces and Edges", dictionary["isEqual"])     
                return dictionary 
            except Exception as e:               
                print("Exception happened",e,dictionary)
                dictionary["error"]=str(e)
                self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                return dictionary 
        self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
        return dictionary 
        
    def compareToCheckIdentityShapesOriginated(self,dictionary,fullZeroShape1,fullZeroShape2,statusfilename,starttime=None,writeprogressfile=None,comparechild=0,comparesub=0):
        if dictionary is None:
            dictionary={
                "node1":0,
                "node2":0,
                "isEqual":False,
                "vertexEquals":False }
        if (fullZeroShape1 is not None) and fullZeroShape1 and (fullZeroShape2 is not None) and fullZeroShape2:
            try:
                thisRotateddimension1 = get_oriented_bounding_details(fullZeroShape1)                        
                fullRotatedDictionary1 = getDictionaryFromOBB(thisRotateddimension1,True)
                thisRotateddimension2 = get_oriented_bounding_details(fullZeroShape2)                        
                fullRotatedDictionary2 = getDictionaryFromOBB(thisRotateddimension2,True)
                face_dict1={}
                edge_dict1={}
                vertex_dict1={}
                dumpTopologyFacesEdgesVertices(fullZeroShape1,face_dict1,edge_dict1,vertex_dict1)
                dictionary["face1"]=len(face_dict1)
                dictionary["edge1"]=len(edge_dict1)
                dictionary["vertex1"]=len(vertex_dict1)
                face_dict2={}
                edge_dict2={}
                vertex_dict2={}
                dumpTopologyFacesEdgesVertices(fullZeroShape2,face_dict2,edge_dict2,vertex_dict2)
                dictionary["face2"]=len(face_dict2)
                dictionary["edge2"]=len(edge_dict2)
                dictionary["vertex2"]=len(vertex_dict2)
                dictionary["vertexEquals"]=(dictionary["vertex1"]==dictionary["vertex2"])
                dictionary["isEqual"] = (dictionary["face1"]==dictionary["face2"]) and (dictionary["edge1"]==dictionary["edge2"]) and (dictionary["vertex1"]==dictionary["vertex2"])
                if(dictionary["vertexEquals"]==False):
                    print("Failure",dictionary)
                    self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)                 
                    return dictionary
                faceStruct1, edgeStruct1, vertexStruct1 = self.getFaceEdgeVertexStructures(face_dict1,edge_dict1,vertex_dict1) 
                faceStruct2, edgeStruct2, vertexStruct2 = self.getFaceEdgeVertexStructures(face_dict2,edge_dict2,vertex_dict2) 
                faceStruct1, edgeStruct1, vertexStruct1 = self.ordered(faceStruct1), self.ordered(edgeStruct1), self.ordered(vertexStruct1)
                faceStruct2, edgeStruct2, vertexStruct2 = self.ordered(faceStruct2), self.ordered(edgeStruct2), self.ordered(vertexStruct2)
                faceStruct3, edgeStruct3, vertexStruct3 = faceStruct2, edgeStruct2, vertexStruct2
                sx1,sy1,sz1 = fullRotatedDictionary1["sx"],fullRotatedDictionary1["sy"],fullRotatedDictionary1["sz"]
                self.setComparisonDictionary(statusfilename,31,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                rangeForRotation = 4
                if (abs(sx1-sy1) < 1e-6) or (abs(sx1-sz1) < 1e-6) or (abs(sz1-sy1) < 1e-6):
                    rangeForRotation = 4
                else:
                    rangeForRotation = 2  
                rangeOfRotation = 360 / rangeForRotation      
                for xdir in range(rangeForRotation):
                    for ydir in range(rangeForRotation):
                        for zdir in range(rangeForRotation):
                            if xdir==0 and ydir==0 and zdir==0: 
                                sx2,sy2,sz2 = fullRotatedDictionary2["sx"],fullRotatedDictionary2["sy"],fullRotatedDictionary2["sz"]
                                dictionary["isEqual"] = (abs(sx1-sx2) < 1e-6) and (abs(sy1-sy2) < 1e-6) and (abs(sz1-sz2) < 1e-6)
                                if dictionary["isEqual"]: 
                                    print("")  
                                    print("Eligible to compare",xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation,sx1,sy1,sz1,sx2,sy2,sz2)                                                
                                    dictionary["vertexEquals"]=(vertexStruct1==vertexStruct2)
                                    if dictionary["vertexEquals"]:  
                                        dictionary["vertexCompare2"]=(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation)
                                        print(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation,"Vertex Done")
                                        dictionary["isEqual"]=faceStruct1==faceStruct2 and edgeStruct1==edgeStruct2
                                    else:
                                        dictionary["isEqual"]=False 
                            else:
                                fullZeroRotatedShape2=rotate_shp_3_axis(fullZeroShape2,xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation, unity="deg", copy=True) 
                                thisRotateddimension2 = get_oriented_bounding_details(fullZeroRotatedShape2)                        
                                fullRotatedDictionary2 = getDictionaryFromOBB(thisRotateddimension2,True)
                                sx2,sy2,sz2 = fullRotatedDictionary2["sx"],fullRotatedDictionary2["sy"],fullRotatedDictionary2["sz"]
                                dictionary["isEqual"] = (abs(sx1-sx2) < 1e-6) and (abs(sy1-sy2) < 1e-6) and (abs(sz1-sz2) < 1e-6)
                                if dictionary["isEqual"]:
                                    print("")
                                    print("Eligible to compare",xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation,sx1,sy1,sz1,sx2,sy2,sz2)
                                    face_dict2={}
                                    edge_dict2={}
                                    vertex_dict2={}
                                    dumpTopologyFacesEdgesVertices(fullZeroRotatedShape2,face_dict2,edge_dict2,vertex_dict2) 
                                    faceStruct2, edgeStruct2, vertexStruct2 = self.getFaceEdgeVertexStructures(face_dict2,edge_dict2,vertex_dict2) 
                                    faceStruct2, edgeStruct2, vertexStruct2 = self.ordered(faceStruct2), self.ordered(edgeStruct2), self.ordered(vertexStruct2)
                                    if(vertexStruct1==vertexStruct2):
                                        dictionary["isEqual"] = faceStruct1==faceStruct2 and edgeStruct1==edgeStruct2 
                                        if dictionary["vertexEquals"]==False:
                                            dictionary["vertexEquals"]=True                                                                                       
                                            dictionary["vertexCompare2"]=(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation)
                                            print(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation,"Vertex Done")
                                    else:
                                        dictionary["isEqual"]=False 
                            if dictionary["isEqual"]:
                                dictionary["compare2"]=(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation)
                                dictionary["struct1"] = (faceStruct1, edgeStruct1, vertexStruct1) 
                                dictionary["struct2First"]= (faceStruct3, edgeStruct3, vertexStruct3)
                                dictionary["struct2Last"] = (faceStruct2, edgeStruct2, vertexStruct2) 
                                self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                                print(xdir*rangeOfRotation,ydir*rangeOfRotation,zdir*rangeOfRotation,"Done")
                                return dictionary
                            self.setComparisonDictionary(statusfilename,32+zdir+ydir*4+xdir*16,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                dictionary["struct1"] = (faceStruct1, edgeStruct1, vertexStruct1) 
                dictionary["struct2First"]= (faceStruct3, edgeStruct3, vertexStruct3)
                dictionary["struct2Last"] = (faceStruct2, edgeStruct2, vertexStruct2) 
                self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                print("Equality with Vertices",dictionary["vertexEquals"],"Equality with Faces and Edges", dictionary["isEqual"])     
                return dictionary 
            except Exception as e:               
                print("Exception happened",e,dictionary)
                dictionary["error"]=str(e)
                self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
                return dictionary 
        self.setComparisonDictionary(statusfilename,100,starttime,dictionary,False,writeprogressfile,comparechild,comparesub)
        return dictionary 

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
        kinematicrotation=None, thumbheight=300, thumbwidth=300, multipleGLTF=1200, addfeaturesThread=False, 
        suffixname='', writethread=False, writepickle=True, writefiles=True, logging=None, refname='',
        includeUV=False, traversesubshapes=False, writeStep=False, writeColorStep=False, refid='',
        defaultR=0.3, defaultG=0.32, defaultB=0.37, seperateparts=False, seperatecompounds=True,
        recursiveShapes=None, recursiveTree=None, recursiveID=1, CreateChildSteps=False,
        CreateAssemblyOrder=False, explodegap=10.0, center=True, holescale=0.77, removegap=8.0,
        recreatefororder=False, CreateStackability=False,updateprogressfile=None,comparechildren=True
        ):
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
        self.CreateAssemblyOrder = CreateAssemblyOrder
        self.CreateChildSteps = CreateChildSteps
        self.CreateStackability = CreateStackability
        self.updateprogressfile = updateprogressfile
        try:
            self.commonpipe = BRepPrimAPI_MakeBox(gp_Pnt(0,0,0),0.1,0.1,0.1).Shape()
            self.commoncompound, _ = list_of_shapes_to_compound(self.commonpipe)
        except Exception as e:
            self.commonpipe = None
            self.commoncompound = None
        #print("I m initializing")
        if filename:
            head, tail = os.path.split(self.fname)
            if(head[-1]!="/"):
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
            elif (kinematicrotation!=None) or (suffixname=="R"):
                self.basefilename = pathfilename+"R"+self.edgeGapStr
                self.writethread = False
                self.suffixname = "R"
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
        self.kinematicrotation=kinematicrotation
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
        self.assemblycount = 0
        self.treelengthbeforevertices=0
        self.partscount=0
        self.facescount=0
        self.edgescount=0
        self.verticescount=0
        self.obbdictionary={}
        self.zerodictionary={}
        self.rotateddictionary={}
        self.assemblycenter=(0,0,0)
        self.assemblyrotation=(0,0,0)
        self.matched=[]        
        self.comparetotal=0
        self.comparesub=0
        self.comparepercent=0
        self.fullZeroShape=None
        self.zerostep=''
        self.comparechildren=comparechildren
        self.assemblyname = None
        self.recursiveTree = recursiveTree
        self.refid=refid
        self.refname=refname
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
            elif recursiveTree:
                self.recursiveShapes = recursiveShapes
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
                print("\t"*self.indent,"No of colors found",len_color_arr,":",only_Colors[len_color_arr-1] if len_color_arr>0 else "NoColor","Faces",mylenFaceDict)
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
                mesherDict=self.updateParentChild(subName+" "+subEntry,shape,subName+subEntry)
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
                mesherDict=self.updateParentChild(subName+" "+subEntry,shape,subName+subEntry)
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
                mesherDict=self.updateParentChild(subName+" "+subEntry,shape,subName+subEntry)
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
                    mesherDict=self.updateParentChild(subName+" "+subEntry,shape,subName+subEntry)
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
                                entity= myentity,
                                nameroot=subName+parentName                  
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
                                    mesherDict=self.updateParentChild(subName+" "+subEntry,shape,subName+subEntry)
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
                mesherDict=self.updateParentChild(subName+" "+subEntry,shape,subName+subEntry)
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
                                        subName+parentName,
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
                                        entity=entity,
                                        nameroot=subName+parentName                       
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
                                subName+parentName,
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
                                entity=entity,
                                nameroot=subName+parentName                      
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
                                subName+parentName,
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
                                entity=entity,
                                nameroot=subName+parentName                     
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

            mesherDict=self.updateParentChild(subName+" "+subEntry, shape, subName+subEntry)
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
                mesherDict=self.updateParentChild(subName+" "+subEntry,shape,subName+subEntry)
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
                                        entity=entity,
                                        nameroot= labelForSubShapesName+subName
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
    
    def updateName(self,name,forNodes,addOne=0,display=False,displayName=None,addNumber=False):
        suffix = self.fileprefix+str(self.distancegap)+str(self.anglegap)+" "+str(self.uniqueid+addOne)         
        if name:
            nameForNode = html.escape(self.validFileName(name+" "+suffix))            
        else:
            nameForNode = html.escape(self.validFileName("No Name"+" "+suffix))    
        if display:
            forNodes[self.gltf_Dict["name"]] = nameForNode
            if ((name) or (displayName)):
                displayNameAndUniqueID = (displayName if (displayName) else name) + (str(self.uniqueid+addOne) if addNumber else '')
                forNodes[self.gltf_Dict["display"]] = html.escape(displayNameAndUniqueID)
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
            mesherDict = self.updateParentChild(name+" "+rootName+" "+rootEntry,None,rootName+rootEntry)
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

    def getIfTreeExists(self):
        filename = self.displaypath+self.basefilename+".tree"
        head, _ = os.path.split(filename) 
        DisplayURLLength = len(DISPLAY_URL)
        if head[0:DisplayURLLength]==DISPLAY_URL:
            fileuuid = head[DisplayURLLength:]
            if fileuuid[-1]=='/':
                fileuuid=fileuuid[:-1]
        else:
            fileuuid=None
        if not os.path.isfile(filename):
            filename = S3_BUCKET+filename
            if not os.path.isfile(filename):
                filename = None
        return  filename, fileuuid

    def createChilds(self,filename,fileuuid,comparechildren=True):
        data=None        
        with open(filename, "r") as f:
            data = f.read()
        if data:
            treeArray = json.loads(data)
            statusArray = self.read_status()
            treelengthbeforevertices = self.treelengthbeforevertices
            assemblycount=0
            if not treelengthbeforevertices:
                if "trees" in statusArray:
                    treelengthbeforevertices = statusArray["trees"]
                    if not treelengthbeforevertices:
                        treelengthbeforevertices = len(treeArray)
                else:
                    treelengthbeforevertices = len(treeArray)
            if "assemblies" in statusArray:
                assemblycount = statusArray["assemblies"]
            #print("Status Array",statusArray,assemblycount)   
            _ = self.read_progress()
            """ self.write_progress(maxgap=0,action='Child Items Started',written=False,\
                start=progressArray["start"] if ("start" in progressArray) else None,\
                    finish=None)  """
            (_,self.childfiles)=StepExportWithColor().WriteAssemblyOutPutShapes(\
                    None,self.basefilename,1,treeArray,\
                        treelengthbeforevertices,self.includeparts,self.distancegap,\
                            self.anglegap,self.disectparts,self.moverotate,self.thumbwidth,self.thumbheight,\
                                self.logging, self.seperateparts, self.edgesize, self.vertexsize,\
                                    self.maximumfacestoinclude,self.CreateChildSteps,\
                                        self.CreateAssemblyOrder,self.explodegap,self.center,\
                                            self.holescale,self.removegap,self.recreatefororder,\
                                                self.CreateStackability,fileuuid,self.displaypath,\
                                                    self.starttime,assemblycount,comparechildren)
            """ self.write_progress(maxgap=0,action='Child Items Written',written=True,\
                start=progressArray["start"] if ("start" in progressArray) else None,\
                    finish=None)  """
        

    
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
        mesherDict = self.updateParentChild(name+" "+rootName,None,rootName)
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
        #print("outsideloop",self.shapeslist)
        for a_shape_to_disp in self.shapeslist:
            #print("Inside loop",a_shape_to_disp)
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
                        entity={},
                        nameroot=shape_name
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

        mesherDict = self.updateParentChild(name+" "+myFeatureDisplay,None,name)
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
                        name=mytype+mycurvecode+myname,
                        parent_idx=parent_node_index,
                        curvecode=mycurvecode,
                        curvepoints=mycurvepoints,
                        entity=entities,
                        nameroot=myname
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

    def write_progress(self,maxgap=10,action='',written=False,start=None,finish=None):
        currenttime = datetime.utcnow()
        timingdelta = currenttime-self.currenttime            
        if (timingdelta.total_seconds() >= maxgap) or (maxgap==0): 
            mystatusedgesdict={
                        "begin":self.lenfeature,
                        "end":self.lenFeatures,
                        "start": start if start else (self.edgestarttime.strftime("%H-%M-%S")),
                        "current":currenttime.strftime("%H-%M-%S"),
                        "children":self.myParentId_Dict,
                        "action":action,
                        "finish":finish if finish else (currenttime.strftime("%H-%M-%S") if (maxgap==0) and (self.lenfeature>0) else '') #,
                        # "childfiles":self.childfiles,
                        # "childwritten":written
                        }
            try:
                with open(self.progressfile, 'w') as fh:                    
                    fh.write(
                        json.dumps(mystatusedgesdict,sort_keys=True,indent=2 ))
            except Exception as e:
                print("Exception while saving",self.progressfile)
            controllers.EdgeParsingDetailsController().save(mystatusedgesdict,self.refname,self.fname,self.refid,"gd")
            self.currenttime=currenttime

    def read_progress(self):
        filename = self.progressfile
        with open(filename, "r") as f:
            data = f.read()
        progressArray = None
        if data:
            progressArray = json.loads(data)
            if "begin" in progressArray:
                self.lenfeature=progressArray["begin"]
            if "end" in progressArray:
                self.lenFeatures=progressArray["end"]
            if "children" in progressArray:                
                self.myParentId_Dict= progressArray["children"]
            if "childfiles" in progressArray:
                self.childfiles = progressArray["childfiles"]           
        return progressArray

    def addFeatures(self):  
        try:
            if self.logging != None and self.addfeaturesThread:
                self.logging.info("Started addFeatures Thread") 
        except Exception as e:
            print("Error while logging",e)
        print("Going to add features",self.fname)
        head, tail = os.path.split(self.fname) 
        if(head[-1]!="/"):
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
            strMyparentID = str(myparentID)             
            self.myParentId_Dict[strMyparentID]={}
            for myFeatureName in ["f","e","v"]:
                self.write_progress()
                myTotalshapes = outputFeature[myFeatureName]                 
                self.myParentId_Dict[strMyparentID][myFeatureName]=0
                if(myTotalshapes):
                    myTotalLenShapes = len(myTotalshapes)
                    if self.multiplegltf > 0:
                        mySplitFiles =  math.ceil(myTotalLenShapes / self.multiplegltf)
                    else:
                        mySplitFiles = 1
                    start=0            
                    self.myParentId_Dict[strMyparentID][myFeatureName]=mySplitFiles                    
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
                            fname = pathfilename+"-"+strMyparentID+"-"+myFeatureName+str(iFiles)+"."
                        else:
                            fname = pathfilename+"-"+strMyparentID+"-"+myFeatureName+"."                    
                        print("Disecting", fname, iFiles+1,"/", mySplitFiles, ",", self.lenfeature,"/",self.lenFeatures)
                        addedTrees = StepIgesAnalyser(filename=head+fname,shapeslist=["Dummy"],thumbheight=0,thumbwidth=0,\
                            addfeaturesThread=False,refid=self.refid,refname=self.refname).\
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
    
    def addAnimations(self,addRotation=False):
        if self.animations == None:
            return            
        lenAnimations = len(self.animations)        
        if( lenAnimations<=0  ):
            return
        samplers = []
        chanels = []
        lenShapeOrder = len(self.shapeorder)
        node_id_starter = 0
        startRange = 0
        if lenShapeOrder>0 :
            if addRotation:
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
                node_id_starter = 0
            else:
                startRange = 1
                node_id_starter = 1
        else:
            startRange = 1
            node_id_starter = 0  
                    
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
            node_id = mystep+3-node_id_starter
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
                # dist = math.sqrt(u*u + v*v +w*w)
                # if dist==0:
                #     u, v, w = 1, 1, 1
                # else:
                #     u, v, w = u/dist, v/dist, w/dist
                u,v,w,_=self.normalizeVector(u,v,w)
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
                        my_quaternion = Quaternion(axis=[u, v, w], angle=a) #3JS coordination transformation
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
    def normalizeVector(self,p,q,r):
        sqrtlength = math.sqrt(p*p+q*q+r*r)
        if sqrtlength<1e-6:
            return 1/math.sqrt(3), 1/math.sqrt(3), 1/math.sqrt(3),0
        return p/sqrtlength,q/sqrtlength,r/sqrtlength,sqrtlength
    def axis_rotation_multiply(self, axisAndtheta, vector):
        """
        Return the rotation matrix associated with counterclockwise rotation about
        the given axis by theta radians.
        """
        k,l,m,theta=axisAndtheta
        u, v, w,angle = vector
        a = math.cos(theta / 2.0)
        s = math.sin(theta / 2.0)
        b, c, d = -k*s, -l*s, -m*s        
        aa, bb, cc, dd = a * a, b * b, c * c, d * d
        bc, ad, ac, ab, bd, cd = b * c, a * d, a * c, a * b, b * d, c * d
        p,q,r= ((aa + bb - cc - dd)*u)+ (2 * (bc + ad) * v) + (2 * (bd - ac) * w),\
            (2 * (bc - ad)*u)+( (aa + cc - bb - dd)*v)+(2 * (cd + ab) * w),\
                (2 * (bd + ac)*u)+(2 * (cd - ab)*v)+( (aa + dd - bb - cc)*w) 
        p,q,r,_=self.normalizeVector(p,q,r)
        # sqrtlength = math.sqrt(p*p+q*q+r*r)
        # if sqrtlength==0:
        #     return 1/math.sqrt(3), 1/math.sqrt(3), 1/math.sqrt(3)
        # return p/sqrtlength,q/sqrtlength,r/sqrtlength,angle
        return p,q,r,angle

    def quaternion_mult(self, q,r):
        return [r[0]*q[0]-r[1]*q[1]-r[2]*q[2]-r[3]*q[3],
                r[0]*q[1]+r[1]*q[0]-r[2]*q[3]+r[3]*q[2],
                r[0]*q[2]+r[1]*q[3]+r[2]*q[0]-r[3]*q[1],
                r[0]*q[3]-r[1]*q[2]+r[2]*q[1]+r[3]*q[0]]

    def point_rotation_by_quaternion(self, point,q,unit=True):
        r = [0,point[0],point[1],point[2]]
        q_conj = [q[0],-1*q[1],-1*q[2],-1*q[3]]
        [inu, inv, inw] = self.quaternion_mult(self.quaternion_mult(q,r),q_conj)[1:]
        if unit:
            inu, inv, inw, _=self.normalizeVector(inu, inv, inw)        
        # dist = math.sqrt(inu*inu + inv*inv +inw*inw)
        # if dist<1e-6:
        #     inu, inv, inw = 1/math.sqrt(3), 1/math.sqrt(3), 1/math.sqrt(3)
        # else:
        #     inu, inv, inw = inu/dist, inv/dist, inw/dist
        return [inu, inv, inw]

    def quaternion_rotation_by_quaternion(self,q,r):       
        q_conj = [q[0],-1*q[1],-1*q[2],-1*q[3]]
        return self.quaternion_mult(self.quaternion_mult(q,r),q_conj)
    
    def quaternion_values(self,q):
        q.normalise()
        [a1,a2,a3,a4]=q.q
        return a1,a2,a3,a4

                            # [a1,a2,a3,a4]=my_quaternion.q
    """ def getShapeLocationAndDirection(self,shapeOfAxis):
        lu,lv,lw,du,dv,dw=0,0,0,0,0,0
        if shapeOfAxis:
            data = []
            try:
                dumpTopologyStructures(shapeOfAxis,level=0,parentId=[None],returnStructure=data,faceInfo=None, depth=1)
                print("")
                print("data from dumpTopologyStructures",data)
                if len(data)>0:
                    if 'Info' in data[0]:
                        if 'direction' in data[0]['Info'] and 'location' in data[0]['Info']:
                            try:
                                du,dv,dw = data[0]['Info']['direction']
                                lu,lv,lw = data[0]['Info']['location']
                            except Exception as e:
                                print("Error while getting data",e)
            except Exception as e:
                print("Error While getting shape location and direction",e)   
        #return 0,0,0,0,0,0         
        return lu,lv,lw,du,dv,dw """

    def addKinematicRotationalAnimations_old(self):
        WritingGlobalAxisAndAngle=[]
        if self.kinematicrotation==None:
            return WritingGlobalAxisAndAngle
        lenAnimations = len(self.kinematicrotation)
        testRotation=False
        testRotationAnimation=False
        if( lenAnimations<=0  ):
            return WritingGlobalAxisAndAngle
        startRange = 1  
        lenShapeOrder = len(self.shapeorder)     
        print("Len Nodes",len(self.mstep_dict['nodes']))   
        globalTranslation=[(0,0,0)]
        globalRotation=[Quaternion(axis=[0,0,1],angle=0)]  
        globalRotationTranslation=[(0,0,0)] 
        globalCumulativeDistance=[(0,0,0)]
        #myAxisInformation=[]
        #globalAngle=[0]
        #if testRotation:
        #    lenShapeOrder=2
    
        globalAxisAndAngle=[]        
        WritingGlobalAxisAndAngle=[]
        maxAngle=-1e10
        for steps in range(1,lenShapeOrder+1): 
            mystep = steps-1
            if lenShapeOrder > 0:
                mystep = self.shapeorder[steps-1] 
            (tu,tv,tw,td),(u,v,w,a),eachName,partName,displayName,isActuator,isLinear,shapeOfAxis,_=self.kinematicrotation[mystep]
            if maxAngle < a:
                maxAngle = a
        if maxAngle <= 0.1:
            maxAngle=0.1
        
        totalSubSteps=math.ceil(maxAngle*10)
        print("No of slices for the given angle",totalSubSteps,maxAngle)
        for steps in range(1,lenShapeOrder+1): 
            #print(steps,lenAnimations,lenShapeOrder)
            mystep = steps-1
            if lenShapeOrder > 0:
                mystep = self.shapeorder[steps-1] 
            print("")
            print("what i got for kinematics",self.kinematicrotation[mystep],mystep,steps-1)
            print("")
            (tu,tv,tw,td),(u,v,w,a),eachName,partName,displayName,isActuator,isLinear,shapeOfAxis,_=self.kinematicrotation[mystep]
            #tu,tv,tw,td=1,1,1,20
            print(mystep,tu,tv,tw,td,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
            tu,tv,tw,_=self.normalizeVector(tu,tv,tw)
            u,v,w,_=self.normalizeVector(u,v,w)
            if steps > 2 and testRotationAnimation:
                a=0
            if testRotationAnimation:
                print("Testing",mystep,tu,tv,tw,td,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
            globalAxisAndAngle.append((u,v,w,a)) #xyzw / wxyz uniformity
            
            # u,v, w = old w,v,w * quaternion with which 
            lu,lv,lw,du,dv,dw,_,_,_=getShapeLocationAndDirection(shapeOfAxis)   
            ilu,ilv,ilw,idu,idv,idw  =   lu,lv,lw,du,dv,dw
            olu,olv,olw,odu,odv,odw = lu,lv,lw,du,dv,dw
            plu,plv,plw=lu,lv,lw
            print("Shape",lu,lv,lw,du,dv,dw,steps,u,v,w,a)
            shapeCopy = shapeOfAxis
            shapeOrigin = shapeOfAxis  
            #parentCopy = eachShape
            #parentOrigin = eachShape      
            if du==0 and dv==0 and dw==0:
                curVector =globalAxisAndAngle[steps-1]
                print("Initital CurVector",curVector)
                for rotationIndex in range(steps-1):
                    curVector=self.axis_rotation_multiply(globalAxisAndAngle[rotationIndex],curVector)
                    print("CurVector",curVector,globalAxisAndAngle[rotationIndex])
                nu,nv,nw,na=curVector
                olu,olv,olw=lu,lv,lw
                plu,plv,plw=lu,lv,lw
            else:
               
                for rotationIndex in range(steps-1):
                    stepDictionary = WritingGlobalAxisAndAngle[rotationIndex]
                    print("Stepdictionary",rotationIndex,stepDictionary)

                    lp,lq,lr=stepDictionary['location']
                    dp,dq,dr=stepDictionary['direction']
                    odp,odq,odr=stepDictionary['global']
                    _,_,_,ra=stepDictionary['rotation']
                    if dp==0 and dq==0 and dr==0 :  
                        dp,dq,dr,ra=globalAxisAndAngle[rotationIndex]
                    if odp==0 and odq==0 and odr==0:
                        odp,odq,odr,ra= globalAxisAndAngle[rotationIndex]  
                    shapeCopy=rotate_shape(shapeCopy,lp,lq,lr, dp,dq,dr,ra, unity="radian", copy=True)
                    shapeOrigin=rotate_shape(shapeOrigin,0,0,0, odp,odq,odr,ra, unity="radian", copy=True)
                lu,lv,lw,du,dv,dw,_,_,_=getShapeLocationAndDirection(shapeCopy)  
                plu,plv,plw,odu,odv,odw,_,_,_=getShapeLocationAndDirection(shapeOrigin) 
                nu,nv,nw,na=odu,odv,odw,a
            # my_quaternion = Quaternion(axis=[nu, nv, nw], angle=na) 
            # my_quaternion.normalise()
            # my_quaternion.normalise()
            # print("Quaternion Object",nu,nv,nw,na)                                
            #[a1,a2,a3,a4]=my_quaternion.q
            if nu==0 and nv==0 and nw==0:
                nu,nv,nw =u,v,w
            if idu==0 and idv==0 and idw==0:
                idu,idv,idw=u,v,w
            na=a
            b1, b2, b3, b4 = self.quaternion_values(globalRotation[steps-1])
            [inu, inv, inw] = self.point_rotation_by_quaternion([idu,idv,idw],[b1,b2,b3,b4]) 
            """ dist = math.sqrt(inu*inu + inv*inv +inw*inw)
            if dist<1e-6:
                inu, inv, inw = 1/math.sqrt(3), 1/math.sqrt(3), 1/math.sqrt(3)
            else:
                inu, inv, inw = inu/dist, inv/dist, inw/dist """
            for subSteps in range(1, totalSubSteps+1):
                na = a*subSteps/totalSubSteps
                local_quaternion = Quaternion(axis=[nu, nv, nw], angle=na)  #3JS coordination transformation 
                global_quaternion = globalRotation[(steps-1)*totalSubSteps]  
                result_quaternion = local_quaternion*global_quaternion
                gtu, gtv, gtw = globalCumulativeDistance[(steps-1)*totalSubSteps]
                # global_axis = result_quaternion.get_axis()
                # ga = result_quaternion.angle  
                # [gu,gv,gw]=global_axis                  
                #a1,a2,a3,a4 = self.quaternion_values(result_quaternion)#self.quaternion_mult(globalRotation[steps-1],local_quaternion)
                #print("Difference of axis",du,dv,dw,gu,gv,gw,na,ga,inu,inv,inw,"Quaternion",a1,a2,a3,a4,result_quaternion)
                shapeWithLocation=rotate_shape(shapeCopy,lu,lv,lw, du,dv,dw,na, unity="radian", copy=True)
                shapeWithOrigin= rotate_shape(shapeOrigin,0,0,0, nu,nv,nw,na, unity="radian", copy=True)
                #shapeWithLocation=rotate_shape(shapeCopy,lu,lv,lw, gu,gv,gw,ga, unity="radian", copy=True)
                #shapeWithOrigin= rotate_shape(shapeOrigin,0,0,0, gu,gv,gw,ga, unity="radian", copy=True)
                flu,flv,flw,_,_,_,_,_,_=getShapeLocationAndDirection(shapeWithLocation)
                olu,olv,olw,_,_,_,_,_,_=getShapeLocationAndDirection(shapeWithOrigin)
                # [ru,rv,rw]=self.point_rotation_by_quaternion([lu,lv,lw],[a1,a2,a3,a4],False) 
                #print("step>1",steps,a1,a2,a3,a4,u,v,w,a,nu,nv,nw,na)
                globalRotation.append(result_quaternion)  
                if steps > 1 and testRotationAnimation:
                    globalTranslation.append((0,0,0))  
                else:  
                    if steps > 1:
                        au,av,aw=globalRotationTranslation[(steps-1)*totalSubSteps]
                        au,av,aw=au+plu-lu,av+plv-lv,aw+plw-lw
                    else:
                        au,av,aw=0,0,0
                    tlu = (au+flu-olu+(gtu+(tu*td*subSteps/totalSubSteps))) 
                    tlv = (av+flv-olv+(gtv+(tv*td*subSteps/totalSubSteps))) 
                    tlw = (aw+flw-olw+(gtw+(tw*td*subSteps/totalSubSteps))) 
                    globalTranslation.append((tlu,tlv,tlw)) 
                    globalCumulativeDistance.append(\
                        ((gtu+(tu*td*subSteps/totalSubSteps)),\
                            (gtv+(tv*td*subSteps/totalSubSteps)),\
                                (gtw+(tw*td*subSteps/totalSubSteps))))
                    globalRotationTranslation.append((au+flu-olu,av+flv-olv,aw+flw-olw))   
                    # if steps==lenShapeOrder:
                    #     print("Rotation",globalRotation[len(globalRotation)-1],"Translation",globalTranslation[len(globalTranslation)-1])                      
            # print("ILU",ilu,"FLU",flu,"LU",lu,"OLU",olu,"AU",au,\
            #             "ILV",ilv,"FLV", flv,"LV",lv,"OLV",olv,"AV",av,\
            #                 "ILW",ilw,"FLW",flw,"LW",lw,"OLW",olw,"AW",aw,\
            #                     "TLU",tlu,"TLV",tlv,"TLW",tlw,"TD",td,"DR")                       
            #print("Global Rotation",len(globalRotation),globalRotation,globalTranslation)    
            myDictionaryForAxis= {
                'linear':(tu,tv,tw,td),
                'rotation':(u,v,w,a),
                'rotated':(nu,nv,nw,na),
                'location':(lu,lv,lw),
                'direction':(du,dv,dw),
                'global':(odu,odv,odw),
                'locating':(ilu,ilv,ilw),
                'directing':(idu,idv,idw),
                'rotating':(inu,inv,inw),
                'translating':(tlu,tlv,tlw),
                'assembly':eachName,
                'part':partName,
                'display':displayName,
                'isActuator':isActuator,
                'isLinear':isLinear
                }
            WritingGlobalAxisAndAngle.append(myDictionaryForAxis)    
    
        self.mstep_dict['animations']=[]
        for steps in range(1,lenShapeOrder+1):        
            samplers = []
            chanels = []
            for action in ["translation","rotation"]:
                #print(steps,lenAnimations,lenShapeOrder)
                if testRotationAnimation:
                    lenOfAnimationsTime = lenShapeOrder+1
                else:
                    lenOfAnimationsTime = lenShapeOrder+1 #steps+1 #if action=="rotation" else steps+1 #or lenAnimations ; it works for both...
                timebuff = TimeBuffer(
                    max_index=2
                ) 
                mystep = steps-1
                if lenShapeOrder > 0:
                    mystep = self.shapeorder[steps-1] 
                #print("")
                #print("what i got for kinematics",self.kinematicrotation[mystep],mystep,steps-1)
                #print("")
                (tu,tv,tw,td),(u,v,w,a),eachName,partName,displayName,isActuator,isLinear,shapeOfAxis,_=self.kinematicrotation[mystep]
                #tu,tv,tw,td=1,1,1,20
                #print(mystep,tu,tv,tw,td,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
                if action=="translation":
                    translationbuff =TranslationBuffer(
                        max_index=2
                    )
                else:
                    rotationbuff =RotationBuffer(
                        max_index=2
                    )   
                    if steps > 1 and testRotationAnimation:
                        a=0
                        
                    if testRotationAnimation:
                        print("Testing",mystep,tu,tv,tw,td,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
                    
                for istep in range(lenOfAnimationsTime*totalSubSteps):  
                    timebuff.add_time(istep*self.delay/totalSubSteps) #if action=="tranlation" else 2*istep*self.delay+1 )
                    if action=="translation":
                        """ if istep==0:
                            translationbuff.add_translation(0,0,0)
                        elif istep>=1:
                            translationbuff.add_translation(u,v,w) """
                        if istep <= (steps*totalSubSteps): 
                            up, vp, wp = globalTranslation[istep]                
                            translationbuff.add_translation(up,vp,wp)
                        else:
                            up, vp, wp = globalTranslation[steps*totalSubSteps]                
                            translationbuff.add_translation(up,vp,wp)
                    else:
                        if istep <= (steps*totalSubSteps):
                            b1, b2, b3, b4 = self.quaternion_values(globalRotation[istep])
                            #print("Quaternion Rotation",b2, b3, b4,b1)
                            rotationbuff.add_rotation(b2,b3,b4,b1)
                            #print("less than step",istep,steps,b1,b2,b3,b4)
                        else:
                            if testRotation or (steps==1 and testRotationAnimation):
                                myLastDict = WritingGlobalAxisAndAngle[steps-1]
                                nu, nv, nw, na = myLastDict['rotated']
                                my_quaternion = Quaternion(axis=[nu, nv, nw], angle=math.pi*(istep-steps)/2) 
                                my_quaternion.normalise()
                                [b1, b2, b3, b4]=my_quaternion.q
                                b2=0
                                b4=0
                            else:
                                b1, b2, b3, b4 = self.quaternion_values(globalRotation[steps*totalSubSteps])
                            #print("Quaternion Rotation",b2, b3, b4,b1)
                            rotationbuff.add_rotation(b2,b3,b4,b1)
                            #print("greater than step",istep,steps,b1,b2,b3,b4)
                            
                            # stepDictionary = WritingGlobalAxisAndAngle[steps-1]
                            # print("Stepdictionary when step > isteps",stepDictionary)
                            # lp,lq,lr=stepDictionary['location']
                            # dp,dq,dr=stepDictionary['direction']
                            # if dp==0 and dq==0 and dr==0 :  
                            #     dp,dq,dr,ra=globalAxisAndAngle[steps-1]
                            # my_quaternion = Quaternion(axis=[dp,dq,dr], angle=0)
                            # my_quaternion.normalise()
                            # [a1,a2,a3,a4]=my_quaternion.q
                            # print("step>=istep",istep,steps,a1,a2,a3,a4)                                            
                            # rotationbuff.add_rotation(a2,a3,a4,a1)                                      
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
                if action=="translation":
                    translationlen = len(translationbuff)
                else:
                    rotationlen = len(rotationbuff)
                buffer_dict = {
                    "byteLength":  translationlen if action=="translation" else rotationlen                                   
                }   
                if action=="translation":
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
                    "byteLength" : translationlen if action=="translation" else rotationlen
                }            
                self.mstep_dict['bufferViews'].append(bufferview)
                accessor_index = len(self.mstep_dict['accessors'])
                accessorview = [ {
                    "bufferView" : bufferView_index-1,
                    "byteOffset" : 0,
                    "componentType" : 5126,
                    "count" : lenOfAnimationsTime*totalSubSteps, #steps+1,
                    "type" : "SCALAR",
                    "max" : [ timebuff.time_max ],
                    "min" : [ timebuff.time_min ]
                    },
                    {
                    "bufferView" : bufferView_index,
                    "byteOffset" : 0,
                    "componentType" : 5126,
                    "count" : lenOfAnimationsTime*totalSubSteps, #steps+1,
                    "type" : "VEC3" if action=="translation" else "VEC4",
                    "max" : [ translationbuff.translation_umax, translationbuff.translation_vmax, translationbuff.translation_wmax ] if action=="translation" \
                        else [ rotationbuff.rotation_umax, rotationbuff.rotation_vmax, rotationbuff.rotation_wmax ] ,
                    "min" : [ translationbuff.translation_umin, translationbuff.translation_vmin, translationbuff.translation_wmin ] if action=="translation" \
                        else [ rotationbuff.rotation_umin, rotationbuff.rotation_vmin, rotationbuff.rotation_wmin ]
                    } ]
                self.mstep_dict['accessors'].append(accessorview[0])
                self.mstep_dict['accessors'].append(accessorview[1])
                node_id = mystep+2
                #print(node_id)
                if action=="translation":
                    if steps==1 and testRotationAnimation:
                        self.mstep_dict['nodes'][node_id]['translation']=[ 100.0, 100.0, 100.0 ]
                    else:
                        self.mstep_dict['nodes'][node_id]['translation']=[ 0.0, 0.0, 0 ]
                else:
                    #my_quaternion = Quaternion(axis=[u, v, w], angle=0)
                    #my_quaternion.normalise()
                    #print("Initial position of rotation",my_quaternion.q)
                    #[a1,a2,a3,a4] = my_quaternion.q
                    """  if testRotation:
                        myLastDict = WritingGlobalAxisAndAngle[steps-1]
                        nu, nv, nw, na = myLastDict['rotated']
                        my_quaternion = Quaternion(axis=[nu, nv, nw], angle=math.pi*(istep-steps)/2) 
                        my_quaternion.normalise()
                        [b1, b2, b3, b4]=my_quaternion.q
                    else:
                        b1, b2, b3, b4 = globalRotation[steps] """
                    b1, b2, b3, b4 = 1,0,0,0
                    self.mstep_dict['nodes'][node_id]['rotation']=[ b2,b3,b4,b1 ]
                #print(self.mstep_dict)
                sampler = { 
                    "input" : accessor_index,
                    "interpolation" : "LINEAR",
                    "output" : accessor_index+1
                }
                samplers_index = len(samplers)
                samplers.append(sampler)    
                #print("Sampler",samplers_index, steps-startRange,action,node_id)        
                chanel = {
                    "sampler" : samplers_index, #steps-startRange,
                    "target" : {
                    "node" : node_id,
                    "path" : "translation" if action=="translation" else "rotation"
                    }
                }
                chanels.append(chanel)

            animationchannels = {
                "samplers" : samplers,
                "channels" : chanels,
                "name":self.mstep_dict['nodes'][node_id]['name']+("translation" if action=="translation" else "rotation")
                }
            
            self.mstep_dict['animations'].append(animationchannels)
        print("Written global axis angle",WritingGlobalAxisAndAngle)
        return  WritingGlobalAxisAndAngle

    def addKinematicRotationalAnimations(self):
        WritingGlobalAxisAndAngle=[]

        if self.kinematicrotation==None:
            return WritingGlobalAxisAndAngle
        lenAnimations = len(self.kinematicrotation)
        testRotation=False
        testRotationAnimation=False
        if( lenAnimations<=0  ):
            return WritingGlobalAxisAndAngle
        maxAngle=-1e10
        maxLenShapeOrder = -1
        for chain in range(lenAnimations):
            lenShapeOrder = len(self.shapeorder[chain])   
            if maxLenShapeOrder < lenShapeOrder:
                maxLenShapeOrder = lenShapeOrder
            for steps in range(lenShapeOrder): 
                mystep = self.shapeorder[chain][steps] 
                (tu,tv,tw,td), (u,v,w,a), eachName, partName, displayName, partType, _, _, shapeOfAxis, _, isLinear, _ = self.kinematicrotation[chain][mystep]
                if maxAngle < a:
                    maxAngle = a
        if maxLenShapeOrder < 1:
            maxLenShapeOrder = 1
        if maxAngle <= 0.1:
            maxAngle=0.1
        self.mstep_dict['animations']=[]
        for chain in range(lenAnimations):

            lenShapeOrder = len(self.shapeorder[chain])     
            print("Len Nodes",len(self.mstep_dict['nodes']),self.shapeorder,lenShapeOrder,self.shapeorder[chain])   
            globalTranslation=[(0,0,0)]
            globalRotation=[Quaternion(axis=[0,0,1],angle=0)]  
            globalRotationTranslation=[(0,0,0)] 
            globalCumulativeDistance=[(0,0,0)]
            #myAxisInformation=[]
            #globalAngle=[0]
            #if testRotation:
            #    lenShapeOrder=2
        
            globalAxisAndAngle=[]        
            WritingGlobalAxisAndAngle.append([])
            
            
            totalSubSteps=math.ceil(maxAngle*10)
            print("No of slices for the given angle",totalSubSteps,maxAngle)
            for steps in range(1,lenShapeOrder+1): 
                #print(steps,lenAnimations,lenShapeOrder)
                mystep = steps-1
                if lenShapeOrder > 0:
                    mystep = self.shapeorder[chain][steps-1] 
                print("")
                print("what i got for kinematics",self.kinematicrotation[chain][mystep],mystep,steps-1)
                print("")
                (tu,tv,tw,td), (u,v,w,a), eachName, partName, displayName, partType, _, _, shapeOfAxis, _, isLinear, _ = self.kinematicrotation[chain][mystep]
                #tu,tv,tw,td=1,1,1,20
                print(mystep,tu,tv,tw,td,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
                tu,tv,tw,_=self.normalizeVector(tu,tv,tw)
                u,v,w,_=self.normalizeVector(u,v,w)
                if steps > 2 and testRotationAnimation:
                    a=0
                if testRotationAnimation:
                    print("Testing",mystep,tu,tv,tw,td,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
                globalAxisAndAngle.append((u,v,w,a)) #xyzw / wxyz uniformity
                
                # u,v, w = old w,v,w * quaternion with which 
                lu,lv,lw,du,dv,dw,_,_,_=getShapeLocationAndDirection(shapeOfAxis)   
                ilu,ilv,ilw,idu,idv,idw  =   lu,lv,lw,du,dv,dw
                olu,olv,olw,odu,odv,odw = lu,lv,lw,du,dv,dw
                plu,plv,plw=lu,lv,lw
                print("Shape",lu,lv,lw,du,dv,dw,steps,u,v,w,a)
                shapeCopy = shapeOfAxis
                shapeOrigin = shapeOfAxis  
                #parentCopy = eachShape
                #parentOrigin = eachShape      
                if du==0 and dv==0 and dw==0:
                    curVector =globalAxisAndAngle[steps-1]
                    print("Initital CurVector",curVector)
                    for rotationIndex in range(steps-1):
                        curVector=self.axis_rotation_multiply(globalAxisAndAngle[rotationIndex],curVector)
                        print("CurVector",curVector,globalAxisAndAngle[rotationIndex])
                    nu,nv,nw,na=curVector
                    olu,olv,olw=lu,lv,lw
                    plu,plv,plw=lu,lv,lw
                else:
                
                    for rotationIndex in range(steps-1):
                        stepDictionary = WritingGlobalAxisAndAngle[chain][rotationIndex]
                        print("Stepdictionary",rotationIndex,stepDictionary)

                        lp,lq,lr=stepDictionary['location']
                        dp,dq,dr=stepDictionary['direction']
                        odp,odq,odr=stepDictionary['global']
                        _,_,_,ra=stepDictionary['rotation']
                        if dp==0 and dq==0 and dr==0 :  
                            dp,dq,dr,ra=globalAxisAndAngle[rotationIndex]
                        if odp==0 and odq==0 and odr==0:
                            odp,odq,odr,ra= globalAxisAndAngle[rotationIndex]  
                        shapeCopy=rotate_shape(shapeCopy,lp,lq,lr, dp,dq,dr,ra, unity="radian", copy=True)
                        shapeOrigin=rotate_shape(shapeOrigin,0,0,0, odp,odq,odr,ra, unity="radian", copy=True)
                    lu,lv,lw,du,dv,dw,_,_,_=getShapeLocationAndDirection(shapeCopy)  
                    plu,plv,plw,odu,odv,odw,_,_,_=getShapeLocationAndDirection(shapeOrigin) 
                    nu,nv,nw,na=odu,odv,odw,a
                # my_quaternion = Quaternion(axis=[nu, nv, nw], angle=na) 
                # my_quaternion.normalise()
                # my_quaternion.normalise()
                # print("Quaternion Object",nu,nv,nw,na)                                
                #[a1,a2,a3,a4]=my_quaternion.q
                if nu==0 and nv==0 and nw==0:
                    nu,nv,nw =u,v,w
                if idu==0 and idv==0 and idw==0:
                    idu,idv,idw=u,v,w
                na=a
                b1, b2, b3, b4 = self.quaternion_values(globalRotation[steps-1])
                [inu, inv, inw] = self.point_rotation_by_quaternion([idu,idv,idw],[b1,b2,b3,b4]) 
                """ dist = math.sqrt(inu*inu + inv*inv +inw*inw)
                if dist<1e-6:
                    inu, inv, inw = 1/math.sqrt(3), 1/math.sqrt(3), 1/math.sqrt(3)
                else:
                    inu, inv, inw = inu/dist, inv/dist, inw/dist """
                for subSteps in range(1, totalSubSteps+1):
                    na = a*subSteps/totalSubSteps
                    local_quaternion = Quaternion(axis=[nu, nv, nw], angle=na)  #3JS coordination transformation 
                    global_quaternion = globalRotation[(steps-1)*totalSubSteps]  
                    result_quaternion = local_quaternion*global_quaternion
                    gtu, gtv, gtw = globalCumulativeDistance[(steps-1)*totalSubSteps]
                    # global_axis = result_quaternion.get_axis()
                    # ga = result_quaternion.angle  
                    # [gu,gv,gw]=global_axis                  
                    #a1,a2,a3,a4 = self.quaternion_values(result_quaternion)#self.quaternion_mult(globalRotation[steps-1],local_quaternion)
                    #print("Difference of axis",du,dv,dw,gu,gv,gw,na,ga,inu,inv,inw,"Quaternion",a1,a2,a3,a4,result_quaternion)
                    shapeWithLocation=rotate_shape(shapeCopy,lu,lv,lw, du,dv,dw,na, unity="radian", copy=True)
                    shapeWithOrigin= rotate_shape(shapeOrigin,0,0,0, nu,nv,nw,na, unity="radian", copy=True)
                    #shapeWithLocation=rotate_shape(shapeCopy,lu,lv,lw, gu,gv,gw,ga, unity="radian", copy=True)
                    #shapeWithOrigin= rotate_shape(shapeOrigin,0,0,0, gu,gv,gw,ga, unity="radian", copy=True)
                    flu,flv,flw,_,_,_,_,_,_=getShapeLocationAndDirection(shapeWithLocation)
                    olu,olv,olw,_,_,_,_,_,_=getShapeLocationAndDirection(shapeWithOrigin)
                    # [ru,rv,rw]=self.point_rotation_by_quaternion([lu,lv,lw],[a1,a2,a3,a4],False) 
                    #print("step>1",steps,a1,a2,a3,a4,u,v,w,a,nu,nv,nw,na)
                    globalRotation.append(result_quaternion)  
                    if steps > 1 and testRotationAnimation:
                        globalTranslation.append((0,0,0))  
                    else:  
                        if steps > 1:
                            au,av,aw=globalRotationTranslation[(steps-1)*totalSubSteps]
                            au,av,aw=au+plu-lu,av+plv-lv,aw+plw-lw
                        else:
                            au,av,aw=0,0,0
                        tlu = (au+flu-olu+(gtu+(tu*td*subSteps/totalSubSteps))) 
                        tlv = (av+flv-olv+(gtv+(tv*td*subSteps/totalSubSteps))) 
                        tlw = (aw+flw-olw+(gtw+(tw*td*subSteps/totalSubSteps))) 
                        globalTranslation.append((tlu,tlv,tlw)) 
                        globalCumulativeDistance.append(\
                            ((gtu+(tu*td*subSteps/totalSubSteps)),\
                                (gtv+(tv*td*subSteps/totalSubSteps)),\
                                    (gtw+(tw*td*subSteps/totalSubSteps))))
                        globalRotationTranslation.append((au+flu-olu,av+flv-olv,aw+flw-olw))   
                        # if steps==lenShapeOrder:
                        #     print("Rotation",globalRotation[len(globalRotation)-1],"Translation",globalTranslation[len(globalTranslation)-1])                      
                # print("ILU",ilu,"FLU",flu,"LU",lu,"OLU",olu,"AU",au,\
                #             "ILV",ilv,"FLV", flv,"LV",lv,"OLV",olv,"AV",av,\
                #                 "ILW",ilw,"FLW",flw,"LW",lw,"OLW",olw,"AW",aw,\
                #                     "TLU",tlu,"TLV",tlv,"TLW",tlw,"TD",td,"DR")                       
                #print("Global Rotation",len(globalRotation),globalRotation,globalTranslation)    
                myDictionaryForAxis= {
                    'linear':(tu,tv,tw,td),
                    'rotation':(u,v,w,a),
                    'rotated':(nu,nv,nw,na),
                    'location':(lu,lv,lw),
                    'direction':(du,dv,dw),
                    'global':(odu,odv,odw),
                    'locating':(ilu,ilv,ilw),
                    'directing':(idu,idv,idw),
                    'rotating':(inu,inv,inw),
                    'translating':(tlu,tlv,tlw),
                    'assembly':eachName,
                    'part':partName,
                    'display':displayName,
                    'isActuator':partType,
                    'isLinear':isLinear
                    }
                WritingGlobalAxisAndAngle[chain].append(myDictionaryForAxis)    
        
            
            for steps in range(1,lenShapeOrder+1):        
                samplers = []
                chanels = []
                for action in ["translation","rotation"]:
                    #print(steps,lenAnimations,lenShapeOrder)
                    if testRotationAnimation:
                        lenOfAnimationsTime = lenShapeOrder+1
                    else:
                        lenOfAnimationsTime = maxLenShapeOrder+1 #steps+1 #if action=="rotation" else steps+1 #or lenAnimations ; it works for both...
                    timebuff = TimeBuffer(
                        max_index=2
                    ) 
                    mystep = steps-1
                    if lenShapeOrder > 0:
                        mystep = self.shapeorder[chain][steps-1] 
                    #print("")
                    #print("what i got for kinematics",self.kinematicrotation[mystep],mystep,steps-1)
                    #print("")
                    (tu,tv,tw,td), (u,v,w,a), eachName, partName, displayName, partType, _, _, shapeOfAxis, _, isLinear, _ = self.kinematicrotation[chain][mystep]                 
                    #tu,tv,tw,td=1,1,1,20
                    #print(mystep,tu,tv,tw,td,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
                    if action=="translation":
                        translationbuff =TranslationBuffer(
                            max_index=2
                        )
                    else:
                        rotationbuff =RotationBuffer(
                            max_index=2
                        )   
                        if steps > 1 and testRotationAnimation:
                            a=0
                            
                        if testRotationAnimation:
                            print("Testing",mystep,tu,tv,tw,td,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
                        
                    for istep in range(lenOfAnimationsTime*totalSubSteps):  
                        timebuff.add_time(istep*self.delay/totalSubSteps) #if action=="tranlation" else 2*istep*self.delay+1 )
                        #print(" ")
                        #print("ACtion",action,istep*self.delay/totalSubSteps,steps,lenOfAnimationsTime*totalSubSteps)
                        if action=="translation":
                            """ if istep==0:
                                translationbuff.add_translation(0,0,0)
                            elif istep>=1:
                                translationbuff.add_translation(u,v,w) """
                            if istep <= (steps*totalSubSteps): 
                                up, vp, wp = globalTranslation[istep]                
                                translationbuff.add_translation(up,vp,wp)
                            else:
                                up, vp, wp = globalTranslation[steps*totalSubSteps]                
                                translationbuff.add_translation(up,vp,wp)
                        else:
                            if istep <= (steps*totalSubSteps):
                                b1, b2, b3, b4 = self.quaternion_values(globalRotation[istep])
                                #print("Quaternion Rotation",b2, b3, b4,b1)
                                rotationbuff.add_rotation(b2,b3,b4,b1)
                                #print("less than step",istep,steps,b1,b2,b3,b4)
                            else:
                                if testRotation or (steps==1 and testRotationAnimation):
                                    myLastDict = WritingGlobalAxisAndAngle[chain][steps-1]
                                    nu, nv, nw, na = myLastDict['rotated']
                                    my_quaternion = Quaternion(axis=[nu, nv, nw], angle=math.pi*(istep-steps)/2) 
                                    my_quaternion.normalise()
                                    [b1, b2, b3, b4]=my_quaternion.q
                                    b2=0
                                    b4=0
                                else:
                                    b1, b2, b3, b4 = self.quaternion_values(globalRotation[steps*totalSubSteps])
                                #print("Quaternion Rotation",b2, b3, b4,b1)
                                rotationbuff.add_rotation(b2,b3,b4,b1)
                                #print("greater than step",istep,steps,b1,b2,b3,b4)
                                
                                # stepDictionary = WritingGlobalAxisAndAngle[steps-1]
                                # print("Stepdictionary when step > isteps",stepDictionary)
                                # lp,lq,lr=stepDictionary['location']
                                # dp,dq,dr=stepDictionary['direction']
                                # if dp==0 and dq==0 and dr==0 :  
                                #     dp,dq,dr,ra=globalAxisAndAngle[steps-1]
                                # my_quaternion = Quaternion(axis=[dp,dq,dr], angle=0)
                                # my_quaternion.normalise()
                                # [a1,a2,a3,a4]=my_quaternion.q
                                # print("step>=istep",istep,steps,a1,a2,a3,a4)                                            
                                # rotationbuff.add_rotation(a2,a3,a4,a1)                                      
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
                    if action=="translation":
                        translationlen = len(translationbuff)
                    else:
                        rotationlen = len(rotationbuff)
                    buffer_dict = {
                        "byteLength":  translationlen if action=="translation" else rotationlen                                   
                    }   
                    if action=="translation":
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
                        "byteLength" : translationlen if action=="translation" else rotationlen
                    }            
                    self.mstep_dict['bufferViews'].append(bufferview)
                    accessor_index = len(self.mstep_dict['accessors'])
                    accessorview = [ {
                        "bufferView" : bufferView_index-1,
                        "byteOffset" : 0,
                        "componentType" : 5126,
                        "count" : lenOfAnimationsTime*totalSubSteps, #steps+1,
                        "type" : "SCALAR",
                        "max" : [ timebuff.time_max ],
                        "min" : [ timebuff.time_min ]
                        },
                        {
                        "bufferView" : bufferView_index,
                        "byteOffset" : 0,
                        "componentType" : 5126,
                        "count" : lenOfAnimationsTime*totalSubSteps, #steps+1,
                        "type" : "VEC3" if action=="translation" else "VEC4",
                        "max" : [ translationbuff.translation_umax, translationbuff.translation_vmax, translationbuff.translation_wmax ] if action=="translation" \
                            else [ rotationbuff.rotation_umax, rotationbuff.rotation_vmax, rotationbuff.rotation_wmax ] ,
                        "min" : [ translationbuff.translation_umin, translationbuff.translation_vmin, translationbuff.translation_wmin ] if action=="translation" \
                            else [ rotationbuff.rotation_umin, rotationbuff.rotation_vmin, rotationbuff.rotation_wmin ]
                        } ]
                    self.mstep_dict['accessors'].append(accessorview[0])
                    self.mstep_dict['accessors'].append(accessorview[1])
                    node_id = mystep+2
                    #print(node_id)
                    if action=="translation":
                        if steps==1 and testRotationAnimation:
                            self.mstep_dict['nodes'][node_id]['translation']=[ 100.0, 100.0, 100.0 ]
                        else:
                            self.mstep_dict['nodes'][node_id]['translation']=[ 0.0, 0.0, 0 ]
                    else:
                        #my_quaternion = Quaternion(axis=[u, v, w], angle=0)
                        #my_quaternion.normalise()
                        #print("Initial position of rotation",my_quaternion.q)
                        #[a1,a2,a3,a4] = my_quaternion.q
                        """  if testRotation:
                            myLastDict = WritingGlobalAxisAndAngle[steps-1]
                            nu, nv, nw, na = myLastDict['rotated']
                            my_quaternion = Quaternion(axis=[nu, nv, nw], angle=math.pi*(istep-steps)/2) 
                            my_quaternion.normalise()
                            [b1, b2, b3, b4]=my_quaternion.q
                        else:
                            b1, b2, b3, b4 = globalRotation[steps] """
                        b1, b2, b3, b4 = 1,0,0,0
                        self.mstep_dict['nodes'][node_id]['rotation']=[ b2,b3,b4,b1 ]
                    #print(self.mstep_dict)
                    sampler = { 
                        "input" : accessor_index,
                        "interpolation" : "LINEAR",
                        "output" : accessor_index+1
                    }
                    samplers_index = len(samplers)
                    samplers.append(sampler)    
                    #print("Sampler",samplers_index, steps-startRange,action,node_id)        
                    chanel = {
                        "sampler" : samplers_index, #steps-startRange,
                        "target" : {
                        "node" : node_id,
                        "path" : "translation" if action=="translation" else "rotation"
                        }
                    }
                    chanels.append(chanel)

                animationchannels = {
                    "samplers" : samplers,
                    "channels" : chanels,
                    "name":str(chain)+self.mstep_dict['nodes'][node_id]['name']+("translation" if action=="translation" else "rotation")
                    }
                
                self.mstep_dict['animations'].append(animationchannels)
            print(self.mstep_dict['animations'])
            print("Written global axis angle",WritingGlobalAxisAndAngle)
        return  WritingGlobalAxisAndAngle

    def addKinematicRotationalAnimations_old_old(self):
        WritingGlobalAxisAndAngle=[]
        if self.kinematicrotation==None:
            return WritingGlobalAxisAndAngle
        lenAnimations = len(self.kinematicrotation)
        testRotation=False
        testRotationAnimation=True
        if( lenAnimations<=0  ):
            return WritingGlobalAxisAndAngle
        startRange = 1  
        lenShapeOrder = len(self.shapeorder)     
        print("Len Nodes",len(self.mstep_dict['nodes']))   
        globalTranslation=[(0,0,0)]
        globalRotation=[(1,0,0,0)]   
        #myAxisInformation=[]
        #globalAngle=[0]
        #if testRotation:
        #    lenShapeOrder=2
    
        globalAxisAndAngle=[]
        WritingGlobalAxisAndAngle=[]
        self.mstep_dict['animations']=[]
        for steps in range(1,lenShapeOrder+1):        
            samplers = []
            chanels = []
            for action in ["translation","rotation"]:
                print(steps,lenAnimations,lenShapeOrder)
                lenOfAnimationsTime = lenShapeOrder+1 #if action=="rotation" else steps+1 #or lenAnimations ; it works for both...
                timebuff = TimeBuffer(
                    max_index=2
                ) 
                mystep = steps-1
                if lenShapeOrder > 0:
                    mystep = self.shapeorder[steps-1] 
                print("")
                print("what i got for kinematics",self.kinematicrotation[mystep],mystep,steps-1)
                print("")
                (tu,tv,tw,td),(u,v,w,a),eachName,partName,displayName,isActuator,isLinear,shapeOfAxis=self.kinematicrotation[mystep]
                #tu,tv,tw,td=1,1,1,20
                print(mystep,tu,tv,tw,td,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
                if action=="translation":
                    translationbuff =TranslationBuffer(
                        max_index=2
                    )
                    dist = math.sqrt(tu*tu + tv*tv +tw*tw)
                    if dist==0:
                        tu, tv, tw = 1/math.sqrt(3), 1/math.sqrt(3), 1/math.sqrt(3)
                    else:
                        tu, tv, tw = tu/dist, tv/dist, tw/dist
                    u, v, w = tu*td, tv*td, tw*td
                else:
                    dist = math.sqrt(u*u + v*v +w*w)
                    if dist<1e-6:
                        u, v, w = 1/math.sqrt(3), 1/math.sqrt(3), 1/math.sqrt(3)
                    else:
                        u, v, w = u/dist, v/dist, w/dist
                    
                    rotationbuff =RotationBuffer(
                        max_index=2
                    )   
                    if steps > 1 and testRotationAnimation:
                        a=0
                    if testRotationAnimation:
                        print("Testing",mystep,tu,tv,tw,td,u,v,w,a,lenAnimations,lenShapeOrder,steps-1)
                    globalAxisAndAngle.append((u,v,w,a)) #xyzw / wxyz uniformity
                for istep in range(lenOfAnimationsTime):  
                    timebuff.add_time(istep*self.delay) #if action=="tranlation" else 2*istep*self.delay+1 )
                    if action=="translation":
                        """ if istep==0:
                            translationbuff.add_translation(0,0,0)
                        elif istep>=1:
                            translationbuff.add_translation(u,v,w) """
                        if istep < steps: 
                            up, vp, wp = globalTranslation[istep]                
                            translationbuff.add_translation(up,vp,wp)
                        elif istep == steps:
                            translationbuff.add_translation(u,v,w)
                            globalTranslation.append((u,v,w))
                        else:
                            up, vp, wp = globalTranslation[steps]                
                            translationbuff.add_translation(up,vp,wp)
                    else:
                        if istep < steps:
                            b1, b2, b3, b4 = globalRotation[istep]
                            #print("Quaternion Rotation",b2, b3, b4,b1)
                            rotationbuff.add_rotation(b2,b3,b4,b1)
                            print("less than step",istep,steps,b1,b2,b3,b4)
                        elif istep==steps:
                            # u,v, w = old w,v,w * quaternion with which 
                            lu,lv,lw,du,dv,dw=getShapeLocationAndDirection(shapeOfAxis)   
                            ilu,ilv,ilw,idu,idv,idw  =   lu,lv,lw,du,dv,dw

                            if steps>1:
                                print("Shape",lu,lv,lw,du,dv,dw,steps,u,v,w,a)
                                """ b1, b2, b3, b4 = globalRotation[steps-1]
                                na=a
                                [nu, nv, nw] = self.point_rotation_by_quaternion([u,v,w],[b1,b2,b3,b4]) 
                                dist = math.sqrt(nu*nu + nv*nv +nw*nw)
                                if dist==0:
                                    nu, nv, nw = 1, 1, 1
                                else:
                                    nu, nv, nw = nu/dist, nv/dist, nw/dist """
                                
                                if du==0 and dv==0 and dw==0:
                                    curVector =globalAxisAndAngle[steps-1]
                                    print("Initital CurVector",curVector)
                                    for rotationIndex in range(steps-1):
                                        curVector=self.axis_rotation_multiply(globalAxisAndAngle[rotationIndex],curVector)
                                        print("CurVector",curVector,globalAxisAndAngle[rotationIndex])
                                    nu,nv,nw,na=curVector
                                else:
                                    for rotationIndex in range(steps-1):
                                        stepDictionary = WritingGlobalAxisAndAngle[rotationIndex]
                                        print("Stepdictionary",rotationIndex,stepDictionary)

                                        lp,lq,lr=stepDictionary['location']
                                        dp,dq,dr=stepDictionary['direction']
                                        _,_,_,ra=stepDictionary['rotation']
                                        if dp==0 and dq==0 and dr==0 :  
                                            dp,dq,dr,ra=globalAxisAndAngle[rotationIndex]
                                        shapeOfAxis=rotate_shape(shapeOfAxis,lp,lq,lr, dp,dq,dr,ra, unity="radian", copy=True)
                                    lu,lv,lw,du,dv,dw=getShapeLocationAndDirection(shapeOfAxis)    
                                    nu,nv,nw,na=du,dv,dw,a
                                # my_quaternion = Quaternion(axis=[nu, nv, nw], angle=na) 
                                # my_quaternion.normalise()
                                # my_quaternion.normalise()
                                # print("Quaternion Object",nu,nv,nw,na)                                
                                #[a1,a2,a3,a4]=my_quaternion.q
                                if nu==0 and nv==0 and nw==0:
                                    nu,nv,nw =u,v,w
                                if idu==0 and idv==0 and idw==0:
                                    idu,idv,idw=u,v,w
                                na=a
                                b1, b2, b3, b4 = globalRotation[steps-1]
                                [inu, inv, inw] = self.point_rotation_by_quaternion([idu,idv,idw],[b1,b2,b3,b4]) 
                                dist = math.sqrt(inu*inu + inv*inv +inw*inw)
                                if dist<1e-6:
                                    inu, inv, inw = 1/math.sqrt(3), 1/math.sqrt(3), 1/math.sqrt(3)
                                else:
                                    inu, inv, inw = inu/dist, inv/dist, inw/dist
                                local_quaternion = Quaternion(axis=[nu, nv, nw], angle=a)      #3JS coordination transformation                         
                                a1,a2,a3,a4 = self.quaternion_mult(globalRotation[steps-1],local_quaternion)
                               
                                print("step>1",istep,steps,a1,a2,a3,a4,u,v,w,a,nu,nv,nw,na)
                            else:
                                if du==0 and dv==0 and dw==0:
                                    nu,nv,nw,na=u,v,w,a
                                else:
                                    nu,nv,nw,na=du,dv,dw,a
                                # #print("Quaternion Object",nu,nv,nw,na)
                                # my_quaternion = Quaternion(axis=[nu, nv, nw], angle=na)
                                # my_quaternion.normalise()
                                # [a1,a2,a3,a4]=my_quaternion.q
                                if idu==0 and idv==0 and idw==0:
                                    idu,idv,idw=u,v,w
                                inu,inv,inw=idu,idv,idw
                                local_quaternion = Quaternion(axis=[nu, nv, nw], angle=a)    #3JS coordination transformation                           
                                a1,a2,a3,a4 = self.quaternion_mult(globalRotation[steps-1],local_quaternion)
                                print("step==1",istep,steps,a1,a2,a3,a4,u,v,w,a,nu,nv,nw,na)
                            #print("My Quaternion",a1,a2,a3,a4)                        
                            rotationbuff.add_rotation(a2,a3,a4,a1)
                            globalRotation.append((a1,a2,a3,a4))                            
                            #globalAngle.append(a)                        
                            print("Global Rotation",len(globalRotation),globalRotation)    
                            myDictionaryForAxis= {
                                'linear':(tu,tv,tw,td),
                                'rotation':(u,v,w,a),
                                'rotated':(nu,nv,nw,na),
                                'location':(lu,lv,lw),
                                'direction':(du,dv,dw),
                                'locating':(ilu,ilv,ilw),
                                'directing':(idu,idv,idw),
                                'rotating':(inu,inv,inw),
                                'assembly':eachName,
                                'part':partName,
                                'display':displayName,
                                'isActuator':isActuator,
                                'isLinear':isLinear
                                }
                            WritingGlobalAxisAndAngle.append(myDictionaryForAxis)    
                        else:
                            if testRotation or (steps==1 and testRotationAnimation):
                                myLastDict = WritingGlobalAxisAndAngle[steps-1]
                                nu, nv, nw, na = myLastDict['rotated']
                                my_quaternion = Quaternion(axis=[nu, nv, nw], angle=math.pi*(istep-steps)/2) 
                                my_quaternion.normalise()
                                [b1, b2, b3, b4]=my_quaternion.q
                                b2=0
                                b4=0
                            else:
                                b1, b2, b3, b4 = globalRotation[steps]
                            #print("Quaternion Rotation",b2, b3, b4,b1)
                            rotationbuff.add_rotation(b2,b3,b4,b1)
                            print("greater than step",istep,steps,b1,b2,b3,b4)
                            
                            # stepDictionary = WritingGlobalAxisAndAngle[steps-1]
                            # print("Stepdictionary when step > isteps",stepDictionary)
                            # lp,lq,lr=stepDictionary['location']
                            # dp,dq,dr=stepDictionary['direction']
                            # if dp==0 and dq==0 and dr==0 :  
                            #     dp,dq,dr,ra=globalAxisAndAngle[steps-1]
                            # my_quaternion = Quaternion(axis=[dp,dq,dr], angle=0)
                            # my_quaternion.normalise()
                            # [a1,a2,a3,a4]=my_quaternion.q
                            # print("step>=istep",istep,steps,a1,a2,a3,a4)                                            
                            # rotationbuff.add_rotation(a2,a3,a4,a1)                                      
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
                if action=="translation":
                    translationlen = len(translationbuff)
                else:
                    rotationlen = len(rotationbuff)
                buffer_dict = {
                    "byteLength":  translationlen if action=="translation" else rotationlen                                   
                }   
                if action=="translation":
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
                    "byteLength" : translationlen if action=="translation" else rotationlen
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
                    "type" : "VEC3" if action=="translation" else "VEC4",
                    "max" : [ translationbuff.translation_umax, translationbuff.translation_vmax, translationbuff.translation_wmax ] if action=="translation" \
                        else [ rotationbuff.rotation_umax, rotationbuff.rotation_vmax, rotationbuff.rotation_wmax ] ,
                    "min" : [ translationbuff.translation_umin, translationbuff.translation_vmin, translationbuff.translation_wmin ] if action=="translation" \
                        else [ rotationbuff.rotation_umin, rotationbuff.rotation_vmin, rotationbuff.rotation_wmin ]
                    } ]
                self.mstep_dict['accessors'].append(accessorview[0])
                self.mstep_dict['accessors'].append(accessorview[1])
                node_id = mystep+2
                print(node_id)
                if action=="translation":
                    if steps==1 and testRotationAnimation:
                        self.mstep_dict['nodes'][node_id]['translation']=[ 100.0, 100.0, 100.0 ]
                    else:
                        self.mstep_dict['nodes'][node_id]['translation']=[ 0.0, 0.0, 0.0 ]
                else:
                    #my_quaternion = Quaternion(axis=[u, v, w], angle=0)
                    #my_quaternion.normalise()
                    #print("Initial position of rotation",my_quaternion.q)
                    #[a1,a2,a3,a4] = my_quaternion.q
                    """  if testRotation:
                        myLastDict = WritingGlobalAxisAndAngle[steps-1]
                        nu, nv, nw, na = myLastDict['rotated']
                        my_quaternion = Quaternion(axis=[nu, nv, nw], angle=math.pi*(istep-steps)/2) 
                        my_quaternion.normalise()
                        [b1, b2, b3, b4]=my_quaternion.q
                    else:
                        b1, b2, b3, b4 = globalRotation[steps] """
                    b1, b2, b3, b4 = 1,0,0,0
                    self.mstep_dict['nodes'][node_id]['rotation']=[ b2,b3,b4,b1 ]
                #print(self.mstep_dict)
                sampler = { 
                    "input" : accessor_index,
                    "interpolation" : "LINEAR",
                    "output" : accessor_index+1
                }
                samplers_index = len(samplers)
                samplers.append(sampler)    
                print("Sampler",samplers_index, steps-startRange,action,node_id)        
                chanel = {
                    "sampler" : samplers_index, #steps-startRange,
                    "target" : {
                    "node" : node_id,
                    "path" : "translation" if action=="translation" else "rotation"
                    }
                }
                chanels.append(chanel)

            animationchannels = {
                "samplers" : samplers,
                "channels" : chanels
                }
            
            self.mstep_dict['animations'].append(animationchannels)
        print("Written global axis angle",WritingGlobalAxisAndAngle)
        return  WritingGlobalAxisAndAngle



    def write_status(self,maxgap=10,action='',comparechild=0,comparesub=0,comparepercent=0):
        currenttime = datetime.utcnow()  
        mystatusdict =  {
                "percent":(self.percentage if self.ascompound==False else self.percentage/4.0),
                "start":self.starttime.strftime("%H-%M-%S"),
                "current":currenttime.strftime("%H-%M-%S"),
                "action":action }
        try:
            if self.recursiveTree:
                return mystatusdict
            if self.updateprogressfile is not None:
                try:
                    self.updateprogressfile(action=action,childpercent=self.percentage)
                except Exception as e:
                    print("While Updating progress file",e,self.percentage) 
            if(maxgap==0 and self.percentage>0):
                mystatusdict["finish"]=currenttime.strftime("%H-%M-%S")
                mystatusdict["reset"]=currenttime.strftime("%H-%M-%S")
            elif(maxgap==0):
                mystatusdict["reset"]=currenttime.strftime("%H-%M-%S")
            if self.assemblycount>0:
                mystatusdict["assemblies"]=self.assemblycount
                mystatusdict["assembly"]=self.assemblyname
                mystatusdict["trees"]=self.treelengthbeforevertices
                mystatusdict["parts"]=self.partscount
                mystatusdict["faces"]=self.facescount
                mystatusdict["edges"]=self.edgescount
                mystatusdict["vertices"]=self.verticescount
                mystatusdict["obbPosition"]=self.obbdictionary
                mystatusdict["obbOrigin"]=self.zerodictionary
                mystatusdict["obbRotated"]=self.rotateddictionary
                mystatusdict["center"]=self.assemblycenter
                mystatusdict["rotation"]=self.assemblyrotation
                mystatusdict["zerostep"]=self.zerostep
                mystatusdict["matched"]=self.matched
                mystatusdict["comparetotal"]=self.comparetotal if comparechild==0 else comparechild
                mystatusdict["comparesub"]=self.comparesub if comparesub==0 else comparesub
                mystatusdict["comparepercent"]=self.comparepercent if comparepercent==0 else comparepercent
            try:            
                timingdelta = datetime.utcnow()-self.currenttime            
                if (timingdelta.total_seconds() >= maxgap) or (maxgap==0): 
                    if(self.byThread)or(self.ascompound)or(maxgap==0):
                        if (self.writefiles) or (self.ascompound)or(maxgap==0):
                            #os.makedirs(os.path.dirname(statusfilename), exist_ok=True)
                            statusfilename = self.displaypath+self.basefilename+".status"
                            print("Writing",statusfilename,"Percentage",self.percentage)
                            try:
                                with open(statusfilename, 'w') as fh:
                                    fh.write(json.dumps(mystatusdict, sort_keys=True, indent=2 ))
                                    self.currenttime = datetime.utcnow()
                            except Exception as e:
                                print("While Writing",statusfilename,e,self.percentage) 
                            controllers.ParsingDetailsController().save(mystatusdict,self.refname,self.fname,self.refid,self.suffixname)                       
                            """ if ((maxgap==0) and (self.suffixname != "M") and (self.suffixname != "S") and (self.suffixname != "K") and (self.suffixname != "A")) :
                                paramfilename = self.displaypath+self.basefilename[:-1]+".status"
                                #mystatusdict["createoption"]=self.basefilename[-1]
                                mystatusdict["createchilds"]=self.CreateChildSteps
                                mystatusdict["createorder"]=self.CreateAssemblyOrder
                                mystatusdict["createstack"]=self.CreateStackability
                                try:
                                    with open(paramfilename, 'w') as fh:
                                        fh.write(json.dumps(mystatusdict, sort_keys=True, indent=2 ))
                                except Exception as e:
                                    print("While Writing",paramfilename,e,self.percentage) """

                        else:
                            print("Not Writing status",self.percentage)
                    else:
                        print("Percentage",self.percentage)
            except Exception as e:
                print("While Writing",e)   
        except Exception as e:
            print("While Writing",e)  
        return mystatusdict

    def read_status(self):
        statusArray = None
        try:
            filename = self.displaypath+self.basefilename+".status"
            with open(filename, "r") as f:
                data = f.read()
            if data:
                statusArray = json.loads(data)
                if "percent" in statusArray:
                    self.percentage = statusArray["percent"]
                if "assemblies" in statusArray:
                    self.assemblycount = statusArray["assemblies"]
                if "assembly" in statusArray:
                    self.assemblyname = statusArray["assembly"]
                if "trees" in statusArray:
                    self.treelengthbeforevertices = statusArray["trees"]
                if "parts" in statusArray:    
                    self.partscount=statusArray["parts"]
                if "faces" in statusArray:
                    self.facescount=statusArray["faces"]
                if "edges" in statusArray:
                    self.edgescount=statusArray["edges"]
                if "vertices" in statusArray:
                    self.verticescount=statusArray["vertices"]
                if "obbPosition" in statusArray:
                    self.obbdictionary=statusArray["obbPosition"]
                if "obbOrigin" in statusArray:
                    self.zerodictionary=statusArray["obbOrigin"]
                if "obbRotated" in statusArray:
                    self.rotateddictionary=statusArray["obbRotated"]
                if "center" in statusArray:
                    self.assemblycenter=statusArray["center"]
                if "rotation" in statusArray:
                    self.assemblyrotation=statusArray["rotation"]
                if "zerostep" in statusArray:
                    self.zerostep=statusArray["zerostep"]                
                if "matched" in statusArray:
                    self.matched=statusArray["matched"]
                if "comparetotal" in statusArray:
                    self.comparetotal=statusArray["comparetotal"]
                if "comparesub" in statusArray:
                    self.comparesub=statusArray["comparesub"]
                if "comparepercent" in statusArray:
                    self.comparepercent=statusArray["comparepercent"]
        except Exception as e:
            print("While Reading",e)  
        return statusArray

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
            if (self.writefiles) and (not (self.ascompound)):
                print("Writing",newfilename)
                with open(newfilename, 'w') as fh:
                    fh.write(json.dumps(dict["gltf"], sort_keys=True, indent=2 ))
            else:
                print("Not Writing",newfilename)
        except Exception as e:
            print("While Writing",newfilename,e)
        try:
            treefilename = COPY_PATH+self.displaypath+dict["store"]+".tree"
            if (self.writefiles) and (not (self.ascompound)):
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

    def checkIfList(self,item):
        return (item is not None) and (isinstance(item, list))

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
        
        filetreepath=None
        filetreeuuid=None
        if self.recursiveTree:
            filetreepath, filetreeuuid = self.getIfTreeExists()
        if filetreepath and filetreeuuid:
            self.createChilds(filetreepath,filetreeuuid,self.comparechildren)
            if byThread:
                return
            else:
                return None
        else:
            self.percentage = 0
            self.currenttime=self.starttime
            self.write_status(0)                  
        if self.shapeslist:
            self.addShapes()
        else:
            self.getShapes()
        WritingGlobalAxisAndAngle=[]
        if self.delay != 0:
            self.addAnimations()
            self.addKinematicAnimations()
            WritingGlobalAxisAndAngle=self.addKinematicRotationalAnimations()
        
        print("What i got for global axis",WritingGlobalAxisAndAngle)
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
        myTreeLenBeforeAddingEdgesAndVertices = len(self.tstep_dict["tree"])
        (self.assemblycount,self.assemblyname)=StepExportWithColor().FindAssemblyCount(\
                    1,self.tstep_dict["tree"],myTreeLenBeforeAddingEdgesAndVertices)  
        self.treelengthbeforevertices = myTreeLenBeforeAddingEdgesAndVertices 
        outputShapesOrder = self.outputShapes
        dictionaryOrderTree=self.tstep_dict["tree"]
        lenDictionaryOrderTree = myTreeLenBeforeAddingEdgesAndVertices
        #Find the counts of features..
        if ( (self.suffixname != "M") and (self.suffixname != "S") and \
            (self.suffixname != "K") and (self.suffixname != "R") and (self.suffixname != "A") ):
            shapeArrayOrder,shapeOrder,shapePicklesOrder,aNameOrder,aColorAssemblyOrder = StepExportWithColor().\
                getShapesFromOutPutShapes(outputShapesOrder,1,dictionaryOrderTree,lenDictionaryOrderTree,'')
            self.partscount=len(shapeOrder)
            
            fullAssemblyShape,_ = list_of_shapes_to_compound(shapeOrder,True)
            assembly_faces_dict = {}
            assembly_edges_dict = {}
            assembly_vertices_dict = {}
            dumpTopologyFacesEdgesVertices(fullAssemblyShape,assembly_faces_dict,assembly_edges_dict,assembly_vertices_dict)
            self.facescount=len(assembly_faces_dict)
            self.edgescount=len(assembly_edges_dict)
            self.verticescount=len(assembly_vertices_dict)        
            thisAssemblydimension = get_oriented_bounding_details(fullAssemblyShape)                        
            thisAssemblydictionary = getDictionaryFromOBB(thisAssemblydimension,True)
            self.obbdictionary=thisAssemblydictionary
            self.zerostep = self.fname+"ZeroOrigin.step"
            fullZeroShape, fullZeroDictionary, fullRotatedDictionary, center, rotation = StepExportWithColor().\
                bringToOriginAndToUnitAxis(fullAssemblyShape,thisAssemblydimension,thisAssemblydictionary,self.zerostep)
            self.zerodictionary=fullZeroDictionary
            self.rotateddictionary=fullRotatedDictionary
            self.assemblycenter=center
            self.assemblyrotation=rotation
            self.fullZeroShape=fullZeroShape
    
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
                        "current":datetime.utcnow().strftime("%H-%M-%S"),
                        "assemblies":self.assemblycount,
                        "assembly":self.assemblyname,
                        "trees":self.treelengthbeforevertices,
                        "parts":self.partscount,
                        "faces":self.facescount,
                        "edges":self.edgescount,
                        "vertices":self.verticescount,
                        "obbPosition":self.obbdictionary,
                        "obbOrigin":self.zerodictionary,
                        "obbRotated":self.rotateddictionary,
                        "center":self.assemblycenter,
                        "rotation":self.assemblyrotation,
                        "zerostep":self.zerostep,
                        "matched":self.matched,
                        "comparetotal":self.comparetotal,
                        "comparesub":self.comparesub,
                        "comparepercent":self.comparepercent},
             "display":COPY_PATH+self.displaypath
        }
        if self.writethread:
            mythread = threading.Thread(target=self.write_in_thread, daemon=True, args=(dict_return,getPNG,True))
            mythread.start()
        else:
            self.write_in_thread(dict_return,getPNG,True)
        print("Going to write final percentage",self.fname)
        if(len(WritingGlobalAxisAndAngle)>0):
            try:
                axisfile = COPY_PATH+self.displaypath+dict_return["store"]+".axis"
                print("Writing,",axisfile)
                with open(axisfile, 'w') as fh:
                    fh.write(json.dumps({'AllAxis':WritingGlobalAxisAndAngle}, sort_keys=True, indent=2 ))
            except Exception as e:
                print("Error while writing axisfile",e,"Writingglobal",WritingGlobalAxisAndAngle)
        self.percentage = 100
        self.write_status(0)
        #self.write_status(0) #sometimes write_status fails because when in another thread there is a read command..
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
        if ( (self.suffixname != "M") and (self.suffixname != "S") and \
            (self.suffixname != "K") and (self.suffixname != "R") and (self.suffixname != "A") ):
            #orderDimension = (self.scene_min[0],self.scene_min[1],self.scene_min[2],\
            #    self.scene_max[0],self.scene_max[1],self.scene_max[2])
            if self.comparechildren:           
                statusfileToCompare = self.displaypath+self.basefilename   
                self.write_status(0,"Started Identical Analysis")  
                storageSerializers=controllers.ParsingDetailsController().identicalRecords(self.rotateddictionary["sx"],self.rotateddictionary["sy"],self.rotateddictionary["sz"],self.verticescount)
                if((storageSerializers is not None) and len(storageSerializers)>0):
                    myTotal = len(storageSerializers)
                    myCurrent = 0
                    self.matched=[]
                    for storageSerializer in storageSerializers:
                        filenameRecorded = storageSerializer.filename   
                        print("What I Got as storageSerializer",storageSerializer)                    
                        if (filenameRecorded != self.fname):
                            compareDictionary=StepExportWithColor().compareToCheckIdentity(\
                                self.fullZeroShape,dict_return["status"],self.fname,filenameRecorded,self.distancegap,self.anglegap,\
                                    statusfileToCompare,self.starttime,self.write_status,myTotal,myCurrent)
                            myCurrent+=1
                            if compareDictionary["vertexEquals"] or compareDictionary["isEqual"]:
                                self.matched.append(\
                                    (storageSerializer.name,storageSerializer.external_ref,storageSerializer.filename,storageSerializer.tab_suffix))
                                self.write_status(0,"Compared "+str(myCurrent),myTotal,myCurrent)
                        else:
                            myCurrent+=1
                else:
                    myTotal=0
                self.write_status(0,"Compared "+str(myTotal),myTotal,myTotal,100)
            if self.CreateChildSteps:
                print("Starting Child Steps",self.fname)
                """ self.write_progress(maxgap=0,action='Child Items Started')  """
                (_,self.childfiles)=StepExportWithColor().WriteAssemblyOutPutShapes(\
                    self.outputShapes,self.basefilename,1,self.tstep_dict["tree"],\
                        myTreeLenBeforeAddingEdgesAndVertices,self.includeparts,self.distancegap,\
                            self.anglegap,self.disectparts,self.moverotate,self.thumbwidth,self.thumbheight,\
                                self.logging, self.seperateparts, self.edgesize, self.vertexsize,\
                                    self.maximumfacestoinclude,self.CreateChildSteps,\
                                        self.CreateAssemblyOrder,self.explodegap,self.center,\
                                            self.holescale,self.removegap,self.recreatefororder,\
                                                self.CreateStackability,'',self.displaypath,\
                                                    self.starttime,self.assemblycount,self.comparechildren,\
                                                        self.refid,self.refname)           
                """ self.write_progress(maxgap=0,action='Child Items Written',written=True) """
                print("Completing Child Steps",self.fname)
            
                       
            if self.CreateAssemblyOrder:
                print("Starting Assembly order",self.fname)
                if self.recreatefororder:
                    (_, (orderDimension, outputShapesOrder), dictionaryOrder) = StepIgesAnalyser(
                            filename=self.fname,includeparts=False,distancegap=self.distancegap, logging=logging, 
                            anglegap=self.anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False,
                            edgesize=0, vertexsize=0,thumbwidth=0,thumbheight=0,suffixname="M",
                            refid=self.refid,refname=self.refname).dump(False)
                    dictionaryOrderTree = dictionaryOrder["tree"]
                    lenDictionaryOrderTree = len(dictionaryOrderTree)
                else:
                    orderDimension = (self.scene_min[0],self.scene_min[1],self.scene_min[2],\
                        self.scene_max[0],self.scene_max[1],self.scene_max[2]) if\
                            (self.checkIfList(self.scene_min) and self.checkIfList(self.scene_max)) else\
                                (0,0,0,0,0,0)
                    outputShapesOrder = self.outputShapes
                    dictionaryOrderTree=self.tstep_dict["tree"]
                    lenDictionaryOrderTree = myTreeLenBeforeAddingEdgesAndVertices
                shapeArrayOrder,shapeOrder,shapePicklesOrder,aNameOrder,aColorAssemblyOrder = StepExportWithColor().\
                    getShapesFromOutPutShapes(outputShapesOrder,1,dictionaryOrderTree,lenDictionaryOrderTree,'')
                orderStatusName = self.basefilename[:-1]+'M'
                StepExportWithColor().writeStatus(orderStatusName,COPY_PATH+self.displaypath,\
                    30,self.starttime,False,self.refid,self.refname,self.fname,"M")
                FindAssemblingOrder(shapeArrayOrder,shapeOrder,aNameOrder,aColorAssemblyOrder,orderDimension,self.explodegap,\
                    self.center,self.holescale,self.removegap,self.logging).ExplodeParts(\
                        self.fname,self.distancegap,self.anglegap,self.delay,COPY_PATH+self.displaypath,\
                            False,self.refid,self.refname,self.starttime)
                StepExportWithColor().writeStatus(orderStatusName,COPY_PATH+self.displaypath,\
                    100,self.starttime,False,self.refid,self.refname,self.fname,"M")
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
                                    'dimension':orderDimension,
                                    'refid':self.refid,
                                    'refname':self.refname} 
                    picklefile = COPY_PATH+self.displaypath+orderStatusName+".pickle"
                    with open(picklefile, 'wb') as f:
                        # Pickle the 'data' dictionary using the highest protocol available.                               
                        pickle.dump(myPickle, f, pickle.HIGHEST_PROTOCOL)
                except Exception as e:
                    print(e,"File, %s has error" % picklefile)
            if self.CreateStackability:
                print("Starting Stackability",self.fname)
                orderDimension = (self.scene_min[0],self.scene_min[1],self.scene_min[2],\
                    self.scene_max[0],self.scene_max[1],self.scene_max[2]) if\
                        (self.checkIfList(self.scene_min) and self.checkIfList(self.scene_max)) else\
                            (0,0,0,0,0,0)
                outputShapesOrder = self.outputShapes
                dictionaryOrderTree=self.tstep_dict["tree"]
                lenDictionaryOrderTree = myTreeLenBeforeAddingEdgesAndVertices
                shapeArrayOrder,shapeOrder,shapePicklesOrder,aNameOrder,aColorAssemblyOrder = StepExportWithColor().\
                    getShapesFromOutPutShapes(outputShapesOrder,None,dictionaryOrderTree,lenDictionaryOrderTree,'')
                orderStatusName = self.basefilename[:-1]+'S'
                StepExportWithColor().writeStatus(orderStatusName,COPY_PATH+self.displaypath,\
                    30,self.starttime,False,self.refid,self.refname,self.fname,"S")
                FindStackability(self.fname,shapeArrayOrder,orderDimension,\
                    self.distancegap,self.anglegap,self.delay,self.starttime,\
                        self.logging,self.refid,self.refname).dump()
                StepExportWithColor().writeStatus(orderStatusName,COPY_PATH+self.displaypath,\
                    100,self.starttime,False,self.refid,self.refname,self.fname,"S")
                print("Completing Stackability",self.fname)
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
                                    'dimension':orderDimension,
                                    'refid':self.refid,
                                    'refname':self.refname} 
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
            self.percentage = 100
            self.write_status(0)
            return (\
                (getPNG,self.output,self.fullZeroShape),\
                    ( (self.scene_min[0],self.scene_min[1],self.scene_min[2],\
                        self.scene_max[0],self.scene_max[1],self.scene_max[2]) if\
                            (self.checkIfList(self.scene_min) and self.checkIfList(self.scene_max)) else\
                                (0,0,0,0,0,0),\
                                    self.outputShapes ),\
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
    
    def updateParentChild(self,name,aShape,displayname,addNumber=False):
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
        self.updateName(name,mesher_dict,0,True,displayname,addNumber)
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
    

    def add_part(
        self, part, part_color=None, filenameuri=None, filetype="", name=None,  
        parent_idx=0, curvecode="", curvepoints=None, entity={}, fromRecursion=False, 
        buff=None, solidfound=0, uvbuff=None, uvPlane=[], nameroot=None ):
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
            myFileType = filetype[0:1]
            addNumber = myFileType=='F' or myFileType=='E' or myFileType=='V'
            mesherDict = self.updateParentChild(name,part,nameroot,addNumber)
            #print("add_part", mesherDict)
            mesher_dict = self.findDictionary(mesherDict)
            #print("mesh",mesher_dict)
            mesher_dict[self.gltf_Dict["step"]] = os.path.basename(filenameuri)
           
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

    
