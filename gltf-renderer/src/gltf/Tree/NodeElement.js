import * as React from 'react'
import {  useState } from "react";
import styled from 'styled-components'
import { motion } from 'framer-motion'

import { Element } from './Elements'
import Wrapper from './Wrapper'
import Icon from './Icon'
import { NodeText } from './Text'
import Select from "../DropDown";
import Slider from "../Slider/components/Slider";
import {hexToRGB,rgbToHex,getTexture,prettyPrintArray} from "./utils";
import DisplayStructure from '../DisplayStructure';

const _IconWrapper = styled(motion.div)``

const NodeElement = (props) => {
  const {
    data,
    isOpen,
    isRoot,
    toggle,
    onSelect,
    selected,
    level,
    currentTheme,
    iconSet,
    noIcons,
    textures,
    structure,
    disectparts,
  } = props
  if (props.data === null) {
    return null
  }

 
  const [state, setstate] = useState({
    datacolor: rgbToHex(data.R || 0, data.G || 0, data.B || 0),
    datavalues: getTexture(data.texture),
    datametal: data.metallicFactor||0.1,
    datarough: data.roughnessFactor||0.7,
    dataopaque : data.A||1.0,
  })
  //console.log(data)
  return (
    <div>
    { structure && (
    <table>
      <tbody>
      <tr>
      <td>
      <Element
        isOpen={isOpen}
        isRoot={isRoot}
        onClick={() => {
          toggle()
          onSelect(data,0)
        }}
        currentTheme={currentTheme}
        selected={selected && selected.id === data.id}
      >
        <Wrapper level={level}>
          {!noIcons && (
            <_IconWrapper animate={{ rotate: isOpen ? 90 : 0 }}>
              <Icon
                size="large"
                icon={iconSet && iconSet['node'] ? iconSet['node'] : 'node'}
                currentTheme={currentTheme}
              ></Icon>
            </_IconWrapper>
          )}        
        </Wrapper>
        
        <NodeText>{data.display||data.name}</NodeText>
      
      </Element>
    </td>
    
    <td>
      x: {data.topLeft[0]?.toFixed(2) } y: {data.topLeft[1]?.toFixed(2) } z: {data.topLeft[2]?.toFixed(2) }
      </td>
      <td>
        <input
          type="color"
          defaultValue={state.datacolor}
          onChange = { 
            event => {
              if(event && event.target ) {
                //console.log("1",state)
                setstate({
                  datacolor: event.target.value                  
                });
                const myColors = hexToRGB(event.target.value);
                data.R = myColors[0];
                data.G = myColors[1];
                data.B = myColors[2];                
                onSelect(data,1)
                //console.log("2",state)
                //console.log("2.1",data)
              }
              
            }
          }
        />
      </td>
      <td>
      <div style={{ maxWidth: "350px", margin: "0 auto", minWidth:"100px" }}>
        <Select options={textures} multi={false} placeholder="Select A Texture" 
          labelField={"id"} valueField={"name"} dropdownHeight= {'200px'}
          values={state.datavalues}
          onChange={
            datavalues => {
                if(datavalues) {
                  //console.log(datavalues)
                  //console.log("3",state)
                  setstate({datavalues:datavalues});
                  //console.log("3.1",state)
                  if(datavalues && !!datavalues.length) { 
                    data.texture = datavalues[0];
                    onSelect(data,2)
                  }                  
                 // console.log("3.2",data) 
                 
                  //console.log("4",state)
                  //console.log("4.1",data) 
                }
                
              } }
        />
      </div>
      </td>
      <td>			
			<Slider
				value={state.datametal} 
        min={0} 
				max={1} 
				step={0.01}         
				onChange={(e) =>{  
          
          setstate({ datametal: e });
          data.metallicFactor = e;
          onSelect(data,3);
					// console.log(e) 
				} }
				
			/>
      <input style={{width: '50px'}} type="number"
        value={state.datametal} 
				min={0} 
				max={1} 
				step={0.01}  
				onChange={(e) =>{ 
          const floatvalue = parseFloat(e.target.value);          
          setstate({datametal: floatvalue});
          data.metallicFactor = floatvalue;
          onSelect(data,3);
          }} />
			</td>
			<td>
			
			<Slider				
				value={state.datarough}  
        min={0} 
				max={1} 
				step={0.01}         
				onChange={(e) =>{           
          setstate({ datarough: e });
          data.roughnessFactor = e;
          onSelect(data,4);
        }}				
			/>
     	<input style={{width: '50px'}} type="number"
				value={state.datarough} 
        min={0} 
				max={1} 
				step={0.01}
			  onChange={(e) =>{ 
          const floatvalue = parseFloat(e.target.value);
          setstate({datarough: floatvalue});
          data.roughnessFactor = floatvalue;
          onSelect(data,4);
        }} />
			
			</td>
      <td>
			
			<Slider				
				value={state.dataopaque}  
        min={0} 
				max={1} 
				step={0.01}         
				onChange={(e) =>{ 
          setstate({ dataopaque: e });
          data.A = e;
          onSelect(data,5);
        }}				
			/>
     	<input style={{width: '50px'}} type="number"
				value={state.dataopaque} 
        min={0} 
				max={1} 
				step={0.01}
			  onChange={(e) =>{ 
          const floatvalue = parseFloat(e.target.value);
          setstate({dataopaque: floatvalue});
          data.A = floatvalue;
          onSelect(data,5);
        }} />
			
			</td>
      {disectparts &&(
        <td>
         {/* {prettyPrintArray(data.structures)} */}
         <DisplayStructure nodes={data.structures} grow={true} structure={false} />
        </td>
      )}
      
  </tr>
  </tbody>
  </table>
  )}
  { !structure && (
    <table>
    <tbody>
    <tr>
    <td>
    <Element
      isOpen={isOpen}
      isRoot={isRoot}
      onClick={() => {
        toggle()
        onSelect(data,0)
      }}
      currentTheme={currentTheme}
      selected={selected && selected.id === data.id}
    >
      <Wrapper level={level}>
        {!noIcons && (
          <_IconWrapper animate={{ rotate: isOpen ? 90 : 0 }}>
            <Icon
              size="large"
              icon={iconSet && iconSet['node'] ? iconSet['node'] : 'node'}
              currentTheme={currentTheme}
            ></Icon>
          </_IconWrapper>
        )}        
      </Wrapper>
      
      <NodeText>{data.type||data.name}</NodeText>
    
    </Element>
  </td>
    <td>
    {prettyPrintArray(data.Info)}
    </td>      
  </tr>  
  </tbody>
  </table> 
  )}
  </div>
  )
}

NodeElement.defaultProps = {
  data: null,
  toggle: () => {},
  isOpen: false,
  isRoot: false,
  level: 0,
  selected: null,
  onSelect: () => {},
  currentTheme: 'dark',
  iconSet: null,
  noIcons: undefined,
  structure: true,
  disectparts: false,
}

export default NodeElement
