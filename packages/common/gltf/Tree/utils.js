import withStyles from '@mui/styles/withStyles';
import makeStyles from '@mui/styles/makeStyles';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
//import { useSelector } from 'react-redux';
//import { getThemeName } from '@monostruct/common/themes/base';
import { stringify } from '../BeautifyJson';
import cloneDeep from 'lodash/cloneDeep';

export const SELECTCOLOR = 1;
export const SELECTTEXTURE = 2;
export const SELECTMETAL = 3;
export const SELECTROUGH = 4;
export const SELECTOPAQUE = 5;
export const SELECTANITEM = 6;
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
export const SELECTFEATURE = 26;
export const SELECTLOADEDGES = 27;
export const SELECTCIRCULAR = 28;
export const SELECTLINEAR = 29;

let selectedTheme = 'light';

export const setSelectedTheme = (theme) => {
  console.log('Before Changing selected theme', selectedTheme, theme);
  selectedTheme = theme;
  console.log('Before Changing selected theme', selectedTheme, theme);
};

export const hexToRGB = (hex) => {
  var c;
  if (hex) {
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return [
        ((c >> 16) & 255) / 255.0,
        ((c >> 8) & 255) / 255.0,
        (c & 255) / 255.0
      ];
    } else {
      c = hex;
      try {
        return [
          ((c >> 16) & 255) / 255.0,
          ((c >> 8) & 255) / 255.0,
          (c & 255) / 255.0
        ];
      } finally {
      }
    }
  }
  return [0, 0, 0];
};

export const componentToHex = (c) => {
  var inte = Math.round(c * 255);
  var hex = inte.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
};

export const rgbToHex = (r, g, b) => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
};
export const getFloat = (value) => {
  const floatvalue = parseFloat(value);
  if (isNaN(floatvalue)) return 0.0;
  return floatvalue;
};
export const getTexture = (texture) => {
  if (texture) {
    //console.log("Assigning correct object",texture);
    return [texture];
  }
  //console.log("I am assigning emoty array");
  return [{ id: null, name: null }];
};

export const prettyPrintArray = (json, maxlength = 30) => {
  if (json) {
    if (typeof json === 'string') {
      //console.log("I got String");
      return json;
    }
    if (Array.isArray(json)) {
      //console.log("I got Array");
      try {
        return stringify(json, { maxlength: maxlength });
      } catch (error) {
        return json.toString();
      }
    }

    return stringify(json, { maxlength: maxlength });
  }
  return 'No Info';
};

