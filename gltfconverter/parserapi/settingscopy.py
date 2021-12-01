from django.conf import settings

S3_BUCKET=''
DISPLAY_URL=''
MEDIA_URL=''
if settings.S3_PATH == '':
    COPY_PATH=settings.S3_PATH
    S3_BUCKET = 's3bucket/'
else:
    COPY_PATH=settings.S3_PATH+'/'
    S3_BUCKET=COPY_PATH
if settings.DONOTUSES3:
    DISPLAY_URL = 'Display/'
    MEDIA_URL = 'Media/'
    COPY_PATH = ''
else:
    DISPLAY_URL = COPY_PATH+'Display/'
    MEDIA_URL = COPY_PATH+'Media/'
    #if COPY_PATH=='':
    #    COPY_PATH = 's3bucket/'
    #else:
    #    COPY_PATH = ''

 