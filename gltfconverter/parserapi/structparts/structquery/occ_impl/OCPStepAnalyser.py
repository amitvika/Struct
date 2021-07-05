import os
import sys
import unicodedata
from pathlib import Path
import os
import struct
import base64
from io import BytesIO
from itertools import chain
from copy import copy, deepcopy
import json
from collections import defaultdict
import numpy
from time import time
from contextlib import contextmanager
import jinja2
import html


import logging
log = logging.getLogger(__name__)

from OCC.Core.STEPControl import STEPControl_Reader, STEPControl_Writer, STEPControl_AsIs
from OCC.Core.Interface import Interface_Static_SetCVal
from OCC.Core.IFSelect import IFSelect_RetDone, IFSelect_ItemsByEntity
from OCC.Core.STEPCAFControl import STEPCAFControl_Reader
from OCC.Core.TDF import TDF_Label, TDF_LabelSequence
from OCC.Core.TCollection import TCollection_ExtendedString
from OCC.Core.TDocStd import TDocStd_Document
from OCC.Core.XCAFApp import XCAFApp_Application_GetApplication
from OCC.Core.XCAFDoc import (XCAFDoc_DocumentTool_ShapeTool, XCAFDoc_DocumentTool_ColorTool)
from OCC.Core.STEPCAFControl import STEPCAFControl_Reader
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCC.Core.Tesselator import ShapeTesselator
from OCC.Core.BRep import BRep_Builder, BRep_Tool
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox, BRepPrimAPI_MakeSphere
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Fuse
from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_MakeEdge
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopoDS import TopoDS_Compound, topods_Face
from OCC.Core.TopAbs import (TopAbs_FACE, TopAbs_Orientation)
from OCP.TopAbs import (TopAbs_VERTEX, TopAbs_EDGE, TopAbs_FACE, TopAbs_WIRE,
                             TopAbs_SHELL, TopAbs_SOLID, TopAbs_COMPOUND,
                             TopAbs_COMPSOLID, TopAbs_ShapeEnum)
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.gp import gp_Pnt, gp_Vec, gp_Dir, gp_XYZ, gp_Pnt2d
from OCC.Core.TopoDS import TopoDS_Vertex
from OCC.Core.ShapeBuild import ShapeBuild_ReShape

from .OCCUtils.vertex import Vertex
from .OCCUtils import Topology


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



