
#from itertools import chain
#from math import ceil


from xml.dom.expatbuilder import parseString
from django.http.response import JsonResponse, FileResponse
#from numpy import diagonal
from rest_framework import status
from rest_framework.decorators import api_view
#from rest_framework.parsers import FileUploadParser
from rest_framework.parsers import JSONParser
from rest_framework.views import set_rollback

from .models import File
from .serializers import FileSerializer
#from .settingscopy import (DISPLAY_URL,MEDIA_URL)

from inspect import getmembers
from types import FunctionType

import json
#import jsonpickle
import pprint
from glob import glob
import os
#import sys
import math
import pickle
import threading
#import random
import html

from datetime import datetime
from pathlib import Path
from decimal import Decimal 
import traceback
import logging

#import textwrap

from logging.handlers import TimedRotatingFileHandler

#from .structparts import Part
from .structparts import (Assembly, conversion)
#from .structparts.codec.step import (Importer, Exporter)
#from .structparts.codec.mstep import Exporter
#from .structparts import conversion
#from .structparts.structquery.occ_impl import OCPDataExchange
from .structparts.structquery.occ_impl import (OCPStepIGESAnalyser, OCPImporters)
from .structparts.structquery.occ_impl.gltfDictionary import gltfdict
from .structparts.structquery.occ_impl.OCCExtend.ShapeFactory import (
    translate_shp, rotate_shp_3_axis, minimum_distance, minimum_z_distance, 
    minimum_distance_only, scale_shape, getPartStackablePositions, get_bounding_details,
    get_oriented_bounding_details, recognize_direction, recognize_entity, getDictionaryFromOBB) #rotate_shape,
from .structparts.structquery.occ_impl.OCCExtend.TopologyUtils import list_of_shapes_to_compound #, excluded_list_of_shapes_to_compound
from .structparts.structquery.occ_impl.OCCUtils.Topology import dumpTopologyStructures, dumpTopologyFacesEdgesVertices#, roundoff #, getShapeLocationAndDirection 

#from OCC.Core.TopAbs import (TopAbs_FACE, TopAbs_Orientation)
from OCC.Core.gp import gp_Pnt #, gp_Trsf, gp_Ax3, gp_Ax2, gp_Dir, gp_XYZ
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox, BRepPrimAPI_MakeSphere
#from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Common
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
#from OCC.Core.Tesselator import ShapeTesselator
#from OCC.Core.BRep import  BRep_Tool
#from OCC.Core.TopoDS import (topods_Vertex)

from .settingscopy import (DISPLAY_URL,MEDIA_URL,S3_BUCKET)
#from .dirSync import checkIdle, copyTree
from .recursivecopier import RecursiveCopier, copyFilesRecursive
from .assemblyorder import FindAssemblingOrder
from .assemblystack import FindStackability
from .matrixinv.matrixinv import getMatrixInverse

class HttpFormatter(logging.Formatter):

    def _formatHeaders(self, d):
        return '\n'.join(f'{k}: {v}' for k, v in d.items())

    def formatMessage(self, record):
        return super().formatMessage(record)        
        """ if record.req:
            result += textwrap.dedent('''
                ---------------- request ----------------
                {req.method} {req.url}
                {reqhdrs}

                {req.body}
                ---------------- response ----------------
                {res.status_code} {res.reason} {res.url}
                {reshdrs}

                {res.text}
            ''').format(
                req=record.req,
                res=record.res,
                reqhdrs=self._formatHeaders(record.req.headers),
                reshdrs=self._formatHeaders(record.res.headers),
            )

        return result """
fileLogger = "Media/Log/APIWatcher.Log"
timeLogger = "Media/TimeWatcher.txt"
try:
    os.makedirs(os.path.dirname(fileLogger), exist_ok=True)
    os.makedirs(os.path.dirname(timeLogger), exist_ok=True)
    logprintinfo = "Log Dir Creations "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
    #logging.info("Log Dir Creations "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S"))
    print(logprintinfo)
except Exception as e:
    print("Exception in creating files",e)

""" class RecursiveCopier():

    def __init__(self,interval,hFunction):
        self.t=interval
        self.hFunction = hFunction
        self.timelag = 0
        self.thread=None
        try:
            logging.info("Syncer "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S"))
        except Exception as e:
            print("Error while logging",e)
        try:
            with open(timeLogger, 'w') as fh:
                fh.write("Syncer "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S"))
            filetime = datetime.fromtimestamp(os.stat(timeLogger).st_mtime)
            currenttime=datetime.utcnow()
            self.timelag=(filetime-currenttime).total_seconds()            
        except Exception as e:
            print("Error while accessing", fileLogger, timeLogger, e)
            
    
    def handle_function(self):
        try:
            self.hFunction(self.timelag)
        except Exception as e:
            print("Error while copying in handle_function", e)
        try:
            self.start()
        except Exception as e:
            print("Error while starting thread for copying", e)

    def start(self):
        self.cancel()
        self.thread = threading.Timer(self.t,self.handle_function)
        if(self.thread):
            try:
                self.thread.daemon=True
            except Exception as e:
                print("There is an error while setting daemon in copying function",e)
            self.thread.start()
        else:
            print("I am unable to create a thread for copy routine")

    def cancel(self):
        if(self.thread):
            try:
                self.thread.cancel()
            except Exception as e:
                print("There is an error while cancelling thread",e)

    def timeUTCLagFromServer(self):
        return self.timelag    """ 

""" def copyFiles(timelag):
    try:
        if checkIdle(timelag,fileLogger) > 1600:            
            logprintinfo="Syncer Started "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
            logging.info(logprintinfo)
            print(logprintinfo)
            copyTree("Media/", "s3bucket/Media/",False,0,100)
            logprintinfo="Media Syncer Completed "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
            logging.info(logprintinfo)
            print(logprintinfo)
            copyTree("Display/", "s3bucket/Display/",True,0,100)
            logprintinfo="Display Syncer Completed "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
            logging.info(logprintinfo)
            print(logprintinfo)
        else:
            print("I am not Idle to move files from Linux box to S3Box")
    except Exception as e:
        print("Error while moving",e) """

logHandler = TimedRotatingFileHandler(fileLogger,when="midnight")
#logFormatter = logging.Formatter('%(asctime)s %(message)s')
logFormatter = HttpFormatter('{asctime} {levelname} {name} {message}', style='{')
logHandler.setFormatter( logFormatter )
logger = logging.getLogger()
logger.addHandler( logHandler )
logger.setLevel( logging.INFO )

def logRoundtrip(response, *args, **kwargs): 
        extra = {
            'req': {
                'method': response.request.method,
                'url': response.request.url,
                'headers': response.request.headers,
                'body': response.request.body,
            }, 
            'res': {
                'code': response.status_code,
                'reason': response.reason,
                'url': response.url,
                'headers': response.headers,
                'body': response.text
            },
        }
        logger.debug('HTTP roundtrip', extra=extra)

RecursiveCopier(1500, copyFilesRecursive, logging, fileLogger, timeLogger).start()
gltf_dict = gltfdict()

@api_view(['GET', 'POST', 'DELETE'])
def FileUploadView(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
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
            #print("About to serialize",request.data['filename'])
            file_serializer = FileSerializer(data=request.data)
            #f = request.data['file']
            #file_serializer.data['file']=f
            #file_serializer.filename = f.name
            #print("Check Valid",file_serializer.data)
            if file_serializer.is_valid():
                #print("Saving",file_serializer.data)
                file_serializer.save()
                #print("Saved",file_serializer.data)
                return JsonResponse(file_serializer.data, status=status.HTTP_201_CREATED) 
            return JsonResponse(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            count = File.objects.all().delete()
            return JsonResponse({'message': '{} files were deleted successfully!'.format(count[0])}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

@api_view(['GET', 'PUT', 'DELETE'])
def FileReplaceView(request, pk):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
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
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

@api_view(['POST'])
def FileUploadChunk(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        if request.method == 'POST':
            filecontent = request.data['data']
            #chunckcount = request.data['total']
            counter = request.data['id']
            uuid = request.data['uuid']
            filename = request.data['filename']
            newfilename = MEDIA_URL+uuid+"/"+filename
            try:
                if(counter=="1") :       
                    print("Directory", os.path.dirname(newfilename))         
                    os.makedirs(os.path.dirname(newfilename), exist_ok=True)
                    openflag = 'wb'
                else:
                    openflag = 'ab'
                fileswritten = 0
                with open(newfilename, openflag) as fh:
                    fileswritten = fh.write(filecontent.read())
                return JsonResponse({"uuid":uuid,"filename":filename,"bytes":fileswritten,"isSuccess":True}, status=status.HTTP_201_CREATED) 
            except Exception as e:
                print("Error while saving",e,request.data)
                return JsonResponse({'errorMessage': e,"isSuccess":False},status=status.HTTP_400_BAD_REQUEST, safe=False)        
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

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
        newfilenamewithoutext = newfilename = DISPLAY_URL+Path(id).resolve().stem		
        newfilename = newfilenamewithoutext + ".gltf"
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        #print(file_extension, filename, id, key, newfilename)
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
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':
            id = request.GET.get('id', None)
            #print(id)        
            if is_number(id) :
                if id==0:
                    #id = request.GET.get('file', None)
                    data = getFile(id,MEDIA_URL)
                else :
                    files = File.objects.filter(id__icontains=id)
                    for eachfile in files:
                        data = getFile(eachfile.file.name,MEDIA_URL)
            else:
                #id = request.GET.get('file', None)
                data = getFile(id,MEDIA_URL)
        return JsonResponse(data, safe=False)
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

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
        newfilenamewithoutext = DISPLAY_URL+Path(sourceFileName).resolve().stem
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
        return ({}, False)
       
    except:
        return ({},False)
        #raise ValueError("File Could not be loaded")  

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
        newfilenamewithoutext = DISPLAY_URL+Path(sourceFileName).resolve().stem
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
        return ({},True)
       
    except:
        return ({},True)
        #raise ValueError("File Could not be loaded")  


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
                newfilename = DISPLAY_URL+filename+".gltf"
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



MOVEONLY=1
ROTATEONLY=2
MOVEANDROTATE=3
ROTATEANDMOVE=4

def getShapeFromPickle(fname):
    fnamepath = DISPLAY_URL+fname+".pickle"
    if not os.path.isfile(fnamepath):
        fnamepath = S3_BUCKET+fnamepath#DISPLAY_URL+fname+".pickle"
        if not os.path.isfile(fnamepath):
            fnamepath = None
    shellshape=None
    if fnamepath:
        with open(fnamepath, 'rb') as f:
            # The protocol version used is detected automatically, so we do not
            # have to specify it.
            shellshape = pickle.load(f)
    return fnamepath, shellshape

def findMinimumDistance(xmove,ymove,zmove,xrotate,yrotate,zrotate,moverotate,fname,sname):
    firstshell = None
    secondshell = None
    try:
        fnamepath, firstshell = getShapeFromPickle(fname)
        """ if not os.path.isfile(fnamepath):
           fnamepath = S3_BUCKET+DISPLAY_URL+fname+".pickle"
           if not os.path.isfile(fnamepath):
               fnamepath = None
        if fnamepath:
            with open(fnamepath, 'rb') as f:
                # The protocol version used is detected automatically, so we do not
                # have to specify it.
                firstshell = pickle.load(f) """
        snamepath, secondshell = getShapeFromPickle(sname)
        """ snamepath = DISPLAY_URL+sname+".pickle"
        if not os.path.isfile(snamepath):
           snamepath = S3_BUCKET+DISPLAY_URL+sname+".pickle"
           if not os.path.isfile(snamepath):
               snamepath = None
        if snamepath:
            with open(snamepath, 'rb') as f:
                # The protocol version used is detected automatically, so we do not
                # have to specify it.
                secondshell = pickle.load(f)  """
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
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':
            id = request.GET.get('id', None)
            includeparts =OCPStepIGESAnalyser.convertToBool(request.GET.get('includeparts',"false"),False)
            distancegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
            anglegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
            disectparts = OCPStepIGESAnalyser.convertToBool(request.GET.get('disectparts',"false"),False)
            moverotate = OCPStepIGESAnalyser.convertToInt(request.GET.get('moverotate',"0"),0)   
            thumbwidth = OCPStepIGESAnalyser.convertToInt(request.GET.get('thumbwidth',"300"),300)
            thumbheight = OCPStepIGESAnalyser.convertToInt(request.GET.get('thumbheight',"300"),300)   
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
                            data = splitFile(eachfile.file.name,MEDIA_URL,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
                        else:
                            data = splitFileCadQuery(eachfile.file.name,MEDIA_URL,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
                else:
                    #id = request.GET.get('file', None)
                    if id is not None:
                        if includeparts:
                            data = splitFile(id,MEDIA_URL,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
                        else:
                            data = splitFileCadQuery(id,MEDIA_URL,distancegap,anglegap,disectparts,moverotate,thumbwidth,thumbheight)
        return JsonResponse(data, safe=False)
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

def createShapeArray(shapes):
    shapeArray=[]
    myID=0
    for aShape in shapes:
        myID += 1
        shapeArray.append((aShape,"ID"+str(myID),None))
    return shapeArray

def exportToHierarchyGLTF(
    sourceFileName,includeparts,distancegap,anglegap,
    disectparts,moverotate,edgesize,vertexsize,
    thumbwidth,thumbheight,maximumfaces,seperateparts,
    CreateChildSteps,CreateAssemblyOrder,CreateStackability,
    explodegap,holescale,removegap,center,animationtime,
    createfromtree,refid):
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
        newfilenamewithoutext = DISPLAY_URL+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        
        if file_extension=="stp" or file_extension=="step" or file_extension=="igs" or file_extension=="iges" :           
            
            try:
                ( _,  _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,includeparts=includeparts,distancegap=distancegap,
                    anglegap=anglegap,disectparts=disectparts,moverotate=moverotate,
                    thumbwidth=thumbwidth,thumbheight=thumbheight, logging=logging, 
                    seperateparts=seperateparts, edgesize=edgesize, vertexsize=vertexsize,
                    maximumfacestoinclude=maximumfaces,CreateChildSteps=CreateChildSteps,
                    CreateAssemblyOrder=CreateAssemblyOrder,CreateStackability=CreateStackability,
                    explodegap=explodegap,holescale=holescale,removegap=removegap,center=center,
                    delay=animationtime,recursiveTree=createfromtree,refid=refid).dump()
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
                    thumbwidth=thumbwidth,thumbheight=thumbheight, logging=logging, 
                    seperateparts=seperateparts,moverotate=moverotate,edgesize=edgesize,
                    vertexsize=vertexsize, maximumfacestoinclude=maximumfaces,
                    CreateChildSteps=CreateChildSteps,CreateAssemblyOrder=CreateAssemblyOrder,
                    CreateStackability=CreateStackability,explodegap=explodegap,holescale=holescale,
                    removegap=removegap,center=center,delay=animationtime,recursiveTree=createfromtree,refid=refid).dump() 
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
                    thumbwidth=thumbwidth,thumbheight=thumbheight, logging=logging, 
                    seperateparts=seperateparts,moverotate=moverotate,edgesize=edgesize,
                    vertexsize=vertexsize, maximumfacestoinclude=maximumfaces,
                    CreateChildSteps=CreateChildSteps,CreateAssemblyOrder=CreateAssemblyOrder,
                    CreateStackability=CreateStackability,explodegap=explodegap,holescale=holescale,
                    removegap=removegap,center=center,delay=animationtime,recursiveTree=createfromtree,refid=refid).dump()  
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
                    thumbwidth=thumbwidth,thumbheight=thumbheight, logging=logging, 
                    seperateparts=seperateparts, moverotate=moverotate,edgesize=edgesize, 
                    vertexsize=vertexsize, maximumfacestoinclude=maximumfaces,
                    CreateChildSteps=CreateChildSteps,CreateAssemblyOrder=CreateAssemblyOrder,
                    CreateStackability=CreateStackability,explodegap=explodegap,holescale=holescale,
                    removegap=removegap,center=center,delay=animationtime,recursiveTree=createfromtree,refid=refid).dump() 
                #dictionary['thumbnail']=thumbnail
            except Exception as e:
                print("error",e)                
            return (dictionary, True)
        return (dictionary, True)
       
    except:
        return ({},True)
        #raise ValueError("File Could not be loaded")  

def splitHierarchyFile(
    id,key,includeparts,distancegap,anglegap,disectparts,moverotate,
    edgesize,vertexsize,thumbwidth,thumbheight,maximumfaces,seperateparts,
    CreateChildSteps,CreateAssemblyOrder,CreateStackability,
    explodegap,holescale,removegap,center,animationtime,createfromtree,refid):
    data =[]
    if id or is_number(id) :
        _, file_extension = os.path.splitext(id)
        sourcefilename = key+id
        #newfilenamewithoutext = "Display/"+Path(id).resolve().stem
        try:
            (data, converted) = exportToHierarchyGLTF(
                sourcefilename,includeparts,distancegap,anglegap,disectparts,moverotate,
                edgesize,vertexsize,thumbwidth,thumbheight,maximumfaces,seperateparts,
                CreateChildSteps,CreateAssemblyOrder,CreateStackability,
                explodegap,holescale,removegap,center,animationtime,createfromtree,refid)
            if converted:
                return data
            else:   
                if data :         
                    (data, converted) = exportToHierarchyGLTF(
                        data,includeparts,distancegap,anglegap,disectparts,moverotate,
                        edgesize,vertexsize,thumbwidth,thumbheight,maximumfaces,seperateparts,
                        CreateChildSteps,CreateAssemblyOrder,CreateStackability,
                        explodegap,holescale,removegap,center,animationtime,createfromtree,refid)
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
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':
            id = request.GET.get('id', None)
            refid = request.GET.get('refid','')
            includeparts =OCPStepIGESAnalyser.convertToBool(request.GET.get('includeparts',"false"),False)
            distancegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
            anglegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
            disectparts = OCPStepIGESAnalyser.convertToBool(request.GET.get('disectparts',"false"),False)
            moverotate = OCPStepIGESAnalyser.convertToInt(request.GET.get('moverotate',"0"),0)  
            edgesize = OCPStepIGESAnalyser.convertToFloat(request.GET.get('edgesize',"0.3"),0.3) 
            vertexsize = OCPStepIGESAnalyser.convertToFloat(request.GET.get('vertexsize',"0.3"),1.0)
            createthumb = OCPStepIGESAnalyser.convertToBool(request.GET.get('createthumb',"false"),False)
            if createthumb==True:
                defthumb=300
                defthumbstr="300"
            else:
                defthumb=0
                defthumbstr="0"
            thumbwidth = OCPStepIGESAnalyser.convertToInt(request.GET.get('thumbwidth',defthumbstr),defthumb)
            thumbheight = OCPStepIGESAnalyser.convertToInt(request.GET.get('thumbheight',defthumbstr),defthumb)
            maximumfaces = OCPStepIGESAnalyser.convertToInt(request.GET.get('maximumfaces',"50"),50)
            seperateparts = OCPStepIGESAnalyser.convertToBool(request.GET.get('seperateparts',"false"),False)
            
            CreateChildSteps=OCPStepIGESAnalyser.convertToBool(request.GET.get('CreateChildSteps',"false"),False)
            CreateAssemblyOrder=OCPStepIGESAnalyser.convertToBool(request.GET.get('CreateAssemblyOrder',"false"),False)
            CreateStackability=OCPStepIGESAnalyser.convertToBool(request.GET.get('CreateStackability',"false"),False)           
            explodegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('explodegap',"10"),10)
            holescale = OCPStepIGESAnalyser.convertToFloat(request.GET.get('holescale',"0.77"),0.77)
            removegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('removegap',"8.0"),8.0)
            center = OCPStepIGESAnalyser.convertToBool(request.GET.get('center',"true"),True)
            animationtime = OCPStepIGESAnalyser.convertToFloat(request.GET.get('animationtime',"1.0"),1.0)
            createfromtree = OCPStepIGESAnalyser.convertToBool(request.GET.get('createchilds',"false"),False)
            #print(includeparts)
            if includeparts:           
                print("I am including minorparts")
            else:
                print("I am excluding minorparts")
            if disectparts:           
                print("I am disecting to get vertices")
            else:            
                print("I am not disecting to get vertices")      
            print("Got request for",id,includeparts,distancegap,anglegap,disectparts,moverotate,edgesize,vertexsize,thumbwidth,thumbheight,maximumfaces,seperateparts)
            if moverotate==0:
                if is_number(id) :            
                    files = File.objects.filter(id__icontains=id)
                    for eachfile in files:
                        data = splitHierarchyFile(
                            eachfile.file.name,MEDIA_URL,includeparts,distancegap,anglegap,disectparts,
                            moverotate,edgesize,vertexsize,thumbwidth,thumbheight,maximumfaces,seperateparts,
                            CreateChildSteps,CreateAssemblyOrder,CreateStackability,
                            explodegap,holescale,removegap,center,animationtime,createfromtree,refid)
                else:
                    #id = request.GET.get('file', None)
                    if id is not None:
                        data = splitHierarchyFile(
                            id,MEDIA_URL,includeparts,distancegap,anglegap,disectparts,moverotate,edgesize,
                            vertexsize,thumbwidth,thumbheight,maximumfaces,seperateparts,
                            CreateChildSteps,CreateAssemblyOrder,CreateStackability,
                            explodegap,holescale,removegap,center,animationtime,createfromtree,refid)
            """ if ((edgesize!=0) or (vertexsize !=0)):
                try:
                    gdtfile = "Display/"+data["store"]+".gdt"
                    print("Writing,",gdtfile)
                    with open(gdtfile, 'w') as fh:
                        fh.write(json.dumps(data["gdttable"], sort_keys=True, indent=2 ))
                except Exception as e:
                    print("Error while writing gdtfile",e) """
        return JsonResponse(data, safe=False)
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

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
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':
            my2textures = get2DTextures("Media/2D/")        
            my3textures = get3DTextures("Media/3D/")
            data = {"textures2D":my2textures,"textures3D":my3textures}
        return JsonResponse(data, safe=False)
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

@api_view(['GET'])
def FileGetFiles(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        files = []
        if request.method == 'GET':
            files = File.objects.all()        
            id = request.GET.get('id', None)
            if id is not None:
                files = files.filter(id__icontains=id)  
        files_list = [ {"id":afile.id,"file":afile.file.path,"filename":afile.filename} for afile in files ]
        #print(files_list)
        return JsonResponse(files_list, safe=False)
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

@api_view(['GET'])
def FileGetMinimumDistance(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':        
            xmove = OCPStepIGESAnalyser.convertToFloat(request.GET.get('xmove',"0.0"),0.0)
            ymove = OCPStepIGESAnalyser.convertToFloat(request.GET.get('ymove',"0.0"),0.0)
            zmove = OCPStepIGESAnalyser.convertToFloat(request.GET.get('zmove',"0.0"),0.0)
            xrotate = OCPStepIGESAnalyser.convertToFloat(request.GET.get('xrotate',"0.0"),0.0)
            yrotate = OCPStepIGESAnalyser.convertToFloat(request.GET.get('yrotate',"0.0"),0.0)
            zrotate = OCPStepIGESAnalyser.convertToFloat(request.GET.get('zrotate',"0.0"),0.0)
            fname = request.GET.get('fname',"")
            sname = request.GET.get('sname',"")
            moverotate = OCPStepIGESAnalyser.convertToInt(request.GET.get('moverotate',"0"),0)              
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
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

def IsEqualWithTollerance(first,second,tollerance):
    difference = first-second
    return (difference >= -tollerance) and (difference <=tollerance)

def CompareWithTollerance(first,second,tollerance):    
    difference = first-second
    if (difference >= -tollerance) and (difference <=tollerance):
        return 0
    if difference > 0:
        return 1
    if difference < 0:
        return -1
    return 0

def IsCircular(checkEntity):
    return (checkEntity["kind"]=="Sphere") or (checkEntity["kind"]=="Cylinder") or\
                (checkEntity["kind"]=="Circle") or (checkEntity["kind"]=="Cone") 
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
        if(firstAxis and secondAxis):               
            coplaner = firstAxis.IsCoplanar (secondAxis, 0.1, 0.5)
            firstDir = firstAxis.Direction()
            secondDir = secondAxis.Direction()
            parallel = firstDir.IsParallel(secondDir, 0.1)
            normal = firstDir.IsNormal(secondDir, 0.1)
            opposite = firstDir.IsOpposite(secondDir, 0.1)            
            concentric = (firstEntity["center"]==secondEntity["center"])
            if concentric==False:
                concentric=firstDir.IsEqual(secondDir,0.1)
                if concentric==True:
                    ex=IsEqualWithTollerance(firstDir.X(),secondDir.X(),0.1)
                    ey=IsEqualWithTollerance(firstDir.Y(),secondDir.Y(),0.1)
                    ez=IsEqualWithTollerance(firstDir.Z(),secondDir.Z(),0.1)
                    concentric = ( (ex) or  (ey) or (ez) ) and \
                        ( ( (IsCircular(firstEntity) and IsCircular(secondEntity) ) ) or \
                            (firstEntity["type"]=="Face" and secondEntity["type"]=="Face") )
                    
            print(firstEntity["center"],secondEntity["center"],concentric,firstDir.X(),firstDir.Y(),firstDir.Z(), secondDir.X(),secondDir.Y(),secondDir.Z())
            if ( IsCircular(firstEntity) and (firstEntity["kind"]==secondEntity["kind"])): 
                coradial = (firstEntity["radius"] == secondEntity["radius"]) and concentric
            else:
                coradial = False  
            angle = firstDir.Angle(secondDir)         
           
        return firstEntity["kind"], secondEntity["kind"], coplaner, parallel, normal, opposite, concentric, coradial, angle
    else:
        return 'None', 'None', coplaner, parallel, normal, opposite, concentric, coradial, angle
        


def compareDimension(dim1, dim2):
    x1size, y1size, z1size = dim1.XHSize(), dim1.YHSize(), dim1.ZHSize()
    x2size, y2size, z2size = dim2.XHSize(), dim2.YHSize(), dim2.ZHSize()
    minsize = min(x2size,y2size,z2size)
    print(x1size,y1size,z1size)
    print(x2size,y2size,z2size)
    print(minsize)
    if (minsize==z2size) and \
        ( CompareWithTollerance(x2size,x1size,0.01)==-1 or \
            CompareWithTollerance(y2size,y1size,0.01)==-1 ):
        return True
    if (minsize==y2size) and \
        ( CompareWithTollerance(z2size,z1size,0.01)==-1 or \
            CompareWithTollerance(x2size,x1size,0.01)==-1 ):
        return True
    if (minsize==x2size) and \
        ( CompareWithTollerance(y2size,y1size,0.01)==-1 or \
            CompareWithTollerance(z2size,z1size,0.01)==-1 ):
        return True
    return False

""" def roundoff(point):
        multiplier = 1
        if(sys.maxsize/10000 > point) :
            multiplier = 10000
        else:
            if(sys.maxsize/1000 > point) :
                multiplier = 1000
            else:
                if(sys.maxsize/100 > point) :
                    multiplier = 100
                else:
                    if(sys.maxsize/10 > point) :
                        multiplier = 10
                    else:
                        multiplier = 1   
    
        return round(point*multiplier,2) / multiplier """
        
""" def getDictionaryFromOBB(obb,draft=False):
    if obb:
        aBaryCenter = obb.Center()
        aXDir = obb.XDirection()
        aYDir = obb.YDirection()
        aZDir = obb.ZDirection()
        axx = roundoff(aXDir.X(),draft)
        axy = roundoff(aXDir.Y(),draft)
        axz = roundoff(aXDir.Z(),draft)
        ayx = roundoff(aYDir.X(),draft)
        ayy = roundoff(aYDir.Y(),draft)
        ayz = roundoff(aYDir.Z(),draft)
        azx = roundoff(aZDir.X(),draft)
        azy = roundoff(aZDir.Y(),draft)
        azz = roundoff(aZDir.Z(),draft)
        xsize, ysize, zsize = roundoff(obb.XHSize(),draft), roundoff(obb.YHSize(),draft), roundoff(obb.ZHSize(),draft)
        xcenter,ycenter,zcenter = roundoff(aBaryCenter.X(),draft), roundoff(aBaryCenter.Y(),draft), roundoff(aBaryCenter.Z(),draft)
        return {
            "xx": axx, "xy": axy, "xz": axz,
            "yx": ayx, "yy": ayy, "yz": ayz,
            "zx": azx, "zy": azy, "zz": azz,
            "cx": xcenter, "cy": ycenter, "cz": zcenter,
            "sx": xsize, "sy": ysize, "sz": zsize
        }
    else:
        return {
            "xx": 0, "xy": 0, "xz": 0,
            "yx": 0, "yy": 0, "yz": 0,
            "zx": 0, "zy": 0, "zz": 0,
            "cx": 0, "cy": 0, "cz": 0,
            "sx": 0, "sy": 0, "sz": 0
        }  """

def getMaxDirectionFromOBB(obb):
    if obb:
        xsize, ysize, zsize =  obb.XHSize() ,  obb.YHSize() ,  obb.ZHSize() 
        if (zsize >= xsize) and (zsize >= ysize):
            aDir = obb.ZDirection()
        elif (ysize >= zsize) and (ysize >= xsize):
            aDir = obb.YDirection()
        else:
            aDir = obb.XDirection()
        return (aDir.X(), aDir.Y(), aDir.Z())
    else:
        return (0,0,0)

def CreateSphereFromCenter(center,vertexsize=0.1,circular=False):
        
    #center = obb.Center()
    centerX, centerY, centerZ = center
    if circular:
        return BRepPrimAPI_MakeSphere(gp_Pnt(centerX,centerY,centerZ), vertexsize).Shape()
    else:
        corner = gp_Pnt(centerX-vertexsize, centerY-vertexsize, centerZ-vertexsize)
        return BRepPrimAPI_MakeBox(corner,vertexsize*2,vertexsize*2,vertexsize*2).Shape()

def getValueFromJSONKey(jsonstruct, key):
    if key in jsonstruct:
        return jsonstruct[key]
    else:
        return None

@api_view(['GET', 'POST'])
def FileGetShapeInfo(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':  
            #mydict = requestparse(request.GET.urlencode())             
            #print(mydict)    
            sname = request.GET.get('fname',"")         
            if sname=="":
                start = OCPStepIGESAnalyser.convertToInt(request.GET.get('start',"0"),0)
                steps = request.GET.get('steps',"")   
                fnames=steps.split(",")                
                parents = request.GET.get('parents',"")
                pnames=parents.split(",")  
            else:
                fnames=[sname]
                pnames=[sname]
                start=0
        elif request.method == 'POST':
            start = OCPStepIGESAnalyser.convertToInt(request.data['start'],0) 
            steps = request.data['steps']   
            fnamesteps= json.loads(steps)
            fnames=fnamesteps['steps']
            #siblings = request.data['siblings']   
            #pnamesteps= json.loads(siblings)
            #pnames = pnamesteps['siblings']
            parts = request.data['parts']
            partsteps=json.loads(parts)
            partnames=partsteps['parts']            
            guid = request.data['uuid'] 
            if guid!='':
                guid = guid+'/'
        print(start,fnames,partnames)
        structArray=[]
        thisshell=[]
        #thisparent=[]
        #mateCollection=[]
        for index in range(len(fnames)):
            fname = fnames[index]        
            #print("Got request for",fname,index,start)
            if fname:
                try:
                    _, appendable = getShapeFromPickle(guid+fname)
                    """ fnamepath = DISPLAY_URL+guid+fname+".pickle"
                    if not os.path.isfile(fnamepath):
                        fnamepath = S3_BUCKET+DISPLAY_URL+guid+fname+".pickle"
                        if not os.path.isfile(fnamepath):
                            fnamepath = None
                    appendable=None
                    if fnamepath:
                        with open(fnamepath, 'rb') as f:
                            appendable = pickle.load(f)  """
                    thisshell.append(appendable)
                    data = []
                    if index >=start :
                        dumpTopologyStructures(thisshell[index],level=0,parentId=[None],returnStructure=data,faceInfo=None, depth=1)
                        thisdimension = get_oriented_bounding_details(thisshell[index])                        
                        thisdictionary = getDictionaryFromOBB(thisdimension)
                        if(len(data)==0):
                            data=[{'type':'None'}]
                        data[0]['obb']=thisdictionary
                        
                        foundHole=False
                        if((data[0]['type']=='Edge') and (data[0]['Info']['kind']=='Circle')):
                            thiscenterpointXYZ = thisdimension.Center()
                            thiscenterpoint=(thiscenterpointXYZ.X(),thiscenterpointXYZ.Y(),thiscenterpointXYZ.Z())
                            thisradius=0.1
                            if 'center' in data[0]['Info']:  
                                thiscenterpoint = data[0]['Info']['center'] 
                            if 'radius' in data[0]['Info']:  
                                thisradius = OCPStepIGESAnalyser.convertToFloat(data[0]['Info']['radius'],0.1) / 1.6

                            thisdimension = get_oriented_bounding_details(thisshell[index])
                            """ thissiblings = pnames[index]                                
                            for sibling in thissiblings:
                                try:
                                    with open("Display/"+guid+sibling+".pickle", 'rb') as fs:
                                        thissibling = pickle.load(fs)
                                        siblingdimension =  get_oriented_bounding_details(thissibling)
                                        bigger = compareDimension(siblingdimension,thisdimension)
                                        if bigger:
                                            data[0]['fill']="Hole"
                                            foundHole=True
                                            break
                                except Exception as e:
                                    print("Error while loading",sibling) """
                            thisparentpartname = partnames[index]
                            try:

                                _, thisparentpart = getShapeFromPickle(guid+thisparentpartname)
                                """ fnamepath = DISPLAY_URL+guid+thisparentpartname+".pickle"
                                thisparentpart = None
                                if not os.path.isfile(fnamepath):
                                    fnamepath = S3_BUCKET+DISPLAY_URL+guid+thisparentpartname+".pickle"
                                    if not os.path.isfile(fnamepath):
                                        fnamepath = None
                                if fnamepath:
                                    with open(fnamepath, 'rb') as fs:                                   
                                        thisparentpart = pickle.load(fs) """   
                                
                                """ with open(DISPLAY_URL+guid+thisparentpartname+".pickle", 'rb') as fs:
                                    thisparentpart = pickle.load(fs) """

                                smallcube = CreateSphereFromCenter(thiscenterpoint,vertexsize=thisradius)
                                whatwegot = minimum_distance_only(smallcube,thisparentpart)
                                if whatwegot <= 0.001:
                                    data[0]['fill']="Soild"
                                else:
                                    print("Distance",whatwegot)
                                    data[0]['fill']="Hole"
                                foundHole=True
                            except Exception as e:
                                print("Error while loading",thisparentpartname,e)

                        if foundHole==False:
                            data[0]['fill']="Soild"
                        
                        print(fname,data)
                        """ elif thisparent[index]:
                                parentdict=recognize_entity(thisparent[index])
                                if 'Info' in parentdict :
                                    if 'fill' in parentdict['Info']:
                                        data[0]['fill']=parentdict['Info']['fill']
                                    else:
                                        data[0]['fill']="NoFill" 
                                else:
                                    data[0]['fill']="NoInfo"                                
                        else:
                            if(data[0]['type']=='Face'):
                                if 'Info' in data[0] :
                                    if 'fill' in data[0]['Info']:
                                        data[0]['fill']=data[0]['Info']['fill']
                                    else:
                                        data[0]['fill']="NoFill" 
                                else:
                                    data[0]['fill']="NoInfo"
                            else:
                                data[0]['fill']="" """
                        mateArray=[]
                        for mateindex in range(index):
                            mymates = findMates(thisshell[mateindex],thisshell[index])
                            mateArray.append((mymates))
                        structArray.append((data,(mateArray)))                            
                except Exception as e:
                    print("Error while loading",fname,e)
        #print("Struct Array in Shape Info",structArray)           
        return JsonResponse(structArray, safe=False)
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)
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

def duplicateShapes(shape,dimension,depthable,stackable,filename,basefilename,displaypath,starttime=None):  
    if starttime==None:
        starttime=datetime.utcnow()
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
            
        getEmptyDictionary(filename,basefilename,displaypath,45,starttime,False)    
        distance = 1e10
        prevdistance = 0
        currenttime=datetime.utcnow()
        previoustime=currenttime
        while distance > 1e-2:
            currenttime = datetime.utcnow()
            timingdelta = currenttime-previoustime
            if (timingdelta.total_seconds() > 5):
                getEmptyDictionary(filename,basefilename,displaypath,55,starttime,False)
                previoustime=currenttime
            AnotherShape=translate_shp(shape[0],xmove, ymove, zmove, True)
            (wdistance, distance, points1, points2) = minimum_z_distance(shape[0],AnotherShape)
            AnotherShape=translate_shp(shape[0],xmove, ymove, zmove-wdistance, True)
            myshapecommon = BRepAlgoAPI_Common(AnotherShape,shape[0]).Shape()
            if myshapecommon==None:
                distance = wdistance  
                zmove -= wdistance
            _,_,zmins,_,_,zmaxs= get_bounding_details(myshapecommon)             
            if (zmaxs-zmins) < wdistance:
                distance = wdistance-zmaxs+zmins 
                zmove = zmove-wdistance+zmaxs-zmins 
                print("Dmove0", zmove, distance, wdistance, points1, points2, prevdistance) 
                AnotherShape=translate_shp(shape[0],xmove, ymove, zmove, True)
                (wdistance, distance, points1, points2) = minimum_z_distance(shape[0],AnotherShape)
            else:        
                print(get_bounding_details(myshapecommon))    
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
            noOfDuplicates = 1+math.ceil(min(xmax-xmin,ymax-ymin) / (zmove))
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

def exportToPartGLTF(sourceFileName,distancegap,anglegap,animationtime=1.0,starttime=None,refid=''):#,thumbwidth,thumbheight):
    """
    Imports a file based on the type (STEP, IGES, BREP, STL)    
    """
    #Now read and return the shape
   
    try:
        
        if starttime==None:
            starttime=datetime.utcnow()
        
        dictionary={}
        _, file_extension = os.path.splitext(sourceFileName)
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        newfilenamewithoutext = DISPLAY_URL+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        outputShapes={}
        if file_extension=="stp" or file_extension=="step" :          
            
            try:
                shape = conversion.read_step_file(sourceFileName, as_compound=True)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True, logging=logging, 
                    thumbwidth=0,thumbheight=0, edgesize=0, vertexsize=0, suffixname="S",refid=refid).dump()
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
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0, suffixname="S",refid=refid).dump()
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
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0, suffixname="S",refid=refid).dump()
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
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True, logging=logging, 
                    thumbwidth=0,thumbheight=0, edgesize=0, vertexsize=0, suffixname="S",refid=refid).dump()
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
                    filename=sourceFileName,shapeslist=createShapeArray(shape),ascompound=True, logging=logging, 
                    distancegap=distancegap,anglegap=anglegap, suffixname="S",refid=refid).dump() 
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
            dimension, myShapes = outputShapes
            shapeArrayOrder,_,_,_,_ = getShapesFromOutPutShapes(myShapes,dictionary["tree"],None)
            #fullShape,_ = list_of_shapes_to_compound(shape,True)
            #shapeStackList = [(fullShape,assemblyStackName,Quantity_Color(sR,sG,sB, Quantity_TOC_RGB))]
            getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],30,starttime,False)
            dictionary = FindStackability(sourceFileName,shapeArrayOrder,dimension,distancegap=distancegap,\
                anglegap=anglegap,animationtime=animationtime,starttime=starttime,logging=logging,refid=refid).dump()
        except Exception as e:
            print("error calling stackablity from view",e)
        """ try:
            dimension, _ = outputShapes
            xmin, ymin, zmin, xmax, ymax, zmax = dimension 
            getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],30,starttime,False)
            if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                shape = [rotate_shp_3_axis(shape[0],0,90,0, unity="deg", copy=True)] 
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True, logging=logging, 
                thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0, suffixname="S").dump() 
            else:
                if( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                    shape = [rotate_shp_3_axis(shape[0],90,0,0, unity="deg", copy=True)] 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0, suffixname="S").dump()
            getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],35,starttime,False)  
            #print(outputShapes)
            dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1) 
            getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],40,starttime,False)             
            shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable,sourceFileName,dictionary["store"],dictionary["display"])
            getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],60,starttime,False)
            #print("Reached here1",shapeList)                         
            (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                filename=sourceFileName,shapeslist=createShapeArray(shapeList),includeparts=False,distancegap=distancegap,
                anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0, logging=logging, 
                edgesize=0, vertexsize=0, animations=moveArrays, delay=animationtime).dump()
            
            #print("Reached here2")
            dictionary["stackable"] = [{"count":replications,"stack":stackable}]
        except Exception as e:
            print("error",e)      
       
        try:
            stackfile = dictionary["display"]+dictionary["store"]+".stack"
            print("Writing,",stackfile)
            with open(stackfile, 'w') as fh:
                fh.write(json.dumps(dictionary["stackable"], sort_keys=True, indent=2 ))
        except Exception as e:
            print("Error while writing stackfile",e)  """
        getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],100,starttime,False)     
        return dictionary
       
    except:
        return {}
        #raise ValueError("File Could not be loaded")   

