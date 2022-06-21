# Struct

All the code, in one place

### Directory structure

```
.
└── monorepo/
    ├── packages/
    │   ├── backend-app/ (nodejs server)
    │   │   ├── src/
    │   │   └── package.json
    │   |── common/ (shared component library)
    │   |   └── components
    │   |   └── package.json
    │   |── design-app/ (create-react-app)
    │   |   └── src
    │   |   └── package.json
    │   |── internal-app/ (create-react-app)
    │   |   └── src
    │   |   └── package.json
    │   |── public-app/ (create-react-app)
    │   |   └── src
    │   |   └── package.json
    ├── package.json
    └── yarn.lock
```

## Installation

Use the package manager [yarn](https://yarnpkg.com/) to install packages.

```bash
yarn install
```

#### GLTFConverter (first time only)

- Install miniconda
- start miniconda terminal

### the following is needed if incase you want to delete the already created environment.

- run `conda env remove --name structquery ` ### or structserver

### Following is for pythonocc-core 7.4 environment supplied by cadquery which is recommended

- run `conda create --name structquery -c conda-forge -c cadquery -c pypi pythonocc-core=7.4.1 occt=7.4.0 cadquery=2.1 pyparsing=2.4.7 pip svgwrite Django django-cors-headers djangorestframework jinja2 tinydb requests six numpy scipy sympy matplotlib mpld3 mpmath nptyping s3fs trimesh pyopengl pillow networkx pyglet zlib djongo dnspython pymongo=3.12.0 tensorflow-gpu glob2 seaborn scikit-learn Markdown=3.3.4 ipykernel`

### Following is for pythonocc-core 7.5 environment without cadquery which is not recommended since this version has lot of hanging functionalities which is found while running

- run `conda create --name structserver -c conda-forge -c pypi pythonocc-core=7.5.1 occt=7.5.1 pyparsing=2.4.7 pip svgwrite Django django-cors-headers djangorestframework jinja2 tinydb requests six numpy scipy sympy matplotlib mpld3 mpmath nptyping s3fs trimesh pyopengl pillow networkx pyglet zlib djongo dnspython pymongo=3.12.0 tensorflow-gpu glob2 seaborn scikit-learn Markdown=3.3.4 ipykernel` ### or structquery

### Following is needed for both pythonocc-core 7.4 and 7.5

- run `conda activate structquery` ### or structserver
- run `conda install -c pytorch -c nvidia -c fastai fastai`
- CD to `gltfconverter` directory
- run `pip install -r requirements.txt`

### Following up to line no 108 is needed for Headless AWS and For windows, it is not needed and Jump to line no 108

- sudo apt install s3fs

### echo Access key ID:Secret access key > filename

# Example is given below

- echo AKIAUGAS44POH5Z3OJTG:l7loXGKujNI3BLbhUY7I4yPnyhezqBrMFhS2auI/> ~/.passwd-s3fs
- chmod 600 ~/.passwd-s3fs
- s3fs gltf-media /home/ubuntu/Struct/gltfconverter/s3bucket -o passwd_file=~/.passwd-s3fs

### Install Open GL as per https://en.wikibooks.org/wiki/OpenGL_Programming/Installation/Linux

- sudo apt-get install build-essential libgl1-mesa-dev ### Debian, Ubuntu
- sudo dnf install make gcc-c++ ### Fedora
- sudo apt-get install libglew-dev libsdl2-dev libsdl2-image-dev libglm-dev libfreetype6-dev ### Debian, Ubuntu
- sudo dnf install glew-devel SDL2-devel SDL2_image-devel glm-devel freetype-devel ### Fedora
- sudo pacman -S glew sdl2 sdl2_image glm freetype2 ### Arch

# Install xvfb

- sudo apt-get install xvfb mesa-utils -y

# Remove the nvidia display drivers (this doesn't remove the CUDA drivers)

# This is necessary as nvidia display doesn't play well with xvfb

- sudo nvidia-uninstall -y

# Sanity check to make sure you still have CUDA driver and its version

- nvcc --version

# Start xvfb

- Xvfb :1 -screen 0 1024x768x24 -ac +extension GLX +render -noreset &> xvfb.log &

# Export your display id

- export DISPLAY=:1

# Check if your display settings are valid

- glxinfo

### Above is needed for Headless AWS and For windows, it is not needed.

- run `python manage.py makemigrations`
- run `python manage.py migrate`

- run `conda deactivate`

## Usage

### Internal App (Node)

```bash
yarn server
```

### Internal App (React)

```bash
yarn start
```

### Design App (React)

```bash
yarn start-design
```

### Public App (React)

```bash
yarn start-public
```

### GLTFConverter

- cd `gltfconverter` folder
- Initialize environment in [Conda](https://docs.anaconda.com/anaconda/install/windows/) terminal

```bash
conda activate structquery ### or structserver
```

- For headless AWS to start opengl, following 4 commands needed and they are not needed for windows environment

# Export your S3

export DONOTUSES3=False

# Start s3fs system is not needed everytime while restarting but only one time it is needed whenever you reboot the system

#- s3fs gltf-media /home/ubuntu/Struct/gltfconverter/s3bucket -o passwd_file=~/.passwd-s3fs

# Start xvfb

Xvfb :1 -screen 0 1024x768x24 -ac +extension GLX +render -noreset &> xvfb.log &

# Export your display id

export DISPLAY=:1

- For headless AWS to start opengl, above 4 commands needed and they are not needed for windows environment

- Run the following command

```python
python manage.py runserver localhost:8000
```

#### For everyday in windows enivronment.

- cd `gltfconverter` folder
- Initialize environment in [Conda](https://docs.anaconda.com/anaconda/install/windows/) terminal

```bash
conda activate structquery ### or structserver
```

- Run the following command

```python
python manage.py runserver localhost:8000
```

## Tasks

Refer to [package.json](https://github.com/amitvika/Struct/blob/Dev/package.json) file for complete list of capabilities.