export const gltf_Dict = {
  id: 'i',
  parentId: 'p',
  step: 's',
  name: 'n',
  topLeft: 't',
  bottomRight: 'b',
  indent: 'd',
  leaf: 'l',
  R: 'R',
  G: 'G',
  B: 'B',
  A: 'A',
  texture: 'T',
  metallicFactor: 'm',
  roughnessFactor: 'r',
  structures: 'S',
  bin: 'I',
  selected: 'C',
  display: 'D',
  subfeatures: 'f',
  element: 'e',
  geometry: 'g',
  points: 'P',
  entity: 'E',
  firstU: 'f',
  lastU: 'l',
  distance: 'd',
  code: 'c',
  firstP: 'F',
  lastP: 'L',
  radius: 'r',
  major: 'M',
  minor: 'm',
  center: 'C',
  xdir: 'X',
  ydir: 'Y',
  obb: 'Z',
  focal: 'R',
  degree: 'D',
  start: 'S',
  end: 'E',
  pole: 'p',
  poles: 'P',
  weights: 'W',
  periodic: 'I',
  rational: 'i',
  knots: 'K',
  knot: 'k',
  multiplicities: 'u',
  sequences: 's',
  offset: 'O',
  curve: 'U',
  direction: 'V',
  basic: 'b'
};
export const element_Dict = {
  P: 'PART',
  F: 'FACE',
  E: 'EDGE',
  V: 'VERTEX',
  e: 'SLICER',
  f: 'SLICER',
  v: 'SLICER',
  ' ': 'ASSEMBLY'
};
export const defaultGDTTable = {
  edges: [],
  selectedObjects: [],
  parentObjects: [],
  mates: [],
  mateValues: [false, false, false, false, false, false],
  angle: 0,
  offset: 0,
  option: SELECTFEATURE,
  key: ''
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

const cloneDeepWithoutError = (arr) => {
  try {
    return cloneDeep(arr);
  } catch (error) {}
};

export const arrayCopy = (arr, dict = [], deepcopy = true) => {
  if (dict.length == 0 && deepcopy) {
    return cloneDeepWithoutError(arr);
  }
  var copy_selectobjects = [];
  arr.forEach((element) => {
    let myElement = {};
    if (dict.length == 0) {
      if (deepcopy) {
        myElement = cloneDeepWithoutError(element);
      } else {
        myElement = element;
      }
    } else {
      dict.forEach((dictionary) => {
        myElement[dictionary] = cloneDeepWithoutError(element[dictionary]);
      });
    }
    copy_selectobjects.push(myElement);
  });
  return copy_selectobjects;
};

/* export const arrayCopy = (arr, dict = [], deepcopy = true) => {
  var copy_selectobjects = [];
  arr.forEach((element) => {
    let myElement = {};
    if (dict.length == 0) {
      if (deepcopy) {
        myElement = { ...element };
      } else {
        myElement = element;
      }
    } else {
      dict.forEach((dictionary) => {
        myElement[dictionary] = element[dictionary];
      });
    }
    copy_selectobjects.push(myElement);
  });
  return copy_selectobjects;
}; */
export const MUST_DICTIONARY = [
  'i',
  'p',
  's',
  'n',
  't',
  'b',
  'l',
  'R',
  'G',
  'B',
  'A',
  'S',
  'I',
  'D',
  'f',
  'e',
  'g',
  'P',
  'E',
  'd',
  'c',
  'r',
  'structures',
  'parentnode',
  'type',
  'kind',
  'Info',
  'fill',
  'obb',
  'axis',
  'diameter',
  'radius'
];
export const elementCopy = (element, dict = [], deepCopy = true) => {
  let myElement = {};
  try {
    if (dict.length == 0 && deepCopy) {
      myElement = cloneDeepWithoutError(element);
    } else {
      dict.forEach((dictionary) => {
        if (deepCopy) {
          myElement[dictionary] = cloneDeepWithoutError(element[dictionary]);
        } else {
          myElement[dictionary] = element[dictionary];
        }
      });
    }
  } catch (error) {}

  return myElement;
};
export const assignDictionary = (element, dict = MUST_DICTIONARY) => {
  let myElement = {};
  if (dict.length == 0) {
    myElement = cloneDeepWithoutError(element);
  } else {
    dict.forEach((dictionary) => {
      myElement[dictionary] = cloneDeepWithoutError(element[dictionary]);
    });
  }
  return myElement;
};
export const assignArray = (element, dict = MUST_DICTIONARY) => {
  return arrayCopy(element, dict);
};
//const themeDictionary = useSelector((state) => state.theme.curThemeName);
//const themeName =getThemeName(themeDictionary);
//const themeName = selectedTheme;//getThemeName(themeDictionary);

export const DEFAULTSELECTCOLOR = () => {
  //console.log("ThemeName",selectedTheme);
  return selectedTheme == 'light' ? '#17FF17' : '#E800E8';
};
export const DEFAULTTOUCHCOLOR = () => {
  //console.log("ThemeName",selectedTheme);
  return selectedTheme == 'light' ? '#FF1717' : '#00E8E8';
};
export const DEFAULTBACKCOLOR = () => {
  //console.log("ThemeName",selectedTheme);
  return selectedTheme == 'light' ? '#FFFFFF' : '#424242';
};
export const DEFAULTTEXTCOLOR = () => {
  //console.log("ThemeName",selectedTheme);
  return selectedTheme == 'light' ? '#1717FF' : '#E8E800';
};
export const DEFAULTBACKMENUCOLOR = () => {
  //console.log("ThemeName",selectedTheme);
  return selectedTheme == 'light' ? '#FEFEFE' : '#010101';
};
export const DEFAULTTEXTMENUCOLOR = () => {
  //console.log("ThemeName",selectedTheme);
  return selectedTheme == 'light' ? '#010101' : '#FEFEFE';
};
export const DEFAULTROWSELECTCOLOR = () => {
  //console.log("ThemeName",selectedTheme);
  return selectedTheme == 'light' ? '#7C7C7C' : '#838383';
};
const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.1;
const DEFAULTEDGESIZE = 0.3;
const DEFAULTVERTEXSIZE = 0; //Make it to 0.5, if vertices are needed.
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
const DEFAULTMATERIALNAME = 'Basic';
const DEFAULTMAXPARTS = 150;
export const DEFAULTEDGECOLOR = 0x000000;

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
  maximumparts: DEFAULTMAXPARTS,
  edgesize: DEFAULTEDGESIZE,
  vertexsize: DEFAULTVERTEXSIZE,
  materialname: DEFAULTMATERIALNAME,
  edgecolor: DEFAULTEDGECOLOR
};

