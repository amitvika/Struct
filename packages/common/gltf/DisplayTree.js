/**
 * COMPONENTS AND LIBS
 */
//import * as React from 'react'
import {  useState } from "react";
import { motion } from 'framer-motion'
import styled, { ThemeProvider, StyledEngineProvider } from 'styled-components';
import Container from './Tree/Container'
import Icon from './Tree/Icon'

//STYLES
import coreTheme from './styles/theme'
//import { _TdTexture } from './Tree/utils'
const MotionTree = styled(motion.div)`
  display: flex;
  flex-direction: column;
  ${props => (props.grow ? 'flex-grow: 1' : '')};
  padding: 5px;
  padding-bottom:100px;
  padding-right:20px;
  overflow-y: auto;
  width: ${props => {
    return props.size && props.theme.app.sizes[props.size]
      ? `${props.theme.app.sizes[props.size]};`
      : 'auto;'
  }}
    
  color: ${props => props.theme[props.currentTheme].text};
  background-color: ${props => props.theme[props.currentTheme].bg};

  & * {    
    cursor: pointer;
    box-sizing: border-box;
  }
  table {
    table-layout: fixed;
    width: 100%;
    border: 1px solid red;
  }
  th {
    background: darkblue;
    color: white;
  }
  td {
    border: 1px solid blue; 
    word-wrap: break-word;   
  }
  .tdpart {
    width: 26%
  }
  .tdselect {
    width: 4%
  }
  .tdpos {
    width: 12%
  }
  .tdtexture {
    width : 15%
  }
  .tdcolor {
    width : 6%
  }
  .tdslider {
    width : 10%
  }
  .tdshow {
    width : 7%
  }
  .tdstruct1 {
    width : 22%
  }
  .tdpart1 {
    width: 22%
  }
  .tdselect1 {
    width: 3%
  }
  .tdpos1 {
    width: 8%
  }
  .tdtexture1 {
    width : 12%
  }
  .tdcolor1 {
    width : 6%
  }
  .tdslider1 {
    width : 7%
  }
  .tdshow1 {
    width : 6%
  }
  .tdinfo {
    width : 60%
  }
  .tdtype {
    width : 40%
  }
`

const Loader = styled(motion.div)`
  align-self: center;
  margin: auto 0;
`

//const Spinner = styled(motion.div)``

const DisplayTree = (props) => {
  // PROPS
  const {
    size,
    nodes,
    isLoading,
    onSelect,
    customTheme,
    theme,
    grow,
    showEmptyItems,
    iconSet,
    noIcons,
    containerStyle,
    textures,
    structure,
    disectparts,
    selectitems,
    firstshell,
    secondshell,
  } = props

  const [_theme, setTheme] = useState(
    Object.assign({}, customTheme, coreTheme)
  )

  // STATE
  //const _nodeList = React.useRef(nodes).current
  const [_selected, _setSelected] = useState(null)

  // select the node and call onSelect callback
  const selectNode = (selectedNode,what) => {
    _setSelected(selectedNode)
    onSelect(selectedNode,what)
  }
  //const classAppend = disectparts ? "1" : 0;
  //console.log("Tree", structure);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={_theme}>
        
        <MotionTree
          grow={grow}
          currentTheme={theme || 'dark'}
          size={size}
          style={{ ...containerStyle }}
        >
          {!!nodes.length && structure && (
            <div>
              <table>
              <thead>
                <tr>              
                  <th className ={disectparts?"tdpart1":"tdpart"}>Part</th>
                  <th className ={disectparts?"tdselect1":"tdselect"}>Tick</th>
                  <th className ={disectparts?"tdpos1":"tdpos"}>Position</th>
                  <th className ={disectparts?"tdcolor1":"tdcolor"}>Color</th>
                  <th className ={disectparts?"tdtexture1":"tdtexture"}>Texture</th>
                  <th className ={disectparts?"tdslider1":"tdslider"}>Metal</th>
                  <th className ={disectparts?"tdslider1":"tdslider"}>Rough</th>
                  <th className ={disectparts?"tdslider1":"tdslider"}>Opaque</th>
                  <th className ={disectparts?"tdshow1":"tdshow"}>Details</th>
                  {disectparts &&(
                    <th className = "tdstruct1" >Structure</th>    
                  )}                  
                </tr>   
              </thead>
              </table>
              <Container
                selected={_selected}
                onSelect={selectNode}
                parent={null}
                nodes={nodes}
                currentTheme={theme || 'dark'}
                noIcons={noIcons}
                iconSet={iconSet}
                showEmptyItems={showEmptyItems}
                textures={textures}
                structure={structure}
                disectparts={disectparts}
                selectitems={selectitems}
                firstshell={firstshell}
                secondshell={secondshell}
              />
           
            </div>
          )}
          {!!nodes.length && !structure && (
            <div>
              <table>
              <thead>
              <tr>
              <td className="tdtype">Type</td>
              <td className="tdinfo">Info</td>           
              </tr>            
              </thead>
              </table>
              <Container
                selected={_selected}
                onSelect={selectNode}
                parent={null}
                nodes={nodes}
                currentTheme={theme || 'dark'}
                noIcons={noIcons}
                iconSet={iconSet}
                showEmptyItems={showEmptyItems}
                textures={textures}
                structure={structure}
                disectparts={disectparts}
                selectitems={selectitems}
                firstshell={firstshell}
                secondshell={secondshell}
              />
           
            </div>
          )}
          {!isLoading && !nodes.length && (
            <Loader>
              <p>No data :(</p>
            </Loader>
          )}
          {isLoading && (
            <Loader>
              {!noIcons && (
                <Icon
                  size="xlarge"
                  spin
                  currentTheme={theme || 'dark'}
                  icon={
                    iconSet && iconSet['loader'] ? iconSet['loader'] : 'loader'
                  }
                />
              )}
            </Loader>
          )}
        </MotionTree>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

DisplayTree.defaultProps = {
  nodes: [],
  size: 'full',
  isLoading: false,
  onSelect: () => {},
  customTheme: {
    dark: {
      text: '#fafafa',
      bg: '#2d3439',
      highlight: '#3f464e'
    }
  },
  theme: 'dark',
  grow: false,
  showEmptyItems: false,
  iconSet: null,
  noIcons: false,
  containerStyle: undefined,
  textures:[],
  structure:true,
  disectparts:false,
  selectitems:false,
  firstshell:null,
  secondshell:null,
}

export default DisplayTree
