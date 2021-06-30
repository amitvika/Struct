from django.db import models


class File(models.Model):
    file = models.FileField(blank=False, null=False)
    filename = models.CharField(max_length=80, null=True)
    def __str__(self):
        return self.file.name