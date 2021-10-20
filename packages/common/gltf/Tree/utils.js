
import { withStyles, makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
//import { useSelector } from 'react-redux';
//import { getThemeName } from '@monostruct/common/themes/base';
import { stringify } from '../BeautifyJson';

export const SELECTCOLOR = 1;
export const SELECTTEXTURE = 2;
export const SELECTMETAL = 3;
export const SELECTROUGH = 4;
export const SELECTOPAQUE = 5;
export const SELECTDISTANCE = 6;
export const SELECTBACKCOLOR = 7;
export const SELECT2DTEXTURE = 8;
export const SELECT3DTEXTURE = 9;
export const SELECTMATERIRAL = 10;
export const SELECTSELECTCOLOR = 11;
export const SELECTTOUCHCOLOR = 12;
export const SELECTSHOWINFO = 13;
export const SELECTSOLID = 14;
export const SELECTFACE = 15;
export const SELECTEDGE = 16;
export const SELECTCORNER = 17;
export const SELECTMEASURE = 18;
export const SELECTTICK = 19;
export const SELECTCONTINOUS = 20;
export const SELECTHIRERACHY = 21;
export const SELECTDISECTPARTS = 22;
export const SELECTSTACKABLE = 23;
export const SELECTASSEMBLY = 24;
export const SELECTORDER = 25;
export const SELECTFEATURE=26;
export const SELECTLOADEDGES=27;
export const SELECTCIRCULAR=28;
export const SELECTLINEAR=29;

let selectedTheme = 'light';

export const setSelectedTheme=(theme)=> {
  console.log("Before Changing selected theme",selectedTheme,theme);
  selectedTheme = theme;
  console.log("Before Changing selected theme",selectedTheme,theme);
}

export const hexToRGB = (hex) => {
    var c;
    if(hex) {
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [((c>>16)&255)/255.0, ((c>>8)&255)/255.0, (c&255)/255.0];
      } else {
        c=hex;
        try {
          return [((c>>16)&255)/255.0, ((c>>8)&255)/255.0, (c&255)/255.0];
        } 
        finally {
          
        }        
      }
    }
    return [0,0,0];   
}
  