@api_view(['GET'])
def FileGetStackablePositions(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':
            id = request.GET.get('id', None)
            refid = request.GET.get('refid','')
            distancegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
            anglegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
            animationtime = OCPStepIGESAnalyser.convertToFloat(request.GET.get('animationtime',"1.0"),1.0)
            starttime = datetime.utcnow() 
            #thumbwidth = convertToFloat(request.GET.get('thumbwidth',"96"),96)
            #thumbheight = convertToFloat(request.GET.get('thumbheight',"96"),96)
            if is_number(id) :            
                files = File.objects.filter(id__icontains=id)
                for eachfile in files: 
                    basefilename,displaypath = getBasefileNameAndDisplayPath(MEDIA_URL+eachfile.file.name,0,"M")
                    data = getEmptyDictionary(MEDIA_URL+eachfile.file.name,basefilename,displaypath,0,starttime,True)               
                    data = exportToPartGLTF(MEDIA_URL+eachfile.file.name,distancegap,anglegap,animationtime,starttime,refid)#,thumbwidth,thumbheight)
            else:
                #id = request.GET.get('file', None)
                if id is not None:
                    basefilename,displaypath = getBasefileNameAndDisplayPath(MEDIA_URL+id,0,"M")
                    data = getEmptyDictionary(MEDIA_URL+id,basefilename,displaypath,0,starttime,True) 
                    data = exportToPartGLTF(MEDIA_URL+id,distancegap,anglegap,animationtime,starttime,refid)#,thumbwidth,thumbheight)
        return JsonResponse(data, safe=False) 
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)
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

def getStackedShape(aShape,zmin,zmax,zhigh,direction,boxshape,shapeTol,gapTol,debugMe) :
    dirX, dirY, dirZ = direction
    shapeList =[]
    shapeList.append(aShape)
    """ denominator = gapTol
    if denominator==0:
        denominator=1
    numerator = max(abs(shapeTol),abs(zmax-zmin))
    if numerator==0:
        numerator=1    
    noOfDuplicates = ceil(abs(shapeTol/gapTol))
    xmove = gapTol * dirX
    ymove = gapTol * dirY 
    zmove = gapTol * dirZ 
    #Duplicating is Taking Too much time and hence gone with lower 2 parts and upper 2 parts instead of all continous parts..
    toReduceDuplicates=min(noOfDuplicates,3)
    for i in range(1,toReduceDuplicates):
        print(i,noOfDuplicates, xmove*i, ymove*i, zmove*i )
        AnotherShape=translate_shp(aShape,xmove*i, ymove*i, zmove*i, True)
        shapeList.append(AnotherShape)
        
    if toReduceDuplicates < noOfDuplicates:        
        for i in range(1,toReduceDuplicates):
            print(i,noOfDuplicates, xmove*(noOfDuplicates-i), ymove*(noOfDuplicates-i), zmove*(noOfDuplicates-i) )
            AnotherShape=translate_shp(aShape,xmove*(noOfDuplicates-i), ymove*(noOfDuplicates-i), zmove*(noOfDuplicates-i), True)
            shapeList.append(AnotherShape) """

    denominator = zmax-zmin
    if denominator==0:
        denominator=1
    numerator = abs(zhigh-zmin)
    if numerator==0:
        numerator=1

    """ if(denominator>10): #Tolerance
        AnotherShape=translate_shp(aShape,10*dirX, 10*dirY, 10*dirZ, True)
        shapeList.append(AnotherShape) """
     
    xmove = denominator * dirX
    ymove = denominator * dirY 
    zmove = denominator * dirZ 
    AnotherShape=translate_shp(aShape,xmove, ymove, zmove, True)
    shapeList.append(AnotherShape)   
    """ 
    #Duplicating is Taking Too much time and hence gone with a tolerance and box
    noOfDuplicates = ceil(numerator/denominator)   
    for i in range(1,noOfDuplicates):
        #print(i,noOfDuplicates, xmove*i, ymove*i, zmove*i )
        AnotherShape=translate_shp(aShape,xmove*i, ymove*i, zmove*i, True)
        shapeList.append(AnotherShape) 
    """

    if (boxshape != None):
        shapeList.append(boxshape)
    fullShape,_ = list_of_shapes_to_compound(shapeList)
    #shift by gaptol to check any objects just next to the object..
    if gapTol < denominator:
        fullShiftShape = translate_shp(fullShape,gapTol*dirX, gapTol*dirY, gapTol*dirZ, True)
    #else:
        fullShiftShape = fullShape
    #fullShiftShape = fullShape
    if debugMe:
        print("StackedShape",denominator,numerator,xmove, ymove, zmove,shapeTol,gapTol,shapeTol/gapTol)
    return fullShiftShape

def checkAnyHole(myShapeOuter,myShapeInner,holescale=0.8,debugMe=False):
    try:
        myShapeCommon = BRepAlgoAPI_Common(myShapeOuter,myShapeInner).Shape()
    except Exception as e:
        print("Exception while performing shape common",e)
        return True, None
    if (myShapeCommon == None):
        if debugMe:
            print("No common between these objects")
        return True, None
    #print("Reached here1")
    xminc, yminc, zminc, xmaxc, ymaxc, zmaxc = get_bounding_details(myShapeCommon)
    #print("Reached here2")
    try:
        scaleInnerShape = scale_shape(myShapeCommon, holescale, holescale, holescale)
    except Exception as e:
        print("Exception while scaling shape common",e)
        return True, None
    #print("Reached here3")
    xmind, ymind, zmind, xmaxd, ymaxd, zmaxd = get_bounding_details(scaleInnerShape)
    #print("Reached here4")
    scaledShape = translate_shp(scaleInnerShape,(xmaxc+xminc-xmaxd-xmind)/2,(ymaxc+yminc-ymaxd-ymind)/2,(zmaxc+zminc-zmaxd-zmind)/2,True)
    #print("Reached here5")
    try:
        myShapeHole = BRepAlgoAPI_Common(scaledShape,myShapeOuter).Shape()
    except Exception as e:
        print("Exception while performing hole common",e)
        return True, None    
    if (myShapeHole == None):
        if debugMe:
            print("Hole between these objects")
        return True, None
    #print("Reached here7")
    myHoleDimension = get_bounding_details(myShapeHole)
    #print("Reached here8") 
    if myHoleDimension == (0, 0, 0, 0, 0, 0) :
        #if debugMe:
        #    print("Holes between these objects")
        return True, None
    else:
        #try:
        #    tessellatable = OCPStepIGESAnalyser.isTessellatable(myHoleDimension)
        #except Exception as e:
        #    tessellatable=True
        #    print("Error in tesselation", e)
        tessellatable=True
        if tessellatable:
            print("No Holes between these objects with dimension",myHoleDimension)
            return False, myShapeHole
        else:
            print("Not tessellatable Holes between these objects with dimension",myHoleDimension)
            return True, myShapeHole
    
def writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,xDist,yDist,zDist,suffix, debugMe=False):
    if debugMe:
        displayfile = DISPLAY_URL
        try:
            aColor = Quantity_Color(0, 0, 1, Quantity_TOC_RGB)
            colorfile = displayfile+"MyShapeCommon"+suffix+"_COLOR.step"                             
            OCPStepIGESAnalyser.StepExportWithColor(shape=commonHoleShape,color=aColor,name="MyShapeCommon").write_file(filename=colorfile)
            colorfile = displayfile+"MyShapeCompound"+suffix+"_COLOR.step"                             
            OCPStepIGESAnalyser.StepExportWithColor(shape=myShapeInner,color=aColor,name="MyShapeCompound").write_file(filename=colorfile)
            colorfile = displayfile+"MyShapeOuter"+suffix+"_COLOR.step"                             
            OCPStepIGESAnalyser.StepExportWithColor(shape=tranShape,color=aColor,name="MyShapeOuter").write_file(filename=colorfile)
            colorfile = displayfile+"MyShapeInner"+suffix+"_COLOR.step"                             
            OCPStepIGESAnalyser.StepExportWithColor(shape=myCommonShape,color=aColor,name="MyShapeInner").write_file(filename=colorfile)
            mycommonholeshape = translate_shp(commonHoleShape,xDist,yDist,zDist,True)       
            myCommonShapez = translate_shp(myCommonShape,xDist*2,yDist*2,zDist*2,True)
            myCommonCompundz = translate_shp(myShapeInner,xDist*3,yDist*3,zDist*3,True)
            tranShapez = translate_shp(tranShape,xDist*4,yDist*4,zDist*4,True)
            shapex=[myCommonShapez,tranShapez,myShapeOuter,myCommonCompundz,mycommonholeshape]
            fullShapex,_ = list_of_shapes_to_compound(shapex)
            colorfile = displayfile+"MyShapeMergedX"+suffix+"_COLOR.step"                             
            OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapex,color=aColor,name="MyShapeMergedX").write_file(filename=colorfile)
            shapey=[myCommonShape,myShapeOuter]
            fullShapey,_ = list_of_shapes_to_compound(shapey)
            colorfile = displayfile+"MyShapeOriginal"+suffix+"_COLOR.step"                             
            OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapey,color=aColor,name="MyShapeOriginal").write_file(filename=colorfile)
            shapez=[commonHoleShape,myCommonShapez,tranShapez]
            fullShapez,_ = list_of_shapes_to_compound(shapez)
            colorfile = displayfile+"MyShapeMergedZ"+suffix+"_COLOR.step"                             
            OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapez,color=aColor,name="MyShapeMergedZ").write_file(filename=colorfile)
            shapeyz=[myCommonShape,tranShape]
            fullShapeyz,_ = list_of_shapes_to_compound(shapeyz)
            colorfile = displayfile+"MyShapeTrans"+suffix+"_COLOR.step"                             
            OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapeyz,color=aColor,name="MyShapeTransT").write_file(filename=colorfile)
                                        
        except Exception as e:
            print(e,"File, %s has error" % colorfile) 
    

