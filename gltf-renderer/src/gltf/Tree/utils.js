import { motion } from 'framer-motion'
import styled from 'styled-components'
import { stringify } from '../BeautifyJson';
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

export const prettyPrintArray= (json) => {
  if(json) {
    if (typeof json === 'string') {
      return json
    }
    return stringify(json, {maxlength:30});  		
  }
  return "No Info"
}
export const _Table = styled(motion.div)`
  width: 100%;`

export const _TdPart = styled(motion.div)`
  width: 40%;`

export const _TdPos = styled(motion.div)`
  width: 5%;`

export const _TdTexture = styled(motion.div)`
  width: 15%;`

export const _TdColor = styled(motion.div)`
  width: 10%;`

export const _TdSlider = styled(motion.div)`
  width: 10%;`