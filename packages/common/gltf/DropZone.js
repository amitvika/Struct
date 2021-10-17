import React, { Component } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import DisplaySpinner from './DisplaySpinner';
import GLTFRenderer from './GltfRenderer';
import Downloader from './Downloader';
import DisplayTree from './DisplayTree';

import {
  SELECTBACKCOLOR,
  SELECTSELECTCOLOR,
  SELECTTOUCHCOLOR,
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  getTexture,
  SELECT2DTEXTURE,
  SELECT3DTEXTURE,
  SELECTMATERIRAL,
  SELECTDISTANCE,
  SELECTSHOWINFO,
  SELECTSOLID,
  SELECTFACE,
  SELECTEDGE,
  SELECTCORNER,
  SELECTMEASURE,
  SELECTCONTINOUS,
  SELECTHIRERACHY,
  SELECTDISECTPARTS,
  SELECTSTACKABLE,
  prettyPrintArray,
  gltf_Dict,
} from './Tree/utils';
import Icon from './Tree/Icon';

import ShowShapeInfo from './ShowShapeInfo';
import GetFilesList from './GetFilesList';

import {
  upload3DFile,
  getGLTFJson,
  getSplitFiles,
  getHierarchySplitFiles,
  getPartsStackableInfo,
  getAllTextures,
  getAllFiles,
  getShapeInfo,
  fetchShapeInfo,
} from '@monostruct/common/api/fileUpload.api';

import DistanceCalculator from './DistanceCalculator';
import './styles/style.css';

const DEFAULTSPLITS = {
  buffers: [],
  meshes: [],
  nodes: [],
  download: '',
  tree: [],
  //"tree": [],
  stackable: [],
};

const DEFAULTTEXTURE = getTexture(null);
const DEFAULTMATERIALNAME = 'Basic';
const MotionButton = styled(motion.div)`
  .buttonTrue {
    display: inline-block;
    padding: 5px 12px;
    font-size: 15px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    outline: none;
    color: #e866e8;
    background-color: #179917;
    border: none;
    border-radius: 5px;
    box-shadow: 0 2px #999;
  }

  .buttonFalse {
    display: inline-block;
    padding: 5px 12px;
    font-size: 15px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    outline: none;
    color: #e800e8;
    background-color: #17ff17;
    border: none;
    border-radius: 5px;
    box-shadow: 0 2px #999;
  }
`;
const splitPaneContext = React.createContext();
class DropZone extends Component {
  state = {
    files: [],
    gltfjson: '',
    gltfobj: DEFAULTSPLITS,
    activefile: 0,
    splitfiles: DEFAULTSPLITS,
    loadingContent: false,
    changedata: [],
    whatchanged: 0,
    databackcolor: DEFAULTBACKCOLOR(),
    dataselectcolor: DEFAULTSELECTCOLOR(),
    datatouchcolor: DEFAULTTOUCHCOLOR(),
    data2values: DEFAULTTEXTURE,
    data3values: DEFAULTTEXTURE,
    dataselection: 0,
    textures: [],
    selectedindex: -1,
    firstshell: null,
    secondshell: null,
    materialname: DEFAULTMATERIALNAME,
    disectstruct: false,
    showdisect: false,
    showshapeinfo: false,
    showinfoonselect: false,
    currentdata: [],
    fetchinfo: [],
    selectedOption: SELECTMEASURE,
    splitMethod: 0,
    selectedObjects: [],
  };

