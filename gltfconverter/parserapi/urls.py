from django.urls import include, path
from django.conf.urls import re_path
from rest_framework import routers
from . import views
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'files', views.FileUploadView, basename='Upload' )
router.register(r'files', views.FileUploadChunk, basename='chunkupload' )
router.register(r'files', views.FileGetView, basename='Convert' )
router.register(r'files', views.FileSplit, basename='Split' )
router.register(r'files', views.FileHierarchySplit, basename='hSplit' )
router.register(r'files', views.FileGetTextures, basename='textures' )
router.register(r'files', views.FileGetFiles, basename='files' )
router.register(r'files', views.FileGetMinimumDistance, basename='mindistance' )
router.register(r'files', views.FileGetShapeInfo, basename='shapeinfo' )
router.register(r'files', views.FileGetStackablePositions, basename='stackable' )
router.register(r'files', views.FileGetAssemblyOrder, basename='assemblyorder' )
router.register(r'files', views.FileGetKinematicAnimation, basename='kinematicorder' )
router.register(r'files', views.FileSaveTree, basename='savetree' )
router.register(r'files', views.FileSaveGDT, basename='savegdt' )
router.register(r'files', views.GetFileContent, basename='getcontent' )
router.register(r'files', views.FetchFileContent, basename='fetchcontent' )
router.register(r'files', views.CheckFileExistence, basename='checkexists' )
# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.FileUploadChunk
urlpatterns = [
    re_path(r'^api/v0/upload$', views.FileUploadView),
	re_path(r'^api/v0/upload', views.FileUploadView),
    re_path(r'^api/v0/chunkupload', views.FileUploadChunk),
    re_path(r'^api/v0/uploads/(?P<pk>[0-9]+)$', views.FileReplaceView),
    re_path(r'^api/v0/convert$', views.FileGetView),
    re_path(r'^api/v0/split$', views.FileSplit),
    re_path(r'^api/v0/hsplit$', views.FileHierarchySplit),
    re_path(r'^api/v0/textures$', views.FileGetTextures),
    re_path(r'^api/v0/files$', views.FileGetFiles),
    re_path(r'^api/v0/mindistance$', views.FileGetMinimumDistance),
    re_path(r'^api/v0/shapeinfo$', views.FileGetShapeInfo),
    re_path(r'^api/v0/shapeinfo', views.FileGetShapeInfo),
    re_path(r'^api/v0/stackable$', views.FileGetStackablePositions),
    re_path(r'^api/v0/assemblyorder$', views.FileGetAssemblyOrder),
    re_path(r'^api/v0/kinematicorder$', views.FileGetKinematicAnimation),
    re_path(r'^api/v0/savetree', views.FileSaveTree),
    re_path(r'^api/v0/savegdt', views.FileSaveGDT),
    re_path(r'^api/v0/getcontent$', views.GetFileContent), 
    re_path(r'^api/v0/fetchcontent$', views.FetchFileContent),
    re_path(r'^api/v0/checkexists$', views.CheckFileExistence),
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + \
    static(settings.DISPLAY_URL, document_root=settings.DISPLAY_ROOT) + \
        static(settings.S3MEDIA_URL, document_root=settings.S3MEDIA_ROOT) + \
            static(settings.S3DISPLAY_URL, document_root=settings.S3DISPLAY_ROOT) + \
                static(settings.STATUS_URL, document_root=settings.STATUS_ROOT) 
        