export const USESTYLES = makeStyles((theme) => ({
  designcontainer: {
    display: 'flex',
    '@media screen and (max-width:1400px)': {
      width: '100%',
      flexDirection: 'column-reverse'
    }
  },
  progresscontainer: {
    '@media screen and (max-width:1400px)': {
      width: '100%',
      flexDirection: 'column-reverse'
    }
  },
  paperContainer: {
    padding: 20,
    margin: 10,
    width: '75%',
    //background: "#F3F3F3",
    backgroundColor: selectedTheme == 'light' ? '#F3F3F3' : '#0C0C0C',
    '@media screen and  (max-width:1400px)': {
      width: '100%'
    }
  },
  itemContainer: {
    width: '25%',
    '@media screen and (max-width:1400px)': {
      width: '100%'
    }
  },
  mainContainer: {
    display: 'inline-flex',
    minWidth: '100%',
    //background: "#F3F3F3",
    backgroundColor: selectedTheme == 'light' ? '#F3F3F3' : '#0C0C0C'
  },
  viewerContainer: {
    flex: 1,
    padding: '20px',
    margin: '0px 15px',
    display: 'inline-block',
    boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
    minWidth: '800px',
    //background: "#F3F3F3",
    backgroundColor: selectedTheme == 'light' ? '#F3F3F3' : '#0C0C0C'
  },
  stackContainer: {
    padding: '20px',
    margin: '0px 15px',
    display: 'inline-block',
    boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
    minWidth: '800px',
    //background: "#F3F3F3",
    backgroundColor: selectedTheme == 'light' ? '#F3F3F3' : '#0C0C0C'
  },
  paper: {
    padding: '20px',
    margin: '0px 15px',
    boxShadow: '0 0 10px rgb(0 0 0 / 20%)'
  },
  flexpaper: {
    flex: 1,
    display: 'flex',
    boxShadow: '0 0 10px rgb(0 0 0 / 20%)'
  },
  container: {
    display: 'inline-block'
  },
  toolbarContainer: {
    display: 'flex',
    justifyContent: 'space-around'
  },
  tableContainer: {
    display: 'flex',
    margin: '10px 0px 0px 0px',
    flexDirection: 'row',
    flex: 1
  },
  button: {
    flex: 1
  },
  assemblyTreeContainer: {
    display: 'inline-block',
    minWidth: '300px',
    minHeight: '100%'
  },
  assemblyTableContainer: {
    display: 'inline-block',
    minWidth: '700px',
    maxWidth: '700px'
  },
  table: {
    minWidth: 400
  },
  tableRow: {
    height: 30
  },
  tableCell: {
    padding: '0px 8px',
    whiteSpace: 'normal'
  }
}));
export const StyledTableRow = withStyles((theme) => ({
  root: {
    height: 30,
    '&:nth-of-type(odd)': {
      backgroundColor: 'white'
    },
    '&:nth-of-type(even)': {
      backgroundColor: '#FAFAFA'
    }
  }
}))(TableRow);

export const StyledTableCell = withStyles((theme) => ({
  root: {
    padding: '0px 8px',
    width: '25%'
  }
}))(TableCell);

