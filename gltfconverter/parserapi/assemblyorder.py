

from .structparts.structquery.occ_impl import OCPStepIGESAnalyser
from .structparts.structquery.occ_impl.gltfDictionary import gltfdict
from .structparts.structquery.occ_impl.OCCExtend.ShapeFactory import (translate_shp, get_bounding_details, scale_shape)
#from OCC.Core.gp import gp_Pnt 
#from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Common
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
from .structparts.structquery.occ_impl.OCCExtend.TopologyUtils import list_of_shapes_to_compound
from datetime import datetime
import threading
import json
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
            try:
                aColor = Quantity_Color(0, 0, 1, Quantity_TOC_RGB)
                if commonHoleShape:
                    colorfile = "Display/"+"MyShapeCommon"+suffix+"_COLOR.step"  
                    try:                           
                        OCPStepIGESAnalyser.StepExportWithColor(shape=commonHoleShape,color=aColor,name="MyShapeCommon").write_file(filename=colorfile)
                    except Exception as e:
                        print(e,"File, %s has error" % colorfile)     
                colorfile = "Display/"+"MyShapeCompound"+suffix+"_COLOR.step"  
                if myShapeInner:                           
                    try:

                        OCPStepIGESAnalyser.StepExportWithColor(shape=myShapeInner,color=aColor,name="MyShapeCompound").write_file(filename=colorfile)
                    except Exception as e:
                        print(e,"File, %s has error" % colorfile) 
                colorfile = "Display/"+"MyShapeOuter"+suffix+"_COLOR.step"  
                if tranShape:                           
                    try:

                        OCPStepIGESAnalyser.StepExportWithColor(shape=tranShape,color=aColor,name="MyShapeOuter").write_file(filename=colorfile)
                    except Exception as e:
                        print(e,"File, %s has error" % colorfile) 
                colorfile = "Display/"+"MyShapeInner"+suffix+"_COLOR.step"                             
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
                colorfile = "Display/"+"MyShapeMergedX"+suffix+"_COLOR.step"                             
                try:
                    OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapex,color=aColor,name="MyShapeMergedX").write_file(filename=colorfile)
                except Exception as e:
                    print(e,"File, %s has error" % colorfile) 
                shapey=[myCommonShape,myShapeOuter]
                fullShapey,_ = list_of_shapes_to_compound(shapey)
                colorfile = "Display/"+"MyShapeOriginal"+suffix+"_COLOR.step"                             
                OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapey,color=aColor,name="MyShapeOriginal").write_file(filename=colorfile)
                shapez=[commonHoleShape,myCommonShapez,tranShapez]
                fullShapez,_ = list_of_shapes_to_compound(shapez)
                colorfile = "Display/"+"MyShapeMergedZ"+suffix+"_COLOR.step"                             
                try:
                    OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapez,color=aColor,name="MyShapeMergedZ").write_file(filename=colorfile)
                except Exception as e:
                    print(e,"File, %s has error" % colorfile) 
                shapeyz=[myCommonShape,tranShape]
                fullShapeyz,_ = list_of_shapes_to_compound(shapeyz)
                colorfile = "Display/"+"MyShapeTrans"+suffix+"_COLOR.step"                             
                try:
                    OCPStepIGESAnalyser.StepExportWithColor(shape=fullShapeyz,color=aColor,name="MyShapeTransT").write_file(filename=colorfile)
                except Exception as e:
                    print(e,"File, %s has error" % colorfile)                            
            except Exception as e:
                print(e,"File, %s has Outer error" % colorfile) 
            except:
                print(e,"Some Exceptions") 
   
    def checkCommonHoleInDirection(self, myShapeOuter,myOuterDimension, myShapeInner,myInnerDimension, direction, toBeScaled, debugMe=False):
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
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)                 
                while ( (holeFound==True) and ( (zminn+zmino) <= zmaxc) ):
                    zminn += self.removegap
                    #print("Reached here1c") 
                    tranShape = translate_shp(myShapeOuter,0,0,zminn,True) 
                    #print("Reached here1d") 
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)   
                    #print("Reached here1e")
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,\
                                xmaxo-xmino+4*self.explodegap,0,0,"Top",debugMe)  
                if (holeFound==True) :
                    if debugMe:
                        print("Only holes From Bottom To Top",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,\
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
                    #print("Reached here2b") 
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)       
                while ( (holeFound==True) and ( (zmaxn+zmaxo) >= zminc) ):
                    zmaxn -= self.removegap
                    #print("Reached here2c")
                    tranShape = translate_shp(myShapeOuter,0,0,zmaxn,True)   
                    #print("Reached here2d") 
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)   
                    #print("Reached here2e") 
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,\
                                xmaxo-xmino+4*self.explodegap,0,0,"Bottom",debugMe)  
                if holeFound==True:
                    if debugMe:
                        print("Only holes From Top To Bottom",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,\
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
                    #print("Reached here3b")    
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)                
                while ( (holeFound==True) and ( (xminn+xmino) <= xmaxc) ):
                    xminn += self.removegap
                    #print("Reached here3c")
                    tranShape = translate_shp(myShapeOuter,xminn,0,0,True)
                    #print("Reached here3d")    
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)   
                    #print("Reached here3e") 
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,0,0,\
                                zmaxo-zmino+4*self.explodegap,"Back",debugMe)                     
                        
                if (holeFound==True) :
                    if debugMe:
                        print("Only holes From Front To Back",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,0,0,\
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
                    #print("Reached here4b")    
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)    
                while ( (holeFound==True) and ( (xmaxn+xmaxo) >= xminc) ):
                    xmaxn -= self.removegap
                    #print("Reached here4c")
                    tranShape = translate_shp(myShapeOuter,xmaxn,0,0,True)
                    #print("Reached here4d")    
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)   
                    #print("Reached here4e") 
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,0,0,\
                                zmaxo-zmino+4*self.explodegap,"Front",debugMe)                      
                        
                if holeFound==True:
                    if debugMe:
                        print("Only holes From Back To Front",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,0,0,\
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
                    #print("Reached here5b")    
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)                
                while ( (holeFound==True) and ( (yminn+ymino) <= ymaxc) ):
                    yminn += self.removegap
                    #print("Reached here5c")
                    tranShape = translate_shp(myShapeOuter,0,yminn,0,True)
                    #print("Reached here5d")    
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)   
                    #print("Reached here5e") 
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,\
                                xmaxo-xmino+4*self.explodegap,0,0,"Right",debugMe)  
                if (holeFound==True) :
                    if debugMe:
                        print("Only holes From Left To Right",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,\
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
                    #print("Reached here6b")    
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)      
                while ( (holeFound==True) and ( (ymaxn+ymaxo) >= yminc) ):
                    ymaxn -= self.removegap
                    #print("Reached here6c")
                    tranShape = translate_shp(myShapeOuter,0,ymaxn,0,True)
                    #print("Reached here6d")    
                    holeFound, commonHoleShape = self.checkAnyHole(tranShape,myCommonShape,toBeScaled,debugMe)   
                    #print("Reached here6e")
                    myCount += 1
                    if ( ( ( (myCount % 10) == 0) or (holeFound==False)) and debugMe ):
                        print("Holes only found so far",myCount,holeFound)
                        if (debugMe and holeFound==False):                       
                            self.writeForDebugging(commonHoleShape,tranShape,myCommonShape,myShapeOuter,myShapeInner,\
                                xmaxo-xmino+4*self.explodegap,0,0,"Left",debugMe)                             
                            
                if holeFound==True:
                    if debugMe:
                        print("Only holes From Right To Left",get_bounding_details(myBox),myInnerDimension,myHoleDimension)
                        self.writeForDebugging(myBox,tranShape,myCommonShape,myShapeOuter,myShapeInner,\
                            xmaxo-xmino+4*self.explodegap,0,0,"Left",debugMe)                          
                            
                    return True, (0,-1,0) 
            else:
                if debugMe:
                    print("Away From Right to Left")
                return True, (0,-1,0) 
        
        return holeFound, (0,0,0)

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
        
    def checkCommonHole(self,orderpos,orderlast,toBeScaled,myGuessDirections,debugMe=False):
        #return True, None
        myShapeOuter=self.shapesArray[self.shapeorder[orderpos]]
        myOuterDimension = self.shapesdimension[orderpos]
        #myScaledShapeOuter, myScaledShapeDimension = self.scaledshapes[self.shapeorder[orderpos]]
        lenDirections = len(myGuessDirections)
        
        for i in range(0,lenDirections):
            (direction,_),_ = myGuessDirections[i]
            #allPartsHoleFound=True
            myShapes = []
            for iPos in range(len(self.shapesArray)-orderlast+1):                
                if (iPos!=orderpos):
                    coliding = self.isColliding(myOuterDimension,self.shapesdimension[iPos],direction)                   
                    if(coliding):
                        if debugMe:
                            print("Adding to Find Collisions",iPos,self.shapeorder[iPos],"For",orderpos,self.shapeorder[orderpos],"In",direction, "At pass",orderlast)
                        myShapes.append(self.shapesArray[self.shapeorder[iPos]])                        
                    else:
                        if debugMe:
                            print("Not Adding to Find Collisions",iPos,self.shapeorder[iPos],"For",orderpos,self.shapeorder[orderpos],"In",direction, "At pass",orderlast)
                                
            if(len(myShapes)==0):
                return True, direction 
            if(len(myShapes)==1):
                myShapeInner=myShapes[0]
            else:
                myShapeInner,_ = list_of_shapes_to_compound(myShapes)
            myInnerDimension = get_bounding_details(myShapeInner)
            holeFound, result =  self.checkCommonHoleInDirection(myShapeOuter,myOuterDimension, myShapeInner,myInnerDimension,\
                direction,toBeScaled,debugMe)
            if debugMe:
                print("Found Holes :",holeFound,result,direction,orderpos,self.shapeorder[orderpos],"In",direction, "At pass",orderlast,toBeScaled)
            if holeFound==True:
                return True, direction
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
                print("No Holes found in all directions","For",orderpos,self.shapeorder[orderpos],"In",direction, "At pass",orderlast, toBeScaled)
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
        if testMe:
            for i in [9,10,11,15,16]:
                self.shapesColorArray.append(self.shapeColorArray[i])
                self.shapesArray.append(self.shapeArray[i])
        else:
            self.shapesColorArray=self.shapeColorArray
            self.shapesArray=self.shapeArray
        lenShape = len(self.shapesArray)
        self.newShapes=[]
        self.moveArrays=[]
        self.shapesdirection=[]
        self.shapereverseorder=[]
        self.shapeassembleorder=[]
        self.shapeorder=[] 

        self.shapesdistance=[]
        self.shapesvolume=[]               
        self.shapesdimension=[]
        self.shapesmove=[]
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
        for i  in range(lenShape):
            (aShape,aName,aColor) = self.shapesColorArray[i]
            xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = get_bounding_details(aShape) 
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
            self.shapereverseorder.append(i)
            self.shapeassembleorder.append(i)
            self.shapesdirection.append((0,0,0))
            self.shapesmove.append((xmove, ymove, zmove))
            self.shapesdistance.append( ((xmins+xmaxs)/2+xmove-xc)**2+((ymins+ymaxs)/2+ymove-yc)**2+((zmins+zmaxs)/2+zmove-zc)**2 )
            self.shapesvolume.append(abs((xmaxs-xmins)*(ymaxs-ymins)*(zmaxs-zmins)))         
            self.shapesdimension.append((xmins, ymins, zmins, xmaxs, ymaxs, zmaxs))  
        k=1
        for i in range(0,lenShape-k):
            #swapper = False
            for j in range(0,lenShape-k-i):
                if(( (self.shapesdistance[j+1] < self.shapesdistance[j]) or \
                    ((self.shapesdistance[j+1] == self.shapesdistance[j]) and (self.shapesvolume[j+1] < self.shapesvolume[j]))  ) ):
                    #if(swapper):
                    self.shapeorder[j+1], self.shapeorder[j] = swap(self.shapeorder[j+1], self.shapeorder[j])                
                    self.shapesmove[j+1], self.shapesmove[j] = swap(self.shapesmove[j+1], self.shapesmove[j])
                    self.shapesdistance[j+1], self.shapesdistance[j] = swap(self.shapesdistance[j+1], self.shapesdistance[j])
                    self.shapesvolume[j+1], self.shapesvolume[j] = swap(self.shapesvolume[j+1], self.shapesvolume[j])
                    self.shapesdimension[j+1], self.shapesdimension[j] = swap(self.shapesdimension[j+1], self.shapesdimension[j])
        
        #self.cacheCollisionBetweenParts = [[[None for k in range(lenShape)] for j in range(lenShape)] for i in range(len(self.sixdirections))]
        print(lenShape,self.shapeorder,self.shapesdistance,self.shapesvolume,self.shapesdimension)#,self.scaledshapes)

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
                orderfile = "Display/"+dictionary["store"]+".order"
                print("Writing,",orderfile)
                with open(orderfile, 'w') as fh:
                    fh.write(json.dumps(dictionary["assemblyorder"], sort_keys=True, indent=2 ))
            except Exception as e:
                print("Error while writing orderfile",e) 
        except Exception as e:
                print("Error while writing orderfile",e) 
        return dictionary

    def guessDirections(self,checkingDimension,fullDimension,debugMe=False):
        xmin, ymin, zmin, xmax, ymax, zmax = fullDimension
        xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = checkingDimension
        myDirections=[]       
        myDirections.append((self.sixdirections[0],zmax-zmaxs))
        myDirections.append((self.sixdirections[1],zmins-zmin))
        myDirections.append((self.sixdirections[2],ymax-ymaxs))
        myDirections.append((self.sixdirections[3],ymins-ymin))
        myDirections.append((self.sixdirections[4],xmax-xmaxs))
        myDirections.append((self.sixdirections[5],xmins-xmin))
        lenDirections = len(myDirections)
        if debugMe:
            print("Before Guess",myDirections,checkingDimension,fullDimension)
        for i in range(0,lenDirections-1):           
            for j in range(0,lenDirections-1-i):
                _,length1 = myDirections[j+1]
                _,length = myDirections[j]
                if(length > length1) :
                    myDirections[j+1], myDirections[j] = swap(myDirections[j+1],myDirections[j])
        if debugMe:
            print("After Guess",myDirections)
        return myDirections
    def threadAssembling(self,sourceFileName,distancegap,anglegap,animationtime,starttime,debugMe):
        try:
            if self.logging != None and self.byThread:
                self.logging.info("Started thread assembling") 
        except Exception as e:
            print("Error while logging",e)
        if(self.center):    
            
            
            previoustime = starttime # current date and time
            

            lenShape = len(self.shapeArray)
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
            k = 1
            commonObjects=[]
            #Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax = self.dimension
            while k < lenShape:
                currenttime = datetime.now()
                timingdelta = currenttime-previoustime
                if timingdelta.seconds > 5:
                    dictionary = self.writeToGltfFile(sourceFileName,distancegap,anglegap,animationtime,starttime,currenttime,k)  
                    previoustime=currenttime
                
                if k!=1 :
                    for i in range(0,lenShape-k):
                        #swapper = False
                        for j in range(0,lenShape-k-i):
                            if(( (self.shapesdistance[j+1] < self.shapesdistance[j]) or \
                                ((self.shapesdistance[j+1] == self.shapesdistance[j]) and (self.shapesvolume[j+1] < self.shapesvolume[j]))  ) ):
                                #if(swapper):
                                self.shapeorder[j+1], self.shapeorder[j] = swap(self.shapeorder[j+1], self.shapeorder[j])                
                                self.shapesmove[j+1], self.shapesmove[j] = swap(self.shapesmove[j+1], self.shapesmove[j])
                                self.shapesdistance[j+1], self.shapesdistance[j] = swap(self.shapesdistance[j+1], self.shapesdistance[j])
                                self.shapesvolume[j+1], self.shapesvolume[j] = swap(self.shapesvolume[j+1], self.shapesvolume[j])
                                self.shapesdimension[j+1], self.shapesdimension[j] = swap(self.shapesdimension[j+1], self.shapesdimension[j])
                enclosed = False
                myDirectionAtZero=(0,0,0)
                
                for holesize in range(0,2):
                    if holesize == 0:
                        toBeScaled = self.holescale
                    else:
                        toBeScaled = self.holescale / 1.1
                    for i in range(0,lenShape-k+1):                
                        j=lenShape-k-i
                        debugMe = True # k==1 and i==0 #True #k==1 and i==4 #True #(k==3) and (i==0) #True #shapeorder[j]==2 or shapeorder[j]==3
                        if debugMe:
                            print(k,j,self.shapeorder[j],self.shapeorder,toBeScaled,currenttime,self.dimension,(Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax))
                        myGuessDirections = self.guessDirections(self.shapesdimension[j], (Xxmin, Yymin, Zzmin, Xxmax, Yymax, Zzmax),debugMe)
                        #myExcludeCompound = excluded_list_of_shapes_to_compound(shapesArray,shapeorder,j,k,False)
                        #myExcludeDimension = get_bounding_details(myExcludeCompound)
                        #print("My Shape TOl, Gap Tol",shapeTol,gapTol)
                        myCommonCompound,myHoles=None,None
                        #enclosed,_,myDirection, myCommonCompound,myHoles = isRemovable(shape[shapeorder[j]],shapesdim[j],myExcludeCompound,myExcludeDimension,shapeTol,gapTol,debugMe)
                        enclosed,myDirection = self.checkCommonHole(j,k,toBeScaled,myGuessDirections,debugMe) 
                        #print(k,i,j,shapeorder[j],enclosed,myExcludeDimension,lenShape-k)
                        if myDirectionAtZero==(0,0,0):
                            myDirectionAtZero=myDirection
                        if (enclosed):
                            self.shapesdirection[self.shapeorder[j]]=myDirection
                            if(myCommonCompound!=None and debugMe ):
                                commonObjects.append((myCommonCompound,self.shapeorder[j], myHoles))
                            if (j!=(lenShape-k)):
                                j1=lenShape-k
                                self.shapeorder[j1], self.shapeorder[j] = swap(self.shapeorder[j1], self.shapeorder[j])                
                                self.shapesmove[j1], self.shapesmove[j] = swap(self.shapesmove[j1], self.shapesmove[j])
                                self.shapesdistance[j1], self.shapesdistance[j] = swap(self.shapesdistance[j1], self.shapesdistance[j])
                                self.shapesvolume[j1], self.shapesvolume[j] = swap(self.shapesvolume[j1], self.shapesvolume[j])
                                self.shapesdimension[j1], self.shapesdimension[j] = swap(self.shapesdimension[j1], self.shapesdimension[j])                    
                            print(k,i,j,self.shapeorder[lenShape-k],enclosed,myDirection,lenShape-k,toBeScaled)
                            break
                        else:
                            #if debugMe:
                            print(k,i,j,self.shapeorder[j],enclosed,lenShape-k,toBeScaled)
                            if(myCommonCompound!=None and debugMe):
                                commonObjects.append((myCommonCompound,self.shapeorder[j],myHoles))
                    if enclosed:
                        print("In", holesize, "Pass able to remove",k)
                        break  
                    else:
                        (aShape,aName,aColor) = self.shapesColorArray[self.shapeorder[lenShape-k]]
                        print("No objects can be removed",k,"When hole size is",toBeScaled,"For", aName)                
                                          
                if enclosed==False:
                    (aShape,aName,aColor) = self.shapesColorArray[self.shapeorder[lenShape-k]]
                    print("No objects can be removed",k,"Removing part forcefully largest distant from center",aName)                
                    
                    #if myDirectionAtZero==(0,0,0):
                    if (k!=1) :                    
                        self.shapesdirection[self.shapeorder[lenShape-k]]=self.shapesdirection[self.shapeorder[lenShape-k+1]]

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
                xc, yc, zc = (Xxmin+Xxmax)/2, (Yymin+Yymax)/2 , (Zzmin+Zzmax)/2
                #print("before",xc,yc,zc,k, shapesdis)
                for i in range(0,lenShape-k):
                    xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = self.shapesdimension[i]
                    xmove, ymove, zmove = self.shapesmove[i]
                    self.shapesdistance[i]= ((xmins+xmaxs)/2+xmove-xc)**2+((ymins+ymaxs)/2+ymove-yc)**2+((zmins+zmaxs)/2+zmove-zc)**2 
                k += 1
            if(lenShape>1):
                self.shapesdirection[self.shapeorder[0]]=self.shapesdirection[self.shapeorder[1]]
            
            for i  in range(lenShape):
                self.shapereverseorder[self.shapeorder[i]] = i
            for i  in range(lenShape):
                self.shapeassembleorder[self.shapereverseorder[i]] = i
            for i  in range(lenShape):
                print(i,self.shapeassembleorder[i],self.shapesdirection[self.shapeassembleorder[i]])
            xmin, ymin, zmin, xmax, ymax, zmax = self.dimension 
            xc, yc, zc = (xmin+xmax)/2, (ymin+ymax)/2 , (zmin+zmax)/2
            xminp, yminp, zminp, xmaxp, ymaxp, zmaxp = self.dimension
            #shiftX,shiftY,shiftZ = 0,0,0   
            prevX, prevY, prevZ = 0,0,0   
            for i  in range(lenShape):
                #(aShape,aName,aColor) = shapeArray[i]
                #xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = get_bounding_details(aShape) 
            
                (bShape,bName,bColor) = self.shapesColorArray[self.shapeassembleorder[i]]
                (newShape,aName,aColor) = self.newShapes[self.shapeassembleorder[i]+1]
                direction = self.shapesdirection[self.shapeassembleorder[i]]
                xmins, ymins, zmins, xmaxs, ymaxs, zmaxs = self.shapesdimension[self.shapereverseorder[self.shapeassembleorder[i]]]
                
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
                    zmove = zmaxp + self.explodegap
                    zmaxp = zmove + (zmaxs-zmins)
                if directionZ==-1:
                    xmove = 0
                    ymove = 0
                    zmove = zminp - (zmaxs-zmins+self.explodegap)
                    zminp = zmove
                if directionX==1: 
                    xmove = xmaxp + self.explodegap
                    ymove = 0
                    zmove = 0
                    xmaxp = xmove + (xmaxs-xmins)
                if directionX==-1:
                    xmove = xminp - (xmaxs-xmins+self.explodegap)
                    ymove = 0
                    zmove = 0
                    xminp = xmove
                if directionY==1: 
                    xmove = 0
                    ymove = ymaxp + self.explodegap
                    zmove = 0
                    ymaxp = ymove + (ymaxs-ymins)
                if directionY==-1:
                    xmove = 0
                    ymove = yminp - (ymaxs-ymins+self.explodegap)
                    zmove = 0
                    yminp = ymove
                
                self.moveArrays[self.shapeassembleorder[i]]=(xmove, ymove, zmove)
                finalShape=translate_shp(newShape,xmove, ymove, zmove, True) 
                
                print(direction,i,self.shapeassembleorder[i],self.shapereverseorder[self.shapeassembleorder[i]],\
                    (xmove, ymove, zmove),  aName,bName,\
                        (xmins, ymins, zmins, xmaxs, ymaxs, zmaxs),get_bounding_details(bShape))  
                self.newShapes[self.shapeassembleorder[i]+1] = (finalShape,aName,aColor)    
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
        currenttime=datetime.now()
        
        dictionary = self.writeToGltfFile(sourceFileName,distancegap,anglegap,animationtime,starttime,currenttime,lenShape)  
        print(sourceFileName,distancegap,anglegap,animationtime,starttime,currenttime,lenShape)
        try:
            if self.logging != None and self.byThread:
                self.logging.info("Completed thread assembling") 
        except Exception as e:
            print("Error while logging",e)
        return dictionary 

    def ExplodeParts(self,sourceFileName,distancegap,anglegap,animationtime,bythread=True,debugMe=False):
        #print("ExploreParts",shapeTol,gapTol)
        self.byThread=bythread
        starttime=datetime.now()
        dictionary={}
        try:
            self.InitExplodeParts(debugMe)
            currenttime=datetime.now()             
            if bythread:
                dictionary=self.writeToGltfFile(sourceFileName,distancegap,anglegap,animationtime,starttime,currenttime,0)                
                mythread = threading.Thread(target=self.threadAssembling,args=(sourceFileName,distancegap,anglegap,animationtime,starttime,debugMe))
                mythread.start()
            else:
                dictionary = self.threadAssembling(sourceFileName,distancegap,anglegap,animationtime,starttime,debugMe)       
        except Exception as e:
            print("Error in Exploding Parts",e)   
        return dictionary
        
  

  
    