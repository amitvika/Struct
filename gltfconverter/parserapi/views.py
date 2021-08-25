
from math import ceil
from OCC.Core.gp import gp_Pnt 
from django.http.response import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
#from rest_framework.parsers import FileUploadParser
from rest_framework.parsers import JSONParser

from .models import File
from .serializers import FileSerializer
 

from inspect import getmembers
from types import FunctionType

import json
#import jsonpickle
import pprint
from glob import glob
import os
#import sys
import pickle

from pathlib import Path
from .structparts import Part
from .structparts import Assembly
from .structparts.codec.step import (Importer, Exporter)
from .structparts.codec.mstep import Exporter
from .structparts import conversion
#from .structparts.structquery.occ_impl import OCPDataExchange
from .structparts.structquery.occ_impl import OCPStepIGESAnalyser, OCPImporters
from .structparts.structquery.occ_impl.gltfDictionary import gltfdict

from .structparts.structquery.occ_impl.OCCExtend.ShapeFactory import (
    translate_shp, rotate_shp_3_axis, minimum_distance, minimum_z_distance, 
    getPartStackablePositions, get_bounding_details, get_bounding_details_common,
    recognize_direction, recognize_entity)
from .structparts.structquery.occ_impl.OCCUtils.Topology import dumpTopologyStructures, dumpTopologyFacesEdgesVertices
from OCC.Core.TopAbs import (TopAbs_FACE, TopAbs_Orientation)
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Common
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
from .structparts.structquery.occ_impl.OCCExtend.TopologyUtils import list_of_shapes_to_compound, excluded_list_of_shapes_to_compound

from decimal import Decimal 

gltf_dict = gltfdict()

