/**
 * COMPONENTS AND LIBS
 */
import * as React from 'react'
import { motion } from 'framer-motion'
import styled, { ThemeProvider } from 'styled-components'
import Container from './Tree/Container'
import Icon from './Tree/Icon'

//STYLES
import coreTheme from './styles/theme'
const _Tree = styled(motion.div)`
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
  
  td {
    border: 1px solid blue; 
    word-wrap: break-word;   
  }
`

const Loader = styled(motion.div)`
  align-self: center;
  margin: auto 0;
`

const Spinner = styled(motion.div)``

const DisplayStructure = (props) => {
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
  } = props

  const [_theme, setTheme] = React.useState(
    Object.assign({}, customTheme, coreTheme)
  )

  // STATE
  const _nodeList = React.useRef(nodes).current
  const [_selected, _setSelected] = React.useState(null)

  // select the node and call onSelect callback
  const selectNode = (selectedNode,what) => {
    _setSelected(selectedNode)
    onSelect(selectedNode,what)
  }
  //console.log("Tree", structure);
  return (
    <ThemeProvider theme={_theme}>
      
      <_Tree
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
            <td>Part</td>
            <td>Position</td>
            <td>Color</td>
            <td>Texture</td>
            <td>Metal</td>
            <td>Rough</td>
            <td>Opaque</td>
            <td>Structure</td>
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
            />
         
          </div>
        )}
        {!!nodes.length && !structure && (
          <div>
            <table>
            <thead>
            <tr>
            <td>Type</td>
            <td>Info</td>           
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
      </_Tree>
    </ThemeProvider>
  )
}

DisplayStructure.defaultProps = {
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
  grow: true,
  showEmptyItems: false,
  iconSet: null,
  noIcons: false,
  containerStyle: undefined,
  textures:[],
  structure:false,
}

export default DisplayStructure
