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
  basic: 'b',
  kinematicdimension: 'q'
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

export const DEFAULTBUTTONHOVERCOLOR = () => {
  return selectedTheme == 'light' ? '#ffffff' : '#000000';
};
export const DEFAULTBUTTONHOVERBACKGROUND = () => {
  return selectedTheme == 'light' ? '#5D6D7E' : '#A29281';
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
  },
  barstats: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    maxHeight: '30px', // borderlinearprogress root.height
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    '& span': {
      width: '100%'
    }
  },
  barroot: {
    flexGrow: 1,
    gap: 1,
    height: 30,
    display: 'flex',
    padding: 1
  },
  custom_file: {
    position: 'relative',
    width: '100%',
    height: 'calc(1.5em + .75rem + 2px)'
  },
  custom_file_input: {
    zIndex: 2,
    margin: 0,
    overflow: 'hidden',
    opacity: 0,
    position: 'relative',
    width: '100%',
    height: 'calc(1.5em + .75rem + 2px)'
  },
  custom_file_label: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '.375rem .75rem',
    lineHeight: 1.5,
    color: '#495057',
    left: 0,
    zIndex: 1,
    height: 'calc(1.5em + .75rem + 2px)',
    overflow: 'hidden',
    fontWeight: 400,
    backgroundColor: '#fff',
    border: '1px solid #ced4da',
    borderRadius: '.25rem',
    '&::after': {
      bottom: 0,
      zIndex: 3,
      display: 'block',
      height: 'calc(1.5em + .75rem)',
      content: '"Browse"',
      backgroundColor: '#e9ecef',
      borderLeft: 'inherit',
      borderRadius: '0 .25rem .25rem 0',
      position: 'absolute',
      top: 0,
      right: 0,
      padding: '.375rem .75rem',
      lineHeight: 1.5,
      color: '#495057'
    }
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

