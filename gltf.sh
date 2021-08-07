#!/bin/bash
source ~/anaconda3/etc/profile.d/conda.sh
conda activate structquery 
python gltfconverter/manage.py runserver localhost:8000
