
import os
import threading
from datetime import datetime
from .dirSync import checkIdle, copyTree
from .controllers import ParsingDetailsController
from .settingscopy import (DISPLAY_URL,MEDIA_URL,S3_BUCKET)
class RecursiveCopier():

    def __init__(self,interval,hFunction,logging,fileLogger,timeLogger):
        self.t=interval
        self.hFunction = hFunction
        self.timelag = 0
        self.thread=None
        self.fileLogger = fileLogger
        self.timeLogger = timeLogger
        self.logging = logging
        self.inprogress = False
        try:
            self.logging.info("Syncer "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S"))
        except Exception as e:
            print("Error while logging",e)
        try:
            with open(self.timeLogger, 'w') as fh:
                fh.write("Syncer "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S"))
            filetime = datetime.fromtimestamp(os.stat(self.timeLogger).st_mtime)
            currenttime=datetime.utcnow()
            self.timelag=(filetime-currenttime).total_seconds()            
        except Exception as e:
            print("Error while accessing", self.fileLogger, self.timeLogger, e)
            
    
    def handle_function(self):
        try:
            self.inprogress=True
            self.hFunction(self.timelag,self.fileLogger, self.logging)
            self.inprogress=False
        except Exception as e:
            print("Error while copying in handle_function", e)
        try:
            self.start()
        except Exception as e:
            print("Error while starting thread for copying", e)

    def start(self):
        if not self.inprogress:
            self.cancel()
            self.thread = threading.Timer(self.t,self.handle_function)
            if(self.thread):
                try:
                    self.thread.daemon=True
                    self.inprogress = True
                except Exception as e:
                    print("There is an error while setting daemon in copying function",e)
                self.thread.start()
            else:
                print("I am unable to create a thread for copy routine")
        else:
            print("I am not starting because, already thread is in place")

    def cancel(self):
        if(self.thread):
            try:
                self.thread.cancel()
                self.thread=None
                self.inprogress=False
            except Exception as e:
                print("There is an error while cancelling thread",e)

    def timeUTCLagFromServer(self):
        return self.timelag    


def copyFilesRecursive(timelag,fileLogger,logging):
    try:
        if checkIdle(timelag,fileLogger) > 1600:            
            logprintinfo="Syncer Started "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
            logging.info(logprintinfo)
            print(logprintinfo)
            storageSerializers = ParsingDetailsController().s3TobeCopied()
            if((storageSerializers is not None) and len(storageSerializers)>0):
                for storageSerializer in storageSerializers:
                    filename = storageSerializer.filename
                    errors=[]
                    if (filename is not None) and filename:
                        filenamePath, _ = os.path.split(filename)
                        if(filenamePath[:-1]!="/"):            
                            filenamePath = filenamePath + "/"
                        print("Going to copy from",filenamePath,"to",S3_BUCKET+filenamePath)
                        myErrors = copyTree(filenamePath, S3_BUCKET+filenamePath,False,0,100)  
                        if(len(myErrors)>0):
                            errors.extend(myErrors)
                        logprintinfo="Media Syncer Completed "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
                        logging.info(logprintinfo)
                        print(logprintinfo)
                        MediaUrlLength = len(MEDIA_URL)
                        if filenamePath[0:MediaUrlLength]== MEDIA_URL:
                            displaypath = DISPLAY_URL+filenamePath[MediaUrlLength:]
                            print("Going to copy from",displaypath,"to",S3_BUCKET+displaypath)
                            myErrors = copyTree(displaypath, S3_BUCKET+displaypath,True,0,100) 
                            if(len(myErrors)>0): 
                                errors.extend(myErrors)
                            logprintinfo="Display Syncer Completed "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
                            logging.info(logprintinfo)
                            print(logprintinfo)
                        else:
                            print("Got filename as other than Media?",filenamePath)
                            errors.append((filename,filenamePath,"Got filename as other than Media "+MEDIA_URL))
                    if (len(errors)==0):
                        try:
                            storageSerializer.s3storage=True
                            storageSerializer.save()
                        except Exception as e:
                            print("Error while updating s3storage",e,storageSerializer)
                    else:
                        print("There are errors while copying",errors,storageSerializer)
            """ copyTree("Media/", "s3bucket/Media/",False,0,100)
            logprintinfo="Media Syncer Completed "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
            logging.info(logprintinfo)
            print(logprintinfo)
            copyTree("Display/", "s3bucket/Display/",True,0,100)
            logprintinfo="Display Syncer Completed "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
            logging.info(logprintinfo)
            print(logprintinfo) """
        else:
            print("I am not Idle to move files from Linux box to S3Box")
    except Exception as e:
        print("Error while moving",e)