#from django.db import models
from djongo import models

class File(models.Model):
    file = models.FileField(blank=True, default=None)
    filename = models.CharField(max_length=80, default=None)  
    
    def __str__(self):
        return self.file.name
class Storage(models.Model):
    _id = models.ObjectIdField()
    file = models.FileField(blank=True, default=None)
    name = models.CharField(max_length=80, default=None)   
    external_id=models.IntegerField(default=1)
    external_ref=models.CharField(max_length=255,default=None)
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
    obb_position=models.JSONField(blank=True, default=None)
    obb_origin=models.JSONField(blank=True, default=None)
    obb_rotated=models.JSONField(blank=True, default=None)
    zerostep = models.CharField(max_length=255, default=None)
    internal_object=models.JSONField(blank=True, default=None)
    objects = models.DjongoManager()
    
    def __str__(self):
        return self.name