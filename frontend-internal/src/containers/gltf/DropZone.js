import React,{Component} from 'react';
import Dropzone from 'react-dropzone';
import request from 'axios';


import GLTFRenderer from "./GltfRenderer";
import Downloader from "./Downloader";
import { upload3DFile, getGLTFJson, getSplitFiles } from '../../api/fileUpload.api'

const DEFAULTSPLITS={
	"buffers":[],
	"meshes":[],
	"nodes":[]
};

class DropZone extends Component{
	state = {
			files: [],
			gltfjson: "",
			activefile: 0,
			splitfiles:DEFAULTSPLITS,
			activesplit: 0,
		}
   
    constructor() {
    	super();
	}	
	
    onDrop = async (files) => {

		
		this.setState({ 
			files: [],
			splitfiles:DEFAULTSPLITS,
		})
		files.forEach(oneFile => {
			var formData = new FormData();
			formData.append('file', oneFile)
			upload3DFile(formData)
				.then( res =>  {
					this.setState(prevState => ({
					  files: [...prevState.files, res.data]
					}));					
				})
				.catch(err => {
					console.log('Error -->> ', err)
				})

		});
	};

	getView = (id) => {
		getGLTFJson(id)
			.then(res => res.data)
			.then((repos) => {
				//console.log(repos);
				this.setState({ gltfjson: repos });
				this.setState({ activefile: id });
			});

	};
	
	getSplit = (id) => {
		getSplitFiles(id)
			.then(res => res.data)
			.then((repos) => {
				//console.log(repos);
							
				this.setState({ gltfjson: JSON.stringify(repos) });
				this.setState({ activefile: id });
				this.setState({ splitfiles: repos });
				this.setState({ activesplit: id });
			});

	};
	
    render() {
	  
		const files = this.state.files.map(files => (
			<li key={files.filename}>
				{/* <button style={{marginRight: '16px'}} value={files.filename} onClick={() => this.getView(files.id)} type='button'>{files.filename}-View</button> */}
				<button value={files.filename} onClick={() => this.getSplit(files.id)} type='button'>{files.filename}</button>
			</li>
		));

		return (
			<div id="box">
				<div id="rowheader">
				  <Dropzone onDrop={this.onDrop}>
					{({getRootProps, getInputProps}) => (
					  <section className="container">
						<div {...getRootProps({className: 'dropzone'})}>
						  <input {...getInputProps()} />
						  <p>Try dropping some files here, or click to select files to upload.</p>
						</div>
						{ files && !!files.length &&
							<aside>
							  <h4>Click Button to Split and View the File</h4>
							  <ul>{files}</ul>
							</aside>
						}
					  </section>
					)}
				  </Dropzone>
				  <Downloader splitfiles={this.state.splitfiles} activesplit={this.state.activesplit} />
				</div>				
				<div id="rowcontent">
						<GLTFRenderer gltfjson={this.state.gltfjson} activefile={this.state.activefile} />						
				</div>		
			</div>
		);
	}
}

export default DropZone;