def makeCuboid(x,y,z,dx,dy,dz):
    corner = gp_Pnt(x, y, z)            
    myBox = BRepPrimAPI_MakeBox(corner,dx,dy,dz).Shape()
    return myBox
    
def checkCommonHoleInDirection(myShapeOuter,myOuterDimension,myShapeInner,myInnerDimension,direction,holescale=0.8,removegap=1.0,explodegap=10.0,debugMe=False):
    #return True, None
    
    #dirX, dirY, dirZ = direction

    xmino, ymino, zmino, xmaxo, ymaxo, zmaxo = myOuterDimension
    xmini, ymini, zmini, xmaxi, ymaxi, zmaxi = myInnerDimension
    zminn, yminn, zminn, xmaxn, ymaxn, zmaxn = xmino, ymino, zmino, xmaxo, ymaxo, zmaxo
    myCount = 0
    holeFound = True
    myBox = None
    if (direction==(0,0,1)) :
        if (zmino <= zmaxi) :            
            """ corner = gp_Pnt(xmino-explodegap, ymino-explodegap, zmino-explodegap)            
            myBox = BRepPrimAPI_MakeBox(corner,(xmaxo-xmino)+2*explodegap,(ymaxo-ymino)+2*explodegap,(zmaxi-zmino)+2*explodegap).Shape()
            myCommonShape=BRepAlgoAPI_Common(myBox,myShapeInner).Shape() """
            myCommonShape=myShapeInner
            if myCommonShape==None:
                if debugMe:
                    print("Empty From Bottom To Top")
                return True, (0,0,1)
            myHoleDimension = myInnerDimension
            if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Empty Space From Bottom To Top")
                return True, (0,0,1)
            xminc, yminc, zminc, xmaxc, ymaxc, zmaxc = myHoleDimension
            holeFound = False
            if debugMe:
                print(myHoleDimension,myInnerDimension,myOuterDimension)
            if (zmaxo >= zminc) :
                #holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,holescale,debugMe) 
                holeFound=True
                zminn=0           
            else:
                zminn = (zminc-zmaxo) 
                #print("Reached here1a")
                tranShape = translate_shp(myShapeOuter,0,0,zminn,True)   
                #print("Reached here1b") 
                holeFound, _ = checkAnyHole(tranShape,myCommonShape,holescale,debugMe)                 
            while ( (holeFound==True) and ( (zminn+zmino) <= zmaxc) ):
                zminn += removegap
                #print("Reached here1c") 
                tranShape = translate_shp(myShapeOuter,0,0,zminn,True) 
                #print("Reached here1d") 
                holeFound, commonHoleShape = checkAnyHole(tranShape,myCommonShape,holescale,debugMe) 
                #print("Reached here1e")
                myCount += 1
                if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                    print("Holes only found so far",myCount,holeFound)
                    if (debugMe and holeFound==False):
                        writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,xmaxo-xmino+4*explodegap,0,0,"Top")  
            if (holeFound==True) :
                if debugMe:
                    print("Only holes From Bottom To Top",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                    writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,xmaxo-xmino+4*explodegap,0,0,"Top")  
            
                return True, (0,0,1)
        else:
            if debugMe:
                print("Away From Bottom To Top")
            return True, (0,0,1)
    if (direction==(0,0,-1)) :
        if  (zmaxo >= zmini) :
            """ corner = gp_Pnt(xmino-explodegap, ymino-explodegap, zmini-explodegap)            
            myBox = BRepPrimAPI_MakeBox(corner,(xmaxo-xmino)+2*explodegap,(ymaxo-ymino)+2*explodegap,(zmaxo-zmini)+2*explodegap).Shape()
            myCommonShape=BRepAlgoAPI_Common(myBox,myShapeInner).Shape() """
            myCommonShape=myShapeInner
            if myCommonShape==None:
                if debugMe:
                    print("Empty From Top To Bottom")
                return True, (0,0,-1)
            myHoleDimension = myInnerDimension
            if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Empty Space From Top To Bottom")
                return True, (0,0,-1)
            xminc, yminc, zminc, xmaxc, ymaxc, zmaxc = myHoleDimension
            holeFound = False
            if debugMe:
                print(myHoleDimension,myInnerDimension,myOuterDimension)
            if (zmino <= zmaxc) :
                #holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,holescale,debugMe) 
                holeFound=True 
                zmaxn=0           
            else:
                zmaxn = (zmaxc-zmino) 
                #print("Reached here2a")
                tranShape = translate_shp(myShapeOuter,0,0,zmaxn,True)   
                #print("Reached here2b") 
                holeFound, _ = checkAnyHole(tranShape,myCommonShape,holescale,debugMe)      
            while ( (holeFound==True) and ( (zmaxn+zmaxo) >= zminc) ):
                zmaxn -= removegap
                #print("Reached here2c")
                tranShape = translate_shp(myShapeOuter,0,0,zmaxn,True)   
                #print("Reached here2d") 
                holeFound, commonHoleShape = checkAnyHole(tranShape,myCommonShape,holescale,debugMe)
                #print("Reached here2e") 
                myCount += 1
                if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                    print("Holes only found so far",myCount,holeFound)
                    if (debugMe and holeFound==False):
                        writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,xmaxo-xmino+4*explodegap,0,0,"Bottom")
            if holeFound==True:
                if debugMe:
                    print("Only holes From Top To Bottom",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                    writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,xmaxo-xmino+4*explodegap,0,0,"Bottom")
           
                return True, (0,0,-1) 
        else:
            if debugMe:
                print("Away From Top to Bottom")
            return True, (0,0,-1)  
    if (direction==(1,0,0)) :
        if (xmino <= xmaxi) :           
            """ corner = gp_Pnt(xmino-explodegap, ymino-explodegap, zmino-explodegap)            
            myBox = BRepPrimAPI_MakeBox(corner,(xmaxi-xmino)+2*explodegap,(ymaxo-ymino)+2*explodegap,(zmaxo-zmino)+2*explodegap).Shape()
            myCommonShape=BRepAlgoAPI_Common(myBox,myShapeInner).Shape() """
            myCommonShape=myShapeInner
            if myCommonShape==None:
                if debugMe:
                    print("Empty From Left To Right")
                return True, (1,0,0)
            myHoleDimension = myInnerDimension
            if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Empty Space From Left To Right")
                return True, (1,0,0)
            xminc, yminc, zminc, xmaxc, ymaxc, zmaxc = myHoleDimension
            holeFound = False
            if debugMe:
                print(myHoleDimension,myInnerDimension,myOuterDimension)
            if (xmaxo >= xminc) :
                #holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,holescale,debugMe) 
                holeFound=True
                xminn=0           
            else:
                xminn = (xminc-xmaxo)
                #print("Reached here3a") 
                tranShape = translate_shp(myShapeOuter,xminn,0,0,True)
                #print("Reached here3b")    
                holeFound, _ = checkAnyHole(tranShape,myCommonShape,holescale,debugMe)                 
            while ( (holeFound==True) and ( (xminn+xmino) <= xmaxc) ):
                xminn += removegap
                #print("Reached here3c")
                tranShape = translate_shp(myShapeOuter,xminn,0,0,True)
                #print("Reached here3d")    
                holeFound, commonHoleShape = checkAnyHole(tranShape,myCommonShape,holescale,debugMe)
                #print("Reached here3e") 
                myCount += 1
                if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                    print("Holes only found so far",myCount,holeFound)
                    if (debugMe and holeFound==False):
                        writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,0,0,zmaxo-zmino+4*explodegap,"Right")                    
                    """ if (debugMe and holeFound==False):
                        try:
                            aColor = Quantity_Color(0, 0, 1, Quantity_TOC_RGB)
                            colorfile = "Display/"+"MyShapeCommon"+str(myCount)+"_COLOR.step"                             
                            OCPStepIGESAnalyser.StepExportWithColor(shape=commonHoleShape,color=aColor,name="MyShapeCommon").write_file(filename=colorfile)
                            shapex=[commonHoleShape]
                            fullShapex,_ = list_of_shapes_to_compound(shapex)
                            colorfile = "Display/"+"MyCommonCompound"+str(myCount)+"_COLOR.step"                             
                            OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapex,color=aColor,name="MyCommonCompound").write_file(filename=colorfile)
                            colorfile = "Display/"+"MyShapeOuter"+str(myCount)+"_COLOR.step"                             
                            OCPStepIGESAnalyser.StepExportWithColor(shape=myCommonShape,color=aColor,name="MyShapeOuter").write_file(filename=colorfile)
                            colorfile = "Display/"+"MyShapeInner"+str(myCount)+"_COLOR.step"                             
                            OCPStepIGESAnalyser.StepExportWithColor(shape=tranShape,color=aColor,name="MyShapeInner").write_file(filename=colorfile)
                            tranShapez = translate_shp(tranShape,0,0,zmaxo-zmino+4*explodegap,True)
                            myCommonShapez = translate_shp(myCommonShape,0,0,(zmaxo-zmino+4*explodegap)*2,True)
                            shapex=[myCommonShapez,tranShapez,myShapeOuter]
                            fullShapex,_ = list_of_shapes_to_compound(shapex)
                            colorfile = "Display/"+"MyShapeMergedX"+str(myCount)+"_COLOR.step"                             
                            OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapex,color=aColor,name="MyShapeMergedX").write_file(filename=colorfile)
                            shapey=[myCommonShape,myShapeOuter]
                            fullShapey,_ = list_of_shapes_to_compound(shapey)
                            colorfile = "Display/"+"MyShapeOriginal"+str(myCount)+"_COLOR.step"                             
                            OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapey,color=aColor,name="MyShapeOriginal").write_file(filename=colorfile)
                            shapez=[commonHoleShape,myCommonShapez,tranShapez]
                            fullShapez,_ = list_of_shapes_to_compound(shapez)
                            colorfile = "Display/"+"MyShapeMergedZ"+str(myCount)+"_COLOR.step"                             
                            OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapez,color=aColor,name="MyShapeMergedZ").write_file(filename=colorfile)
                                                      
                        except Exception as e:
                            print(e,"File, %s has error" % colorfile)  """
            if (holeFound==True) :
                if debugMe:
                    print("Only holes From Left To Right",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                    writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,0,0,zmaxo-zmino+4*explodegap,"Right")                    
                    
                return True, (1,0,0)
        else:
            if debugMe:
                print("Away From Left To Right")
            return True, (1,0,0)
    if (direction==(-1,0,0)) :
        if  (xmaxo >= xmini) :            
            """  corner = gp_Pnt(xmini-explodegap, ymino-explodegap, zmino-explodegap)            
            myBox = BRepPrimAPI_MakeBox(corner,(xmaxo-xmini)+2*explodegap,(ymaxo-ymino)+2*explodegap,(zmaxo-zmino)+2*explodegap).Shape()
            myCommonShape=BRepAlgoAPI_Common(myBox,myShapeInner).Shape() """
            myCommonShape=myShapeInner
            if myCommonShape==None:
                if debugMe:
                    print("Empty From Right To Left")
                return True, (-1,0,0)
            myHoleDimension = myInnerDimension
            if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Empty Space From Right To Left")
                return True, (-1,0,0)
            xminc, yminc, zminc, xmaxc, ymaxc, zmaxc = myHoleDimension
            holeFound = False
            if debugMe:
                print(myHoleDimension,myInnerDimension,myOuterDimension)
            if (xmino <= xmaxc) :
                #holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,holescale,debugMe) 
                holeFound=True 
                xmaxn=0           
            else:
                xmaxn = (xmaxc-xmino)
                #print("Reached here4a") 
                tranShape = translate_shp(myShapeOuter,xmaxn,0,0,True)
                #print("Reached here4b")    
                holeFound, _ = checkAnyHole(tranShape,myCommonShape,holescale,debugMe)      
            while ( (holeFound==True) and ( (xmaxn+xmaxo) >= xminc) ):
                xmaxn -= removegap
                #print("Reached here4c")
                tranShape = translate_shp(myShapeOuter,xmaxn,0,0,True)
                #print("Reached here4d")    
                holeFound, commonHoleShape = checkAnyHole(tranShape,myCommonShape,holescale,debugMe)
                #print("Reached here4e") 
                myCount += 1
                if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                    print("Holes only found so far",myCount,holeFound)
                    if (debugMe and holeFound==False):
                        writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,0,0,zmaxo-zmino+4*explodegap,"Left")                    
                    
            if holeFound==True:
                if debugMe:
                    print("Only holes From Right To Left",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                    writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,0,0,zmaxo-zmino+4*explodegap,"Left")                    

                return True, (-1,0,0) 
        else:
            if debugMe:
                print("Away From Right to Left")
            return True, (-1,0,0)  
    if (direction==(0,1,0)) :
        if (ymino <= ymaxi) :        
            """ corner = gp_Pnt(xmino-explodegap, ymino-explodegap, zmino-explodegap)            
            myBox = BRepPrimAPI_MakeBox(corner,(xmaxo-xmino)+2*explodegap,(ymaxi-ymino)+2*explodegap,(zmaxo-zmino)+2*explodegap).Shape()
            myCommonShape=BRepAlgoAPI_Common(myBox,myShapeInner).Shape() """
            myCommonShape=myShapeInner
            if myCommonShape==None:
                if debugMe:
                    print("Empty From Front To Back")
                return True, (0,1,0)
            myHoleDimension = myInnerDimension
            if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Empty Space From Front To Back")
                return True, (0,1,0)
            xminc, yminc, zminc, xmaxc, ymaxc, zmaxc = myHoleDimension
            holeFound = False
            if debugMe:
                print(myHoleDimension,myInnerDimension,myOuterDimension)
            if (ymaxo >= yminc) :
                #holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,holescale,debugMe) 
                holeFound=True
                yminn=0           
            else:
                yminn = (yminc-ymaxo)
                #print("Reached here5a") 
                tranShape = translate_shp(myShapeOuter,0,yminn,0,True)
                #print("Reached here5b")    
                holeFound, _ = checkAnyHole(tranShape,myCommonShape,holescale,debugMe)                 
            while ( (holeFound==True) and ( (yminn+ymino) <= ymaxc) ):
                yminn += removegap
                #print("Reached here5c")
                tranShape = translate_shp(myShapeOuter,0,yminn,0,True)
                #print("Reached here5d")    
                holeFound, commonHoleShape = checkAnyHole(tranShape,myCommonShape,holescale,debugMe)
                #print("Reached here5e") 
                myCount += 1
                if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                    print("Holes only found so far",myCount,holeFound)
                    if (debugMe and holeFound==False):
                        writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,xmaxo-xmino+4*explodegap,0,0,"Back")
            if (holeFound==True) :
                if debugMe:
                    print("Only holes From Front To Back",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                    writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,xmaxo-xmino+4*explodegap,0,0,"Back")
 
                return True, (0,1,0)
        else:
            if debugMe:
                print("Away From Front To Back")
            return True, (0,1,0)
    if (direction==(0,-1,0)) :
        if  (ymaxo >= ymini) :
            """ corner = gp_Pnt(xmino-explodegap, ymini-explodegap, zmino-explodegap)            
            myBox = BRepPrimAPI_MakeBox(corner,(xmaxo-xmino)+2*explodegap,(ymaxo-ymini)+2*explodegap,(zmaxo-zmino)+2*explodegap).Shape()
            myCommonShape=BRepAlgoAPI_Common(myBox,myShapeInner).Shape() """
            myCommonShape=myShapeInner
            if myCommonShape==None:
                if debugMe:
                    print("Empty From Back To Front")
                return True, (0,-1,0)
            myHoleDimension = myInnerDimension
            if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                if debugMe:
                    print("Empty Space From Back To Front")
                return True, (0,-1,0)
            xminc, yminc, zminc, xmaxc, ymaxc, zmaxc = myHoleDimension
            holeFound = False
            if debugMe:
                print(myHoleDimension,myInnerDimension,myOuterDimension)
            if (ymino <= ymaxc) :
                #holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,holescale,debugMe) 
                holeFound=True 
                ymaxn=0           
            else:
                ymaxn = (ymaxc-ymino)
                #print("Reached here6a") 
                tranShape = translate_shp(myShapeOuter,0,ymaxn,0,True)
                #print("Reached here6b")    
                holeFound, _ = checkAnyHole(tranShape,myCommonShape,holescale,debugMe)      
            while ( (holeFound==True) and ( (ymaxn+ymaxo) >= yminc) ):
                ymaxn -= removegap
                #print("Reached here6c")
                tranShape = translate_shp(myShapeOuter,0,ymaxn,0,True)
                #print("Reached here6d")    
                holeFound, commonHoleShape = checkAnyHole(tranShape,myCommonShape,holescale,debugMe) 
                #print("Reached here6e")
                myCount += 1
                if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                    print("Holes only found so far",myCount,holeFound)
                    if (debugMe and holeFound==False):                       
                        writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,xmaxo-xmino+4*explodegap,0,0,"Front")                           
                          
            if holeFound==True:
                if debugMe:
                    print("Only holes From Back To Front",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                    writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,xmaxo-xmino+4*explodegap,0,0,"Front")                           
                        
                return True, (0,-1,0) 
        else:
            if debugMe:
                print("Away From Back to Front")
            return True, (0,-1,0) 
    """ if (direction==(1,0,0)) :
        if (xmino <= xmaxi)  :
            
            holeFound = False
            
            if (xmaxo >= xmini) :
                #holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,holescale,debugMe) 
                holeFound=True 
                xminn=0           
            else:
                xminn = (xmini-xmaxo) 
                tranShape = translate_shp(myShapeOuter,xminn,0,0,True)    
                holeFound, _ = checkAnyHole(tranShape,myShapeInner,holescale,debugMe)       
            while ( (holeFound==True) and ( (xminn+zmino) <= xmaxi) ):
                xminn += removegap
                tranShape = translate_shp(myShapeOuter,xminn,0,0,True)    
                holeFound, _ = checkAnyHole(tranShape,myShapeInner,holescale,debugMe) 
                myCount += 1
                if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                    print("Holes only found so far",myCount,holeFound)
            if (holeFound==True) :
                if debugMe:
                    print("Only holes From Left To Right")
                return True, (1,0,0)
        else:
            if debugMe:
                print("Away From Left To Right")
            return True, (1,0,0)
    if (direction==(-1,0,0)):
        if (xmaxo >= xmini) :
            
            holeFound = False
            
            if (xmino <= xmaxi) :
                #holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,holescale,debugMe) 
                holeFound=True 
                xmaxn=0           
            else:
                xmaxn = (xmaxi-xmino) 
                tranShape = translate_shp(myShapeOuter,xmaxn,0,0,True)    
                holeFound, _ = checkAnyHole(tranShape,myShapeInner,holescale,debugMe)    
            while ( (holeFound==True) and ( (xmaxn+xmaxo) >= xmini) ):
                xmaxn -= removegap
                tranShape = translate_shp(myShapeOuter,xmaxn,0,0,True)    
                holeFound, _ = checkAnyHole(tranShape,myShapeInner,holescale,debugMe) 
                myCount += 1
                if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                    print("Holes only found so far",myCount,holeFound)
            if holeFound==True:
                if debugMe:
                    print("Only holes From Right To Left")
                return True, (-1,0,0) 
        else:
            if debugMe:
                print("Away From Right To Left")
            return True, (-1,0,0) 
    if (direction==(0,1,0)) :
        if (ymino <= ymaxi) :
            
            holeFound = False
            
            if (ymaxo >= ymini) :
                #holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,holescale,debugMe) 
                holeFound=True
                yminn=0           
            else:
                yminn = (ymini-ymaxo) 
                tranShape = translate_shp(myShapeOuter,0,yminn,0,True)    
                holeFound, _ = checkAnyHole(tranShape,myShapeInner,holescale,debugMe)  
            while ( (holeFound==True) and ( (yminn+ymino) <= ymaxi) ):
                yminn += removegap
                tranShape = translate_shp(myShapeOuter,0,yminn,0,True)    
                holeFound, _ = checkAnyHole(tranShape,myShapeInner,holescale,debugMe) 
                myCount += 1
                if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                    print("Holes only found so far",myCount,holeFound)
            if (holeFound==True) :
                if debugMe:
                    print("Only holes From Front To Back")
                return True, (0,1,0)
        else:
            if debugMe:
                print("Away From Front To Back")
            return True, (0,1,0)
    if (direction==(0,-1,0)) :
        if (ymaxo >= ymini)  :
            
            holeFound = False
            
            if (ymino <= ymaxi) :
                #holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,holescale,debugMe) 
                holeFound=True 
                ymaxn=0           
            else:
                ymaxn = (ymaxi-ymino) 
                tranShape = translate_shp(myShapeOuter,0,ymaxn,0,True)    
                holeFound, _ = checkAnyHole(tranShape,myShapeInner,holescale,debugMe) 
            while ( (holeFound==True) and ( (ymaxn+ymaxo) >= ymini) ):
                ymaxn -= removegap
                tranShape = translate_shp(myShapeOuter,0,ymaxn,0,True)    
                holeFound, _ = checkAnyHole(tranShape,myShapeInner,holescale,debugMe) 
                myCount += 1
                if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                    print("Holes only found so far",myCount,holeFound)
            if holeFound==True:
                if debugMe:
                    print("Only holes From Back To Front")
                return True, (0,-1,0) 
        else:
            if debugMe:
                print("Away From Back To Front")
            return True, (0,-1,0) """
    return holeFound, (0,0,0)

def isColliding(myOuterDimension,myInnerDimension,direction):
    xmino, ymino, zmino, xmaxo, ymaxo, zmaxo = myOuterDimension
    xmini, ymini, zmini, xmaxi, ymaxi, zmaxi = myInnerDimension
    xminw, yminw, zminw, xmaxw, ymaxw, zmaxw = max(xmino,xmini), max(ymino,ymini), max(zmino,zmini),\
         min(xmaxo,xmaxi), min(ymaxo,ymaxi), min(zmaxo,zmaxi) 
    if direction==(0,0,1):
        if ( (zmino <= zmaxi) and (xminw <= xmaxw) and (yminw <= ymaxw)):
            return True
        else:
            return False
    if direction==(0,0,-1):
        if ( (zmini <= zmaxo) and (xminw <= xmaxw) and (yminw <= ymaxw)):
            return True
        else:
            return False 
    if direction==(1,0,0):
        if ( (xmino <= xmaxi) and (yminw <= ymaxw) and (zminw <= zmaxw)):
            return True
        else:
            return False
    if direction==(-1,0,0):
        if ( (xmini <= xmaxo) and (yminw <= ymaxw) and (zminw <= zmaxw)):
            return True
        else:
            return False
    if direction==(0,1,0):
        if ( (ymino <= ymaxi) and (zminw <= zmaxw) and (xminw <= xmaxw)):
            return True
        else:
            return False
    if direction==(0,-1,0):
        if ( (ymini <= ymaxo) and (zminw <= zmaxw) and (xminw <= xmaxw)):
            return True
        else:
            return False                    
    return False
    
