import React, { Component } from 'react'
import ThreeGeomView from '../3DViewer/GeomView';
import FileUpload from '../../components/FileUpload';
import ProcessGroupAPI from '../../api/processGroup.api'
import CircularProgress from '@material-ui/core/CircularProgress';

export default class ProcessHelper extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isFileUploading: false
    }
  }

  componentDidMount() {

  }

  loadStepInContainer = (MeshJSON) => {
    const container = document.getElementById("graphical_view");

    if (container.length === 0) {
      throw Error("Cannot find graphical view div");
    }

    let view = new ThreeGeomView.GeomView(container);

    view.clearAll();
    view.updateShapeObject(MeshJSON, function () {
      view.zoomAll();
    });
  }

  handleFileUpload = (data) => {
    this.setState({
      isFileUploading: true
    })
    ProcessGroupAPI
      .uploadStepfile(data)
      .then(res => {
        this.loadStepInContainer(res.data);
        this.setState({
          isFileUploading: false
        })
      })
      .catch(error => {
        console.log('----->>>>', error)
        this.setState({
          isFileUploading: false
        })
      })
  }

  render() {
    return (
      <div>
        {this.state.isFileUploading && <CircularProgress />}
        <FileUpload handleFileUpload={this.handleFileUpload} />
        <div id="graphical_view"
          className="Viewer_Graphical"></div>

      </div >
    )
  }
}
