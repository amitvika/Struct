from django.contrib import admin
from .models import ChildParsingDetails, EdgeParsingDetails, File, ItemDetails,ParsingDetails
admin.site.register([File,ParsingDetails,ChildParsingDetails,EdgeParsingDetails,ItemDetails])