@api_view(['GET', 'POST', 'DELETE'])
def FileUploadView(request):
    if request.method == 'GET':
        files = File.objects.all()
        
        id = request.GET.get('id', None)
        if id is not None:
            files = files.filter(id__icontains=id)
        
        files_serializer = FileSerializer(files, many=True)
        return JsonResponse(files_serializer.data, safe=False)
        # 'safe=False' for objects serialization
 
    elif request.method == 'POST':
        #parser_class = (FileUploadParser,)
        #file_data = JSONParser().parse(request.data)
        f = request.data['file']
        request.data._mutable = True
        request.data['filename'] = f.name
        request.data._mutable = False
        file_serializer = FileSerializer(data=request.data)
        #f = request.data['file']
        #file_serializer.data['file']=f
        #file_serializer.filename = f.name
        #print(file_serializer)
        if file_serializer.is_valid():
            file_serializer.save()
            #print(file_serializer.data)
            return JsonResponse(file_serializer.data, status=status.HTTP_201_CREATED) 
        return JsonResponse(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        count = File.objects.all().delete()
        return JsonResponse({'message': '{} files were deleted successfully!'.format(count[0])}, status=status.HTTP_204_NO_CONTENT)
 
 
@api_view(['GET', 'PUT', 'DELETE'])
def FileReplaceView(request, pk):
    try: 
        file = File.objects.get(pk=pk) 
    except File.DoesNotExist: 
        return JsonResponse({'message': 'The file does not exist'}, status=status.HTTP_404_NOT_FOUND) 
 
    if request.method == 'GET': 
        file_serializer = FileSerializer(file) 
        return JsonResponse(file_serializer.data) 
 
    elif request.method == 'PUT': 
        file_data = JSONParser().parse(request) 
        file_serializer = FileSerializer(file, data=file_data) 
        if file_serializer.is_valid(): 
            file_serializer.save() 
            return JsonResponse(file_serializer.data) 
        return JsonResponse(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST) 
 
    elif request.method == 'DELETE': 
        file.delete() 
        return JsonResponse({'message': 'File was deleted successfully!'}, status=status.HTTP_204_NO_CONTENT)


def obj_to_string(obj, extra='    '):
    return str(obj.__class__) + '\n' + '\n'.join(
        (extra + (str(item) + ' = ' +
                 (obj_to_string(obj.__dict__[item], extra + '    ') if hasattr(obj.__dict__[item], '__dict__') else str(
                      obj.__dict__[item])))
        for item in sorted(obj.__dict__)))
		 
def attributes(obj):
    disallowed_names = {
      name for name, value in getmembers(type(obj)) 
        if isinstance(value, FunctionType)}
    return {
      name: getattr(obj, name) for name in dir(obj) 
        if name[0] != '_' and name not in disallowed_names and hasattr(obj, name)}

def print_attributes(obj):
    pprint.pprint(attributes(obj)) 


	
def is_number(value):
    try:
        value = Decimal(value)
        return True
    except:
        return False   

def read_content(filename):
    data = {}
    with open(filename, "r") as f:
        data = f.read()
    return data
		
def getFile(id,key):
    data =[]
    if id or is_number(id) :
        filename, file_extension = os.path.splitext(id)
        sourcefilename = key+id			
        newfilenamewithoutext = newfilename = "Display/"+Path(id).resolve().stem		
        newfilename = newfilenamewithoutext + ".gltf"
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        print(file_extension, filename, id, key, newfilename)
        print("starting converting", sourcefilename, newfilename)
        file_type = ""
        if file_extension=="stp" or file_extension=="step" or file_extension=="igs" or file_extension=="iges" or file_extension=="brp" or file_extension=="brep" :
            file_type = "step"
        if file_extension=="stl" or file_extension=="svg" or file_extension=="amf" or file_extension=="json" or file_extension=="gltf" :
            file_type = file_extension
        if file_type == "step" :
            try:		
                myassemblies = Assembly.importer(file_type)(sourcefilename)
                try:
                    print("converting ", sourcefilename, newfilename)
                    myassemblies.exporter('gltf')(newfilename)
                    data = read_content(newfilename)
                except:
                    print("Unable to convert ", newfilename)
                    pass
            except:
                print("Unable to import ", sourcefilename, " and hence not able to split")
                pass
        else:
            print(" Unable to convert ", sourcefilename, " since not supported type to Import ", file_extension)		
    return data
    
@api_view(['GET'])
def FileGetView(request):
    data = []
    if request.method == 'GET':
        id = request.GET.get('id', None)
        #print(id)        
        if is_number(id) :
            if id==0:
               id = request.GET.get('file', None)
               data = getFile(id,"Media/")
            else :
                files = File.objects.filter(id__icontains=id)
                for eachfile in files:
                   data = getFile(eachfile.file.name,"Media/")
        else:
            id = request.GET.get('file', None)
            data = getFile(id,"Media/")
    return JsonResponse(data, safe=False)

""" def validFileName(s) :
    return "".join( x for x in s if (x.isalnum() or x in "._- ")) """

def exportToStepCadQuery(sourceFileName):
    """
    Imports a file based on the type (BREP, IGES)
    :param importType: The type of file that we're importing
    :param sourceFileName: THe name of the file that we're importing
    :param destFileName: THe name of the file that we're exporting
    """
    #Now read and return the shape
   
    try:
             
        # Hence using OCC directly
        _, file_extension = os.path.splitext(sourceFileName)
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        newfilenamewithoutext = "Display/"+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        if file_extension=="stp" or file_extension=="step" :           
            return (sourceFileName, True)         
        if file_extension=="stl" :
            shape = conversion.read_stl_file(sourceFileName)
            conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
            return (newfilename, True)
        if file_extension=="igs" or file_extension=="iges" :
            shape = conversion.read_iges_file(sourceFileName, as_compound=True)
            conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
            return (newfilename, True)
        return ("", False)
       
    except:
        raise ValueError("File Could not be loaded")  

def exportToGLTF(sourceFileName,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight):
    """
    Imports a file based on the type (STEP, IGES, BREP, STL)    
    """
    #Now read and return the shape
   
    try:
        
        """# FreeCAD conversion has bugs...
        shape = Part.Shape()
    
        shape.read(sourceFileName)
    
        shape.exportStep(destFileName) 
        """        
        # Hence using OCC directly
        dictionary={}
        _, file_extension = os.path.splitext(sourceFileName)
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        newfilenamewithoutext = "Display/"+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        if file_extension=="stp" or file_extension=="step" :           
            
            try:
                """ shape = conversion.read_iges_file(sourceFileName, as_compound=True)
                conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
                return(newfilename, False) """
                """ if newfilename != sourceFileName :
                    shape = conversion.read_step_file(sourceFileName, as_compound=True)
                    conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
                    print(newfilename, sourceFileName)
                    return(newfilename, False) """
                shape = conversion.read_step_file(sourceFileName, as_compound=False)
                newfilename = newfilenamewithoutext + ".gltf"
                myassemblies = Assembly.importer("shape")(shape,sourceFileName)
                dictionary = myassemblies.exporter('mstep')(
                        filename=newfilename, tolerance = distancegap, angularTolerance=anglegap,
                        disectparts=disectparts,moverotate=moverotate)
                """ (_, _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape, includeparts=True,
                    distancegap=distancegap,anglegap=anglegap,disectparts=disectparts,
                    moverotate=moverotate).dump() """
            except Exception as e:
                print("error",e)
                try:
                    shape = conversion.read_step_file(sourceFileName, as_compound=True)
                    newfilename = newfilenamewithoutext + ".step"
                    conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
                    return(newfilename, False)
                except Exception as e2:
                    print("error",e2)
            return (dictionary, True)            
            
        if file_extension=="stl" :            
            try:
                shape = conversion.read_stl_file(sourceFileName)
                newfilename = newfilenamewithoutext + ".gltf"
                myassemblies = Assembly.importer("shape")(shape,sourceFileName)
                dictionary = myassemblies.exporter('mstep')(
                        filename=newfilename, tolerance = distancegap, angularTolerance=anglegap,
                        disectparts=disectparts,moverotate=moverotate)
                """ (_, _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape, includeparts=True,
                    distancegap=distancegap,anglegap=anglegap,disectparts=disectparts,
                    moverotate=moverotate).dump() """
            except Exception as e:
                print("error",e)
                try:
                    shape = conversion.read_stl_file(sourceFileName)
                    newfilename = newfilenamewithoutext + ".step"
                    conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
                    return(newfilename, False)
                except Exception as e2:
                    print("error",e2)
            return (dictionary, True)
        if file_extension=="igs" or file_extension=="iges" :
            try:
                """ shape = conversion.read_iges_file(sourceFileName, as_compound=True)
                conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
                return(newfilename, False) """
                shape = conversion.read_iges_file(sourceFileName, as_compound=False)
                newfilename = newfilenamewithoutext + ".gltf"
                myassemblies = Assembly.importer("shape")(shape,sourceFileName)
                #return {},True
                dictionary = myassemblies.exporter('mstep')(
                        filename=newfilename, tolerance = distancegap, angularTolerance=anglegap,
                        disectparts=disectparts,moverotate=moverotate)
                """ (_, _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape, includeparts=True,
                    distancegap=distancegap,anglegap=anglegap,disectparts=disectparts,
                    moverotate=moverotate).dump() """
            except Exception as e:
                print("error",e)
                try:
                    shape = conversion.read_iges_file(sourceFileName, as_compound=True)
                    newfilename = newfilenamewithoutext + ".step"
                    conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
                    return(newfilename, False)
                except Exception as e2:
                    print("error",e2)
            return (dictionary, True)
        if file_extension=="brep" :            
            try:
                shape = conversion.read_brep_file(sourceFileName, as_compound=False)
                newfilename = newfilenamewithoutext + ".gltf"
                myassemblies = Assembly.importer("shape")(shape,sourceFileName)
                dictionary = myassemblies.exporter('mstep')(
                        filename=newfilename, tolerance = distancegap, angularTolerance=anglegap,
                        disectparts=disectparts,moverotate=moverotate)
                """ (_, _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape, includeparts=True,
                    distancegap=distancegap,anglegap=anglegap,disectparts=disectparts,
                    moverotate=moverotate).dump() """
            except Exception as e:
                print("error",e)
                try:
                    shape = conversion.read_brep_file(sourceFileName, as_compound=True)
                    newfilename = newfilenamewithoutext + ".step"
                    conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
                    return(newfilename, False)
                except Exception as e2:
                    print("error",e2)
            return (dictionary, True)
        if file_extension=="dxf" :            
            try:
                shape = OCPImporters.importDXFObjects(sourceFileName, tol=distancegap )
                newfilename = newfilenamewithoutext + ".gltf"
                myassemblies = Assembly.importer("shape")(shape,sourceFileName)
                dictionary = myassemblies.exporter('mstep')(
                        filename=newfilename, tolerance = distancegap, angularTolerance=anglegap,
                        disectparts=disectparts,moverotate=moverotate)
                """ (_, _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape, includeparts=True,
                    distancegap=distancegap,anglegap=anglegap,disectparts=disectparts,
                    moverotate=moverotate).dump() """
            except Exception as e:
                print("error",e)                
            return (dictionary, True)
        return ("",True)
       
    except:
        raise ValueError("File Could not be loaded")  


def splitFileCadQuery(id,key,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight):
    data =[]
    if id or is_number(id) :
        filename, file_extension = os.path.splitext(id)
        sourcefilename = key+id
        #newfilenamewithoutext = "Display/"+Path(id).resolve().stem
        try:
            (destFileName, converted) = exportToStepCadQuery(sourcefilename)            
            if converted :
                _, tail = os.path.split(destFileName)
                filename, file_extension = os.path.splitext(tail)
                newfilename = "Display/"+filename+".gltf"
                try:
                    myassemblies = Assembly.importer('step')(destFileName)
                    data = myassemblies.exporter('mstep')(
                        filename=newfilename, tolerance = distancegap, angularTolerance=anglegap,
                        disectparts=disectparts,moverotate=moverotate)
                    #data = read_content(newfilename)                    
                except Exception as e:
                    print(" Unable to split", newfilename, e)
                    pass
            else:
                print(" Unable to split", sourcefilename, "since not supported type", file_extension)               
        except Exception as e:
            print(e," Unable to import", sourcefilename, "and hence not able to split")
            pass
        
    #print(data)
    return data

def splitFile(id,key,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight):
    data =[]
    if id or is_number(id) :
        _, file_extension = os.path.splitext(id)
        sourcefilename = key+id
        #newfilenamewithoutext = "Display/"+Path(id).resolve().stem
        try:
            (data, converted) = exportToGLTF(sourcefilename,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
            if converted:
                return data
            else:   
                if data : 
                    #print("I have reached here to convert again")        
                    (data, converted) = exportToGLTF(data,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
                    return data                        
                else:
                    print(" Unable to split", sourcefilename, "since not supported type", file_extension)               
        except Exception as e:
            print(e," Unable to import", sourcefilename, "and hence not able to split")
            pass
        
    #print(data)
    return data 

def convertToBool(value,default):
    if value is not None:
        try:
            if value.lower()=="true":
                return True
            else:
                if value.lower()=="false":
                    return False
                else:
                    return default
        except:
            return default
    else:
        return default

def convertToFloat(value,default):
    if value is not None:
        try:
            floatValue = float(value)
            return floatValue
        except:
            return default
    else:
        return default

def convertToInt(value,default):
    if value is not None:
        try:
            intValue = int(value)
            return intValue
        except:
            return default
    else:
        return default

MOVEONLY=1
ROTATEONLY=2
MOVEANDROTATE=3
ROTATEANDMOVE=4

def findMinimumDistance(xmove,ymove,zmove,xrotate,yrotate,zrotate,moverotate,fname,sname):
    firstshell = None
    secondshell = None
    try:

        with open("Display/"+fname+".pickle", 'rb') as f:
            # The protocol version used is detected automatically, so we do not
            # have to specify it.
            firstshell = pickle.load(f)
        with open("Display/"+sname+".pickle", 'rb') as f:
            # The protocol version used is detected automatically, so we do not
            # have to specify it.
            secondshell = pickle.load(f) 
    except Exception as e:
        print("Error while loading",fname,sname,e)
    if firstshell:
        if moverotate==MOVEONLY:
            firstshell=translate_shp(firstshell,xmove, ymove, zmove, True)
        if moverotate==ROTATEONLY:
            firstshell=rotate_shp_3_axis(firstshell,xrotate,yrotate,zrotate, unity="radian", copy=True) 
        if moverotate==MOVEANDROTATE:
            firstshell=translate_shp(firstshell,xmove, ymove, zmove, True)
            firstshell=rotate_shp_3_axis(firstshell,xrotate,yrotate,zrotate, unity="radian", copy=True) 
        if moverotate==ROTATEANDMOVE:
            firstshell=rotate_shp_3_axis(firstshell,xrotate,yrotate,zrotate, unity="radian", copy=True)
            firstshell=translate_shp(firstshell,xmove, ymove, zmove, True)
    coplaner = "unknown"
    parallel = "unknown"
    normal = "unknown"
    opposite = "unknown"
    concentric = "unknown"
    coradial = "unknwon"  
    angle = "unknown"   
    if firstshell and secondshell:
        firstEntity = recognize_entity(firstshell)
        secondEntity = recognize_entity(secondshell)
        firstAxis =  firstEntity["position"]
        secondAxis = secondEntity["position"]
        if(firstAxis and secondAxis and (firstEntity['type']==secondEntity['type'])):            
            coplaner = firstAxis.IsCoplanar (secondAxis, 0.1, 0.5)
            firstDir = firstAxis.Direction()
            secondDir = secondAxis.Direction()
            parallel = firstDir.IsParallel(secondDir, 0.5)
            normal = firstDir.IsNormal(secondDir, 0.5)
            opposite = firstDir.IsOpposite(secondDir, 0.5)
            concentric = (firstEntity["center"]==secondEntity["center"])
            if ( ((firstEntity["kind"]=="Sphere") or (firstEntity["kind"]=="Cylinder") or\
                (firstEntity["kind"]=="Circle") or (firstEntity["kind"]=="Cone") ) and \
                (firstEntity["kind"]==secondEntity["kind"])): 
                coradial = (firstEntity["radius"] == secondEntity["radius"]) and concentric
            else:
                coradial = False  
            angle = firstDir.Angle(secondDir)          
          
        return minimum_distance(firstshell,secondshell), coplaner, parallel, normal, opposite, concentric, coradial, angle

@api_view(['GET'])
def FileSplit(request):
    data = []
    if request.method == 'GET':
        id = request.GET.get('id', None)
        includeparts =convertToBool(request.GET.get('includeparts',"false"),False)
        distancegap = convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
        anglegap = convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
        disectparts = convertToBool(request.GET.get('disectparts',"false"),False)
        moverotate = convertToInt(request.GET.get('moverotate',"0"),0)   
        thumbwidth = convertToFloat(request.GET.get('thumbwidth',"96"),96)
        thumbheight = convertToFloat(request.GET.get('thumbheight',"96"),96)   
        #print(includeparts)
        if includeparts:           
            print("I am including minorparts")
        else:
            print("I am excluding minorparts")
        if disectparts:           
            print("I am disecting to get vertices")
        else:            
            print("I am not disecting to get vertices")      
        print("Got request for",id,includeparts,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
        if moverotate==0:
            if is_number(id) :
                files = File.objects.filter(id__icontains=id)
                for eachfile in files:
                    if includeparts:
                        data = splitFile(eachfile.file.name,"Media/",distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
                    else:
                        data = splitFileCadQuery(eachfile.file.name,"Media/",distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
            else:
                id = request.GET.get('file', None)
                if id is not None:
                    if includeparts:
                        data = splitFile(id,"Media/",distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
                    else:
                        data = splitFileCadQuery(id,"Media/",distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
    return JsonResponse(data, safe=False)

def createShapeArray(shapes):
    shapeArray=[]
    myID=0
    for aShape in shapes:
        myID += 1
        shapeArray.append((aShape,"ID"+str(myID),None))
    return shapeArray

def exportToHierarchyGLTF(sourceFileName,includeparts,distancegap,anglegap,disectparts,moverotate,edgesize,vertexsize,thumbwidth,thumbheight):
    """
    Imports a file based on the type (STEP, IGES, BREP, STL)    
    """
    #Now read and return the shape
   
    try:
        
        """# FreeCAD conversion has bugs...
        shape = Part.Shape()
    
        shape.read(sourceFileName)
    
        shape.exportStep(destFileName) 
        """        
        # Hence using OCC directly
        dictionary={}
        _, file_extension = os.path.splitext(sourceFileName)
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        newfilenamewithoutext = "Display/"+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        
        if file_extension=="stp" or file_extension=="step" or file_extension=="igs" or file_extension=="iges" :           
            
            try:
                ( _,  _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,includeparts=includeparts,distancegap=distancegap,
                    anglegap=anglegap,disectparts=disectparts,moverotate=moverotate,
                    thumbwidth=thumbwidth,thumbheight=thumbheight,
                    edgesize=edgesize, vertexsize=vertexsize).dump()
                #dictionary['thumbnail']=thumbnail
            except Exception as e:
                print("error",e)

            return (dictionary, True)
            
            """             tuples = read_step_file(sourceFileName, as_compound=False)
            print(tuples)
            print(len(tuples))
            if(len(tuples)==1) :
                destFileNames.append(sourceFileName)
            else :
                count = 0
                for item in tuples:
                    count = count + 1
                    newfilename = newfilenamewithoutext + str(count) + ".step"
                    print(item)
                    print(newfilename)
                   
                    write_step_file(item, newfilename, application_protocol="AP242DIS")
                    destFileNames.append(newfilename) """
        if file_extension=="stl" :            
            try:
                shape = conversion.read_stl_file(sourceFileName)
                (_,_, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape), includeparts=includeparts,
                    distancegap=distancegap,anglegap=anglegap,disectparts=disectparts,
                    thumbwidth=thumbwidth,thumbheight=thumbheight,
                    moverotate=moverotate,edgesize=edgesize, vertexsize=vertexsize).dump() 
                #dictionary['thumbnail']=thumbnail
            except Exception as e:
                print("error",e)
                try:
                    shape = conversion.read_stl_file(sourceFileName)
                    conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
                    return(newfilename, False)
                except Exception as e2:
                    print("error",e2)
            return (dictionary, True)        
        if file_extension=="brep" :            
            try:
                shape = conversion.read_brep_file(sourceFileName, as_compound=False)
                #print(shape)
                (_, _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape), includeparts=includeparts,
                    distancegap=distancegap,anglegap=anglegap,disectparts=disectparts,
                    thumbwidth=thumbwidth,thumbheight=thumbheight,
                    moverotate=moverotate,edgesize=edgesize, vertexsize=vertexsize).dump()  
                #dictionary['thumbnail']=thumbnail                             
            except Exception as e:
                print("error",e)
                try:
                    shape = conversion.read_brep_file(sourceFileName, as_compound=True)
                    conversion.write_step_file(shape[0], newfilename, application_protocol="AP242DIS")
                    return(newfilename, False)
                except Exception as e2:
                    print("error",e2)
            return (dictionary, True)
        if file_extension=="dxf" :            
            try:
                shape = OCPImporters.importDXFObjects(sourceFileName, tol=distancegap )
                (_, _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape), includeparts=includeparts,
                    distancegap=distancegap,anglegap=anglegap,disectparts=disectparts,
                    thumbwidth=thumbwidth,thumbheight=thumbheight,
                    moverotate=moverotate,edgesize=edgesize, vertexsize=vertexsize).dump() 
                #dictionary['thumbnail']=thumbnail
            except Exception as e:
                print("error",e)                
            return (dictionary, True)
        return (dictionary, True)
       
    except:
        raise ValueError("File Could not be loaded")  

def splitHierarchyFile(id,key,includeparts,distancegap,anglegap,disectparts,moverotate,edgesize,vertexsize,thumbwidth,thumbheight):
    data =[]
    if id or is_number(id) :
        _, file_extension = os.path.splitext(id)
        sourcefilename = key+id
        #newfilenamewithoutext = "Display/"+Path(id).resolve().stem
        try:
            (data, converted) = exportToHierarchyGLTF(
                sourcefilename,includeparts,distancegap,anglegap,disectparts,moverotate,
                edgesize,vertexsize,thumbwidth,thumbheight)
            if converted:
                return data
            else:   
                if data :         
                    (data, converted) = exportToHierarchyGLTF(
                        data,includeparts,distancegap,anglegap,disectparts,moverotate,
                        edgesize,vertexsize,thumbwidth,thumbheight)
                    return data                        
                else:
                    print(" Unable to split", sourcefilename, "since not supported type", file_extension)               
        except Exception as e:
            print(e," Unable to import", sourcefilename, "and hence not able to split")
            pass
        
    #print(data)
    return data 

@api_view(['GET'])
def FileHierarchySplit(request):
    data = []
    if request.method == 'GET':
        id = request.GET.get('id', None)
        includeparts =convertToBool(request.GET.get('includeparts',"false"),False)
        distancegap = convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
        anglegap = convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
        disectparts = convertToBool(request.GET.get('disectparts',"false"),False)
        moverotate = convertToInt(request.GET.get('moverotate',"0"),0)  
        edgesize = convertToFloat(request.GET.get('edgesize',"0.3"),0.3) 
        vertexsize = convertToFloat(request.GET.get('vertexsize',"0.3"),1.0)
        thumbwidth = convertToFloat(request.GET.get('thumbwidth',"96"),96)
        thumbheight = convertToFloat(request.GET.get('thumbheight',"96"),96)
        #print(includeparts)
        if includeparts:           
            print("I am including minorparts")
        else:
            print("I am excluding minorparts")
        if disectparts:           
            print("I am disecting to get vertices")
        else:            
            print("I am not disecting to get vertices")      
        print("Got request for",id,includeparts,distancegap,anglegap,disectparts,moverotate,edgesize,vertexsize,thumbwidth,thumbheight)
        if moverotate==0:
            if is_number(id) :            
                files = File.objects.filter(id__icontains=id)
                for eachfile in files:
                    data = splitHierarchyFile(
                        eachfile.file.name,"Media/",includeparts,distancegap,anglegap,
                        disectparts,moverotate,edgesize,vertexsize,thumbwidth,thumbheight)
            else:
                id = request.GET.get('file', None)
                if id is not None:
                    data = splitHierarchyFile(
                        id,"Media/",includeparts,distancegap,anglegap,
                        disectparts,moverotate,edgesize,vertexsize,thumbwidth,thumbheight)
    return JsonResponse(data, safe=False)

def get2DTextures(where):
    #from path import path 
    x = [{"id":"No Texture","name":"None"}]
    x.extend([{"id":os.path.split(f)[1],"name":f} for f in glob(where+"*.jpg")])
    return x

def get3DTextures(where):
    #from path import path 
    x = [{"id":"No Texture-px.jpg","name":"None-px.jpg"}]
    x.extend([{"id":os.path.split(f)[1],"name":f} for f in glob(where+"*.jpg")])
    unique_list = []
    for y in x:
        z={"id":y["id"][0:len(y["id"])-7], "name":y["name"][0:len(y["name"])-7]}
        if z not in unique_list:
            unique_list.append(z)
    return unique_list

@api_view(['GET'])
def FileGetTextures(request):
    data = []
    if request.method == 'GET':
        my2textures = get2DTextures("Media/2D/")        
        my3textures = get3DTextures("Media/3D/")
        data = {"textures2D":my2textures,"textures3D":my3textures}
    return JsonResponse(data, safe=False)

@api_view(['GET'])
def FileGetFiles(request):
    files = []
    if request.method == 'GET':
        files = File.objects.all()        
        id = request.GET.get('id', None)
        if id is not None:
            files = files.filter(id__icontains=id)  
    files_list = [ {"id":afile.id,"file":afile.file.path,"filename":afile.filename} for afile in files ]
    #print(files_list)
    return JsonResponse(files_list, safe=False)

@api_view(['GET'])
def FileGetMinimumDistance(request):
    data = []
    if request.method == 'GET':        
        xmove = convertToFloat(request.GET.get('xmove',"0.0"),0.0)
        ymove = convertToFloat(request.GET.get('ymove',"0.0"),0.0)
        zmove = convertToFloat(request.GET.get('zmove',"0.0"),0.0)
        xrotate = convertToFloat(request.GET.get('xrotate',"0.0"),0.0)
        yrotate = convertToFloat(request.GET.get('yrotate',"0.0"),0.0)
        zrotate = convertToFloat(request.GET.get('zrotate',"0.0"),0.0)
        fname = request.GET.get('fname',"")
        sname = request.GET.get('sname',"")
        moverotate = convertToInt(request.GET.get('moverotate',"0"),0)              
        print("Got request for",xmove,ymove,zmove,xrotate,yrotate,zrotate,moverotate,fname,sname)
        if moverotate:
            (distance, points1, points2), coplaner, parallel, normal, opposite, concentric, coradial, angle = findMinimumDistance(
                xmove,ymove,zmove,xrotate,yrotate,zrotate,moverotate,fname,sname)
            #print(distance,points1,points2)
            data = {
                "distance":distance,
                "points1":points1,
                "points2":points2,
                "coplaner":coplaner,
                "parallel":parallel,
                "normal": normal,
                "opposite": opposite, 
                "concentric":concentric,
                "coradial": coradial,
                "angle" : angle
            }
            #print(data)        
    return JsonResponse(data, safe=False)

def findMates(firstshell,secondshell):
    
    coplaner = "unknown"
    parallel = "unknown"
    normal = "unknown"
    opposite = "unknown"
    concentric = "unknown"
    coradial = "unknwon"  
    angle = "unknown"   
    if firstshell and secondshell:
        firstEntity = recognize_entity(firstshell)       
        secondEntity = recognize_entity(secondshell)
        firstAxis =  firstEntity["position"]
        secondAxis = secondEntity["position"]
        if(firstAxis and secondAxis and (firstEntity['type']==secondEntity['type'])):               
            coplaner = firstAxis.IsCoplanar (secondAxis, 0.1, 0.5)
            firstDir = firstAxis.Direction()
            secondDir = secondAxis.Direction()
            parallel = firstDir.IsParallel(secondDir, 0.5)
            normal = firstDir.IsNormal(secondDir, 0.5)
            opposite = firstDir.IsOpposite(secondDir, 0.5)
            concentric = (firstEntity["center"]==secondEntity["center"])
            if ( ((firstEntity["kind"]=="Sphere") or (firstEntity["kind"]=="Cylinder") or\
                (firstEntity["kind"]=="Circle") or (firstEntity["kind"]=="Cone") ) and \
                (firstEntity["kind"]==secondEntity["kind"])): 
                coradial = (firstEntity["radius"] == secondEntity["radius"]) and concentric
            else:
                coradial = False  
            angle = firstDir.Angle(secondDir)         
           
        return firstEntity["kind"], secondEntity["kind"], coplaner, parallel, normal, opposite, concentric, coradial, angle


@api_view(['GET', 'POST'])
def FileGetShapeInfo(request):
    data = []
    if request.method == 'GET':       
        sname = request.GET.get('fname',"")         
        if sname=="":
            steps = request.GET.get('steps',"")   
            fnames=steps.split(",")
            start = convertToInt(request.GET.get('start',"0"),0)
        else:
            fnames=[sname]
            start=0
        structArray=[]
        thisshell=[]
        #mateCollection=[]
        for index in range(len(fnames)):

            fname = fnames[index]        
            #print("Got request for",fname,index,start)
            if fname:
                try:
                    with open("Display/"+fname+".pickle", 'rb') as f:
                        #print("storing to",index)
                        thisshell.append(pickle.load(f))
                        #print("stored to",index)
                        data = []
                        if index >=start :
                            dumpTopologyStructures(thisshell[index],level=0,parentId=[None],returnStructure=data)
                            mateArray=[]
                            for mateindex in range(index):
                                mymates = findMates(thisshell[mateindex],thisshell[index])
                                mateArray.append((mymates))
                            structArray.append((data,(mateArray)))                            
                except Exception as e:
                    print("Error while loading",fname,e)
    elif request.method == 'POST':
        tree = request.data['tree']
        #print(tree)
        structArray = json.loads(tree)
        mycount = 0
        for mydata in structArray:
            mycount = mycount + 1
            #print(mycount, mydata)              
                   
    return JsonResponse(structArray, safe=False)

def getFacesDimensions(aShape):
    faces_dict = {}
    edges_dict = {}
    vertices_dict = {}
    dumpTopologyFacesEdgesVertices(aShape,faces_dict,edges_dict,vertices_dict)
    face_dimensions_dict = {}
    for hash_solidface, solidface in faces_dict.items():
        fill, dir, facetype = recognize_direction(solidface)        
        face_dimensions_dict[hash_solidface] = (solidface,get_bounding_details(solidface),fill,dir,facetype)
            
    #for hash_solidface, (solidface, boundingitems, face) in face_dimensions_dict.items():
    #    print(hash_solidface, solidface, boundingitems, face )
    #print(faces_dict, edges_dict, vertices_dict )
    return face_dimensions_dict, edges_dict, vertices_dict

def stackableDictonary(outputShapes, distancegap, tol = 0.1):
    dimension, _ = outputShapes
    xmin, ymin, _, xmax, ymax, _ = dimension 
    fullstack  = getPartStackablePositions(outputShapes,distancegap,0)
    myTopFaces = fullstack["top"]
    topRightCount = 0
    topLeftCount = 0
    topFrontCount  = 0
    topBackCount = 0
    totalCount = 0
    #print("Length",len(myTopFaces))
    for oneFace in myTopFaces:
        #print(oneFace)
        if(oneFace["face"] != "No Face") and (oneFace["depth"]==0):
            faces_min, faces_max = oneFace["dimension"]
            xmins, ymins, _ = faces_min
            xmaxs, ymaxs, _ = faces_max 
            if ( ( xmins-xmin ) < tol ) and ((xmaxs-xmax)>tol) :
                topLeftCount+=1                
            if( ( ymins-ymin ) < tol ) and ((ymaxs-ymax)>tol):
                topFrontCount+=1               
            if ( ( xmax-xmaxs ) < tol ) and ((xmin-xmins)>tol) :
                topRightCount+=1               
            if( ( ymax-ymaxs ) < tol) and ((ymin-ymins)>tol) :
                topBackCount+=1
            totalCount+=1
    #print("TotalCount",totalCount)          
    if(totalCount > 2): 
        
        return dimension, fullstack, None
    else :
        if(totalCount<=1):  
                       
            return dimension, getPartStackablePositions(outputShapes,distancegap,tol), fullstack
        else:            
            if (totalCount==2) and (( (topLeftCount==1) and ( (topBackCount==1) or (topFrontCount==1)) ) or 
                (( (topRightCount==1) and ( (topBackCount==1) or (topFrontCount==1))) ) ):
                
                return dimension, getPartStackablePositions(outputShapes,distancegap,tol), fullstack
            else:
                 
                return dimension, fullstack, None
   

def movingParameters(dimension, fullstack, tol = 0.1):    
    xmin, ymin, zmin, xmax, ymax, zmax = dimension    
    myTopFaces = fullstack["top"]    
    totalCount = 0
    xmove = 0
    ymove = 0 
    for oneFace in myTopFaces:
        if(oneFace["face"] != "No Face") and (oneFace["depth"]==0):
            faces_min, faces_max = oneFace["dimension"]
            xmins, ymins, _ = faces_min
            xmaxs, ymaxs, _ = faces_max 
            if ( ( xmins-xmin ) < tol ) and ((xmaxs-xmax)>tol) :
                xmove= xmins-xmin                
            if( ( ymins-ymin ) < tol ) and ((ymaxs-ymax)>tol):
                ymove = ymins-ymin               
            if ( ( xmax-xmaxs ) < tol ) and ((xmin-xmins)>tol) :
                xmove=xmaxs-xmax               
            if( ( ymax-ymaxs ) < tol) and ((ymin-ymins)>tol) :
                ymove = ymaxs-ymax 
            totalCount+=1
    #print(totalCount)          
    if(totalCount == 0):         
        return 0,0,zmax-zmin     
    
    return xmove,ymove,zmax-zmin                 

def duplicateShapes(shape,dimension,depthable,stackable):  
    xmin, ymin, zmin, xmax, ymax, zmax = dimension 
    HalfDepth = (zmax-zmin)*0.5
    noOfDuplicates=0
    if(HalfDepth==0):
        noOfDuplicates = 2
    else:
        noOfDuplicates = round(min(xmax-xmin,ymax-ymin) / HalfDepth)
    if noOfDuplicates < 1:
        noOfDuplicates = 1 
    if noOfDuplicates > 1:               
        xmove,ymove,zmove=0,0,zmax-zmin
        if depthable != None:
            xmove, ymove, zmove = movingParameters(dimension, depthable, 0.1) 
            print ("Dimension", dimension, xmove, ymove, zmove)
            depth = 0
            for oneFace in stackable['top']:
                if( oneFace["depth"] != 0 ):
                    depth = oneFace["depth"]
            if depth < zmove:
                zmove -= depth        
            bottomdepth = 0
            for oneFace in stackable['bottom']:
                if( oneFace["depth"] != 0 ):
                    bottomdepth = oneFace["depth"]
            if bottomdepth > depth:
                if (bottomdepth < (zmove+depth)):
                    zmove += (depth-bottomdepth)
            
            
        distance = 1e10
        prevdistance = 0
        while distance > 1e-2:
            AnotherShape=translate_shp(shape[0],xmove, ymove, zmove, True)
            (wdistance, distance, points1, points2) = minimum_z_distance(shape[0],AnotherShape)
            
            if ( (prevdistance-distance) >= (0.4*distance/1.4)):
                zmove -= distance
                prevdistance = distance * 1.4
                print("Dmove1", zmove, distance, wdistance, points1, points2, prevdistance)
            else:
                #print("Zmove", zmove, distance, points1, points2)
                zmove -= distance/1.4        
                prevdistance = distance
                print("Dmove2", zmove, distance, points1, points2, prevdistance)
        
        stackability = (len(points1) >2) and (len(points2) >2)       
        print("Stackability",len(points1),len(points2),(len(points1) >2) and (len(points2) >2),stackability)
        stackabilityP2 = True
        if stackability:
            maxX = xmin
            minX = xmax
            maxY = ymin
            minY = ymax
            for aPoint in points2:
                if(aPoint[0] > maxX):
                    maxX = aPoint[0]
                if(aPoint[0] < minX):
                    minX = aPoint[0]
                if(aPoint[1] > maxY):
                    maxY = aPoint[1]
                if(aPoint[1] < minY):
                    minY = aPoint[1]
            if( (maxX-minX)*3 < (xmax-xmin) ) or ((maxY-minY)*3 < (ymax-ymin)) :
                print("P2",maxX,minX,xmax,xmin,maxY,minY,ymax,ymin)
                stackabilityP2 = False
        stackabilityP1 = True
        if stackability:
            maxX = xmin
            minX = xmax
            maxY = ymin
            minY = ymax
            for aPoint in points1:
                if(aPoint[0] > maxX):
                    maxX = aPoint[0]
                if(aPoint[0] < minX):
                    minX = aPoint[0]
                if(aPoint[1] > maxY):
                    maxY = aPoint[1]
                if(aPoint[1] < minY):
                    minY = aPoint[1]
            if( (maxX-minX)*5 < (xmax-xmin) ) and ((maxY-minY)*5 < (ymax-ymin)) :
                print("P1",maxX,minX,xmax,xmin,maxY,minY,ymax,ymin)
                stackabilityP1 = False
        

        print("Without reduction", noOfDuplicates,stackability,stackabilityP1,stackabilityP2)
        if ( stackability==False or (stackabilityP2==False and stackabilityP1==False) ) :
            noOfDuplicates = 1
        elif(zmove<=0):
            noOfDuplicates = 2
        else:
            noOfDuplicates = 1+ceil(min(xmax-xmin,ymax-ymin) / (zmove))
        print("With reduction", noOfDuplicates)
        if noOfDuplicates < 1 :
            noOfDuplicates = 1    
        print("After Resetting", noOfDuplicates)
       
    moveArrays=[]
    shapeList =[]
    shapeList.append(shape[0])
    for i in range(1,noOfDuplicates):
        print(i,noOfDuplicates, xmove*i, ymove*i, zmove*i )
        AnotherShape=translate_shp(shape[0],xmove*i, ymove*i, zmove*i, True)
        shapeList.append(AnotherShape)
        moveArrays.append((xmove*i, ymove*i, zmove*i))
    return shapeList, noOfDuplicates, moveArrays

def exportToPartGLTF(sourceFileName,distancegap,anglegap):#,thumbwidth,thumbheight):
    """
    Imports a file based on the type (STEP, IGES, BREP, STL)    
    """
    #Now read and return the shape
   
    try:
        
        
        dictionary={}
        _, file_extension = os.path.splitext(sourceFileName)
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        newfilenamewithoutext = "Display/"+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        outputShapes={}
        if file_extension=="stp" or file_extension=="step" :          
            
            try:
                shape = conversion.read_step_file(sourceFileName, as_compound=True)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0, edgesize=0, vertexsize=0).dump()
                """ dimension, _ = outputShapes
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump() 
                else:
                     if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                        shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                        (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                        thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()  
                #print(outputShapes)
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shapeList),includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}] """
                #dictionary['thumbnail']=thumbnail

                #shape = conversion.read_step_file(sourceFileName, as_compound=False)  
                #print("I could split")              
                #(_,  outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                #    filename=sourceFileName,shapeslist=shape,distancegap=distancegap,anglegap=anglegap).dump() 
                #faces_dict, _, _ =  getFacesDimensions(shape[0])  
                #print(outputShapes)                
                #dictionary["stackable"] = [getPartStackablePositions(outputShapes,distancegap,anglegap)]
                #print(dictionary)              
                
            except Exception as e:
                print("error",e)
                
            #return dictionary           
            
        if file_extension=="stl" :            
            try:
                shape = conversion.read_stl_file(sourceFileName, as_compound=True)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()
                """ dimension, _ = outputShapes
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0, edgesize=0, vertexsize=0).dump() 
                else:
                     if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                        shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                        (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                        thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump() 
                #print(outputShapes)
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shapeList),includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}]  """ 
                #dictionary['thumbnail']=thumbnail             
                
            except Exception as e:
                print("error",e)
                
            #return (dictionary,outputShapes) 
        if file_extension=="igs" or file_extension=="iges" :
            try:               
                shape = conversion.read_iges_file(sourceFileName, as_compound=True)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()
                """ dimension, _ = outputShapes
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0, edgesize=0, vertexsize=0).dump() 
                else:
                     if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                        shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                        (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                        thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()  
                #print(outputShapes)
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shapeList),includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}] """ 
                #dictionary['thumbnail']=thumbnail          
                
            except Exception as e:
                print("error",e)
                
            #return dictionary
        if file_extension=="brep" :            
            try:
                shape = conversion.read_brep_file(sourceFileName, as_compound=True)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0, edgesize=0, vertexsize=0).dump()
                """ dimension, _ = outputShapes
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0, edgesize=0, vertexsize=0).dump() 
                else:
                     if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                        shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                        (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                        thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump() 
                #print(outputShapes)
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shapeList),includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}]  """ 
                #dictionary['thumbnail']=thumbnail         
                
            except Exception as e:
                print("error",e)
                
            #return dictionary 
        if file_extension=="dxf" :            
            try:
                shape = OCPImporters.importDXFObjects(sourceFileName, tol=distancegap )
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),ascompound=True,
                    distancegap=distancegap,anglegap=anglegap).dump() 
                #faces_dict, edges_dict, vertices_dict =  getFacesDimensions(shape[0])                
                """ dimension, _ = outputShapes
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump() 
                else:
                     if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                        shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                        (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                        thumbwidth=0,thumbheight=0, edgesize=0, vertexsize=0).dump() 
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shapeList),includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}]  """   
                #dictionary['thumbnail']=thumbnail       
                
            except Exception as e:
                print("error",e)
                
            #return dictionary 
        try:
            dimension, _ = outputShapes
            xmin, ymin, zmin, xmax, ymax, zmax = dimension 
            if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump() 
            else:
                if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()  
            #print(outputShapes)
            dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
            shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
            (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                filename=sourceFileName,shapeslist=createShapeArray(shapeList),includeparts=False,distancegap=distancegap,
                anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                edgesize=0, vertexsize=0, animations=moveArrays).dump()
            dictionary["stackable"] = [{"count":replications,"stack":stackable}]
        except Exception as e:
            print("error",e)      
       
        try:
            stackfile = "Display/"+dictionary["store"]+".stack"
            print("Writing,",stackfile)
            with open(stackfile, 'w') as fh:
                fh.write(json.dumps(dictionary["stackable"], sort_keys=True, indent=2 ))
        except Exception as e:
            print("Error while writing stackfile",e)      
        return dictionary
       
    except:
        raise ValueError("File Could not be loaded")   

@api_view(['GET'])
def FileGetStackablePositions(request):
    data = []
    if request.method == 'GET':
        id = request.GET.get('id', None)
        distancegap = convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
        anglegap = convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
        #thumbwidth = convertToFloat(request.GET.get('thumbwidth',"96"),96)
        #thumbheight = convertToFloat(request.GET.get('thumbheight',"96"),96)
        if is_number(id) :            
            files = File.objects.filter(id__icontains=id)
            for eachfile in files:               
                data = exportToPartGLTF("Media/"+eachfile.file.name,distancegap,anglegap)#,thumbwidth,thumbheight)
        else:
            id = request.GET.get('file', None)
            if id is not None:
                data = exportToPartGLTF("Media/"+id,distancegap,anglegap)#,thumbwidth,thumbheight)
    return JsonResponse(data, safe=False) 

def swap(a, b):
    return b, a

def isOuterToPart(aDimension1,aPart1,aDimension2,aPart2,tolerance=0.2,debugMe=False):
   
    xmin2, ymin2, zmin2, xmax2, ymax2, zmax2 = aDimension2
    xl2, yl2, zl2 = tolerance, tolerance, tolerance
    corner2 = gp_Pnt(xmin2-xl2, ymin2-yl2, zmin2-zl2)
    if debugMe:
        print(((xmin2-xl2, ymin2-yl2, zmin2-zl2),(xmax2-xmin2)+xl2*2,(ymax2-ymin2)+yl2*2,(zmax2-zmin2)+zl2*2),aDimension2,aDimension1)
    mybox2 = BRepPrimAPI_MakeBox(corner2,(xmax2-xmin2)+xl2*2,(ymax2-ymin2)+yl2*2,(zmax2-zmin2)+zl2*2).Shape()
    myshape2 = BRepAlgoAPI_Common(mybox2,aPart1).Shape()
    myshapeDimension2 = get_bounding_details(myshape2)
    if myshapeDimension2 == (0, 0, 0, 0, 0, 0) :
        return (False, (0, 0, 0, 0, 0, 0))
    else:
        if debugMe:
            print("From Part",myshapeDimension2,aDimension1,aDimension2)
        corner3 = gp_Pnt(xmin2-(xl2*2), ymin2-(yl2*2), zmin2-(zl2*2))
        mybox3 = BRepPrimAPI_MakeBox(corner3,(xmax2-xmin2)+xl2*4,(ymax2-ymin2)+yl2*4,(zmax2-zmin2)+zl2*4).Shape()
        myshape3 = BRepAlgoAPI_Common(mybox3,aPart1).Shape()
        myshapeDimension3 = get_bounding_details(myshape3)
        xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension3        
        xmin1, ymin1, zmin1, xmax1, ymax1, zmax1 = myshapeDimension2
        if debugMe:
            print("Before cheking",\
            (xmin2-xl2, ymin2-yl2, zmin2-zl2),(xmin2-(xl2*2), ymin2-(yl2*2), zmin2-(zl2*2)),\
                aDimension1,aDimension2,myshapeDimension2,myshapeDimension3,\
                    get_bounding_details(aPart1),get_bounding_details(aPart2))
        """  if ( ((xmin1==xmin3) and (xmax1==xmax3) and (ymin1==ymin3) and (ymax1==ymax3)) or
            ((ymin1==ymin3) and (ymax1==ymax3) and (zmin1==zmin3) and (zmax1==zmax3)) or
            ((zmin1==zmin3) and (zmax1==zmax3) and (xmin1==xmin3) and (xmax1==xmax3)) ): """
        if ( ((xmin1==xmin3) and (xmax1==xmax3) ) or
            ((ymin1==ymin3) and (ymax1==ymax3)  ) or
            ((zmin1==zmin3) and (zmax1==zmax3)  ) ):
            corner1 = gp_Pnt(xmin1, ymin1, zmin1)
            mybox1 = BRepPrimAPI_MakeBox(corner1,xmax1-xmin1,ymax1-ymin1,zmax1-zmin1).Shape()
            myshape1 = BRepAlgoAPI_Common(mybox1,aPart2).Shape()
            myshapeDimension1 = get_bounding_details(myshape1)
            if debugMe:
                print("after cheking",aDimension1,aDimension2,myshapeDimension1,myshapeDimension2,myshapeDimension3)
            if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                return (False, (0, 0, 0, 0, 0, 0))
            else:
                return (isOuter(myshapeDimension2,myshapeDimension1,debugMe), myshapeDimension1)
        else:
            return (False, (0, 0, 0, 0, 0, 0))

def isOuter(aDimension1, aDimension2, debugMe=False):
    xmin1, ymin1, zmin1, xmax1, ymax1, zmax1 = aDimension1
    xmin2, ymin2, zmin2, xmax2, ymax2, zmax2 = aDimension2
    #print(aDimension1,aDimension2)
    if  ( ( (xmin1<xmin2) and (xmax1>xmax2) and  
        (ymin1<ymin2) and (ymax1>ymax2) and
        (zmin1>=zmin2) and (zmax1<=zmax2) ) or
        ( (ymin1<ymin2) and (ymax1>ymax2) and 
        (zmin1<zmin2) and (zmax1>zmax2) and 
        (xmin1>=xmin2) and (xmax1<=xmax2) ) or
        ( (zmin1<zmin2) and (zmax1>zmax2) and
        (xmin1<xmin2) and (xmax1>xmax2) and
        (ymin1>=ymin2) and (ymax1<=ymax2) ) ):
        if debugMe:
            print("I am outer",(aDimension1,aDimension2))
        return True
    if debugMe:
        print("I am Not outer",(aDimension1,aDimension2))
    return False

def isInner(aDimension1, aDimension2):
    xmin1, ymin1, zmin1, xmax1, ymax1, zmax1 = aDimension1
    xmin2, ymin2, zmin2, xmax2, ymax2, zmax2 = aDimension2
    if  ( (xmin1>xmin2) and (xmax1<xmax2) and  
        (ymin1>ymin2) and (ymax1<ymax2) and
        (zmin1>zmin2) and (zmax1<zmax2) ):
        return True
    return False

def isTopFrontLefter(aDimension1, aDimension2):    
    xmin1, ymin1, zmin1, xmax1, ymax1, zmax1 = aDimension1
    xmin2, ymin2, zmin2, xmax2, ymax2, zmax2 = aDimension2
    if ( (zmax1 > zmax2) or
        ((zmax1==zmax2) and (ymin1 < ymin2)) or
        ((zmax1==zmax2) and (ymin1 == ymin2) and (xmin1 < xmin2)) ):
        return True
    return False

def isTopCenter(aDimension1, aDimension2,approxDirection):    
    xmin1, ymin1, zmin1, xmax1, ymax1, zmax1 = aDimension1
    xmin2, ymin2, zmin2, xmax2, ymax2, zmax2 = aDimension2
    xc1, yc1, zc1 = (xmin1+xmax1)/2, (ymin1+ymax1)/2, (zmin1+zmax1)/2
    xc2, yc2, zc2 = (xmin2+xmax2)/2, (ymin2+ymax2)/2, (zmin2+zmax2)/2
    ax,ay,az=approxDirection
    if ( (az==1) or (ax==0 and ay==0 and az==0) ) :
        if ( (zc1 > zc2) or
            ((zc1==zc2) and (yc1 > yc2)) or
            ((zc1==zc2) and (yc1 == yc2) and (xc1 > xc2)) ):
            return True
        else:
            return False
    if ( (az==-1) or (ax==0 and ay==0 and az==0) ) :
        if ( (zc1 < zc2) or
            ((zc1==zc2) and (yc1 > yc2)) or
            ((zc1==zc2) and (yc1 == yc2) and (xc1 > xc2)) ):
            return True
        else:
            return False
    if ( ax==1 ) :
        if ( (xc1 > xc2) or
            ((xc1==xc2) and (zc1 > zc2)) or
            ((xc1==xc2) and (zc1 == zc2) and (yc1 > yc2)) ):
            return True
        else:
            return False
    if ( ax==-1 ) :
        if ( (xc1 < xc2) or
            ((xc1==xc2) and (zc1 > zc2)) or
            ((xc1==xc2) and (zc1 == zc2) and (yc1 > yc2)) ):
            return True
        else:
            return False
    if ( ay==1 ) :
        if ( (yc1 > yc2) or
            ((yc1==yc2) and (xc1 > xc2)) or
            ((yc1==yc2) and (xc1 == xc2) and (zc1 > zc2)) ):
            return True
        else:
            return False   
    if ( ay==-1 ) :
        if ( (yc1 < yc2) or
            ((yc1==yc2) and (xc1 > xc2)) or
            ((yc1==yc2) and (xc1 == xc2) and (zc1 > zc2)) ):
            return True
        else:
            return False
    if ( (xc1 > xc2) or
        ((xc1==xc2) and (zc1 < zc2)) or
        ((xc1==xc2) and (zc1 == zc2) and (yc1 < yc2)) ):
        return True
    return False 

def isEnclosed(aShape1,aDimension1,aShape2,aDimension2,debugMe=False):
    xmin1, ymin1, zmin1, xmax1, ymax1, zmax1 = aDimension1
    xmin2, ymin2, zmin2, xmax2, ymax2, zmax2 = aDimension2
    DefaultReturn = (False, (0, 0, 0, 0, 0, 0), (0,0,0))
    if ( ( (xmin1 >= xmin2) and (xmax2 <= xmax1) ) or
        ( (xmin1 <= xmin2) and (xmax2 >= xmax1) ) or
        ( (ymin1 >= ymin2) and (ymax2 <= ymax1) ) or
        ( (ymin1 <= ymin2) and (ymax2 >= ymax1) ) or
        ( (zmin1 >= zmin2) and (zmax2 <= zmax1) ) or
        ( (zmin1 <= zmin2) and (zmax2 >= zmax1) ) ):
        if debugMe:
            print("I here not satisfied",aDimension1,aDimension2)
            print("( (xmin1 >= xmin2) and (xmax2 <= xmax1) )",( (xmin1 >= xmin2) and (xmax2 <= xmax1) ))
            print("( (xmin1 <= xmin2) and (xmax2 >= xmax1) )",( (xmin1 <= xmin2) and (xmax2 >= xmax1) ))
            print("( (ymin1 >= ymin2) and (ymax2 <= ymax1) )",( (ymin1 >= ymin2) and (ymax2 <= ymax1) ))
            print("( (ymin1 <= ymin2) and (ymax2 >= ymax1) )",( (ymin1 <= ymin2) and (ymax2 >= ymax1) ))
            print("( (zmin1 >= zmin2) and (zmax2 <= zmax1) )",( (zmin1 >= zmin2) and (zmax2 <= zmax1) ))
            print("( (zmin1 <= zmin2) and (zmax2 >= zmax1) )",( (zmin1 <= zmin2) and (zmax2 >= zmax1) ))
        return DefaultReturn     
    corner2 = gp_Pnt(xmin2, ymin2, zmin2)
    if debugMe:
        print("getting box2",((xmin2, ymin2, zmin2),(xmax2-xmin2),(ymax2-ymin2),(zmax2-zmin2)),aDimension2,aDimension1)
    if((xmax2==xmin2) or (ymax2==ymin2) or (zmax2==zmin2) ):
        return DefaultReturn 
    mybox2 = BRepPrimAPI_MakeBox(corner2,(xmax2-xmin2),(ymax2-ymin2),(zmax2-zmin2)).Shape()
       
    corner1 = gp_Pnt(xmin1, ymin1, zmin1)
    if debugMe:
        print("getting box1",((xmin1, ymin1, zmin1),(xmax1-xmin1),(ymax1-ymin1),(zmax1-zmin1)),aDimension2,aDimension1)
    if((xmax1==xmin1) or (ymax1==ymin1) or (zmax1==zmin1) ):
        return DefaultReturn
    mybox1 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymax1-ymin1),(zmax1-zmin1)).Shape()
    myshapeCommon = BRepAlgoAPI_Common(mybox2,mybox1).Shape()
    myshapeDimension = get_bounding_details(myshapeCommon)
    if myshapeDimension == (0, 0, 0, 0, 0, 0) :
        if debugMe:
            print("Nothing common")
        return DefaultReturn
    else:
        if debugMe:
            print("From Cube",myshapeDimension,aDimension1,aDimension2)
        myshapeCommon1 = BRepAlgoAPI_Common(aShape1,myshapeCommon).Shape()
        myshapeDimension1 = get_bounding_details(myshapeCommon1)
        if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("Nothing common with Enclosed Part")
            return (True, myshapeDimension,(0,0,0))
        xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
        myshapeCommon2 = BRepAlgoAPI_Common(aShape2,myshapeCommon).Shape()
        myshapeDimension2 = get_bounding_details(myshapeCommon2)
        xmin4, ymin4, zmin4, xmax4, ymax4, zmax4 = myshapeDimension2
       
        if myshapeDimension2 == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("Nothing common with Inner Part")
            return (True, myshapeDimension,(0,0,0))  
        xminC, yminC, zminC, xmaxC, ymaxC, zmaxC = myshapeDimension      
        if ( ((xmin4>xmin3) and (xmax4<xmax3) and
            (ymin4>ymin3) and (ymax4<ymax3) and 
            (zmin4==zmin3) and (zmax4==zmax3)) ):
            if debugMe:
                print("I am enclosed in Z direction",myshapeDimension)            
            corner3 = gp_Pnt(xmin2, ymin2, zmaxC)
            if debugMe:
                print("getting box5",((xmin2, ymin2, zmaxC),(xmax2-xmin2),(ymax2-ymin2),(zmax2-zmaxC)),aDimension2,aDimension1)
            if((xmax2==xmin2) or (ymax2==ymin2) or (zmax2==zmaxC) ):
                return (True, myshapeDimension,(0,0,1)) 
            mybox5 = BRepPrimAPI_MakeBox(corner3,(xmax2-xmin2),(ymax2-ymin2),(zmax2-zmaxC)).Shape()
            myshapeCommon5 = BRepAlgoAPI_Common(aShape2,mybox5).Shape()            
            myshapeDimension5 = get_bounding_details(myshapeCommon5)
            if myshapeDimension5 == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Nothing common From Top to Enclosure Part")
                return (True, myshapeDimension,(0,0,1)) 
            else:
                xmin5, ymin5, zmin5, xmax5, ymax5, zmax5 = myshapeDimension5
                if ( ((xmin5>xmin3) and (xmax5<xmax3) and (ymin5>ymin3) and (ymax5<ymax3) ) ) : 
                    return (True, myshapeDimension,(0,0,1)) 
            corner4 = gp_Pnt(xmin2, ymin2, zmin2)
            if debugMe:
                print("getting box6",((xmin2, ymin2, zmin2),(xmax2-xmin2),(ymax2-ymin2),(zminC-zmin2)),aDimension2,aDimension1)
            if((xmax2==xmin2) or (ymax2==ymin2) or (zminC==zmin2) ):
                return (True, myshapeDimension,(0,0,-1)) 
            mybox6 = BRepPrimAPI_MakeBox(corner4,(xmax2-xmin2),(ymax2-ymin2),(zminC-zmin2)).Shape()
            myshapeCommon6 = BRepAlgoAPI_Common(aShape2,mybox6).Shape()
            myshapeDimension6 = get_bounding_details(myshapeCommon6)
            if myshapeDimension6 == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Nothing common From Bottom to Enclosure Part")
                return (True, myshapeDimension,(0,0,-1)) 
            else:
                xmin6, ymin6, zmin6, xmax6, ymax6, zmax6 = myshapeDimension6
                if ( ((xmin6>xmin3) and (xmax6<xmax3) and (ymin6>ymin3) and (ymax6<ymax3) ) ) : 
                    return (True, myshapeDimension,(0,0,-1)) 
            return (False, myshapeDimension,(0,0,1))
        if ( ((ymin4>ymin3) and (ymax4<ymax3) and
            (zmin4>zmin3) and (zmax4<zmax3) and 
            (xmin4==xmin3) and (xmax4==xmax3)) ):
            if debugMe:
                print("I am enclosed in X direction",myshapeDimension)            
            corner3 = gp_Pnt(xmaxC, ymin2, zmin2)
            if debugMe:
                print("getting box5",((xmaxC, ymin2, zmin2),(xmax2-xmaxC),(ymax2-ymin2),(zmax2-zmin2)),aDimension2,aDimension1)
            if((xmax2==xmaxC) or (ymax2==ymin2) or (zmax2==zmin2) ):
                return (True, myshapeDimension,(1,0,0)) 
            mybox5 = BRepPrimAPI_MakeBox(corner3,(xmax2-xmaxC),(ymax2-ymin2),(zmax2-zmin2)).Shape()
            myshapeCommon5 = BRepAlgoAPI_Common(aShape2,mybox5).Shape()            
            myshapeDimension5 = get_bounding_details(myshapeCommon5)
            if myshapeDimension5 == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Nothing common From Left to Enclosure Part")
                return (True, myshapeDimension,(1,0,0)) 
            else:
                xmin5, ymin5, zmin5, xmax5, ymax5, zmax5 = myshapeDimension5
                if ( ((ymin5>ymin3) and (ymax5<ymax3) and (zmin5>zmin3) and (zmax5<zmax3) ) ) : 
                    return (True, myshapeDimension,(1,0,0)) 
            corner4 = gp_Pnt(xmin2, ymin2, zmin2)
            if debugMe:
                print("getting box6",((xmin2, ymin2, zmin2),(xminC-xmin2),(ymax2-ymin2),(zmax2-zmin2)),aDimension2,aDimension1)
            if((xminC==xmin2) or (ymax2==ymin2) or (zmax2==zmin2) ):
                return (True, myshapeDimension,(-1,0,0)) 
            mybox6 = BRepPrimAPI_MakeBox(corner4,(xminC-xmin2),(ymax2-ymin2),(zmax2-zmin2)).Shape()
            myshapeCommon6 = BRepAlgoAPI_Common(aShape2,mybox6).Shape()
            myshapeDimension6 = get_bounding_details(myshapeCommon6)
            if myshapeDimension6 == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Nothing common From Right to Enclosure Part")
                return (True, myshapeDimension,(-1,0,0)) 
            else:
                xmin6, ymin6, zmin6, xmax6, ymax6, zmax6 = myshapeDimension6
                if ( ((ymin6>ymin3) and (ymax6<ymax3) and (zmin6>zmin3) and (zmax6<zmax3) ) ) : 
                    return (True, myshapeDimension,(-1,0,0)) 
            return (False, myshapeDimension,(1,0,0))
        if ( ((zmin4>zmin3) and (zmax4<zmax3) and
            (xmin4>xmin3) and (xmax4<xmax3) and 
            (ymin4==ymin3) and (ymax4==ymax3)) ):
            if debugMe:
                print("I am enclosed in Y direction",myshapeDimension)            
            corner3 = gp_Pnt(xmin2, ymaxC, zmin2)
            if debugMe:
                print("getting box5",((xmin2, ymaxC, zmin2),(xmax2-xmin2),(ymax2-ymaxC),(zmax2-zmin2)),aDimension2,aDimension1)
            if((xmax2==xmin2) or (ymax2==ymaxC) or (zmax2==zmin2) ):
                return (True, myshapeDimension,(0,1,0)) 
            mybox5 = BRepPrimAPI_MakeBox(corner3,(xmax2-xmin2),(ymax2-ymaxC),(zmax2-zmin2)).Shape()
            myshapeCommon5 = BRepAlgoAPI_Common(aShape2,mybox5).Shape()            
            myshapeDimension5 = get_bounding_details(myshapeCommon5)
            if myshapeDimension5 == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Nothing common From Back to Enclosure Part")
                return (True, myshapeDimension,(0,1,0)) 
            else:
                xmin5, ymin5, zmin5, xmax5, ymax5, zmax5 = myshapeDimension5
                if ( ((zmin5>zmin3) and (zmax5<zmax3) and (xmin5>xmin3) and (xmax5<xmax3) ) ) : 
                    return (True, myshapeDimension,(0,1,0)) 
            corner4 = gp_Pnt(xmin2, ymin2, zmin2)
            if debugMe:
                print("getting box6",((xmin2, ymin2, zmin2),(xmax2-xmin2),(yminC-ymin2),(zmax2-zmin2)),aDimension2,aDimension1)
            if((xmax2==xmin2) or (yminC==ymin2) or (zmax2==zmin2) ):
                return (True, myshapeDimension,(0,-1,0)) 
            mybox6 = BRepPrimAPI_MakeBox(corner4,(xmax2-xmin2),(yminC-ymin2),(zmax2-zmin2)).Shape()
            myshapeCommon6 = BRepAlgoAPI_Common(aShape2,mybox6).Shape()
            myshapeDimension6 = get_bounding_details(myshapeCommon6)
            if myshapeDimension6 == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Nothing common From Front to Enclosure Part")
                return (True, myshapeDimension,(0,-1,0)) 
            else:
                xmin6, ymin6, zmin6, xmax6, ymax6, zmax6 = myshapeDimension6
                if ( ((zmin6>zmin3) and (zmax6<zmax3) and (xmin6>xmin3) and (xmax6<xmax3) ) ) : 
                    return (True, myshapeDimension,(0,-1,0)) 
            return (False, myshapeDimension,(0,1,0))
        
        if debugMe:
            print("I am partially enclosed and hence allowed to check", myshapeDimension)
        return (True, myshapeDimension,(0,0,0))