def checkCommonHole(shapesArray,shapeorder,shapesdim,orderpos,orderlast,holescale=0.8,removegap=1.0,explodegap=10.0,debugMe=False):
    #return True, None
    myShapeOuter=shapesArray[shapeorder[orderpos]]
    myOuterDimension = shapesdim[orderpos]
    xmino, ymino, zmino, xmaxo, ymaxo, zmaxo = myOuterDimension
    
    directions=[]
    directions.append(((0,0,1),zmino-zmaxo))
    directions.append(((0,0,-1),zmino-zmaxo))
    directions.append(((1,0,0),xmino-xmaxo))
    directions.append(((-1,0,0),xmino-xmaxo))
    directions.append(((0,1,0),ymino-ymaxo))
    directions.append(((0,-1,0),ymino-ymaxo))
    if debugMe:
        print(directions)
    lenDirections = len(directions)
    
    holeFound = False
    for i in range(0,lenDirections):
        direction,_ = directions[i]
        myShapes = []
        for iPos in range(len(shapesArray)-orderlast+1):
            if (iPos!=orderpos):
                coliding = isColliding(myOuterDimension,shapesdim[iPos],direction)
                if(coliding):
                    myShapes.append(shapesArray[shapeorder[iPos]])
                    if debugMe:
                        print("Adding",iPos,shapeorder[iPos],"for collision detections")
                else:
                    if debugMe:
                        print("Not Adding",iPos,shapeorder[iPos],"for collision detections")         
        if(len(myShapes)==0):
            return True, direction 
        myShapeInner,_ = list_of_shapes_to_compound(myShapes)
        myInnerDimension = get_bounding_details(myShapeInner)
        #if debugMe:
        #    print(direction,length,directions[i])
        holeFound, result =  checkCommonHoleInDirection(myShapeOuter,myOuterDimension,\
            myShapeInner,myInnerDimension,direction,holescale,removegap,explodegap,debugMe)
        if debugMe:
            print(result,direction,holeFound)
        if holeFound==True:
            if debugMe:
                print("only Holes found in direction",result, "for ",direction)
            return holeFound, result
        else:
            if debugMe:
                print("No Holes found in direction",result, "for ",direction)
    if debugMe:
        print("No Holes found in all directions")
    """ for i in range(0,lenDirections-1):           
        for j in range(0,lenDirections-1-i):
            _,length1 = directions[j+1]
            _,length = directions[j]
            if(length > length1) :
                directions[j+1], directions[j] = swap(directions[j+1],directions[j])
    if debugMe:
        print(directions) 
    result, _ = directions[0] """
    return False, (0,0,0)

    """ zminn, yminn, zminn, xmaxn, ymaxn, zmaxn = xmino, ymino, zmino, xmaxo, ymaxo, zmaxo
    
    holeFound = True
    if (zmino <= zmaxi) :
        
        holeFound = False
        
        if (zmaxo >= zmini) :
            holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,debugMe) 
            zminn=0           
        else:
            zminn = (zmini-zmaxo) 
            tranShape = translate_shp(myShapeOuter,0,0,zminn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)       
        while ( (holeFound==True) and ( (zminn+zmino) <= zmaxi) ):
            zminn += tolerance
            tranShape = translate_shp(myShapeOuter,0,0,zminn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)
        if (holeFound==True) :
            if debugMe:
                print("Only holes From Bottom To Top")
            return True, (0,0,1)
    else:
        return True, (0,0,1)
    if (zmaxo >= zmini) :
        
        holeFound = False
        
        if (zmino <= zmaxi) :
            holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,debugMe) 
            zmaxn=0           
        else:
            zmaxn = (zmaxi-zmino) 
            tranShape = translate_shp(myShapeOuter,0,0,zmaxn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)       
        while ( (holeFound==True) and ( (zmaxn+zmaxo) >= zmini) ):
            zmaxn -= tolerance
            tranShape = translate_shp(myShapeOuter,0,0,zmaxn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)
        if holeFound==True:
            if debugMe:
                print("Only holes From Bottom To Top")
            return True, (0,0,-1) 
    else:
        return True, (0,0,-1)
    if (xmino <= xmaxi) :
        
        holeFound = False
        
        if (xmaxo >= xmini) :
            holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,debugMe) 
            xminn=0           
        else:
            xminn = (xmini-xmaxo) 
            tranShape = translate_shp(myShapeOuter,0,0,xminn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)       
        while ( (holeFound==True) and ( (xminn+zmino) <= xmaxi) ):
            xminn += tolerance
            tranShape = translate_shp(myShapeOuter,0,0,xminn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)
        if (holeFound==True) :
            if debugMe:
                print("Only holes From Left To Right")
            return True, (1,0,0)
    else:
        return True, (1,0,0)
    if (xmaxo >= xmini) :
        
        holeFound = False
        
        if (xmino <= xmaxi) :
            holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,debugMe) 
            xmaxn=0           
        else:
            xmaxn = (xmaxi-xmino) 
            tranShape = translate_shp(myShapeOuter,0,0,xmaxn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)       
        while ( (holeFound==True) and ( (xmaxn+xmaxo) >= xmini) ):
            xmaxn -= tolerance
            tranShape = translate_shp(myShapeOuter,0,0,xmaxn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)
        if holeFound==True:
            if debugMe:
                print("Only holes From Right To Left")
            return True, (-1,0,0) 
    else:
        return True, (-1,0,0)
    if (ymino <= ymaxi) :
        
        holeFound = False
        
        if (ymaxo >= ymini) :
            holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,debugMe) 
            yminn=0           
        else:
            yminn = (ymini-ymaxo) 
            tranShape = translate_shp(myShapeOuter,0,0,yminn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)       
        while ( (holeFound==True) and ( (yminn+ymino) <= ymaxi) ):
            yminn += tolerance
            tranShape = translate_shp(myShapeOuter,0,0,yminn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)
        if (holeFound==True) :
            if debugMe:
                print("Only holes From Left To Right")
            return True, (0,1,0)
    else:       
        return True, (0,1,0)

    if (ymaxo >= ymini) :
        
        holeFound = False
        
        if (ymino <= ymaxi) :
            holeFound, _ = checkAnyHole(myShapeOuter,myShapeInner,debugMe) 
            ymaxn=0           
        else:
            ymaxn = (ymaxi-ymino) 
            tranShape = translate_shp(myShapeOuter,0,0,ymaxn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)       
        while ( (holeFound==True) and ( (ymaxn+ymaxo) >= ymini) ):
            ymaxn -= tolerance
            tranShape = translate_shp(myShapeOuter,0,0,ymaxn)    
            holeFound, _ = checkAnyHole(tranShape,myShapeInner,debugMe)
        if holeFound==True:
            if debugMe:
                print("Only holes From Right To Left")
            return True, (0,-1,0) 
    else:
        return True, (0,-1,0)
    return holeFound, (0,0,0) """


def checkHole(myshapeCommon,myCommonDimension,myshape,myDimension,direction,debugMe=False):
    #return True, None
    dirX,dirY,dirZ=direction
    xminc, yminc, zminc, xmaxc, ymaxc, zmaxc = myCommonDimension
    xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = myDimension
    scaleoutershape = scale_shape(myshapeCommon, 0.8, 0.8, 0.8)
    xmind, ymind, zmind, xmaxd, ymaxd, zmaxd = get_bounding_details(scaleoutershape)
    print("Before",myCommonDimension,xmind, ymind, zmind, xmaxd, ymaxd, zmaxd)
    scaleshape = translate_shp(scaleoutershape,(xmaxc+xminc-xmaxd-xmind)/2,(ymaxc+yminc-ymaxd-ymind)/2,(zmaxc+zminc-zmaxd-zmind)/2,True)
    xmind, ymind, zmind, xmaxd, ymaxd, zmaxd = get_bounding_details(scaleshape)
    print("After",myCommonDimension,xmind, ymind, zmind, xmaxd, ymaxd, zmaxd)    
    transhape = translate_shp(scaleshape,(xmins-xmind)*dirX,(ymins-ymind)*dirY,(zmins-zmind)*dirZ,True)
    myshapehole = BRepAlgoAPI_Common(transhape,myshape).Shape()
    if myshapehole == None:
        if debugMe:
                print("fully holes Lower",\
                    get_bounding_details(myshape),get_bounding_details(myshapeCommon),\
                        get_bounding_details(transhape),get_bounding_details(scaleshape),\
                            xmins,ymins,zmins)
        
    else:
        myshapeDimension = get_bounding_details(myshapehole) 
        if myshapeDimension == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("only holes Lower",myshapeDimension,\
                    get_bounding_details(myshape),get_bounding_details(myshapeCommon),\
                        get_bounding_details(transhape),get_bounding_details(scaleshape),\
                            xmins,ymins,zmins) 
            
        else:
            if debugMe:
                print("No holes Lower",myshapeDimension,\
                    get_bounding_details(myshape),get_bounding_details(myshapeCommon),\
                        get_bounding_details(transhape),get_bounding_details(scaleshape),\
                            xmins,ymins,zmins) 
            return False,myshapehole
    transhape = translate_shp(scaleshape,(xmaxs-xmaxd)*dirX,(ymaxs-ymaxd)*dirY,(zmaxs-zmaxd)*dirZ,True)
    myshapehole = BRepAlgoAPI_Common(transhape,myshape).Shape()
    if myshapehole == None:
        if debugMe:
                print("fully holes Upper",\
                    get_bounding_details(myshape),get_bounding_details(myshapeCommon),\
                        get_bounding_details(transhape),get_bounding_details(scaleshape),\
                            xmins,ymins,zmins)
        
    else:
        myshapeDimension = get_bounding_details(myshapehole) 
        if myshapeDimension == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("only holes Upper",myshapeDimension,\
                    get_bounding_details(myshape),get_bounding_details(myshapeCommon),\
                        get_bounding_details(transhape),get_bounding_details(scaleshape),\
                            xmins,ymins,zmins) 
            
        else:
            if debugMe:
                print("No holes Upper",myshapeDimension,\
                    get_bounding_details(myshape),get_bounding_details(myshapeCommon),\
                        get_bounding_details(transhape),get_bounding_details(scaleshape),\
                            xmins,ymins,zmins) 
            return False,myshapehole 
    transhape = translate_shp(scaleshape,(xmaxs+xmins-xmaxd-xmind)*dirX/2,(ymaxs+ymins-ymaxd-ymind)*dirY/2,(zmaxs+zmins-zmaxd-zmind)*dirZ/2,True)
    myshapehole = BRepAlgoAPI_Common(transhape,myshape).Shape()
    if myshapehole == None:
        if debugMe:
                print("fully holes Center",\
                    get_bounding_details(myshape),get_bounding_details(myshapeCommon),\
                        get_bounding_details(transhape),get_bounding_details(scaleshape),\
                            xmins,ymins,zmins)
        
    else:
        myshapeDimension = get_bounding_details(myshapehole) 
        if myshapeDimension == (0, 0, 0, 0, 0, 0) :
            if debugMe:
                print("only holes Center",myshapeDimension,\
                    get_bounding_details(myshape),get_bounding_details(myshapeCommon),\
                        get_bounding_details(transhape),get_bounding_details(scaleshape),\
                            xmins,ymins,zmins) 
            
        else:
            if debugMe:
                print("No holes Center",myshapeDimension,\
                    get_bounding_details(myshape),get_bounding_details(myshapeCommon),\
                        get_bounding_details(transhape),get_bounding_details(scaleshape),\
                            xmins,ymins,zmins) 
            return False,myshapehole 
    return True, None

