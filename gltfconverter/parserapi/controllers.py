from .models import ParsingDetails, ChildParsingDetails, EdgeParsingDetails, ItemDetails
def convertToBool(value,default):    
    if value is not None:
        try:
            if isinstance(value,bool):
                return value
            if value.lower()=="true":
                return True
            else:
                if value.lower()=="false":
                    return False
                else:
                    boolvalue = bool(value)
                    return boolvalue
        except:
            return default
    else:
        return default

def convertToFloat(value,default):
    if value is not None:
        if isinstance(value,float) :
            return value
        try:
            floatValue = float(value)
            return floatValue
        except:
            return default
    else:
        return default

def convertToInt(value,default):    
    if value is not None:
        if isinstance(value,int):
            return value
        try:
            intValue = int(value)
            return intValue
        except:
            return default
    else:
        return default

def getValueFromJSONKey(jsonstruct, key):
    if jsonstruct is not None:
        if key is not None:
            if key in jsonstruct:
                return jsonstruct[key]            
    return None
    
def getNotNone(dict,default):
    return dict if dict is not None else default

class ParsingDetailsController():
    def __init__( self, alwaysNew=False ):
        
        self.alwaysNew = alwaysNew

    def s3update(self,storageSerializer,flag=True):
        try:
            if storageSerializer is not None:
                storageSerializer.obb_position=getNotNone(storageSerializer.obb_position,{})
                storageSerializer.obb_origin=getNotNone(storageSerializer.obb_origin,{})
                storageSerializer.obb_rotated=getNotNone(storageSerializer.obb_rotated,{})
                storageSerializer.internal_object={}
                storageSerializer.matched_across=getNotNone(storageSerializer.matched_across,[])
                storageSerializer.s3storage=flag
                storageSerializer.save()
            else:
                print("Not saving because record is none",storageSerializer)
        except Exception as e:
            print("Error while updating flag",e,storageSerializer)
    
    def s3TobeCopied(self):
        return ParsingDetails.objects.filter(s3storage=False,percent=100)       
    
    def identicalRecords(self,sx,sy,sz,vertices):
        return ParsingDetails.objects.filter(vertices=vertices,sx=sx,sy=sy,sz=sz)
    
    def save(self,statusDictionary,name,originalFileName,referenceID,tabSuffix):
        try:
            alwaysNew=self.alwaysNew
            storageData = {}
            storageData["external_ref"]=referenceID
            storageData["tab_suffix"]=tabSuffix if tabSuffix else 'PD'
            storageData["assemblies"]=convertToInt(getValueFromJSONKey(statusDictionary,"assemblies"),0)
            storageData["trees"]=convertToInt(getValueFromJSONKey(statusDictionary,"trees"),0)
            storageData["parts"]=convertToInt(getValueFromJSONKey(statusDictionary,"parts"),0)
            storageData["faces"]=convertToInt(getValueFromJSONKey(statusDictionary,"faces"),0)
            storageData["edges"]=convertToInt(getValueFromJSONKey(statusDictionary,"edges"),0)
            storageData["vertices"]=convertToInt(getValueFromJSONKey(statusDictionary,"vertices"),0)
            storageData["mass"]=convertToFloat(getValueFromJSONKey(statusDictionary,"mass"),0)
            storageData["obb_position"]=getValueFromJSONKey(statusDictionary,"obbPosition")
            storageData["obb_origin"]=getValueFromJSONKey(statusDictionary,"obbOrigin")
            storageData["obb_rotated"]=getValueFromJSONKey(statusDictionary,"obbRotated")
            storageData["matched"]=getValueFromJSONKey(statusDictionary,"matched")
            storageData["comparetotal"]=convertToInt(getValueFromJSONKey(statusDictionary,"comparetotal"),0)
            storageData["comparesub"]=convertToInt(getValueFromJSONKey(statusDictionary,"comparesub"),0)
            storageData["comparepercent"]=convertToFloat(getValueFromJSONKey(statusDictionary,"comparepercent"),0)
            cxcycz=getValueFromJSONKey(statusDictionary,"center")
            cx,cy,cz=0,0,0
            if cxcycz:
                cx, cy, cz = cxcycz         
            storageData["cx"],storageData["cy"],storageData["cz"] = convertToFloat(cx,0),convertToFloat(cy,0),convertToFloat(cz,0) 
            cxcycz=getValueFromJSONKey(statusDictionary,"rotation")
            rx,ry,rz=0,0,0
            if cxcycz:
                rx, ry, rz = cxcycz
            storageData["rx"],storageData["ry"],storageData["rz"] = convertToFloat(rx,0),convertToFloat(ry,0),convertToFloat(rz,0) 
            cxcycz=getValueFromJSONKey(statusDictionary,"obbRotated")
            sx,sy,sz=0,0,0
            if cxcycz:
                sx,sy,sz=getValueFromJSONKey(cxcycz,"sx"),getValueFromJSONKey(cxcycz,"sy"),getValueFromJSONKey(cxcycz,"sz")
            storageData["sx"],storageData["sy"],storageData["sz"]=convertToFloat(sx,0),convertToFloat(sy,0),convertToFloat(sz,0) 
            storageData["zerostep"]=getValueFromJSONKey(statusDictionary,"zerostep")
            storageData["percent"]=convertToFloat(getValueFromJSONKey(statusDictionary,"percent"),0)
            storageData["start"]=getValueFromJSONKey(statusDictionary,"start")
            storageData["current"]=getValueFromJSONKey(statusDictionary,"current")
            storageData["action"]=getValueFromJSONKey(statusDictionary,"action")
            storageData["finish"]=getValueFromJSONKey(statusDictionary,"finish")
            storageData["reset"]=getValueFromJSONKey(statusDictionary,"reset")
            storageData["assembly"]=getValueFromJSONKey(statusDictionary,"assembly")
            print("Before assinging serializer",storageData,referenceID,storageData["tab_suffix"])
            storageSerializers =[] 
            if referenceID:
                storageSerializers = ParsingDetails.objects.filter(external_ref=referenceID,tab_suffix=storageData["tab_suffix"])
            else:
                storageSerializers = ParsingDetails.objects.filter(filename=originalFileName,tab_suffix=storageData["tab_suffix"])        
            if((storageSerializers is not None) and len(storageSerializers)>0):
                print("Got Initial filter",storageSerializers)
                #storageSerializers = storageSerializers.filter(tab_suffix=storageData["tab_suffix"])
            storageSerializer=None
            if((storageSerializers is not None) and len(storageSerializers)==1) and (alwaysNew==False):
                storageSerializer=storageSerializers[0]
                print("Got storageAs",storageSerializer,storageSerializer.filename)            
            elif((storageSerializers is None) or len(storageSerializers)==0) or (alwaysNew):
                print("I could not get any data",ParsingDetails.objects.all())
                storageSerializer = ParsingDetails(external_ref=storageData["external_ref"],
                    tab_suffix=storageData["tab_suffix"])                    
            else:
                print("Returning Multiple Records",storageSerializers)
                return
            if storageSerializer:
                storageSerializer.name=name if name else originalFileName
                storageSerializer.filename=originalFileName
                storageSerializer.assemblies=storageData["assemblies"]
                storageSerializer.trees=storageData["trees"]
                storageSerializer.parts=storageData["parts"]
                storageSerializer.faces=storageData["faces"]
                storageSerializer.edges=storageData["edges"]
                storageSerializer.vertices=storageData["vertices"]
                storageSerializer.mass=storageData["mass"]
                storageSerializer.obb_position=getNotNone(storageData["obb_position"],{})
                storageSerializer.obb_origin=getNotNone(storageData["obb_origin"],{})
                storageSerializer.obb_rotated=getNotNone(storageData["obb_rotated"],{})
                storageSerializer.cx=storageData["cx"]
                storageSerializer.cy=storageData["cy"]
                storageSerializer.cz=storageData["cz"]            
                storageSerializer.rx=storageData["rx"]
                storageSerializer.ry=storageData["ry"]
                storageSerializer.rz=storageData["rz"]                 
                storageSerializer.sx=storageData["sx"]
                storageSerializer.sy=storageData["sy"]
                storageSerializer.sz=storageData["sz"]
                storageSerializer.zerostep=storageData["zerostep"]
                storageSerializer.percent=storageData["percent"]
                storageSerializer.start=storageData["start"]
                storageSerializer.current=storageData["current"]
                storageSerializer.action=storageData["action"]
                storageSerializer.finish=storageData["finish"]
                storageSerializer.reset=storageData["reset"]
                storageSerializer.assembly=storageData["assembly"]
                storageSerializer.internal_object={}
                storageSerializer.matched_across=getNotNone(storageData["matched"],[])
                storageSerializer.comparetotal=storageData["comparetotal"]
                storageSerializer.comparesub=storageData["comparesub"]
                storageSerializer.comparepercent=storageData["comparepercent"]
                storageSerializer.s3storage=False
                print("")
                print("Storage Serializer Head", storageSerializer, storageSerializer.matched_across,storageData["matched"], storageSerializer.filename)
                print("")
                storageSerializer.save()
            
        except Exception as e:
            print("Error while saving",e)
    
       