def isRemovable(aShape1,aDimension1,aShape2,aDimension2,debugMe=False,tol=2.5):
    xmin1, ymin1, zmin1, xmax1, ymax1, zmax1 = aDimension1
    xmin2, ymin2, zmin2, xmax2, ymax2, zmax2 = aDimension2    
    if debugMe:
        print("Checking 1")
        myshapeCommonReturn = None
    else: 
        myshapeCommonReturn = None
    if (zmax2<=(zmax1+tol) and zmax2>=zmax1): #0.2 for tollerance
        if debugMe:
            print("Part is on Top")
        return (True, (0, 0, 0, 0, 0, 0),(0,0,1),myshapeCommonReturn)
    if (zmax2 > (zmax1+tol)):        
        corner1 = gp_Pnt(xmin1, ymin1, zmax1+tol)
        mybox1 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1-tol)).Shape()
        myshapeCommonReturn = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
        myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
        myshapeDimension1 = get_bounding_details_common(myshapeCommon1) 
        if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("Nothing common with Enclosed Part From Top")
            return (True, myshapeDimension1,(0,0,1),myshapeCommonReturn)
        else:
            xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
            if ( ((xmin1<xmin3) and (xmax1>xmax3) and (ymin1<ymin3) and (ymax1>ymax3) ) ) : 
                if debugMe:
                    print("common with Enclosed Part From Top",get_bounding_details(mybox1),\
                        myshapeDimension1,aDimension1,aDimension2,(xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1)) 
                return (True, myshapeDimension1,(0,0,1),myshapeCommonReturn)
            else:
                if debugMe:
                    print("Nothing common with Enclosed Part From Top",get_bounding_details(mybox1),\
                        myshapeDimension1,aDimension1,aDimension2,(xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1)) 
    else:
        if debugMe:
            print("Nothing From Top",zmax1,zmax2,aDimension1,aDimension2) 
    if debugMe:
        print("Checking 2")
    if zmin2==zmin1:
        if debugMe:
            print("Part is on Bottom")
        return (True, (0, 0, 0, 0, 0, 0),(0,0,-1),myshapeCommonReturn)
    if zmin2 < zmin1:        
        corner1 = gp_Pnt(xmin1, ymin1, zmin2)
        mybox1 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymax1-ymin1),(zmin1-zmin2)).Shape()
        myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
        myshapeDimension1 = get_bounding_details(myshapeCommon1) 
        if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("Nothing common with Enclosed Part From Bottom")
            return (True, myshapeDimension1,(0,0,-1),myshapeCommonReturn)
        else:
            xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
            if ( ((xmin1<xmin3) and (xmax1>xmax3) and (ymin1<ymin3) and (ymax1>ymax3) ) ) : 
                return (True, myshapeDimension1,(0,0,-1),myshapeCommonReturn)
            else:
                if debugMe:
                    print("Nothing common with Enclosed Part From Bottom",myshapeDimension1,aDimension1,aDimension2) 
    else:
        if debugMe:
            print("Nothing From Bottom",zmin2,zmin1,aDimension1,aDimension2) 
    if debugMe:
        print("Checking 3")
    if xmax2==xmax1:
        if debugMe:
            print("Part is on Left")
        return (True, (0, 0, 0, 0, 0, 0),(1,0,0),myshapeCommonReturn)
    if xmax2 > xmax1:
        corner1 = gp_Pnt(xmax1, ymin1, zmin1)
        mybox1 = BRepPrimAPI_MakeBox(corner1,(xmax2-xmax1),(ymax1-ymin1),(zmax1-zmin1)).Shape()
        myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
        myshapeDimension1 = get_bounding_details(myshapeCommon1) 
        if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("Nothing common with Enclosed Part From Left")
            return (True, myshapeDimension1,(1,0,0),myshapeCommonReturn)
        else:
            xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
            if ( ((ymin1<ymin3) and (ymax1>ymax3) and (zmin1<zmin3) and (zmax1>zmax3) ) ) : 
                return (True, myshapeDimension1,(1,0,0),myshapeCommonReturn)
            else:
                if debugMe:
                    print("Nothing common with Enclosed Part From Left",myshapeDimension1,aDimension1,aDimension2) 
    else:
        if debugMe:
            print("Nothing From Left",xmax1,xmax2,aDimension1,aDimension2) 
    if debugMe:
        print("Checking 4")
    if xmin2==xmin1:
        if debugMe:
            print("Part is on Right")
        return (True, (0, 0, 0, 0, 0, 0),(-1,0,0),myshapeCommonReturn)
    if xmin2 < xmin1:        
        corner1 = gp_Pnt(xmin2, ymin1, zmin1)
        mybox1 = BRepPrimAPI_MakeBox(corner1,(xmin1-xmin2),(ymax1-ymin1),(zmax1-zmin1)).Shape()
        myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
        myshapeDimension1 = get_bounding_details(myshapeCommon1) 
        if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("Nothing common with Enclosed Part From Right")
            return (True, myshapeDimension1,(-1,0,0),myshapeCommonReturn)
        else:
            xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
            if ( ((ymin1<ymin3) and (ymax1>ymax3) and (zmin1<zmin3) and (zmax1>zmax3) ) ) :
                return (True, myshapeDimension1,(-1,0,0),myshapeCommonReturn)
            else:
                if debugMe:
                    print("Nothing common with Enclosed Part From Right",myshapeDimension1,aDimension1,aDimension2) 
    else:
        if debugMe:
            print("Nothing From Right",xmin1,xmin2,aDimension1,aDimension2) 
    if debugMe:
        print("Checking 5")
    if ymax2==ymax1:
        if debugMe:
            print("Part is on Back")
        return (True, (0, 0, 0, 0, 0, 0),(0,1,0),myshapeCommonReturn)
    if ymax2 > ymax1:
        corner1 = gp_Pnt(xmin1, ymax1, zmin1)
        mybox1 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymax2-ymax1),(zmax1-zmin1)).Shape()
        myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
        myshapeDimension1 = get_bounding_details(myshapeCommon1) 
        if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("Nothing common with Enclosed Part From Back")
            return (True, myshapeDimension1,(0,1,0),myshapeCommonReturn)
        else:
            xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
            if ( ((zmin1<zmin3) and (zmax1>zmax3) and (xmin1<xmin3) and (xmax1>xmax3) ) ) : 
                return (True, myshapeDimension1,(0,1,0),myshapeCommonReturn)
            else:
                if debugMe:
                    print("Nothing common with Enclosed Part From Back",myshapeDimension1,aDimension1,aDimension2) 
    else:
        if debugMe:
            print("Nothing From Back",ymax1,ymax2,aDimension1,aDimension2) 
    if debugMe:
        print("Checking 6")
    if ymin2 < ymin1:        
        corner1 = gp_Pnt(xmin1, ymin2, zmin1)
        mybox1 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymin1-ymin2),(zmax1-zmin1)).Shape()
        myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
        myshapeDimension1 = get_bounding_details(myshapeCommon1) 
        if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("Nothing common with Enclosed Part From Front")
            return (True, myshapeDimension1,(0,-1,0),myshapeCommonReturn)
        else:
            xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
            if ( ((ymin1<ymin3) and (ymax1>ymax3) and (zmin1<zmin3) and (zmax1>zmax3) ) ) :
                return (True, myshapeDimension1,(0,-1,0),myshapeCommonReturn)
            else:
                if debugMe:
                    print("Nothing common with Enclosed Part From Front",myshapeDimension1,aDimension1,aDimension2) 
    else:
        if debugMe:
            print("Nothing From Front",ymin1,ymin2,aDimension1,aDimension2) 
    if debugMe:
        print("Checking 7")
    return (False, (0, 0, 0, 0, 0, 0),(0,0,0),myshapeCommonReturn)

    