def isRemovable(aShape1,aDimension1,aShape2,aDimension2,shapeTol=10,gapTol=0.2,debugMe=False):
    xmin1, ymin1, zmin1, xmax1, ymax1, zmax1 = aDimension1
    xmin2, ymin2, zmin2, xmax2, ymax2, zmax2 = aDimension2 
    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = min(xmin1,xmin2), min(ymin1,ymin2),min(zmin1,zmin2),\
         max(xmax1,xmax2),max(ymax1,ymax2),max(zmax1,zmax2)
    xc,yc,zc = (xmax3+xmin3)/2, (ymax3+ymin3)/2, (zmax3+zmin3)/2

    if debugMe:
        print("Checking 1")
        myshapeCommonReturn = None
    else: 
        myshapeCommonReturn = None
    
    LeftFirst, FrontFirst, BottomFirst = (xmax1 <=xc), (ymax1 <=yc), (zmax1 <=zc)
    if debugMe:
        print("What First",LeftFirst, FrontFirst, BottomFirst)
    myHoleArray = []
    if ( (zmax2==zmax1) and (zmin2==zmin1) ): #0.2 for tollerance
        if debugMe:
            print("Part is on Top",aDimension1,aDimension2)
        return (True, (0, 0, 0, 0, 0, 0),(0,0,1),myshapeCommonReturn, myHoleArray)
   
    if BottomFirst:        
        if zmin2 < zmin1: 
            shapeTol1 = zmax1-zmin1
            corner1 = gp_Pnt(xmin1, ymin1, zmin2)            
            if ((zmin1-zmin2-shapeTol1)>0):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymax1-ymin1),(zmin1-zmin2-shapeTol1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,zmin1,zmax1,zmin2,(0,0,-1),mybox2,shapeTol1,gapTol,debugMe)
            myshapeCommonReturn = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:
                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Bottom")
                    return (True, myshapeDimension1,(0,0,-1),myshapeCommonReturn,myHoleArray)
                else:                
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((xmin1<xmin3) and (xmax1>xmax3) and (ymin1<ymin3) and (ymax1>ymax3) ) ) : 
                        if debugMe:
                            print("common with Enclosed Part From Bottom",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1)) 
                        isHole, myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(0,0,1),debugMe)
                        if isHole:
                                return (True, myshapeDimension1,(0,0,-1),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Bottom",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1)) 
                    else:
                        if debugMe:                   
                            print("Nocommon with Enclosed Part From Bottom",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1)) 
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Bottom",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
        else:
            if debugMe:
                print("Nothing From Bottom",zmin2,zmin1,aDimension1,aDimension2) 
        if debugMe:
            print("Checking 2",BottomFirst)
        if (zmax2 > zmax1):  
            shapeTol1 = zmax1-zmin1
            corner1 = gp_Pnt(xmin1, ymin1, zmax1+shapeTol1)            
            if((zmax2-zmax1-shapeTol1) >0 ):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1-shapeTol1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,zmin1,zmax1,zmax2,(0,0,1),mybox2,shapeTol1,gapTol,debugMe)
            myshapeCommonReturn = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape() 
            if myshapeCommon1!=None:
                #print("I got",myshapeCommon1,"Shape")       
                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Top")
                    return (True, myshapeDimension1,(0,0,1),myshapeCommonReturn, myHoleArray)
                else:
                    if (zmin2 >= zmin1):
                        if debugMe:
                            print("Reverse Nothing common with Enclosed Part From Top")
                        return (True, myshapeDimension1,(0,0,-1),myshapeCommonReturn, myHoleArray)
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((xmin1<xmin3) and (xmax1>xmax3) and (ymin1<ymin3) and (ymax1>ymax3) ) ) : 
                        if debugMe:
                            print("common with Enclosed Part From Top",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1)) 
                        isHole, myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(0,0,1),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(0,0,1),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Top",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:
                            print("Nothing common with Enclosed Part From Top",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Top",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))  
        else:
            if debugMe:
                print("Nothing From Top",zmax1,zmax2,aDimension1,aDimension2) 
        
        """ if zmin2==zmin1:
            if debugMe:
                print("Part is on Bottom",aDimension1,aDimension2)
            return (True, (0, 0, 0, 0, 0, 0),(0,0,-1),myshapeCommonReturn, myHoleArray) """
    else:
        if (zmax2 > zmax1):  
            shapeTol1 = zmax1-zmin1
            corner1 = gp_Pnt(xmin1, ymin1, zmax1+shapeTol1)
            if((zmax2-zmax1-shapeTol1) >0 ):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1-shapeTol1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,zmin1,zmax1,zmax2,(0,0,1),mybox2,shapeTol1,gapTol,debugMe)
            myshapeCommonReturn = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:        
                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                #print("I got",myshapeCommon1,"Shape") 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Top")
                    return (True, myshapeDimension1,(0,0,1),myshapeCommonReturn, myHoleArray)
                else:
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((xmin1<xmin3) and (xmax1>xmax3) and (ymin1<ymin3) and (ymax1>ymax3) ) ) : 
                        if debugMe:
                            print("common with Enclosed Part From Top",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1)) 
                        isHole,myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(0,0,1),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(0,0,1),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Top",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:
                            print("Nothing common with Enclosed Part From Top",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Top",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))  
        else:
            if debugMe:
                print("Nothing From Top",zmax1,zmax2,aDimension1,aDimension2) 
        if debugMe:
            print("Checking 2")
        """ if zmin2==zmin1:
            if debugMe:
                print("Part is on Bottom",aDimension1,aDimension2)
            return (True, (0, 0, 0, 0, 0, 0),(0,0,-1),myshapeCommonReturn, myHoleArray) """
        if zmin2 < zmin1: 
            shapeTol1 = zmax1-zmin1
            corner1 = gp_Pnt(xmin1, ymin1, zmin2)
            if ((zmin1-zmin2-shapeTol1)>0):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymax1-ymin1),(zmin1-zmin2-shapeTol1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,zmin1,zmax1,zmin2,(0,0,-1),mybox2,shapeTol1,gapTol,debugMe)
            myshapeCommonReturn = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:
                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing So common with Enclosed Part From Bottom",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,(xmin1, ymin1, zmin2),(xmax1-xmin1),(ymax1-ymin1),(zmin1-zmin2-shapeTol1))
                    return (True, myshapeDimension1,(0,0,-1),myshapeCommonReturn, myHoleArray)
                else:
                    if (zmax2 <= zmax1):
                        if debugMe:
                            print("Reverse Nothing common with Enclosed Part From Bottom")
                        return (True, myshapeDimension1,(0,0,1),myshapeCommonReturn, myHoleArray)
                    print("In Bottom",zmax2,zmax1,(zmax2 <= zmax1))
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((xmin1<xmin3) and (xmax1>xmax3) and (ymin1<ymin3) and (ymax1>ymax3) ) ) : 
                        if debugMe:
                            print("common with Enclosed Part From Bottom",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1)) 
                        isHole,myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(0,0,1),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(0,0,-1),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Bottom",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:                   
                            print("Nocommon with Enclosed Part From Bottom",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1)) 
            else:
                if debugMe:                   
                        print("None with Enclosed Part From Bottom",get_bounding_details(mybox1),\
                            aDimension1,aDimension2,\
                                (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
        else:
            if debugMe:
                print("Nothing From Bottom",zmin2,zmin1,aDimension1,aDimension2) 
    if debugMe:
        print("Checking 3")
    if ((xmax2==xmax1) and (xmin2==xmin1)):
        if debugMe:
            print("Part is on Left",aDimension1,aDimension2)
        return (True, (0, 0, 0, 0, 0, 0),(1,0,0),myshapeCommonReturn, myHoleArray)
    if LeftFirst:         
        if xmin2 < xmin1: 
            shapeTol1 = xmax1-xmin1
            corner1 = gp_Pnt(xmin2, ymin1, zmin1)
            if ((xmin1-xmin2-shapeTol1>0)):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmin1-xmin2-shapeTol1),(ymax1-ymin1),(zmax1-zmin1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,xmin1,xmax1,xmin2,(-1,0,0),mybox2,shapeTol1,gapTol,debugMe)
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:
                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Right")
                    return (True, myshapeDimension1,(-1,0,0),myshapeCommonReturn, myHoleArray)
                else:
                    
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((ymin1<ymin3) and (ymax1>ymax3) and (zmin1<zmin3) and (zmax1>zmax3) ) ) :
                        if debugMe:
                            print("common with Enclosed Part From Right",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        isHole,myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(1,0,0),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(-1,0,0),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Right",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:
                            print("Nothing common with Enclosed Part From Right",myshapeDimension1,aDimension1,aDimension2) 
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Right",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
        else:
            if debugMe:
                print("Nothing From Right",xmin1,xmin2,aDimension1,aDimension2)  
        if debugMe:
            print("Checking 4",LeftFirst)     
        if xmax2 > xmax1:
            shapeTol1 = xmax1-xmin1
            corner1 = gp_Pnt(xmax1+shapeTol1, ymin1, zmin1)
            if ((xmax2-xmax1-shapeTol1)>0):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmax2-xmax1-shapeTol1),(ymax1-ymin1),(zmax1-zmin1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,xmin1,xmax1,xmax2,(1,0,0),mybox2,shapeTol1,gapTol,debugMe)        
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:
                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Left")
                    return (True, myshapeDimension1,(1,0,0),myshapeCommonReturn, myHoleArray)
                else:
                    if (xmin2 >= xmin1):
                        if debugMe:
                            print("Reverse Nothing common with Enclosed Part From Left")
                        return (True, myshapeDimension1,(-1,0,0),myshapeCommonReturn, myHoleArray)
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((ymin1<ymin3) and (ymax1>ymax3) and (zmin1<zmin3) and (zmax1>zmax3) ) ) : 
                        if debugMe:
                            print("common with Enclosed Part From Left",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        isHole,myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(1,0,0),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(1,0,0),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Left",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:
                            print("Nothing common with Enclosed Part From Left",myshapeDimension1,aDimension1,aDimension2)
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Left",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1)) 
        else:
            if debugMe:
                print("Nothing From Left",xmax1,xmax2,aDimension1,aDimension2) 
        
        """ if xmin2==xmin1:
            if debugMe:
                print("Part is on Right",aDimension1,aDimension2)
            return (True, (0, 0, 0, 0, 0, 0),(-1,0,0),myshapeCommonReturn, myHoleArray) """
        
    else:
        if xmax2 > xmax1:
            shapeTol1 = xmax1-xmin1
            corner1 = gp_Pnt(xmax1+shapeTol1, ymin1, zmin1)
            if ((xmax2-xmax1-shapeTol1)>0):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmax2-xmax1-shapeTol1),(ymax1-ymin1),(zmax1-zmin1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,xmin1,xmax1,xmax2,(1,0,0),mybox2,shapeTol1,gapTol,debugMe)        
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:
                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Left")
                    return (True, myshapeDimension1,(1,0,0),myshapeCommonReturn, myHoleArray)
                else:
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((ymin1<ymin3) and (ymax1>ymax3) and (zmin1<zmin3) and (zmax1>zmax3) ) ) : 
                        if debugMe:
                            print("common with Enclosed Part From Left",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        isHole,myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(1,0,0),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(1,0,0),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Left",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:
                            print("Nothing common with Enclosed Part From Left",myshapeDimension1,aDimension1,aDimension2) 
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Left",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
        else:
            if debugMe:
                print("Nothing From Left",xmax1,xmax2,aDimension1,aDimension2) 
        if debugMe:
            print("Checking 4")
        """ if xmin2==xmin1:
            if debugMe:
                print("Part is on Right",aDimension1,aDimension2)
            return (True, (0, 0, 0, 0, 0, 0),(-1,0,0),myshapeCommonReturn) """
        if xmin2 < xmin1: 
            shapeTol1 = xmax1-xmin1
            corner1 = gp_Pnt(xmin2, ymin1, zmin1)
            if ((xmin1-xmin2-shapeTol1>0)):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmin1-xmin2-shapeTol1),(ymax1-ymin1),(zmax1-zmin1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,xmin1,xmax1,xmin2,(-1,0,0),mybox2,shapeTol1,gapTol,debugMe)
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:
                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Right")
                    return (True, myshapeDimension1,(-1,0,0),myshapeCommonReturn, myHoleArray)
                else:
                    if (xmax2 <= xmax1):
                        if debugMe:
                            print("Reverse Nothing common with Enclosed Part From Right")
                        return (True, myshapeDimension1,(1,0,0),myshapeCommonReturn, myHoleArray)
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((ymin1<ymin3) and (ymax1>ymax3) and (zmin1<zmin3) and (zmax1>zmax3) ) ) :
                        if debugMe:
                            print("common with Enclosed Part From Right",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        isHole, myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(1,0,0),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(-1,0,0),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Right",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:
                            print("Nothing common with Enclosed Part From Right",myshapeDimension1,aDimension1,aDimension2) 
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Right",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
        else:
            if debugMe:
                print("Nothing From Right",xmin1,xmin2,aDimension1,aDimension2) 
    if debugMe:
        print("Checking 5")
    if ( (ymax2==ymax1) and (ymin2==ymin1) ):
        if debugMe:
            print("Part is on Back",aDimension1,aDimension2)
        return (True, (0, 0, 0, 0, 0, 0),(0,1,0),myshapeCommonReturn, myHoleArray)
    if FrontFirst:
        if ymin2 < ymin1:   
            shapeTol1 = ymax1-ymin1
            corner1 = gp_Pnt(xmin1, ymin2, zmin1)
            if((ymin1-ymin2-shapeTol1)>0):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymin1-ymin2-shapeTol1),(zmax1-zmin1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,ymin1,ymax1,ymin2,(0,-1,0),mybox2,shapeTol1,gapTol,debugMe)
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:
                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Front")
                    return (True, myshapeDimension1,(0,-1,0),myshapeCommonReturn, myHoleArray)
                else:
                    
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((ymin1<ymin3) and (ymax1>ymax3) and (zmin1<zmin3) and (zmax1>zmax3) ) ) :
                        if debugMe:
                            print("common with Enclosed Part From Front",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        isHole, myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(0,1,0),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(0,-1,0),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Front",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:
                            print("Nothing common with Enclosed Part From Front",myshapeDimension1,aDimension1,aDimension2) 
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Front",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
        else:
            if debugMe:
                print("Nothing From Front",ymin1,ymin2,aDimension1,aDimension2)
        if debugMe:
            print("Checking 6",FrontFirst)
        if ymax2 > ymax1:
            shapeTol1 = ymax1-ymin1
            corner1 = gp_Pnt(xmin1, ymax1+shapeTol1, zmin1)
            if ((ymax2-ymax1-shapeTol1)>0):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymax2-ymax1-shapeTol1),(zmax1-zmin1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,ymin1,ymax1,ymax2,(0,1,0),mybox2,shapeTol1,gapTol,debugMe)
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:

                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Back")
                    return (True, myshapeDimension1,(0,1,0),myshapeCommonReturn, myHoleArray)
                else:
                    if (ymin2 >= ymin1):
                        if debugMe:
                            print("Reverse Nothing common with Enclosed Part From Front")
                        return (True, myshapeDimension1,(0,-1,0),myshapeCommonReturn, myHoleArray)
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((zmin1<zmin3) and (zmax1>zmax3) and (xmin1<xmin3) and (xmax1>xmax3) ) ) : 
                        if debugMe:
                            print("common with Enclosed Part From Front",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        isHole, myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(0,1,0),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(0,1,0),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Front",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:
                            print("Nothing common with Enclosed Part From Back",myshapeDimension1,aDimension1,aDimension2) 
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Back",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
        else:
            if debugMe:
                print("Nothing From Back",ymax1,ymax2,aDimension1,aDimension2) 
        
        """ if ymin2==ymin1:
            if debugMe:
                print("Part is on Front",aDimension1,aDimension2)
            return (True, (0, 0, 0, 0, 0, 0),(0,-1,0),myshapeCommonReturn) """
        
    else:
        if ymax2 > ymax1:
            shapeTol1 = ymax1-ymin1
            corner1 = gp_Pnt(xmin1, ymax1+shapeTol1, zmin1)
            if ((ymax2-ymax1-shapeTol1)>0):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymax2-ymax1-shapeTol1),(zmax1-zmin1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,ymin1,ymax1,ymax2,(0,1,0),mybox2,shapeTol1,gapTol,debugMe)
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:

                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Back")
                    return (True, myshapeDimension1,(0,1,0),myshapeCommonReturn, myHoleArray)
                else:
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((zmin1<zmin3) and (zmax1>zmax3) and (xmin1<xmin3) and (xmax1>xmax3) ) ) : 
                        if debugMe:
                            print("common with Enclosed Part From Back",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        isHole, myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(0,1,0),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(0,1,0),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Back",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:
                            print("Nothing common with Enclosed Part From Back",myshapeDimension1,aDimension1,aDimension2) 
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Back",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
        else:
            if debugMe:
                print("Nothing From Back",ymax1,ymax2,aDimension1,aDimension2) 
        if debugMe:
            print("Checking 6")
        """ if ymin2==ymin1:
            if debugMe:
                print("Part is on Front",aDimension1,aDimension2)
            return (True, (0, 0, 0, 0, 0, 0),(0,-1,0),myshapeCommonReturn) """
        if ymin2 < ymin1:   
            shapeTol1 = ymax1-ymin1
            corner1 = gp_Pnt(xmin1, ymin2, zmin1)
            if((ymin1-ymin2-shapeTol1)>0):
                mybox2 = BRepPrimAPI_MakeBox(corner1,(xmax1-xmin1),(ymin1-ymin2-shapeTol1),(zmax1-zmin1)).Shape()
            else:
                if debugMe:
                    print("2 Parts are exceeding")
                mybox2 = None
            mybox1 = getStackedShape(aShape1,ymin1,ymax1,ymin2,(0,-1,0),mybox2,shapeTol1,gapTol,debugMe)
            myshapeCommon1 = BRepAlgoAPI_Common(aShape2,mybox1).Shape()
            if myshapeCommon1!=None:
                myshapeDimension1 = get_bounding_details(myshapeCommon1) 
                if myshapeDimension1 == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Nothing common with Enclosed Part From Front")
                    return (True, myshapeDimension1,(0,-1,0),myshapeCommonReturn, myHoleArray)
                else:
                    if (ymax2 <= ymax1):
                        if debugMe:
                            print("Reverse Nothing common with Enclosed Part From Front")
                        return (True, myshapeDimension1,(0,1,0),myshapeCommonReturn, myHoleArray)
                    xmin3, ymin3, zmin3, xmax3, ymax3, zmax3 = myshapeDimension1
                    if ( ((ymin1<ymin3) and (ymax1>ymax3) and (zmin1<zmin3) and (zmax1>zmax3) ) ) :
                        if debugMe:
                            print("common with Enclosed Part From Front",get_bounding_details(mybox1),\
                                myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                    (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        isHole, myHole = checkHole(myshapeCommon1,myshapeDimension1,aShape1,aDimension1,(0,1,0),debugMe)
                        if isHole:
                            return (True, myshapeDimension1,(0,-1,0),myshapeCommonReturn, myHoleArray)
                        else:
                            if debugMe:
                                myHoleArray.append(myHole)
                                print("No hole with Enclosed Part From Front",get_bounding_details(mybox1),\
                                    myshapeDimension1,aDimension1,aDimension2,get_bounding_details(myshapeCommonReturn),\
                                        (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
                        
                    else:
                        if debugMe:
                            print("Nothing common with Enclosed Part From Front",myshapeDimension1,aDimension1,aDimension2) 
            else:
                if debugMe:                   
                    print("None with Enclosed Part From Front",get_bounding_details(mybox1),\
                        aDimension1,aDimension2,\
                            (xmin1, ymin1, zmax1),(xmax1-xmin1),(ymax1-ymin1),(zmax2-zmax1))
        else:
            if debugMe:
                print("Nothing From Front",ymin1,ymin2,aDimension1,aDimension2) 
    if debugMe:
        print("Checking 7")
    return (False, (0, 0, 0, 0, 0, 0),(0,0,0),myshapeCommonReturn, myHoleArray)

    

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
        
                      
def ExplodeParts(shapeColorArray,shapeArray,name,dimension,explodegap,center,holescale=0.8, removegap=1.0,debugMe=False):
    #print("ExploreParts",shapeTol,gapTol)
    xmin, ymin, zmin, xmax, ymax, zmax = dimension 
    xc, yc, zc = (xmin+xmax)/2, (ymin+ymax)/2 , (zmin+zmax)/2
    xd, yd, zd = xmax-xmin, ymax-ymin, zmax-zmin
    lenShape = len(shapeArray)
   
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
    testMe=False
    shapesColorArray=[]
    shapesArray=[]
    if testMe:
        for i in [9,10,11,15,16]:
            shapesColorArray.append(shapeColorArray[i])
            shapesArray.append(shapeArray[i])
    else:
        shapesColorArray=shapeColorArray
        shapesArray=shapeArray
    lenShape = len(shapesArray)
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
    fullShape,converted = list_of_shapes_to_compound(shapesArray)
    if(converted):
        newShapes.append((fullShape,name,None))
    else:
        firstTime = True
        for (aShape,aName,aColor) in shapesColorArray:
            newShapes.append((aShape,aName,aColor))
            if firstTime:
                firstTime = False
            else:
                moveArrays.append((0, 0, 0))
    for i  in range(lenShape):
        (aShape,aName,aColor) = shapesColorArray[i]
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
            myDirectionAtZero=(0,0,0)
            for i in range(0,lenShape-k+1):                
                j=lenShape-k-i
                debugMe = True #k==1 and i==4 #True #(k==3) and (i==0) #True #shapeorder[j]==2 or shapeorder[j]==3
                if debugMe:
                    print(k,j,shapeorder[j],shapeorder)
                #myExcludeCompound = excluded_list_of_shapes_to_compound(shapesArray,shapeorder,j,k,False)
                #myExcludeDimension = get_bounding_details(myExcludeCompound)
                #print("My Shape TOl, Gap Tol",shapeTol,gapTol)
                myCommonCompound,myHoles=None,None
                #enclosed,_,myDirection, myCommonCompound,myHoles = isRemovable(shape[shapeorder[j]],shapesdim[j],myExcludeCompound,myExcludeDimension,shapeTol,gapTol,debugMe)
                enclosed,myDirection = checkCommonHole(shapesArray,shapeorder,shapesdim,j,k,holescale,removegap,0.1,debugMe) #explodegap=10 increases the time, 0 has bug for borders and hence 0.1 used.
                #print(k,i,j,shapeorder[j],enclosed,myExcludeDimension,lenShape-k)
                if myDirectionAtZero==(0,0,0):
                    myDirectionAtZero=myDirection
                if (enclosed):
                    shapesdirection[shapeorder[j]]=myDirection
                    if(myCommonCompound!=None and debugMe ):
                        commonObjects.append((myCommonCompound,shapeorder[j], myHoles))
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
                    #if debugMe:
                    print(k,i,j,shapeorder[j],enclosed,lenShape-k)
                    if(myCommonCompound!=None and debugMe):
                        commonObjects.append((myCommonCompound,shapeorder[j],myHoles))
                    
            if enclosed==False:
                (aShape,aName,aColor) = shapesColorArray[shapeorder[lenShape-k]]
                print("No objects can be removed",k,"Removing part forcefully largest distant from center",aName)                
                
                #if myDirectionAtZero==(0,0,0):
                if (k!=1) :                    
                    shapesdirection[shapeorder[lenShape-k]]=shapesdirection[shapeorder[lenShape-k+1]]

            print(k, shapeorder,shapesdirection, lenShape-k)

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
        if(lenShape>1):
            shapesdirection[shapeorder[0]]=shapesdirection[shapeorder[1]]
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
        for i  in range(lenShape):
            print(i,shapeassembleorder[i],shapesdirection[shapeassembleorder[i]])
        xmin, ymin, zmin, xmax, ymax, zmax = dimension 
        xc, yc, zc = (xmin+xmax)/2, (ymin+ymax)/2 , (zmin+zmax)/2
        xminp, yminp, zminp, xmaxp, ymaxp, zmaxp = dimension
        #shiftX,shiftY,shiftZ = 0,0,0   
        prevX, prevY, prevZ = 0,0,0   
        for i  in range(lenShape):
            #(aShape,aName,aColor) = shapeArray[i]
            #xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = get_bounding_details(aShape) 
           
            (bShape,bName,bColor) = shapesColorArray[shapeassembleorder[i]]
            (newShape,aName,aColor) = newShapes[shapeassembleorder[i]+1]
            direction = shapesdirection[shapeassembleorder[i]]
            xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = shapesdim[shapereverseorder[shapeassembleorder[i]]]
            
            if (direction==(0,0,0)) :
                if (prevX==0) and (prevY==0) and (prevZ==0):
                    directionX,directionY,directionZ = 0, 0, 1
                else:
                    directionX,directionY,directionZ = prevX, prevY, prevZ 
            else:
                directionX,directionY,directionZ = direction
                prevX, prevY, prevZ = directionX,directionY,directionZ
            
            if directionZ==1: 
                xmove = 0
                ymove = 0
                zmove = zmaxp + explodegap
                zmaxp = zmove + (zmaxs-zmins)
            if directionZ==-1:
                xmove = 0
                ymove = 0
                zmove = zminp - (zmaxs-zmins+explodegap)
                zminp = zmove
            if directionX==1: 
                xmove = xmaxp + explodegap
                ymove = 0
                zmove = 0
                xmaxp = xmove + (xmaxs-xmins)
            if directionX==-1:
                xmove = xminp - (xmaxs-xmins+explodegap)
                ymove = 0
                zmove = 0
                xminp = xmove
            if directionY==1: 
                xmove = 0
                ymove = ymaxp + explodegap
                zmove = 0
                ymaxp = ymove + (ymaxs-ymins)
            if directionY==-1:
                xmove = 0
                ymove = yminp - (ymaxs-ymins+explodegap)
                zmove = 0
                yminp = ymove
            """ xmove = (((xmins+xmaxs)/2)-xc)*xs#*directionX
            ymove = (((ymins+ymaxs)/2)-yc)*ys#*directionY
            zmove = (((zmins+zmaxs)/2)-zc)*zs#*directionZ """
            moveArrays[shapeassembleorder[i]]=(xmove, ymove, zmove)
            finalShape=translate_shp(newShape,xmove, ymove, zmove, True) 
                
            """ shiftX += ( ((xmaxp-xminp)) + explodegap ) * directionX
            shiftY += ( ((ymaxp-yminp)) + explodegap ) * directionY
            shiftZ += ( ((zmaxp-zminp)) + explodegap ) * directionZ
            
            xminp, yminp, zminp, xmaxp, ymaxp, zmaxp = xmins, ymins, zmins, xmaxs, ymaxs, zmaxs
           

            xmoveX = shiftX 
            ymoveY = shiftY 
            zmoveZ = shiftZ  """
            
            """  xmoveX = xmove
            ymoveY = ymove
            zmoveZ = zmove """

            print(direction,i,shapeassembleorder[i],shapereverseorder[shapeassembleorder[i]],\
                 (xmove, ymove, zmove),  aName,bName,\
                    (xmins, ymins, zmins, xmaxs, ymaxs, zmaxs),get_bounding_details(bShape))            
            
            #print(i,shapeorder[i],direction,xmove,ymove,zmove)
            """ if(xmoveX==0 and ymoveY==0 and zmoveZ==0):
                moveArrays[shapeassembleorder[i]]=(xmove, ymove, zmove)
                finalShape=translate_shp(newShape,xmove, ymove, zmove, True)
            else:
                moveArrays[shapeassembleorder[i]]=(xmoveX, ymoveY, zmoveZ)
                finalShape=translate_shp(newShape,xmoveX, ymoveY, zmoveZ, True) """
         
            newShapes[shapeassembleorder[i]+1] = (finalShape,aName,aColor)
           
            #shapesdim.append(xmins+xmove+xt, ymins+ymove+xt, zmins+zmove+xt, xmaxs+xmove+xt, ymaxs+ymove+xt, zmaxs+zmove+xt)
             
    """ for i in range(lenShape):
        print("after",hash(newShapes[i+1]),moveArrays[i],shapeorder[i]) """
    #print(shapeorder,shapesdis,shapesvol)
    
   
    debugMe = False
    if debugMe==True:
        aColor = Quantity_Color(0, 0, 1, Quantity_TOC_RGB)
        #bColor = Quantity_Color(1, 1, 0, Quantity_TOC_RGB)
        currentIndex = lenShape
        for j in range(len(commonObjects)):            
            _, _, myHoles = commonObjects[j]           
            for i in range(len(myHoles)):                
                AnotherShape=translate_shp(myHoles[i],100, 100, 100, True)
                newShapes.append((AnotherShape,"Common"+str(currentIndex),aColor))
                moveArrays.append((0, 0, 0))
                print ("Common"+str(currentIndex))
                #shapesdim.append(xmins+xmove+xt, ymins+ymove+xt, zmins+zmove+xt, xmaxs+xmove+xt, ymaxs+ymove+xt, zmaxs+zmove+xt)
                shapeorder.append(currentIndex)
                currentIndex +=1


    return newShapes, moveArrays, shapeorder, shapesdirection
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
        [shape_to_disp, subName, subEntry, c, myId, myParent, rootName, rootEntry, meshname, basenamehere, (uvPlane, solidfound, buff, uvbuff) ] = item
        if myId == treeID:
            return item
    return None

def getShapesFromOutPutShapes(shapes,mytree,fromparent=1):
    return  OCPStepIGESAnalyser.StepExportWithColor().\
        getShapesFromOutPutShapes(shapes,fromparent,mytree,len(mytree),'')

def getShapesFromOutPutShapes_old(shapes,mytree):
    retshapes=[]
    subshapes=[]
    onlyshapes=[]
    retcoloredshapes=[]
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
        red = 0
        green = 0
        blue = 0
        if subShapeColor:
            red = subShapeColor.Red()
            green = subShapeColor.Green()
            blue = subShapeColor.Blue()
        retcoloredshapes.append((mergedshape,subShapeName,red,green,blue))
    #print(retshapes,onlyshapes)
    return (retshapes,onlyshapes,retcoloredshapes,findAssemblyShapeName(1,mytree))

def getBasefileNameAndDisplayPath(filename,edgesize,suffixname):
    edgeGapStr = str(math.trunc(edgesize*10))
    if filename:
        head, tail = os.path.split(filename)
        if(head[:-1]!="/"):            
            head = head + "/"
        MediaUrlLength = len(MEDIA_URL)
        if head[0:MediaUrlLength]== MEDIA_URL:
            displaypath = DISPLAY_URL+head[MediaUrlLength:]
        else:
            displaypath = head        
        pathfilename, _ = os.path.splitext(tail)
        basefilename = pathfilename+suffixname+edgeGapStr
    else:
        basefilename = "./"
        displaypath= DISPLAY_URL
    return basefilename,displaypath


def getEmptyDictionary(filename,basefilename,displaypath,percentage,starttime,createdirectory):
    
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
    
    dict_return = {
        "gltf":{},
        "tree":[],
        "store":basefilename,
        "load":filename,
        "gdttable":[{ "edges":[],
                    "selectedObjects":[],
                    "parentObjects":[],
                    "mates":[],
                    "mateValues": [False,False,False,False,False,False],
                    "angle":0,
                    "offset":0,
                    "option":26,
                    "key":"" }],
        "status": mystatusdict,
        "display":displaypath }	                
    return dict_return


def exportToAssemblyGLTF(sourceFileName,distancegap,anglegap,explodegap,center,holescale = 0.8,removegap=1.0,animationtime=1.5,byThread=True,starttime=None,refid=''):#,thumbwidth,thumbheight):
    """
    Imports a file based on the type (STEP, IGES, BREP, STL)    
    """
    #Now read and return the shape
    print("Export",sourceFileName,distancegap,anglegap,explodegap,center,holescale,removegap,animationtime,byThread,starttime)
    try:
        
        #starttimeinexport = datetime.utcnow()
        if starttime==None:
            starttime=datetime.utcnow()

        dictionary={}
        _, file_extension = os.path.splitext(sourceFileName)
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        newfilenamewithoutext = DISPLAY_URL+Path(sourceFileName).resolve().stem
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
                    filename=sourceFileName,includeparts=False,distancegap=distancegap, logging=logging, 
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False,
                    edgesize=0, vertexsize=0,thumbwidth=0,thumbheight=0,suffixname="M",refid=refid).dump()
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
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0,suffixname="M",refid=refid).dump()
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
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0,suffixname="M",refid=refid).dump()
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
                    filename=sourceFileName,shapeslist=createShapeArray(shape),distancegap=distancegap,
                    anglegap=anglegap,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,suffixname="M",refid=refid).dump() 
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
            shapeArray,shape,shapePickles,aName, aColorAssemblyOrder = getShapesFromOutPutShapes(myShapes,dictionary["tree"])
            getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],30,starttime,False)
            #shape = Wholeshape
            #shapeArray = createShapeArray(shape)
            #print("Order",dictionary)
            FindAssemblingOrder(shapeArray,shape,aName,aColorAssemblyOrder,dimension,explodegap,center,holescale,removegap,logging).\
                ExplodeParts(sourceFileName,distancegap,anglegap,animationtime,dictionary["display"],byThread,refid)
            getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],100,starttime,False)
            #whatGotHere = ExplodeParts(shapeArray,shape,aName,dimension,explodegap,center,holescale,removegap)
            #print("After calling Assembly order",dictionary)
            """ nshape, moveArrays, shapeorder, shapesdirection = dictionary
            print(nshape,moveArrays,shapeorder,shapesdirection)
            (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                filename=sourceFileName,shapeslist=nshape,includeparts=False,distancegap=distancegap,
                anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                edgesize=0, vertexsize=0, animations=moveArrays,shapeorder=shapeorder,delay=animationtime).dump()
            dictionary['assemblyorder']={"order":shapeorder,"direction":shapesdirection} """
        except Exception as e:
            print("error",e)
        """ try:
            orderfile = "Display/"+dictionary["store"]+".order"
            print("Writing,",orderfile)
            with open(orderfile, 'w') as fh:
                fh.write(json.dumps(dictionary["assemblyorder"], sort_keys=True, indent=2 ))
        except Exception as e:
            print("Error while writing orderfile",e)   """
        try:
            myPickle = {'sourceType':'Order',
                            'sourceFileName':sourceFileName,
                            'distancegap':distancegap,
                            'anglegap':anglegap,
                            'explodegap':explodegap,
                            'center':center,
                            'holescale':holescale,
                            'removegap':removegap,
                            'animationtime':animationtime,
                            'colorshapes':shapePickles,
                            'assemblyname':aName,
                            'dimension':dimension,
                            'refid':refid} 
            picklefile = dictionary["display"]+dictionary["store"]+".pickle"
            with open(picklefile, 'wb') as f:
                # Pickle the 'data' dictionary using the highest protocol available.                               
                pickle.dump(myPickle, f, pickle.HIGHEST_PROTOCOL)
        except Exception as e:
            print(e,"File, %s has error" % picklefile)  
        if byThread:    
            return dictionary
       
       
    except:
        if byThread:
            return {}
        #raise ValueError("File Could not be loaded") 



@api_view(['GET'])
def FileGetAssemblyOrder(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':
            
            id = request.GET.get('id', None)
            refid = request.GET.get('refid','')
            distancegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
            anglegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
            explodegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('explodegap',"10"),10)
            holescale = OCPStepIGESAnalyser.convertToFloat(request.GET.get('holescale',"0.77"),0.77)
            removegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('removegap',"8.0"),8.0)
            center = OCPStepIGESAnalyser.convertToBool(request.GET.get('center',"true"),True)
            animationtime = OCPStepIGESAnalyser.convertToFloat(request.GET.get('animationtime',"1.0"),1.0)
            #thumbwidth = convertToFloat(request.GET.get('thumbwidth',"96"),96)
            #thumbheight = convertToFloat(request.GET.get('thumbheight',"96"),96)
            print("Before Export",id,distancegap,anglegap,explodegap,center,holescale,removegap)
            starttime = datetime.utcnow() 
            if is_number(id) :            
                files = File.objects.filter(id__icontains=id)
                for eachfile in files:
                    basefilename,displaypath = getBasefileNameAndDisplayPath(MEDIA_URL+eachfile.file.name,0,"M")
                    data = getEmptyDictionary(MEDIA_URL+eachfile.file.name, basefilename,displaypath,0,starttime,True) 
                    print("From assembly",data)
                    mythread = threading.Thread(target=exportToAssemblyGLTF, daemon=True,\
                        args=(MEDIA_URL+eachfile.file.name,distancegap,anglegap,explodegap,center,holescale,removegap,animationtime,False,starttime,refid))
                    mythread.start()      
                    #data = exportToAssemblyGLTF("Media/"+eachfile.file.name,distancegap,anglegap,explodegap,center,holescale,removegap,animationtime,False)#,thumbwidth,thumbheight)
            else:
                #id = request.GET.get('file', None)
                if id is not None:
                    basefilename,displaypath = getBasefileNameAndDisplayPath(MEDIA_URL+id,0,"M")
                    data = getEmptyDictionary(MEDIA_URL+id,basefilename,displaypath,0,starttime,True)
                    mythread = threading.Thread(target=exportToAssemblyGLTF, daemon=True,\
                        args=(MEDIA_URL+id,distancegap,anglegap,explodegap,center,holescale,removegap,animationtime,False,starttime,refid))
                    mythread.start() 
                    #data = exportToAssemblyGLTF("Media/"+id,distancegap,anglegap,explodegap,center,holescale,removegap,animationtime,False)#,thumbwidth,thumbheight)
        return JsonResponse(data, safe=False)    
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)  
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)


def exportTokinematicGLTF(sourceFileName,distancegap,anglegap,animationtime=1.5,refid=''):#,thumbwidth,thumbheight):
    """
    Imports a file based on the type (STEP, IGES, BREP, STL)    
    """
    #Now read and return the shape
   
    try:
        
        
        dictionary={}
        _, file_extension = os.path.splitext(sourceFileName)
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        newfilenamewithoutext = DISPLAY_URL+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        outputShapes={}
        if file_extension=="stp" or file_extension=="step" or file_extension=="igs" or file_extension=="iges" :          
            
            try:
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,includeparts=False,distancegap=distancegap, logging=logging, 
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False,
                    edgesize=0, vertexsize=0,thumbwidth=0,thumbheight=0,refid=refid).dump()
            except Exception as e:
                print("error",e)
       
        if file_extension=="stl" :            
            try:
                shape = conversion.read_stl_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0,refid=refid).dump()
            except Exception as e:
                print("error",e)
        
        if file_extension=="brep" :            
            try:
                shape = conversion.read_brep_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0,refid=refid).dump()                
            except Exception as e:
                print("error",e)
        
        if file_extension=="dxf" :            
            try:
                shape = OCPImporters.importDXFObjects(sourceFileName, tol=distancegap )
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),distancegap=distancegap,
                    anglegap=anglegap,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,refid=refid).dump()                 
            except Exception as e:
                print("error",e)
        
        try:
            _, myShapes = outputShapes
            shapeArray,_,shapePickles,_,_ = getShapesFromOutPutShapes(myShapes,dictionary["tree"])
            (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                filename=sourceFileName,shapeslist=shapeArray,includeparts=False,distancegap=distancegap,
                anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                edgesize=0, vertexsize=0, kinematicanimation=[],shapeorder=[], delay=animationtime,refid=refid).dump()
        except Exception as e:
            print("error",e) 
        try:
            myPickle = {'sourceType':'Kinematic',
                            'sourceFileName':sourceFileName,
                            'distancegap':distancegap,
                            'anglegap':anglegap,
                            'animationtime':animationtime,
                            'colorshapes':shapePickles,
                            'refid':refid}
            picklefile = dictionary["display"]+dictionary["store"]+".pickle"
            with open(picklefile, 'wb') as f:                                
                pickle.dump(myPickle, f, pickle.HIGHEST_PROTOCOL)
                # Pickle the 'data' dictionary using the highest protocol available.
                #pickle.dump(shapePickles, f, pickle.HIGHEST_PROTOCOL)
        except Exception as e:
            print(e,"File, %s has error" % picklefile)          
        return dictionary
       
       
    except:
        return {}
        #raise ValueError("File Could not be loaded") 



@api_view(['GET'])
def FileGetKinematicAnimation(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':
            id = request.GET.get('id', None)
            refid = request.GET.get('refid','')
            distancegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
            anglegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
            animationtime = OCPStepIGESAnalyser.convertToFloat(request.GET.get('animationtime',"1.0"),1.0)
            print(id,distancegap,anglegap,animationtime)
            if is_number(id) :            
                files = File.objects.filter(id__icontains=id)
                for eachfile in files:               
                    data = exportTokinematicGLTF(MEDIA_URL+eachfile.file.name,distancegap,anglegap,animationtime,refid)#,thumbwidth,thumbheight)
            else:
                #id = request.GET.get('file', None)
                if id is not None:
                    data = exportTokinematicGLTF(MEDIA_URL+id,distancegap,anglegap,animationtime,refid)#,thumbwidth,thumbheight)
        return JsonResponse(data, safe=False)    
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)  
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

