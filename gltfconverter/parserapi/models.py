#from django.db import models
from djongo import models
#from djongo.models.indexes import TextIndex
from .enums import ChildCreationStatus

class File(models.Model):
    file = models.FileField(blank=True, default=None)
    filename = models.CharField(max_length=80, default=None)  
    
    def __str__(self):
        return self.file.name
class ParsingDetails(models.Model):
    _id = models.ObjectIdField()
    name = models.CharField(max_length=80, default=None)  
    filename = models.CharField(max_length=80, default=None) 
    external_id=models.IntegerField(default=1)
    external_ref=models.CharField(max_length=255,default=None)
    tab_suffix=models.CharField(max_length=2,default=None)
    assemblies=models.IntegerField(default=0)
    trees=models.IntegerField(default=0)
    parts=models.IntegerField(default=0)
    faces=models.IntegerField(default=0)
    edges=models.IntegerField(default=0)
    vertices=models.IntegerField(default=0)
    sx=models.FloatField(default=0)
    sy=models.FloatField(default=0)
    sz=models.FloatField(default=0)
    cx=models.FloatField(default=0)
    cy=models.FloatField(default=0)
    cz=models.FloatField(default=0)
    rx=models.FloatField(default=0)
    ry=models.FloatField(default=0)
    rz=models.FloatField(default=0)
    obb_position=models.JSONField(blank=True, default={})
    obb_origin=models.JSONField(blank=True, default={})
    obb_rotated=models.JSONField(blank=True, default={})
    zerostep = models.CharField(max_length=255, default=None)
    internal_object=models.JSONField(blank=True, default={})
    percent=models.FloatField(default=0)
    start=models.CharField(max_length=10,default=None)
    current=models.CharField(max_length=10,default=None)
    action=models.CharField(max_length=80,default=None)
    finish=models.CharField(max_length=10,default=None)
    reset=models.CharField(max_length=10,default=None)
    assembly=models.CharField(max_length=255, default=None)
    s3storage=models.BooleanField(default=False)    
    matched_across=models.JSONField(blank=True, default=[])
    comparetotal=models.IntegerField(default=0)
    comparesub=models.IntegerField(default=0)
    comparepercent=models.FloatField(default=0)
    objects = models.DjongoManager()
    
    def __str__(self):
        return (self.name if self.name else '')+' '+(self.assembly+' '+str(self._id) if self.assembly else str(self._id))
    # class Meta:
    #     indexes = [
    #         TextIndex(fields=['external_ref'])
    #     ]
class ChildParsingDetails(models.Model):
    _id = models.ObjectIdField()
    name = models.CharField(max_length=80, default=None)  
    filename = models.CharField(max_length=80, default=None) 
    external_id=models.IntegerField(default=1)
    external_ref=models.CharField(max_length=255,default=None)
    begin=models.IntegerField(default=0)
    end=models.IntegerField(default=0)
    start=models.CharField(max_length=10,default=None)
    current=models.CharField(max_length=10,default=None)
    action=models.CharField(max_length=80,default=None)
    finish=models.CharField(max_length=10,default=None)
    reset=models.CharField(max_length=10,default=None)
    createchilds=models.BooleanField(default=False)
    createorder=models.BooleanField(default=False)
    createstack=models.BooleanField(default=False)
    childfiles=models.JSONField(blank=True, default=[])
    childpercent=models.FloatField(default=0)
    comparechild=models.IntegerField(default=0)
    comparesub=models.IntegerField(default=0)
    comparepercent=models.FloatField(default=0)
    objects = models.DjongoManager()
    
    def __str__(self):
        return (self.name+' '+str(self._id) if self.name else str(self._id))
    # class Meta:
    #     indexes = [
    #         TextIndex(fields=['external_ref'])
    #     ]
class EdgeParsingDetails(models.Model):
    _id = models.ObjectIdField()
    name = models.CharField(max_length=80, default=None)  
    filename = models.CharField(max_length=80, default=None) 
    external_id=models.IntegerField(default=1)
    external_ref=models.CharField(max_length=255,default=None)
    begin=models.IntegerField(default=0)
    end=models.IntegerField(default=0)
    start=models.CharField(max_length=10,default=None)
    current=models.CharField(max_length=10,default=None)
    action=models.CharField(max_length=80,default=None)
    finish=models.CharField(max_length=10,default=None)
    reset=models.CharField(max_length=10,default=None)    
    children=models.JSONField(blank=True, default={})
    objects = models.DjongoManager()
    
    def __str__(self):
        return (self.name+' '+str(self._id) if self.name else str(self._id))
    # class Meta:
    #     indexes = [
    #         TextIndex(fields=['external_ref'])
    #     ]
class ItemDetails(models.Model):
    _id = models.ObjectIdField()
    name = models.CharField(max_length=80, default=None)   
    filename = models.CharField(max_length=80, default=None)
    external_id=models.IntegerField(default=1)
    external_ref=models.CharField(max_length=255,default=None)
    fileId=models.CharField(max_length=255,default=None)
    fileUUId=models.CharField(max_length=255,default=None)
    fileName=models.CharField(max_length=255,default=None)
    fileStore=models.CharField(max_length=255,default=None)
    fileGDT=models.CharField(max_length=255,default=None)
    fileMPPS=models.CharField(max_length=255,default=None)
    fileStack=models.CharField(max_length=255,default=None)
    fileKinematic=models.CharField(max_length=255,default=None)
    distanceGap=models.FloatField(default=0.1) 
    angleGap=models.FloatField(default=0.1) 
    drawLine=models.BooleanField(default=False)
    stepTreeLength=models.IntegerField(default=0)
    parent_id=models.CharField(max_length=255,default=None)
    is_child_item=models.BooleanField(default=False)
    #child_item_status = models.TextChoices('ChildCreationStatus','INITIATED COMPLETED NOT_INITIATED',default='NOT_INITIATED')
    child_item_status = models.CharField(max_length=255,default='NOT_INITIATED',choices=ChildCreationStatus.choices())
    multiAssembly=models.BooleanField(default=False)
    filePartName=models.CharField(max_length=255,default=None)
    comparison_parameters=models.JSONField(blank=True, default={})
    matched_childs=models.JSONField(blank=True, default=[])    
    objects = models.DjongoManager()
    
    def __str__(self):
        return (self.name+' '+str(self._id) if self.name else str(self._id))
    # class Meta:
    #     indexes = [
    #         TextIndex(fields=['external_ref'])
    #     ]