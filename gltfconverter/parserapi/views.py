from django.http.response import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.parsers import FileUploadParser
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
import sys
import pickle

from pathlib import Path
from .structparts import Part
from .structparts import Assembly
from .structparts.codec.step import (Importer, Exporter)
from .structparts.codec.mstep import Exporter
from .structparts import conversion
#from .structparts.structquery.occ_impl import OCPDataExchange
from .structparts.structquery.occ_impl import OCPStepIGESAnalyser, OCPImporters
from .structparts.structquery.occ_impl.OCCExtend.ShapeFactory import (
    recognize_edge, translate_shp, rotate_shp_3_axis, minimum_distance, getPartStackablePositions, get_bounding_details, 
    recognize_direction, recognize_entity)
from .structparts.structquery.occ_impl.OCCUtils.Topology import dumpTopologyStructures, dumpTopologyFacesEdgesVertices
from OCC.Core.TopAbs import (TopAbs_FACE, TopAbs_Orientation)
from .structparts.structquery.occ_impl.OCCExtend.TopologyUtils import list_of_shapes_to_compound

from decimal import Decimal

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
                    filename=sourceFileName,shapeslist=shape, includeparts=includeparts,
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
                    filename=sourceFileName,shapeslist=shape, includeparts=includeparts,
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
                    filename=sourceFileName,shapeslist=shape, includeparts=includeparts,
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
    xmove,ymove,zmove=0,0,zmax-zmin
    if depthable != None:
        xmove, ymove, zmove = movingParameters(dimension, depthable, 0.1) 
        #print ("Dimension", dimension, xmove, ymove, zmove)
        depth = 0
        for oneFace in stackable['top']:
            if( oneFace["depth"] != 0 ):
                depth = oneFace["depth"]
        zmove -= depth
    distance = 1e10
    while distance > 1e-2:
        AnotherShape=translate_shp(shape[0],xmove, ymove, zmove, True)
        (distance, points1, points2) = minimum_distance(shape[0],AnotherShape)
        #print("Zmove", zmove, distance, points1, points2)
        zmove -= distance/1.4
        #print("Dmove", zmove, distance, points1, points2)
    moveArrays=[]
    shapeList =[]
    shapeList.append(shape[0])
    for i in range(1,noOfDuplicates):
        #print(i,noOfDuplicates, xmove*i, ymove*i, zmove*i )
        AnotherShape=translate_shp(shape[0],xmove*i, ymove*i, zmove*i, True)
        shapeList.append(AnotherShape)
        moveArrays.append((xmove*i, ymove*i, zmove*i))
    return shapeList, noOfDuplicates, moveArrays