def GetTopPart(outerPos, outerDimension, outerDirection, outerObjectsDict):  
    innerObject, dimensionObject, innerDirection = outerPos, outerDimension, outerDirection    
    if innerObject in outerObjectsDict:
        _, outerObjects,approxDirection = outerObjectsDict[outerPos]        
        lenOuterObject = len(outerObjects)
        if(lenOuterObject>0):                            
            for i in range(0,lenOuterObject-1):
                swapper = False
                for j in range(0,lenOuterObject-1-i):
                    innerObject, dimensionObject, innerDirection = outerObjects[j]  
                    _, dimensionObject1, _ = outerObjects[j+1]  
                    #print(i,j, (shapesdim[i],shapesdim[j]), isInner(shapesdim[i],shapesdim[j]), isOuter(shapesdim[i],shapesdim[j]), isTopFronter(shapesdim[i],shapesdim[j]) )
                    swapper = (isTopCenter(dimensionObject1,dimensionObject,innerDirection) )                     
                    if(swapper):
                        #if(swapper):
                        outerObjects[j+1], outerObjects[j] = swap(outerObjects[j+1], outerObjects[j])
            innerObject, dimensionObject, innerDirection = outerObjects[0] 
    return (innerObject, dimensionObject, innerDirection)
       
def GetToppestPart(outerPos, outerDimension, outerDirection, outerObjectsDict, innerObjectsDict):
    #print("Got 0",outerPos, outerDimension)
    myTopPos, myTopDimension, myDirection = GetTopPart(outerPos, outerDimension,  outerDirection, outerObjectsDict)
    #print("Got 1",myTopPos, myTopDimension)
    if myTopPos==outerPos:
        return (myTopPos, myTopDimension,myDirection)
    else:
        innerObject, dimensionObject, innerDirection = myTopPos, myTopDimension, myDirection
        if myTopPos in innerObjectsDict:
            #print("Inner object",innerObjectsDict[myTopPos])
            myInnerArray=innerObjectsDict[myTopPos]
            #print("Unpacked Inner object",innerObjectsDict[myTopPos])
            lenOuterObject = len(myInnerArray)
            if(lenOuterObject>0): 
                innerObjects = [(myTopPos, myTopDimension,innerDirection)]                        
                for i in range(0,lenOuterObject):
                    innerPos, innerDimension = myInnerArray[i] 
                    if (innerPos > outerPos):
                        #print("Got 2",innerPos, innerDimension)
                        innerObj, innerObjDimension, innerObjDirection = GetToppestPart(innerPos, innerDimension, innerDirection, outerObjectsDict, innerObjectsDict)
                        #print("Got 3",innerObj, innerObjDimension)
                        innerObjects.append((innerObj, innerObjDimension, innerObjDirection))
                lenOuterObject = len(innerObjects)
                innerObject, dimensionObject,innerDirection = myTopPos, myTopDimension, myDirection
                if(lenOuterObject>0):                            
                    for i in range(0,lenOuterObject-1):
                        swapper = False
                        for j in range(0,lenOuterObject-1-i):
                            innerObject, dimensionObject, innerDirection = innerObjects[j]  
                            _, dimensionObject1, innerDirection1 = innerObjects[j+1]  
                            #print(i,j, (shapesdim[i],shapesdim[j]), isInner(shapesdim[i],shapesdim[j]), isOuter(shapesdim[i],shapesdim[j]), isTopFronter(shapesdim[i],shapesdim[j]) )
                            swapper = (isTopCenter(dimensionObject1,dimensionObject,innerDirection) )                     
                            if(swapper):
                                #if(swapper):
                                innerObjects[j+1], innerObjects[j] = swap(innerObjects[j+1], innerObjects[j])
                    innerObject, dimensionObject, innerDirection = innerObjects[0] 
            return (innerObject,dimensionObject, innerDirection)
        #print("Got 4",myTopPos, myTopDimension)
        innerObject, dimensionObject, innerDirection = GetToppestPart(myTopPos, myTopDimension, myDirection, outerObjectsDict, innerObjectsDict)
        #print("Got 5",innerObject, dimensionObject)
        return (innerObject, dimensionObject, innerDirection)


