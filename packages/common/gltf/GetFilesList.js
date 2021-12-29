import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

import DisplaySpinner from './DisplaySpinner';

import {
  SELECTBACKCOLOR,
  SELECTSELECTCOLOR,
  SELECTTOUCHCOLOR,
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  getTexture,
  SELECT2DTEXTURE,
  SELECT3DTEXTURE
} from './Tree/utils';
import Select from './DropDown';

import { getAllTextures } from '@monostruct/common/api/fileUpload.api';
//import { NoToneMapping } from 'three';
//import { runInThisContext } from 'vm';

//import DistanceCalculator from "./DistanceCalculator"

const DEFAULTSPLITS = {
  buffers: [],
  meshes: [],
  nodes: [],
  download: '',
  tree: []
  //"btree": [],
};

const DEFAULTTEXTURE = getTexture(null);
const DEFAULTMATERIALNAME = 'Basic';

//const splitPaneContext = React.createContext();
class GetFilesList extends Component {
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
    showshapeinfo: false,
    currentdata: []
  };

  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.getTextures();
  }

  setStateLoadingContent = (stage) => {
    this.setState({ loadingContent: stage });
  };
  getTextures = () => {
    this.setStateLoadingContent(true);
    getAllTextures()
      .then((res) => res.data)
      .then((repos) => {
        //console.log("textures", repos);
        this.setState({
          textures: repos
        });
        this.setStateLoadingContent(false);
      })
      .catch((err) => {
        console.log('Error -->> ', err);
        this.setStateLoadingContent(false);
      });
  };

  render() {
    return (
      <div>
        <DisplaySpinner loadingContent={this.state.loadingContent} />
        <div id="rowheader">
          <table>
            <tbody>
              <tr>
                <td>
                  <Dropzone onDrop={this.props.onDrop}>
                    {({ getRootProps, getInputProps }) => (
                      <section className="container">
                        <div {...getRootProps({ className: 'dropzone' })}>
                          <input {...getInputProps()} />
                          <p>
                            Try dropping some files here, or click to select
                            files to upload.
                          </p>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                </td>
                <td>
                  <button
                    value={'View'}
                    onClick={() => {
                      if (this.props.getFiles) {
                        this.props.getFiles();
                      }
                    }}
                    type="button"
                  >
                    View Uploaded Files
                  </button>
                </td>
                <td>
                  Background<br></br>Color:
                  <input
                    type="color"
                    defaultValue={this.state.databackcolor}
                    onChange={(event) => {
                      if (event && event.target) {
                        //console.log("1",state)
                        this.setState({
                          databackcolor: event.target.value,
                          dataselection: SELECTBACKCOLOR
                        });
                        if (this.props.onChange) {
                          this.props.onChange(
                            event.target.value,
                            SELECTBACKCOLOR
                          );
                        }
                      }
                    }}
                  />
                </td>
                <td>
                  2D<br></br>Texture:
                  <div
                    style={{
                      maxWidth: '350px',
                      margin: '0 auto',
                      minWidth: '100px'
                    }}
                  >
                    <Select
                      options={this.state.textures.textures2D}
                      multi={false}
                      placeholder="Select 2D Texture"
                      labelField={'id'}
                      valueField={'name'}
                      dropdownHeight={'200px'}
                      values={this.state.data2values}
                      onChange={(datavalues) => {
                        if (datavalues && !!datavalues.length) {
                          this.setState({
                            data2values: datavalues,
                            dataselection: SELECT2DTEXTURE
                          });
                          if (this.props.onChange) {
                            this.props.onChange(datavalues, SELECT2DTEXTURE);
                          }
                        }
                      }}
                    />
                  </div>
                </td>
                <td>
                  3D<br></br>Texture:
                  <div
                    style={{
                      maxWidth: '350px',
                      margin: '0 auto',
                      minWidth: '100px'
                    }}
                  >
                    <Select
                      options={this.state.textures.textures3D}
                      multi={false}
                      placeholder="Select 3D Texture"
                      labelField={'id'}
                      valueField={'name'}
                      dropdownHeight={'200px'}
                      values={this.state.data3values}
                      onChange={(datavalues) => {
                        if (datavalues && !!datavalues.length) {
                          this.setState({
                            data3values: datavalues,
                            dataselection: SELECT3DTEXTURE
                          });
                          if (this.props.onChange) {
                            this.props.onChange(datavalues, SELECT3DTEXTURE);
                          }
                        }
                      }}
                    />
                  </div>
                </td>
                <td>
                  Select<br></br>Color:
                  <input
                    type="color"
                    defaultValue={this.state.dataselectcolor}
                    onChange={(event) => {
                      if (event && event.target) {
                        //console.log("1",state)
                        this.setState({
                          dataselectcolor: event.target.value,
                          dataselection: SELECTSELECTCOLOR
                        });
                        if (this.props.onChange) {
                          this.props.onChange(
                            event.target.value,
                            SELECTSELECTCOLOR
                          );
                        }
                      }
                    }}
                  />
                </td>
                <td>
                  Touch<br></br>Color:
                  <input
                    type="color"
                    defaultValue={this.state.datatouchcolor}
                    onChange={(event) => {
                      if (event && event.target) {
                        //console.log("1",state)
                        this.setState({
                          datatouchcolor: event.target.value,
                          dataselection: SELECTTOUCHCOLOR
                        });
                        if (this.props.onChange) {
                          this.props.onChange(
                            event.target.value,
                            SELECTTOUCHCOLOR
                          );
                        }
                      }
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default GetFilesList;
