from django.urls import include, path
from django.conf.urls import re_path
from rest_framework import routers
from . import views
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'files', views.FileUploadView, basename='Upload' )
router.register(r'files', views.FileGetView, basename='Convert' )
router.register(r'files', views.FileSplit, basename='Split' )
router.register(r'files', views.FileHierarchySplit, basename='hSplit' )
router.register(r'files', views.FileGetTextures, basename='textures' )
router.register(r'files', views.FileGetFiles, basename='files' )
router.register(r'files', views.FileGetMinimumDistance, basename='mindistance' )
router.register(r'files', views.FileGetShapeInfo, basename='shapeinfo' )
router.register(r'files', views.FileGetStackablePositions, basename='stackable' )
router.register(r'files', views.FileGetAssemblyOrder, basename='assemblyorder' )
router.register(r'files', views.FileGetKineticOrder, basename='kineticorder' )
router.register(r'files', views.FileSaveTree, basename='savetree' )

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    re_path(r'^api/v0/upload$', views.FileUploadView),
	re_path(r'^api/v0/upload', views.FileUploadView),
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
    re_path(r'^api/v0/kineticorder$', views.FileGetKineticOrder),
    re_path(r'^api/v0/savetree', views.FileSaveTree)
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + static(settings.DISPLAY_URL, document_root=settings.DISPLAY_ROOT)

