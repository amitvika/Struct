from django.http.response import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.parsers import FileUploadParser
from rest_framework.parsers import JSONParser

from parserapi.models import File
from .serializers import FileSerializer

import glob
import os
from pathlib import Path
from cqparts import Part
from cqparts import Assembly
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

def is_number(value):
    try:
        value = Decimal(value)
        return True
    except:
        return False   
		
def getFile(id,key):
    data =[]
    if id or is_number(id) :
        print("converting",id,key)
        filename, file_extension = os.path.splitext(id)
        print(filename, file_extension)
        sourcefilename = key+id			
        print(sourcefilename)
        newfilenamewithoutext = newfilename = "Display/"+Path(id).resolve().stem		
        newfilename = newfilenamewithoutext + ".gltf"
        print(newfilename)		
        file_extension = file_extension.lower()
        print(file_extension, filename, id, newfilename)
        file_type = ""
        if file_extension==".stp" or file_extension==".step" :
            file_type = "step"
        if file_extension==".stl" or file_extension==".svg" or file_extension==".amf" or file_extension==".json" :
            file_type = file_extension[1:]
        if file_type != "" :					 
            #mypart = Part.importer(file_type)(sourcefilename)
            #mypart.exporter('gltf')(newfilename)
            #f = open(newfilename, "r")
            #data = f.read()
            #f.close()
            myassemblies = Assembly.importer(file_type)(sourcefilename)
            #mycount = 0
            #newfilename = newfilenamewithoutext+str(mycount)+".gltf"
            myassemblies.exporter('gltf')(newfilename)
            print("My assemblies", myassemblies)
            f = open(newfilename, "r")
            data = f.read()
            f.close()            
           
    return data
    
@api_view(['GET'])
def FileGetView(request):
    data = []
    if request.method == 'GET':
        id = request.GET.get('id', None)
        print(id)
        
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
