from django.http.response import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.parsers import FileUploadParser
from rest_framework.parsers import JSONParser

from parserapi.models import File
from .serializers import FileSerializer
 

from inspect import getmembers
from types import FunctionType

import json
#import jsonpickle
#import pprint
import glob
import os
import sys

from pathlib import Path
from .structparts import Part
from .structparts import Assembly
from .structparts.codec.step import *
from .structparts.codec.mstep import *
from .structparts import conversion
from .structparts.structquery.occ_impl import OCPDataExchange
from .structparts.structquery.occ_impl import OCPStepAnalyser

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
        parser_class = (FileUploadParser,)
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

""" 
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
"""

	
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
        file_extension = file_extension[1:].lower()
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

def exportToStep(sourceFileName):
    """
    Imports a file based on the type (BREP, IGES)
    :param importType: The type of file that we're importing
    :param sourceFileName: THe name of the file that we're importing
    :param destFileName: THe name of the file that we're exporting
    """
    #Now read and return the shape
   
    try:
       
              
        # Hence using OCC directly
        filename, file_extension = os.path.splitext(sourceFileName)
        destFileNames = []
        file_extension = file_extension[1:].lower()
        newfilenamewithoutext = "Display/"+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        if file_extension=="stp" or file_extension=="step" :           
            return (sourceFileName, True)         
        if file_extension=="stl" :
            shape = conversion.read_stl_file(sourceFileName)
            conversion.write_step_file(shape, newfilename, application_protocol="AP242DIS")
            return (newfilename, True)
        if file_extension=="igs" or file_extension=="iges" :
            shape = conversion.read_iges_file(sourceFileName, return_as_shapes=False)
            conversion.write_step_file(shape, newfilename, application_protocol="AP242DIS")
            return (newfilename, True)
        return ("", False)
       
    except:
        raise ValueError("File Could not be loaded")  

def splitFile(id,key):
    data =[]
    if id or is_number(id) :
        filename, file_extension = os.path.splitext(id)
        sourcefilename = key+id
        newfilenamewithoutext = "Display/"+Path(id).resolve().stem
        try:
            (destFileName, converted) = exportToStep(sourcefilename)            
            if converted :
                head, tail = os.path.split(destFileName)
                filename, file_extension = os.path.splitext(tail)
                newfilename = "Display/"+filename+".gltf"
                try:
                    myassemblies = Assembly.importer('step')(destFileName)
                    data = myassemblies.exporter('mstep')(newfilename)
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

@api_view(['GET'])
def FileSplit(request):
    data = []
    if request.method == 'GET':
        id = request.GET.get('id', None)
        #print(id)
        
        if is_number(id) :
            if id==0:
               id = request.GET.get('file', None)
               data = splitFile(id,"Media/")
            else :
                files = File.objects.filter(id__icontains=id)
                for eachfile in files:
                   data = splitFile(eachfile.file.name,"Media/")
        else:
            id = request.GET.get('file', None)
            data = splitFile(id,"Media/")
    return JsonResponse(data, safe=False)

def exportToHierarchyStep(sourceFileName,includeparts,distancegap,anglegap):
    """
    Imports a file based on the type (BREP, IGES)
    :param importType: The type of file that we're importing
    :param sourceFileName: THe name of the file that we're importing
    :param destFileName: THe name of the file that we're exporting
    """
    #Now read and return the shape
   
    try:
       
        
        """# FreeCAD conversion has bugs...
        shape = Part.Shape()
    
        shape.read(sourceFileName)
    
        shape.exportStep(destFileName) 
        """        
        # Hence using OCC directly
        filename, file_extension = os.path.splitext(sourceFileName)
        
        file_extension = file_extension[1:].lower()
        newfilenamewithoutext = "Display/"+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        if file_extension=="stp" or file_extension=="step" :           
            
            try:
                (output, tuples, dictionary) = OCPStepAnalyser.StepAnalyser(filename=sourceFileName,includeparts=includeparts,distancegap=distancegap,anglegap=anglegap,).dump()
                
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
            shape = conversion.read_stl_file(sourceFileName)
            conversion.write_step_file(shape, newfilename, application_protocol="AP242DIS")
            return(newfilename, False)
        if file_extension=="igs" or file_extension=="iges" :
            shape = conversion.read_iges_file(sourceFileName, return_as_shapes=False)
            conversion.write_step_file(shape, newfilename, application_protocol="AP242DIS")
            return(newfilename, False)
        return ("",True)
       
    except:
        raise ValueError("File Could not be loaded")  

def splitHierarchyFile(id,key,includeparts,distancegap,anglegap):
    data =[]
    if id or is_number(id) :
        filename, file_extension = os.path.splitext(id)
        sourcefilename = key+id
        newfilenamewithoutext = "Display/"+Path(id).resolve().stem
        try:
            (data, converted) = exportToHierarchyStep(sourcefilename,includeparts,distancegap,anglegap)
            if converted:
                return data
            else:   
                if data :         
                    (data, converted) = exportToHierarchyStep(data,includeparts,distancegap,anglegap)
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
        includeparts = request.GET.get('includeparts',"false").lower()
        distancegap = request.GET.get('distancegap',"0.1")
        anglegap = request.GET.get('anglegap',"0.5")
        #print(includeparts)
        if includeparts=='true':
            includeparts = True
            print("I am including minorparts")
        else:
            includeparts = False
            print("I am excluding minorparts")
        try:
            if distancegap:
                distancegap = float(distancegap)
            else:
                distancegap = 0.1
        except:
            distancegap = 0.1
            pass
        
        try:
            if anglegap:
                anglegap = float(anglegap)
            else:
                anglegap = 0.5
        except:
            anglegap = 0.5
            pass

        print("Got request for",id,includeparts,distancegap,anglegap)
        
        if is_number(id) :
            if id==0:
               id = request.GET.get('file', None)
               data = splitHierarchyFile(id,"Media/",includeparts,distancegap,anglegap)
            else :
                files = File.objects.filter(id__icontains=id)
                for eachfile in files:
                   data = splitHierarchyFile(eachfile.file.name,"Media/",includeparts,distancegap,anglegap)
        else:
            id = request.GET.get('file', None)
            data = splitHierarchyFile(id,"Media/",includeparts,distancegap,anglegap)
    return JsonResponse(data, safe=False)