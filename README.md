# Struct
All the code, in one place

## Installation

#### GLTFConverter (first time only)

- Install miniconda
- start miniconda terminal
- run `conda create --name structquery -c conda-forge -c cadquery cadquery=2 oce pythonocc-core pyparsing pip svgwrite Django django-cors-headers djangorestframework jinja2 tinydb requests six numpy nptyping`
- run `conda activate structquery`
- CD to `gltfconverter` directory
- run `python manage.py makemigrations`
- run `python manage.py migrate`
- run `conda deactivate`


### React and Node (first time only)

- First for setup, use `npm run setup` 

## Run localy

#### GLTFConverter
- cd `gltfconverter` folder
- run `conda activate structquery` for activating virtual environment
- `python manage.py runserver localhost:8000`

#### React and Node 

-  `npm run dev-all` to run the entire dev environment

-  `npm run dev` to run the backend and internal dev environment

## Tasks

Refer to [package.json](https://github.com/amitvika/Struct/blob/Dev/package.json) file for complete list of capabilities.