def getDirection(mypos,innerdict):   
    enclose, _, direction = innerdict[mypos]
    if (mypos == enclose):
        return direction
    else:
        return getDirection(enclose,innerdict)      
        
                      
def ExplodeParts(shapeArray,shape,name,dimension,explodegap,center,tolerance = 0.2,debugMe=False):

    xmin, ymin, zmin, xmax, ymax, zmax = dimension 
    xc, yc, zc = (xmin+xmax)/2, (ymin+ymax)/2 , (zmin+zmax)/2
    xd, yd, zd = xmax-xmin, ymax-ymin, zmax-zmin
    lenShape = len(shape)
   
    maxGap = ( 1 if (lenShape<=1) else (lenShape-1) ) * explodegap
    #print(maxGap,lenShape)
    if( xd < yd ) and ( xd < zd ):
        if(xd==0):
            xd=1
        xt, yt, zt = 2*xd+explodegap+maxGap, maxGap, maxGap        
    elif( yd < xd ) and ( yd < zd):
        if(yd==0):
            yd=1
        xt, yt, zt = maxGap, 2*yd+explodegap+maxGap, maxGap
    else:
        if(zd==0):
            zd=1
        xt, yt, zt =  maxGap, maxGap, 2*zd+explodegap+maxGap
    xs  = 1+ ( maxGap / xd ) / 2
    ys  = 1+ ( maxGap / yd ) / 2
    zs  = 1+ ( maxGap / zd ) / 2
    newShapes=[]
    moveArrays=[]
    #shapesdim=[]
    shapesdis=[]
    shapesvol=[]
    shapeorder=[]
    shapereverseorder=[]
    shapeassembleorder=[]
    shapesdim=[]
    shapesmov=[]
    shapesdirection=[]
    fullShape,converted = list_of_shapes_to_compound(shape)
    if(converted):
        newShapes.append((fullShape,name,None))
    else:
        firstTime = True
        for (aShape,aName,aColor) in shapeArray:
            newShapes.append((aShape,aName,aColor))
            if firstTime:
                firstTime = False
            else:
                moveArrays.append((0, 0, 0))
    for i  in range(lenShape):
        (aShape,aName,aColor) = shapeArray[i]
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = get_bounding_details(aShape) 
        xmove, ymove, zmove = (((xmins+xmaxs)/2)-xc)*xs, (((ymins+ymaxs)/2)-yc)*ys, (((zmins+zmaxs)/2)-zc)*zs
        if not center:
            newShape=translate_shp(aShape,xmove+xt, ymove+yt, zmove+zt, True)
        else:
            newShape=translate_shp(aShape,xt, yt, zt, True)
        newShapes.append((newShape,aName,aColor))
        moveArrays.append((xmove, ymove, zmove))
        #shapesdim.append(xmins+xmove+xt, ymins+ymove+xt, zmins+zmove+xt, xmaxs+xmove+xt, ymaxs+ymove+xt, zmaxs+zmove+xt)
        shapeorder.append(i)
        shapereverseorder.append(i)
        shapeassembleorder.append(i)
        shapesdirection.append((0,0,0))
        shapesmov.append((xmove, ymove, zmove))
        shapesdis.append( ((xmins+xmaxs)/2+xmove-xc)**2+((ymins+ymaxs)/2+ymove-yc)**2+((zmins+zmaxs)/2+zmove-zc)**2 )
        shapesvol.append(abs((xmaxs-xmins)*(ymaxs-ymins)*(zmaxs-zmins)))         
        shapesdim.append((xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))  
        
         
    """  for i in range(lenShape):
        print("before",hash(newShapes[i+1]),moveArrays[i],shapeorder[i]) """
    print(lenShape,shapeorder,shapesdis,shapesvol,shapesdim)
    
    if(center):
        
        """ k = 1
        
        enclosed = False
        outer = False
        dimensionObject = (0, 0, 0, 0, 0, 0)  
        approxDirection = (0, 0, 0) 
        outerDimensionalArray = [[(enclosed,outer,dimensionObject,approxDirection) \
            for i in range(lenShape)] for j in range(lenShape)]
        innerDimensionalDict = {}
        for i in range(0,lenShape-k):
            swapper = False
            for j in range(0,lenShape-k-i):
                #print(i,j, (shapesdim[i],shapesdim[j]), isInner(shapesdim[i],shapesdim[j]), isOuter(shapesdim[i],shapesdim[j]), isTopFronter(shapesdim[i],shapesdim[j]) )
                swapper = (isTopFrontLefter(shapesdim[j+1],shapesdim[j]) ) 
                
                if(swapper):
                    #if(swapper):
                    shapeorder[j+1], shapeorder[j] = swap(shapeorder[j+1], shapeorder[j])                
                    shapesmov[j+1], shapesmov[j] = swap(shapesmov[j+1], shapesmov[j])
                    shapesdis[j+1], shapesdis[j] = swap(shapesdis[j+1], shapesdis[j])
                    shapesvol[j+1], shapesvol[j] = swap(shapesvol[j+1], shapesvol[j])
                    shapesdim[j+1], shapesdim[j] = swap(shapesdim[j+1], shapesdim[j])
            
        #for i in range(0,lenShape):
            #print("before",i, shapeorder[i], shapesdim[i] )
        outerObjectsDict = {}
        innerObjectsDict = {}
        directionComputed= {}
        directionPos = {}
        FurtherEnclosures = False
        k = 1
        print("Started Finding",k,lenShape)
        for i in range(0,lenShape-k+1):   
            outerObjectsArray = []   
            directionComputed[i]=False 
            directionPos[i] = (0,0,0) 
            approxDirection = (0,0,0)        
            for j in range(0,lenShape-k+1): 
                enclosed = False
                outer = False
                dimensionObject = (0, 0, 0, 0, 0, 0)                  
                if (i != j) :                        
                    #debugMe = ( (shapeorder[i]==1) and (shapeorder[j]==0) ) or ((shapeorder[i]==0) and (shapeorder[j]==3))
                    #debugMe = (i==0)
                    enclosed,_,approxDirection = isEnclosed(shape[shapeorder[j]],shapesdim[j],shape[shapeorder[i]],shapesdim[i],debugMe)
                    if enclosed:
                        if debugMe:
                            print("I am checking to enclosed to append",i,j,shapeorder[i],shapeorder[j])
                        outer, dimensionObject = isOuterToPart(shapesdim[j],shape[shapeorder[j]],shapesdim[i],shape[shapeorder[i]],tolerance,debugMe)
                        if(outer):
                            if debugMe:
                                print("I have checked to enclosed to append",i,j,shapeorder[i],shapeorder[j])
                            outerObjectsArray.append((j,dimensionObject,approxDirection))
                            if not j in innerObjectsDict:
                                innerObjectsDict[j]=[]
                            innerObjectsDict[j].append((i,shapesdim[i],approxDirection))
                        else:
                            if debugMe:
                                print("I have checked not to enclosed to append",i,j,shapeorder[i],shapeorder[j])
                    else:
                        if debugMe:
                            print("I am not enclosed to append",i,j,shapeorder[i],shapeorder[j])
                outerDimensionalArray[shapeorder[i]][shapeorder[j]]= (enclosed,outer,dimensionObject,approxDirection)
                print(i,j,shapeorder[i],shapeorder[j],(enclosed,outer,dimensionObject,approxDirection))
            if(len(outerObjectsArray)>0):
                outerObjectsDict[i]=(i,outerObjectsArray)
                if i==0 :
                    FurtherEnclosures = True
                else:
                    FurtherEnclosures = True
            else:
                outerObjectsDict[i]=(i,[(i,shapesdim[i])],approxDirection)
        maxDirectionX, maxDirectionY,maxDirectionZ = (0,0,0)
        
        print("Starting direction findings",innerObjectsDict)
        for i in range(0,lenShape-k+1):            
            (mypos,mydim,myDirection) = i, shapesdim[i], (0,0,0)
            if i in innerObjectsDict:
                (mypos,mydim,myDirection) = innerObjectsDict[i][0]
                #print("innerObjectshere",i,shapeorder[i],innerObjectsDict[i])
            directionAngle = (0,0,0)
            if directionComputed[mypos] :
                directionAngle = directionPos[shapeorder[mypos]]
            else:
                for angx in range(0,45,9):
                    for angy in range(0,45,9):
                        for angz in range(0,45,9):
                            if (angx==0 and angy==0 and angz==0):
                                minAngx = angx
                                minAngY = angy
                                minAngz = angz
                                xmin, ymin, zmin, xmax, ymax, zmax = mydim 
                                thisVolume = abs( (xmax-xmin) * (ymax-ymin) * (zmax-zmin) )   
                                minVolume = thisVolume
                                minDim = mydim
                            else:
                                thisShape = rotate_shp_3_axis(shape[shapeorder[mypos]],angx, angy, angz, "deg", True)
                                thisDim = get_bounding_details(thisShape) 
                                xmin, ymin, zmin, xmax, ymax, zmax = thisDim
                                thisVolume = abs( (xmax-xmin) * (ymax-ymin) * (zmax-zmin) )
                                if thisVolume < minVolume:
                                    minAngx = angx
                                    minAngY = angy
                                    minAngz = angz
                                    minVolume = thisVolume
                                    minDim = thisDim
                directionPos[shapeorder[mypos]] = (minAngx,minAngY,minAngz,minDim)
                directionAngle = directionPos[shapeorder[mypos]] 
             
            direction = myDirection
            xmin, ymin, zmin, xmax, ymax, zmax = mydim                       
            if( ( (xmax-xmin) >= (ymax-ymin) ) and ( (xmax-xmin) >= (zmax-zmin) )):
                if(direction==(0,0,0)):
                    direction = (1,0,0)
                maxDirectionX += 1
            elif ( ( (ymax-ymin) >= (xmax-xmin) ) and ( (ymax-ymin) >= (zmax-zmin) )):
                if(direction==(0,0,0)):
                    direction = (0,1,0)
                maxDirectionY += 1
            else:
                if(direction==(0,0,0)):
                    direction = (0, 0, 1)
                maxDirectionZ += 1                           
            innerDimensionalDict[shapeorder[i]]= (shapeorder[mypos],mydim,direction,directionAngle)  
        print("MyObjectDict",innerDimensionalDict,maxDirectionX, maxDirectionY,maxDirectionZ)   """        
        k = 1
        commonObjects=[]
        while k < lenShape:
            #for i in range(0,lenShape):
                #print("topping before",i, shapeorder[i], shapesdim[i] )
            """ for i in range(0,lenShape-k):
                swapper = False
                for j in range(0,lenShape-k-i):
                    #print(i,j, (shapesdim[i],shapesdim[j]), isInner(shapesdim[i],shapesdim[j]), isOuter(shapesdim[i],shapesdim[j]), isTopFronter(shapesdim[i],shapesdim[j]) )
                    swapper = (isTopFrontLefter(shapesdim[j+1],shapesdim[j]) ) 
                    
                    if(swapper):
                        #if(swapper):
                        shapeorder[j+1], shapeorder[j] = swap(shapeorder[j+1], shapeorder[j])                
                        shapesmov[j+1], shapesmov[j] = swap(shapesmov[j+1], shapesmov[j])
                        shapesdis[j+1], shapesdis[j] = swap(shapesdis[j+1], shapesdis[j])
                        shapesvol[j+1], shapesvol[j] = swap(shapesvol[j+1], shapesvol[j])
                        shapesdim[j+1], shapesdim[j] = swap(shapesdim[j+1], shapesdim[j])
            
            #for i in range(0,lenShape):
                #print("before",i, shapeorder[i], shapesdim[i] )
            outerObjectsDict = {}
            innerObjectsDict = {}
            FurtherEnclosures = False
            approxDirection = (0, 0, 0)
            outerApproxDirection = (0,0,0)
            EntireWholeDirection = (0,0,0)
            print("Started Arranging",k,lenShape)
            for i in range(0,lenShape-k+1):   
                outerObjectsArray = []   
                outerApproxDirection = (0,0,0)          
                for j in range(0,lenShape-k+1):                   
                    if (i != j) :                        
                        #debugMe = ( (shapeorder[i]==1) and (shapeorder[j]==0) ) or ((shapeorder[i]==0) and (shapeorder[j]==3))
                        #debugMe = (i==0)
                        (enclosed,outer,dimensionObject,approxDirection) = outerDimensionalArray[shapeorder[i]][shapeorder[j]]
                        if approxDirection!=(0,0,0):
                            outerApproxDirection = approxDirection
                        if enclosed:
                            if debugMe:
                                print("I am checking to enclosed to append",i,j,shapeorder[i],shapeorder[j])
                            #outer, dimensionObject = isOuterToPart(shapesdim[j],shape[shapeorder[j]],shapesdim[i],shape[shapeorder[i]],tolerance,debugMe)
                            if(outer):
                                if debugMe:
                                    print("I have checked to enclosed to append",i,j,shapeorder[i],shapeorder[j])
                                outerObjectsArray.append((j,dimensionObject,approxDirection))
                                if not j in innerObjectsDict:
                                    innerObjectsDict[j]=[]
                                innerObjectsDict[j].append((i,shapesdim[i],approxDirection))
                            else:
                                if debugMe:
                                    print("I have checked not to enclosed to append",i,j,shapeorder[i],shapeorder[j])
                        else:
                            if debugMe:
                                print("I am not enclosed to append",i,j,shapeorder[i],shapeorder[j])
                        enclosed,_ = isEnclosed(shapesdim[j],shapesdim[i],debugMe)
                        if enclosed:
                            if debugMe:
                                print("I am checking to enclosed to append",i,j,shapeorder[i],shapeorder[j])
                            outer, dimensionObject = isOuterToPart(shapesdim[j],shape[shapeorder[j]],shapesdim[i],shape[shapeorder[i]],tolerance,debugMe)
                            if(outer):
                                if debugMe:
                                    print("I have checked to enclosed to append",i,j,shapeorder[i],shapeorder[j])
                                outerObjectsArray.append((j,dimensionObject))
                                if not j in innerObjectsDict:
                                    innerObjectsDict[j]=[]
                                innerObjectsDict[j].append((i,shapesdim[i]))
                            else:
                                if debugMe:
                                    print("I have checked not to enclosed to append",i,j,shapeorder[i],shapeorder[j])
                        else:
                            if debugMe:
                                print("I am not enclosed to append",i,j,shapeorder[i],shapeorder[j])
                if(len(outerObjectsArray)>0):
                    outerObjectsDict[i]=(i,outerObjectsArray)
                    if i==0 :
                        FurtherEnclosures = True
                    else:
                        FurtherEnclosures = True
                else:
                    outerObjectsDict[i]=(i,[(i,shapesdim[i])],outerApproxDirection)
                if outerApproxDirection!= (0,0,0):
                    EntireWholeDirection = outerApproxDirection                    
                
            if FurtherEnclosures==True:
                print(k,"Doing Enclosure",outerObjectsDict)
                innerObject = 0
                if 0 in outerObjectsDict:
                    #print(k, shapeorder[0], shapesdim[0], outerObjectsDict, innerObjectsDict)
                    innerObject, dimensionObject, thisDirection = GetToppestPart(0, shapesdim[0], EntireWholeDirection, outerObjectsDict, innerObjectsDict) 
                    #print("after ordering",innerObject, dimensionObject)       
                if (innerObject != (lenShape-k)):
                    i=innerObject
                    j=lenShape-k
                    shapeorder[i], shapeorder[j] = swap(shapeorder[i], shapeorder[j])                
                    shapesmov[i], shapesmov[j] = swap(shapesmov[i], shapesmov[j])
                    shapesdis[i], shapesdis[j] = swap(shapesdis[i], shapesdis[j])
                    shapesvol[i], shapesvol[j] = swap(shapesvol[i], shapesvol[j])
                    shapesdim[i], shapesdim[j] = swap(shapesdim[i], shapesdim[j])
            else: 
            print(k,"Doing Distancer",outerObjectsDict) """
            for i in range(0,lenShape-k):
                #swapper = False
                for j in range(0,lenShape-k-i):
                    if(( (shapesdis[j+1] < shapesdis[j]) or 
                        ((shapesdis[j+1] == shapesdis[j]) and (shapesvol[j+1] < shapesvol[j]))  ) ):
                        #if(swapper):
                        shapeorder[j+1], shapeorder[j] = swap(shapeorder[j+1], shapeorder[j])                
                        shapesmov[j+1], shapesmov[j] = swap(shapesmov[j+1], shapesmov[j])
                        shapesdis[j+1], shapesdis[j] = swap(shapesdis[j+1], shapesdis[j])
                        shapesvol[j+1], shapesvol[j] = swap(shapesvol[j+1], shapesvol[j])
                        shapesdim[j+1], shapesdim[j] = swap(shapesdim[j+1], shapesdim[j])
            enclosed = False
            print(shapeorder,shapesdirection)
            for i in range(0,lenShape-k+1):                
                j=lenShape-k-i
                debugMe = False
                myExcludeCompound = excluded_list_of_shapes_to_compound(shape,shapeorder,j,k,debugMe)
                myExcludeDimension = get_bounding_details(myExcludeCompound)
                
                enclosed,_,myDirection, myCommonCompound = isRemovable(shape[shapeorder[j]],shapesdim[j],myExcludeCompound,myExcludeDimension,debugMe)
                #print(k,i,j,shapeorder[j],enclosed,myExcludeDimension,lenShape-k)
                if (enclosed):
                    shapesdirection[shapeorder[j]]=myDirection
                    if (j!=(lenShape-k)):
                        j1=lenShape-k
                        shapeorder[j1], shapeorder[j] = swap(shapeorder[j1], shapeorder[j])                
                        shapesmov[j1], shapesmov[j] = swap(shapesmov[j1], shapesmov[j])
                        shapesdis[j1], shapesdis[j] = swap(shapesdis[j1], shapesdis[j])
                        shapesvol[j1], shapesvol[j] = swap(shapesvol[j1], shapesvol[j])
                        shapesdim[j1], shapesdim[j] = swap(shapesdim[j1], shapesdim[j])                    
                    print(k,i,j,shapeorder[lenShape-k],enclosed,myDirection,lenShape-k)
                    break
                else:
                    if(myCommonCompound!=None and debugMe):
                        commonObjects.append(myCommonCompound)
                    
            if enclosed==False:
                print("No objects can be left",k)

            Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax = shapesdim[0] 
            for i in range(1,lenShape-k):
                xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = shapesdim[i]
                if(xmins < Xxmin):
                    Xxmin = xmins
                if(ymins < Yymin):
                    Yymin = ymins
                if(zmins < Zzmin):
                    Zzmin = zmins
                if(xmaxs > Xxmax):
                    Xxmax = xmaxs
                if(ymaxs > Yymax):
                    Yymax = ymaxs
                if(zmaxs > Zzmax):
                    Zzmax = zmaxs
            xc, yc, zc = (Xxmin+Xxmax)/2, (Yymin+Yymax)/2 , (Zzmin+Zzmax)/2
            #print("before",xc,yc,zc,k, shapesdis)
            for i in range(0,lenShape-k):
                xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = shapesdim[i]
                xmove, ymove, zmove = shapesmov[i]
                shapesdis[i]= ((xmins+xmaxs)/2+xmove-xc)**2+((ymins+ymaxs)/2+ymove-yc)**2+((zmins+zmaxs)/2+zmove-zc)**2 
            k += 1
        #for i in range(0,lenShape):
            #print("after", i, shapeorder[i], shapesdim[i] )

        #k += 1
        """ k = 1        
        while k < lenShape: #Remove constraints one by one
            for i in range(0,lenShape-k):
                swapper = False
                for j in range(0,lenShape-k-i):
                    #print(i,j, (shapesdim[j+1],shapesdim[j]), isInner(shapesdim[j+1],shapesdim[j]), isOuter(shapesdim[j+1],shapesdim[j]), isTopFronter(shapesdim[j+1],shapesdim[j]) )

                    swapper = isInner(shapesdim[j+1],shapesdim[j]) or \
                        isOuter(shapesdim[j+1],shapesdim[j]) 
                    
                    if(swapper or ((shapesdis[j+1] < shapesdis[j]) or 
                        ((shapesdis[j+1] == shapesdis[j]) and (shapesvol[j+1] < shapesvol[j])) or
                        ((shapesdis[j+1] == shapesdis[j]) and (shapesvol[j+1] == shapesvol[j]) and 
                        (isTopFronter(shapesdim[j+1],shapesdim[j]) ) ) ) ):
                        #if(swapper):
                        shapeorder[j+1], shapeorder[j] = swap(shapeorder[j+1], shapeorder[j])                
                        shapesmov[j+1], shapesmov[j] = swap(shapesmov[j+1], shapesmov[j])
                        shapesdis[j+1], shapesdis[j] = swap(shapesdis[j+1], shapesdis[j])
                        shapesvol[j+1], shapesvol[j] = swap(shapesvol[j+1], shapesvol[j])
                        shapesdim[j+1], shapesdim[j] = swap(shapesdim[j+1], shapesdim[j])
                    
            Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax = shapesdim[0] 
            for i in range(1,lenShape-k):
                xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = shapesdim[i]
                if(xmins < Xxmin):
                    Xxmin = xmins
                if(ymins < Yymin):
                    Yymin = ymins
                if(zmins < Zzmin):
                    Zzmin = zmins
                if(xmaxs > Xxmax):
                    Xxmax = xmaxs
                if(ymaxs > Yymax):
                    Yymax = ymaxs
                if(zmaxs > Zzmax):
                    Zzmax = zmaxs
            xc, yc, zc = (Xxmin+Xxmax)/2, (Yymin+Yymax)/2 , (Zzmin+Zzmax)/2
            #print("before",xc,yc,zc,k, shapesdis)
            for i in range(0,lenShape-k):
                xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = shapesdim[i]
                xmove, ymove, zmove = shapesmov[i]
                shapesdis[i]= ((xmins+xmaxs)/2+xmove-xc)**2+((ymins+ymaxs)/2+ymove-yc)**2+((zmins+zmaxs)/2+zmove-zc)**2 
            #print("after",shapesdis,shapesdim,shapesvol)
            k += 1  """   
        for i  in range(lenShape):
            shapereverseorder[shapeorder[i]] = i
        for i  in range(lenShape):
            shapeassembleorder[shapereverseorder[i]] = i
        #for i  in range(lenShape):
        #    print(i,shapereverseorder[i],shapeorder[i],moveArrays[i],shapesmov[i],shapesdim[i])
        xmin, ymin, zmin, xmax, ymax, zmax = dimension 
        xc, yc, zc = (xmin+xmax)/2, (ymin+ymax)/2 , (zmin+zmax)/2
        xminp, yminp, zminp, xmaxp, ymaxp, zmaxp = 0, 0, 0, 0, 0, 0
        xmovep, ymovep, zmovep = 0,0,0
        for i  in range(lenShape):
            #(aShape,aName,aColor) = shapeArray[i]
            #xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = get_bounding_details(aShape) 
            (bShape,bName,bColor) = shapeArray[shapeassembleorder[i]]
            (newShape,aName,aColor) = newShapes[shapeassembleorder[i]+1]
            direction = shapesdirection[shapeassembleorder[i]]
            xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = shapesdim[shapereverseorder[shapeassembleorder[i]]]
            
            directionX,directionY,directionZ = direction
            
            xmove = (((xmins+xmaxs)/2)-xc)*xs#*directionX
            ymove = (((ymins+ymaxs)/2)-yc)*ys#*directionY
            zmove = (((zmins+zmaxs)/2)-zc)*zs#*directionZ
            if xmove < 0:
                dirX = -directionX
            else:
                dirX = directionX
            if ymove < 0:
                dirY = -directionY
            else:
                dirY = directionY
            if zmove < 0:
                dirZ = -directionZ
            else:
                dirZ = directionZ    
            if i==0:
                shiftX,shiftY,shiftZ = 0,0,0
            else:           
                #xmove, ymove, zmove = 0,0,0    
                shiftX += ( ((xmaxp-xminp)) * directionX + explodegap ) * dirX
                shiftY += ( ((ymaxp-yminp)) * directionY + explodegap ) * dirY
                shiftZ += ( ((zmaxp-zminp)) * directionZ + explodegap ) * dirZ
            
            xminp, yminp, zminp, xmaxp, ymaxp, zmaxp = xmins, ymins, zmins, xmaxs, ymaxs, zmaxs
            xmovep,ymovep,zmovep = xmove, ymove, zmove

            xmoveX = (xmove+shiftX) * directionX  
            ymoveY = (ymove+shiftY) * directionY  
            zmoveZ = (zmove+shiftZ) * directionZ 
            
            """  xmoveX = xmove
            ymoveY = ymove
            zmoveZ = zmove """

            print(direction,i,shapeassembleorder[i],shapereverseorder[shapeassembleorder[i]],\
                shiftX,shiftY,shiftZ,(xmove, ymove, zmove),(xmoveX, ymoveY, zmoveZ),aName,bName,\
                    (xmins, ymins, zmins, xmaxs, ymaxs, zmaxs),get_bounding_details(bShape))            
            
            #print(i,shapeorder[i],direction,xmove,ymove,zmove)
            if(xmoveX==0 and ymoveY==0 and zmoveZ==0):
                moveArrays[shapeassembleorder[i]]=(xmove, ymove, zmove)
                finalShape=translate_shp(newShape,xmove, ymove, zmove, True)
            else:
                moveArrays[shapeassembleorder[i]]=(xmoveX, ymoveY, zmoveZ)
                finalShape=translate_shp(newShape,xmoveX, ymoveY, zmoveZ, True)
         
            newShapes[shapeassembleorder[i]+1] = (finalShape,aName,aColor)
           
            #shapesdim.append(xmins+xmove+xt, ymins+ymove+xt, zmins+zmove+xt, xmaxs+xmove+xt, ymaxs+ymove+xt, zmaxs+zmove+xt)
             
    """ for i in range(lenShape):
        print("after",hash(newShapes[i+1]),moveArrays[i],shapeorder[i]) """
    #print(shapeorder,shapesdis,shapesvol)
    
    aColor = Quantity_Color(0, 0, 1, Quantity_TOC_RGB)
    for i in range(len(commonObjects)):
        newShapes.append((commonObjects[i],"Common"+str(i),aColor))
        moveArrays.append((0, 0, 0))
        #shapesdim.append(xmins+xmove+xt, ymins+ymove+xt, zmins+zmove+xt, xmaxs+xmove+xt, ymaxs+ymove+xt, zmaxs+zmove+xt)
        shapeorder.append(i+lenShape)

    return newShapes, moveArrays, shapeorder
    """  _,_,zminj,_,_,zmaxj = shapesdim[j]
                    _,_,zminj1,_,_,zmaxj1 = shapesdim[j+1]
                    if (shapesdis[j+1] < shapesdis[j]) or \
                        ((shapesdis[j+1] == shapesdis[j]) and (shapesvol[j+1] < shapesvol[j])) or\
                        ((shapesdis[j+1] == shapesdis[j]) and (shapesvol[j+1] == shapesvol[j]) and ((zmaxj1+zminj1) > (zmaxj+zminj)) ) :
                        shapeorder[j+1], shapeorder[j] = swap(shapeorder[j+1], shapeorder[j])                
                        shapesmov[j+1], shapesmov[j] = swap(shapesmov[j+1], shapesmov[j])
                        shapesdis[j+1], shapesdis[j] = swap(shapesdis[j+1], shapesdis[j])
                        shapesvol[j+1], shapesvol[j] = swap(shapesvol[j+1], shapesvol[j])
                        shapesdim[j+1], shapesdim[j] = swap(shapesdim[j+1], shapesdim[j]) """