class StepAnalyser():
    """A class that analyzes the structure of an OCAF document."""
    scale = 0.001  # mm to meters
    __version__ = "3.7.4"
    TEMPLATE = {
        # Static values
        "asset": {
            "generator": "structparts_%s" % __version__,
            "version": "2.0"  # glTF version
        },
        "scene": 0,

        # Populated by adding parts
        "scenes": [{"nodes": [0]}],
        "download" : "",
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
        "buffers": [],
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
            "baseColorFactor":[0.7529,0.7529,0.7529,1.0],
            "metallicFactor":0.1,
            "roughnessFactor":0.7
            }
        }
    def __init__(self, document=None, filename=None, includeparts=False, distancegap=0.1, anglegap=0.5):
        """Supply one or the other: document or STEP filename."""

        self.uid = 1
        self.indent = 0
        self.output = ""
        self.tree = ""
        self._share_dict = {'0:1:1': 0} 
        self.fname = filename
        head, tail = os.path.split(self.fname)
        pathfilename, file_extension = os.path.splitext(tail)
        self.basefilename = pathfilename
        self.includeparts = includeparts
        if self.includeparts:
            self.fileprefix = "I"
        else:
            self.fileprefix = "H"
        self.distancegap = distancegap
        self.anglegap = anglegap
        self.direntry = ""
        self.mstep_dict = deepcopy(self.TEMPLATE)
        self.scene_min = None
        self.scene_max = None
        
        
        try:
            self.validFilenameChars = "-_.() abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            if filename:
                self.doc = self.read_file(filename)
            elif document:
                self.doc = document
                self.shape_tool = XCAFDoc_DocumentTool_ShapeTool(self.doc.Main())
                self.color_tool = XCAFDoc_DocumentTool_ColorTool(self.doc.Main())
            else:
                print("Supply one or the other: document or STEP filename.")
        except Exception as e:
            print("Error1:", e)

    def read_file(self, fname):
        """Read STEP file and return <TDocStd_Document>."""

        # Create the application, empty document and shape_tool
        doc = TDocStd_Document(TCollection_ExtendedString("STEP"))
        app = XCAFApp_Application_GetApplication()
        app.NewDocument(TCollection_ExtendedString("MDTV-XCAF"), doc)
        self.shape_tool = XCAFDoc_DocumentTool_ShapeTool(doc.Main())
        self.color_tool = XCAFDoc_DocumentTool_ColorTool(doc.Main())
        self.shape_tool.SetAutoNaming(True)

        # Read file and return populated doc
        step_reader = STEPCAFControl_Reader()
        step_reader.SetColorMode(True)
        step_reader.SetLayerMode(True)
        step_reader.SetNameMode(True)
        step_reader.SetMatMode(True)
        status = step_reader.ReadFile(fname)
        if status == IFSelect_RetDone:
            step_reader.Transfer(doc)
        return doc

    def getSubShapes(self, subLabel, subLocation, subName, subEntry, parentName, parentEntry, filename, name, parent_node_index=0):
    
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
        
        if self.shape_tool.IsAssembly(subLabel):
            self.indent += 1
            self.tree+="<ul id=\"myUL\"><li><span class=\"caret\">"+html.escape(subName+" "+subEntry+" ")+str(self.uid)+"</span><ul class=\"nested\">"    
            #self.output+="\nXOXO"+subName+subEntry+"\n"
            #print("I have reached here 2")
            mydirectory = self.validFileName(subName+subEntry)
            mydirectorylen = len(self.direntry)
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
            SubLengthHere = subComponentsFromParent.Length()
            for i in range(SubLengthHere):
                print("Processing",i,SubLengthHere,self.indent)
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
                        parent_node_index=node_index,
                        )
                    
                    #print("I have reached here 9")
                    #lvl -= 1
                    #print("<<<<")
                    self.parentLocations.pop()
                    #print("I have reached here 10")
                #else:
                #    self.update_output(subLabelName, subLabelEntry, subName, subEntry) 
            self.indent -= 1 
            self.tree+="</ul></li></ul>"    
            
            self.direntry = self.direntry[:mydirectorylen]
            #print("I have reached here 11")
        elif self.shape_tool.IsSimpleShape(subLabel):
            #print("\n########  simpleshape label :", subLabel)
            #print("I have reached here 12")
            shape = self.shape_tool.GetShape(subLabel)
            #print("I have reached here 13")
            subLocation = TopLoc_Location()
            for currentLocation in self.parentLocations:
                #print("    take subLocation       :", l)
                subLocation = subLocation.Multiplied(currentLocation)
           
            c = Quantity_Color(0.7529, 0.7529, 0.7529, Quantity_TOC_RGB)  # default color
            colorSet = False
            #print("I have reached here 14")
            if (self.color_tool.GetInstanceColor(shape, 0, c) or
                    self.color_tool.GetInstanceColor(shape, 1, c) or
                    self.color_tool.GetInstanceColor(shape, 2, c)):
                self.color_tool.SetInstanceColor(shape, 0, c)
                self.color_tool.SetInstanceColor(shape, 1, c)
                self.color_tool.SetInstanceColor(shape, 2, c)
                colorSet = True
            #print("I have reached here 15")    
            if not colorSet:
                if (self.color_tool.GetColor(subLabel, 0, c) or
                        self.color_tool.GetColor(subLabel, 1, c) or
                        self.color_tool.GetColor(subLabel, 2, c)):

                    self.color_tool.SetInstanceColor(shape, 0, c)
                    self.color_tool.SetInstanceColor(shape, 1, c)
                    self.color_tool.SetInstanceColor(shape, 2, c)

            #print("I have reached here 16")
            shape_disp = BRepBuilderAPI_Transform(shape, subLocation.Transformation()).Shape()
            if shape_disp.IsNull():
                print("No shape was formed when"+str(self.uid)+"\n")
            else:
                #print("I have reached here 17")
                if not shape_disp in self.outputShapes:
                    self.fileId += 1
                    self.outputShapes[shape_disp] = [parentName, parentEntry, c, self.uid, self.indent, subName, subEntry]
                    print("I am writing",self.fileId)
                    (filefullname, basename) = self.write_step_file(shape_disp,subName+subEntry)
                   
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
                        
                    self.add_part(
                        shape_disp,
                        part_color=c,
                        filenameuri=filefullname,
                        filename= filename,
                        name=subName+parentName,
                        parent_idx=parent_node_index,                        
                    ) 
            #if(len(self.outputShapes)<=1):       
            #print("I have reached here 18")
            
            if self.includeparts:
                #print("I have toIncludeSubShapes gltf for lowest node",basename ) 
                self.indent += 1
                self.tree+="<ul id=\"myUL\"><li><span class=\"caret\">"+html.escape(subName+" "+subEntry+" ")+str(self.uid)+"</span><ul class=\"nested\">"    
            
                mydirectory = self.validFileName(subName+subEntry)
                mydirectorylen = len(self.direntry)
                self.direntry += "/"+mydirectory
                for i in range(subShapesFromParent.Length()):
                    labelForSubShapes = subShapesFromParent.Value(i+1)
                    #print("\n########  simpleshape subshape label :", subLabel)
                    #print("I have reached here 19")
                    shapeForSubShapes = self.shape_tool.GetShape(labelForSubShapes)
                    #print("I have reached here 20")
                    c = Quantity_Color(0.5, 0.5, 0.5, Quantity_TOC_RGB)  # default color
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
                            self.color_tool.SetInstanceColor(shape, 2, c)
                    labelForSubShapesName = labelForSubShapes.GetLabelName()
                    labelForSubShapesEntry = labelForSubShapes.EntryDumpToString()
                    #print("I have reached here 22")
                    
                                        
                    shape_to_disp = BRepBuilderAPI_Transform(shapeForSubShapes, subLocation.Transformation()).Shape()
                    if shape_to_disp.IsNull():
                        print("No shape was formed when"+str(self.uid)+"\n")
                    else:
                        #print("I have reached here 23")     
                        # position the subshape to display
                        if not shape_to_disp in self.outputShapes:
                            self.fileId += 1
                            #print("I am writing gltf lowest node",basename,shape_to_disp.ShapeType() )
                            self.updateOutput(subName, subEntry, labelForSubShapesName, labelForSubShapesEntry,  False)
                            #print("I have reached here 24")
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
                        #print("I have reached here 25")
                self.indent -= 1
                self.tree+="</ul></li></ul>"            
                self.direntry = self.direntry[:mydirectorylen]
            #print("I have reached here 26")

    def updateName(self,name,forNodes):
        if name:
            forNodes['name'] = html.escape(name+self.fileprefix+str(self.fileId))
        else:
            forNodes['name'] = html.escape("No Name"+self.fileprefix+str(self.fileId))

    def getShapes(self):
        #print("I have reached here in getshapes 1")
        labels = TDF_LabelSequence()
        self.shape_tool.GetFreeShapes(labels)
        #print("I have reached here in getshapes 2")
        topLevelItems = labels.Length()
        rootlabel = labels.Value(1) # First label at root
        #print("I have reached here in getshapes 3")
        # Get information from root label
        rootName = rootlabel.GetLabelName()
        rootEntry = rootlabel.EntryDumpToString()
        isAssembly = self.shape_tool.IsAssembly(rootlabel)
        uid = self.get_uid_from_entry(rootEntry)
        
        print("root label",rootName, topLevelItems,"items")
        filename = "Display/"+self.basefilename+".gltf"
        split = os.path.splitext(filename)
        name = os.path.basename(filename)
        self.outputShapes = {} #dictionary
        self.parentLocations = [] #list
        self.uid = 0
        self.fileId = 0
        self.output += f"{self.uid}--{uid}\t[{rootEntry}] {rootName}\t"        
        self.uid += 1
        self.indent += 1
        self.output += f"Number of labels at root = {topLevelItems}\n"
        self.direntry = "Display/"+self.validFileName(name+rootName+rootEntry)
        parent_node_index = 0
        node_index = 0
        if isAssembly:
            print("Is Assembly", isAssembly)
        else: #manually create the assembly
            self.tree+="<ul id=\"myUL\"><li><span class=\"caret\">"+html.escape(name+" "+rootName+" "+rootEntry+" ")+str(self.uid)+"</span><ul class=\"nested\">"    

        node_index = len(self.mstep_dict['nodes'])
        node = {}
        node.update(self.transformed_matrix)
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
                    parent_node_index=node_index,
                    )
            except Exception as e:
                print("Error",e)
            #print("I have reached here in getshapes 10")
        if isAssembly:
            print("Assembly is splitted")
        else: #manually create the assembly
            self.tree+="</ul></li></ul>" 

    def dump(self):
        """Return assembly structure in indented outline form.
        Format of lines:
        Component Name [entry] => Referred Label Name [entry]
        Components are shown indented w/r/t line above."""

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
        self.getShapes()
        self.mstep_dict['download']=self.tree
        # Write self.mstep_dict to file as JSON string
        
        newfilename = "Display/"+self.basefilename+".gltf"
        try:
            print("Writing",newfilename)
            with open(newfilename, 'w') as fh:
                fh.write(json.dumps(self.mstep_dict, sort_keys=True, indent=2 ))
        except:
            print("While Writing",newfilename,e)

        return self.output, self.outputShapes, self.mstep_dict
    
    def get_uid_from_entry(self, entry):
        """Generate uid from label entry

        In order to distinguish among multiple instances of shared data
        a uid is comprised of 'entry.serial_number', starting with 0.
        """
        if entry in self._share_dict:
            value = self._share_dict[entry]
        else:
            value = -1
        value += 1
        # update serial number in self._share_dict
        self._share_dict[entry] = value
        return entry + '.' + str(value)   
           
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
    
    def validFileName(self,filename):
        try:
            cleanedFilename = filename #unicodedata.normalize('NFKD', filename).encode('ASCII', 'ignore')
            #print("CleanedFileName",cleanedFilename)
            #print("Valid chars", self.validFilenameChars)
            return ''.join(c for c in cleanedFilename if c in self.validFilenameChars)
        except Exception as e:
            print("Error2:",e)
   
    def write_step_file(self, a_shape, outname):
        """ exports a shape to a STEP file
        a_shape: the topods_shape to export (a compound, a solid etc.)
        outname: FileName to store
        """
        
        basename = self.basefilename+self.fileprefix+str(self.fileId)+".step"
        newfilename = "Display/"+basename
        #basename = self.validFileName(outname)+str(self.fileId)+".step"
        #newfilename = self.direntry+"/"+ basename
        os.makedirs(os.path.dirname(newfilename), exist_ok=True)
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
        return (newfilename, basename) 
    
    
    def tessellate(self, shape) :
        #print("I have started Tesselating")
        #self.mesh(part, distancegap, angularTolerance)
        #print("I have checked mesh Tesselating")
        vertices = []
        triangles = []
        topologyExplorer = Topology.Topo(shape,ignore_orientation=False)
        faceiterator = topologyExplorer.faces() 
        list_of_faces = list(faceiterator)
        
           
        if(len(list_of_faces) > 0):
            #print("I have reached here 0")
            BRepMesh_IncrementalMesh(shape, self.distancegap, True, self.anglegap)
            #print("I have ok reached here 1")
            offset = 0
            bt = BRep_Tool()
            #topologyExplorer = Topology.Topo(shape,ignore_orientation=False)
            
            #facecount = 0
            for face in list_of_faces:  
                #facecount+=1
                #print(facecount, face)     
                
                location = TopLoc_Location()
                facing = (bt.Triangulation(face, location))
                if facing:
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
                else:
                    print("No facing info for", face)
        
            

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
        return (vertices, triangles)

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
            tess = ([],[])
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
                tess = ([],[])
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
        (vertices, indices) = self.part_mesh(part)
        #print(vertices,indices)

        if len(indices) != 0 :
            #print("indices", len(indices))
            # Create ShapeBuffer
            buff = ShapeBuffer(
                max_index=numpy.matrix(indices).max(),
            )
        else :

            # Create EmptyBuffer
            buff = ShapeBuffer(
                max_index=0,
            )
            #print("I am here", indices)

        # Push mesh to ShapeBuffer
        for (x,y,z) in vertices:            
            buff.add_vertex(x,y,z)
        for (i, j, k) in indices:
            buff.add_poly_index(i, j, k)

        return buff, len(indices)   
    

    def add_part(self, part, part_color=None, filenameuri=None, filename=None, name=None,  parent_idx=0):
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
        :rtype: :class:`dict`

        **Return Format:**

        The returned :class:`dict` is an account of what objects were added
        to the mstep dict, and the index they may be referenced::

            <return format> = {
                'buffers':     [(<index>, <object>), ... ],
                'bufferViews': [(<index>, <object>), ... ],
                'accessors':   [(<index>, <object>), ... ],
                'materials':   [(<index>, <object>), ... ],
                'meshes':      [(<index>, <object>), ... ],
                'nodes':       [(<index>, <object>), ... ],
            }

        .. note::

            The format of the returned :class:`dict` **looks similar** to the mstep
            format, but it **is not**.
        """
        self.tree+="<li><a href=\""+filenameuri+"\">"+html.escape(name+" ")+str(self.fileId)+"-Download</a></li>"
        info = defaultdict(list)

        log.debug("mstep export: %r", part)

        # ----- Adding to: buffers
        with measure_time(log, 'buffers'):
             
            buff, solidfound = self.part_buffer(part)
            if( solidfound > 0 ) :
               
                self.scene_min = _list3_min(
                    self.scene_min,
                    buff.vert_min
                )
                self.scene_max = _list3_max(
                    self.scene_max,
                    buff.vert_max
                )
                
                buffer_index = len(self.mstep_dict['buffers'])
                #print(buff.vert_min)
                #print(buff.vert_max)
                buffer_dict = {
                    "byteLength": len(buff),
                    "topleft" : buff.vert_min,
                    "bottomright" : buff.vert_max                    
                }
                self.updateName(name, buffer_dict)
                # write mesh file
                
                newfilename = "Display/"+self.basefilename+self.fileprefix+str(self.fileId)+".bin"
                #print("Writing File",newfilename)
                try:

                    with open(newfilename, 'wb') as fh:
                        for chunk in buff.buffer_iter():
                            fh.write(chunk)
                except Exception as e:
                    print("Error in writing",e)
                
                buffer_dict['uri'] = os.path.basename(newfilename)                
                              
                buffer_dict['step'] = os.path.basename(filenameuri)
                buffer_dict['indent'] = self.indent

                self.mstep_dict['buffers'].append(buffer_dict)
                info['buffers'].append((buffer_index, buffer_dict))

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
                    info['bufferViews'].append((bufferView_index_vertices, view))

                    # indices view
                    view = {
                        "buffer": buffer_index,
                        "byteOffset": buff.idx_offset,
                        "byteLength": buff.idx_len,
                        "target": StepGL.ELEMENT_ARRAY_BUFFER,
                    }
                    self.mstep_dict['bufferViews'].append(view)
                    bufferView_index_indices = bufferView_index + 1
                    info['bufferViews'].append((bufferView_index_indices, view))

                # ----- Adding: accessors
                with measure_time(log, 'accessors'):
                    accessor_index = len(self.mstep_dict['accessors'])

                    # vertices accessor
                    accessor = {
                        "bufferView": bufferView_index_vertices,
                        "byteOffset": 0,
                        "componentType": StepGL.FLOAT,
                        "count": buff.vert_size,
                        "min": [v - 0.1 for v in buff.vert_min],
                        "max": [v + 0.1 for v in buff.vert_max],
                        "type": "VEC3",
                    }
                    self.mstep_dict['accessors'].append(accessor)
                    accessor_index_vertices = accessor_index
                    info['accessors'].append((accessor_index_vertices, accessor))

                    # indices accessor
                    accessor = {
                        "bufferView": bufferView_index_indices,
                        "byteOffset": 0,
                        "componentType": buff.idx_type,
                        "count": buff.idx_size,
                        "type": "SCALAR",
                    }
                    self.mstep_dict['accessors'].append(accessor)
                    accessor_index_indices = accessor_index + 1
                    info['accessors'].append((accessor_index_indices, accessor))

                # ----- Adding: materials
                with measure_time(log, 'materials'):
                    material_index = len(self.mstep_dict['materials'])
                    try:
                        if part_color:
                            material = {
                                'alphaCutoff': 1.0, 'alphaMode': 'BLEND', 'pbrMetallicRoughness': {
                                    'baseColorFactor': [
                                        part_color.Red(),part_color.Green(),part_color.Blue(),1.0
                                        ], 'metallicFactor': 0.1, 'roughnessFactor': 0.7}}
                        else:
                            material = self.default_material
                    except Exception as e:
                        print("Error in updation", e)
                    self.mstep_dict['materials'].append(material)
                    info['materials'].append((material_index, material))

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
                    info['meshes'].append((mesh_index, mesh))

                # ----- Adding: nodes
                with measure_time(log, 'nodes'):
                    node_index = len(self.mstep_dict['nodes'])
                    
                    node = {
                        "mesh": mesh_index,                        
                    }
                    self.updateName(name,node)                    
                    node.update(self.transformed_matrix)
                    self.mstep_dict['nodes'].append(node)
                    info['nodes'].append((node_index, node))

                # Appending child index to its parent's children list
                parent_node = self.mstep_dict['nodes'][parent_idx]
                parent_node['children'] = parent_node.get('children', []) + [node_index]
            #else:
                #print(" I have reache here without adding")

        return info

    
    
    