class ChildParsingDetailsController():
    def __init__( self, alwaysNew=False ):
        
        self.alwaysNew = alwaysNew

    def save(self,statusDictionary,name,originalFileName,referenceID,tabSuffix):
        try:
            alwaysNew=self.alwaysNew
            storageData = {}
            storageData["external_ref"]=referenceID
            storageData["tab_suffix"]=tabSuffix if tabSuffix else 'PD'
            storageData["begin"]=convertToInt(getValueFromJSONKey(statusDictionary,"begin"),0)
            storageData["end"]=convertToInt(getValueFromJSONKey(statusDictionary,"end"),0)
            storageData["start"]=getValueFromJSONKey(statusDictionary,"start")
            storageData["current"]=getValueFromJSONKey(statusDictionary,"current")
            storageData["action"]=getValueFromJSONKey(statusDictionary,"action")
            storageData["finish"]=getValueFromJSONKey(statusDictionary,"finish")
            storageData["reset"]=getValueFromJSONKey(statusDictionary,"reset")
            storageData["createchilds"]=convertToBool(getValueFromJSONKey(statusDictionary,"createchilds"),False)
            storageData["createorder"]=convertToBool(getValueFromJSONKey(statusDictionary,"createorder"),False)
            storageData["createstack"]=convertToBool(getValueFromJSONKey(statusDictionary,"createstack"),False)
            storageData["childfiles"]=getValueFromJSONKey(statusDictionary,"childfiles")
            storageData["childpercent"]=convertToFloat(getValueFromJSONKey(statusDictionary,"childpercent"),0)
            storageData["comparechild"]=convertToInt(getValueFromJSONKey(statusDictionary,"comparechild"),0)
            storageData["comparesub"]=convertToInt(getValueFromJSONKey(statusDictionary,"comparesub"),0)
            storageData["comparepercent"]=convertToFloat(getValueFromJSONKey(statusDictionary,"comparepercent"),0)
            print("Before assinging serializer",storageData,referenceID,storageData["tab_suffix"])
            storageSerializers =[] 
            if referenceID:
                storageSerializers = ChildParsingDetails.objects.filter(external_ref=referenceID)
            else:
                storageSerializers = ChildParsingDetails.objects.filter(filename=originalFileName)        
            if((storageSerializers is not None) and len(storageSerializers)>0):
                print("Got Initial filter",storageSerializers)
                #storageSerializers = storageSerializers.filter(tab_suffix=storageData["tab_suffix"])
            storageSerializer=None
            if((storageSerializers is not None) and len(storageSerializers)==1) and (alwaysNew==False):
                storageSerializer=storageSerializers[0]
                print("Got storageAs",storageSerializer)            
            elif((storageSerializers is None) or len(storageSerializers)==0) or (alwaysNew):
                print("I could not get any data",ChildParsingDetails.objects.all())
                storageSerializer = ChildParsingDetails(external_ref=storageData["external_ref"])                    
            else:
                print("Returning Multiple Records",storageSerializers)
                return
            if storageSerializer:
                storageSerializer.name=name if name else originalFileName
                storageSerializer.filename=originalFileName
                storageSerializer.begin=storageData["begin"]
                storageSerializer.end=storageData["end"]
                storageSerializer.start=storageData["start"]
                storageSerializer.current=storageData["current"]
                storageSerializer.action=storageData["action"]
                storageSerializer.finish=storageData["finish"]
                storageSerializer.reset=storageData["reset"]
                storageSerializer.createchilds=storageData["createchilds"]
                storageSerializer.createorder=storageData["createorder"]
                storageSerializer.createstack=storageData["createstack"]
                storageSerializer.childfiles=getNotNone(storageData["childfiles"],[])
                storageSerializer.childpercent=storageData["childpercent"]
                storageSerializer.comparechild=storageData["comparechild"]
                storageSerializer.comparesub=storageData["comparesub"]
                storageSerializer.comparepercent=storageData["comparepercent"]
            print("")
            print("Storage Serializer Head", storageSerializer, "Tail")
            print("")
            storageSerializer.save()
            
        except Exception as e:
            print("Error while saving",e)

