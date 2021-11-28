
import os
import threading
from datetime import datetime
from .dirSync import checkIdle, copyTree

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
            copyTree("Media/", "s3bucket/Media/",False,0,100)
            logprintinfo="Media Syncer Completed "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
            logging.info(logprintinfo)
            print(logprintinfo)
            copyTree("Display/", "s3bucket/Display/",True,0,100)
            logprintinfo="Display Syncer Completed "+datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
            logging.info(logprintinfo)
            print(logprintinfo)
        else:
            print("I am not Idle to move files from Linux box to S3Box")
    except Exception as e:
        print("Error while moving",e)