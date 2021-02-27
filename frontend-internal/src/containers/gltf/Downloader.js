import React,{Component} from 'react';
import { resourcePathURL } from '../../api/fileUpload.api.js';
import { stringify } from './BeautifyJson.js';
import './style.css';

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

	toggleClick=()=>{
		this.parentElement.querySelector(".nested").classList.toggle("active");
    	this.classList.toggle("caret-down");
	}
	
	
	render() {
		
		
		const files = this.props.splitfiles.buffers.map(file => (
			<li key={file.step} >
				<a href={resourcePathURL+file.step}>{file.name}-Download</a>
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
					  <Dynamic html={this.props.splitfiles.download} />					 
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
class Dynamic extends React.Component {
	markup (val) {
		return { __html: val }
	}
	
	render () {
		return <div dangerouslySetInnerHTML={this.markup(this.props.html)} />;
	}	
	
}
export default Downloader;
