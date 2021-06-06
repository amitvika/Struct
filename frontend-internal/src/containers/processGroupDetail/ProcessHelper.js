import React, { Component } from 'react'
import FileUpload from '../../components/FileUpload';
import ProcessGroupAPI from '../../api/processGroup.api'
import CircularProgress from '@material-ui/core/CircularProgress';
// import {
//   ThreejsViewer
// } from '../../components';

export default class ProcessHelper extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isFileUploading: false,
      jsonMesh: {}
    }
  }


  handleFileUpload = (data) => {
    this.setState({
      isFileUploading: true
    })
    ProcessGroupAPI
      .uploadStepfile(data)
      .then(res => {
        this.setState({
          isFileUploading: false,
          jsonMesh: res.data
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
        {/* <ThreejsViewer
          isLoading={this.state.isFileUploading}
          data={this.state.jsonMesh}
        /> */}
      </div >
    )
  }
}
