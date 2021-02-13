import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import request from 'axios';


import GLTFRenderer from "./GltfRenderer";
import { upload3DFile, getGLTFJson } from '../../api/fileUpload.api'

class DropZone extends Component {

	constructor() {
		super();
		this.state = {
			fileIDs: [],
			files: [],
			gltfjson: "",
			activefile: 0
		}
	}
	onDrop = async (files) => {

		this.fileIDs = [];
		files.forEach(oneFile => {
			var formData = new FormData();
			formData.append('file', oneFile)
			upload3DFile(formData)
				.then(res => {
					this.setState({
						files: [res.data],
						fileIDs: [res.data.id]
					})
					// this.setFileIDs(this, oneFile);
				})
				.catch(err => {
					console.log('Error -->> ', err)
				})


			//req.end(this.setFileIDs(this,oneFile));
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

	render() {

		const files = this.state.files.map(files => (
			<li key={files.filename}>
				<button value={files.filename} onClick={() => this.getView(files.id)} type='button'>{files.filename}</button>
			</li>
		));

		return (
			<div id="box">
				<div id="rowheader">
					<Dropzone onDrop={this.onDrop}>
						{({ getRootProps, getInputProps }) => (
							<section className="container">
								<div {...getRootProps({ className: 'dropzone' })}>
									<input {...getInputProps()} />
									<p>Try dropping some files here, or click to select files to upload.</p>
								</div>
								{ files && !!files.length &&
									<aside>
										<h4>Click Button to View the File</h4>
										<ul>{files}</ul>
									</aside>
								}
							</section>
						)}
					</Dropzone>
				</div>
				<div id="rowcontent">
					<GLTFRenderer gltfjson={this.state.gltfjson} activefile={this.state.activefile} />
				</div>
			</div>
		);
	}
}

export default DropZone;
