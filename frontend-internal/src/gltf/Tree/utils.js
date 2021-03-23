import { stringify } from '../BeautifyJson';

export const SELECTCOLOR = 1;
export const SELECTTEXTURE = 2;
export const SELECTMETAL = 3;
export const SELECTROUGH = 4;
export const SELECTOPAQUE = 5;
export const SELECTTICK = 6;
export const SELECTBACKCOLOR = 7;
export const SELECT2DTEXTURE = 8;
export const SELECT3DTEXTURE = 9;
export const SELECTMATERIRAL = 10;


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
      return json
    }
    if (Array.isArray(json)) {
      return json.toString();
    }
    return stringify(json, {maxlength:maxlength});  		
  }
  return "No Info"
}
