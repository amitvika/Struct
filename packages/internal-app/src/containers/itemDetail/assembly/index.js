import React, { useState, useEffect } from 'react';
import MaterialTable from '@material-table/core';
import Radio from '@material-ui/core/Radio';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { gltf_Dict,hexToRGB,rgbToHex } from 'src/gltf/Tree/utils';
import ColorPickerState from './ColorPickerState';
import SliderState from './SliderState';
import ToysOutlinedIcon from '@material-ui/icons/ToysOutlined';
import FilterDramaSharpIcon from '@material-ui/icons/FilterDramaSharp';
import AllInboxOutlinedIcon from '@material-ui/icons/AllInboxOutlined';
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import DeveloperBoardOutlinedIcon from '@material-ui/icons/DeveloperBoardOutlined';
/*import CheckboxTree from 'react-checkbox-tree';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import FolderLogo from '../../../assets/images/folder_logo.png'
import FolderOpenLogo from '../../../assets/images/folderOpen.png'
import ArrowRight from '../../../assets/images/right-chevron.png'
import ArrowDown from '../../../assets/images/down-chevron.png'
import PaperLogo from '../../../assets/images/paper.png'
import PlusIcon from '../../../assets/images/add.png'
import MinusIcon from '../../../assets/images/minus.png'

//import { Provider } from 'react-redux';
//import store from './redux/configureStore';
//import App from './App'; 
//import ExampleGrid from './components/examples/ExampleGridContainer'; 
//import { Router, Route, IndexRoute, browserHistory } from 'react-router';
//import { syncHistoryWithStore } from 'react-router-redux';
//import './index.css';

//import './components/examples/bootstrap/css/bootstrap.min.css';
//const history = syncHistoryWithStore(browserHistory, store) 



import {Grid, applyGridConfig } from 'react-redux-grid';
import {
  columns,
  data,
  pageSize,
  events,
  plugins,
  treeDataSource
} from './data/demodata';

const mydata = {"root":{
  "id":-1,
  "Name":"Root",
  "children":[
     {
        "id":1,
        "parentId":-1,
        "Name":"Category 1",
        "GUID":"8f7152dc-fed7-4a65-afcf-527fceb99865",
        "Email":"hgardnero6@ed.gov",
        "Gender":"Male",
        "Address":"605 Manley Park",
        "Phone Number":"31-(678)495-4134",
        "children":[
           {
              "id":11,
              "parentId":1,
              "Name":"Category 11",
              "GUID":"8f7152dc-fed7-4a65-afcf-527fceb991865",
              "Email":"hgardneross6@ed.gov",
              "Gender":"Male",
              "Address":"12 Manley Park",
              "Phone Number":"31-(678)495-4134"
           },
           {
              "id":12,
              "parentId":1,
              "Name":"Category 12",
              "GUID":"8f7152dc-fed7-4acf-527fceb991865",
              "Email":"hgardneross6@ed.gov",
              "Gender":"Male",
              "Address":"12 Manley Park",
              "Phone Number":"31-(678)495-4134",
              "children":[
                 {
                    "id":121,
                    "parentId":12,
                    "Name":"Category 121",
                    "GUID":"8f7q2dc-fedsss7-4acf-527fceb991865",
                    "Email":"hgoss6@eds.gov",
                    "Gender":"Male",
                    "Address":"21 fake Park",
                    "Phone Number":"31-(678)495-4134"
                 },
                 {
                    "id":122,
                    "parentId":12,
                    "Name":"Category 122",
                    "GUID":"8f7q2dc-fed7-4acf-527fceb991865",
                    "Email":"hgoss6@ed.gov",
                    "Gender":"Male",
                    "Address":"21 fake Park",
                    "Phone Number":"31-(678)495-4134",
                    "children":[
                       {
                          "id":1221,
                          "parentId":122,
                          "Name":"Category 1211",
                          "GUID":"8f7q2dc-facf-527fceb991865",
                          "Email":"hgossjdjdjdj6@ed.gov",
                          "Gender":"Male",
                          "Address":"21 fdjdjake Park",
                          "Phone Number":"31-(678)495-4134"
                       }
                    ]
                 }
              ]
           }
        ]
     },
     {
        "id":2,
        "parentId":-1,
        "Name":"Category 2",
        "GUID":"8f7q2dc-facf-527fcebdk=-jdjd991865",
        "Email":"hehehe@ed.gov",
        "Gender":"Male",
        "Address":"212 Park",
        "Phone Number":"31-(678)495-4134",
        "children":[
           {
              "id":21,
              "parentId":2,
              "Name":"Category 21",
              "GUID":"8f7q2dc-facf-527fcsw-jdjd991865",
              "Email":"hehehe@ed.gov",
              "Gender":"Male",
              "Address":"21112 Park",
              "Phone Number":"31-(678)495-4134",
              "leaf":false
           }
        ]
     }
  ]
}};

const Tree = ({ store }) => {

  const stateKey = 'tree';
  const { on } = this.state;

  const editableProps = {
      columns,
      data: on ? [] : data,
      pageSize,
      plugins: {
          EDITOR: {
              enabled: true,
              type: 'grid'
          }
      },
      events,
      store,
      stateKey: 'editable'
  };
  const complexData = {
      showTreeRootNode: false,   
      gridType: 'tree',
      dragAndDrop: true,
      columns: [
          {
              name: 'Name',
              width: '30%',
              className: 'additional-class',
              dataIndex: 'Name',
              sortable: false,
              expandable: true
          },
          {
              name: 'Phone Number',
              dataIndex: 'Phone Number',
              sortable: false,
              className: 'additional-class'
          },
          {
              name: 'Email',
              dataIndex: 'Email',
              sortable: false,
              className: 'additional-class',
              defaultSortDirection: 'descend'
          },
          {
              name: 'Address',
              dataIndex: 'Address',
              sortable: false,
              className: 'additional-class'
          }
      ],
      data:mydata,      
      plugins:plugins,
      events,
      store,
      stateKey: 'editable'
  };
   applyGridConfig({
    CLASS_NAMES: {
        TABLE: 'table table-striped',
        TABLE_CONTAINER: 'table-responsive',
        HEADER_FIXED_CONTAINER: 'header-fixed',
        HEADER: 'header-bs',
        HEADER_HIDDEN: 'hidden-override',
        ROW: 'row-bs',
        CELL: 'text-left',
        COLUMN: 'column-bs',
        PAGERTOOLBAR: 'text-right bootstrap-description',
        BUTTONS: {
            PAGER: 'btn pull-left negative-margin'
        },
        ERROR_HANDLER: {
            CONTAINER: 'hidden'
        }
    },
    CSS_PREFIX: ''
  }); 
  return (
      <Grid { ...complexData } />
      );
};



class MultipleDetailPanels extends React.Component {
 
  render() {
    return <Tree store={store} />;
  }
}
export default MultipleDetailPanels;

/*
import 'react-virtualized/styles.css';
import 'react-virtualized-tree/lib/main.css'
import 'material-icons/css/material-icons.css';
import classNames from 'classnames';
import Tree from 'react-virtualized-tree';
import { renderers } from 'react-virtualized-tree';

import { Nodes } from './sample';

const {Expandable} = renderers;

const SELECT = 3;



const Selection = ({node, children, onChange}) => {
  const {state: {selected} = {}} = node;
  const className = classNames({
    'mi mi-check-box': selected,
    'mi mi-check-box-outline-blank': !selected,
  });

  return (
    <span>
      <i
        className={className}
        onClick={() =>
          onChange({
            node: {
              ...node,
              state: {
                ...(node.state || {}),
                selected: !selected,
              },
            },
            type: SELECT,
          })
        }
      />
      {children}
    </span>
  );
};

class Extensions extends Component {
  state = {
    nodes: Nodes,
  };

  handleChange = nodes => {
    this.setState({nodes});
  };

  selectNodes = (nodes, selected) =>
    nodes.map(n => ({
      ...n,
      children: n.children ? this.selectNodes(n.children, selected) : [],
      state: {
        ...n.state,
        selected,
      },
    }));

  nodeSelectionHandler = (nodes, updatedNode) =>
    nodes.map(node => {
      if (node.id === updatedNode.id) {
        return {
          ...updatedNode,
          children: node.children ? this.selectNodes(node.children, updatedNode.state.selected) : [],
        };
      }

      if (node.children) {
        return {...node, children: this.nodeSelectionHandler(node.children, updatedNode)};
      }

      return node;
    });

  render() {
      console.log("Nodes",this.state.nodes);
    return (
      <Tree
        nodes={this.state.nodes}
        onChange={this.handleChange}
        extensions={{
          updateTypeHandlers: {
            [SELECT]: this.nodeSelectionHandler,
          },
        }}
      >
        {({style, node, ...rest}) => (
          <div style={style}>
            <Expandable node={node} {...rest}>
              <Selection node={node} {...rest}>
                {node.name}
              </Selection>
            </Expandable>
          </div>
        )}
      </Tree>
    );
  }
}
export default Extensions

const nodes = [{
    value: 'mars',
    label: 'Mars',
    showCheckbox: false,

    children: [
        {
            value: 'phobos', label: 'Phobos',showCheckbox: false, children: [
                { value: 'hello', label: 'hello',showCheckbox: false,  },
                { value: 'hello2', label: 'hello2',showCheckbox: false,  },]
        },
        {
            value: 'deimos', label: 'Deimos',showCheckbox: false, children: [
                { value: 'hello3', label: 'hell3',showCheckbox: false, },
                { value: 'hello4', label: 'hello4' ,showCheckbox: false,},
            ]
        },
    ],
}];


 class MultipleDetailPanels extends React.Component {
    state = {
        checked: [],
        expanded: [],
    };

    render() {
        return (
            <>
                <FormControlLabel value="female" control={<Radio />} label="Create Resultant Single Item Parts and Multi-Item Assemblies"  />

                <Tree
                    nodes={nodes}
                    // checked={this.state.checked}
                    expanded={this.state.expanded}
                    onCheck={checked => this.setState({ checked })}
                    onExpand={expanded => this.setState({ expanded })}
                    icons={{
                        check: false,
                        uncheck: false,
                        halfCheck: false,
                        expandClose: <img style={{width: '10px'}} src={ArrowRight} />,
                        expandOpen: <img style={{width: '10px'}} src={ArrowDown} />,
                        expandAll: <img style={{width: '30px'}} src={PlusIcon} />,
                        collapseAll: <img style={{width: '30px'}} src={MinusIcon} />,
                        parentClose:<img style={{width: '30px'}} src={FolderLogo} />,
                        parentOpen: <img style={{width: '30px'}} src={FolderOpenLogo} />,
                        leaf: <img style={{width: '30px'}} src={PaperLogo} />,
                    }}
                />
            </>
        );
    }
} 
export default MultipleDetailPanels


export default function MultipleDetailPanels({ assemblyTree = [] }) {
  const [value, setValue] = React.useState('DoNotCreate');

  const handleChange = (event) => {
      setValue(event.target.value);
  };
  
  const { useState } = React;
  let RGBorColor = false;
  let metallicFactor = false;
  let roughnessFactor = false;
  const [columns, setColumns] = useState([ {
        title: 'Name', field: gltf_Dict['name'],defaultSort: "desc",editable: 'never'     
      },  { 
        title: 'Top Left', field: gltf_Dict['topLeft'],defaultSort: "desc", editable: 'never',
        render: rowData => {
          const aPoint = rowData[gltf_Dict['topLeft']];
          return <span> x:{aPoint[0]?.toFixed(2)} y:{aPoint[1]?.toFixed(2)} z:{aPoint[2]?.toFixed(2)}</span>
        } 
      }, { 
        title: 'Bottom Right', field: gltf_Dict['bottomRight'],defaultSort: "desc", editable: 'never',
        render: rowData => {
          const aPoint = rowData[gltf_Dict['bottomRight']];
          return <span> x:{aPoint[0]?.toFixed(2)} y:{aPoint[1]?.toFixed(2)} z:{aPoint[2]?.toFixed(2)}</span>
        } 
      }, { 
        title: 'Color', field:  'color',defaultSort: "desc", 
        editComponent: props => {
          if(RGBorColor==false) {
            props.rowData.color = rgbToHex(props.rowData[gltf_Dict['R']] || 0, props.rowData[gltf_Dict['G']] || 0, props.rowData[gltf_Dict['B']] || 0);
          }
          console.log(props.rowData.color,RGBorColor);
         
          return <ColorPickerState zindex="tooltip"  style={{innerWidth:"80%"}}         
          value={props.rowData.color}
          
          onChange={(color) => { console.log("Changing",color,props.rowData.color);
            RGBorColor = true;
            const myColors = hexToRGB(color.value);
            props.rowData.color = rgbToHex(myColors[0],myColors[1],myColors[2]);
            props.onChange(color);
            console.log(columns);
            if(columns[3]) {
              columns[3].render(props.rowData); 
            }
              
           }
          }         
        />
        } ,
        render:rowData => { 
            console.log(rowData);
            if(rowData[gltf_Dict['R']] || rowData[gltf_Dict['G']] || rowData[gltf_Dict['B']]) {
                return (<span style={{background:rgbToHex(rowData[gltf_Dict['R']] || 0, rowData[gltf_Dict['G']] || 0, rowData[gltf_Dict['B']] || 0)
              }} > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>)    
            } else {
              return <span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>
            }
          } 
      } , { 
        title: 'Metallic Factor', field: 'mf',defaultSort: "desc", 
        editComponent: props => {
          if(metallicFactor==false) {
            props.rowData.mf= props.rowData[gltf_Dict['metallicFactor']];
          }        
          return <SliderState zindex="tooltip"  style={{innerWidth:"80%"}}         
          value={props.rowData.mf}
          min={0} 
				  max={1} 
				  step={0.01}
          onChange={(slider) => { 
            console.log("Changing mf",slider,props.rowData.mf);
            metallicFactor = true;           
            props.rowData.mf = slider;
            props.onChange(slider);
            console.log(columns);
            if(columns[4]) {
              columns[4].render(props.rowData);   
            }
            
           }
          }         
        />
        } ,
        render:rowData => { 
            console.log(rowData);
            if(rowData[gltf_Dict['metallicFactor']] ) {
                return (<span> {rowData[gltf_Dict['metallicFactor']]} </span>)    
            } else {
              return <span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>
            }
          } 
      } , , { 
        title: 'Roughness Factor', field: 'rf',defaultSort: "desc", 
        editComponent: props => {
          if(roughnessFactor==false) {
            props.rowData.rf= props.rowData[gltf_Dict['roughnessFactor']];
          }        
          return <SliderState zindex="tooltip"  style={{innerWidth:"80%"}}         
          value={props.rowData.rf}
          min={0} 
				  max={1} 
				  step={0.01}
          onChange={(slider) => { 
            console.log("Changing rf",slider,props.rowData.rf);
            metallicFactor = true;           
            props.rowData.rf = slider;
            props.onChange(slider);
            console.log(columns);
            if(columns[5]) {
              columns[5].render(props.rowData);   
            }
            
           }
          }         
        />
        } ,
        render:rowData => { 
            console.log(rowData);
            if(rowData[gltf_Dict['roughnessFactor']] ) {
                return (<span> {rowData[gltf_Dict['roughnessFactor']]} </span>)    
            } else {
              return <span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>
            }
          } 
      }
    ]);

      const [data, setData] = useState(assemblyTree);
      console.log("Assembly Tree",assemblyTree);
      console.log("Data va",data);
  return (
      <div>
          <FormControlLabel value="DoNotCreate" control={<Radio />} label="Create Resultant Single Item Parts and Multi-Item Assemblies" onChange={handleChange} />
          <MaterialTable
              title="Assembly Tree"
              data={data}
              columns={columns}
              parentChildData={(row, rows) => {
                  console.log("ParentID",row);
                  return rows.find(a => a[gltf_Dict['id']] === row[gltf_Dict['parentId']]);
                }
              }
              options={{
                selection: true,
              }}
              cellEditable={{
                onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
                  return new Promise((resolve, reject) => {
                    console.log('newValue: ' + newValue, columnDef, rowData, oldValue);
                    const dataUpdate = [...data];
                    const index = rowData.tableData.id;
                    RGBorColor=false;
                    if(columnDef.field=='color') {
                      console.log("color",rowData.color);
                      const myColors = hexToRGB(rowData.color);
                      dataUpdate[index][gltf_Dict['R']]=myColors[0];
                      dataUpdate[index][gltf_Dict['G']]=myColors[1];
                      dataUpdate[index][gltf_Dict['B']]=myColors[2];
                      columns[3].render(dataUpdate[index]);   
                    } else if(columnDef.field=='mf') {
                      console.log("mf",rowData.mf);                      
                      dataUpdate[index][gltf_Dict['metallicFactor']]=rowData.mf;                    
                      columns[4].render(dataUpdate[index]);
                    } else if(columnDef.field=='rf') {
                      console.log("rf",rowData.rf);                      
                      dataUpdate[index][gltf_Dict['roughnessFactor']]=rowData.rf;                    
                      columns[5].render(dataUpdate[index]);
                    } else {
                      dataUpdate[index][columnDef.field]=newValue;
                    }
                   
                    setData([...dataUpdate]);
                    setTimeout(resolve, 1000);
                  });
                }
              }} 
              
               editable={ {
                onRowAdd: newData =>
                  new Promise((resolve, reject) => {
                    setTimeout(() => {
                      setData([...data, newData]);
                      
                      resolve();
                    }, 1000)
                  }),
                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve, reject) => {
                    setTimeout(() => {
                      const dataUpdate = [...data];
                      const index = oldData.tableData.id;
                      dataUpdate[index] = newData;
                      setData([...dataUpdate]);

                      resolve();
                    }, 1000)
                  }),
                onRowDelete: oldData => 
                  new Promise((resolve, reject) => {
                    setTimeout(() => {
                      const dataDelete = [...data];
                      const index = oldData.tableData.id;
                      dataDelete.splice(index, 1);
                      setData([...dataDelete]);

                      resolve();
                    }, 1000)
                  })
                
              }
              }  
           
          />     
      </div>
  )
}

*/
export default function Assembly(props) {
  const {assemblyTree,changeStateOfSelection,resetSelections} = props;
  const [data, setData] = useState(assemblyTree);
  
  const [columns, setColumns] = useState([ {
    title: 'I', field: 'type', sorting:false, defaultSort: "desc",editable: 'never',
        render: rowData => {
          const aShape = rowData[gltf_Dict['name']];
          const first4chars = aShape.slice(0, 4);
				  const first6chars = aShape.slice(0, 6);
          if(first4chars=="FACE") {
            return <ToysOutlinedIcon/>
          } else if (first4chars=="EDGE") {
            return <FilterDramaSharpIcon/>
          } else if (first4chars=="PART") {
            return <AllInboxOutlinedIcon/>
          } else if (first6chars=="VERTEX") {
            return <FiberManualRecordOutlinedIcon/>
          } else {
            return <DeveloperBoardOutlinedIcon/>
          }
        },
        cellStyle: {
          width: 1,
          maxWidth: 1
        },         
        headerStyle: {
          width:1,
          maxWidth: 1
        },
        width:'10%'      
      }, {
        title: 'Name', field: gltf_Dict['name'],defaultSort: "desc",editable: 'never',
        cellStyle: {
          width: 2,
          maxWidth: 2
        },         
        headerStyle: {
          width:2,
          maxWidth: 2
        },
        width:'90%'    
      }
    ]);
    
  useEffect(() => {
    setMyChecked(props.assemblyTree);
  }, [props.assemblyTree]);
    
  const setMyChecked = (myTree) => {
    myTree.forEach(element => {
      console.log(element);
      if(!element["tableData"]) {
        element["tableData"]={};
      }
      element["tableData"]["checked"] = element.selectedshell;
    });
    setData(myTree);
  };
      //console.log("Assembly Tree",assemblyTree);
      //console.log("Data va",data);
  return (
    <Grid container>
    <Grid item xs={2} style={{display: 'flex'}}>
          <MaterialTable style={{width:'300px', maxWidth:'300px'}}
            title=""
            data={data}
            columns={columns}
            parentChildData={(row, rows) => {
                console.log("ParentID",row);
                return rows.find(a => a[gltf_Dict['id']] === row[gltf_Dict['parentId']]);
              }
            }
            options={{
              selection: true,
              paging: false,
              defaultExpanded: true,
              root: {
                maxWidth: '100%',
                maxHeight: '600px',
                  },
              tableLayout: "auto"
            }}
            onSelectionChange={(rows) => {
              if(rows.length==0) {
                if (props.resetSelections){
                  props.resetSelections();
                }
              } else {

                let event={};
                event['ctrlKey']=false;
                rows.forEach(element => {
                  const aShape = element[gltf_Dict['name']];
                  const first4chars = aShape.slice(0, 4);
                  const first6chars = aShape.slice(0, 6);
                  if( (first4chars=="FACE") || (first4chars=="EDGE") || 
                    (first4chars=="PART") || (first6chars=="VERTEX") ) {               
                    element.selectedshell=true;
                    if (props.changeStateOfSelection) {
                      props.changeStateOfSelection(element,event);
                      event['ctrlKey']=true;
                      console.log(element);
                    } else {
                      console.log(props.changeStateOfSelection,changeStateOfSelection);
                    }
                  }                
                });
              }                
            }}
        />     
      </Grid>
      </Grid>
  )
}
