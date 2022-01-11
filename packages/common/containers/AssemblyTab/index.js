import React, { useState, useEffect, Component } from 'react';

import { gltf_Dict, elementCopy } from '@monostruct/common/gltf/Tree/utils';

import ToysOutlinedIcon from '@mui/icons-material/ToysOutlined';
import FilterDramaSharpIcon from '@mui/icons-material/FilterDramaSharp';
import AllInboxOutlinedIcon from '@mui/icons-material/AllInboxOutlined';
import FiberManualRecordOutlinedIcon from '@mui/icons-material/FiberManualRecordOutlined';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

import classNames from 'classnames';
import Tree from 'react-virtualized-tree';
import { renderers, FilteringContainer } from 'react-virtualized-tree';

import 'react-virtualized/styles.css';
import 'react-virtualized-tree/lib/main.css';
import 'material-icons/css/material-icons.css';

const { Expandable } = renderers;
const SELECT = 3;

const Selection = (props) => {
  const { node, children, onChange, measure } = props;

  const { state: { selected } = { selected: node.selectedshell } } = node;
  useEffect(() => {
    measure();
  }, []);

  useEffect(() => {
    measure();
  }, [node]);

  const className = classNames({
    'mi mi-check-box flex-wrap': selected,
    'mi mi-check-box-outline-blank flex-wrap': !selected
  });

  return (
    <span>
      <i
        className={className}
        onClick={() => {
          onChange({
            node: {
              ...node,
              state: {
                ...(node.state || {}),
                selected: !selected
              }
            },
            type: SELECT
          });
        }}
      />
      {children}
    </span>
  );
};

class Extensions extends Component {
  state = {
    nodes: this.props.nodes
  };

  componentDidMount() {
    this.setState(this.props.nodes);
  }
  componentDidUpdate(prevProps, prevState) {
    //console.log("Updating Props",prevProps,prevState,this.props);
    if (prevProps.nodes !== this.props.nodes) {
      this.setState({ nodes: this.props.nodes });
    }
  }
  handleExpandChange = (nodes) => {
    this.setState({ nodes: nodes });
    //console.log("On Expand", nodes);
    if (this.props.onExpanisonChange) {
      this.props.onExpanisonChange(nodes);
    }
  };

  handleSelectChange = (nodes, updatedNode) => {
    this.setState({ nodes: nodes });
    const mySelectedNodes = this.nodeFindHandler(nodes, updatedNode);
    //console.log(updatedNode);
    if (updatedNode.selectedshell) {
      mySelectedNodes.push(updatedNode); // If this is not in the last promise overacts to select nothing..
    }
    if (this.props.onSelectionChange) {
      //console.log("On Select", mySelectedNodes, nodes);
      this.props.onSelectionChange(mySelectedNodes);
    } else {
      //console.log("No On Select", nodes, mySelectedNodes);
    }
  };

  findSelectedNodes = (nodes, updatedNode) => {
    //console.log("finding",nodes);
    if (nodes.selectedshell && updatedNode.id != nodes.id) {
      return [nodes];
    } else {
      return [];
    }
  };

  nodeFindHandler = (nodes, updatedNode) => {
    let output = [];
    nodes.map((node) => {
      if (node.children && node.children.length > 0) {
        output = [
          ...output,
          ...this.findSelectedNodes(node, updatedNode),
          ...this.nodeFindHandler(node.children, updatedNode)
        ];
      } else {
        output = [...output, ...this.findSelectedNodes(node, updatedNode)];
      }
    });
    return output;
  };

  selectNodes = (nodes, selected) => {
    const myNodes = nodes.map((n) => ({
      ...n,
      children:
        n.children && n.children.length > 0
          ? this.selectNodes(n.children, selected)
          : [],
      state: {
        ...n.state,
        selected
      },
      selectedshell: selected
    }));
    //console.log("SelectNodes",myNodes);
    return myNodes;
  };

