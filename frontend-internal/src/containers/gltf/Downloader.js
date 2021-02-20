import React,{Component} from 'react';
import request from 'axios';
import { resourcePathURL } from '../../api/fileUpload.api.js';
import { stringify } from './BeautifyJson.js';

class Downloader extends Component {
    constructor(props) {
        super(props)		
    }

	prettyPrintArray= (json) => {
		if (typeof json === 'string') {
		  json = JSON.parse(json);
		}
		return stringify(json, {maxlength:80});  		
	};

	render() {
		
		
		const files = this.props.splitfiles.buffers.map(file => (
			<li key={file.step} >
				<a href={resourcePathURL+file.step}>{file.step}-Download</a>
				<pre>{this.prettyPrintArray(file)}</pre>				
			</li>
		)) ;
		
		const meshes = this.props.splitfiles.meshes.map(file => (
			<li key={file.name} >
				<pre>{this.prettyPrintArray(file)}</pre>				
			</li>
		)) ;
		
        return (
			<div>
				{ files && !!files.length &&
					<aside>
					  <h4>Click Link to Download the File</h4>
					  <ul>{files}</ul>
					  <div>
						 <pre>
							 {this.prettyPrintArray(this.props.splitfiles.nodes)}
						 </pre>
					  </div>
					  <ul>{meshes}</ul>					 					 
					</aside>
					 
				}
			</div>
		);
	}
}
export default Downloader;