@api_view(['GET', 'POST'])
def FileSaveTree(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        dictionary={}
        if request.method == 'POST':
            tree = request.data['tree']
            #print(tree)
            structArray = json.loads(tree)
            name = request.data['name']
            guid = request.data['uuid'] 
            #refid = request.data['refid']
            if guid!='':
                guid = guid+'/'
            try:
                colorShapeArray=[]
                _, myPickle = getShapeFromPickle(guid+name)
                """ with open(DISPLAY_URL+guid+name+".pickle", 'rb') as f:
                    # The protocol version used is detected automatically, so we do not
                    # have to specify it.
                    myPickle = pickle.load(f) """
                sourceType = myPickle['sourceType']
                if sourceType=='Kinematic':
                    sourceFileName=myPickle['sourceFileName']
                    distancegap=OCPStepIGESAnalyser.convertToFloat(myPickle['distancegap'],0.1)
                    anglegap=OCPStepIGESAnalyser.convertToFloat(myPickle['anglegap'],0.5)
                    animationtime=OCPStepIGESAnalyser.convertToFloat(myPickle['animationtime'],1.0)
                    refid=myPickle['refid'] if 'refid' in myPickle else ''
                    colorShapeArray=myPickle['colorshapes']
                    #sourceFileName = name[:-2]
                    shapeArray=[]
                    kinematicanimation=[]
                    shapeorder=[]
                    print("Filename got",sourceFileName,"from",name,name[:-2])
                    for eachShapeInfo in colorShapeArray:
                        mergedshape,subShapeName,red,green,blue = eachShapeInfo
                        aColor = Quantity_Color(red,green,blue, Quantity_TOC_RGB)
                        shapeArray.append((mergedshape,subShapeName,aColor))
                        print(eachShapeInfo)
                    print(shapeArray)
                    for aTree in structArray:
                        print("Tree",aTree,shapeorder)  
                        posx, posy, posz, angle = 0, 0, 0, 0                 
                        if gltf_dict["id"] in aTree:
                            index=aTree[gltf_dict["id"]]-2                        
                        if "posx" in aTree:                    
                            posx=OCPStepIGESAnalyser.convertToFloat(aTree["posx"],0)
                        if "posy" in aTree:
                            posy=OCPStepIGESAnalyser.convertToFloat(aTree["posy"],0)
                        if "posz" in aTree:
                            posz=OCPStepIGESAnalyser.convertToFloat(aTree["posz"],0)
                        if "angle" in aTree:
                            angle=OCPStepIGESAnalyser.convertToFloat(aTree["angle"],0)                    
                        if(posx!=0 or posy!=0 or posz!=0 or angle!=0):
                            kinematicanimation.append((posx,posy,posz,angle))
                            shapeorder.append(index)
                    print(kinematicanimation,shapeorder)  
                    (_, _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                        filename=sourceFileName,shapeslist=shapeArray,includeparts=False,distancegap=distancegap,
                        anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,edgesize=0,vertexsize=0,
                        kinematicanimation=kinematicanimation,shapeorder=shapeorder,delay=animationtime,refid=refid).dump()
                elif sourceType=='Order':
                    sourceFileName = myPickle['sourceFileName']
                    distancegap = OCPStepIGESAnalyser.convertToFloat(myPickle['distancegap'],0.1)
                    anglegap = OCPStepIGESAnalyser.convertToFloat(myPickle['anglegap'],0.5)
                    explodegap = OCPStepIGESAnalyser.convertToFloat(myPickle['explodegap'],10)
                    center = OCPStepIGESAnalyser.convertToBool(myPickle['center'],True)
                    holescale= OCPStepIGESAnalyser.convertToFloat(myPickle['holescale'],0.77)
                    removegap= OCPStepIGESAnalyser.convertToFloat(myPickle['removegap'],8)
                    animationtime=OCPStepIGESAnalyser.convertToFloat(myPickle['animationtime'],1)
                    colorShapeArray=myPickle['colorshapes']
                    assemblyname=myPickle['assemblyname']
                    dimension=myPickle['dimension']
                    refid=myPickle['refid'] if 'refid' in myPickle else ''
                    shapeArray=[]    
                    shapesAlone=[]               
                    shapeorder=[]
                    shapedirection=[]
                    print("Filename got",sourceFileName,"from",name,name[:-2])
                    for eachShapeInfo in colorShapeArray:
                        mergedshape,subShapeName,red,green,blue = eachShapeInfo
                        aColor = Quantity_Color(red,green,blue, Quantity_TOC_RGB)
                        shapeArray.append((mergedshape,subShapeName,aColor))
                        shapesAlone.append(mergedshape)
                        print(eachShapeInfo)
                    print(shapeArray)
                    for aTree in structArray:
                        print("Tree",aTree,shapeorder)  
                        #posx, posy, posz, angle = 0, 0, 0, 0                 
                        if gltf_dict["id"] in aTree:
                            index=aTree[gltf_dict["id"]]-3 
                            if index>=0:
                                shapeorder.append(index)
                                if "AX" in aTree:                    
                                    ax=OCPStepIGESAnalyser.convertToFloat(aTree["AX"],0)
                                else:
                                    ax=0
                                if "AY" in aTree:                    
                                    ay=OCPStepIGESAnalyser.convertToFloat(aTree["AY"],0)
                                else:
                                    ay=0
                                if "AZ" in aTree:                    
                                    az=OCPStepIGESAnalyser.convertToFloat(aTree["AZ"],0)
                                else:
                                    az=0
                                if "CX" in aTree:                    
                                    cx=OCPStepIGESAnalyser.convertToFloat(aTree["CX"],0)
                                else:
                                    cx=0
                                if "CY" in aTree:                    
                                    cy=OCPStepIGESAnalyser.convertToFloat(aTree["CY"],0)
                                else:
                                    cy=0
                                if "CZ" in aTree:                    
                                    cz=OCPStepIGESAnalyser.convertToFloat(aTree["CZ"],0)  
                                else:
                                    cz=0   
                                if "CW" in aTree:                    
                                    cw=OCPStepIGESAnalyser.convertToFloat(aTree["CW"],0) 
                                else:
                                    cw=0                   
                                shapedirection.append(((ax,ay,az),(cx,cy,cz,cw)))
                    dictionary = FindAssemblingOrder(shapeArray,shapesAlone,assemblyname,dimension,explodegap,center,holescale,removegap,logging).\
                                    reChangeOrder(shapeorder,shapedirection,sourceFileName,distancegap,anglegap,animationtime,refid)
            except Exception as e:
                print("Error while loading",name,e) 
            if sourceType!='Order':  
                try:
                    treefile = DISPLAY_URL+guid+name+'.tree'
                    if not os.path.isfile(treefile):
                        treefile=S3_BUCKET+treefile #DISPLAY_URL+guid+name+'.tree'
                        if not os.path.isfile(treefile):
                            treefile = DISPLAY_URL+guid+name+'.tree'
                    print("Writing,",treefile)
                    with open(treefile, 'w') as fh:
                        fh.write(json.dumps(structArray, sort_keys=True, indent=2 ))
                except Exception as e:
                    print("Error while writing treefile",e)     
        return JsonResponse(dictionary, safe=False)
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

@api_view(['GET', 'POST'])
def FileSaveGDT(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        dictionary={}
        if request.method == 'POST':
            gdt = request.data['gdt']
            guid = request.data['uuid'] 
            if guid!='':
                guid = guid+'/'
            #print(tree)
            structArray = json.loads(gdt)
            name = request.data['name']  
            if name=='null':
                name='Blank'
            try:
                gdtfile = DISPLAY_URL+guid+name+'.gdt'
                if not os.path.isfile(gdtfile):
                    gdtfile=S3_BUCKET+gdtfile #DISPLAY_URL+guid+name+'.gdt'
                    if not os.path.isfile(gdtfile):
                        gdtfile = DISPLAY_URL+guid+name+'.gdt'
                print("Writing,",gdtfile)
                """ gdtfile = DISPLAY_URL+guid+name+'.gdt'
                print("Writing,",gdtfile) """
                with open(gdtfile, 'w') as fh:
                    fh.write(json.dumps(structArray, sort_keys=True, indent=2 ))
                dictionary = {
                    'gdt':structArray,
                    'file':gdtfile,
                    'uuid':guid
                    }
                
            except Exception as e:
                print("Error while writing gdtfile",e)     
        return JsonResponse(dictionary, safe=False)
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

@api_view(['GET'])
def GetFileContent(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        dictionary = {}
        if request.method == 'GET':
            file = request.GET.get('file', None)    
            try:
               response = FileResponse(open(file, 'rb'))
               print("Got file content for",file)
               return response
            except Exception as e:
                print("Error while reading file",e,file) 
        return JsonResponse(dictionary, safe=False)
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    """ finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e) """
@api_view(['GET'])
def FetchFileContent(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        if request.method == 'GET':
            file = request.GET.get('file', None)
            path = request.GET.get('path', None)
            if path:
                checkfilefrom = path+file
                if not os.path.isfile(checkfilefrom):
                    checkfilefrom = 'Display/'+file
                    toCheck = True
                else:
                    toCheck = False
            else:
                checkfilefrom = 'Display/'+file
                toCheck = True
            if toCheck:
                if not os.path.isfile(checkfilefrom):
                    checkfilefrom = 's3bucket/'+checkfilefrom
                    if not os.path.isfile(checkfilefrom):
                        checkfilefrom = file
                        if not os.path.isfile(checkfilefrom):
                            checkfilefrom = ''
            if checkfilefrom != '':
                try:
                    response = FileResponse(open(checkfilefrom, 'rb'))
                    print("Got file content for",checkfilefrom)
                    return response
                except Exception as e:
                    print("Error while reading file",e,file,checkfilefrom) 
                    return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
                except:
                    try:
                        logging.error(traceback.format_exc())
                    except Exception as e:
                        print("Error while logging",e)
                        return JsonResponse({'message': "System Error", 'exception':e},status=status.HTTP_400_BAD_REQUEST, safe=False)
                    return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
            else:
                return JsonResponse({},status=status.HTTP_400_BAD_REQUEST, safe=False)                
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as err:
            print("Error while logging",err)
            return JsonResponse({'message': str(e), 'exception':err},status=status.HTTP_400_BAD_REQUEST, safe=False)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
        except Exception as e:
            print("Error while logging",e)
            return JsonResponse({'message': "System Error", 'exception':e},status=status.HTTP_400_BAD_REQUEST, safe=False)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)

@api_view(['GET'])
def CheckFileExistence(request):
    try:
        dictionary = {}
        if request.method == 'GET':
            file = request.GET.get('file', None)
            try:
                if os.path.isfile('Display/'+file):
                    dictionary['path']="Linux"
                elif os.path.isfile('s3bucket/Display/'+file):
                    dictionary['path']="S3"
                elif os.path.isfile(file):  
                    dictionary['path']="Self" 
                else:
                     dictionary['path']=""
                dictionary['status'] = 'success'
            except Exception as e:
                print("Error while checking file",e,file) 
                dictionary['path'] = ""
                dictionary['status'] = str(e)
        return JsonResponse(dictionary, safe=False)
    except Exception as e:
        try:
            dictionary['path'] = ""
            dictionary['status'] = str(e)
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as err:
            print("Error while logging",err) 
            dictionary['path'] = "" 
            dictionary['status'] = str(e)+" "+str(err)         
        return JsonResponse(dictionary, safe=False)
    except:
        try:
            dictionary['path'] = ""
            logging.error(traceback.format_exc())
        except Exception as e:
            print("Error while logging",e)
            dictionary['path'] = ""
            dictionary['status'] = str(e)
        return JsonResponse(dictionary, safe=False)
    
@api_view(['GET','POST','PUT','DELETE','PATCH'])
def HackersResponse(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "Hackers System Error "+str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)
    except:
        try:
            logging.error(traceback.format_exc())
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "Hackers System Error "+str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)

def extractKinematicInformation_old(kinematicparts):
    #print("Kinematic Parts",kinematicparts)
    print("")

    kinematicInformation = []
    ap=-1
    for kinematicpart in kinematicparts:
        myInfo = (None,None,0,False,False,[0,0,0],0,0,0)
        if 'actuator_motion_control' in kinematicpart:
            kinematicinfo = kinematicpart['actuator_motion_control']
            myInfo = getValueFromJSONKey(kinematicinfo,'child_part_name'),\
                getValueFromJSONKey(kinematicinfo,'child_part_display_name'),\
                    getValueFromJSONKey(kinematicinfo,'child_sequence_number'),\
                        getValueFromJSONKey(kinematicinfo,'is_actuator_or_chain_link'),\
                            getValueFromJSONKey(kinematicinfo,'is_linear_or_rotational'),\
                                getValueFromJSONKey(kinematicinfo,'cylindrical_axis_of_rotation'),\
                                    getValueFromJSONKey(kinematicinfo,'angle_or_distant_limit'),\
                                        getValueFromJSONKey(kinematicinfo,'axis_before_link'),\
                                            getValueFromJSONKey(kinematicinfo,'axis_after_link')
        else:
            kinematicinfo='No Information for kinematic info'
        print("What I got as Axis1",kinematicinfo,myInfo)                             
        partName, displayName, sequence, isActuator, isLinear, axisDict, aw, bl, al = myInfo
        print("What I got as Axis2",axisDict,kinematicinfo,myInfo)
        axis = None
        shapeOfAxis = None
        if axisDict is None:
            axis  = [0,0,0]
        elif 'axis' in axisDict:
            axis = axisDict['axis']
            if 'step' in axisDict:
                _, shapeOfAxis = getShapeFromPickle(axisDict['step'])
                        
        isActuator = not OCPStepIGESAnalyser.convertToBool(isActuator,False)
        bl = OCPStepIGESAnalyser.convertToInt(bl,0)
        al = OCPStepIGESAnalyser.convertToInt(al,0)
        if al!=0 and bl!=0 : #if it is a link, then it can not be actuator.
            isActuator = False        
        if partName==None:
            partName = getValueFromJSONKey(kinematicpart,'filePartName')
        if displayName==None:
            displayName = getValueFromJSONKey(kinematicpart,'name')
        if axis is None:
            axis  = [0,0,0]            
        elif isinstance(axis, list)==False :
            if 'xx' in axis:
                axis = [axis['xx'],axis['xy'],axis['xz']]
            else:
                axis = [axis,0,0]
        elif len(axis)>3:
            axis = axis[0:3]
        elif len(axis)<3:
            remainingLength = (3-len(axis))
            for _ in range(remainingLength):
                axis.append(0)
        [ax,ay,az]=axis
        axis = [OCPStepIGESAnalyser.convertToFloat(ax,0), OCPStepIGESAnalyser.convertToFloat(ay,0), OCPStepIGESAnalyser.convertToFloat(az,0)]
        # if axis==[0,0,0]:
        #     axis=[0,1,2]
        aw = OCPStepIGESAnalyser.convertToFloat(aw,0)
        # if isActuator and aw==0:
        #     aw= math.pi/3 # 3.14 #3.14 #math.pi
        #     ap=-0.1*ap
        sequence = OCPStepIGESAnalyser.convertToInt(sequence,0)
        isLinear = OCPStepIGESAnalyser.convertToBool(isLinear,False)
      
        myInfo = partName, displayName, sequence, isActuator, isLinear, axis, aw, bl, al, shapeOfAxis
        print("Each Kinematic Info",myInfo,kinematicinfo)
        kinematicInformation.append(myInfo)
    lengthOfKinematicInfo = len(kinematicInformation)
    print("Kinematic Info before arranging",kinematicInformation)
    for kinematicInfo in range(lengthOfKinematicInfo):
        partName, displayName, _, isActuator, isLinear, [ax,ay,az], aw, bl, al, shapeOfAxis = kinematicInformation[kinematicInfo]
        if not isActuator:
            kinematicInformation[kinematicInfo] = partName, displayName, 0, isActuator, isLinear, [ax,ay,az], aw, bl, al, shapeOfAxis
            for secondPass in range(lengthOfKinematicInfo):
                 partName2, displayName2, sequence2, isActuator2, isLinear2, [ax2,ay2,az2], aw2, bl2, al2, shapeOfAxis2 = kinematicInformation[secondPass]
                 if sequence2>=bl:
                     kinematicInformation[secondPass] = partName2, displayName2, sequence2+1, isActuator2, isLinear2, [ax2,ay2,az2], aw2, bl2, al2, shapeOfAxis2
            for secondPass in range(kinematicInfo,lengthOfKinematicInfo):
                 partName2, displayName2, sequence2, isActuator2, isLinear2, [ax2,ay2,az2], aw2, bl2, al2, shapeOfAxis2 = kinematicInformation[secondPass]
                 if not isActuator:
                    if secondPass==kinematicInfo:
                        kinematicInformation[secondPass] = partName2, displayName2, bl, isActuator2, isLinear2, [ax2,ay2,az2], aw2, bl2+1, al2+1, shapeOfAxis2
                    elif bl2>=bl:
                        kinematicInformation[secondPass] = partName2, displayName2, sequence2, isActuator2, isLinear2, [ax2,ay2,az2], aw2, bl2+1, al2+1, shapeOfAxis2
    for kinematicInfo in range(lengthOfKinematicInfo):
        partName, displayName, sequence, isActuator, isLinear, [ax,ay,az], aw, bl, al, shapeOfAxis = kinematicInformation[kinematicInfo]
        if ((not isActuator) and (sequence>1)):
            for secondPass in range(lengthOfKinematicInfo):
                 partName2, displayName2, sequence2, isActuator2, isLinear2, [ax2,ay2,az2], aw2, bl2, al2, shapeOfAxis2 = kinematicInformation[secondPass]
                 if sequence2==sequence-1:
                    kinematicInformation[kinematicInfo] = partName, displayName, sequence, isActuator, isLinear2, [ax2,ay2,az2], aw2, bl, al, shapeOfAxis2
                    break
            
    print("")
    print("Kinematic Info after arranging",kinematicInformation)               
    return kinematicInformation

def findAnyOne(chain1, chain2):
    length1=len(chain1)
    length2=len(chain2)
    if length1 < length2:
        for achain in chain1:
            if achain in chain2:
                return True
    else:
        for achain in chain2:
            if achain in chain1:
                return True
    return False

def extractKinematicInformation(kinematicparts):
    #print("Kinematic Parts",kinematicparts)
    print("")

    kinematicInformation = []
    maxChain=-1
    maxAngle=-1e10
    for kinematicpart in kinematicparts:
        myInfo =  (None, None, "STATIC", 0, 0, [0,0,0], 0, 0, 0, False, 0, False, False)
        if 'actuator_motion_control' in kinematicpart:
            kinematicinfo = kinematicpart['actuator_motion_control']
            myInfo = getValueFromJSONKey(kinematicinfo,'child_part_name'),\
                getValueFromJSONKey(kinematicinfo,'child_part_display_name'),\
                    getValueFromJSONKey(kinematicinfo,'child_part_type'),\
                        getValueFromJSONKey(kinematicinfo,'axis_number'),\
                            getValueFromJSONKey(kinematicinfo,'child_sequence_number'),\
                                getValueFromJSONKey(kinematicinfo,'cylindrical_axis_of_rotation'),\
                                    getValueFromJSONKey(kinematicinfo,'rotational_angle_limit'),\
                                        getValueFromJSONKey(kinematicinfo,'linear_distance_limit'),\
                                            getValueFromJSONKey(kinematicinfo,'machine_actuator_limit'),\
                                                getValueFromJSONKey(kinematicinfo,'is_linear_or_rotational'),\
                                                    getValueFromJSONKey(kinematicinfo,'angle_or_distant_limit'),\
                                                        getValueFromJSONKey(kinematicinfo,'is_actuator_or_chain_link'),\
                                                            getValueFromJSONKey(kinematicinfo,'is_end_effector')
        else:
            kinematicinfo='No Information for kinematic info'
        #print("What I got as Axis1",kinematicinfo,myInfo)     
                                
        partName, displayName, partType, sequence, chains, axisDict, angle, distance, machineLimit, isLinear, aw, isActuator, isEndEffector = myInfo
        print("What I got as Axis",axisDict,kinematicinfo,myInfo)
        axis = None
        shapeOfAxis = None
        if axisDict is None:
            axis  = [0,0,0]
        elif 'axis' in axisDict:
            axis = axisDict['axis']
            if 'step' in axisDict:
                _, shapeOfAxis = getShapeFromPickle(axisDict['step'])
        forceAngle = isActuator is not None
        isActuator = not OCPStepIGESAnalyser.convertToBool(isActuator,False)
        if (partType is None) or forceAngle:
            forceAngle = True
            if isActuator:
                partType='ACTUATOR'
            else:
                partType='LINKAGE' 
        if partType is None:
            partType='STATIC' 
        # if partType=='STATIC' and sequence!=3 and sequence!=5:
        #     partType='ACTUATOR'
        # if partType=='STATIC' and (sequence==3 or sequence==5):
        #     partType='LINKAGE'
        if partName==None:
            partName = getValueFromJSONKey(kinematicpart,'filePartName')
        if displayName==None:
            displayName = getValueFromJSONKey(kinematicpart,'name')
        if axis is None:
            axis  = [0,0,0]            
        elif isinstance(axis, list)==False :
            if 'xx' in axis:
                axis = [axis['xx'],axis['xy'],axis['xz']]
            else:
                axis = [axis,0,0]
        elif len(axis)>3:
            axis = axis[0:3]
        elif len(axis)<3:
            remainingLength = (3-len(axis))
            for _ in range(remainingLength):
                axis.append(0)
        [ax,ay,az]=axis
        axis = [OCPStepIGESAnalyser.convertToFloat(ax,0), OCPStepIGESAnalyser.convertToFloat(ay,0), OCPStepIGESAnalyser.convertToFloat(az,0)]
        [ax,ay,az]=axis
        if shapeOfAxis and ax==0 and ay==0 and az==0 :
            myobb = get_oriented_bounding_details(shapeOfAxis)
            ax, ay, az = getMaxDirectionFromOBB(myobb)
            axis = [OCPStepIGESAnalyser.convertToFloat(ax,0), OCPStepIGESAnalyser.convertToFloat(ay,0), OCPStepIGESAnalyser.convertToFloat(az,0)]
            
        # if axis==[0,0,0]:
        #     axis=[0,1,2]
        aw = OCPStepIGESAnalyser.convertToFloat(aw,0)
        angle = OCPStepIGESAnalyser.convertToFloat(angle,0)
        if ((angle==0) and (isLinear==False) ):
            angle = aw  
            # if angle==0:
            #     angle=math.pi/3       
        if maxAngle < angle:
            maxAngle = angle
        distance = OCPStepIGESAnalyser.convertToFloat(distance,0)
        if ((distance==0) and (isLinear==True)):
            distance = aw
        machineLimit = OCPStepIGESAnalyser.convertToFloat(machineLimit, distance if isLinear else angle )
        # if machineLimit==0:
        #     machineLimit = distance if isLinear else angle
        # if isActuator and aw==0:
        #     aw= math.pi/3 # 3.14 #3.14 #math.pi
        #     ap=-0.1*ap
        if ((angle==0) and forceAngle):
            angle = math.pi/3    
        if (sequence is None) and (chains) and (isinstance(chains, list)==False) :
            sequence = chains
            chains=[1]
        sequence = OCPStepIGESAnalyser.convertToInt(sequence,1)
        # if ((chains is None) or len(chains)==0) and sequence < 6:
        #     chains=[1,2]
        # elif ((chains is None) or len(chains)==0) and sequence==6:
        #     chains=[2]
        # elif ((chains is None) or len(chains)==0) and sequence > 6:
        #     chains=[1]
        #     sequence -=1
        # elif isinstance(chains, list)==False :
        #     chains=[convertToInt(chains,1)]
        # elif len(chains)==0:
        #     chains=[1]
        if chains is None:
            chains=[1]
        elif isinstance(chains, list)==False :
            chains=[OCPStepIGESAnalyser.convertToInt(chains,1)]
        elif len(chains)==0:
            chains=[1]
        for chain in range(len(chains)):
            chains[chain] = OCPStepIGESAnalyser.convertToInt(chains[chain],1)
            if maxChain < chains[chain]:
                maxChain = chains[chain]
        chains=sorted(chains)
        isLinear = OCPStepIGESAnalyser.convertToBool(isLinear,False)
        isEndEffector = OCPStepIGESAnalyser.onvertToBool(isEndEffector,False)
        nextAxis, axisAngle, axisDistance = axis, angle, distance
        myInfo = (partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector)
        print("Each Kinematic Info",myInfo,kinematicinfo)
        kinematicInformation.append(myInfo)
    lengthOfKinematicInfo = len(kinematicInformation)
    print("Kinematic Info before arranging",kinematicInformation,lengthOfKinematicInfo)
    for kinematicInfo in range(lengthOfKinematicInfo):
        print("Kinematic Info of checking linkage to insert array",kinematicInfo,kinematicInformation[kinematicInfo])
        partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector  = kinematicInformation[kinematicInfo]
        if (partType=="LINKAGE") :
            findAcutator=False
            for secondPass in range(lengthOfKinematicInfo):
                partName2, displayName2, partType2, sequence2, chains2, axis2, nextAxis2, axisAngle2, axisDistance2, angle2, distance2, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector2 = kinematicInformation[secondPass]
                if ( (partType2=="ACTUATOR") and (sequence2==sequence) and findAnyOne(chains2,chains)) :
                    findAcutator=True
                    break
            if findAcutator:        
                kinematicInformation[kinematicInfo] =  partName, displayName, partType, sequence+1, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector  
                for secondPass in range(lengthOfKinematicInfo):
                    partName2, displayName2, partType2, sequence2, chains2, axis2, nextAxis2, axisAngle2, axisDistance2, angle2, distance2, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector2 = kinematicInformation[secondPass]
                    if ( (sequence2>sequence) and findAnyOne(chains2,chains)) :
                        print("Yes Setting Kinematic Info of secondPass to insert array",secondPass,kinematicInformation[secondPass]) 
                        kinematicInformation[secondPass] = partName2, displayName2, partType2, sequence2+1, chains2, axis2, nextAxis2, axisAngle2, axisDistance2, angle2, distance2, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector2
                    else:
                        print("Not Setting Kinematic Info of secondPass to insert array",secondPass,kinematicInformation[secondPass],chains2,chains,sequence2,sequence) 
                kinematicInformation[kinematicInfo] =  partName, displayName, partType, sequence+1, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector  
    if maxChain > 0:
        maxSequence = [-1 for x in range(maxChain)]
        for kinematicInfo in range(lengthOfKinematicInfo):
            partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector = kinematicInformation[kinematicInfo]
            for chain in chains:
                if chain > 0:
                    if maxSequence[chain-1] < sequence:
                        maxSequence[chain-1] = sequence                
    else:
        maxSequence=[]
    print("Chains presence",maxChain)
    for chainIndex in range(maxChain):
        maxRangeSequence = maxSequence[chainIndex-1]
        print("Sequence presence",chainIndex,maxRangeSequence)
        for sequenceIndex in range(maxRangeSequence):
            currentIndex = maxRangeSequence-1-sequenceIndex
            TopFound=-1
            BelowFound=-1
            doRotateAxis=False
            doLinkageAxis=False
            for kinematicInfo in range(lengthOfKinematicInfo):
                partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector = kinematicInformation[kinematicInfo]
                print("What I got for axis copy",currentIndex,kinematicInformation[kinematicInfo],chainIndex+1,chains,sequence, (chainIndex+1) in chains,sequence==currentIndex,sequence==(currentIndex+1) )
                if ((chainIndex+1) in chains) and (sequence==currentIndex):
                    BelowFound=kinematicInfo
                    doRotateAxis= (partType=="ACTUATOR")
                    doLinkageAxis = (partType!="ACTUATOR")
                if ((chainIndex+1) in chains) and (sequence==(currentIndex+1)):
                    TopFound=kinematicInfo
                    if currentIndex==0:
                        BelowFound=TopFound
                        doRotateAxis= (partType=="ACTUATOR")
                if (TopFound != -1) and (BelowFound != -1):
                    break
            if doRotateAxis and (TopFound != -1):
                partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector = kinematicInformation[TopFound]
                partName2, displayName2, partType2, sequence2, chains2, axis2, nextAxis2, axisAngle2, axisDistance2, angle2, distance2, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector2 = kinematicInformation[BelowFound]
                print("ToDo transform for actuator",TopFound,BelowFound,partType,partType2,doLinkageAxis,(TopFound==BelowFound) or (doLinkageAxis and (partType=="ACTUATOR")))
                if (TopFound==BelowFound):
                    angle2, distance2, machineLimit2 = 0, 0, 0
                kinematicInformation[TopFound] = partName, displayName, partType, sequence, chains, axis2, nextAxis, axisAngle, axisDistance, angle2, distance2, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector
                print("Changing info because of previous part as Actuator", kinematicInformation[TopFound])
            
            if doLinkageAxis and (TopFound != -1):
                partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector = kinematicInformation[TopFound]
                #partName2, displayName2, partType2, sequence2, chains2, axis2, nextAxis2, axisAngle2, axisDistance2, angle2, distance2, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector2 = kinematicInformation[BelowFound]
                print("ToDo transform for linkage",TopFound,BelowFound,partType,partType2,doLinkageAxis,(TopFound==BelowFound) or (doLinkageAxis and (partType=="ACTUATOR")))
                if (partType=="ACTUATOR"):
                    #angle2, distance2, machineLimit2 = 0, 0, 0
                    kinematicInformation[TopFound] = partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, 0, 0, 0, shapeOfAxis, isLinear, isEndEffector
                    print("Changing info because of previous part as Linkage", kinematicInformation[TopFound])
    print("")
    print("Kinematic Info after arranging",kinematicInformation,maxChain,maxSequence)               
    return kinematicInformation, maxChain, maxSequence

""" for kinematicInfo in range(lengthOfKinematicInfo):
        print("Kinematic Info of checking linkage to copy axis",kinematicInfo,kinematicInformation[kinematicInfo])
        partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector = kinematicInformation[kinematicInfo]
        if ((partType=="LINKAGE") and (sequence>1)):
            for secondPass in range(lengthOfKinematicInfo):
                print("Kinematic Info of secondPass to copy axis",secondPass,kinematicInformation[secondPass])        
                partName2, displayName2, partType2, sequence2, chains2, axis2, nextAxis2, axisAngle2, axisDistance2, angle2, distance2, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector2 = kinematicInformation[secondPass]
                if ((sequence2==sequence-1) and (chains2==chains)):
                    kinematicInformation[kinematicInfo] = partName, displayName, partType, sequence, chains, axis2, nextAxis, axisAngle, axisDistance, angle2, distance2, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector
                    kinematicInformation[secondPass] = partName2, displayName2, partType2, sequence2, chains2, axis2, nextAxis2, axisAngle2, axisDistance2, 0, 0, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector2
                    break
   
    for kinematicInfo in range(lengthOfKinematicInfo):
        print("Kinematic Info of checking linkage to make zero",kinematicInfo,kinematicInformation[kinematicInfo])
        partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector = kinematicInformation[kinematicInfo]
        if ((partType=="LINKAGE") and (sequence<lengthOfKinematicInfo)):
            for secondPass in range(lengthOfKinematicInfo):
                print("Kinematic Info of secondPass to make zero",secondPass,kinematicInformation[secondPass])        
                partName2, displayName2, partType2, sequence2, chains2, axis2, nextAxis2, axisAngle2, axisDistance2, angle2, distance2, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector2 = kinematicInformation[secondPass]
                if ((sequence2==sequence+1) and (chains2==chains)):
                    kinematicInformation[secondPass] = partName2, displayName2, partType2, sequence2, chains2, axis2, nextAxis2, axisAngle2, axisDistance2, 0, 0, machineLimit2, shapeOfAxis2, isLinear2, isEndEffector2
                    break
    if maxChain > 0:
        maxSequence = [-1 for x in range(maxChain)]
        for kinematicInfo in range(lengthOfKinematicInfo):
            partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector = kinematicInformation[kinematicInfo]
            for chain in chains:
                if chain > 0:
                    if maxSequence[chain-1] < sequence:
                        maxSequence[chain-1] = sequence                
    else:
        maxSequence=[]
    print("")
    print("Kinematic Info after arranging",kinematicInformation,maxChain,maxSequence)               
    return kinematicInformation, maxChain, maxSequence """

def getKinematicInformation(kinematicparts,partname):
    html_display = html.escape(partname)
    for kinematicpart in kinematicparts:
        if 'actuator_motion_control' in kinematicpart:
            kinematicinfo = kinematicpart['actuator_motion_control']
            if (getValueFromJSONKey(kinematicinfo,'child_part_name')==html_display) or \
                (getValueFromJSONKey(kinematicinfo,'child_part_display_name')==html_display):
                return OCPStepIGESAnalyser.convertToInt(getValueFromJSONKey(kinematicinfo,'child_sequence_number'),1),\
                    OCPStepIGESAnalyser.convertToBool(getValueFromJSONKey(kinematicinfo,'is_actuator_or_chain_link'),False),\
                        OCPStepIGESAnalyser.convertToBool(getValueFromJSONKey(kinematicinfo,'is_linear_or_rotational'),False),\
                            getValueFromJSONKey(kinematicinfo,'cylindrical_axis_of_rotation'),\
                                OCPStepIGESAnalyser.convertToFloat(getValueFromJSONKey(kinematicinfo,'angle_or_distant_limit'),0.1)   
    return (0,False,False,[0,0,0],0)

def getKinematicInformationFromIndex(kinematicParts,partname):
    html_display = html.escape(partname)
    for kinematicPart in kinematicParts:
        partName, displayName, _, _, _, _, _, _, _, _, _,_,_,_,_ = kinematicPart
        if (partName==html_display) or (displayName==html_display):
            return kinematicPart 
    return ("No Name", "Empty Item", "STATIC", 0, 0, [0,0,0], [0,0,0], 0, 0, 0, 0, 0, None, False, False) 
    

def exportTokinematicRotationGLTF(sourceFileName,distancegap,anglegap,animationtime=1.5,starttime=None,refid='',partsteps=[]):#,thumbwidth,thumbheight):
    """
    Imports a file based on the type (STEP, IGES, BREP, STL)    
    """
    #Now read and return the shape
   
    try:
        
        
        dictionary={}
        _, file_extension = os.path.splitext(sourceFileName)
        file_extension = file_extension[1:] if file_extension[0] == "." else file_extension
        file_extension = file_extension.lower()
        newfilenamewithoutext = DISPLAY_URL+Path(sourceFileName).resolve().stem
        newfilename = newfilenamewithoutext + ".step"
        outputShapes={}
        if file_extension=="stp" or file_extension=="step" or file_extension=="igs" or file_extension=="iges" :          
            
            try:
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,includeparts=False,distancegap=distancegap, logging=logging, 
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False,
                    edgesize=0, vertexsize=0,thumbwidth=0,thumbheight=0,refid=refid).dump()
            except Exception as e:
                print("error",e)
       
        if file_extension=="stl" :            
            try:
                shape = conversion.read_stl_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0,refid=refid).dump()
            except Exception as e:
                print("error",e)
        
        if file_extension=="brep" :            
            try:
                shape = conversion.read_brep_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0,refid=refid).dump()                
            except Exception as e:
                print("error",e)
        
        if file_extension=="dxf" :            
            try:
                shape = OCPImporters.importDXFObjects(sourceFileName, tol=distancegap )
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),distancegap=distancegap,
                    anglegap=anglegap,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,refid=refid).dump()                 
            except Exception as e:
                print("error",e)
        
        try:
            getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],30,starttime,False)
            _, myShapes = outputShapes
            
            shapeArray,_,shapePickles,_,_ = getShapesFromOutPutShapes(myShapes,dictionary["tree"])
            print("myshapes",shapePickles)
            kinematicrotation = []
            shapeorder=[]
            shapeCount = 0
            if 'parts' in partsteps:
                kinematicparts = partsteps['parts']
            else:
                kinematicparts = []
            #print("What we got from react",kinematicparts)
            try:
                indexedKinematicInformation, maxChain, maxSequence = extractKinematicInformation(kinematicparts) 
            except Exception as e:
                print("Error while parsing kinematic",e)   
            maxChainShape = 0 if maxChain<=0 else maxChain
            mySequenceCount=0
            shapeorder=[]
            notFoundSequence=[]
            for chainRow in range(maxChainShape):
                shapeorder.append([])
                kinematicrotation.append([])
                notFoundSequence.append(0)
                maxSequenceShape = (0 if  maxSequence[chainRow]<=0 else maxSequence[chainRow])
                for _ in range(maxSequenceShape):
                    shapeorder[chainRow].append(-1)
                    mySequenceCount+=1
            # for missingElements in range(mySequenceCount,lengthOfKinematicParts):
            #     shapeorder[maxChainShape-1].append(-1)
            
            #partsteps=None
            lenShapeArray = len(shapeArray)
            # firstShapeInfo=None
            for chain in range(1,maxChain+1):
                shapeCount=0
                for shapeArrayIndex in  range(lenShapeArray):
                    eachShape,eachName,_=shapeArray[shapeArrayIndex]
                    whatWeGotFromKinematicInfo=getKinematicInformationFromIndex(indexedKinematicInformation,eachName)  
                    #print("What we got here",whatWeGotFromKinematicInfo)
                    partName, displayName, partType, sequence, chains, axis, nextAxis, axisAngle, axisDistance, angle, distance, machineLimit, shapeOfAxis, isLinear, isEndEffector = whatWeGotFromKinematicInfo
                    [ax,ay,az]=axis 
                    #print("Error has occured here?")
                    if shapeOfAxis is None:
                        shapeOfAxis=eachShape
                    """ if shapeArrayIndex==0:
                        firstShapeInfo=getShapeLocationAndDirection(shapeOfAxis)  """
                    if ax==0 and ay==0 and az==0 :
                        myobb = get_oriented_bounding_details(shapeOfAxis)
                        ax, ay, az = getMaxDirectionFromOBB(myobb)
                        ax, ay, az = OCPStepIGESAnalyser.convertToFloat(ax,0), OCPStepIGESAnalyser.convertToFloat(ay,0), OCPStepIGESAnalyser.convertToFloat(az,0)
                    if ax==0 and ay==0 and az==0 :
                        myobb = get_oriented_bounding_details(eachShape)
                        ax, ay, az = getMaxDirectionFromOBB(myobb)
                        ax, ay, az = OCPStepIGESAnalyser.convertToFloat(ax,0), OCPStepIGESAnalyser.convertToFloat(ay,0), OCPStepIGESAnalyser.convertToFloat(az,0)
                    print("Each one",eachName,sequence,whatWeGotFromKinematicInfo, ax, ay, az  ) 
                    if  (chain in chains):
                        maxSequenceShape = maxSequence[chain-1]
                        if (sequence >0 and sequence <= maxSequenceShape):
                            shapeorder[chain-1][sequence-1]=shapeCount
                        else:
                            notFoundSequence[chain-1]+=1
                    else:
                        notFoundSequence[chain-1]+=1
                    if partType=="STATIC":
                        kinematicrotation[chain-1].append(((ax,ay,az,0),(ax,ay,az,0),eachName,partName, displayName, partType, sequence, chain, shapeOfAxis,eachShape, isLinear, isEndEffector))
                    else:
                        kinematicrotation[chain-1].append(((ax,ay,az,min(distance,machineLimit)),(ax,ay,az,min(angle,machineLimit)),eachName,partName, displayName, partType, sequence, chain, shapeOfAxis,eachShape, isLinear, isEndEffector))
                    shapeCount += 1                          
                #print("PART STEPS",partsteps, kinematicparts, (partsteps==None) or (len(kinematicparts)==0))  
            print("Info of kinematic and shapeorder",shapeorder,kinematicrotation,notFoundSequence,shapeCount)
            # if(maxChainShape < lengthOfOnlyShapes):
            #     shapeorder = shapeorder[0:maxChainShape]
            # print("Info of kinematic after truncating",shapeorder,kinematicrotation,lengthOfKinematicParts,lengthOfOnlyShapes)
            (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                filename=sourceFileName,shapeslist=shapeArray,includeparts=False,distancegap=distancegap,
                anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,
                edgesize=0, vertexsize=0, kinematicrotation=kinematicrotation,shapeorder=shapeorder,
                delay=animationtime,refid=refid).dump()

        except Exception as e:
            print("error",e) 
        try:
            myPickle = {'sourceType':'KinematicRotation',
                            'sourceFileName':sourceFileName,
                            'distancegap':distancegap,
                            'anglegap':anglegap,
                            'animationtime':animationtime,
                            'colorshapes':shapePickles,
                            'refid':refid}
            picklefile = dictionary["display"]+dictionary["store"]+".pickle"
            with open(picklefile, 'wb') as f:                                
                pickle.dump(myPickle, f, pickle.HIGHEST_PROTOCOL)
                # Pickle the 'data' dictionary using the highest protocol available.
                #pickle.dump(shapePickles, f, pickle.HIGHEST_PROTOCOL)
        except Exception as e:
            print(e,"File, %s has error" % picklefile)  
        getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],100,starttime,False)        
        return 
       
       
    except:
        return {}
        #raise ValueError("File Could not be loaded") 