def exportToPartGLTF(sourceFileName,distancegap,anglegap,thumbwidth,thumbheight):
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
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump()
                dimension, _ = outputShapes
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump() 
                else:
                     if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                        shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                        (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                        edgesize=0, vertexsize=0).dump()  
                #print(outputShapes)
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shapeList,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=thumbwidth,thumbheight=thumbheight,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}]
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
                
            return dictionary           
            
        if file_extension=="stl" :            
            try:
                shape = conversion.read_stl_file(sourceFileName, as_compound=True)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump()
                dimension, _ = outputShapes
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump() 
                else:
                     if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                        shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                        (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                        edgesize=0, vertexsize=0).dump() 
                #print(outputShapes)
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shapeList,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=thumbwidth,thumbheight=thumbheight,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}]  
                #dictionary['thumbnail']=thumbnail             
                
            except Exception as e:
                print("error",e)
                
            return (dictionary,outputShapes) 
        if file_extension=="igs" or file_extension=="iges" :
            try:               
                shape = conversion.read_iges_file(sourceFileName, as_compound=True)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump()
                dimension, _ = outputShapes
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump() 
                else:
                     if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                        shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                        (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                        edgesize=0, vertexsize=0).dump()  
                #print(outputShapes)
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shapeList,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=thumbwidth,thumbheight=thumbheight,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}] 
                #dictionary['thumbnail']=thumbnail          
                
            except Exception as e:
                print("error",e)
                
            return dictionary
        if file_extension=="brep" :            
            try:
                shape = conversion.read_brep_file(sourceFileName, as_compound=True)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump()
                dimension, _ = outputShapes
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump() 
                else:
                     if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                        shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                        (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                        edgesize=0, vertexsize=0).dump() 
                #print(outputShapes)
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shapeList,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=thumbwidth,thumbheight=thumbheight,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}]  
                #dictionary['thumbnail']=thumbnail         
                
            except Exception as e:
                print("error",e)
                
            return dictionary 
        if file_extension=="dxf" :            
            try:
                shape = OCPImporters.importDXFObjects(sourceFileName, tol=distancegap )
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,distancegap=distancegap,anglegap=anglegap).dump() 
                #faces_dict, edges_dict, vertices_dict =  getFacesDimensions(shape[0])                
                dimension, _ = outputShapes
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump() 
                else:
                     if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                        shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                        (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                        edgesize=0, vertexsize=0).dump() 
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1)              
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shapeList,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=thumbwidth,thumbheight=thumbheight,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}]    
                #dictionary['thumbnail']=thumbnail       
                
            except Exception as e:
                print("error",e)
                
            return dictionary 
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
        thumbwidth = convertToFloat(request.GET.get('thumbwidth',"96"),96)
        thumbheight = convertToFloat(request.GET.get('thumbheight',"96"),96)
        if is_number(id) :            
            files = File.objects.filter(id__icontains=id)
            for eachfile in files:               
                data = exportToPartGLTF("Media/"+eachfile.file.name,distancegap,anglegap,thumbwidth,thumbheight)
        else:
            id = request.GET.get('file', None)
            if id is not None:
                data = exportToPartGLTF("Media/"+id,distancegap,anglegap,thumbwidth,thumbheight)
    return JsonResponse(data, safe=False) 

def swap(a, b):
    return b, a

def ExplodeParts(shape,dimension,explodegap,center):

    xmin, ymin, zmin, xmax, ymax, zmax = dimension 
    xc, yc, zc = (xmin+xmax)/2, (ymin+ymax)/2 , (zmin+zmax)/2
    xd, yd, zd = xmax-xmin, ymax-ymin, zmax-zmin
    lenShape = len(shape)
   
    maxGap = ( 1 if (lenShape==0) else (lenShape-1) ) * explodegap
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
    xs  = 1+ ( maxGap / xd )
    ys  = 1+ ( maxGap / yd )
    zs  = 1+ ( maxGap / zd )
    newShapes=[]
    moveArrays=[]
    #shapesdim=[]
    shapesdis=[]
    shapesvol=[]
    shapeorder=[]
    fullShape,converted = list_of_shapes_to_compound(shape)
    if(converted):
        newShapes.append(fullShape)
    else:
        firstTime = True
        for aShape in shape:
            newShapes.append(aShape)
            if firstTime:
                firstTime = False
            else:
                moveArrays.append((0, 0, 0))
    for i  in range(lenShape):
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = get_bounding_details(shape[i]) 
        xmove, ymove, zmove = (((xmins+xmaxs)/2)-xc)*xs, (((ymins+ymaxs)/2)-yc)*ys, (((zmins+zmaxs)/2)-zc)*zs
        newShape=translate_shp(shape[i],xmove+xt, ymove+yt, zmove+zt, True)
        newShapes.append(newShape)
        moveArrays.append((xmove, ymove, zmove))
        #shapesdim.append(xmins+xmove+xt, ymins+ymove+xt, zmins+zmove+xt, xmaxs+xmove+xt, ymaxs+ymove+xt, zmaxs+zmove+xt)
        shapesdis.append( ((xmins+xmaxs)/2+xmove-xc)**2+((ymins+ymaxs)/2+ymove-yc)**2+((zmins+zmaxs)/2+zmove-zc)**2 )
        shapesvol.append((xmaxs-xmins)*(ymaxs-ymins)*(zmaxs-zmins))
        shapeorder.append(i)    
    """  for i in range(lenShape):
        print("before",hash(newShapes[i+1]),moveArrays[i],shapeorder[i]) """
    if(center):
        for i in range(1,lenShape-1):
            for j in range(1,lenShape-1-i):
                if (shapesdis[j+1] < shapesdis[j]) or ((shapesdis[j+1] == shapesdis[j]) and (shapesvol[j+1] < shapesvol[j])):
                    shapeorder[j+1], shapeorder[j] = swap(shapeorder[j+1], shapeorder[j])                
                    shapesdis[j+1], shapesdis[j] = swap(shapesdis[j+1], shapesdis[j])
                    shapesvol[j+1], shapesvol[j] = swap(shapesvol[j+1], shapesvol[j])
    """ for i in range(lenShape):
        print("after",hash(newShapes[i+1]),moveArrays[i],shapeorder[i]) """
    return newShapes, moveArrays, shapeorder