  resetOption = true;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getTextures();
  }

  setStateLoadingContent = (stage) => {
    this.setState({ loadingContent: stage });
  };

  onlyfaces = (name) => {
    const first4chars = name.slice(0, 4);
    const first6chars = name.slice(0, 6);
    if (first4chars == 'EDGE' || first6chars == 'VERTEX') {
      return false;
    }
    return true;
  };

  findMyParentChilds = (mynode) => {
    //console.log(this.state.selectedOption,SELECTSOLID,this.state.selectedOption != SELECTSOLID);
    if (
      (this.state.selectedOption != SELECTSOLID ||
        this.state.splitMethod != SELECTDISECTPARTS) &&
      this.resetOption
    ) {
      return [mynode];
    }
    var myParentID = -1;
    for (var i = 0; i < this.state.splitfiles.tree.length; i++) {
      if (
        this.state.splitfiles.tree[i][gltf_Dict['step']] ==
        mynode[gltf_Dict['step']]
      ) {
        myParentID = this.state.splitfiles.tree[i][gltf_Dict['parentId']];
        break;
      }
    }
    var myMaterials = [];
    if (myParentID != -1) {
      for (var i = 0; i < this.state.splitfiles.tree.length; i++) {
        if (
          this.state.splitfiles.tree[i][gltf_Dict['parentId']] == myParentID
        ) {
          var myChild = this.findMyMaterial(this.state.splitfiles.tree[i]);
          if (myChild) {
            if (this.onlyfaces(myChild[gltf_Dict['step']])) {
              myMaterials.push(myChild);
            }
          }
        }
      }
    }
    if (myMaterials.length != 0) {
      return myMaterials;
    }
    return [mynode];
  };

  findMyMaterial = (data) => {
    if (this.state.splitfiles.tree) {
      for (var i = 0; i < this.state.splitfiles.tree.length; i++) {
        //console.log(this.state.splitfiles.tree[i][gltf_Dict["step"]],data[gltf_Dict["step"]],(this.state.splitfiles.tree[i][gltf_Dict["step"]]==data[gltf_Dict["step"]]))
        if (this.state.splitfiles.tree[i][gltf_Dict['name']] == data['name']) {
          return this.state.splitfiles.tree[i];
        }
      }
    }
    return null;
  };

  fetchShapeInformation = () => {
    fetchShapeInfo(this.state.splitfiles.tree)
      .then((res) => {
        this.setState({
          fetchinfo: res.data,
        });
        //console.log(res.data);
        this.setStateLoadingContent(false);
      })
      .catch((err) => {
        console.log('Error -->> ', err);
        this.setStateLoadingContent(false);
      });
  };

  getFileList = () => {
    //console.log("SelecetdObjects",this.state.selectedObjects);

    //console.log(this.state.splitfiles);

    return (
      <div>
        <DisplaySpinner loadingContent={this.state.loadingContent} />
        <div id="rowheader">
          <GetFilesList
            onDrop={this.onDrop}
            onChange={this.onChange}
            getFiles={this.getFiles}
          />
          {this.state.splitfiles.stackable &&
            this.state.splitfiles.stackable.length > 0 && (
              <div>
                <h3>
                  Parts Stackable Info
                  <br></br>Any Direction:{' '}
                  {prettyPrintArray(
                    this.state.splitfiles.stackable[0].direction
                  )}
                  <br></br>Top:{' '}
                  {prettyPrintArray(this.state.splitfiles.stackable[0].top)}
                  <br></br>Bottom:{' '}
                  {prettyPrintArray(this.state.splitfiles.stackable[0].bottom)}
                  <br></br>Right:{' '}
                  {prettyPrintArray(this.state.splitfiles.stackable[0].right)}
                  <br></br>Left:{' '}
                  {prettyPrintArray(this.state.splitfiles.stackable[0].left)}
                  <br></br>Front:{' '}
                  {prettyPrintArray(this.state.splitfiles.stackable[0].front)}
                  <br></br>Back:{' '}
                  {prettyPrintArray(this.state.splitfiles.stackable[0].back)}
                </h3>
              </div>
            )}
          <Downloader
            files={this.state.files}
            getSplit={this.getSplit}
            getHierarchySplit={this.getHierarchySplit}
            getPartsStackable={this.getPartsStackable}
            setShowInfo={this.setShowInfo}
          />
          {/* <button value={"Fetch"}  
				onClick={() => {
					this.fetchShapeInformation();					
				} } type='button'>
				Get Shape Details
			</button>	 */}

          <div style={{ Width: '100%' }}>
            <DisplayTree
              theme={'my-theme'}
              customTheme={this.myTheme}
              grow={true}
              nodes={this.state.splitfiles.tree}
              textures={this.state.textures.textures2D}
              structure={true}
              firstshell={this.state.firstshell}
              secondshell={this.state.secondshell}
              disectparts={
                this.state.selectedindex == -1 ? false : this.state.showdisect
              }
              onSelect={(data, what) => {
                console.log('DisplayTree-----onSelect', data, what);
                this.setState({
                  changedata: data,
                  whatchanged: what,
                });
                if (what == SELECTDISTANCE) {
                  //console.log(data);
                  this.changeStateOfSelection(data, null);
                }
                if (what == SELECTSHOWINFO) {
                  this.getShapeInformation(data);
                }
                //console.log(data,what)
              }}
            />
          </div>
          <DistanceCalculator
            stepfile={
              this.state.selectedindex == -1
                ? 'No Shells Selected'
                : this.getBaseName(
                    this.state.files[this.state.selectedindex].filename
                  )
            }
            firstshell={this.state.firstshell}
            secondshell={this.state.secondshell}
          />
        </div>
      </div>
    );
  };

  getBaseName = (filename) => {
    return filename.substring(0, filename.lastIndexOf('.')) || filename || '';
  };

  getShapeInformation = (data) => {
    if (this.state.disectstruct) {
      this.setState({
        currentdata: data,
        showshapeinfo: true,
      });
    } else {
      this.setStateLoadingContent(true);
      getShapeInfo(data[gltf_Dict['step']].slice(0, -5))
        .then((res) => res.data)
        .then((repos) => {
          this.setStateLoadingContent(false);
          let mydata = {};
          mydata[gltf_Dict['name']] = data[gltf_Dict['step']];
          mydata[gltf_Dict['structures']] = repos;
          this.setState({
            currentdata: mydata,
            showshapeinfo: true,
          });
        });
    }
  };

  changeStateOfSelection = (data, event) => {
    if (this.state.selectedOption == SELECTMEASURE) {
      if (data.selectedshell) {
        if (!this.state.firstshell) {
          const firstshell = data;
          this.setState({
            firstshell: firstshell,
          });
          //console.log("FirstShell",firstshell,this.state.firstshell);
        } else {
          if (!this.state.secondshell) {
            const secondshell = data;
            this.setState({
              secondshell: secondshell,
            });
            //console.log("SecondShell",secondshell,this.state.secondshell);
          } else {
            this.state.firstshell.selectedshell = false;
            const secondshell = this.state.secondshell;
            this.setState({
              firstshell: secondshell,
              secondshell: data,
            });
            //console.log("First and second",this.state.firstshell,this.state.secondshell,data)
          }
        }
        if (this.state.showinfoonselect) {
          this.getShapeInformation(data);
        }
      } else {
        if (
          this.state.firstshell &&
          this.state.firstshell[gltf_Dict['step']] == data[gltf_Dict['step']]
        ) {
          this.state.firstshell.selectedshell = false;
          const secondshell = this.state.secondshell;
          this.setState({
            firstshell: secondshell,
            secondshell: null,
          });
        } else {
          if (
            this.state.secondshell &&
            this.state.secondshell[gltf_Dict['step']] == data[gltf_Dict['step']]
          ) {
            this.state.secondshell.selectedshell = false;
            this.setState({
              secondshell: null,
            });
          } else {
            //console.log("This condition is not possible");
          }
        }
      }
    } else {
      if (data) {
        var toAdd = true;
        if (event) {
          toAdd = event.ctrlKey;
        }
        if (!toAdd) {
          this.state.selectedObjects.forEach((element) => {
            if (data[gltf_Dict['step']] != element[gltf_Dict['step']]) {
              element.selectedshell = false;
            }
          });
        }
        const myAllChilds = this.findMyParentChilds(data);
        console.log(myAllChilds);
        myAllChilds.forEach((elementdata) => {
          elementdata.selectedshell = data.selectedshell;
          if (toAdd) {
            if (data.selectedshell) {
              var alreadyPresent = false;
              for (var i = 0; i < this.state.selectedObjects.length; i++) {
                if (
                  elementdata[gltf_Dict['step']] ==
                  this.state.selectedObjects[i][gltf_Dict['step']]
                ) {
                  alreadyPresent = true;
                  break;
                }
              }
              if (!alreadyPresent) {
                this.setState((prevState) => ({
                  selectedObjects: [...prevState.selectedObjects, elementdata],
                }));
              }
            } else {
              var selectedObjects = [];
              this.state.selectedObjects.forEach((element) => {
                if (
                  elementdata[gltf_Dict['step']] != element[gltf_Dict['step']]
                ) {
                  selectedObjects.push(element);
                }
              });
              this.setState({ selectedObjects: selectedObjects });
            }
          } else {
            if (data.selectedshell) {
              this.setState({ selectedObjects: myAllChilds });
            } else {
              this.setState({ selectedObjects: [] });
            }
          }
        });
      }
    }
  };

  SplitPaneRight = (props) => {
    return this.TableSplitPaneRight(props);
  };

  TableSplitPaneLeft = (props) => {
    return (
      <div {...props} style={{ width: '100%', height: '100%' }}>
        {this.getFileList()}
      </div>
    );
  };

  resetSelections = () => {
    if (this.state.secondshell) {
      this.state.secondshell.selectedshell = false;
    }
    if (this.state.firstshell) {
      this.state.firstshell.selectedshell = false;
    }
    this.state.selectedObjects.forEach((element) => {
      element.selectedshell = false;
    });
    this.setState({
      selectedObjects: [],
      firstshell: null,
      secondshell: null,
    });
  };

  selectAllSelectedSolids = () => {
    var copy_selectobjects = [];
    this.state.selectedObjects.forEach((element) => {
      copy_selectobjects.push(element);
    });
    this.resetOption = false;
    copy_selectobjects.forEach((meshmaterial) => {
      const myAllChilds = this.findMyParentChilds(meshmaterial);
      //console.log(myAllChilds);
      myAllChilds.forEach((elementdata) => {
        var alreadyPresent = false;
        for (var i = 0; i < this.state.selectedObjects.length; i++) {
          if (
            elementdata[gltf_Dict['step']] ==
            this.state.selectedObjects[i][gltf_Dict['step']]
          ) {
            alreadyPresent = true;
            break;
          }
        }
        if (!alreadyPresent) {
          this.state.selectedObjects.push(elementdata);
          elementdata.selectedshell = true;
        }
      });
    });
    this.resetOption = true;
  };

  TableSplitPaneRight = (props) => {
    const selectedObjects = this.state.selectedObjects.map((data, index) => (
      <tr key={data[gltf_Dict['id']]}>
        <td>{index + 1}</td>
        <td>{data[gltf_Dict['step']]}</td>
        <td>{data.display}</td>
      </tr>
    ));
    return (
      <div {...props} style={{ width: '100%', height: '100%' }}>
        {this.state.splitMethod != 0 && (
          <MotionButton>
            <button
              value={'Solid'}
              className={
                this.state.selectedOption == SELECTSOLID
                  ? 'buttonTrue'
                  : 'buttonFalse'
              }
              onClick={() => {
                const previousSelectedOption = this.state.selectedOption;
                this.setState({ selectedOption: SELECTSOLID });
                if (previousSelectedOption == SELECTMEASURE) {
                  this.resetSelections();
                }
                this.selectAllSelectedSolids();
                //console.log(this.state.selectedOption);
              }}
              type="button"
            >
              <Icon
                size="large"
                icon="solid"
                theme={'my-theme'}
                customTheme={this.myTheme}
              ></Icon>
              Select Solids
            </button>
            &nbsp;
            {this.state.splitMethod == SELECTDISECTPARTS && (
              <span>
                <button
                  value={'Face'}
                  className={
                    this.state.selectedOption == SELECTFACE
                      ? 'buttonTrue'
                      : 'buttonFalse'
                  }
                  onClick={() => {
                    const previousSelectedOption = this.state.selectedOption;
                    this.setState({ selectedOption: SELECTFACE });
                    if (previousSelectedOption == SELECTMEASURE) {
                      this.resetSelections();
                    }
                    //console.log(this.state.selectedOption);
                  }}
                  type="button"
                >
                  <Icon
                    size="large"
                    icon="face"
                    theme={'my-theme'}
                    customTheme={this.myTheme}
                  ></Icon>
                  Select Faces
                </button>
                &nbsp;
                <button
                  value={'Edge'}
                  className={
                    this.state.selectedOption == SELECTEDGE
                      ? 'buttonTrue'
                      : 'buttonFalse'
                  }
                  onClick={() => {
                    const previousSelectedOption = this.state.selectedOption;
                    this.setState({ selectedOption: SELECTEDGE });
                    if (previousSelectedOption == SELECTMEASURE) {
                      this.resetSelections();
                    }
                    //console.log(this.state.selectedOption);
                  }}
                  type="button"
                >
                  <Icon
                    size="large"
                    icon="edge"
                    theme={'my-theme'}
                    customTheme={this.myTheme}
                  ></Icon>
                  Select Edges
                </button>
                &nbsp;
                <button
                  value={'Corner'}
                  className={
                    this.state.selectedOption == SELECTCORNER
                      ? 'buttonTrue'
                      : 'buttonFalse'
                  }
                  onClick={() => {
                    const previousSelectedOption = this.state.selectedOption;
                    this.setState({ selectedOption: SELECTCORNER });
                    if (previousSelectedOption == SELECTMEASURE) {
                      this.resetSelections();
                    }
                    //console.log(this.state.selectedOption);
                  }}
                  type="button"
                >
                  <Icon
                    size="large"
                    icon="corner"
                    theme={'my-theme'}
                    customTheme={this.myTheme}
                  ></Icon>
                  Select Corners
                </button>
                &nbsp;
              </span>
            )}
            {this.state.splitMethod != SELECTSTACKABLE && (
              <span>
                <button
                  value={'measure'}
                  className={
                    this.state.selectedOption == SELECTMEASURE
                      ? 'buttonTrue'
                      : 'buttonFalse'
                  }
                  onClick={() => {
                    const previousSelectedOption = this.state.selectedOption;
                    this.setState({ selectedOption: SELECTMEASURE });
                    if (previousSelectedOption != SELECTMEASURE) {
                      this.resetSelections();
                    }
                    //console.log(this.state.selectedOption);
                  }}
                  type="button"
                >
                  <Icon
                    size="large"
                    icon="measure"
                    theme={'my-theme'}
                    customTheme={this.myTheme}
                  ></Icon>
                  Find Relation
                </button>
              </span>
            )}
          </MotionButton>
        )}

        <div id="rowcontent">
          <GLTFRenderer
            gltfjson={this.state.gltfjson}
            gltfobj={this.state.gltfobj}
            activefile={this.state.activefile}
            backcolor={this.state.databackcolor}
            selectcolor={this.state.dataselectcolor}
            touchcolor={this.state.datatouchcolor}
            selectedoption={this.state.selectedOption}
            splitmethod={this.state.splitMethod}
            changedata={this.state.changedata}
            data2texture={this.state.data2values[0].name}
            data3texture={this.state.data3values[0].name}
            materialtype={
              this.state.selectedindex == -1
                ? DEFAULTMATERIALNAME
                : this.state.materialname
            }
            whatchanged={this.state.whatchanged}
            dataselection={this.state.dataselection}
            activeDataTable={0}
            onClick={(data, what, event) => {
              if (what == SELECTDISTANCE) {
                //console.log(data);
                const mymesh = this.findMyMaterial(data);
                if (mymesh) {
                  mymesh.selectedshell = data.selectedshell;
                  this.changeStateOfSelection(mymesh, event);
                }

                //console.log("Before",this.state.firstshell,this.state.secondshell,mymesh);
                if (mymesh) {
                }
                //console.log("After",this.state.firstshell,this.state.secondshell,mymesh);
              }
              //console.log(data,what)
            }}
          />
        </div>
        {selectedObjects && !!selectedObjects.length && (
          <aside>
            <h6>
              Selected Objects
              <table>
                <tbody>{selectedObjects}</tbody>
              </table>
            </h6>
          </aside>
        )}
        <div id="ShowShapeInfo">
          <ShowShapeInfo
            showModal={this.state.showshapeinfo}
            data={this.state.currentdata}
            closeModal={() => {
              this.setState({
                showshapeinfo: false,
              });
            }}
          />
        </div>
      </div>
    );
  };

  onChange = (data, dataselection) => {
    if (dataselection == SELECTBACKCOLOR) {
      this.setState({
        databackcolor: data,
        dataselection: SELECTBACKCOLOR,
      });
    }
    if (dataselection == SELECT2DTEXTURE) {
      this.setState({
        data2values: data,
        dataselection: SELECT2DTEXTURE,
      });
    }
    if (dataselection == SELECT3DTEXTURE) {
      this.setState({
        data3values: data,
        dataselection: SELECT3DTEXTURE,
      });
    }
    if (dataselection == SELECTTOUCHCOLOR) {
      this.setState({
        datatouchcolor: data,
        dataselection: SELECTTOUCHCOLOR,
      });
    }
    if (dataselection == SELECTSELECTCOLOR) {
      this.setState({
        dataselectcolor: data,
        dataselection: SELECTSELECTCOLOR,
      });
    }
  };

  onDrop = async (files) => {
    this.setState({
      files: [],
      splitfiles: DEFAULTSPLITS,
      selectedindex: -1,
      splitMethod: 0,
    });
    files.forEach((oneFile) => {
      this.setStateLoadingContent(true);
      upload3DFile(oneFile)
        .then((res) => {
          this.setState((prevState) => ({
            files: [...prevState.files, res.data],
            /* distancegap: [...prevState.distancegap,DEFAULTDISTANCEGAP],
						anglegap: [...prevState.anglegap,DEFAULTANGLEGAP],
						disect: [...prevState.disect,DEFAULTDISECT],
						materialtype : [...prevState.materialtype,DEFAULTMATERIALTYPE],	 */
          }));
          //console.log(res.data);
          this.setStateLoadingContent(false);
        })
        .catch((err) => {
          console.log('Error -->> ', err);
          this.setStateLoadingContent(false);
        });
    });
  };
  getFiles = () => {
    this.setState({
      files: [],
      splitfiles: DEFAULTSPLITS,
      selectedindex: -1,
      splitMethod: 0,
    });
    this.setStateLoadingContent(true);
    getAllFiles()
      .then((res) => res.data)
      .then((repos) => {
        //console.log(repos);
        this.setState({
          files: repos,
          /* distancegap: new Array(repos.length).fill(DEFAULTDISTANCEGAP),
					anglegap:new Array(repos.length).fill(DEFAULTANGLEGAP),
					disect: new Array(repos.length).fill(DEFAULTDISECT),
					materialtype: new Array(repos.length).fill(DEFAULTMATERIALTYPE) */
        });
        this.setStateLoadingContent(false);
      })
      .catch((err) => {
        console.log('Error -->> ', err);
        this.setStateLoadingContent(false);
      });
  };

  getTextures = () => {
    this.setStateLoadingContent(true);
    getAllTextures()
      .then((res) => res.data)
      .then((repos) => {
        //console.log("textures", repos);
        this.setState({
          textures: repos,
        });
        this.setStateLoadingContent(false);
      })
      .catch((err) => {
        console.log('Error -->> ', err);
        this.setStateLoadingContent(false);
      });
  };

  getView = (id) => {
    this.setStateLoadingContent(true);
    getGLTFJson(id)
      .then((res) => res.data)
      .then((repos) => {
        //console.log(repos);
        this.setState({
          gltfjson: JSON.stringify(repos),
          gltfobj: repos,
          activefile: id,
          splitfiles: repos,
          dataselection: 0,
          firstshell: null,
          secondshell: null,
        });
        this.state.splitfiles['stackable'] = [];
        this.state.splitfiles['tree'] = [];
        this.state.splitfiles.tree.forEach((element) => {
          if (element[gltf_Dict['bin']]) {
            element[gltf_Dict['selected']] = false;
            //this.state.splitfiles.tree.push(element);
            //console.log("Adding", element);
          }
          //console.log("Not Adding", element);
        });
        this.setStateLoadingContent(false);
      })
      .catch((err) => {
        console.log('Error -->> ', err);
        this.setStateLoadingContent(false);
      });
  };

  getSplit = (id, includeParts, index, stateprops) => {
    this.setStateLoadingContent(true);
    //console.log("id",id);
    getSplitFiles(
      id,
      includeParts,
      stateprops.distancegap[index],
      stateprops.anglegap[index],
      stateprops.disect[index],
      0
    )
      .then((res) => res.data)
      .then((repos) => {
        //console.log(repos);

        this.setState({
          selectedindex: index,
          gltfjson: JSON.stringify(repos),
          gltfobj: repos,
          activefile:
            id.toString() +
            includeParts.toString() +
            stateprops.distancegap[index].toString() +
            stateprops.anglegap[index].toString(),
          splitfiles: repos,
          dataselection: 0,
          firstshell: null,
          secondshell: null,
          materialname: stateprops.materialtype[index][0].name,
          disectstruct: stateprops.disect[index],
          showdisect: stateprops.showdisect[index],
          showinfoonselect: stateprops.showinfoonselect[index],
          splitMethod: SELECTCONTINOUS,
          selectedObjects: [],
        });
        this.state.splitfiles['stackable'] = [];
        this.state.splitfiles['tree'] = [];
        this.state.splitfiles.tree.forEach((element) => {
          if (element[gltf_Dict['bin']]) {
            element[gltf_Dict['selected']] = false;
            //this.state.splitfiles.tree.push(element);
          }
        });
        this.setStateLoadingContent(false);
      })
      .catch((err) => {
        console.log('Error -->> ', err);
        this.setStateLoadingContent(false);
      });
  };

  getHierarchySplit = (
    id,
    includeParts,
    index,
    stateprops,
    edgesize,
    vertexsize
  ) => {
    this.setStateLoadingContent(true);
    getHierarchySplitFiles(
      id,
      includeParts,
      stateprops.distancegap[index],
      stateprops.anglegap[index],
      stateprops.disect[index],
      0,
      edgesize,
      vertexsize,
	  50
    )
      .then((res) => res.data)
      .then((repos) => {
        //console.log(repos);
        this.setState({
          selectedindex: index,
          gltfjson: JSON.stringify(repos),
          gltfobj: repos,
          activefile:
            id.toString() +
            includeParts.toString() +
            stateprops.distancegap[index].toString() +
            stateprops.anglegap[index].toString(),
          splitfiles: repos,
          dataselection: 0,
          firstshell: null,
          secondshell: null,
          materialname: stateprops.materialtype[index][0].name,
          disectstruct: stateprops.disect[index],
          showdisect: stateprops.showdisect[index],
          showinfoonselect: stateprops.showinfoonselect[index],
          splitMethod: includeParts ? SELECTDISECTPARTS : SELECTHIRERACHY,
          selectedObjects: [],
        });
        this.state.splitfiles['stackable'] = [];
        this.state.splitfiles['tree'] = [];
        this.state.splitfiles.tree.forEach((element) => {
          if (element[gltf_Dict['bin']]) {
            element[gltf_Dict['selected']] = false;
            //this.state.splitfiles.tree.push(element);
          }
        });
        this.setStateLoadingContent(false);
      })
      .catch((err) => {
        console.log('Error -->> ', err);
        this.setStateLoadingContent(false);
      });
  };

  getPartsStackable = (id, index, stateprops) => {
    this.setStateLoadingContent(true);
    //console.log("id",id);
    getPartsStackableInfo(
      id,
      stateprops.distancegap[index],
      stateprops.anglegap[index],
      1.0
    )
      .then((res) => res.data)
      .then((repos) => {
        //console.log(repos);

        this.setState({
          selectedindex: index,
          gltfjson: JSON.stringify(repos),
          gltfobj: repos,
          activefile:
            id.toString() +
            'Stack' +
            stateprops.distancegap[index].toString() +
            stateprops.anglegap[index].toString(),
          splitfiles: repos,
          dataselection: 0,
          firstshell: null,
          secondshell: null,
          materialname: stateprops.materialtype[index][0].name,
          disectstruct: stateprops.disect[index],
          showdisect: stateprops.showdisect[index],
          showinfoonselect: stateprops.showinfoonselect[index],
          splitMethod: SELECTSTACKABLE,
          selectedObjects: [],
        });
        this.state.splitfiles['tree'] = [];
        this.state.splitfiles.tree.forEach((element) => {
          if (element[gltf_Dict['bin']]) {
            element[gltf_Dict['selected']] = false;
            //this.state.splitfiles.tree.push(element);
          }
        });
        this.setStateLoadingContent(false);
      })
      .catch((err) => {
        console.log('Error -->> ', err);
        this.setStateLoadingContent(false);
      });
  };

  setShowInfo = (data, index) => {
    if (this.state.selectedindex == index) {
      this.setState({
        showinfoonselect: data,
      });
    }
  };

  setGLTFMaterial = (data, index) => {
    if (this.state.selectedindex == index) {
      this.setState({
        materialname: data[0].name,
        dataselect: SELECTMATERIRAL,
      });
    }
  };

  myTheme = {
    'my-theme': {
      text: '#48b', // the colours used for foreground
      bg: '#ffd', // the colours used for background
      highlight: '#fd0', // the colours used for selected and hover items
      decal: '#da2', // the colours used  for open folder indicators and icons
      accent: '#bcd', // the colour used for row borders and empty file indicators
    },
  };
  hierarchy = (
    data = [],
    { idKey = 'id', parentKey = 'parentId', childrenKey = 'items' } = {}
  ) => {
    const tree = [];
    const childrenOf = {};
    data.forEach((item) => {
      const { [idKey]: id, [parentKey]: parentId = 0 } = item;
      childrenOf[id] = childrenOf[id] || [];
      item[childrenKey] = childrenOf[id];
      parentId !== null
        ? (childrenOf[parentId] = childrenOf[parentId] || []).push(item)
        : tree.push(item);
    });
    return tree;
  };

  /* toggleSubRow = (rows, id) => {
		const rowIndex = rows.findIndex(r => r[gltf_Dict["id"]] === id);
		const row = rows[rowIndex];
		const { children } = row;
		if (!children) return rows;
	  
		const newRows = [...rows];
		newRows[rowIndex] = { ...row, isExpanded: !row.isExpanded };
		if (!row.isExpanded) {
		  newRows.splice(rowIndex + 1, 0, ...children);
		} else {
		  newRows.splice(rowIndex + 1, children.length);
		}
		return newRows;
	} */
  /* dataColumns =  [
			{
				dataIndex: 'name',
				sortable: false,
				expandable: true,					
				name: 'Assembly Name'
				},
		  
			{
				dataIndex: 'topLeft',
				name: 'Top Left',
				renderer: (ob) =>  {
				  console.log(ob);
				  return (
					<>
					{ ob.row.topLeft && (
					  <div className="rdg-cell-value">
					   
						  x : {ob.row.topLeft[0] } y : {ob.row.topLeft[1] } z : {ob.row.topLeft[2] }
					   
					  </div>
					)}
					</>
				  );
				}
			},
		]; */

  render() {
    return (
      <>
        {/* <Global {...styles} /> */}
        <table style={{ width: '100%', height: '100%' }}>
          <tbody>
            <tr>
              <td style={{ paddingRight: '20px', padding: '5px' }}>
                <this.TableSplitPaneLeft />
              </td>
              <td
                style={{
                  border: '1px solid blue',
                  paddingLeft: '20px',
                  padding: '5px',
                }}
              >
                <this.TableSplitPaneRight />
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  }
}