@api_view(['GET','POST'])
def FileGetKinematicRotationalAnimation(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':
            id = request.GET.get('id', None)
            refid = request.GET.get('refid','')
            distancegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
            anglegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
            animationtime = OCPStepIGESAnalyser.convertToFloat(request.GET.get('animationtime',"1.0"),1.0)
            print(id,distancegap,anglegap,animationtime)
            starttime = datetime.utcnow() 
            if is_number(id) :            
                files = File.objects.filter(id__icontains=id)
                for eachfile in files: 
                    basefilename,displaypath = getBasefileNameAndDisplayPath(MEDIA_URL+eachfile.file.name,0,"R")
                    data = getEmptyDictionary(MEDIA_URL+eachfile.file.name, basefilename,displaypath,0,starttime,True) 
                    print("From assembly",data)
                    mythread = threading.Thread(target=exportTokinematicRotationGLTF, daemon=True,\
                        args=(MEDIA_URL+eachfile.file.name,distancegap,anglegap,animationtime,starttime,refid))
                    mythread.start()  
            else:
                #id = request.GET.get('file', None)
                if id is not None:
                    basefilename,displaypath = getBasefileNameAndDisplayPath(MEDIA_URL+id,0,"R")
                    data = getEmptyDictionary(MEDIA_URL+id, basefilename,displaypath,0,starttime,True) 
                    print("From assembly",data)
                    mythread = threading.Thread(target=exportTokinematicRotationGLTF, daemon=True,\
                        args=(MEDIA_URL+id,distancegap,anglegap,animationtime,starttime,refid))
                    mythread.start()         
        elif request.method == 'POST':
            #print("Reached here in kinematic move",request.data)
            id = request.data['id']
            distancegap = OCPStepIGESAnalyser.convertToFloat(request.data['distancegap'],0.1)
            anglegap = OCPStepIGESAnalyser.convertToFloat(request.data['anglegap'],0.5)
            animationtime = OCPStepIGESAnalyser.convertToFloat(request.data['animationtime'],1.0)
            print("kinematicmove",id,distancegap,anglegap,animationtime)
            parts = request.data['parts']
            refid = request.data['refid']
            partsteps=json.loads(parts)
            starttime = datetime.utcnow() 
            if is_number(id) :            
                files = File.objects.filter(id__icontains=id)
                for eachfile in files: 
                    basefilename,displaypath = getBasefileNameAndDisplayPath(MEDIA_URL+eachfile.file.name,0,"R")
                    data = getEmptyDictionary(MEDIA_URL+eachfile.file.name, basefilename,displaypath,0,starttime,True) 
                    #print("From assembly",data)
                    mythread = threading.Thread(target=exportTokinematicRotationGLTF, daemon=True,\
                        args=(MEDIA_URL+eachfile.file.name,distancegap,anglegap,animationtime,starttime,refid,partsteps))
                    mythread.start()  
            else:
                #id = request.GET.get('file', None)
                if id is not None:
                    basefilename,displaypath = getBasefileNameAndDisplayPath(MEDIA_URL+id,0,"R")
                    data = getEmptyDictionary(MEDIA_URL+id, basefilename,displaypath,0,starttime,True) 
                    #print("From assembly",data)
                    mythread = threading.Thread(target=exportTokinematicRotationGLTF, daemon=True,\
                        args=(MEDIA_URL+id,distancegap,anglegap,animationtime,starttime,refid,partsteps))
                    mythread.start() 
        return JsonResponse(data, safe=False)    
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)  
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)

def readStatusInfo(sourceFileName,suffixname='3'):
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
    return statusArray, fileuuid, statusfilename

def getOutputShapesFromSourceFile(originalFileName,distancegap,anglegap,statusfilename,comparedict,starttime=None,fileNo=1,statusArray={}):#,thumbwidth,thumbheight):
    """
    Imports a file based on the type (STEP, IGES, BREP, STL)    
    """
    #Now read and return the shape
   
    try:
        doNotBringToOrigin = (statusArray and ("zerostep" in statusArray))
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
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,includeparts=False,distancegap=distancegap, logging=logging, 
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False,
                    edgesize=0, vertexsize=0,thumbwidth=0,thumbheight=0).dump()
            except Exception as e:
                print("error",e)
       
        if file_extension=="stl" :            
            try:
                shape = conversion.read_stl_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()
            except Exception as e:
                print("error",e)
        
        if file_extension=="brep" :            
            try:
                shape = conversion.read_brep_file(sourceFileName, as_compound=False)
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0).dump()                
            except Exception as e:
                print("error",e)
        
        if file_extension=="dxf" :            
            try:
                shape = OCPImporters.importDXFObjects(sourceFileName, tol=distancegap )
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shape),distancegap=distancegap,
                    anglegap=anglegap,ascompound=True,writefiles=False, logging=logging, 
                    thumbwidth=0,thumbheight=0).dump()                 
            except Exception as e:
                print("error",e)
        
        try:
            OCPStepIGESAnalyser.StepExportWithColor().setComparisonDictionary(statusfilename,10*fileNo,starttime,comparedict,False)
            _, myShapes = outputShapes
            
            _,onlyShapes,_,_,_ = getShapesFromOutPutShapes(myShapes,dictionary["tree"])
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
                fullZeroShape, fullZeroDictionary, fullRotatedDictionary, center, rotation = OCPStepIGESAnalyser.StepExportWithColor().\
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
            OCPStepIGESAnalyser.saveStatusToDatabase(dict_return,originalFileName,"NothingMan","AB")
            # try:
            #     storageData = {}
            #     storageData["assemblies"]=OCPStepIGESAnalyser.convertToInt(dict_return["assemblies"],0)
            #     storageData["trees"]=OCPStepIGESAnalyser.convertToInt(dict_return["trees"],0)
            #     storageData["parts"]=OCPStepIGESAnalyser.convertToInt(dict_return["parts"],0)
            #     storageData["faces"]=OCPStepIGESAnalyser.convertToInt(dict_return["faces"],0)
            #     storageData["edges"]=OCPStepIGESAnalyser.convertToInt(dict_return["edges"],0)
            #     storageData["vertices"]=OCPStepIGESAnalyser.convertToInt(dict_return["vertices"],0)
            #     storageData["obb_position"]=dict_return["obbPosition"]
            #     storageData["obb_origin"]=dict_return["obbOrigin"]
            #     storageData["obb_rotated"]=dict_return["obbRotated"]
            #     cx,cy,cz=dict_return["center"]
            #     storageData["cx"],storageData["cy"],storageData["cz"] = OCPStepIGESAnalyser.convertToFloat(cx,0),OCPStepIGESAnalyser.convertToFloat(cy,0),OCPStepIGESAnalyser.convertToFloat(cz,0) 
            #     rx,ry,rz=dict_return["rotation"]
            #     storageData["rx"],storageData["ry"],storageData["rz"] = OCPStepIGESAnalyser.convertToFloat(rx,0),OCPStepIGESAnalyser.convertToFloat(ry,0),OCPStepIGESAnalyser.convertToFloat(rz,0) 
            #     sx,sy,sz=dict_return["obbRotated"]["sx"],dict_return["obbRotated"]["sy"],dict_return["obbRotated"]["sz"]
            #     storageData["sx"],storageData["sy"],storageData["sz"]=OCPStepIGESAnalyser.convertToFloat(sx,0),OCPStepIGESAnalyser.convertToFloat(sy,0),OCPStepIGESAnalyser.convertToFloat(sz,0) 
            #     storageData["zerostep"]=dict_return["zerostep"]
            #     storageData["percent"]=OCPStepIGESAnalyser.convertToFloat(dict_return["percent"],0)
            #     storageData["start"]=dict_return["start"]
            #     storageData["current"]=dict_return["current"]
            #     storageData["action"]=dict_return["action"]
            #     storageData["finish"]=dict_return["finish"]
            #     storageData["reset"]=dict_return["reset"]
            #     storageData["assembly"]=dict_return["assembly"]
            #     print("Before assinging serializer",storageData)

            #     storageSerializer = ParsingDetails(
            #         name=originalFileName,
            #         assemblies=storageData["assemblies"],
            #         trees=storageData["trees"],
            #         parts=storageData["parts"],
            #         faces=storageData["faces"],
            #         edges=storageData["edges"],
            #         vertices=storageData["vertices"],
            #         obb_position=storageData["obb_position"],
            #         obb_origin=storageData["obb_origin"],
            #         obb_rotated=storageData["obb_rotated"],
            #         cx=storageData["cx"],cy=storageData["cy"],cz=storageData["cz"],                
            #         rx=storageData["rx"],ry=storageData["ry"],rz=storageData["rz"],                 
            #         sx=storageData["sx"],sy=storageData["sy"],sz=storageData["sz"],
            #         zerostep=storageData["zerostep"],
            #         percent=storageData["percent"],
            #         start=storageData["start"],
            #         current=storageData["current"],
            #         action=storageData["action"],
            #         finish=storageData["finish"],
            #         reset=storageData["reset"],
            #         assembly=storageData["assembly"],
            #         internal_object={})
            #     print("")
            #     print("Storage Serializer1", storageSerializer, "Tail")
            #     print("")
            #     storageSerializer.save()
            #     #storageSerializer.data = dict_return
                
            #     """ storageSerializer.external_id=1
            #     storageSerializer.assemblies=0
            #     storageSerializer.trees=0
            #     storageSerializer.parts= convertToInt(dict_return["parts"],0)
            #     storageSerializer.faces=convertToInt(dict_return["faces"],0)
            #     storageSerializer.edges=convertToInt(dict_return["edges"],0)
            #     storageSerializer.vertices=convertToInt(dict_return["vertices"],0)
            #     storageSerializer.obb_position=dict_return["obbPosition"]
            #     storageSerializer.obb_origin=dict_return["obbOrigin"]
            #     storageSerializer.obbRotated=dict_return["obbRotated"]
            #     cx,cy,cz=dict_return["center"]
            #     storageSerializer.cx,storageSerializer.cy,storageSerializer.cz=convertToFloat(cx,0),convertToFloat(cy,0),convertToFloat(cz,0) 
            #     rx,ry,rz=dict_return["rotation"]
            #     storageSerializer.rx,storageSerializer.ry,storageSerializer.rz=convertToFloat(rx,0),convertToFloat(ry,0),convertToFloat(rz,0) 
            #     sx,sy,sz=dict_return["obbRotated"]["sx"],dict_return["obbRotated"]["sy"],dict_return["obbRotated"]["sz"]
            #     storageSerializer.sx,storageSerializer.sy,storageSerializer.sz=convertToFloat(sx,0),convertToFloat(sy,0),convertToFloat(rz,0) 
            #     storageSerializer.zerostep=dict_return["zerostep"] """
            #     # if storageSerializer.is_valid():
            #     #     storageSerializer.save()
            #     # else:
            #     #     print("While Saving there is a error",storageSerializer.data,storageData)
            # except Exception as e:
            #     print("Error while saving",e)
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

