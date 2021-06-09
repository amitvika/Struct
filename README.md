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
- run `conda create --name structquery -c conda-forge -c cadquery cadquery=2 oce pythonocc-core pyparsing pip svgwrite Django django-cors-headers djangorestframework jinja2 tinydb requests six numpy nptyping`
- run `conda activate structquery`
- CD to `gltfconverter` directory
- run `python manage.py makemigrations`
- run `python manage.py migrate`
- run `conda deactivate`


## Usage

### Internal App (Node)
```bash 
npm run server
```
### Internal App (React)
```bash 
npm start
```
### Design App (React)
```bash 
npm start-design
```
### Public App (React)
```bash 
npm start-public
```

### GLTFConverter
- cd `gltfconverter` folder
- Initialize environment in [Conda](https://docs.anaconda.com/anaconda/install/windows/) terminal
``` bash
conda activate structquery
```
- Run the following command
```python
python manage.py runserver localhost:8000
```


## Tasks

Refer to [package.json](https://github.com/amitvika/Struct/blob/Dev/package.json) file for complete list of capabilities.
