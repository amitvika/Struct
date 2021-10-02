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

export const DEFAULTSELECTCOLOR = "#17FF17";
export const DEFAULTTOUCHCOLOR = "#FF1717";
export const DEFAULTBACKCOLOR = "#EAEAEA";
export const DEFAULTTEXTCOLOR = "#170017";

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
    "element":"e"
  }