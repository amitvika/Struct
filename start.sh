sudo -i
export PATH=~/anaconda3/bin:$PATH
source ~/anaconda3/etc/profile.d/conda.sh
conda activate structquery
cd /home/ubuntu/Struct/gltfconverter
Xvfb :1 -screen 0 1024x768x24 -ac +extension GLX +render -noreset &> xvfb.log &
export DISPLAY=:1
sudo fuser -k 8000/tcp
python manage.py runserver localhost:8000
