from django.conf import settings

from gltfconverter.converter.settings import DISPLAY_ROOT

DISPLAY_URL=''
MEDIA_URL=''
if settings.DONOTUSES3:
    DISPLAY_URL = 'Display/'
    MEDIA_URL = 'Media/'
else:
    DISPLAY_URL = 's3bucket/Display/'
    MEDIA_URL = 's3bucket/Media/'

 