export const convertToBool = (value, defaults) => {
  var boolvalue;
  if (value !== null) {
    try {
      if (typeof value === 'boolean' || value instanceof Boolean) {
        return value;
      }
      console.log('Value Got at convertToBool', value);
      if (value.toString().toLowerCase() === 'true') {
        return true;
      } else {
        if (value.toString().toLowerCase() === 'false') {
          return false;
        } else {
          boolvalue = Boolean(value);
          return boolvalue;
        }
      }
    } catch (e) {
      console.log('Error while conversion', e, value, defaults);
      return defaults;
    }
  } else {
    return defaults;
  }
};
export const convertToFloat = (value, defaults) => {
  var floatValue;
  if (value !== null) {
    if (typeof value === 'number' || value instanceof Number) {
      return value;
    }
    try {
      floatValue = Number.parseFloat(value);
      return floatValue;
    } catch (e) {
      console.log('Error while conversion', e, value, defaults);
      return defaults;
    }
  } else {
    return defaults;
  }
};
export const convertToInt = (value, defaults) => {
  var intValue;
  if (value !== null) {
    if (typeof value === 'number' || value instanceof Number) {
      return value;
    }
    try {
      intValue = Number.parseInt(value);
      return intValue;
    } catch (e) {
      console.log('Error while conversion', e, value, defaults);
      return defaults;
    }
  } else {
    return defaults;
  }
};
export const getValueFromJSONKey = (jsonstruct, key) => {
  if (jsonstruct !== null) {
    if (key !== null) {
      if (jsonstruct[key] !== undefined) {
        return jsonstruct[key];
      }
    }
  }
  return null;
};
export const getNotNone = (dict, defaults) => {
  return dict !== null ? dict : defaults;
};
export const findAnyOne = (chain1, chain2) => {
  var length1, length2;
  length1 = chain1.length;
  length2 = chain2.length;
  if (length1 < length2) {
    for (
      var achain, _pj_c = 0, _pj_a = chain1, _pj_b = _pj_a.length;
      _pj_c < _pj_b;
      _pj_c += 1
    ) {
      achain = _pj_a[_pj_c];
      if (chain2.includes(achain)) {
        return true;
      }
    }
  } else {
    for (
      var achain, _pj_c = 0, _pj_a = chain2, _pj_b = _pj_a.length;
      _pj_c < _pj_b;
      _pj_c += 1
    ) {
      achain = _pj_a[_pj_c];
      if (chain1.includes(achain)) {
        return true;
      }
    }
  }
  return false;
};
export const sorted = (items, kwargs = {}) => {
  const key = kwargs.key === undefined ? (x) => x : kwargs.key;
  const reverse = kwargs.reverse === undefined ? false : kwargs.reverse;
  const sortKeys = items.map((item, pos) => [key(item), pos]);
  const comparator = Array.isArray(sortKeys[0][0])
    ? (left, right) => {
        for (var n = 0; n < Math.min(left.length, right.length); n++) {
          const vLeft = left[n],
            vRight = right[n];
          const order = vLeft == vRight ? 0 : vLeft > vRight ? 1 : -1;
          if (order != 0) return order;
        }
        return left.length - right.length;
      }
    : (left, right) => {
        const vLeft = left[0],
          vRight = right[0];
        const order = vLeft == vRight ? 0 : vLeft > vRight ? 1 : -1;
        return order;
      };
  sortKeys.sort(comparator);
  if (reverse) sortKeys.reverse();
  return sortKeys.map((order) => items[order[1]]);
};
export const range = (start, stop, step) => {
  if (typeof stop == 'undefined') {
    // one param defined
    stop = start;
    start = 0;
  }

  if (typeof step == 'undefined') {
    step = 1;
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return [];
  }

  var result = [];
  for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i);
  }

  return result;
};
export const extractKinematicInformation = (kinematicparts) => {
  var BelowFound,
    TopFound,
    angle,
    angle2,
    aw,
    ax,
    axis,
    axis2,
    axisAngle,
    axisAngle2,
    axisDict,
    axisDistance,
    axisDistance2,
    ay,
    az,
    chains,
    chains2,
    currentIndex,
    displayName,
    displayName2,
    distance,
    distance2,
    doLinkageAxis,
    doRotateAxis,
    findAcutator,
    forceAngle,
    isActuator,
    isEndEffector,
    isEndEffector2,
    isLinear,
    isLinear2,
    kinematicInformation,
    kinematicinfo,
    lengthOfKinematicInfo,
    machineLimit,
    machineLimit2,
    maxAngle,
    maxChain,
    maxRangeSequence,
    maxSequence,
    myInfo,
    myobb,
    nextAxis,
    nextAxis2,
    partName,
    partName2,
    partType,
    partType2,
    remainingLength,
    sequence,
    sequence2,
    position,
    px,
    py,
    pz,
    axisPosition,
    position2,
    axisPosition2;
  console.log('');
  kinematicInformation = [];
  maxChain = -1;
  maxAngle = -10000000000.0;
  for (
    var kinematicpart, _pj_c = 0, _pj_a = kinematicparts, _pj_b = _pj_a.length;
    _pj_c < _pj_b;
    _pj_c += 1
  ) {
    kinematicpart = _pj_a[_pj_c];
    myInfo = [
      null,
      null,
      'STATIC',
      0,
      0,
      [0, 0, 0],
      0,
      0,
      0,
      false,
      0,
      false,
      false
    ];
    if (kinematicpart['actuator_motion_control'] !== undefined) {
      kinematicinfo = kinematicpart['actuator_motion_control'];
      myInfo = [
        getValueFromJSONKey(kinematicinfo, 'child_part_name'),
        getValueFromJSONKey(kinematicinfo, 'child_part_display_name'),
        getValueFromJSONKey(kinematicinfo, 'child_part_type'),
        getValueFromJSONKey(kinematicinfo, 'axis_number'),
        getValueFromJSONKey(kinematicinfo, 'child_sequence_number'),
        getValueFromJSONKey(kinematicinfo, 'cylindrical_axis_of_rotation'),
        getValueFromJSONKey(kinematicinfo, 'chain_number'),
        getValueFromJSONKey(kinematicinfo, 'chain_number'),
        getValueFromJSONKey(kinematicinfo, 'machine_actuator_limit'),
        getValueFromJSONKey(kinematicinfo, 'is_linear_or_rotational'),
        getValueFromJSONKey(kinematicinfo, 'chain_number'),
        getValueFromJSONKey(kinematicinfo, 'is_actuator_or_chain_link'),
        getValueFromJSONKey(kinematicinfo, 'is_end_effector')
      ];
    } else {
      kinematicinfo = 'No Information for kinematic info';
    }
    [
      partName,
      displayName,
      partType,
      sequence,
      chains,
      axisDict,
      angle,
      distance,
      machineLimit,
      isLinear,
      aw,
      isActuator,
      isEndEffector
    ] = myInfo;
    //console.log('What I got as Axis', axisDict, kinematicinfo, myInfo);
    axis = null;
    position = null;
    if (axisDict === null) {
      axis = [0, 0, 0];
      position = [0, 0, 0];
    } else {
      if (axisDict['axis'] !== undefined) {
        axis = axisDict['axis'];
      }
      if (axisDict['position'] !== undefined) {
        position = axisDict['position'];
      }
    }
    forceAngle = isActuator !== null;
    isActuator = !convertToBool(isActuator, false);
    if (partType === null || forceAngle) {
      forceAngle = true;
      if (isActuator) {
        partType = 'ACTUATOR';
      } else {
        partType = 'LINKAGE';
      }
    }
    if (partType === null) {
      partType = 'STATIC';
    }
    if (partName === null) {
      partName = getValueFromJSONKey(kinematicpart, 'filePartName');
    }
    if (displayName === null) {
      displayName = getValueFromJSONKey(kinematicpart, 'name');
    }
    if (position === null) {
      position = [0, 0, 0];
    }
    if (axis === null) {
      axis = [0, 0, 0];
    } else {
      if (typeof axis !== 'object' || axis instanceof Array === false) {
        if (axis['xx'] !== undefined) {
          axis = [axis['xx'], axis['xy'], axis['xz']];
        } else {
          axis = [axis, 0, 0];
        }
      } else {
        if (axis.length > 3) {
          axis = axis.slice(0, 3);
        } else {
          if (axis.length < 3) {
            remainingLength = 3 - axis.length;
            for (
              var_pj_i = 0, _pj_d = remainingLength;
              _pj_i < _pj_d;
              _pj_i += 1
            ) {
              axis.push(0);
            }
          }
        }
      }
    }
    [ax, ay, az] = axis;
    axis = [
      convertToFloat(ax, 0),
      convertToFloat(ay, 0),
      convertToFloat(az, 0)
    ];
    [ax, ay, az] = axis;
    [px, py, pz] = position;
    position = [
      convertToFloat(px, 0),
      convertToFloat(py, 0),
      convertToFloat(pz, 0)
    ];
    [px, py, pz] = position;
    aw = convertToFloat(aw, 0);
    angle = convertToFloat(angle, 0);
    if (angle === 0 && isLinear === false) {
      angle = aw;
    }
    if (maxAngle < angle) {
      maxAngle = angle;
    }
    distance = convertToFloat(distance, 0);
    if (distance === 0 && isLinear === true) {
      distance = aw;
    }
    machineLimit = convertToFloat(machineLimit, isLinear ? distance : angle);
    if (angle === 0 && forceAngle) {
      angle = math.pi / 3;
    }
    if (
      sequence === null &&
      chains &&
      (typeof chains !== 'object' || chains instanceof Array === false)
    ) {
      sequence = chains;
      chains = [1];
    }
    sequence = convertToInt(sequence, 1);
    if (chains === null) {
      chains = [1];
    } else {
      if (typeof chains !== 'object' || chains instanceof Array === false) {
        chains = [convertToInt(chains, 1)];
      } else {
        if (chains.length === 0) {
          chains = [1];
        }
      }
    }
    for (var chain = 0, _pj_d = chains.length; chain < _pj_d; chain += 1) {
      chains[chain] = convertToInt(chains[chain], 1);
      if (maxChain < chains[chain]) {
        maxChain = chains[chain];
      }
    }
    chains = sorted(chains);
    isLinear = convertToBool(isLinear, false);
    isEndEffector = convertToBool(isEndEffector, false);
    [nextAxis, axisAngle, axisDistance, axisPosition] = [
      axis,
      angle,
      distance,
      position
    ];
    myInfo = [
      partName,
      displayName,
      partType,
      sequence,
      chains,
      axis,
      nextAxis,
      axisAngle,
      axisDistance,
      angle,
      distance,
      machineLimit,
      isLinear,
      isEndEffector,
      position,
      axisPosition
    ];
    //console.log('Each Kinematic Info', myInfo, kinematicinfo);
    kinematicInformation.push(myInfo);
  }
  lengthOfKinematicInfo = kinematicInformation.length;
  console.log(
    'Kinematic Info before arranging',
    kinematicInformation,
    lengthOfKinematicInfo
  );
  for (
    var kinematicInfo = 0, _pj_a = lengthOfKinematicInfo;
    kinematicInfo < _pj_a;
    kinematicInfo += 1
  ) {
    // console.log(
    //   'Kinematic Info of checking linkage to insert array',
    //   kinematicInfo,
    //   kinematicInformation[kinematicInfo]
    // );
    [
      partName,
      displayName,
      partType,
      sequence,
      chains,
      axis,
      nextAxis,
      axisAngle,
      axisDistance,
      angle,
      distance,
      machineLimit,
      isLinear,
      isEndEffector,
      position,
      axisPosition
    ] = kinematicInformation[kinematicInfo];
    if (partType === 'LINKAGE') {
      findAcutator = false;
      for (
        var secondPass = 0, _pj_b = lengthOfKinematicInfo;
        secondPass < _pj_b;
        secondPass += 1
      ) {
        [
          partName2,
          displayName2,
          partType2,
          sequence2,
          chains2,
          axis2,
          nextAxis2,
          axisAngle2,
          axisDistance2,
          angle2,
          distance2,
          machineLimit2,
          isLinear2,
          isEndEffector2,
          position2,
          axisPosition2
        ] = kinematicInformation[secondPass];
        if (
          partType2 === 'ACTUATOR' &&
          sequence2 === sequence &&
          findAnyOne(chains2, chains)
        ) {
          findAcutator = true;
          break;
        }
      }
      if (findAcutator) {
        kinematicInformation[kinematicInfo] = [
          partName,
          displayName,
          partType,
          sequence + 1,
          chains,
          axis,
          nextAxis,
          axisAngle,
          axisDistance,
          angle,
          distance,
          machineLimit,
          isLinear,
          isEndEffector,
          position,
          axisPosition
        ];
        for (
          var secondPass = 0, _pj_b = lengthOfKinematicInfo;
          secondPass < _pj_b;
          secondPass += 1
        ) {
          [
            partName2,
            displayName2,
            partType2,
            sequence2,
            chains2,
            axis2,
            nextAxis2,
            axisAngle2,
            axisDistance2,
            angle2,
            distance2,
            machineLimit2,
            isLinear2,
            isEndEffector2,
            position2,
            axisPosition2
          ] = kinematicInformation[secondPass];
          if (sequence2 > sequence && findAnyOne(chains2, chains)) {
            console.log(
              'Yes Setting Kinematic Info of secondPass to insert array',
              secondPass,
              kinematicInformation[secondPass]
            );
            kinematicInformation[secondPass] = [
              partName2,
              displayName2,
              partType2,
              sequence2 + 1,
              chains2,
              axis2,
              nextAxis2,
              axisAngle2,
              axisDistance2,
              angle2,
              distance2,
              machineLimit2,
              isLinear2,
              isEndEffector2,
              position2,
              axisPosition2
            ];
          } else {
            console.log(
              'Not Setting Kinematic Info of secondPass to insert array',
              secondPass,
              kinematicInformation[secondPass],
              chains2,
              chains,
              sequence2,
              sequence
            );
          }
        }
        kinematicInformation[kinematicInfo] = [
          partName,
          displayName,
          partType,
          sequence + 1,
          chains,
          axis,
          nextAxis,
          axisAngle,
          axisDistance,
          angle,
          distance,
          machineLimit,
          isLinear,
          isEndEffector,
          position,
          axisPosition
        ];
      }
    }
  }
  if (maxChain > 0) {
    var _pj_b = range(maxChain);
    maxSequence = [];
    for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
      //var x = _pj_b[_pj_c];
      maxSequence.push(-1);
    }
  } else {
    maxSequence = [];
  }

  for (
    var kinematicInfo = 0, _pj_a = lengthOfKinematicInfo;
    kinematicInfo < _pj_a;
    kinematicInfo += 1
  ) {
    [
      partName,
      displayName,
      partType,
      sequence,
      chains,
      axis,
      nextAxis,
      axisAngle,
      axisDistance,
      angle,
      distance,
      machineLimit,
      isLinear,
      isEndEffector,
      position,
      axisPosition
    ] = kinematicInformation[kinematicInfo];
    for (
      var chain, _pj_d = 0, _pj_b = chains, _pj_c = _pj_b.length;
      _pj_d < _pj_c;
      _pj_d += 1
    ) {
      chain = _pj_b[_pj_d];
      if (chain > 0) {
        if (maxSequence[chain - 1] < sequence) {
          maxSequence[chain - 1] = sequence;
        }
      }
    }
  }

  console.log('Chains presence', maxChain);
  for (
    var chainIndex = 0, _pj_a = maxChain;
    chainIndex < _pj_a;
    chainIndex += 1
  ) {
    maxRangeSequence = maxSequence[chainIndex];
    console.log('Sequence presence', chainIndex, maxRangeSequence);
    for (
      var sequenceIndex = 0, _pj_b = maxRangeSequence;
      sequenceIndex < _pj_b;
      sequenceIndex += 1
    ) {
      currentIndex = maxRangeSequence - 1 - sequenceIndex;
      TopFound = -1;
      BelowFound = -1;
      doRotateAxis = false;
      doLinkageAxis = false;
      for (
        var kinematicInfo = 0, _pj_c = lengthOfKinematicInfo;
        kinematicInfo < _pj_c;
        kinematicInfo += 1
      ) {
        [
          partName,
          displayName,
          partType,
          sequence,
          chains,
          axis,
          nextAxis,
          axisAngle,
          axisDistance,
          angle,
          distance,
          machineLimit,
          isLinear,
          isEndEffector,
          position,
          axisPosition
        ] = kinematicInformation[kinematicInfo];
        // console.log(
        //   'What I got for axis copy',
        //   currentIndex,
        //   kinematicInformation[kinematicInfo],
        //   chainIndex + 1,
        //   chains,
        //   sequence,
        //   chains.includes(chainIndex + 1),
        //   sequence === currentIndex,
        //   sequence === currentIndex + 1
        // );
        if (chains.includes(chainIndex + 1) && sequence === currentIndex) {
          BelowFound = kinematicInfo;
          doRotateAxis = partType === 'ACTUATOR';
          doLinkageAxis = partType !== 'ACTUATOR';
        }
        if (chains.includes(chainIndex + 1) && sequence === currentIndex + 1) {
          TopFound = kinematicInfo;
          if (currentIndex === 0) {
            BelowFound = TopFound;
            doRotateAxis = partType === 'ACTUATOR';
          }
        }
        if (TopFound !== -1 && BelowFound !== -1) {
          break;
        }
      }
      if (doRotateAxis && TopFound !== -1) {
        [
          partName,
          displayName,
          partType,
          sequence,
          chains,
          axis,
          nextAxis,
          axisAngle,
          axisDistance,
          angle,
          distance,
          machineLimit,
          isLinear,
          isEndEffector,
          position,
          axisPosition
        ] = kinematicInformation[TopFound];
        [
          partName2,
          displayName2,
          partType2,
          sequence2,
          chains2,
          axis2,
          nextAxis2,
          axisAngle2,
          axisDistance2,
          angle2,
          distance2,
          machineLimit2,
          isLinear2,
          isEndEffector2,
          position2,
          axisPosition2
        ] = kinematicInformation[BelowFound];
        console.log(
          'ToDo transform for actuator',
          TopFound,
          BelowFound,
          partType,
          partType2,
          doLinkageAxis,
          TopFound === BelowFound || (doLinkageAxis && partType === 'ACTUATOR')
        );
        if (TopFound === BelowFound) {
          [angle2, distance2, machineLimit2] = [0, 0, 0];
        }
        kinematicInformation[TopFound] = [
          partName,
          displayName,
          partType,
          sequence,
          chains,
          axis2,
          nextAxis,
          axisAngle,
          axisDistance,
          angle2,
          distance2,
          machineLimit2,
          isLinear2,
          isEndEffector,
          position2,
          axisPosition2
        ];
        console.log(
          'Changing info because of previous part as Actuator',
          kinematicInformation[TopFound]
        );
      }
      if (doLinkageAxis && TopFound !== -1) {
        [
          partName,
          displayName,
          partType,
          sequence,
          chains,
          axis,
          nextAxis,
          axisAngle,
          axisDistance,
          angle,
          distance,
          machineLimit,
          isLinear,
          isEndEffector,
          position,
          axisPosition
        ] = kinematicInformation[TopFound];
        [
          partName2,
          displayName2,
          partType2,
          sequence2,
          chains2,
          axis2,
          nextAxis2,
          axisAngle2,
          axisDistance2,
          angle2,
          distance2,
          machineLimit2,
          isLinear2,
          isEndEffector2,
          position2,
          axisPosition2
        ] = kinematicInformation[BelowFound];
        console.log(
          'ToDo transform for linkage',
          TopFound,
          BelowFound,
          partType,
          partType2,
          doLinkageAxis,
          TopFound === BelowFound || (doLinkageAxis && partType === 'ACTUATOR')
        );
        if (partType === 'ACTUATOR') {
          kinematicInformation[TopFound] = [
            partName,
            displayName,
            partType,
            sequence,
            chains,
            axis,
            nextAxis,
            axisAngle,
            axisDistance,
            0,
            0,
            0,
            isLinear,
            isEndEffector,
            position,
            axisPosition
          ];
          console.log(
            'Changing info because of previous part as Linkage',
            kinematicInformation[TopFound]
          );
        }
      }
    }
  }
  console.log('');
  console.log(
    'Kinematic Info after arranging',
    kinematicInformation,
    maxChain,
    maxSequence
  );
  return [kinematicInformation, maxChain, maxSequence];
};
