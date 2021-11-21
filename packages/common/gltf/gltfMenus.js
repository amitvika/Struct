import AddToQueueOutlinedIcon from '@material-ui/icons/AddToQueueOutlined';
import SpeedOutlinedIcon from '@material-ui/icons/SpeedOutlined';
//import SettingsBrightnessOutlinedIcon from '@material-ui/icons/SettingsBrightnessOutlined';
import BrightnessMediumOutlinedIcon from '@material-ui/icons/BrightnessMediumOutlined';
//import PhotoSizeSelectActualOutlinedIcon from '@material-ui/icons/PhotoSizeSelectActualOutlined';
import WeekendOutlinedIcon from '@material-ui/icons/WeekendOutlined';
import MovieOutlinedIcon from '@material-ui/icons/MovieOutlined';
export const myMenus = [
  {
    folder: 'Display',
    icon: <AddToQueueOutlinedIcon />,
    groups: [
      {
        name: 'view',
        values: {
          view: 'Orthographic',
          ctrlKey: false
        },
        fields: [
          {
            name: 'View',
            type: 'radio',
            items: ['Orthographic', 'Perspective'],
            key: 'view'
          }
        ]
      },
      {
        name: 'side',
        values: {
          side: 'Front',
          ctrlKey: false
        },
        fields: [
          {
            name: 'Side',
            type: 'radio',
            items: ['Front', 'Back', 'Both'],
            key: 'side'
          }
        ]
      },
      {
        name: 'opaque',
        values: {
          opaque: 'True',
          wiremesh: false,
          ctrlKey: false
        },
        fields: [
          {
            name: 'Opaque',
            type: 'radio',
            items: ['True', 'False', 'Self'],
            key: 'opaque'
          }
        ]
      },
      {
        name: 'mesh',
        values: {
          wiremesh: false,
          castshadow: false,
          skeleton: false,
          grid: false,
          ctrlKey: false
        },
        fields: [
          {
            name: 'Wire Mesh',
            type: 'checkbox',
            key: 'wiremesh'
          } /* , {
                  name: 'Cast Shadow',
                  type: 'checkbox',
                  key: 'castshadow'   
                } */,
          {
            name: 'Skeleton',
            type: 'checkbox',
            key: 'skeleton'
          },
          {
            name: 'Grid',
            type: 'checkbox',
            key: 'grid'
          }
        ]
      },
      {
        name: 'edge',
        values: {
          showedges: true,
          linewidth: 2.0,
          ctrlKey: false
        },
        fields: [
          {
            name: 'Show Edges',
            type: 'checkbox',
            key: 'showedges'
          },
          {
            name: 'Edge Width',
            type: 'slider',
            auto: 'auto',
            step: 1,
            min: 1,
            max: 20,
            key: 'linewidth'
          }
        ]
      },
      {
        name: 'space',
        values: {
          autoRotate: false,
          screenSpacePanning: false,
          ctrlKey: false
        },
        fields: [
          {
            name: 'Auto Rotate',
            type: 'checkbox',
            key: 'autoRotate'
          },
          {
            name: 'Screen Space Panning',
            type: 'checkbox',
            key: 'screenSpacePanning'
          }
        ]
      }
    ]
  },
  {
    folder: 'Controls',
    icon: <SpeedOutlinedIcon />,
    groups: [
      {
        name: 'speed',
        values: {
          zoomSpeed: 0.7,
          panSpeed: 1.0,
          rotateSpeed: 2.0,
          ctrlKey: false
        },
        fields: [
          {
            name: 'Zoom Speed',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min: 0.0,
            max: 1.0,
            key: 'zoomSpeed'
          },
          {
            name: 'Pan Speed',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min: 0.0,
            max: 3.0,
            key: 'panSpeed'
          },
          {
            name: 'Rotation Speed',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min: 0.0,
            max: 3.0,
            key: 'rotateSpeed'
          }
        ]
      },
      {
        name: 'zoom',
        values: {
          zoomToCursor: true,
          maxZoomIn: 50.0,
          maxZoomOut: 50.0,
          ctrlKey: false
        },
        fields: [
          {
            name: 'Zoom to Cursor',
            type: 'checkbox',
            key: 'zoomToCursor'
          },
          {
            name: 'Maximum Zoom In',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min: 1.0,
            max: 100.0,
            key: 'maxZoomIn'
          },
          {
            name: 'Maximum Zoom Out',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min: 1.0,
            max: 100.0,
            key: 'maxZoomOut'
          }
        ]
      }
    ]
  },
  {
    folder: 'Lighiting',
    icon: <BrightnessMediumOutlinedIcon />,
    groups: [
      {
        name: 'textureEncoding',
        values: {
          textureEncoding: 'sRGB',
          ctrlKey: false
        },
        fields: [
          {
            name: 'Texture Encoding',
            type: 'radio',
            items: ['sRGB', 'Linear'],
            key: 'textureEncoding'
          }
        ]
      },
      {
        name: 'outputEncoding',
        values: {
          outputEncoding: 'sRGB',
          ctrlKey: false
        },
        fields: [
          {
            name: 'Output Encoding',
            type: 'radio',
            items: ['sRGB', 'Linear'],
            key: 'outputEncoding'
          }
        ]
      },
      {
        name: 'lights',
        values: {
          exposure: 1.0,
          addLights: true,
          ctrlKey: false
        },
        fields: [
          {
            name: 'Exposure',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min: 0.0,
            max: 2.0,
            key: 'exposure'
          },
          {
            name: 'Add Lights',
            type: 'checkbox',
            key: 'addLights'
          }
        ]
      },
      {
        name: 'ambient',
        values: {
          ambientIntensity: 0,
          ambientColor: 0xffffff,
          ctrlKey: false
        },
        fields: [
          {
            name: 'Ambient Intensity',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min: 0.0,
            max: 4.0,
            key: 'ambientIntensity'
          },
          {
            name: 'Ambient Color',
            type: 'color',
            default: 0xffffff,
            key: 'ambientColor'
          }
        ]
      },
      {
        name: 'direct',
        values: {
          directIntensity: 2,
          directColor: 0xffffff,
          ctrlKey: false
        },
        fields: [
          {
            name: 'Direct Intensity',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min: 0.0,
            max: 4.0,
            key: 'directIntensity'
          },
          {
            name: 'Direct Color',
            type: 'color',
            default: 0xffffff,
            key: 'directColor'
          }
        ]
      }
    ]
  },
  {
    folder: 'Selection',
    icon: <WeekendOutlinedIcon />,
    groups: [
      {
        name: 'selection',
        values: {
          selectedOption: 'Specify Assembly Mates and GD&T',
          ctrlKey: false
        },
        fields: [
          {
            name: 'Select Features',
            type: 'radio',
            items: [
              'Assemblies',
              'Parts',
              'Faces',
              'Edges',
              'Corners',
              'Circular',
              'Linear'
            ],
            key: 'selectedOption'
          }
        ]
      }
    ]
  },
  {
    folder: 'Animation',
    icon: <MovieOutlinedIcon />,
    groups: [
      {
        name: 'control',
        values: {
          animationSpeed: 1,
          animationTime: 0,
          pauseAnimation: 'Continue',
          ctrlKey: false
        },
        fields: [
          {
            name: 'Animation Speed',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min: 0.1,
            max: 10.0,
            key: 'animationSpeed'
          },
          {
            name: 'Animation Time',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min: 0.1,
            max: 10.0,
            key: 'animationTime'
          },
          {
            name: 'Pause',
            type: 'radio',
            items: ['Continue', 'Pause'],
            key: 'pauseAnimation'
          }
        ]
      }
    ]
  }
];
