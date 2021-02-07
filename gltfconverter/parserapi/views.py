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
        id = id.replace('"','')
        print("converting",id,key)
#        id="2e537c1c57a0a0dc91c28f879e69f8fa.STEP"
        print("converting",id,key)
        filename, file_extension = os.path.splitext(id)
        print(filename, file_extension)
        sourcefilename = key+id			
        print(sourcefilename)		
        newfilename = "../client/public/Display/"+Path(sourcefilename).resolve().stem + ".gltf"
        print(newfilename)		
        file_extension = file_extension.lower()
        print(file_extension, filename, id, newfilename)
        file_type = ""
        if file_extension==".stp" or file_extension==".step" :
            file_type = "step"
        if file_extension==".stl" or file_extension==".svg" or file_extension==".amf" or file_extension==".json" :
            file_type = file_extension[1:]
        if file_type != "" :
            #Exceptions = True		
            #sourcefilename = 'Media/2e537c1c57a0a0dc91c28f879e69f8fa.step'
            '''while Exceptions :
                try:
                    with open(sourcefilename) as f:
                       data = f.read()
                       lenData = len(data)
                       Exception = (lenData<=0)
                except IOError as x:
                    if x.errno == errno.ENOENT:
                       Exception = False #print '- does not exist'//'''
            #f=open(sourcefilename,"r")
            #data=f.readline()
            #f.close()
#            if data :
#                print(data.length)			
            #print(sourcefilename,"DATA",data, len(data))
#            print(sourcefilename,"before read")
#            f=open("Media/50mm_SWD_Flex_Spline_Helical_Gear_Iter_1_10.19.2020.STEP","r")
#            data=f.readline()
#            f.close()
#            if data :
#                print(data.length)
#            print("Media/50mm_SWD_Flex_Spline_Helical_Gear_Iter_1_10.19.2020.STEP","DATA",data)
  
            mypart = Part.importer(file_type)(sourcefilename)
            mypart.exporter('gltf')(newfilename)
            f = open(newfilename, "r")
            data = f.read()
            f.close()
    return data
    
@api_view(['GET'])
def FileGetView(request):
    id = request.GET.get('id', None)
    #print(id)
    data = []
    if id is None:
        id = 10
    if id is not None:
        files = File.objects.filter(id__icontains=id)
        if request.method == 'GET':
            for eachfile in files:
                filename, file_extension = os.path.splitext(eachfile.filename)				
                newfilename = 'Display/'+Path(eachfile.file.name).resolve().stem + ".gltf"
                file_extension = file_extension.lower()
                #print(file_extension, filename, eachfile.file.name, newfilename)
                #print(eachfile)
                file_type = ""
                if file_extension==".stp" or file_extension==".step" :
                     file_type = "step"
                if file_extension==".stl" or file_extension==".svg" or file_extension==".amf" or file_extension==".json" :
                     file_type = file_extension[1:]
                if file_type != "" :					 
                     print('Media/'+eachfile.file.name)		
                     mypart = Part.importer(file_type)('Media/'+eachfile.file.name)
                     mypart.exporter('gltf')(newfilename)
                     f = open(newfilename, "r")
                     data = f.read()
                     f.close()
    #print(data)
    return JsonResponse(data, safe=False)