def findSubShapeName(myParent,myTree):
    for aTree in myTree:
        if aTree[gltf_dict['id']]==myParent :
            thisParent  = aTree[gltf_dict['parentId']]
            if thisParent == 1:
                return aTree[gltf_dict['name']]
            if thisParent:
                return findSubShapeName(thisParent,myTree)
            else:
                return "NoParent"
    return "NoParent"

def findAssemblyShapeName(myParent,myTree):
    for aTree in myTree:
        if aTree[gltf_dict['id']]==myParent :             
            return aTree[gltf_dict['name']]      
    return "NoParent"

def findMyShapeByTreeID(shapes,treeID):
    for hash_shape, item in shapes.items():
        [shape_to_disp, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, uvPlane] = item
        if myId == treeID:
            return item
    return None

def getShapesFromOutPutShapes(shapes,mytree):
    retshapes=[]
    subshapes=[]
    onlyshapes=[]
    subshapesStarted = False
    subShapeName = ''
    subShapeColor=None
    for aTree in mytree:
        myTreeID = aTree[gltf_dict['id']]
        item = findMyShapeByTreeID(shapes,myTreeID) 
        myTreeParent = aTree[gltf_dict['parentId']]
        if(myTreeParent==1):
            if(len(subshapes)>0):
                mergedshape,_ =  list_of_shapes_to_compound(subshapes)
                retshapes.append((mergedshape,subShapeName,subShapeColor))
                onlyshapes.append(mergedshape)
                subshapes=[]
                subshapesStarted=False
                subShapeName=''
                subShapeColor=None 
        if item != None:
            [shape_to_disp, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, uvPlane] = item
            #print(shape_to_disp, subName, subEntry, c, myId, myParent )
            if (subshapesStarted == False) :
                if myTreeParent == 1:
                    myParentName = subName
                else:
                    myParentName = findSubShapeName(myParent,mytree)
                if ((subShapeName == '') and (myParentName != '')) :
                    subShapeName=myParentName 
                    subshapesStarted=True
            subShapeColor=c
            subshapes.append(shape_to_disp)
    if(len(subshapes)>0):
        mergedshape,_ =  list_of_shapes_to_compound(subshapes)
        retshapes.append((mergedshape,subShapeName,subShapeColor))   
        onlyshapes.append(mergedshape) 
    #print(retshapes,onlyshapes)
    return (retshapes,onlyshapes,findAssemblyShapeName(1,mytree))