const SplitPane = ({ children, ...props }) => {
  const [leftWidth, setLeftWidth] = React.useState(null);
  const separatorXPosition = React.useRef(null);

  const splitPaneRef = React.createRef();

  const onMouseDown = (e) => {
    separatorXPosition.current = e.clientX;
  };

  const onMouseMove = (e) => {
    if (!separatorXPosition.current) {
      return;
    }

    const newLeftWidth = leftWidth + e.clientX - separatorXPosition.current;
    separatorXPosition.current = e.clientX;

    // if (newLeftWidth <= 0) {
    //   return leftWidth !== 0 && setLeftWidth(0);
    // }
    /* console.log("my ref",splitPaneRef);
		console.log("my ref c",splitPaneRef.current); */
    //const splitPaneWidth = splitPaneRef.current.clientWidth;

    // if (newLeftWidth >= splitPaneWidth) {
    //   return leftWidth !== splitPaneWidth && setLeftWidth(splitPaneWidth);
    // }
    setLeftWidth(newLeftWidth);
  };

  const onMouseUp = () => {
    separatorXPosition.current = null;
  };

  React.useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  });
  //console.log(children);
  return (
    <div {...props} className="split-pane" ref={splitPaneRef}>
      <splitPaneContext.Provider value={{ leftWidth, setLeftWidth }}>
        {children[0]}

        <div
          width="150"
          height="100"
          className="separator"
          onMouseDown={onMouseDown}
        ></div>
        {children[1]}
      </splitPaneContext.Provider>
    </div>
  );
};

const SplitPaneLeft = (props) => {
  const leftRef = React.createRef();
  const { leftWidth, setLeftWidth } = React.useContext(splitPaneContext);

  React.useEffect(() => {
    if (!leftWidth) {
      // console.log("I am seee")
      setLeftWidth(leftRef.current.clientWidth);
      leftRef.current.style.flex = 'row';
      return;
    }

    leftRef.current.style.width = `${leftWidth}px`;
  }, [leftWidth]);

  return (
    <div
      {...props}
      className="split-pane-left"
      ref={leftRef}
      style={{ width: '100%', height: '100%' }}
    >
      {this.getFileList()}
    </div>
  );
};

export default DropZone;