  nodeInnerSelectionHandler = (nodes, updatedNode) => {
    return nodes.map((node) => {
      if (node.id === updatedNode.id) {
        const myNode = {
          ...updatedNode,
          children:
            node.children && node.children.length > 0
              ? this.selectNodes(node.children, updatedNode.state.selected)
              : [],
          selectedshell: updatedNode.state.selected
        };
        //console.log("Top selection recursion",myNode);
        return myNode;
      }

      if (node.children && node.children.length > 0) {
        const myNode = {
          ...node,
          children: this.nodeInnerSelectionHandler(node.children, updatedNode)
        };
        //console.log("Inner selection recursion",myNode);
        return myNode;
      }
      //console.log("Bottom selection recursion",node);
      return node;
    });
  };

  nodeSelectionHandler = (nodes, updatedNode) => {
    updatedNode.selectedshell = updatedNode.state.selected;

    this.props.handleItemSelect(updatedNode);

    const myNodes = this.nodeInnerSelectionHandler(nodes, updatedNode);
    this.handleSelectChange(myNodes, updatedNode);
    return myNodes;
  };

  render() {
    return (
      <FilteringContainer className="MuiPaper-rounded" nodes={this.state.nodes}>
        {({ nodes }) => (
          <div style={{ height: 800 }}>
            <Tree
              nodes={nodes}
              onChange={this.handleExpandChange}
              extensions={{
                updateTypeHandlers: {
                  [SELECT]: this.nodeSelectionHandler
                }
              }}
            >
              {({ style, node, ...rest }) => {
                let myelement = node[gltf_Dict['element']];

                let myName = elementCopy(node[gltf_Dict['name']]);
                let myDisplay = elementCopy(node[gltf_Dict['display']]);
                let first4chars = myName.slice(0, 4);
                let first6chars = myName.slice(0, 6);
                if (myelement) {
                  first4chars = myelement;
                  first6chars = myelement;
                  if (myelement == 'F') {
                    first4chars = 'FACE';
                  } else if (myelement == 'E') {
                    first4chars = 'EDGE';
                  } else if (myelement == 'V') {
                    first6chars = 'VERTEX';
                  } else if (myelement == 'P') {
                    first4chars = 'PART';
                  } else if (
                    myelement == 'f' ||
                    myelement == 'e' ||
                    myelement == 'v'
                  ) {
                    first6chars = 'SLICER';
                  }
                }
                let myIcon = null;
                if (first4chars == 'FACE') {
                  myIcon = <ToysOutlinedIcon />;
                  myName = myName.slice(4);
                } else if (first4chars == 'EDGE') {
                  myIcon = <FilterDramaSharpIcon />;
                  myName = myName.slice(4);
                } else if (first4chars == 'PART') {
                  myIcon = <AllInboxOutlinedIcon />;
                  myName = myName.slice(4);
                } else if (first6chars == 'VERTEX') {
                  myIcon = <FiberManualRecordOutlinedIcon />;
                  myName = myName.slice(6);
                } else if (first6chars == 'SLICER') {
                  myName = myName.slice(6);
                  myIcon = <TuneOutlinedIcon />;
                } else {
                  myIcon = <DeveloperBoardOutlinedIcon />;
                }
                if (!myDisplay) {
                  myDisplay = myName;
                }
                return (
                  <div style={style}>
                    <Expandable node={node} {...rest}>
                      <Selection node={node} {...rest}>
                        {myIcon}
                        {myDisplay}
                      </Selection>
                    </Expandable>
                  </div>
                );
              }}
            </Tree>
          </div>
        )}
      </FilteringContainer>
    );
  }
}

export default function AssemblyTab(props) {
  const {
    assemblyTree,
    OnAddition,
    OnExpansion,
    handleItemSelect = () => ({})
  } = props;
  const [nodes, setNodes] = useState(assemblyTree);
  let toBuildTree = true;

  useEffect(() => {
    setMyChecked(props.assemblyTree);
  }, [props.assemblyTree]);

  useEffect(() => {
    if (toBuildTree) {
      setMyChecked(props.assemblyTree);
    }
  }, []);

  const setMyChecked = (tree) => {
    setNodes(tree);
    toBuildTree = false;
  };

  return (
    <Extensions
      onSelectionChange={OnAddition}
      onExpanisonChange={OnExpansion}
      nodes={nodes}
      handleItemSelect={handleItemSelect}
    />
  );
}
