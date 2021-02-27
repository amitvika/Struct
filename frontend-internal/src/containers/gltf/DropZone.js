import React,{Component} from 'react';
import Dropzone from 'react-dropzone';
import GLTFRenderer from "./GltfRenderer";
import Downloader from "./Downloader";
import { upload3DFile, getGLTFJson, getSplitFiles, getHierarchySplitFiles } from '../../api/fileUpload.api'
import './style.css';

const DEFAULTSPLITS={
	"buffers":[],
	"meshes":[],
	"nodes":[],
	"download":""
};

class DropZone extends Component{
	state = {
			files: [],
			gltfjson: "",
			activefile: 0,
			splitfiles:DEFAULTSPLITS,
			activesplit: 0,
			includeparts: 0,
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
				this.setState({ includeparts: 1});
			});

	};
	getHierarchySplit = (id, includeParts, distancegap, anglegap) => {
		getHierarchySplitFiles(id, includeParts, distancegap, anglegap)
			.then(res => res.data)
			.then((repos) => {
				//console.log(repos);
							
				this.setState({ gltfjson: JSON.stringify(repos) });
				this.setState({ activefile: id });
				this.setState({ splitfiles: repos });
				this.setState({ activesplit: id });
				this.setState({ includeparts: includeParts ? 3:2 });
			});

	};
	
    render() {
	  
		const files = this.state.files.map( (files, index) => (
			
				<tr key={files.filename}>
					<td>
						{index+1}
					</td>
					<td>
						{files.filename}
					</td>
					<td>
						<button value={files.filename}  onClick={() => this.getSplit(files.id)} type='button'>Continuous</button>				
					</td>
					<td>
						<button value={files.filename}  onClick={() => this.getHierarchySplit(files.id,false,0.1,0.5)} type='button'>Hierarchy</button>				
					</td>
					<td>
						<button value={files.filename}  onClick={() => this.getHierarchySplit(files.id,true,0.1,0.5)} type='button'>Separate Minor Parts</button>				
					</td>
				</tr>						
			
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
							  <table><tbody>{files}</tbody></table>
							</aside>
						}
					  </section>
					)}
				  </Dropzone>
				  <Downloader splitfiles={this.state.splitfiles} activesplit={this.state.activesplit} />
				</div>				
				<div id="rowcontent">
					<GLTFRenderer gltfjson={this.state.gltfjson} activefile={this.state.activefile} includeparts={this.state.includeparts} />						
				</div>		
			</div>
		);
	}
}

export default DropZone;