export const componentToHex=(c)=> {
    var inte = Math.round(c*255);
    var hex = inte.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
export const rgbToHex=(r, g, b)=> {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
export const getFloat=(value)=>{
  const floatvalue = parseFloat(value);
  if(isNaN(floatvalue)) return 0.0;
  return floatvalue; 
}
export const getTexture = (texture) => {
  if(texture) {
    //console.log("Assigning correct object",texture);
    return [texture];
  }
  //console.log("I am assigning emoty array");
  return [{"id":null,"name":null}];
}

export const prettyPrintArray= (json,maxlength=30) => {
  if(json) {
    if (typeof json === 'string') {
      //console.log("I got String");
      return json
    }
    if (Array.isArray(json)) {
      //console.log("I got Array");
      try {
        return stringify(json, {maxlength:maxlength});
      } catch (error) {
        return json.toString();
      }     
    }
   
    return stringify(json, {maxlength:maxlength});  		
  }
  return "No Info"
}

export const gltf_Dict = {
    "id":"i",
    "parentId":"p",
    "step":"s",
    "name":"n", 
    "topLeft" : "t",
    "bottomRight" : "b",
    "indent": "d", 
    "leaf":"l",
    "R":"R",
    "G":"G",
    "B":"B",
    "A":"A",
    "texture":"T",
    "metallicFactor":"m",
    "roughnessFactor":"r",
    "structures" : "S",  
    "bin":"I",  
    "selected" : "C",
    "display":"D",
    "subfeatures":"f",
    "element":"e",
    "geometry":"g"
  }

  export const defaultGDTTable = {
    "edges":[],
    "selectedObjects":[],
    "parentObjects":[],
    "mates":[],
    "mateValues": [false,false,false,false,false,false],
    "angle":0,
    "offset":0,                          
    "option":SELECTFEATURE,
    "key":"" 
  };


  export const arrayFindIndex = (arr, value, parent = false) => {
    return arr.findIndex(function (ele) {
      if (parent) return ele.parent[gltf_Dict['name']] === value;
      return ele[gltf_Dict['name']] === value;
    });
  };

  export const arrayRemove = (arr, value, parent = false) => {
    return arr.filter(function (ele) {
      if (parent) return ele.parent[gltf_Dict['name']] !== value;
      return ele[gltf_Dict['name']] !== value;
    });
  };

  export const arrayRemoveFromMesh = (arr, value, parent = false) => {
    return arr.filter(function (ele) {
      if (parent) return ele.parent['name'] !== value;
      return ele['name'] !== value;
    });
  };

  export const arrayRemoveFromValue = (arr, value) => {   
      return arr.filter(function (ele) {
        return ele != value;
      });    
  };

  export const arrayCopy = (arr) => {
    var copy_selectobjects = [];

    arr.forEach((element) => {
      copy_selectobjects.push(element);
    });
    return copy_selectobjects;
  };
  //const themeDictionary = useSelector((state) => state.theme.curThemeName);  
  //const themeName =getThemeName(themeDictionary);
  //const themeName = selectedTheme;//getThemeName(themeDictionary);


  export const DEFAULTSELECTCOLOR = () => { 
    //console.log("ThemeName",selectedTheme);
    return selectedTheme=='light'?"#17FF17":"#E800E8"; 
  };
  export const DEFAULTTOUCHCOLOR = () => { 
    //console.log("ThemeName",selectedTheme);
    return selectedTheme=='light'?"#FF1717":"#00E8E8"; 
  };
  export const DEFAULTBACKCOLOR  = () => {
    //console.log("ThemeName",selectedTheme); 
    return selectedTheme=='light'?"#FFFFFF":"#424242";
  };
  export const DEFAULTTEXTCOLOR = () => {
    //console.log("ThemeName",selectedTheme); 
    return selectedTheme=='light'?"#1717FF":"#E8E800";
  };
  export const DEFAULTBACKMENUCOLOR  = () => {
    //console.log("ThemeName",selectedTheme); 
    return selectedTheme=='light'?"#FEFEFE":"#010101";
  };
  export const DEFAULTTEXTMENUCOLOR = () => {
    //console.log("ThemeName",selectedTheme); 
    return selectedTheme=='light'?"#010101":"#FEFEFE";
  };


  const DEFAULTDISTANCEGAP = 0.1;
  const DEFAULTANGLEGAP = 0.5;
  const DEFAULTEDGESIZE = 0.3;
  const DEFAULTVERTEXSIZE = 0.5;
  const DEFAULTEXPLODEGAP = 10;
  const DEFAULTFROMCENTER = true;
  const DEFAULTHOLESCALE = 0.77;
  const DEFAULTREMOVEGAP = 8;
  const DEFAULTANIMATIONTIME = 1.0;
  const DEFAULTDISECT = false;
  const DEFAULTSHOWDISECT = false;
  const DEFAULTSHOWINFOONSELECT = false;
  const DEFAULTMATERIALTYPE = [{ id: 1, name: 'Basic' }];
  const DEFAULTMAXIMUMFACES = 50;
  const DEFAULTMATERIALNAME = "Basic";

  export const STATEPROPS = {
    distancegap: DEFAULTDISTANCEGAP,
    anglegap: DEFAULTANGLEGAP,
    explodegap: DEFAULTEXPLODEGAP,
    disect: DEFAULTDISECT,
    showdisect: DEFAULTSHOWDISECT,
    showinfoonselect: DEFAULTSHOWINFOONSELECT,
    materialtype: DEFAULTMATERIALTYPE,
    fromcenter: DEFAULTFROMCENTER,
    holescale: DEFAULTHOLESCALE,
    removegap: DEFAULTREMOVEGAP,
    animationtime: DEFAULTANIMATIONTIME,
    maximumfaces: DEFAULTMAXIMUMFACES,
    edgesize: DEFAULTEDGESIZE,
    vertexsize: DEFAULTVERTEXSIZE,
    materialname: DEFAULTMATERIALNAME
  };

  export const USESTYLES = makeStyles((theme) => ({

    designcontainer: {
      display: 'flex',
      '@media screen and (max-width:1400px)': {
        width: '100%',
        flexDirection: 'column-reverse',
      },
    },
    progresscontainer: {      
      '@media screen and (max-width:1400px)': {
        width: '100%',
        flexDirection: 'column-reverse',
      },
    },
    paperContainer: {
      padding: 20,
      margin: 10,
      width: '75%',
      //background: "#F3F3F3",
      backgroundColor:selectedTheme=='light'?"#F3F3F3":"#0C0C0C",
      '@media screen and  (max-width:1400px)': {
        width: '100%',
      },
    },
    itemContainer: {
      width: '25%',
      '@media screen and (max-width:1400px)': {
        width: '100%',
      },
    },
    mainContainer: {
      margin: 10,
      padding: 10,
      display: 'inline-flex',
      minWidth: '100%',
      //background: "#F3F3F3",
      backgroundColor:selectedTheme=='light'?"#F3F3F3":"#0C0C0C",
    },
    viewerContainer: {
      flex: 1,
      padding: '20px',
      margin: '0px 15px',
      display: 'inline-block',
      boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
      minWidth: '800px',
      //background: "#F3F3F3",
      backgroundColor:selectedTheme=='light'?"#F3F3F3":"#0C0C0C",
    },  
    stackContainer: {     
      padding: '20px',
      margin: '0px 15px',
      display: 'inline-block',
      boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
      minWidth: '800px',
      //background: "#F3F3F3",
      backgroundColor:selectedTheme=='light'?"#F3F3F3":"#0C0C0C",
    },     
    paper: {      
      padding: '20px',
      margin: '0px 15px',
      boxShadow: '0 0 10px rgb(0 0 0 / 20%)'
    },  
    flexpaper: {
      flex: 1,
      display: 'flex',
      padding: '20px',
      margin: '0px 15px',
      boxShadow: '0 0 10px rgb(0 0 0 / 20%)'
    },  
    container: {
      display: 'inline-block',
    },
    toolbarContainer: {
      display: 'flex',
      justifyContent: 'space-around',
    },
    tableContainer: {
      display: 'flex',
      margin: '10px 0px 0px 0px',
      flexDirection: 'row',
      flex: 1,
    },
    button: {
      flex: 1,
    },
    assemblyTreeContainer: {
      display: 'inline-block',
      minWidth: '300px'
    },
    assemblyTableContainer: {
      display: 'inline-block',
      minWidth: '600px'
    },
    table: {
      minWidth: 400
    },
    tableRow: {
      height: 30
    },
    tableCell: {
      padding: "0px 8px",
      whiteSpace: "normal",
      wordWrap: "break-word",
      wordBreak: "break-all"
    }
  }));
  export const StyledTableRow = withStyles((theme) => ({
    root: {
      height: 30,
      '&:nth-of-type(odd)': {
        backgroundColor: "white",
      },
      '&:nth-of-type(even)': {
        backgroundColor: "#FAFAFA",
      },
    }
  }))(TableRow);
  
  export const StyledTableCell = withStyles((theme) => ({
    root: {
      padding: "0px 8px"
    }
  }))(TableCell);

  const wait = function (ms = 20000) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  };

  export const pollFunction = async (fn, fnCondition, ms, setPercentage,percentFunction) => {
    let result = await fn();
    console.log("Result from poll",result);
    while (fnCondition(result)) {
      console.log("Result of poll condition",result);
      if(setPercentage){
        setPercentage(percentFunction(result));
      }
      await wait(ms);
      result = await fn();
    }
    return result;
  };
  
  