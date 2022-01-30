
from math import ceil
import os
import json
from datetime import datetime

from .structparts.structquery.occ_impl import OCPStepIGESAnalyser

from .structparts.structquery.occ_impl.OCCExtend.ShapeFactory import (
    translate_shp, minimum_z_distance, rotate_shp_3_axis, 
    getPartStackablePositions, get_bounding_details,
    recognize_direction)
from .structparts.structquery.occ_impl.OCCUtils.Topology import dumpTopologyFacesEdgesVertices
#from OCC.Core.TopAbs import (TopAbs_FACE, TopAbs_Orientation)
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Common
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
from .structparts.structquery.occ_impl.OCCExtend.TopologyUtils import list_of_shapes_to_compound

#from .settingscopy import (DISPLAY_URL,MEDIA_URL)



class FindStackability(object):
    def __init__(self,sourceFileName,shapeArray,dimension,distancegap=0.3,anglegap=0.5,\
        animationtime=1.5,starttime=None,logging=None,refid='',refname=''): 
               
        try:
            try:
                xmin, ymin, zmin, xmax, ymax, zmax = dimension 
                print(shapeArray)   
                fullShape, fullName, fullColor = shapeArray[0]  
                print(fullShape)           
                if( (xmax-xmin) < (ymax-ymin) ) and ( (xmax-xmin) < (zmax-zmin) ):
                    print("Before rotate 1")
                    shape = rotate_shp_3_axis(fullShape,0,90,0, unity="deg", copy=True) 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=[(shape,fullName,fullColor)],includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0, suffixname="S",refid=refid,refname=refname).dump(False) 
                elif( (ymax-ymin) < (xmax-xmin) ) and ( (ymax-ymin) < (zmax-zmin) ):
                    print("Before rotate 2")
                    shape = rotate_shp_3_axis(fullShape,90,0,0, unity="deg", copy=True) 
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=[(shape,fullName,fullColor)],includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0, suffixname="S",refid=refid,refname=refname).dump(False)
                else:
                    print("Before Analyser")
                    shape=fullShape
                    (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=shapeArray,includeparts=True,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,ascompound=True, logging=logging, 
                    thumbwidth=0,thumbheight=0,edgesize=0, vertexsize=0, suffixname="S",refid=refid,refname=refname).dump(False)
                getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],35,starttime,False)  
                #print(outputShapes)
                dimension,stackable,depthable = stackableDictonary(outputShapes, distancegap, 0.1) 
                getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],40,starttime,False)             
                shapeList, replications, moveArrays = duplicateShapes(shape,dimension,depthable,stackable,\
                    sourceFileName,dictionary["store"],dictionary["display"])
                getEmptyDictionary(sourceFileName,dictionary["store"],dictionary["display"],60,starttime,False)
                #print("Reached here1",shapeList)                         
                (_, outputShapes, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=createShapeArray(shapeList,fullName,fullColor),includeparts=False,distancegap=distancegap,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0, logging=logging, 
                    edgesize=0, vertexsize=0, animations=moveArrays, delay=animationtime,refid=refid,refname=refname).dump()
                dictionary["stackable"] = [{"count":replications,"stack":stackable}]
            except Exception as e:
                print("error while forming stackable",e)   
            try:
                stackfile = dictionary["display"]+dictionary["store"]+".stack"
                print("Writing,",stackfile)
                with open(stackfile, 'w') as fh:
                    fh.write(json.dumps(dictionary["stackable"], sort_keys=True, indent=2 ))
            except Exception as e:
                print("Error while writing stackfile",e)  
            self.dictionary=dictionary    
        except Exception as e:
            print("Error global from stack",e)
            self.dictionary={}
            #raise ValueError("File Could not be loaded")  
    def dump(self):
        return self.dictionary

def createShapeArray(shapes,fullName,fullColor):
    shapeArray=[]
    myID=0
    for aShape in shapes:
        myID += 1
        shapeArray.append((aShape,fullName+str(myID),fullColor))
    return shapeArray


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

def duplicateShapes(shape0,dimension,depthable,stackable,filename,basefilename,displaypath,starttime=None):  
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
            AnotherShape=translate_shp(shape0,xmove, ymove, zmove, True)
            (wdistance, distance, points1, points2) = minimum_z_distance(shape0,AnotherShape)
            AnotherShape=translate_shp(shape0,xmove, ymove, zmove-wdistance, True)
            myshapecommon = BRepAlgoAPI_Common(AnotherShape,shape0).Shape()
            if myshapecommon==None:
                distance = wdistance  
                zmove -= wdistance
            _,_,zmins,_,_,zmaxs= get_bounding_details(myshapecommon)             
            if (zmaxs-zmins) < wdistance:
                distance = wdistance-zmaxs+zmins 
                zmove = zmove-wdistance+zmaxs-zmins 
                print("Dmove0", zmove, distance, wdistance, points1, points2, prevdistance) 
                AnotherShape=translate_shp(shape0,xmove, ymove, zmove, True)
                (wdistance, distance, points1, points2) = minimum_z_distance(shape0,AnotherShape)
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
            noOfDuplicates = 1+ceil(min(xmax-xmin,ymax-ymin) / (zmove))
        print("With reduction", noOfDuplicates)
        if noOfDuplicates < 1 :
            noOfDuplicates = 1    
        print("After Resetting", noOfDuplicates)
       
    moveArrays=[]
    shapeList =[]
    shapeList.append(shape0)
    for i in range(1,noOfDuplicates):
        print(i,noOfDuplicates, xmove*i, ymove*i, zmove*i )
        AnotherShape=translate_shp(shape0,xmove*i, ymove*i, zmove*i, True)
        shapeList.append(AnotherShape)
        moveArrays.append((xmove*i, ymove*i, zmove*i))
    
    return shapeList, noOfDuplicates, moveArrays

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

    