import AddToQueueOutlinedIcon from '@material-ui/icons/AddToQueueOutlined';
import SpeedOutlinedIcon from '@material-ui/icons/SpeedOutlined';
import SettingsBrightnessOutlinedIcon from '@material-ui/icons/SettingsBrightnessOutlined';
import PhotoSizeSelectActualOutlinedIcon from '@material-ui/icons/PhotoSizeSelectActualOutlined';
export const myMenus =  [ { 
          folder:'Display',
          icon:<AddToQueueOutlinedIcon/>,
          values: {
            view: "Orthographic",
            side: "Front",
            opaque: "True",
            wiremesh: false,
            skeleton: false,
            grid: false,
            autoRotate: false,
            screenSpacePanning: false,
            ctrlKey:false
          },
          fields: [{
            name: 'View',
            type: 'radio',
            items: ["Orthographic","Perspective"],
            key: 'view'   
          }, {
            name: 'Side',
            type: 'radio',
            items: ["Front","Back","Both"],
            key: 'side'   
          }, {
            name: 'Opaque',
            type: 'radio',
            items: ["True","False","Self"],
            key: 'opaque'   
          }, {
            name: 'Wire Mesh',
            type: 'checkbox',
            key: 'wiremesh'   
          }, {
            name: 'Skeleton',
            type: 'checkbox',
            key: 'skeleton'   
          }, {
            name: 'Grid',
            type: 'checkbox',
            key: 'grid'   
          }, {
            name: 'Auto Rotate',
            type: 'checkbox',
            key: 'autoRotate'   
          }, {
            name: 'Screen Space Panning',
            type: 'checkbox',
            key: 'screenSpacePanning'   
          }
          ]
        }, { 
          folder:'Controls',
          icon:<SpeedOutlinedIcon/>,
          values: {
            zoomSpeed: 0.1,
            panSpeed: 1.0,
            rotateSpeed: 2.0,
            zoomToCursor: true
          },
          fields: [{
            name: 'Zoom',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min:  0.0, 
            max:  1.0, 
            key: 'zoomSpeed'   
          }, {
            name: 'Pan',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min:  0.0, 
            max:  3.0, 
            key: 'panSpeed'   
          }, {
            name: 'Rotation',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min:  0.0, 
            max:  3.0, 
            key: 'rotateSpeed'   
          } , {
            name: 'Zoom to Cursor',
            type: 'checkbox',
            key: 'zoomToCursor'   
          }
          ]
        }, { 
          folder:'Lighiting',
          icon:<SettingsBrightnessOutlinedIcon/>,
          values: {
            textureEncoding:"sRGB",
            outputEncoding:"sRGB",
            exposure: 1.0,
            addLights: true,
            ambientIntensity: 1.0,
            ambientColor: 0xFFFFFF,
            directIntensity: 0.8 * Math.PI,  
            directColor: 0xFFFFFF,
            ctrlKey:false
          },
          fields: [{
            name: 'Texture Encoding',
            type: 'radio',
            items: ["sRGB","Linear"],
            key: 'textureEncoding'   
          }, {
            name: 'Output Encoding',
            type: 'radio',
            items: ["sRGB","Linear"],
            key: 'outputEncoding'   
          }, {
            name: 'Exposure',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min:  0.0, 
            max:  2.0, 
            key: 'exposure'   
          },  {
            name: 'Add Lights',
            type: 'checkbox',
            key: 'addLights'   
          }, {
            name: 'Ambient Intensity',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min:  0.0, 
            max:  2.0, 
            key: 'ambientIntensity'   
          }, {
            name: 'Ambient Color',
            type: 'color',
            default: 0xFFFFFF, 
            key: 'ambientColor'               
          }, {
            name: 'Direct Intensity',
            type: 'slider',
            auto: 'auto',
            step: 0.1,
            min:  0.0, 
            max:  2.0, 
            key: 'directIntensity'   
          }, {
            name: 'Direct Color',
            type: 'color',
            default: 0xFFFFFF, 
            key: 'directColor'               
          } 
          ]
        } ,{ 
          folder:'Selection',
          icon:<PhotoSizeSelectActualOutlinedIcon/>,
          values: {
            selectedOption:"Specify Assembly Mates and GD&T",
            ctrlKey:false            
          },
          fields: [{
            name: 'Select Features',
            type: 'radio',
            items: ["Assemblies","Parts","Edges","Specify Assembly Mates and GD&T"],
            key: 'selectedOption'   
          }]
        }
      ];

      