export const waitFunction = function (ms = 20000) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const convertToHourMinuteSeconds = (value) => {
  let iseconds = Math.floor(value);
  let hours = Math.floor(iseconds / 3600); // get hours
  let minutes = Math.floor((iseconds - hours * 3600) / 60); // get minutes
  let seconds = iseconds - hours * 3600 - minutes * 60; //  get seconds
  // add 0 if value < 10; Example: 2 => 02
  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  let retString = hours + ':' + minutes + ':' + seconds;
  console.log('Timings', retString, value);
  return retString; // Return is HH : MM : SS
};

export const pollFunction = async (
  fnFunction,
  fnCondition,
  ms,
  setPercentage,
  percentFunction,
  setCurrentProgress,
  setCompletionProgress
) => {
  const getTimingStrings = (resultdata) => {
    if (resultdata && resultdata.data) {
      if (setCurrentProgress || setCompletionProgress) {
        const currenttime = resultdata.data.current || '';
        const currenttimearray = currenttime.split('-');
        const starttime = resultdata.data.start || '';
        const starttimearray = starttime.split('-');
        let difference = 0;

        try {
          difference =
            (currenttimearray[0] - starttimearray[0]) * 60 * 60 +
            (currenttimearray[1] - starttimearray[1]) * 60 +
            (currenttimearray[2] - starttimearray[2]);
        } catch (error) {
          console.log(
            'Error while getting time',
            error,
            currenttimearray,
            starttimearray
          );
        }

        if (difference < 0) {
          difference += 24 * 60 * 60;
        }
        if (difference >= 0) {
          setCurrentProgress(convertToHourMinuteSeconds(difference));
        } else {
          console.log('Problem getting current progress', difference);
        }
        const currentvalue = percentFunction(resultdata) || 0;
        if (currentvalue > 0) {
          const predictDifference =
            (100 * difference) / currentvalue - difference;
          if (predictDifference >= 0) {
            setCompletionProgress(
              (result.data.action ? result.data.action : '') +
                convertToHourMinuteSeconds(predictDifference)
            );
          } else {
            console.log(
              'Problem getting completion progress',
              predictDifference,
              difference,
              currentvalue,
              (100 * difference) / currentvalue
            );
          }
        } else {
          if (result.data.action) {
            setCompletionProgress(result.data.action);
          }
          console.log('Percentage is zero');
        }
        setPercentage(currentvalue);
      } else {
        setPercentage(percentFunction(resultdata));
      }
    }
  };
  let result = { data: {} };
  try {
    result = await fnFunction();
  } catch (error) {
    console.log('Error while doing fnFunction', error);
  }
  console.log('Result from poll', result);
  while (fnCondition(result)) {
    console.log('Result of poll condition', result);
    if (setPercentage) {
      getTimingStrings(result);
    }
    await waitFunction(ms);
    result = { data: {} };
    try {
      result = await fnFunction();
    } catch (error) {
      console.log('Error while doing fnFunction', error);
    }
  }
  console.log('Result of final poll condition', result);
  return result;
};

/*
    Moved to fileuploadapi.. 
    export const isFileExistingInServer = (urlAsFile) => {
    try {
      var xhr = new XMLHttpRequest();
      try {
        xhr.open('HEAD', urlAsFile, false);
        xhr.send();
        return xhr.status !== 404;
      } catch (exception) {
        console.log(exception);
        return false;
      }      
    } catch (error) {
      console.log(error);
      return false;
    }   
  }; */

export const checkDBNull = (some_variable) => {
  if (typeof some_variable !== 'undefined' && some_variable !== null) {
    return false;
  }
  return true;
};

export const getFileNameWithoutExtension = (filename) => {
  let filenameWithExtension = filename.replace(/^.*[\\\/]/, '');
  const lastDotIndex = filenameWithExtension.lastIndexOf('.');
  if (lastDotIndex != -1) {
    filenameWithExtension = filenameWithExtension.substring(0, lastDotIndex);
  }
  return filenameWithExtension;
};

export const isEmptyObjectDictionary = (obj) => {
  for (var x in obj) {
    if (obj.hasOwnProperty(x)) return false;
  }
  return true;
};

export const PROCESSINGSTATUS = {
  PROCESSED: 0,
  INPROGRESS: 1,
  HUNG: 2,
  NOTSTARTED: 3
};
