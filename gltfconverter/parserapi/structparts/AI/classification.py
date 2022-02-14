from pathlib import Path
from glob2 import glob
import random
import pandas as pd
import numpy as np
import os
import zipfile as zf
import shutil
import re

from fastai import *
from fastai.vision.all import *
from fastai.tabular.all import *
from fastai.text.all import *
from fastai.metrics import error_rate
import seaborn as sns
from sklearn.metrics import confusion_matrix

#create Modal
## helper functions ##

## splits indices for a folder into train, validation, and test indices with random sampling
    ## input: folder path
    ## output: train, valid, and test indices    
def split_indices(folder,seed1,seed2):    
    n = len(os.listdir(folder))
    full_set = list(range(1,n+1))

    ## train indices
    random.seed(seed1)
    train = random.sample(list(range(1,n+1)),int(.5*n))

    ## temp
    remain = list(set(full_set)-set(train))

    ## separate remaining into validation and test
    random.seed(seed2)
    valid = random.sample(remain,int(.5*len(remain)))
    test = list(set(remain)-set(valid))
    
    return(train,valid,test)

## gets file names for a particular type of trash, given indices
    ## input: waste category and indices
    ## output: file names 
def get_names(waste_type,indices):
    file_names = [waste_type+str(i)+".jpg" for i in indices]
    return(file_names)    

## moves group of source files to another folder
    ## input: list of source files and destination folder
    ## no output
def move_files(source_files,destination_folder):
    for file in source_files:
        shutil.move(file,destination_folder)

## paths will be train/cardboard, train/glass, etc...
subsets = ['train','valid']
position_types = ['front','back','right','left','top','bottom']

## create destination folders for data subset and waste type
for subset in subsets:
    for position_type in position_types:
        folder = os.path.join('data',subset,position_type)
        if not os.path.exists(folder):
            os.makedirs(folder)
            
if not os.path.exists(os.path.join('data','test')):
    os.makedirs(os.path.join('data','test'))
            
## move files to destination folders for each waste type
for position_type in position_types:
    source_folder = os.path.join('dataset-resized',position_type)
    train_ind, valid_ind, test_ind = split_indices(source_folder,1,1)
    
    ## move source files to train
    train_names = get_names(position_type,train_ind)
    train_source_files = [os.path.join(source_folder,name) for name in train_names]
    train_dest = "data/train/"+position_type
    move_files(train_source_files,train_dest)
    
    ## move source files to valid
    valid_names = get_names(position_type,valid_ind)
    valid_source_files = [os.path.join(source_folder,name) for name in valid_names]
    valid_dest = "data/valid/"+position_type
    move_files(valid_source_files,valid_dest)
    
    ## move source files to test
    test_names = get_names(position_type,test_ind)
    test_source_files = [os.path.join(source_folder,name) for name in test_names]
    ## I use data/test here because the images can be mixed up
    move_files(test_source_files,"data/test")
## get a path to the folder with images
path = Path(os.getcwd())/"data"
path

tfms = aug_transforms(do_flip=True,flip_vert=True)
data = ImageDataLoaders.from_folder(path,valid="valid",ds_tfms=tfms,bs=16)

data.show_batch(nrows=4,figsize=(10,8))

#Train

learn = cnn_learner(data,models.resnet34,metrics=error_rate)


learn.lr_find(start_lr=1e-6,end_lr=1e1)
learn.recorder.plot()


learn.fit_one_cycle(20,max_lr=5.13e-03)
interp = ClassificationInterpretation.from_learner(learn)
losses,idxs = interp.top_losses()
interp.plot_top_losses(9, figsize=(15,11))

doc(interp.plot_top_losses)
interp.plot_confusion_matrix(figsize=(12,12), dpi=60)
interp.most_confused(min_val=2)

#Test

preds,targs = learn.get_preds(act = torch.sigmoid)
print(preds[0].shape)
preds[0]
max_idxs = np.asarray(np.argmax(preds[0],axis=1))
yhat = []
for max_idx in max_idxs:
    yhat.append(data.classes[max_idx])

y = []

## convert POSIX paths to string first
for label_path in data.test_ds.items:
    y.append(str(label_path))
    
## then extract waste type from file path
pattern = re.compile("([a-z]+)[0-9]+")
for i in range(len(y)):
    y[i] = pattern.search(y[i]).group(1)
cm = confusion_matrix(y,yhat)
print(cm)

df_cm = pd.DataFrame(cm,position_types,position_types)

plt.figure(figsize=(10,8))
sns.heatmap(df_cm,annot=True,fmt="d",cmap="YlGnBu")

correct = 0

for r in range(len(cm)):
    for c in range(len(cm)):
        if (r==c):
            correct += cm[r,c]
accuracy = correct/sum(sum(cm))