#!/usr/bin/python
# dirSync.py

import os
from filecmp import *
import shutil
from datetime import datetime, timezone

def copyTree(sourceDir, destDir, removeAfterCopy, percentage=0, percentIncrement=100, symlinks=False, ignored_names=['.','..']):
    #names = os.listdir(sourceDir)
    currentPercentage = percentage
    if not os.path.isdir(destDir): 
        os.makedirs(destDir)
    errors = []
    
    dc = dircmp(sourceDir, destDir,[],[])
		
	# Iterate through the files and directories only available in source directory.
	
    totalFiles = len(dc.left_only)+len(dc.common_files)+len(dc.common_dirs)
    #print (sourceDir,'Found Total',totalFiles,"Source Files",len(dc.left_only),"Common Files",len(dc.common_files),"Common Dirs",len(dc.common_dirs), "Remove After Copy",removeAfterCopy)
    if(totalFiles==0):
        totalFiles=1
    curPercentIncrement = percentIncrement / totalFiles
    for name in dc.left_only:
        
        if name in ignored_names:
            currentPercentage+=curPercentIncrement
            continue
        srcname = os.path.join(sourceDir, name)
        dstname = os.path.join(destDir, name)
        try:
            if symlinks and os.path.islink(srcname):
                linkto = os.readlink(srcname)
                os.symlink(linkto, dstname)
            elif os.path.isdir(srcname):
                copyTree(srcname, dstname, removeAfterCopy, currentPercentage, curPercentIncrement, symlinks, ignored_names)
            else:
                print("Copy Started", srcname, dstname, currentPercentage)
                copiedname = shutil.copy2(srcname, dstname)
                print("Copy Completed", srcname, dstname,currentPercentage+curPercentIncrement)
                if copiedname == dstname: #if file is copied, then delete the source, else do not.
                    if (not srcname.endswith(".status")) and (not srcname.endswith(".progress")) and (removeAfterCopy):
                        os.remove(srcname)
                else:
                    print("Error while copying",srcname,dstname,copiedname)
        except shutil.Error as err:
            errors.extend(err.args[0])
        except EnvironmentError as why:
            errors.append((srcname, dstname, str(why)))
        currentPercentage+=curPercentIncrement
    # Iterate through the common files making sure they are up to date.
    for name in dc.common_files:
        if name in ignored_names:
            currentPercentage+=curPercentIncrement
            continue
        srcname = os.path.join(sourceDir, name)
        dstname = os.path.join(destDir, name)
		# Do a shallow comparison (stat vs. bit by bit) of files.
        if not cmp(srcname, dstname):
			# Determine if node is older in dir2.
            dir1stat = os.stat(srcname)
            dir2stat = os.stat(dstname)
            if dir1stat.st_mtime > dir2stat.st_mtime:
				# The file is old, copy over the new version.
                copiedname = shutil.copy2(srcname, dstname)
                if copiedname == dstname: #if file is copied, then delete the source, else do not.
                    if (not srcname.endswith(".status")) and (not srcname.endswith(".progress")) and (removeAfterCopy):
                        os.remove(srcname)
                else:
                    print("Error while copying",srcname,dstname,copiedname)
        currentPercentage+=curPercentIncrement

	# Recurse through the directories to make sure they are up to date.
    for name in dc.common_dirs:
        if name in ignored_names:
            currentPercentage+=curPercentIncrement
            continue
        srcname = os.path.join(sourceDir, name)
        dstname = os.path.join(destDir, name)
        copyTree(srcname, dstname, removeAfterCopy, currentPercentage, curPercentIncrement, symlinks, ignored_names)
        currentPercentage+=curPercentIncrement
    try:
        shutil.copystat(sourceDir, destDir)
    except OSError as why:
        if WindowsError is not None and isinstance(why, WindowsError):
            # Copying file access times may fail on Windows
            pass
        else:
            errors.extend((sourceDir, destDir, str(why)))
    if errors:
        print(errors)
    currentPercentage = percentage + percentIncrement

def copyOnefile(srcname, dstname, symlinks=False):    
    errors = []
    dstpath = os.path.dirname(dstname)
    if not os.path.isdir(dstpath): 
        os.makedirs(dstpath)
    try:
        if symlinks and os.path.islink(srcname):
            linkto = os.readlink(srcname)
            os.symlink(linkto, dstname)
        else:
            shutil.copy2(srcname, dstname)
    except shutil.Error as err:
        errors.extend(err.args[0])
    except EnvironmentError as why:
        errors.append((srcname, dstname, str(why)))
    if errors:
        print(errors)

def checkIdle(timelag=0.0,logName="Media/Log/APIWatcher.Log"): 
    try:
        filetime = datetime.fromtimestamp(os.stat(logName).st_mtime)
        currenttime=datetime.now()
        print("Check Idle",filetime,currenttime,logName,timelag)
        return(currenttime-filetime).total_seconds()+timelag
    except Exception as e:
        print("Error while accessing", logName, e)
        return 0
    