def exportToAssemblyGLTF(sourceFileName,distancegap,anglegap,explodegap,center,tolerance = 0.2):#,thumbwidth,thumbheight):
    """
    Imports a file based on the type (STEP, IGES, BREP, STL)    
    """
    #Now read and return the shape
   
    try:
        
        
        dictionary={}
        _, file_extension = os.path.splitext(sourceFileName)
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        newfilenamewithoutext = "Display/"+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        outputShapes={}
        if file_extension=="stp" or file_extension=="step" or file_extension=="igs" or file_extension=="iges" :          
            
            try:
                #Wholeshape = conversion.read_step_file(sourceFileName, as_compound=False)                
                """ (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    edgesize=0, vertexsize=0,thumbwidth=0,thumbheight=0).dump() """
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,ascompound=True,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,
                    edgesize=0, vertexsize=0,thumbwidth=0,thumbheight=0).dump()
                """ dimension, myShapes = outputShapes
                shapeArray,shape,aName = getShapesFromOutPutShapes(myShapes,dictionary["tree"])
                #shape = Wholeshape
                #shapeArray = createShapeArray(shape)
                nshape, moveArrays, shapeorder = ExplodeParts(shapeArray,shape,aName,dimension,explodegap,center,tolerance)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=nshape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0, animations=moveArrays,shapeorder=shapeorder).dump()
                dictionary['assemblyorder']=shapeorder """
                
                """  print(len(nshape))
                for i in range(1, len(nshape)):
                    print('theshape', hash(nshape[i]), moveArrays[i-1]) """

            except Exception as e:
                print("error",e)
                
            #return dictionary           
            
        if file_extension=="stl" :            
            try:
                shape = conversion.read_stl_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()
                """ dimension, myShapes = outputShapes
                shapeArray,shape,aName = getShapesFromOutPutShapes(myShapes,dictionary["tree"])
                nshape, moveArrays, shapeorder = ExplodeParts(shapeArray,shape,aName,dimension,explodegap,center,tolerance)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=nshape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()           
                dictionary['assemblyorder']=shapeorder """
            except Exception as e:
                print("error",e)
                
            #return (dictionary,outputShapes) 
        """ if file_extension=="igs" or file_extension=="iges" :
            try:               
                shape = conversion.read_iges_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()
                dimension, _ = outputShapes
                shape, moveArrays = ExplodeParts(shape,dimension,explodegap,center)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,
                    edgesize=0, vertexsize=0, animations=moveArrays, thumbheight=thumbheight,thumbwidth=thumbwidth).dump()          
                #dictionary['thumbnail']=thumbnail
            except Exception as e:
                print("error",e)
                
            return dictionary """
        if file_extension=="brep" :            
            try:
                shape = conversion.read_brep_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()
                """ dimension, myShapes = outputShapes
                shapeArray,shape,aName = getShapesFromOutPutShapes(myShapes,dictionary["tree"])
                nshape, moveArrays, shapeorder = ExplodeParts(shapeArray,shape,aName,dimension,explodegap,center,tolerance)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=nshape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbheight=0,thumbwidth=0,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()           
                dictionary['assemblyorder']=shapeorder """
            except Exception as e:
                print("error",e)
                
            #return dictionary 
        if file_extension=="dxf" :            
            try:
                shape = OCPImporters.importDXFObjects(sourceFileName, tol=distancegap )
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),distancegap=distancegap,anglegap=anglegap,ascompound=True,
                    thumbwidth=0,thumbheight=0).dump() 
                #faces_dict, edges_dict, vertices_dict =  getFacesDimensions(shape[0])                
                """ dimension, myShapes = outputShapes
                shapeArray,shape,aName = getShapesFromOutPutShapes(myShapes,dictionary["tree"])
                nshape, moveArrays, shapeorder = ExplodeParts(shapeArray,shape,aName,dimension,explodegap,center,tolerance)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=nshape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbheight=0, thumbwidth=0,
                    edgesize=0, vertexsize=0, animations=moveArrays,delay=1).dump()          
                dictionary['assemblyorder']=shapeorder """
            except Exception as e:
                print("error",e)
                
            #return dictionary 
        try:
            dimension, myShapes = outputShapes
            shapeArray,shape,aName = getShapesFromOutPutShapes(myShapes,dictionary["tree"])
            #shape = Wholeshape
            #shapeArray = createShapeArray(shape)
            nshape, moveArrays, shapeorder = ExplodeParts(shapeArray,shape,aName,dimension,explodegap,center,tolerance)
            (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                filename=sourceFileName,shapeslist=nshape,includeparts=False,distancegap=distancegap,
                anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                edgesize=0, vertexsize=0, animations=moveArrays,shapeorder=shapeorder).dump()
            dictionary['assemblyorder']=shapeorder
        except Exception as e:
            print("error",e)
        try:
            orderfile = "Display/"+dictionary["store"]+".order"
            print("Writing,",orderfile)
            with open(orderfile, 'w') as fh:
                fh.write(json.dumps(dictionary["assemblyorder"], sort_keys=True, indent=2 ))
        except Exception as e:
            print("Error while writing orderfile",e)      
        return dictionary
       
       
    except:
        raise ValueError("File Could not be loaded") 



@api_view(['GET'])
def FileGetAssemblyOrder(request):
    data = []
    if request.method == 'GET':
        id = request.GET.get('id', None)
        distancegap = convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
        anglegap = convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
        explodegap = convertToFloat(request.GET.get('explodegap',"0.3"),0.3)
        center=convertToBool(request.GET.get('center',"true"),True)
        #thumbwidth = convertToFloat(request.GET.get('thumbwidth',"96"),96)
        #thumbheight = convertToFloat(request.GET.get('thumbheight',"96"),96)
        print(id,distancegap,anglegap,explodegap,center)
        if is_number(id) :            
            files = File.objects.filter(id__icontains=id)
            for eachfile in files:               
                data = exportToAssemblyGLTF("Media/"+eachfile.file.name,distancegap,anglegap,explodegap,center)#,thumbwidth,thumbheight)
        else:
            id = request.GET.get('file', None)
            if id is not None:
                data = exportToAssemblyGLTF("Media/"+id,distancegap,anglegap,explodegap,center)#,thumbwidth,thumbheight)
    return JsonResponse(data, safe=False)      
    