# def bringToOriginAndToUnitAxis(fullShape1,thisdimension1,thisdictionary1,stepname):
#     aBaryCenter = thisdimension1.Center()
#     cx,cy,cz=  aBaryCenter.X(),aBaryCenter.Y(),aBaryCenter.Z()
#     fullZeroShape1=translate_shp(fullShape1,-cx,-cy,-cz, True)
#     thisRotateddimension1 = get_oriented_bounding_details(fullZeroShape1)  
#     thisRotateddictionary1 = getDictionaryFromOBB(thisRotateddimension1)
#     #fullZeroShape = fullZeroShape1
#     print("")
#     print("After translation with center",thisRotateddictionary1,thisdictionary1,cx,cy,cz)
#     aLoc=gp_Trsf()
#     aLoc.SetTransformation(gp_Ax3(),thisRotateddimension1.Position())
#     brep_trns = BRepBuilderAPI_Transform(fullZeroShape1, aLoc, True)
#     fullZeroShape2 = brep_trns.Shape()
#     thisdimension2 = get_oriented_bounding_details(fullZeroShape2) 
#     thisRotateddictionary2 = getDictionaryFromOBB(thisdimension2,True)
#     print("After Rotation with built in transformation",thisRotateddictionary2,thisdictionary1,cx,cy,cz)
#     aColor = Quantity_Color(0, 0, 1, Quantity_TOC_RGB)
#     OCPStepIGESAnalyser.StepExportWithColor(shape=fullZeroShape2,color=aColor,name="ZeroOrign"+stepname).write_file(filename=stepname)
#     """  aLoc=gp_Trsf()
#     aLoc.SetTransformation(gp_Ax3(),thisdimension1.Position())
#     brep_trns = BRepBuilderAPI_Transform(fullZeroShape1, aLoc, True)
#     fullZeroShape2 = brep_trns.Shape()
#     thisdimension2 = get_oriented_bounding_details(fullZeroShape2) 
#     thisRotateddictionary2 = getDictionaryFromOBB(thisdimension2)
#     print("After Rotation with built in reversing",thisRotateddictionary2,thisdictionary1,cx,cy,cz)
#     aColor = Quantity_Color(0, 0, 1, Quantity_TOC_RGB)
#     OCPStepIGESAnalyser.StepExportWithColor(shape=fullZeroShape2,color=aColor,name="MyShapeCommon").write_file(filename=stepname+"Reversed.step")
 
#     x_direction = thisdimension1.XDirection()
#     y_direction = thisdimension1.YDirection()
#     z_direction = thisdimension1.ZDirection()
#     a_half_x = thisdimension1.XHSize()
#     a_half_y = thisdimension1.YHSize()
#     a_half_z = thisdimension1.ZHSize()
#     print("GettingDirections",x_direction,y_direction,z_direction)
#     ax = gp_XYZ(x_direction.X(), x_direction.Y(), x_direction.Z())
#     ay = gp_XYZ(y_direction.X(), y_direction.Y(), y_direction.Z())
#     az = gp_XYZ(z_direction.X(), z_direction.Y(), z_direction.Z())
#     print("Completed Directions",ax,ay,az)
#     p = gp_Pnt(0, 0,0)
#     an_axe = gp_Ax2(p, gp_Dir(z_direction), gp_Dir(x_direction))
#     print("initiated Axis",an_axe)
#     an_axe.SetLocation(gp_Pnt(p.XYZ() - ax * a_half_x - ay * a_half_y - az * a_half_z))
#     print("completed Axis",an_axe)
#     a_box = BRepPrimAPI_MakeBox(
#         an_axe, 2.0 * a_half_x, 2.0 * a_half_y, 2.0 * a_half_z
#     ).Shape()
#     OCPStepIGESAnalyser.StepExportWithColor(shape=a_box,color=aColor,name="MyShapeCommon").write_file(filename=stepname+"OriginalBox"+".step")
#     aLoc=gp_Trsf()
#     aLoc.SetTransformation(thisdimension1.Position(),gp_Ax3())
#     brep_trns = BRepBuilderAPI_Transform(a_box, aLoc, True)
#     fullZeroShape2 = brep_trns.Shape()
#     thisdimension2 = get_oriented_bounding_details(fullZeroShape2) 
#     thisRotateddictionary2 = getDictionaryFromOBB(thisdimension2)
#     print("After Rotation with built in transformation for the box",thisRotateddictionary2,thisdictionary1,cx,cy,cz)
#     OCPStepIGESAnalyser.StepExportWithColor(shape=fullZeroShape2,color=aColor,name="MyShapeCommon").write_file(filename=stepname+"TransformedBox"+".step")
#     aLoc=gp_Trsf()
#     aLoc.SetTransformation(gp_Ax3(),thisdimension1.Position())
#     brep_trns = BRepBuilderAPI_Transform(a_box, aLoc, True)
#     fullZeroShape2 = brep_trns.Shape()
#     thisdimension2 = get_oriented_bounding_details(fullZeroShape2) 
#     thisRotateddictionary2 = getDictionaryFromOBB(thisdimension2)
#     print("After Rotation with built in reversed for the box",thisRotateddictionary2,thisdictionary1,cx,cy,cz)
#     OCPStepIGESAnalyser.StepExportWithColor(shape=fullZeroShape2,color=aColor,name="MyShapeCommon").write_file(filename=stepname+"ReversedBox"+".step")
    
#     thisInverteddictionary1 = thisRotateddictionary1
    
#     myMatrix = [
#         [thisRotateddictionary1["xx"],thisRotateddictionary1["yx"],thisRotateddictionary1["zx"]],
#         [thisRotateddictionary1["xy"],thisRotateddictionary1["yy"],thisRotateddictionary1["zy"]],
#         [thisRotateddictionary1["xz"],thisRotateddictionary1["yz"],thisRotateddictionary1["zz"]]
#         ]
#     inverseMatrix = getMatrixInverse(myMatrix)
#     print("Inverse Matrix",inverseMatrix,myMatrix)
#     [
#         [thisInverteddictionary1["xx"],thisInverteddictionary1["yx"],thisInverteddictionary1["zx"]],
#         [thisInverteddictionary1["xy"],thisInverteddictionary1["yy"],thisInverteddictionary1["zy"]],
#         [thisInverteddictionary1["xz"],thisInverteddictionary1["yz"],thisInverteddictionary1["zz"]]
#         ] = inverseMatrix
#     trace = thisInverteddictionary1["xx"] + thisInverteddictionary1["yy"] + thisInverteddictionary1["zz"]
#     ax = thisInverteddictionary1["zy"]-thisInverteddictionary1["yz"]
#     ay = thisInverteddictionary1["zx"]-thisInverteddictionary1["xz"]
#     az = thisInverteddictionary1["yx"]-thisInverteddictionary1["xy"]
#     diagonal=math.sqrt(ax*ax+ay*ay+az*az)
#     angle=0
#     if(diagonal!=0):
#         ax, ay, az = ax/diagonal, ay/diagonal, az/diagonal
#         angle = math.acos((trace-1.0)/2.0)
#         if(angle!=0):
#             fullZeroShape = fullZeroShape1
#             fullZeroShape1=rotate_shape(fullZeroShape,0,0,0, ax, ay, az, angle, unity="radian",copy=True)
#             thisdimension1 = get_oriented_bounding_details(fullZeroShape1)                        
#             thisRotateddictionary1 = getDictionaryFromOBB(thisdimension1)   
#             print("After rotation with positive angle",thisRotateddictionary1,thisdictionary1,thisInverteddictionary1, ax, ay, az, angle)
#             fullZeroShape1=rotate_shape(fullZeroShape,0,0,0, ax, ay, az, -angle, unity="radian",copy=True)
#             thisdimension1 = get_oriented_bounding_details(fullZeroShape1)                        
#             thisRotateddictionary1 = getDictionaryFromOBB(thisdimension1)
#     print("After rotation with Orientation",thisRotateddictionary1,thisdictionary1,thisInverteddictionary1, ax, ay, az, diagonal, -angle)        
#     """
#     print("") 
#     return (fullZeroShape1,thisRotateddictionary1,(cx,cy,cz))

# def setComparisonDictionary(statusfilename,percentage,starttime, mystatusdict, createdirectory):
#     currenttime = datetime.utcnow()  
    
#     mystatusdict["status"] =  {
#             "percent":(percentage),
#             "start":starttime.strftime("%H-%M-%S"),
#             "current":currenttime.strftime("%H-%M-%S") }
#     mystatusdict["store"] = statusfilename
#     try:   
#         if(createdirectory):
#             os.makedirs(os.path.dirname(statusfilename), exist_ok=True)            
#         print("Writing",statusfilename,mystatusdict["status"]) 
#         with open(statusfilename, 'w') as fh:
#             fh.write(json.dumps(mystatusdict, sort_keys=True, indent=2 ))            
#     except Exception as e:
#         print("Error while wrting",statusfilename,e)
#     return mystatusdict

# def getFaceEdgeVertexStructures(face_dict1,edge_dict1,vertex_dict1):
#     facedata1=[]                        
#     faceList1 = list(face_dict1.values())
#     for faces1 in range(len(faceList1)):
#         facedata1.append([])
#         dumpTopologyStructures(faceList1[faces1],level=0,parentId=[None],returnStructure=facedata1[faces1],faceInfo=None, depth=1, hashEquals=True)                      
#     edgedata1=[]
#     edgeList1 = list(edge_dict1.values())
#     for edges1 in range(len(edgeList1)):
#         edgedata1.append([])
#         dumpTopologyStructures(edgeList1[edges1],level=0,parentId=[None],returnStructure=edgedata1[edges1],faceInfo=None, depth=1, hashEquals=True)                  
#     vertexdata1=[]
#     vertexList1 = list(vertex_dict1.values())
#     for vertex1 in range(len(vertexList1)):
#         vertexdata1.append([])
#         dumpTopologyStructures(vertexList1[vertex1],level=0,parentId=[None],returnStructure=vertexdata1[vertex1],faceInfo=None, depth=1, hashEquals=True)
#     return facedata1, edgedata1, vertexdata1                       

# def ordered(obj):
#     if isinstance(obj, dict):
#         return sorted((k, ordered(v)) for k, v in obj.items())
#     if isinstance(obj, list):
#         return sorted(ordered(x) for x in obj)
#     else:
#         return obj

# def compareOneToOneShape(faceStruct1, edgeStruct1, vertexStruct1,faceStruct2, edgeStruct2, vertexStruct2):
#     #print(faceStruct1, edgeStruct1, vertexStruct1,faceStruct2, edgeStruct2, vertexStruct2)
#     return faceStruct1==faceStruct2 and edgeStruct1==edgeStruct2 and vertexStruct1==vertexStruct2

# def compareToCheckIdentityShapes(sourceFileName1,sourceFileName2,onlyShapes1,onlyShapes2,statusfilename,starttime=None):#,thumbwidth,thumbheight):
#     dictionary={
#         "source1":sourceFileName1,
#         "source2":sourceFileName2,
#         "node1":0,
#         "node2":0,
#         "isEqual":False }
#     if sourceFileName1 and sourceFileName2:
#         try:
#             dictionary["node1"]=len(onlyShapes1)
#             dictionary["node2"]=len(onlyShapes2)
#             dictionary["isEqual"]=dictionary["node1"]==dictionary["node2"]
#             #print("Done up to this0")
#             if(dictionary["isEqual"]==False):
#                 setComparisonDictionary(statusfilename,100,starttime,dictionary,False)
#                 return 
#             fullShape1,_ = list_of_shapes_to_compound(onlyShapes1,True)
#             fullShape2,_ = list_of_shapes_to_compound(onlyShapes2,True)
#             thisdimension1 = get_oriented_bounding_details(fullShape1)  
#             #print("Done up to this1")                      
#             thisdictionary1 = getDictionaryFromOBB(thisdimension1,True)
#             sx1,sy1,sz1 = thisdictionary1["sx"],thisdictionary1["sy"],thisdictionary1["sz"]
#             [sx1,sy1,sz1] = sorted([sx1,sy1,sz1])
#             thisdimension2 = get_oriented_bounding_details(fullShape2)                        
#             thisdictionary2 = getDictionaryFromOBB(thisdimension2,True)
#             sx2,sy2,sz2 = thisdictionary2["sx"],thisdictionary2["sy"],thisdictionary2["sz"]
#             [sx2,sy2,sz2] = sorted([sx2,sy2,sz2])
#             dictionary["obb1"]=thisdictionary1
#             dictionary["obb2"]=thisdictionary2
#             dictionary["isEqual"] = (abs(sx1-sx2) < 1e-6) and (abs(sy1-sy2) < 1e-6) and abs(sz1-sz2) < 1e-6
#             if(dictionary["isEqual"]==False):
#                 setComparisonDictionary(statusfilename,100,starttime,dictionary,False)
#                 return
#             #print("Done up to this1")
#             fullZeroShape1, fullZeroDictionary1, center1,rotation1 = OCPStepIGESAnalyser.StepExportWithColor().\
#                 bringToOriginAndToUnitAxis(fullShape1,thisdimension1,thisdictionary1,statusfilename+"1.step")
#             fullZeroShape2, fullZeroDictionary2, center2,rotation2 = OCPStepIGESAnalyser.StepExportWithColor().\
#                 bringToOriginAndToUnitAxis(fullShape2,thisdimension2,thisdictionary2,statusfilename+"2.step")
#             dictionary["origin1"]=fullZeroDictionary1
#             dictionary["origin2"]=fullZeroDictionary2
#             dictionary["center1"]=center1
#             dictionary["center2"]=center2
#             dictionary['rotation1']=rotation1
#             dictionary['rotation2']=rotation2
#             dictionary["step1"]=statusfilename+"1.step"
#             dictionary["step2"]=statusfilename+"2.step"
#             setComparisonDictionary(statusfilename,30,starttime,dictionary,False)
#             face_dict1={}
#             edge_dict1={}
#             vertex_dict1={}
#             dumpTopologyFacesEdgesVertices(fullZeroShape1,face_dict1,edge_dict1,vertex_dict1)
#             dictionary["face1"]=len(face_dict1)
#             dictionary["edge1"]=len(edge_dict1)
#             dictionary["vertex1"]=len(vertex_dict1)
#             face_dict2={}
#             edge_dict2={}
#             vertex_dict2={}
#             dumpTopologyFacesEdgesVertices(fullZeroShape2,face_dict2,edge_dict2,vertex_dict2)
#             dictionary["face2"]=len(face_dict2)
#             dictionary["edge2"]=len(edge_dict2)
#             dictionary["vertex2"]=len(vertex_dict2)
#             dictionary["vertexEquals"]=(dictionary["vertex1"]==dictionary["vertex2"])
#             dictionary["isEqual"] = (dictionary["face1"]==dictionary["face2"]) and (dictionary["edge1"]==dictionary["edge2"]) and (dictionary["vertex1"]==dictionary["vertex2"])
#             if(dictionary["vertexEquals"]==False):
#                 setComparisonDictionary(statusfilename,100,starttime,dictionary,False)
#                 return
#             faceStruct1, edgeStruct1, vertexStruct1 = getFaceEdgeVertexStructures(face_dict1,edge_dict1,vertex_dict1) 
#             faceStruct2, edgeStruct2, vertexStruct2 = getFaceEdgeVertexStructures(face_dict2,edge_dict2,vertex_dict2) 
             
#             faceStruct1, edgeStruct1, vertexStruct1 = ordered(faceStruct1), ordered(edgeStruct1), ordered(vertexStruct1)
#             faceStruct2, edgeStruct2, vertexStruct2 = ordered(faceStruct2), ordered(edgeStruct2), ordered(vertexStruct2)
#             faceStruct3, edgeStruct3, vertexStruct3 = faceStruct2, edgeStruct2, vertexStruct2
#             sx1,sy1,sz1 = fullZeroDictionary1["sx"],fullZeroDictionary1["sy"],fullZeroDictionary1["sz"]
#             setComparisonDictionary(statusfilename,31,starttime,dictionary,False)            
#             for xdir in range(4):
#                 for ydir in range(4):
#                     for zdir in range(4):
#                         if xdir==0 and ydir==0 and zdir==0: 
#                             sx2,sy2,sz2 = fullZeroDictionary2["sx"],fullZeroDictionary2["sy"],fullZeroDictionary2["sz"]
#                             dictionary["isEqual"] = (abs(sx1-sx2) < 1e-6) and (abs(sy1-sy2) < 1e-6) and abs(sz1-sz2) < 1e-6
#                             if dictionary["isEqual"]:                                                    
#                                 dictionary["isEqual"]=compareOneToOneShape(faceStruct1, edgeStruct1, vertexStruct1,faceStruct2, edgeStruct2, vertexStruct2)
#                                 dictionary["vertexEquals"]=(vertexStruct1==vertexStruct2)
#                         else:
#                             fullZeroRotatedShape2=rotate_shp_3_axis(fullZeroShape2,xdir*math.pi/2,ydir*math.pi/2,zdir*math.pi/2, unity="radian", copy=True) 
#                             thisRotateddimension2 = get_oriented_bounding_details(fullZeroRotatedShape2)                        
#                             fullZeroDictionary2 = getDictionaryFromOBB(thisRotateddimension2)
#                             sx2,sy2,sz2 = fullZeroDictionary2["sx"],fullZeroDictionary2["sy"],fullZeroDictionary2["sz"]
#                             dictionary["isEqual"] = (abs(sx1-sx2) < 1e-6) and (abs(sy1-sy2) < 1e-6) and abs(sz1-sz2) < 1e-6
#                             if dictionary["isEqual"]:
#                                 face_dict2={}
#                                 edge_dict2={}
#                                 vertex_dict2={}
#                                 dumpTopologyFacesEdgesVertices(fullZeroRotatedShape2,face_dict2,edge_dict2,vertex_dict2) 
#                                 faceStruct2, edgeStruct2, vertexStruct2 = getFaceEdgeVertexStructures(face_dict2,edge_dict2,vertex_dict2) 
#                                 faceStruct2, edgeStruct2, vertexStruct2 = ordered(faceStruct2), ordered(edgeStruct2), ordered(vertexStruct2)
#                                 dictionary["isEqual"]=compareOneToOneShape(faceStruct1, edgeStruct1, vertexStruct1,faceStruct2, edgeStruct2, vertexStruct2)
#                                 if dictionary["vertexEquals"]==False:
#                                     dictionary["vertexEquals"]=(vertexStruct1==vertexStruct2)
#                                     if dictionary["vertexEquals"]:
#                                         dictionary["vertexCompare2"]=(xdir*90,ydir*90,zdir*90)
#                                         print(xdir*90,ydir*90,zdir*90,"Vertex Done")
#                         if dictionary["isEqual"]:
#                             dictionary["compare2"]=(xdir*90,ydir*90,zdir*90)
#                             dictionary["struct1"] = (faceStruct1, edgeStruct1, vertexStruct1) 
#                             dictionary["struct2First"]= (faceStruct3, edgeStruct3, vertexStruct3)
#                             dictionary["struct2Last"] = (faceStruct2, edgeStruct2, vertexStruct2) 
#                             setComparisonDictionary(statusfilename,100,starttime,dictionary,False)
#                             print(xdir*90,ydir*90,zdir*90,"Done")
#                             return  
#                         setComparisonDictionary(statusfilename,32+zdir+ydir*4+xdir*16,starttime,dictionary,False) 
#             dictionary["struct1"] = (faceStruct1, edgeStruct1, vertexStruct1) 
#             dictionary["struct2First"]= (faceStruct3, edgeStruct3, vertexStruct3)
#             dictionary["struct2Last"] = (faceStruct2, edgeStruct2, vertexStruct2) 
#             setComparisonDictionary(statusfilename,100,starttime,dictionary,False) 
#             print("Not Equal")     
#             return  
#         except Exception as e:
#             dictionary["error"]=str(e)
#             setComparisonDictionary(statusfilename,100,starttime,dictionary,False) 
#             return  
#     setComparisonDictionary(statusfilename,100,starttime,dictionary,False)
#     return  

def compareToCheckIdentity(sourceFileName1,sourceFileName2,distancegap,anglegap,statusfilename,starttime=None):#,thumbwidth,thumbheight):
    dictionary={
        "source1":sourceFileName1,
        "source2":sourceFileName2,
        "node1":0,
        "node2":0,
        "isEqual":False }
    if sourceFileName1 and sourceFileName2:
        try:
            statusArray1, _, _ = readStatusInfo(sourceFileName1)
            statusArray2, _, _ = readStatusInfo(sourceFileName2)            
            fullZeroShape1, statusArray1 = getOutputShapesFromSourceFile(sourceFileName1,distancegap,anglegap,statusfilename,dictionary,starttime,1,statusArray1)
            dictionary["obbstruct1"]=statusArray1
            OCPStepIGESAnalyser.StepExportWithColor().setComparisonDictionary(statusfilename,15,starttime,dictionary,False)
            fullZeroShape2, statusArray2 = getOutputShapesFromSourceFile(sourceFileName2,distancegap,anglegap,statusfilename,dictionary,starttime,2,statusArray2)
            dictionary["obbstruct2"]=statusArray2
            OCPStepIGESAnalyser.StepExportWithColor().setComparisonDictionary(statusfilename,25,starttime,dictionary,False)
            OCPStepIGESAnalyser.StepExportWithColor().compareToCheckIdentityShapesOriginated(dictionary,fullZeroShape1,fullZeroShape2,statusfilename,starttime)
            #OCPStepIGESAnalyser.StepExportWithColor().compareToCheckIdentityShapes(sourceFileName1,sourceFileName2,onlyShapes1,onlyShapes2,statusfilename,starttime,None)
            return
        except Exception as e:
            dictionary["error"]=str(e)
            OCPStepIGESAnalyser.StepExportWithColor().setComparisonDictionary(statusfilename,100,starttime,dictionary,False) 
            return
    OCPStepIGESAnalyser.StepExportWithColor().setComparisonDictionary(statusfilename,100,starttime,dictionary,False)
    return 
        #raise ValueError("File Could not be loaded") 

    

@api_view(['GET','POST'])
def FileCompareIdentity(request):
    try:
        try:
            logging.info(request)
        except Exception as e:
            print("Error while logging",e)
        data = []
        if request.method == 'GET':
            id1 = request.GET.get('id1', None)
            id2 = request.GET.get('id2', None)
            distancegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('distancegap',"0.1"),0.1)
            anglegap = OCPStepIGESAnalyser.convertToFloat(request.GET.get('anglegap',"0.5"),0.5)
            print(id1,id2,distancegap,anglegap)
            starttime = datetime.utcnow() 
            sourceFile1=None
            if is_number(id1) :            
                files = File.objects.filter(id__icontains=id1)
                for eachfile in files: 
                    sourceFile1=MEDIA_URL+eachfile.file.name
            else:
                if id1 is not None:
                    sourceFile1=MEDIA_URL+id1
            sourceFile2=None
            if is_number(id2) :            
                files = File.objects.filter(id__icontains=id2)
                for eachfile in files: 
                    sourceFile2=MEDIA_URL+eachfile.file.name
            else:
                if id2 is not None:
                    sourceFile2=MEDIA_URL+id2  
            basefilename1,displaypath1 = getBasefileNameAndDisplayPath(sourceFile1,0,"A")
            getEmptyDictionary(sourceFile1, basefilename1,displaypath1,0,starttime,True)
            basefilename2,_ = getBasefileNameAndDisplayPath(sourceFile2,0,"A")
            statusfilename=displaypath1+basefilename1+basefilename2+".status"
            dictionary={
                "source1":sourceFile1,
                "source2":sourceFile2,
                "node1":0,
                "node2":0,
                "isEqual":False }
            data = OCPStepIGESAnalyser.StepExportWithColor().setComparisonDictionary(statusfilename,0,starttime, dictionary, True)
            mythread = threading.Thread(target=compareToCheckIdentity, daemon=True,\
                args=(sourceFile1,sourceFile2,distancegap,anglegap,statusfilename,starttime))
            mythread.start() 
        return JsonResponse(data, safe=False)    
    except Exception as e:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': str(e)},status=status.HTTP_400_BAD_REQUEST, safe=False)  
    except:
        try:
            logging.error(traceback.format_exc())
            logging.exception(e)
        except Exception as e:
            print("Error while logging",e)
        return JsonResponse({'message': "System Error"},status=status.HTTP_400_BAD_REQUEST, safe=False)
    finally:
        try:
            logging.info({'status':"completed",'request':request})
        except Exception as e:
            print("Error while logging",e)
        except:
            try:
                logging.error(traceback.format_exc())
                logging.exception(e)
            except Exception as e:
                print("Error while logging",e)