def exportToAssemblyGLTF(sourceFileName,distancegap,anglegap,explodegap,center,thumbwidth,thumbheight):
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
                shape = conversion.read_step_file(sourceFileName, as_compound=False)                
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,
                    edgesize=0, vertexsize=0,thumbwidth=0,thumbheight=0).dump()
                dimension, _ = outputShapes
                nshape, moveArrays, shapeorder = ExplodeParts(shape,dimension,explodegap,center)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=nshape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=thumbwidth,thumbheight=thumbheight,
                    edgesize=0, vertexsize=0, animations=moveArrays,shapeorder=shapeorder).dump()
                #dictionary['thumbnail']=thumbnail
                """  print(len(nshape))
                for i in range(1, len(nshape)):
                    print('theshape', hash(nshape[i]), moveArrays[i-1]) """

            except Exception as e:
                print("error",e)
                
            return dictionary           
            
        if file_extension=="stl" :            
            try:
                shape = conversion.read_stl_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump()
                dimension, _ = outputShapes
                shape, moveArrays = ExplodeParts(shape,dimension,explodegap,center)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=thumbwidth,thumbheight=thumbheight,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()           
                #dictionary['thumbnail']=thumbnail
            except Exception as e:
                print("error",e)
                
            return (dictionary,outputShapes) 
        if file_extension=="igs" or file_extension=="iges" :
            try:               
                shape = conversion.read_iges_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump()
                dimension, _ = outputShapes
                shape, moveArrays = ExplodeParts(shape,dimension,explodegap,center)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,
                    edgesize=0, vertexsize=0, animations=moveArrays, thumbheight=thumbheight,thumbwidth=thumbwidth).dump()          
                #dictionary['thumbnail']=thumbnail
            except Exception as e:
                print("error",e)
                
            return dictionary
        if file_extension=="brep" :            
            try:
                shape = conversion.read_brep_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                    edgesize=0, vertexsize=0).dump()
                dimension, _ = outputShapes
                shape, moveArrays = ExplodeParts(shape,dimension,explodegap,center)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbheight=thumbheight,thumbwidth=thumbwidth,
                    edgesize=0, vertexsize=0, animations=moveArrays).dump()           
                #dictionary['thumbnail']=thumbnail
            except Exception as e:
                print("error",e)
                
            return dictionary 
        if file_extension=="dxf" :            
            try:
                shape = OCPImporters.importDXFObjects(sourceFileName, tol=distancegap )
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,distancegap=distancegap,anglegap=anglegap,
                    thumbwidth=0,thumbheight=0).dump() 
                #faces_dict, edges_dict, vertices_dict =  getFacesDimensions(shape[0])                
                dimension, _ = outputShapes
                shape, moveArrays = ExplodeParts(shape,dimension,explodegap,center)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shape,includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbheight=thumbheight, thumbwidth=thumbwidth,
                    edgesize=0, vertexsize=0, animations=moveArrays,delay=1).dump()          
                #dictionary['thumbnail']=thumbnail
            except Exception as e:
                print("error",e)
                
            return dictionary 
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
        thumbwidth = convertToFloat(request.GET.get('thumbwidth',"96"),96)
        thumbheight = convertToFloat(request.GET.get('thumbheight',"96"),96)
        print(id,distancegap,anglegap,explodegap,center)
        if is_number(id) :            
            files = File.objects.filter(id__icontains=id)
            for eachfile in files:               
                data = exportToAssemblyGLTF("Media/"+eachfile.file.name,distancegap,anglegap,explodegap,center,thumbwidth,thumbheight)
        else:
            id = request.GET.get('file', None)
            if id is not None:
                data = exportToAssemblyGLTF("Media/"+id,distancegap,anglegap,explodegap,center,thumbwidth,thumbheight)
    return JsonResponse(data, safe=False)      
    