class EdgeParsingDetailsController():
    def __init__( self, alwaysNew=False ):
        
        self.alwaysNew = alwaysNew

   
    def save(self,statusDictionary,name,originalFileName,referenceID,tabSuffix):
        try:
            alwaysNew=self.alwaysNew
            storageData = {}
            storageData["external_ref"]=referenceID
            storageData["tab_suffix"]=tabSuffix if tabSuffix else 'PD'
            storageData["begin"]=convertToInt(getValueFromJSONKey(statusDictionary,"begin"),0)
            storageData["end"]=convertToInt(getValueFromJSONKey(statusDictionary,"end"),0)
            storageData["start"]=getValueFromJSONKey(statusDictionary,"start")
            storageData["current"]=getValueFromJSONKey(statusDictionary,"current")
            storageData["action"]=getValueFromJSONKey(statusDictionary,"action")
            storageData["finish"]=getValueFromJSONKey(statusDictionary,"finish")
            storageData["reset"]=getValueFromJSONKey(statusDictionary,"reset")
            storageData["children"]=getValueFromJSONKey(statusDictionary,"children")
            print("Before assinging serializer",storageData,referenceID,storageData["tab_suffix"])
            storageSerializers =[] 
            if referenceID:
                storageSerializers = EdgeParsingDetails.objects.filter(external_ref=referenceID)
            else:
                storageSerializers = EdgeParsingDetails.objects.filter(filename=originalFileName)        
            if((storageSerializers is not None) and len(storageSerializers)>0):
                print("Got Initial filter",storageSerializers)
                #storageSerializers = storageSerializers.filter(tab_suffix=storageData["tab_suffix"])
            storageSerializer=None
            if((storageSerializers is not None) and len(storageSerializers)==1) and (alwaysNew==False):
                storageSerializer=storageSerializers[0]
                print("Got storageAs",storageSerializer)            
            elif((storageSerializers is None) or len(storageSerializers)==0) or (alwaysNew):
                print("I could not get any data",EdgeParsingDetails.objects.all())
                storageSerializer = EdgeParsingDetails(external_ref=storageData["external_ref"])                    
            else:
                print("Returning Multiple Records",storageSerializers)
                return
            if storageSerializer:
                storageSerializer.name=name if name else originalFileName
                storageSerializer.filename=originalFileName
                storageSerializer.begin=storageData["begin"]
                storageSerializer.end=storageData["end"]
                storageSerializer.start=storageData["start"]
                storageSerializer.current=storageData["current"]
                storageSerializer.action=storageData["action"]
                storageSerializer.finish=storageData["finish"]
                storageSerializer.reset=storageData["reset"]
                storageSerializer.children=getNotNone(storageData["children"],{})
            print("")
            print("Storage Serializer Head", storageSerializer, "Tail")
            print("")
            storageSerializer.save()
            
        except Exception as e:
            print("Error while saving",e)

class ItemDetailsController():
    def __init__( self, alwaysNew=False ):
        
        self.alwaysNew = alwaysNew

   
    def save(self,statusDictionary,originalFileName,referenceID,tabSuffix):
        pass


