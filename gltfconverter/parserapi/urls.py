from django.urls import include, path
from django.conf.urls import url
from rest_framework import routers
from . import views
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'files', views.FileUploadView, basename='Upload' )
router.register(r'files', views.FileGetView, basename='Get' )

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^api/v0/upload$', views.FileUploadView),
	url(r'^api/v0/upload', views.FileUploadView),
    url(r'^api/v0/uploads/(?P<pk>[0-9]+)$', views.FileReplaceView),
    url(r'^api/v0/convert$', views.FileGetView)
]  + static(settings.DISPLAY_URL, document_root=settings.DISPLAY_ROOT)

