

from OCC.Core.Bnd import Bnd_OBB
from OCC.Core.gp import (gp_Pnt, gp_XYZ, gp_Ax2, gp_Dir)
from .structparts.structquery.occ_impl import OCPStepIGESAnalyser
from .structparts.structquery.occ_impl.gltfDictionary import gltfdict
from .structparts.structquery.occ_impl.OCCExtend.ShapeFactory import (translate_shp, get_bounding_details,\
     get_oriented_bounding_details, scale_shape, minimum_distance)
#from OCC.Core.gp import gp_Pnt 
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Common
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
from .structparts.structquery.occ_impl.OCCExtend.TopologyUtils import list_of_shapes_to_compound
#from django.conf import settings
from datetime import datetime
import threading
import json
import math
import sys
from .settingscopy import (DISPLAY_URL,MEDIA_URL,COPY_PATH)

def swap(a, b):
    return b, a

class FindAssemblingOrder(object):
    
    def __init__(self, shapeColorArray,shapeArray,name,dimension,explodegap=10.0,center=True,holescale=0.8,removegap=1.0,logging=None):
        
        self.shapeArray = shapeArray 
        self.shapeColorArray = shapeColorArray 
        self.name = name  
        self.dimension = dimension 
        self.explodegap = explodegap 
        self.center = center 
        self.holescale = holescale   
        self.logging = logging  
        if holescale <= 0:
            self.holescale=1.0
        if self.holescale < 1.0 :
            self.onebyholescale = 1/self.holescale
        else:
            self.onebyholescale = self.holescale             
        self.removegap = removegap
        self.gltf_dict = gltfdict()
        self.sixdirections=[]
        self.sixdirections.append(((0,0,1),"Top"))
        self.sixdirections.append(((0,0,-1),"Bottom"))
        self.sixdirections.append(((0,1,0),"Right"))
        self.sixdirections.append(((0,-1,0),"Left"))
        self.sixdirections.append(((1,0,0),"Back"))
        self.sixdirections.append(((-1,0,0),"Front"))        
        self.oppositedirections=[1,0,3,2,5,4]
    
    def scaleMyPart(self,myShapeCommon,myShapeDimension,scalefactor):
        xminc, yminc, zminc, xmaxc, ymaxc, zmaxc = myShapeDimension

        #print("Reached here2")
        try:
            scaleInnerShape = scale_shape(myShapeCommon, scalefactor, scalefactor, scalefactor)
        except Exception as e:
            print("Exception while scaling shape",e)
            return myShapeCommon, myShapeDimension, False
        #print("Reached here3")
        scaledDimension = get_bounding_details(scaleInnerShape)
        if scaledDimension==(0,0,0,0,0,0):
            print("Exception while scaling shape returned 0 dimension before translation")
            return  myShapeCommon, myShapeDimension, False
        #print("Reached here4")
        scaledShape = translate_shp(scaleInnerShape,(xmaxc+xminc)*(1-scalefactor)/2,\
            (ymaxc+yminc)*(1-scalefactor)/2,(zmaxc+zminc)*(1-scalefactor)/2,True)
        scaledDimension = get_bounding_details(scaledShape)
        if scaledDimension==(0,0,0,0,0,0):
            print("Exception while scaling shape returned 0 dimension after translation")
            return  myShapeCommon, myShapeDimension, False
        return scaledShape, scaledDimension, True

    def checkAnyHole(self, myShapeOuter,myShapeInner,toBeScaled,debugMe=False):
        try:
            myShapeCommon = BRepAlgoAPI_Common(myShapeOuter,myShapeInner).Shape()
        except Exception as e:
            print("Exception while performing shape common",e)
            return True, None
        if (myShapeCommon == None):
            if debugMe:
                print("No common Area found between these objects")
            return True, None
        #print("Reached here1")
        myHoleDimension = get_bounding_details(myShapeCommon) 
        #print("Reached here2") 
        if myHoleDimension == (0, 0, 0, 0, 0, 0) :
            #if debugMe:
            #    print("Empty Space between these objects when finding common Area")
            return True, None     
        #print("Reached here3")
        myShapeDimension = get_bounding_details(myShapeOuter)
        scaledShape, _ , scaledHere =self.scaleMyPart(myShapeCommon,myShapeDimension,toBeScaled)
        """ try:
            scaleInnerShape = scale_shape(myShapeCommon, self.holescale, self.holescale, self.holescale)
        except Exception as e:
            print("Exception while scaling shape common",e)
            return True, None
        #print("Reached here3")
        xmind, ymind, zmind, xmaxd, ymaxd, zmaxd = get_bounding_details(scaleInnerShape)
        #print("Reached here4")
        scaledShape = translate_shp(scaleInnerShape,(xmaxc+xminc-xmaxd-xmind)/2,\
            (ymaxc+yminc-ymaxd-ymind)/2,(zmaxc+zminc-zmaxd-zmind)/2,True) """
        if scaledHere==False:
            if debugMe:
                print("Unable to scale the common area")
            return True, scaledShape
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
                print("No Holes between these objects with dimension",myHoleDimension,myShapeDimension)
                return False, myShapeHole
            else:
                print("Not tessellatable Holes between these objects with dimension",myHoleDimension,myShapeDimension)
                return True, myShapeHole
    
    def checkScaledHole(self, myShapeOuter, myShapeOriginal, myShapeInner, debugMe=False):
        try:
            myShapeCommon = BRepAlgoAPI_Common(myShapeOriginal,myShapeInner).Shape()
        except Exception as e:
            print("Exception while performing shape common",e)
            return True, None
        if (myShapeCommon == None):
            if debugMe:
                print("No common between these objects")
            return True, None
        myShapeDimension = get_bounding_details(myShapeCommon)
        if myShapeDimension == (0, 0, 0, 0, 0, 0) :
            #if debugMe:
            #    print("Holes between these objects")
            return True, None
        try:
            myShapeHole = BRepAlgoAPI_Common(myShapeCommon,myShapeOuter).Shape()
        except Exception as e:
            print("Exception while performing hole common",e)
            return True, None    
        if (myShapeHole == None):
            if debugMe:
                print("Hole between these objects")
            return True, myShapeCommon
        #print("Reached here7")
        myHoleDimension = get_bounding_details(myShapeHole)
        #print("Reached here8") 
        if myHoleDimension == (0, 0, 0, 0, 0, 0) :
            #if debugMe:
            #    print("Holes between these objects")
            return True, myShapeCommon
        else:
            """ scaledShape, _ , scaledHere =self.scaleMyPart(myShapeCommon,myShapeDimension,self.holescale)
            if scaledHere==False:
                if debugMe:
                    print("Unable to scale the common area")
                return True, scaledShape
            try:
                myShapeHole = BRepAlgoAPI_Common(scaledShape,myShapeOuter).Shape()
            except Exception as e:
                print("Exception while performing hole common",e)
                return True, scaledShape    
            if (myShapeHole == None):
                if debugMe:
                    print("Hole between these objects after scaling")
                return True, scaledShape
            #print("Reached here7")
            myHoleDimension = get_bounding_details(myShapeHole)
            #print("Reached here8") 
            if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                #if debugMe:
                #    print("Holes between these objects")
                return True, scaledShape """
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

    def writeForDebugging(self,commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,xDist,yDist,zDist,suffix, debugMe, doDebug=False):
        if debugMe and doDebug:
            displaypath = DISPLAY_URL
            try:
                aColor = Quantity_Color(0, 0, 1, Quantity_TOC_RGB)
                if commonHoleShape:
                    colorfile = displaypath+"MyShapeCommon"+suffix+"_COLOR.step"  
                    try:                           
                        OCPStepIGESAnalyser.StepExportWithColor(shape=commonHoleShape,color=aColor,name="MyShapeCommon").write_file(filename=colorfile)
                    except Exception as e:
                        print(e,"File, %s has error" % colorfile)     
                colorfile = displaypath+"MyShapeCompound"+suffix+"_COLOR.step"  
                if myShapeInner:                           
                    try:

                        OCPStepIGESAnalyser.StepExportWithColor(shape=myShapeInner,color=aColor,name="MyShapeCompound").write_file(filename=colorfile)
                    except Exception as e:
                        print(e,"File, %s has error" % colorfile) 
                colorfile = displaypath+"MyShapeOuter"+suffix+"_COLOR.step"  
                if tranShape:                           
                    try:

                        OCPStepIGESAnalyser.StepExportWithColor(shape=tranShape,color=aColor,name="MyShapeOuter").write_file(filename=colorfile)
                    except Exception as e:
                        print(e,"File, %s has error" % colorfile) 
                colorfile = displaypath+"MyShapeInner"+suffix+"_COLOR.step"                             
                if myCommonShape:
                    try:
                        OCPStepIGESAnalyser.StepExportWithColor(shape=myCommonShape,color=aColor,name="MyShapeInner").write_file(filename=colorfile)
                    except Exception as e:
                        print(e,"File, %s has error" % colorfile) 
                if commonHoleShape:
                    mycommonholeshape = translate_shp(commonHoleShape,xDist,yDist,zDist,True)
                else:
                    mycommonholeshape=None  
                if myCommonShape:     
                    myCommonShapez = translate_shp(myCommonShape,xDist*2,yDist*2,zDist*2,True)
                else:
                    myCommonShapez=None
                if myShapeInner:
                    myCommonCompundz = translate_shp(myShapeInner,xDist*3,yDist*3,zDist*3,True)
                else:
                    myCommonCompundz=None
                if tranShape:
                    tranShapez = translate_shp(tranShape,xDist*4,yDist*4,zDist*4,True)
                else:
                    tranShapez=None
                shapex=[myCommonShapez,tranShapez,myShapeOuter,mycommonholeshape,myCommonCompundz]
                fullShapex,_ = list_of_shapes_to_compound(shapex)
                colorfile = displaypath+"MyShapeMergedX"+suffix+"_COLOR.step"                             
                try:
                    OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapex,color=aColor,name="MyShapeMergedX").write_file(filename=colorfile)
                except Exception as e:
                    print(e,"File, %s has error" % colorfile) 
                shapey=[myCommonShape,myShapeOuter]
                fullShapey,_ = list_of_shapes_to_compound(shapey)
                colorfile = displaypath+"MyShapeOriginal"+suffix+"_COLOR.step"                             
                OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapey,color=aColor,name="MyShapeOriginal").write_file(filename=colorfile)
                shapez=[commonHoleShape,myCommonShapez,tranShapez]
                fullShapez,_ = list_of_shapes_to_compound(shapez)
                colorfile = displaypath+"MyShapeMergedZ"+suffix+"_COLOR.step"                             
                try:
                    OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapez,color=aColor,name="MyShapeMergedZ").write_file(filename=colorfile)
                except Exception as e:
                    print(e,"File, %s has error" % colorfile) 
                shapeyz=[myCommonShape,tranShape]
                fullShapeyz,_ = list_of_shapes_to_compound(shapeyz)
                colorfile = displaypath+"MyShapeTrans"+suffix+"_COLOR.step"                             
                try:
                    OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapeyz,color=aColor,name="MyShapeTransT").write_file(filename=colorfile)
                except Exception as e:
                    print(e,"File, %s has error" % colorfile)                            
            except Exception as e:
                print(e,"File, %s has Outer error" % colorfile) 
            except:
                print(e,"Some Exceptions") 

    def checkOuter(self,checkingOuterBox,fullBox):
        retValue = checkingOuterBox.IsOut(fullBox)
        if retValue==True:
            return 1
        for aBox in self.mySeperateBoxes:
            retValue = checkingOuterBox.IsOut(aBox)
            if retValue==False:
                return 0
        #print("I have got True here! when there are",len(self.mySeperateBoxes),"seperate boxes")
        return 2
    
    def checkInsideOuter(self,checkingOuterBox):
        for aBox in self.mySeperateBoxes:
            retValue = checkingOuterBox.IsOut(aBox)
            if retValue==False:
                return 0
        #print("I have got True here! while checking inside outer when there are",len(self.mySeperateBoxes),"seperate boxes")
        return 2
    
    def checkOutsideOuter(self,checkingOuterBox,fullBox):
        retValue = checkingOuterBox.IsOut(fullBox)
        if retValue==True:
            return 1
        return 2

    def checkCommonHoleInDirection(self, myShapeOuter,myOuterDimension, myShapeInner,myInnerDimension, axisdirection, checkingBox, fullBox, toBeScaled, debugMe=False):
        #return True, None
        print(axisdirection)
        adirX, adirY, adirZ = axisdirection

        xmino, ymino, zmino, xmaxo, ymaxo, zmaxo = myOuterDimension
       
         
        
        xminn, yminn, zminn =  adirX*self.removegap,  adirY*self.removegap,  adirZ*self.removegap
        holeFound=True
        myCount = 0
        #_,_,myglobalcenter,_,myglobalxyz=checkingBox
        checkingOuterBox = self.translateOBB(checkingBox, xminn, yminn, zminn)
        #mylocalcenter = self.getCenterFromOBB(checkingOuterBox)
        #print("moving",xminn,yminn,zminn, myInnerDimension, myOuterDimension,myglobalcenter,mylocalcenter,myglobalxyz)
        
        tranShape = myShapeOuter
        checkOuterValue = self.checkOuter(checkingOuterBox,fullBox)
        while ( (holeFound==True) and (checkOuterValue==0) ):                    
            #print("Reached here1c") 
            tranShape = translate_shp(myShapeOuter,xminn, yminn, zminn,True) 
            #print("Reached here1d") 
            holeFound, commonHoleShape = self.checkAnyHole(tranShape,myShapeInner,toBeScaled,debugMe)   
            #print("Reached here1e")
            myCount += 1
            if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                print("Holes only found so far",myCount,holeFound)
                if (debugMe and holeFound==False):
                    self.writeForDebugging(commonHoleShape,tranShape,myShapeInner,myShapeOuter,myShapeInner,\
                        xmaxo-xmino+4*self.explodegap,0,0,"Top",debugMe)  
            if (holeFound==True):
                xminn, yminn, zminn = xminn+adirX*self.removegap, yminn+adirY*self.removegap, zminn+adirZ*self.removegap
                checkingOuterBox = self.translateOBB(checkingBox, xminn, yminn, zminn)
                checkOuterValue = self.checkOuter(checkingOuterBox,fullBox)

        if (holeFound==True) :
            if debugMe:
                print("Only holes ",axisdirection,myInnerDimension)
                self.writeForDebugging(myShapeOuter,tranShape,myShapeInner,myShapeOuter,myShapeInner,\
                    xmaxo-xmino+4*self.explodegap,0,0,"Top",debugMe)  
        
            return True, checkingOuterBox, checkOuterValue
        
        
        return holeFound, None, 0 


    def checkScaledCommonHoleInDirection(self, myShapeOuter,myOuterDimension, myShapeOriginal,myOriginalDimension, myShapeInner,myInnerDimension,direction,debugMe=False):
        #return True, None
        
        #dirX, dirY, dirZ = direction

        xmino, ymino, zmino, xmaxo, ymaxo, zmaxo = myOuterDimension
        xmini, ymini, zmini, xmaxi, ymaxi, zmaxi = myInnerDimension
        zminn, yminn, zminn, xmaxn, ymaxn, zmaxn = xmino, ymino, zmino, xmaxo, ymaxo, zmaxo
        myCount = 0
        holeFound = True
        #myBox = None
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
                    tranOrgn = translate_shp(myShapeOriginal,0,0,zminn,True)   
                    #print("Reached here1b") 
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe)                 
                while ( (holeFound==True) and ( (zminn+zmino) <= zmaxc) ):
                    zminn += self.removegap
                    #print("Reached here1c") 
                    tranShape = translate_shp(myShapeOuter,0,0,zminn,True) 
                    tranOrgn = translate_shp(myShapeOriginal,0,0,zminn,True) 
                    #print("Reached here1d") 
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe) 
                    #print("Reached here1e")
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,\
                                xmaxo-xmino+4*self.explodegap,0,0,"Top",debugMe)  
                if (holeFound==True) :
                    if debugMe:
                        print("Only holes From Bottom To Top",get_bounding_details(commonHoleShape),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,\
                            xmaxo-xmino+4*self.explodegap,0,0,"Top",debugMe)  
                
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
                    tranOrgn = translate_shp(myShapeOriginal,0,0,zmaxn,True)
                    #print("Reached here2b") 
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe)      
                while ( (holeFound==True) and ( (zmaxn+zmaxo) >= zminc) ):
                    zmaxn -= self.removegap
                    #print("Reached here2c")
                    tranShape = translate_shp(myShapeOuter,0,0,zmaxn,True)  
                    tranOrgn = translate_shp(myShapeOriginal,0,0,zmaxn,True) 
                    #print("Reached here2d") 
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe)
                    #print("Reached here2e") 
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,\
                                xmaxo-xmino+4*self.explodegap,0,0,"Bottom",debugMe)  
                if holeFound==True:
                    if debugMe:
                        print("Only holes From Top To Bottom",get_bounding_details(commonHoleShape),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,\
                            xmaxo-xmino+4*self.explodegap,0,0,"Bottom",debugMe)  
            
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
                        print("Empty From Front To Back")
                    return True, (1,0,0)
                myHoleDimension = myInnerDimension
                if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Empty Space From Front To Back")
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
                    tranOrgn = translate_shp(myShapeOriginal,xminn,0,0,True)
                    #print("Reached here3b")    
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe)                 
                while ( (holeFound==True) and ( (xminn+xmino) <= xmaxc) ):
                    xminn += self.removegap
                    #print("Reached here3c")
                    tranShape = translate_shp(myShapeOuter,xminn,0,0,True)
                    tranOrgn = translate_shp(myShapeOriginal,xminn,0,0,True)
                    #print("Reached here3d")    
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe) 
                    #print("Reached here3e") 
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,0,0,\
                                zmaxo-zmino+4*self.explodegap,"Back",debugMe)                     
                        
                if (holeFound==True) :
                    if debugMe:
                        print("Only holes From Front To Back",get_bounding_details(commonHoleShape),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,0,0,\
                            zmaxo-zmino+4*self.explodegap,"Back",debugMe)                    
                        
                    return True, (1,0,0)
            else:
                if debugMe:
                    print("Away From Front To Back")
                return True, (1,0,0)
        if (direction==(-1,0,0)) :
            if  (xmaxo >= xmini) :            
                """  corner = gp_Pnt(xmini-explodegap, ymino-explodegap, zmino-explodegap)            
                myBox = BRepPrimAPI_MakeBox(corner,(xmaxo-xmini)+2*explodegap,(ymaxo-ymino)+2*explodegap,(zmaxo-zmino)+2*explodegap).Shape()
                myCommonShape=BRepAlgoAPI_Common(myBox,myShapeInner).Shape() """
                myCommonShape=myShapeInner
                if myCommonShape==None:
                    if debugMe:
                        print("Empty From Back To Front")
                    return True, (-1,0,0)
                myHoleDimension = myInnerDimension
                if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Empty Space From Back To Front")
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
                    tranOrgn = translate_shp(myShapeOriginal,xmaxn,0,0,True)
                    #print("Reached here4b")    
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe)      
                while ( (holeFound==True) and ( (xmaxn+xmaxo) >= xminc) ):
                    xmaxn -= self.removegap
                    #print("Reached here4c")
                    tranShape = translate_shp(myShapeOuter,xmaxn,0,0,True)
                    tranOrgn = translate_shp(myShapeOriginal,xmaxn,0,0,True)
                    #print("Reached here4d")    
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe)
                    #print("Reached here4e") 
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,0,0,\
                                zmaxo-zmino+4*self.explodegap,"Front",debugMe)                      
                        
                if holeFound==True:
                    if debugMe:
                        print("Only holes From Back To Front",get_bounding_details(commonHoleShape),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,0,0,\
                            zmaxo-zmino+4*self.explodegap,"Front",debugMe)                    

                    return True, (-1,0,0) 
            else:
                if debugMe:
                    print("Away From Back to Front")
                return True, (-1,0,0)  
        if (direction==(0,1,0)) :
            if (ymino <= ymaxi) :        
                """ corner = gp_Pnt(xmino-explodegap, ymino-explodegap, zmino-explodegap)            
                myBox = BRepPrimAPI_MakeBox(corner,(xmaxo-xmino)+2*explodegap,(ymaxi-ymino)+2*explodegap,(zmaxo-zmino)+2*explodegap).Shape()
                myCommonShape=BRepAlgoAPI_Common(myBox,myShapeInner).Shape() """
                myCommonShape=myShapeInner
                if myCommonShape==None:
                    if debugMe:
                        print("Empty From Left To Right")
                    return True, (0,1,0)
                myHoleDimension = myInnerDimension
                if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Empty Space From Left To Right")
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
                    tranOrgn = translate_shp(myShapeOriginal,0,yminn,0,True)
                    #print("Reached here5b")    
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe)                 
                while ( (holeFound==True) and ( (yminn+ymino) <= ymaxc) ):
                    yminn += self.removegap
                    #print("Reached here5c")
                    tranShape = translate_shp(myShapeOuter,0,yminn,0,True)
                    tranOrgn = translate_shp(myShapeOriginal,0,yminn,0,True)
                    #print("Reached here5d")    
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe) 
                    #print("Reached here5e") 
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,\
                                xmaxo-xmino+4*self.explodegap,0,0,"Right",debugMe)  
                if (holeFound==True) :
                    if debugMe:
                        print("Only holes From Left To Right",get_bounding_details(commonHoleShape),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,\
                            xmaxo-xmino+4*self.explodegap,0,0,"Right",debugMe)  
    
                    return True, (0,1,0)
            else:
                if debugMe:
                    print("Away From Left To Right")
                return True, (0,1,0)
        if (direction==(0,-1,0)) :
            if  (ymaxo >= ymini) :
                """ corner = gp_Pnt(xmino-explodegap, ymini-explodegap, zmino-explodegap)            
                myBox = BRepPrimAPI_MakeBox(corner,(xmaxo-xmino)+2*explodegap,(ymaxo-ymini)+2*explodegap,(zmaxo-zmino)+2*explodegap).Shape()
                myCommonShape=BRepAlgoAPI_Common(myBox,myShapeInner).Shape() """
                myCommonShape=myShapeInner
                if myCommonShape==None:
                    if debugMe:
                        print("Empty From Right To Left")
                    return True, (0,-1,0)
                myHoleDimension = myInnerDimension
                if myHoleDimension == (0, 0, 0, 0, 0, 0) :
                    if debugMe:
                        print("Empty Space From Right To Left")
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
                    tranOrgn = translate_shp(myShapeOriginal,0,ymaxn,0,True)
                    #print("Reached here6b")    
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe)      
                while ( (holeFound==True) and ( (ymaxn+ymaxo) >= yminc) ):
                    ymaxn -= self.removegap
                    #print("Reached here6c")
                    tranShape = translate_shp(myShapeOuter,0,ymaxn,0,True)
                    tranOrgn = translate_shp(myShapeOriginal,0,ymaxn,0,True)
                    #print("Reached here6d")    
                    holeFound, commonHoleShape = self.checkScaledHole(tranShape,tranOrgn,myCommonShape,debugMe)
                    #print("Reached here6e")
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):                       
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,\
                                xmaxo-xmino+4*self.explodegap,0,0,"Left",debugMe)                             
                            
                if holeFound==True:
                    if debugMe:
                        print("Only holes From Right To Left",get_bounding_details(commonHoleShape),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeOriginal,\
                            xmaxo-xmino+4*self.explodegap,0,0,"Left",debugMe)                          
                            
                    return True, (0,-1,0) 
            else:
                if debugMe:
                    print("Away From Right to Left")
                return True, (0,-1,0) 
        
        return holeFound, (0,0,0)

    def isColliding(self,myOuterDimension,myInnerDimension,direction):
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
    
    def roundoff(self, point):
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
    
        return round(point*multiplier,2) / multiplier

    def getCenterFromOBB(self,obb):
        center = obb.Center()

        return (self.roundoff(center.X()),self.roundoff(center.Y()),self.roundoff(center.Z()))   
    
    def getAdjustantBoxes(self,orderpos,orderlast):
         
        myAdjustantBoxes = []
        _,currentOBB,_,_,_=self.directiondata[self.shapeorder[orderpos]]
        for iPos in range(len(self.shapesArray)-orderlast+1):                
            if (iPos!=orderpos):                                        
                _,obb,_,_,_=self.directiondata[self.shapeorder[iPos]]
                if currentOBB.IsOut(obb)==False:
                    myAdjustantBoxes.append((iPos,self.shapeorder[iPos]))                  
        
        return myAdjustantBoxes
    
    def isSmallestSurface(self,orderpos,orderlast):
        
        lowerSurfaceArea=self.shapessurface[orderpos]
       
        for iPos in range(len(self.shapesArray)-orderlast+1):
            if (iPos!=orderpos):   
                surfaceArea=self.shapessurface[iPos]                                   
                if surfaceArea<lowerSurfaceArea:
                    print("Cheking Smaller found another",orderpos,orderlast,iPos,self.shapessurface,lowerSurfaceArea,surfaceArea)
                    return False
        print("Cheking Smaller nothing found",orderpos,orderlast,self.shapessurface,lowerSurfaceArea)
        return True                  

    def touchedAdjustantBoxes(self,orderpos):
        myShape = self.shapesArray[self.shapeorder[orderpos]]
        myCount = len(self.myAdjustantBoxes)
        if myCount <=1:
            return myCount
        else:
            myCount=0
        for _,aBoxPos in self.myAdjustantBoxes:  
            thisShape = self.shapesArray[aBoxPos] 
            (thisdistance, p1, p2) = minimum_distance(thisShape,myShape)
            if (thisdistance<=0.001) :
                myCount+=1
            else:
                print("My Distance",(thisdistance, p1, p2))
            if myCount >1:
                return myCount
        return myCount

    def checkCommonHole(self,orderpos,orderlast,toBeScaled,myOBBDirections,debugMe=False):
        #return True, None
        myShapeOuter=self.shapesArray[self.shapeorder[orderpos]]
        myOuterDimension = self.shapesdimension[orderpos]
        #myScaledShapeOuter, myScaledShapeDimension = self.scaledshapes[self.shapeorder[orderpos]]
        myGuessDirections,checkingBox,fullBox = myOBBDirections
        lenDirections = len(myGuessDirections)
        print(myOBBDirections)
        myShapes = []
        self.mySeperateBoxes = []
        for iPos in range(len(self.shapesArray)-orderlast+1):                
            if (iPos!=orderpos):
                myShapes.append(self.shapesArray[self.shapeorder[iPos]])                        
                _,obb,_,_,_=self.directiondata[self.shapeorder[iPos]]
                self.mySeperateBoxes.append(obb)  
                #_,myname,_ = self.shapesColorArray[self.shapeorder[iPos]] 
        _,myname,_ = self.shapesColorArray[self.shapeorder[orderpos]] 
        print("checking",orderpos,orderlast,myname)    
        for i in range(0,lenDirections):
            (axisdirection),_ = myGuessDirections[i]
            #allPartsHoleFound=True
            """ myShapes = []
            for iPos in range(len(self.shapesArray)-orderlast+1):                
                if (iPos!=orderpos):
                    coliding = True#self.isColliding(myOuterDimension,self.shapesdimension[iPos],direction)                   
                    if(coliding):
                        if debugMe:
                            print("Adding to Find Collisions",iPos,self.shapeorder[iPos],"For",orderpos,self.shapeorder[orderpos],"In",axisdirection, "At pass",orderlast)
                        myShapes.append(self.shapesArray[self.shapeorder[iPos]])                        
                    else:
                        if debugMe:
                            print("Not Adding to Find Collisions",iPos,self.shapeorder[iPos],"For",orderpos,self.shapeorder[orderpos],"In",axisdirection, "At pass",orderlast)
           """                      
            if(len(myShapes)==0):
                _,_,mycenter,_,_ = checkingBox
                return True, axisdirection, mycenter 
            if(len(myShapes)==1):
                myShapeInner=myShapes[0]
            else:
                myShapeInner,_ = list_of_shapes_to_compound(myShapes)
            myInnerDimension = get_bounding_details(myShapeInner)
            holeFound,lastPosition,checkingOuterValue = self.checkCommonHoleInDirection(myShapeOuter,myOuterDimension, myShapeInner,myInnerDimension,\
                axisdirection,checkingBox,fullBox,toBeScaled,debugMe)
            if debugMe:
                print("Found Holes :",holeFound ,axisdirection,orderpos,self.shapeorder[orderpos],"In",axisdirection, "At pass",orderlast,toBeScaled,i)
            if holeFound==True:
                mycenterX,myCenterY,myCenterZ = self.getCenterFromOBB(lastPosition)
                return True, axisdirection, (mycenterX,myCenterY,myCenterZ,checkingOuterValue)
            """ for iPos in range(len(self.shapesArray)-orderlast+1):  
                if (iPos!=orderpos):
                    cacheValue = self.cacheCollisionBetweenParts[i][self.shapeorder[orderpos]][self.shapeorder[iPos]]
                    if cacheValue==None:
                        myInnerDimension = self.shapesdimension[iPos]
                        coliding = self.isColliding(myOuterDimension,myInnerDimension,direction)                        
                        if(coliding):
                            if debugMe:
                                print("Checking Collision with",iPos,self.shapeorder[iPos],"For",orderpos,self.shapeorder[orderpos],"In",direction, "At pass",orderlast)
                            holeFound, result =  self.checkCommonHoleInDirection(myShapeOuter,myOuterDimension,\
                            self.shapesArray[self.shapeorder[iPos]],myInnerDimension,direction,debugMe)
                            if debugMe:
                                print(result,direction,holeFound)
                            self.cacheCollisionBetweenParts[i][self.shapeorder[orderpos]][self.shapeorder[iPos]]=holeFound
                            self.cacheCollisionBetweenParts[self.oppositedirections[i]][self.shapeorder[iPos]][self.shapeorder[orderpos]]=holeFound
                            if holeFound==False:
                                allPartsHoleFound=False
                                break                           
                        else:
                            if debugMe:
                                print("Not Checking",iPos,self.shapeorder[iPos],"for collision detections For",orderpos,self.shapeorder[orderpos],"In",direction, "At pass",orderlast)
                            self.cacheCollisionBetweenParts[i][self.shapeorder[orderpos]][self.shapeorder[iPos]]=True
                            self.cacheCollisionBetweenParts[self.oppositedirections[i]][self.shapeorder[iPos]][self.shapeorder[orderpos]]=True
                    else:
                        if cacheValue==False:
                            allPartsHoleFound=False
                            if debugMe:
                                print("Not Checking Already Evaluated",iPos,self.shapeorder[iPos],"for collision detections",cacheValue,"For",orderpos,self.shapeorder[orderpos],"In",direction, "At pass",orderlast)
                            break
                        else:
                            if debugMe:
                                print("Not Checking Already Evaluated",iPos,self.shapeorder[iPos],"for collision detections",cacheValue,"For",orderpos,self.shapeorder[orderpos],"In",direction, "At pass",orderlast)
            if allPartsHoleFound==True:
                if debugMe:
                    print("Found only Holes in",orderpos,self.shapeorder[orderpos],"In",direction, "At pass",orderlast)
                return True, direction 
            """
            if debugMe:
                print("No Holes found in all directions","For",orderpos,self.shapeorder[orderpos],"In",axisdirection, "At pass",orderlast, toBeScaled,i)
            """ for i in range(0,lenDirections-1):           
                for j in range(0,lenDirections-1-i):
                    _,length1 = directions[j+1]
                    _,length = directions[j]
                    if(length > length1) :
                        directions[j+1], directions[j] = swap(directions[j+1],directions[j])
            if debugMe:
                print(directions) 
            result, _ = directions[0] """
        (axisdirection),_ = myGuessDirections[0]
        return False, axisdirection, None
    
    def getMinimumDistance(self,mydimension,fulldimension):
        xmin, ymin, zmin, xmax, ymax, zmax = fulldimension
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = mydimension
        return(min(xmins-xmin,(xmax-xmaxs),(ymins-ymin),(ymax-ymaxs),(zmins-zmin),(zmax-zmaxs)))
    
    def InitExplodeParts(self,debugMe=False):
        #print("ExploreParts",shapeTol,gapTol)
        xmin, ymin, zmin, xmax, ymax, zmax = self.dimension 
        xc, yc, zc = (xmin+xmax)/2, (ymin+ymax)/2 , (zmin+zmax)/2
        xd, yd, zd = xmax-xmin, ymax-ymin, zmax-zmin

        
        lenShape = len(self.shapeArray)
    
        maxGap = ( 1 if (lenShape<=1) else (lenShape-1) ) * self.explodegap
        #print(maxGap,lenShape)
        if( xd < yd ) and ( xd < zd ):
            if(xd==0):
                xd=1
            xt, yt, zt = 2*xd+self.explodegap+maxGap, maxGap, maxGap        
        elif( yd < xd ) and ( yd < zd):
            if(yd==0):
                yd=1
            xt, yt, zt = maxGap, 2*yd+self.explodegap+maxGap, maxGap
        else:
            if(zd==0):
                zd=1
            xt, yt, zt =  maxGap, maxGap, 2*zd+self.explodegap+maxGap
        xs  = 1+ ( maxGap / xd ) / 2
        ys  = 1+ ( maxGap / yd ) / 2
        zs  = 1+ ( maxGap / zd ) / 2
        testMe=False
        self.shapesColorArray=[]
        self.shapesArray=[]
        self.shapesordereddirection=[]
        if testMe:
            for i in [4,5,6,7,8,9]:
                self.shapesColorArray.append(self.shapeColorArray[i])
                self.shapesArray.append(self.shapeArray[i])
        else:
            self.shapesColorArray=self.shapeColorArray
            self.shapesArray=self.shapeArray
        lenShape = len(self.shapesArray)
        self.newShapes=[]
        self.moveArrays=[]
        self.shapesdirection=[]
       
        self.shapeorder=[] 

        self.shapesdistance=[]
        self.shapesvolume=[] 
        self.shapessurface=[]              
        self.shapesdimension=[]
        self.shapesoriginaldimension=[]
        self.shapesmove=[]
        self.directiondata=[]
        self.guessDirectionArrays=[]
        #self.scaledshapes=[]
        
        fullShape,converted = list_of_shapes_to_compound(self.shapesArray)
        if(converted):
            self.newShapes.append((fullShape,self.name,None))
        else:
            firstTime = True
            for (aShape,aName,aColor) in self.shapesColorArray:
                self.newShapes.append((aShape,aName,aColor))
                if firstTime:
                    firstTime = False
                else:
                    self.moveArrays.append((0, 0, 0))
        
        print(self.dimension,get_bounding_details(fullShape))
        """  if testMe:
            try:
                aColor = Quantity_Color(0, 0, 1, Quantity_TOC_RGB)
                currenttime = datetime.now()
                suffix = currenttime.strftime("%H-%M-%S")                
                colorfile = "Media/Log/"+"ReducedSrep"+suffix+"_COLOR.step"  
                try:                           
                    OCPStepIGESAnalyser.StepExportWithColor(shape=fullShape,color=aColor,name="MyShapeCommon").write_file(filename=colorfile)
                except Exception as e:
                    print(e,"File, %s has error" % colorfile)     
            except Exception as e:
                print("Exception while writing") """
        for i  in range(lenShape):
            (aShape,aName,aColor) = self.shapesColorArray[i]
            xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = get_bounding_details(aShape) 
            obbs = get_oriented_bounding_details(aShape)
            print(aName)
            directionData = self.getSixDirectionsFromOBB(obbs)
            _,_,(centerHere),_,_=directionData
            print(i,aName,(xmins+xmaxs)/2,(ymins+ymaxs)/2,(zmins+zmaxs)/2,centerHere)
            self.directiondata.append(directionData)
           
            xmove, ymove, zmove = (((xmins+xmaxs)/2)-xc)*xs, (((ymins+ymaxs)/2)-yc)*ys, (((zmins+zmaxs)/2)-zc)*zs
            if not self.center:
                newShape=translate_shp(aShape,xmove+xt, ymove+yt, zmove+zt, True)
                self.moveArrays.append((xmove, ymove, zmove))
            else:
                newShape=translate_shp(aShape,xt, yt, zt, True)
                self.moveArrays.append((0, 0, 0))            
            self.newShapes.append((newShape,aName,aColor))            
            
            #scaledShape,scaledDimension,_ = self.scaleMyPart(aShape,(xmins, ymins, zmins, xmaxs, ymaxs, zmaxs),self.onebyholescale)
            #self.scaledshapes.append((scaledShape,scaledDimension))
            #shapesdim.append(xmins+xmove+xt, ymins+ymove+xt, zmins+zmove+xt, xmaxs+xmove+xt, ymaxs+ymove+xt, zmaxs+zmove+xt)
            self.shapeorder.append(i)           
            self.shapesdirection.append(((0,0,0),(0,0,0,0)))
            self.shapesordereddirection.append(((0,0,0),(0,0,0)))
            self.shapesmove.append((xmove, ymove, zmove))
            _,_,(ddcx,ddcy,ddcz),_,(ddhx,ddhy,ddhz)=self.directiondata[self.shapeorder[i]]
            self.shapesdistance.append( (ddcx+xmove-xc)**2+(ddcy+ymove-yc)**2+(ddcz+zmove-zc)**2 )
            self.shapesvolume.append(ddhx*ddhy*ddhz)
            self.shapessurface.append(ddhx*ddhy+ddhx*ddhz*ddhy*ddhz) 
            #xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = ddcx-ddhx, ddcy-ddhy, ddcz-ddhz, ddcx+ddhx, ddcy+ddhy, ddcz+ddhz
            self.shapesdimension.append((xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))  
            self.shapesoriginaldimension.append((xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))
            self.guessDirectionArrays.append([])
        Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax = self.shapesdimension[0] 
        for i in range(1,lenShape):
            xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = self.shapesdimension[i]
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
        
        self.myFullDimension = (Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax)
        self.OuterOBBBox = self.getOBBFromDimension()
        xc, yc, zc = (Xxmin+Xxmax)/2, (Yymin+Yymax)/2 , (Zzmin+Zzmax)/2
        for i in range(0,lenShape):
            xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = self.shapesdimension[i]
            xmove, ymove, zmove = self.shapesmove[i]
            myDirectionData = self.directiondata[self.shapeorder[i]]
            _,_,(ddcx,ddcy,ddcz),_,_=myDirectionData    
            #self.shapesdistance[i]= -self.getMinimumDistance((xmins, ymins, zmins, xmaxs, ymaxs, zmaxs),(Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax))#
            self.shapesdistance[i]=(ddcx+xmove-xc)**2+(ddcy+ymove-yc)**2+(ddcz+zmove-zc)**2              
            myGuessDirections=self.guessDirections(self.directiondata[self.shapeorder[i]])
            #_, myDistance = myGuessDirections[0]
            #self.shapesdistance[self.shapeorder[i]]=-myDistance
            self.guessDirectionArrays[self.shapeorder[i]]=myGuessDirections
        k = 1
        for i in range(0,lenShape-k):
            #swapper = False
            for j in range(0,lenShape-k-i):
                if(( (self.shapesdistance[j+1] < self.shapesdistance[j]) or \
                    ((self.shapesdistance[j+1] == self.shapesdistance[j]) and (self.shapessurface[j+1] > self.shapessurface[j]))  ) ):
                    #if(swapper):
                    self.shapeorder[j+1], self.shapeorder[j] = swap(self.shapeorder[j+1], self.shapeorder[j])                
                    self.shapesmove[j+1], self.shapesmove[j] = swap(self.shapesmove[j+1], self.shapesmove[j])
                    self.shapesdistance[j+1], self.shapesdistance[j] = swap(self.shapesdistance[j+1], self.shapesdistance[j])
                    self.shapesvolume[j+1], self.shapesvolume[j] = swap(self.shapesvolume[j+1], self.shapesvolume[j])
                    self.shapessurface[j+1], self.shapessurface[j] = swap(self.shapessurface[j+1], self.shapessurface[j])
                    self.shapesdimension[j+1], self.shapesdimension[j] = swap(self.shapesdimension[j+1], self.shapesdimension[j])
        self.myAdjustantBoxes=self.getAdjustantBoxes(lenShape-k,k)
        """ currentSurfaceArea = self.shapessurface[self.shapeorder[lenShape-k]]
        lowSurfaceArea = lenShape-k
        for (iPos,OrderPos) in self.myAdjustantBoxes:
            if currentSurfaceArea > self.shapessurface[OrderPos] :
                lowSurfaceArea = iPos
                currentSurfaceArea = self.shapessurface[OrderPos]
        if lowSurfaceArea != (lenShape-k):
            self.shapesdistance[lowSurfaceArea] = self.shapesdistance[self.shapeorder[lenShape-k]]+1
            for i in range(0,lenShape-k):
            #swapper = False
                for j in range(0,lenShape-k-i):
                    if(( (self.shapesdistance[j+1] < self.shapesdistance[j]) or \
                        ((self.shapesdistance[j+1] == self.shapesdistance[j]) and (self.shapessurface[j+1] > self.shapessurface[j]))  ) ):
                        #if(swapper):
                        self.shapeorder[j+1], self.shapeorder[j] = swap(self.shapeorder[j+1], self.shapeorder[j])                
                        self.shapesmove[j+1], self.shapesmove[j] = swap(self.shapesmove[j+1], self.shapesmove[j])
                        self.shapesdistance[j+1], self.shapesdistance[j] = swap(self.shapesdistance[j+1], self.shapesdistance[j])
                        self.shapesvolume[j+1], self.shapesvolume[j] = swap(self.shapesvolume[j+1], self.shapesvolume[j])
                        self.shapessurface[j+1], self.shapessurface[j] = swap(self.shapessurface[j+1], self.shapessurface[j])
                        self.shapesdimension[j+1], self.shapesdimension[j] = swap(self.shapesdimension[j+1], self.shapesdimension[j])
            self.myAdjustantBoxes=self.getAdjustantBoxes(lenShape-k,k) """
        #self.cacheCollisionBetweenParts = [[[None for k in range(lenShape)] for j in range(lenShape)] for i in range(len(self.sixdirections))]
        print(lenShape,self.shapeorder,self.shapesdistance,self.shapesvolume, self.shapessurface, self.shapesdimension)#,self.scaledshapes)

    def writeToGltfFile(self,sourceFileName,distancegap,anglegap,animationtime,starttime,currenttime,processed):
        dictionary={}
        try:
            (_, _, dictionary) = OCPStepIGESAnalyser.StepIgesAnalyser(
                    filename=sourceFileName,shapeslist=self.newShapes,includeparts=False,distancegap=distancegap,logging=self.logging,
                    anglegap=anglegap,disectparts=False,moverotate=0,thumbwidth=0,thumbheight=0,writethread=False,
                    edgesize=0, vertexsize=0, animations=self.moveArrays,shapeorder=self.shapeorder,delay=animationtime).dump()
            dictionary['assemblyorder']={   "order":self.shapeorder,
                                            "direction":self.shapesdirection,
                                            "start":starttime.strftime("%H:%M:%S"),
                                            "current":currenttime.strftime("%H:%M:%S"),
                                            "complete":processed } 
            try:
                orderfile = dictionary["display"]+dictionary["store"]+".order"
                print("Writing,",orderfile)
                with open(orderfile, 'w') as fh:
                    fh.write(json.dumps(dictionary["assemblyorder"], sort_keys=True, indent=2 ))
            except Exception as e:
                print("Error while writing orderfile",e) 
        except Exception as e:
                print("Error while writing orderfile",e) 
        return dictionary
    
    def writeToOrderFile(self,storename,starttime,currenttime,processed):
        mydictionary={}
        try:
            mydictionary={"order":self.shapeorder,
                "direction":self.shapesdirection,
                "start":starttime.strftime("%H:%M:%S"),
                "current":currenttime.strftime("%H:%M:%S"),
                "complete":processed } 
            try:
                orderfile = self.displaypath+storename+".order"
                print("Writing,",orderfile)
                with open(orderfile,'w') as fh:
                    fh.write(json.dumps(mydictionary, sort_keys=True, indent=2 ))
            except Exception as e:
                print("Error while writing orderfile",e) 
        except Exception as e:
                print("Error while writing orderfile",e) 
        return mydictionary
    
    def write_status(self,storename,percentage,starttime,currenttime):
        mystatusdict =  {
                "percent":percentage,
                "start":starttime.strftime("%H-%M-%S"),
                "current":currenttime.strftime("%H-%M-%S") } 
        statusfilename = self.displaypath+storename+".status"
        try:
            print("Writing",statusfilename,"Percentage",percentage)  
            with open(statusfilename, 'w') as fh:
                fh.write(json.dumps(mystatusdict, sort_keys=True, indent=2 ))
        except Exception as e:
            print("While Writing",statusfilename,e) 
        return mystatusdict


    def getLastPoint(self,axisc,minp,maxp):
        if(axisc > 0):
            lastp = maxp
        elif(axisc < 0):
            lastp = minp
        else:
            lastp = (maxp+minp)/2
        return lastp

    def guessDirections(self,checkingBox,debugMe=False):
        xmin, ymin, zmin, xmax, ymax, zmax = self.myFullDimension
        (myPositionalDirections, _,(centerX,centerY,centerZ),_,(Hx,Hy,Hz)) = checkingBox        
        myDirections=[]
        index=0
        for myDirection in myPositionalDirections:
            (axisX,axisY,axisZ) = myDirection
            index +=1
            lastX = self.getLastPoint(axisX,xmin,xmax)
            lastY = self.getLastPoint(axisY,ymin,ymax)
            lastZ = self.getLastPoint(axisZ,zmin,zmax)
            firstX, firstY, firstZ = centerX, centerY, centerZ
            """ if index==1:
                firstZ -= Hz
            elif index==2:
                firstZ += Hz
            elif index==3:
                firstY -= Hy
            elif index==4:
                firstY += Hy
            elif index==5:
                firstX -= Hx
            else:
                firstX += Hx """
            minimumdistance = -1e10
            if axisX != 0:
                thisdistance = (lastX-firstX) / axisX                
                if minimumdistance < thisdistance :
                    minimumdistance = thisdistance
                print("axisX",thisdistance,lastX,firstX,minimumdistance)
            #else:
            #    print("axisX:0?",lastX,firstX,minimumdistance)
            if axisY != 0:
                thisdistance = (lastY-firstY) / axisY                
                if minimumdistance < thisdistance :
                    minimumdistance = thisdistance 
                print("axisY",thisdistance,lastY,firstY,minimumdistance)
            #else:
            #    print("axisY:0?",lastY,firstY,minimumdistance)       
            if axisZ != 0:
                thisdistance = (lastZ-firstZ) / axisZ                
                if minimumdistance < thisdistance :
                    minimumdistance = thisdistance 
                print("axisZ",thisdistance,lastZ,firstZ,minimumdistance) 
            #else:
            #    print("axisZ:0?",lastZ,firstZ,minimumdistance)
            minDistance = minimumdistance # (firstX-lastX)*(firstX-lastX)+(firstY-lastY)*(firstY-lastY)+(firstZ-lastZ)*(firstZ-lastZ)
            myDirections.append((myDirection,minDistance))       
        
        lenDirections = len(myDirections)
        #if debugMe:
        #    print("Before Guess",myDirections,checkingBox,fullDimension)
        for i in range(0,lenDirections-1):           
            for j in range(0,lenDirections-1-i):
                _,length1 = myDirections[j+1]
                _,length = myDirections[j]
                if(length > length1) :
                    myDirections[j+1], myDirections[j] = swap(myDirections[j+1],myDirections[j])
        #if debugMe:
        #    print("After Guess",myDirections)
        #fullDimensionOBB=self.getOBBFromDimension(fullDimension)
        return myDirections#,checkingBox#,fullDimensionOBB
    
    def getlastPosition(self,myOBBDirections,myDirection):
        _,checkingBox,fullBox = myOBBDirections
        """ xmin, ymin, zmin, xmax, ymax, zmax = self.myFullDimension
        (_, _,(centerX,centerY,centerZ),_,_) = checkingBox        
        myDirections=[]
        index=0 """
        
        (axisX,axisY,axisZ) = myDirection
        
        """ lastX = self.getLastPoint(axisX,xmin,xmax)
        lastY = self.getLastPoint(axisY,ymin,ymax)
        lastZ = self.getLastPoint(axisZ,zmin,zmax)
        firstX, firstY, firstZ = centerX, centerY, centerZ """
       
        minDistance = self.removegap # math.sqrt((firstX-lastX)*(firstX-lastX)+(firstY-lastY)*(firstY-lastY)+(firstZ-lastZ)*(firstZ-lastZ))
        #myCount = 0
        xminn, yminn, zminn =  minDistance*self.removegap,  minDistance*self.removegap,  minDistance*self.removegap        
        checkingOuterBox = self.translateOBB(checkingBox, xminn, yminn, zminn)
        checkOuterValue = self.checkInsideOuter(checkingOuterBox)          
        while (checkOuterValue==0):                    
            #print("Reached here1c") 
            xminn, yminn, zminn = xminn+axisX*self.removegap, yminn+axisY*self.removegap, zminn+axisZ*self.removegap
            checkingOuterBox = self.translateOBB(checkingBox, xminn, yminn, zminn)
            checkOuterValue = self.checkInsideOuter(checkingOuterBox)
        checkOuterValue = self.checkOutsideOuter(checkingOuterBox,fullBox)
        mycenterX,mycenterY,mycenterZ = self.getCenterFromOBB(checkingOuterBox)
        return (mycenterX,mycenterY,mycenterZ,checkOuterValue)#,checkingBox#,fullDimensionOBB

    def getSixDirectionsFromOBB(self,obb):
              
        aBaryCenter = obb.Center()
        aXDir = obb.XDirection()
        aYDir = obb.YDirection()
        aZDir = obb.ZDirection()
        axx = self.roundoff(aXDir.X())
        axy = self.roundoff(aXDir.Y())
        axz = self.roundoff(aXDir.Z())
        ayx = self.roundoff(aYDir.X())
        ayy = self.roundoff(aYDir.Y())
        ayz = self.roundoff(aYDir.Z())
        azx = self.roundoff(aZDir.X())
        azy = self.roundoff(aZDir.Y())
        azz = self.roundoff(aZDir.Z())
        """ aHalfX = obb.XHSize()
        aHalfY = obb.YHSize()
        aHalfZ = obb.ZHSize()
        ax = gp_XYZ(aXDir.X(), aXDir.Y(), aXDir.Z())
        ay = gp_XYZ(aYDir.X(), aYDir.Y(), aYDir.Z())
        az = gp_XYZ(aZDir.X(), aZDir.Y(), aZDir.Z())
        p = gp_Pnt(aBaryCenter.X(), aBaryCenter.Y(), aBaryCenter.Z())
        anAxes = gp_Ax2(p, gp_Dir(aZDir), gp_Dir(aXDir))
        anAxes.SetLocation(gp_Pnt(p.XYZ() - ax*aHalfX - ay*aHalfY - az*aHalfZ))
        aBox = BRepPrimAPI_MakeBox(anAxes, 2.0*aHalfX, 2.0*aHalfY, 2.0*aHalfZ).Shape() """
        myDirections=[] 
        myDirections.append((azx,azy,azz))
        myDirections.append((-azx,-azy,-azz))
        myDirections.append((ayx,ayy,ayz))
        myDirections.append((-ayx,-ayy,-ayz))
        myDirections.append((axx,axy,axz))
        myDirections.append((-axx,-axy,-axz))
        myDiagonal=math.sqrt(obb.XHSize()*obb.XHSize()+obb.YHSize()*obb.YHSize()+obb.ZHSize()*obb.ZHSize())
        print (myDirections, (obb.XHSize(),obb.YHSize(),obb.XHSize()), (aBaryCenter.X(), aBaryCenter.Y(), aBaryCenter.Z()))
        return (myDirections,obb,(self.roundoff(aBaryCenter.X()), self.roundoff(aBaryCenter.Y()), self.roundoff(aBaryCenter.Z())), myDiagonal, (obb.XHSize(),obb.YHSize(),obb.XHSize()) )

    def getOBBFromDimension(self):
        
        xmin, ymin, zmin, xmax, ymax, zmax = self.myFullDimension
        corner = gp_Pnt(xmin, ymin, zmin)            
        myBox = BRepPrimAPI_MakeBox(corner,xmax-xmin,ymax-ymin,zmax-zmin).Shape()
        obbs = get_oriented_bounding_details(myBox)
        return obbs   
    
    def translateOBB(self,obbStructure,x,y,z):
        _,obb,_,_,_=obbStructure
        #print("Translating",obb)
        resultOBB = Bnd_OBB()        
        #mehere = resultOBB.XDirection()
        shiftedCenter = obb.Center()+gp_XYZ(x,y,z)
        resultOBB.SetCenter(gp_Pnt(shiftedCenter))
        resultOBB.SetXComponent(gp_Dir(obb.XDirection()),obb.XHSize())
        resultOBB.SetYComponent(gp_Dir(obb.YDirection()),obb.YHSize())
        resultOBB.SetZComponent(gp_Dir(obb.ZDirection()),obb.ZHSize())       
        return resultOBB


    def printOBB(self,aShapeIndex):
        obb = self.directiondata[aShapeIndex]
        print(obb)

    def getMoveXYZ(self,aShapeIndex,direction,displacement):
        (myDirections, _,_,_,_) = self.directiondata[aShapeIndex]
        directionX,directionY,directionZ = myDirections[direction]
        return directionX*displacement, directionY*displacement, directionZ*displacement   

    def writeStatusElapsed(self,storename,starttime,previoustime,previousk,k,lenShape):
        currenttime = datetime.utcnow()
        timingdelta = currenttime-previoustime
        if (timingdelta.seconds > 5):
            self.write_status(storename,30+(k*70/lenShape),starttime,currenttime)
            if(previousk != k):
                self.writeToOrderFile(storename,starttime,currenttime,k)
                previousk = k
            return currenttime,True
        return previoustime,False

    
    def threadAssembling(self,sourceFileName,distancegap,anglegap,animationtime,starttime,storename,debugMe):
        try:
            if self.logging != None and self.byThread:
                self.logging.info("Started thread assembling"+sourceFileName) 
        except Exception as e:
            print("Error while logging",e)
        if(self.center):    
            
            
            previoustime = starttime # current date and time
            

            lenShape = len(self.shapesArray)
            
            k=1
            commonObjects=[]
            #Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax = self.dimension
            previousk=0
            while k < lenShape:
                currenttime = datetime.utcnow()
                timingdelta = currenttime-previoustime
                if (timingdelta.seconds > 5) and (self.byThread):
                    if(previousk != k):
                        self.writeToOrderFile(storename,starttime,currenttime,k)
                        previousk = k 
                    self.write_status(storename,30+(k*70/lenShape),starttime,currenttime)
                    previoustime=currenttime
                  
                enclosed = False
                myDirectionAtZero=(0,0,0)
                
                for holesize in range(0,2):
                    previoustime,changestatus = self.writeStatusElapsed(storename,starttime, previoustime,previousk,k,lenShape)
                    if changestatus:
                        previoustime=datetime.utcnow()
                        previousk=k

                    if holesize == 0:
                        toBeScaled = self.holescale
                    else:
                        toBeScaled = self.holescale / 1.1
                    lastIPos=0
                    for i in range(0,lenShape-k+1):    
                        previoustime,changestatus = self.writeStatusElapsed(storename,starttime, previoustime,previousk,k,lenShape)
                        if changestatus:
                            previoustime=datetime.utcnow()
                            previousk=k            
                        j=lenShape-k-i
                        debugMe = True # k==1 and i==0 #True #k==1 and i==4 #True #(k==3) and (i==0) #True #shapeorder[j]==2 or shapeorder[j]==3
                        if debugMe:
                            print(k,j,self.shapeorder[j],self.shapeorder,toBeScaled,currenttime,self.dimension)
                        myGuessDirections = self.guessDirectionArrays[self.shapeorder[j]],self.directiondata[self.shapeorder[j]], self.OuterOBBBox  #self.guessDirections(self.directiondata[self.shapeorder[j]], (Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax),debugMe)
                        #myExcludeCompound = excluded_list_of_shapes_to_compound(shapesArray,shapeorder,j,k,False)
                        #myExcludeDimension = get_bounding_details(myExcludeCompound)
                        #print("My Shape TOl, Gap Tol",shapeTol,gapTol)
                        myCommonCompound,myHoles=None,None
                        whatIgot = self.checkCommonHole(j,k,toBeScaled,myGuessDirections,debugMe) 
                        #print("What I Got here",whatIgot)
                        #enclosed,_,myDirection, myCommonCompound,myHoles = isRemovable(shape[shapeorder[j]],shapesdim[j],myExcludeCompound,myExcludeDimension,shapeTol,gapTol,debugMe)
                        enclosed, myAxisDirection, myLastPosition = whatIgot #self.checkCommonHole(j,k,toBeScaled,myGuessDirections,debugMe) 
                        #print(k,i,j,shapeorder[j],enclosed,myExcludeDimension,lenShape-k)
                        if myDirectionAtZero==(0,0,0):
                            myDirectionAtZero=myAxisDirection
                        if (enclosed):
                            lastIPos=i
                            self.shapesdirection[self.shapeorder[j]]=(myAxisDirection,myLastPosition)
                            if(myCommonCompound!=None and debugMe ):
                                commonObjects.append((myCommonCompound,self.shapeorder[j], myHoles))
                            if (j!=(lenShape-k)):
                                j1=lenShape-k
                                self.shapeorder[j1], self.shapeorder[j] = swap(self.shapeorder[j1], self.shapeorder[j])                
                                self.shapesmove[j1], self.shapesmove[j] = swap(self.shapesmove[j1], self.shapesmove[j])
                                self.shapesdistance[j1], self.shapesdistance[j] = swap(self.shapesdistance[j1], self.shapesdistance[j])
                                self.shapesvolume[j1], self.shapesvolume[j] = swap(self.shapesvolume[j1], self.shapesvolume[j])
                                self.shapessurface[j1], self.shapessurface[j] = swap(self.shapessurface[j1], self.shapessurface[j])
                                self.shapesdimension[j1], self.shapesdimension[j] = swap(self.shapesdimension[j1], self.shapesdimension[j])                    
                            print(k,i,j,self.shapeorder[lenShape-k],enclosed,lenShape-k,toBeScaled)
                            break
                        else:
                            isSmaller = self.isSmallestSurface(j,k)
                            partsNearTome=0
                            if (isSmaller and (i!=0)):
                                partsNearTome = self.touchedAdjustantBoxes(j)
                                print("I am smaller with following values", partsNearTome, len(self.myAdjustantBoxes)<=1, len(self.myAdjustantBoxes), self.myAdjustantBoxes)
                            
                            if ((i==0) or (isSmaller and (partsNearTome<=1)) ):
                                
                                if isSmaller:
                                    
                                    (_,aName,aColor) = self.shapesColorArray[self.shapeorder[lenShape-k]]
                                    myLastPosition= self.getlastPosition(myGuessDirections,myAxisDirection)
                                    print("No objects can be removed",k,"Removing part forcefully smallest surface area from center",aName)                
                                    self.shapesdirection[self.shapeorder[j]]=(myAxisDirection,myLastPosition)
                                    if (j!=(lenShape-k)):
                                        j1=lenShape-k
                                        self.shapeorder[j1], self.shapeorder[j] = swap(self.shapeorder[j1], self.shapeorder[j])                
                                        self.shapesmove[j1], self.shapesmove[j] = swap(self.shapesmove[j1], self.shapesmove[j])
                                        self.shapesdistance[j1], self.shapesdistance[j] = swap(self.shapesdistance[j1], self.shapesdistance[j])
                                        self.shapesvolume[j1], self.shapesvolume[j] = swap(self.shapesvolume[j1], self.shapesvolume[j])
                                        self.shapessurface[j1], self.shapessurface[j] = swap(self.shapessurface[j1], self.shapessurface[j])
                                        self.shapesdimension[j1], self.shapesdimension[j] = swap(self.shapesdimension[j1], self.shapesdimension[j])                    
                                    """ if (k!=1) :
                                        (_,myLastPosition)= self.shapesdirection[self.shapeorder[lenShape-k+1]]                   
                                        self.shapesdirection[self.shapeorder[lenShape-k]]=(myAxisDirection,myLastPosition) """
                                    enclosed=True
                                    lastIPos=i
                                    break
                                else:
                                    print("Going for special checking!!")
                                for  (iAdjustPos,iOrderPos) in self.myAdjustantBoxes:
                                    previoustime,changestatus = self.writeStatusElapsed(storename,starttime, previoustime,previousk,k,lenShape)
                                    if changestatus:
                                        previoustime=datetime.utcnow()
                                        previousk=k 
                                    mySecondGuessDirections = self.guessDirectionArrays[iOrderPos],self.directiondata[self.shapeorder[j]], self.OuterOBBBox  #self.guessDirections(self.directiondata[self.shapeorder[j]], (Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax),debugMe)
                                    print("Special Checking",iAdjustPos,iOrderPos,j,k)
                                    whatIgot = self.checkCommonHole(j,k,toBeScaled,mySecondGuessDirections,debugMe) 
                                    enclosed, mySecondAxisDirection, myLastPosition = whatIgot
                                    if enclosed:
                                        self.shapesdirection[self.shapeorder[j]]=(mySecondAxisDirection,myLastPosition)                                        
                                        if (j!=(lenShape-k)):
                                            j1=lenShape-k
                                            self.shapeorder[j1], self.shapeorder[j] = swap(self.shapeorder[j1], self.shapeorder[j])                
                                            self.shapesmove[j1], self.shapesmove[j] = swap(self.shapesmove[j1], self.shapesmove[j])
                                            self.shapesdistance[j1], self.shapesdistance[j] = swap(self.shapesdistance[j1], self.shapesdistance[j])
                                            self.shapesvolume[j1], self.shapesvolume[j] = swap(self.shapesvolume[j1], self.shapesvolume[j])
                                            self.shapessurface[j1], self.shapessurface[j] = swap(self.shapessurface[j1], self.shapessurface[j])
                                            self.shapesdimension[j1], self.shapesdimension[j] = swap(self.shapesdimension[j1], self.shapesdimension[j])                    
                                        print(k,i,j,self.shapeorder[lenShape-k],enclosed,lenShape-k,toBeScaled)  
                                        lastIPos=i                          
                                        break
                                if enclosed:
                                    break
                                elif ((i==0) and (holesize==1)):
                                    myLastPosition= self.getlastPosition(myGuessDirections,myAxisDirection)
                                    (_,aName,aColor) = self.shapesColorArray[self.shapeorder[lenShape-k]]
                                    print("Just setting",k,"Approx direction",aName)                
                                    self.shapesdirection[self.shapeorder[j]]=(myAxisDirection,myLastPosition)
                                    
                            #if debugMe:
                            print(k,i,j,self.shapeorder[j],enclosed,lenShape-k,toBeScaled)
                            if(myCommonCompound!=None and debugMe):
                                commonObjects.append((myCommonCompound,self.shapeorder[j],myHoles))
                    if enclosed:
                        print("In", holesize, "Pass able to remove",k,"after iteration",lastIPos)
                        break  
                    else:
                        (_,aName,aColor) = self.shapesColorArray[self.shapeorder[lenShape-k]]
                        print("No objects can be removed",k,"When hole size is",toBeScaled,"For", aName)                
                                          
                if enclosed==False:
                    (_,aName,aColor) = self.shapesColorArray[self.shapeorder[lenShape-k]]
                    print("No objects can be removed",k,"Removing part forcefully largest distant from center",aName)                
                    
                    #if myDirectionAtZero==(0,0,0):
                    """ if (k!=1) :                    
                        self.shapesdirection[self.shapeorder[lenShape-k]]=self.shapesdirection[self.shapeorder[lenShape-k+1]] """

                print(k, self.shapeorder,self.shapesdirection, lenShape-k)

                Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax = self.shapesdimension[0] 
                for i in range(1,lenShape-k):
                    xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = self.shapesdimension[i]
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
                self.myFullDimension = (Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax)
                self.OuterOBBBox = self.getOBBFromDimension()
                xc, yc, zc = (Xxmin+Xxmax)/2, (Yymin+Yymax)/2 , (Zzmin+Zzmax)/2
                #print("before",xc,yc,zc,k, shapesdis)
                for i in range(0,lenShape-k):
                    xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = self.shapesdimension[i]
                    xmove, ymove, zmove = self.shapesmove[i]
                    myDirectionData = self.directiondata[self.shapeorder[i]]
                    _,_,(ddcx,ddcy,ddcz),_,_=myDirectionData                   
                    #self.shapesdistance[i]= -self.getMinimumDistance((xmins, ymins, zmins, xmaxs, ymaxs, zmaxs),(Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax))#
                    self.shapesdistance[i]=(ddcx+xmove-xc)**2+(ddcy+ymove-yc)**2+(ddcz+zmove-zc)**2   
                    myGuessDirections=self.guessDirections(myDirectionData)
                    #_, myDistance = myGuessDirections[0]
                    #self.shapesdistance[self.shapeorder[i]]=-myDistance
                    self.guessDirectionArrays[self.shapeorder[i]]=myGuessDirections
                k += 1
                for i in range(0,lenShape-k):
                    #swapper = False
                    for j in range(0,lenShape-k-i):
                        if(( (self.shapesdistance[j+1] < self.shapesdistance[j]) or \
                            ((self.shapesdistance[j+1] == self.shapesdistance[j]) and (self.shapessurface[j+1] > self.shapessurface[j]))  ) ):
                            #if(swapper):
                            self.shapeorder[j+1], self.shapeorder[j] = swap(self.shapeorder[j+1], self.shapeorder[j])                
                            self.shapesmove[j+1], self.shapesmove[j] = swap(self.shapesmove[j+1], self.shapesmove[j])
                            self.shapesdistance[j+1], self.shapesdistance[j] = swap(self.shapesdistance[j+1], self.shapesdistance[j])
                            self.shapesvolume[j+1], self.shapesvolume[j] = swap(self.shapesvolume[j+1], self.shapesvolume[j])
                            self.shapessurface[j+1], self.shapessurface[j] = swap(self.shapessurface[j+1], self.shapessurface[j])
                            self.shapesdimension[j+1], self.shapesdimension[j] = swap(self.shapesdimension[j+1], self.shapesdimension[j])

                self.myAdjustantBoxes=self.getAdjustantBoxes(lenShape-k,k)
                """ currentSurfaceArea = self.shapessurface[self.shapeorder[lenShape-k]]
                lowSurfaceArea = lenShape-k
                for (iPos,OrderPos) in self.myAdjustantBoxes:
                    if currentSurfaceArea > self.shapessurface[OrderPos] :
                        lowSurfaceArea = iPos
                        currentSurfaceArea = self.shapessurface[OrderPos]
                if lowSurfaceArea != (lenShape-k):
                    self.shapesdistance[lowSurfaceArea] = self.shapesdistance[self.shapeorder[lenShape-k]]+1
                    for i in range(0,lenShape-k):
                    #swapper = False
                        for j in range(0,lenShape-k-i):
                            if(( (self.shapesdistance[j+1] < self.shapesdistance[j]) or \
                                ((self.shapesdistance[j+1] == self.shapesdistance[j]) and (self.shapessurface[j+1] > self.shapessurface[j]))  ) ):
                                #if(swapper):
                                self.shapeorder[j+1], self.shapeorder[j] = swap(self.shapeorder[j+1], self.shapeorder[j])                
                                self.shapesmove[j+1], self.shapesmove[j] = swap(self.shapesmove[j+1], self.shapesmove[j])
                                self.shapesdistance[j+1], self.shapesdistance[j] = swap(self.shapesdistance[j+1], self.shapesdistance[j])
                                self.shapesvolume[j+1], self.shapesvolume[j] = swap(self.shapesvolume[j+1], self.shapesvolume[j])
                                self.shapessurface[j+1], self.shapessurface[j] = swap(self.shapessurface[j+1], self.shapessurface[j])
                                self.shapesdimension[j+1], self.shapesdimension[j] = swap(self.shapesdimension[j+1], self.shapesdimension[j])
                    self.myAdjustantBoxes=self.getAdjustantBoxes(lenShape-k,k) """
            if(lenShape>1):
                self.shapesdirection[self.shapeorder[0]]=self.shapesdirection[self.shapeorder[1]]
                print("Before",self.shapessurface,self.shapessurface[1] > self.shapessurface[0],self.shapesdirection)
                if self.shapessurface[1] > self.shapessurface[0] :
                    j=0
                    j1=1
                    self.shapeorder[j1], self.shapeorder[j] = swap(self.shapeorder[j1], self.shapeorder[j])                
                    self.shapesmove[j1], self.shapesmove[j] = swap(self.shapesmove[j1], self.shapesmove[j])
                    self.shapesdistance[j1], self.shapesdistance[j] = swap(self.shapesdistance[j1], self.shapesdistance[j])
                    self.shapesvolume[j1], self.shapesvolume[j] = swap(self.shapesvolume[j1], self.shapesvolume[j])
                    self.shapessurface[j1], self.shapessurface[j] = swap(self.shapessurface[j1], self.shapessurface[j])
                    self.shapesdimension[j1], self.shapesdimension[j] = swap(self.shapesdimension[j1], self.shapesdimension[j]) 
                    myaxisdirection, mylastposition = self.shapesdirection[self.shapeorder[0]] 
                    print(  myaxisdirection, mylastposition )                  
                    self.shapesdirection[self.shapeorder[0]]=(tuple(-x for x in myaxisdirection),mylastposition)                    
                    myaxisdirection, mylastposition = self.shapesdirection[self.shapeorder[1]] 
                    print( myaxisdirection, mylastposition )  
                    self.shapesdirection[self.shapeorder[1]]=(tuple(-x for x in myaxisdirection),mylastposition)
                    print("AFter",self.shapessurface,self.shapessurface[1] > self.shapessurface[0],self.shapesdirection)

            
            for i  in range(lenShape):
                print(i,self.shapeorder[i],self.shapesdirection[self.shapeorder[i]])
            xmin, ymin, zmin, xmax, ymax, zmax = self.dimension 
            xc, yc, zc = (xmin+xmax)/2, (ymin+ymax)/2 , (zmin+zmax)/2
           
            previousdistance = self.explodegap
            previousaxis = (0,1,0)
            #shiftX,shiftY,shiftZ = 0,0,0   
            #prevX, prevY, prevZ = 0,0,0   
            for i  in range(lenShape):
                #(aShape,aName,aColor) = shapeArray[i]
                #xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = get_bounding_details(aShape) 
                myIndex = self.shapeorder[i]
                #(bShape,bName,bColor) = self.shapesColorArray[myIndex]
                (newShape,aName,aColor) = self.newShapes[myIndex+1]
                axisdirection,lastposition = self.shapesdirection[myIndex]
                if axisdirection==None:
                    axisdirection = previousaxis
                if lastposition!=None:                     
                    lastcenterx, lastcentery, lastcenterz, outerCheckValue = lastposition
                    if outerCheckValue==1:
                        outergap = self.explodegap*2*i
                        method = "Assigning"
                    else:
                        outergap = self.explodegap*2*i
                        method = "Fixing"
                    _,_,(currentcenterx,currentcentery,currentcenterz),_,_ = self.directiondata[myIndex]
                    distance = math.sqrt((currentcenterx-lastcenterx)*(currentcenterx-lastcenterx)+\
                        (currentcentery-lastcentery)*(currentcentery-lastcentery)+\
                            (currentcenterz-lastcenterz)*(currentcenterz-lastcenterz)) + outergap
                    print(method,aName,distance,lastposition,(currentcenterx,currentcentery,currentcenterz),self.explodegap*2*i)
                else:
                    distance = previousdistance + 4*self.explodegap
                    print("Allocating",aName,distance,lastposition,(currentcenterx,currentcentery,currentcenterz),self.explodegap*2*i)
                
                ax,ay,az=axisdirection
                xmove,ymove,zmove = ax*distance, ay*distance, az*distance
                self.moveArrays[myIndex]=(xmove, ymove, zmove)
                finalShape=translate_shp(newShape,xmove, ymove, zmove, True) 
                previousaxis=ax,ay,az
                previousdistance=distance
                print(axisdirection,i,myIndex,self.shapeorder[i], (xmove, ymove, zmove),  aName)  
                self.newShapes[myIndex+1] = (finalShape,aName,aColor)    
        debugMe = False
        if debugMe==True:
            aColor = Quantity_Color(0, 0, 1, Quantity_TOC_RGB)
            #bColor = Quantity_Color(1, 1, 0, Quantity_TOC_RGB)
            currentIndex = lenShape
            for j in range(len(commonObjects)):            
                _, _, myHoles = commonObjects[j]           
                for i in range(len(myHoles)):                
                    AnotherShape=translate_shp(myHoles[i],100, 100, 100, True)
                    self.newShapes.append((AnotherShape,"Common"+str(currentIndex),aColor))
                    self.moveArrays.append((0, 0, 0))
                    print ("Common"+str(currentIndex))
                    #shapesdim.append(xmins+xmove+xt, ymins+ymove+xt, zmins+zmove+xt, xmaxs+xmove+xt, ymaxs+ymove+xt, zmaxs+zmove+xt)
                    self.shapeorder.append(currentIndex)
                    currentIndex +=1
        currenttime=datetime.utcnow()
        
        dictionary = self.writeToGltfFile(sourceFileName,distancegap,anglegap,animationtime,starttime,currenttime,lenShape)  
        print(sourceFileName,distancegap,anglegap,animationtime,starttime,currenttime,lenShape)
        try:
            if self.logging != None and self.byThread:
                self.logging.info("Completed thread assembling"+sourceFileName) 
            else:
                return dictionary
        except Exception as e:
            print("Error while logging",e)
         

    def ExplodeParts(self,sourceFileName,distancegap,anglegap,animationtime,displaypath="",bythread=True,starttime=None,debugMe=False):
        self.displaypath=displaypath
        """  head, tail = os.path.split(sourceFileName)
        if(head[:-1]!="/"):
            print("Head does not contain last /",head)
            head = head + "/"
        else:
            print("Head contains last /",head)
        if head[0:6]=="Media/":
            self.displaypath = "Display/"+head[6:]
        else:
            self.displaypath = head """
        #print("ExploreParts",shapeTol,gapTol)
        self.byThread=bythread
        if starttime==None:
            starttime=datetime.utcnow()
        dictionary={}
        try:
            self.InitExplodeParts(debugMe)
            currenttime=datetime.utcnow()             
            if bythread:
                dictionary=self.writeToGltfFile(sourceFileName,distancegap,anglegap,animationtime,starttime,currenttime,0)                
                mythread = threading.Thread(target=self.threadAssembling,\
                    args=(sourceFileName,distancegap,anglegap,animationtime,starttime,dictionary["store"],debugMe))
                mythread.start()
            else:
                dictionary = self.threadAssembling(sourceFileName,distancegap,anglegap,animationtime,starttime,None,debugMe)       
        except Exception as e:
            print("Error in Exploding Parts",e)  
        #if not bythread: 
        #    return dictionary

    def getDirection(self,direction):
        if direction=="Top":
            return (0,0,1)
        elif direction=="Bottom":
            return (0,0,-1)
        elif direction=="Right":
            return (0,1,0)
        elif direction=="Left":
            return (0,-1,0)   
        elif direction=="Back":
            return (1,0,0)
        elif direction=="Front":
            return (-1,0,0)
        else:
            return(0,0,0)
    
    def reChangeOrder(self,changedshapeorder,changedshapedirection,sourceFileName,distancegap,anglegap,animationtime,debugMe=False):
        
        starttime=datetime.utcnow()
        dictionary={}
        self.byThread=False
        self.InitExplodeParts(debugMe)
        lenShape = len(self.shapesArray)
        xmin, ymin, zmin, xmax, ymax, zmax = self.dimension 
        xc, yc, zc = (xmin+xmax)/2, (ymin+ymax)/2 , (zmin+zmax)/2
        if(self.center):    
           
            lenShape = len(self.shapesArray)
            Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax = self.shapesoriginaldimension[0] 
            self.shapesordereddirection[0] = changedshapedirection[0]  
            self.shapeorder[0]=changedshapeorder[0]
            for i in range(1,lenShape):
                xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = self.shapesoriginaldimension[i]
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
                self.shapesordereddirection[i] = changedshapedirection[i] 
                self.shapeorder[i]=changedshapeorder[i]  
             
            #xminp, yminp, zminp, xmaxp, ymaxp, zmaxp = Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax
            #shiftX,shiftY,shiftZ = 0,0,0   
            #prevX, prevY, prevZ = 0,0,0   
            previousaxis=(0,1,0)
            previousdistance = 0
            for i  in range(lenShape):
               
                #xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = get_bounding_details(aShape) 
                myIndex = self.shapeorder[i]
               
                (newShape,aName,aColor) = self.newShapes[myIndex+1]
                direction = self.shapesordereddirection[i]
                self.shapesdirection[myIndex]=direction

                xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = self.shapesoriginaldimension[myIndex]
                (aaShape,aaName,aaColor) = self.shapesColorArray[myIndex]
                print(aaName)
                axisdirection,lastposition = self.shapesdirection[myIndex]
                if axisdirection==None:
                    axisdirection = previousaxis
                if lastposition!=None:                     
                    lastcenterx, lastcentery, lastcenterz, outerCheckValue = lastposition
                    if outerCheckValue==1:
                        outergap = self.explodegap*2*i
                    else:
                        outergap = self.explodegap
                    _,_,(currentcenterx,currentcentery,currentcenterz),_,_ = self.directiondata[myIndex]
                    distance = math.sqrt((currentcenterx-lastcenterx)*(currentcenterx-lastcenterx)+\
                        (currentcentery-lastcentery)*(currentcentery-lastcentery)+\
                            (currentcenterz-lastcenterz)*(currentcenterz-lastcenterz)) + outergap
                else:
                    distance = previousdistance + 4*self.explodegap
                ax,ay,az=axisdirection
                xmove,ymove,zmove = ax*distance, ay*distance, az*distance

                self.moveArrays[myIndex]=(xmove, ymove, zmove)
                previousaxis=ax,ay,az
                previousdistance=distance
                print(axisdirection,i,myIndex,self.shapeorder[i],\
                    (xmove, ymove, zmove),  aName,\
                        (xmins, ymins, zmins, xmaxs, ymaxs, zmaxs)) 
                """ if (direction==(0,0,0)) :
                    if (prevX==0) and (prevY==0) and (prevZ==0):
                        directionX,directionY,directionZ = 0, 0, 1
                    else:
                        directionX,directionY,directionZ = prevX, prevY, prevZ 
                else:
                    directionX,directionY,directionZ = direction
                    prevX, prevY, prevZ = directionX,directionY,directionZ
                
                if directionZ==1: 
                    xmove,ymove,zmove = self.getMoveXYZ(myIndex,direction, zmaxp + self.explodegap) 
                    zmaxp = zmove + (zmaxs-zmins)
                if directionZ==-1:
                    xmove,ymove,zmove = self.getMoveXYZ(myIndex,direction, zminp - (zmaxs-zmins+self.explodegap)) 
                    zminp = zmove
                if directionX==1: 
                    xmove,ymove,zmove = self.getMoveXYZ(myIndex,direction, xmaxp + self.explodegap) 
                    xmaxp = xmove + (xmaxs-xmins)
                if directionX==-1:
                    xmove,ymove,zmove = self.getMoveXYZ(myIndex,direction, xminp - (xmaxs-xmins+self.explodegap)) 
                    xminp = xmove
                if directionY==1: 
                    xmove,ymove,zmove = self.getMoveXYZ(myIndex,direction, ymaxp + self.explodegap) 
                    ymaxp = ymove + (ymaxs-ymins)
                if directionY==-1:
                    xmove,ymove,zmove = self.getMoveXYZ(myIndex,direction, yminp - (ymaxs-ymins+self.explodegap))
                    yminp = ymove """
                
                self.moveArrays[myIndex]=(xmove, ymove, zmove)
                finalShape=translate_shp(newShape,xmove, ymove, zmove, True) 
                #self.printOBB(myIndex)
                print(direction,i,myIndex, (xmove, ymove, zmove),  aName,\
                        (xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))  
                self.newShapes[myIndex+1] = (finalShape,aName,aColor)    
                
        currenttime=datetime.utcnow()
        
        dictionary = self.writeToGltfFile(sourceFileName,distancegap,anglegap,animationtime,starttime,currenttime,lenShape)  
        print(sourceFileName,distancegap,anglegap,animationtime,starttime,currenttime,lenShape,self.shapeorder)
        try:
            if self.logging != None and self.byThread:
                self.logging.info("Completed thread assembling"+sourceFileName) 
        except Exception as e:
            print("Error while logging",e)
        return dictionary 
    

  
    