import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import GLTFRenderer from "./GltfRenderer";
import DisplayTree from "./DisplayTree";
import Slider from "./Slider/components/Slider";
import {
	rgbToHex, getTexture, prettyPrintArray, getFloat,
	SELECTBACKCOLOR, SELECT2DTEXTURE, SELECT3DTEXTURE, SELECTMATERIRAL, SELECTTICK
} from "./Tree/utils";
import Select from "./DropDown";
import { upload3DFile, getGLTFJson, getSplitFiles, getHierarchySplitFiles, getAllTextures, getAllFiles } from '../api/fileUpload.api'
import './style.css';

const DEFAULTSPLITS = {
	"buffers": [],
	"meshes": [],
	"nodes": [],
	"download": "",
	"tree": [],
	"btree": [],
};

const MOVEONLY = 1;
const ROTATEONLY = 2;

const CONTINUOUSSPLIT = 1;
const HIERARCHYSPLIT = 2;
const HIERARCHYMINOR = 3;
const CONTINUOUSMINOR = 4;

const DEFAULTCOLOR = rgbToHex(0.8, 0.8, 0.8);
const DEFAULTTEXTURE = getTexture(null);
const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.5;
const DEFAULTDISECT = false;
const DefaultMaterials = [
	{ "id": 1, "name": "Basic" },
	{ "id": 2, "name": "Lambert" },
	{ "id": 3, "name": "Phong" },
	{ "id": 4, "name": "Standard" },
	{ "id": 5, "name": "Physical" }
]
const DEFAULTMATERIALTYPE = [{ "id": 1, "name": "Basic" }];

const DEFAULTDISTANCEDATA = {
	"distance": null,
	"points1": [],
	"points2": []
};

const splitPaneContext = React.createContext();
class DropZone extends Component {
	state = {
		files: [],
		gltfjson: "",
		gltfobj: DEFAULTSPLITS,
		activefile: 0,
		splitfiles: DEFAULTSPLITS,
		activesplit: 0,
		includeparts: 0,
		loadingContent: false,
		distancegap: [],
		anglegap: [],
		changedata: [],
		whatchanged: 0,
		datacolor: DEFAULTCOLOR,
		data2values: DEFAULTTEXTURE,
		data3values: DEFAULTTEXTURE,
		dataselection: 0,
		textures: [],
		disect: [],
		selectedindex: -1,
		materialtype: [],
		firstshell: null,
		secondshell: null,
		xmove: 0.0,
		ymove: 0.0,
		zmove: 0.0,
		xrotate: 0.0,
		yrotate: 0.0,
		zrotate: 0.0,
		distancedata: DEFAULTDISTANCEDATA,
	}

	constructor(props) {
		super(props);

	}
	componentDidMount() {
		this.getTextures();
	}
	getSpinner = () => {
		return (this.state.loadingContent && (
			<div><img style={{
				width: '90px', objectFit: 'scale-down',
				position: 'absolute', opacity: '0.95', align: 'middle'
			}}
				src={require("./assets/images/spinner.gif")} /></div>)
		);
	}
	setStateLoadingContent = (stage) => {
		this.setState({ loadingContent: stage });
	}

	SplitPane = ({ children, ...props }) => {
		const [leftWidth, setLeftWidth] = React.useState(null);
		const separatorXPosition = React.useRef(null);

		const splitPaneRef = React.createRef();

		const onMouseDown = e => {
			separatorXPosition.current = e.clientX;
		};

		const onMouseMove = e => {
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
			const splitPaneWidth = splitPaneRef.current.clientWidth;

			// if (newLeftWidth >= splitPaneWidth) {
			//   return leftWidth !== splitPaneWidth && setLeftWidth(splitPaneWidth);
			// }
			setLeftWidth(newLeftWidth);
		};

		const onMouseUp = () => {
			separatorXPosition.current = null;
		};

		React.useEffect(() => {
			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);

			return () => {
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
			};
		});
		//console.log(children);
		return <div {...props} className="split-pane" ref={splitPaneRef}>
			<splitPaneContext.Provider value={{ leftWidth, setLeftWidth }}>
				{children[0]}

				<div width="150" height="100" className="separator" onMouseDown={onMouseDown}>

				</div>
				{children[1]}
			</splitPaneContext.Provider>
		</div>

	}

	getFileList = () => {
		const files = this.state.files.map((files, index) => (

			<tr key={files.id}>
				<td>
					{index + 1}
				</td>
				<td>
					{files.filename}
				</td>
				{/* //From Cadquery, there is no way to get distance between 2 shells, and also complex to disect shapes, hence commented,
					<td>
					<button value={files.filename}  onClick={
						() => this.getSplit(files.id,false,index)} type='button'>FullRead</button>				
					</td> */}
				<td>
					<button value={files.filename} onClick={
						() => this.getSplit(files.id, true, index)} type='button'>Continuous</button>
				</td>
				<td>
					<button value={files.filename} onClick={
						() => this.getHierarchySplit(files.id, false, index)} type='button'>Hierarchy</button>
				</td>
				<td>
					<button value={files.filename} onClick={
						() => this.getHierarchySplit(files.id, true, index)} type='button'>Disect Parts</button>
				</td>

				<td>

					<Slider

						value={this.state.distancegap[index]}
						min={0.01}
						max={10}
						step={0.01}
						onChange={(e) => {
							var distancegap = this.state.distancegap;
							distancegap[index] = e;
							this.setState({
								distancegap: distancegap,
								dataselection: 0
							});
							// console.log(e) 
						}}

					/>
				Distance Gap:
				<input style={{ width: '50px' }} type="number"
						value={this.state.distancegap[index]}
						min={0.01}
						max={10}
						step={0.01}
						onChange={(e) => {
							var distancegap = this.state.distancegap;
							distancegap[index] = getFloat(e.target.value);
							this.setState({
								distancegap: distancegap,
								dataselection: 0
							})
						}} />
				</td>
				<td>

					<Slider

						value={this.state.anglegap[index]}
						min={0.1}
						max={360}
						step={0.1}
						onChange={(e) => {
							var anglegap = this.state.anglegap;
							anglegap[index] = e;
							this.setState({
								anglegap: anglegap,
								dataselection: 0
							});
							// console.log(e) 
						}}

					/>
				Angle Gap:
				<input style={{ width: '50px' }} type="number"
						value={this.state.anglegap[index]}
						min={0.1}
						max={360}
						step={0.1}
						onChange={(e) => {
							var anglegap = this.state.anglegap;
							anglegap[index] = getFloat(e.target.value);
							this.setState({
								anglegap: anglegap,
								dataselection: 0
							})
						}} />

				</td>
				<td>
					<label>
						<input type="checkbox"

							defaultChecked={this.state.disect[index]}
							onChange={() => {
								var disect = this.state.disect;
								disect[index] = !disect[index];
								this.setState({
									disect: disect,
									dataselection: 0
								});
								// console.log(e) 
							}} />
				Disect Structure
				</label>
				</td>
				<td>
					Material:
					<div style={{ maxWidth: "350px", margin: "0 auto", minWidth: "100px" }}>
						<Select options={DefaultMaterials} multi={false} placeholder="Select Material Type"
							labelField={"name"} valueField={"id"} dropdownHeight={'200px'}
							values={this.state.materialtype[index]}
							onChange={
								datavalues => {
									if (datavalues && !!datavalues.length) {
										var materialtype = this.state.materialtype;
										materialtype[index] = datavalues;
										this.setState({
											materialtype: materialtype,
											dataselection: SELECTMATERIRAL
										});
									}

								}}
						/>
					</div>
				</td>
			</tr>

		));
		//console.log(files)
		return <div><div style={{ position: 'absolute', top: '40%', left: '50%' }}>
			{this.getSpinner()} </div>
			<div id="rowheader">
				<table>
					<tbody>
						<tr>
							<td>
								<Dropzone onDrop={this.onDrop}>
									{({ getRootProps, getInputProps }) => (
										<section className="container">
											<div {...getRootProps({ className: 'dropzone' })}>
												<input {...getInputProps()} />
												<p>Try dropping some files here, or click to select files to upload.</p>
											</div>
										</section>
									)}
								</Dropzone>
							</td>
							<td>
								<button value={"View"} onClick={() => this.getFiles()} type='button'>
									View Uploaded Files
							</button>
							</td>
							<td>
								Color:
								<input
									type="color"
									defaultValue={this.state.datacolor}
									onChange={
										event => {
											if (event && event.target) {
												//console.log("1",state)
												this.setState({
													datacolor: event.target.value,
													dataselection: SELECTBACKCOLOR
												});

											}

										}
									}
								/>
							</td>
							<td>
								2D Texture:
							<div style={{ maxWidth: "350px", margin: "0 auto", minWidth: "100px" }}>
									<Select options={this.state.textures.textures2D} multi={false} placeholder="Select 2D Texture"
										labelField={"id"} valueField={"name"} dropdownHeight={'200px'}
										values={this.state.data2values}
										onChange={
											datavalues => {
												if (datavalues && !!datavalues.length) {

													this.setState({
														data2values: datavalues,
														dataselection: SELECT2DTEXTURE
													});

												}

											}}
									/>
								</div>
							</td>
							<td>
								3D Texture:
							<div style={{ maxWidth: "350px", margin: "0 auto", minWidth: "100px" }}>
									<Select options={this.state.textures.textures3D} multi={false} placeholder="Select 3D Texture"
										labelField={"id"} valueField={"name"} dropdownHeight={'200px'}
										values={this.state.data3values}
										onChange={
											datavalues => {
												if (datavalues && !!datavalues.length) {
													this.setState({
														data3values: datavalues,
														dataselection: SELECT3DTEXTURE
													});
												}

											}}
									/>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				{files && !!files.length &&
					<aside>
						<h4>Click Button to Split and View the File</h4>
						<table><tbody>{files}</tbody></table>
					</aside>
				}
				<div style={{ Width: "100%" }}>
					<DisplayTree theme={'my-theme'} customTheme={this.myTheme} grow={true}
						nodes={this.state.splitfiles.btree}
						textures={this.state.textures.textures2D}
						structure={true}
						firstshell={this.state.firstshell}
						secondshell={this.state.secondshell}
						disectparts={this.state.selectedindex == -1 ? false : this.state.disect[this.state.selectedindex]}
						onSelect={
							(data, what) => {
								this.setState({
									changedata: data,
									whatchanged: what
								});
								if (what == SELECTTICK) {
									//console.log(data);
									if (data.selected) {
										if (!this.state.firstshell) {
											this.setState({
												firstshell: data
											})
											//this.state.firstshell = data;
											//console.log("firstshell",this.state.firstshell);
										} else {
											if (!this.state.secondshell) {
												this.setState({
													secondshell: data
												})
												//this.state.secondshell = data;
												//console.log("secondshell",this.state.secondshell);
											} else {
												this.state.firstshell.selected = false;
												const secondshell = this.state.secondshell;
												this.setState({
													firstshell: secondshell,
													secondshell: data
												});
												//console.log("First and second",this.state.firstshell,this.state.secondshell)
											}
										}

									} else {
										if (this.state.firstshell && (this.state.firstshell.name == data.name)) {
											this.state.firstshell.selected = false;
											const secondshell = this.state.secondshell;
											this.setState({
												firstshell: secondshell,
												secondshell: null
											});

										} else {
											if (this.state.secondshell && (this.state.secondshell.name == data.name)) {
												this.state.secondshell.selected = false;
												this.setState({
													secondshell: null
												});
											} else {
												//console.log("This condition is not possible");
											}
										}
									}
								}
								//console.log(data,what)
							}}
					/>
				</div>
				{this.state.selectedindex != -1 && !this.state.firstshell && (
					<div>
						ID : {this.state.files[this.state.selectedindex].filename.slice(0, -5)}
					</div>
				)}
				{this.state.firstshell && (
					<table>
						<tbody>
							<tr>
								<td>
									File :<br></br>
									{this.state.selectedindex == -1 ? "Error in selection" : this.state.files[this.state.selectedindex].filename.slice(0, -5)}
								</td>
								<td>
									First Shell:<br></br> {this.state.firstshell.name}
								</td>
								{this.state.secondshell && (
									<>
										<td>
											Second Shell:<br></br> {this.state.secondshell.name}
										</td>
										<td>
											Move:
									<br></br>X :
									<input style={{ width: '50px' }} type="number"
												value={this.state.xmove}
												min={0}
												max={10}
												step={0.1}
												onChange={(e) => {
													const xmove = getFloat(e.target.value);
													this.setState({
														xmove: xmove,
														dataselection: 0
													})
												}} />
											<br></br>Y :
									<input style={{ width: '50px' }} type="number"
												value={this.state.ymove}
												min={0}
												max={10}
												step={0.1}
												onChange={(e) => {
													const ymove = getFloat(e.target.value);
													this.setState({
														ymove: ymove,
														dataselection: 0
													})
												}} />
											<br></br>Z :
									<input style={{ width: '50px' }} type="number"
												value={this.state.zmove}
												min={0}
												max={10}
												step={0.1}
												onChange={(e) => {
													const zmove = getFloat(e.target.value);
													this.setState({
														zmove: zmove,
														dataselection: 0
													})
												}} />
										</td>
										<td>
											Rotate:
									<br></br>XY :
									<input style={{ width: '50px' }} type="number"
												value={this.state.zrotate}
												min={0}
												max={10}
												step={0.1}
												onChange={(e) => {
													const zrotate = getFloat(e.target.value);
													this.setState({
														zrotate: zrotate,
														dataselection: 0
													})
												}} />
											<br></br>XZ :
									<input style={{ width: '50px' }} type="number"
												value={this.state.yrotate}
												min={0}
												max={10}
												step={0.1}
												onChange={(e) => {
													const yrotate = getFloat(e.target.value);
													this.setState({
														yrotate: yrotate,
														dataselection: 0
													})
												}} />
											<br></br>YZ :
									<input style={{ width: '50px' }} type="number"
												value={this.state.xrotate}
												min={0}
												max={10}
												step={0.1}
												onChange={(e) => {
													const xrotate = getFloat(e.target.value);
													this.setState({
														xrotate: xrotate,
														dataselection: 0
													})
												}} />
										</td>
										<td>
											<button value={"Move"}
												onClick={() => {
													this.getTransformation(MOVEONLY);
												}} type='button'>
												Move <br></br> And<br></br> Find <br></br> Minimum <br></br> Distance
									</button>
										</td>
										<td>
											<button value={"Rotate"}
												onClick={() => {
													this.getTransformation(ROTATEONLY);
												}} type='button'>
												Rotate <br></br> And <br></br>Find<br></br> Minimum<br></br> Distance
									</button>
										</td>
									</>
								)}
							</tr>
							{this.state.distancedata.distance !== null && (
								<tr>
									<td colSpan="7">
										{prettyPrintArray(this.state.distancedata, 120)}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				)}
			</div>
		</div>
	}

	SplitPaneLeft = (props) => {
		const leftRef = React.createRef();
		const { leftWidth, setLeftWidth } = React.useContext(splitPaneContext);

		React.useEffect(() => {
			if (!leftWidth) {
				// console.log("I am seee")
				setLeftWidth(leftRef.current.clientWidth);
				leftRef.current.style.flex = "row";
				return;
			}

			leftRef.current.style.width = `${leftWidth}px`;
		}, [leftWidth]);


		return <div {...props} className="split-pane-left" ref={leftRef} style={{ width: "100%", height: "100%" }}>
			{this.getFileList()}
		</div>
	};


	SplitPaneRight = (props) => {

		return this.TableSplitPaneRight(props);
	};

	TableSplitPaneLeft = (props) => {

		return <div {...props} style={{ width: "100%", height: "100%" }}>{this.getFileList()}</div>

	};

	TableSplitPaneRight = (props) => {

		return <div {...props} style={{ width: "100%", height: "100%" }} >
			<div id="rowcontent">
				<GLTFRenderer gltfjson={this.state.gltfjson} gltfobj={this.state.gltfobj}
					activefile={this.state.activefile} backcolor={this.state.datacolor}
					includeparts={this.state.includeparts} changedata={this.state.changedata}
					data2texture={this.state.data2values[0].name}
					data3texture={this.state.data3values[0].name}
					materialtype={this.state.selectedindex == -1 ? DEFAULTMATERIALTYPE[0].name : this.state.materialtype[this.state.selectedindex][0].name}
					disectparts={this.state.selectedindex == -1 ? false : this.state.disect[this.state.selectedindex]}
					whatchanged={this.state.whatchanged} dataselection={this.state.dataselection} />
			</div>
		</div>;
	};

	onDrop = async (files) => {
		this.setState({
			files: [],
			splitfiles: DEFAULTSPLITS,
			distancegap: [],
			anglegap: [],
			disect: [],
			materialtype: [],
			selectedindex: -1,
		})
		files.forEach(oneFile => {
			var formData = new FormData();
			formData.append('file', oneFile)
			this.setStateLoadingContent(true);
			upload3DFile(formData)
				.then(res => {
					this.setState(prevState => ({
						files: [...prevState.files, res.data],
						distancegap: [...prevState.distancegap, DEFAULTDISTANCEGAP],
						anglegap: [...prevState.anglegap, DEFAULTANGLEGAP],
						disect: [...prevState.disect, DEFAULTDISECT],
						materialtype: [...prevState.materialtype, DEFAULTMATERIALTYPE],
					}));
					//console.log(res.data);	
					this.setStateLoadingContent(false);
				})
				.catch(err => {
					console.log('Error -->> ', err)
					this.setStateLoadingContent(false);
				});

		});
	};

	getFiles = () => {
		this.setState({
			files: [],
			splitfiles: DEFAULTSPLITS,
			selectedindex: -1,
		})
		this.setStateLoadingContent(true);
		getAllFiles()
			.then(res => res.data)
			.then((repos) => {
				//console.log(repos);
				this.setState({
					files: repos,
					distancegap: new Array(repos.length).fill(DEFAULTDISTANCEGAP),
					anglegap: new Array(repos.length).fill(DEFAULTANGLEGAP),
					disect: new Array(repos.length).fill(DEFAULTDISECT),
					materialtype: new Array(repos.length).fill(DEFAULTMATERIALTYPE)
				});
				this.setStateLoadingContent(false);
			}).catch(err => {
				console.log('Error -->> ', err)
				this.setStateLoadingContent(false);
			});
	};

	getTextures = () => {
		this.setStateLoadingContent(true);
		getAllTextures()
			.then(res => res.data)
			.then((repos) => {
				//console.log("textures", repos);
				this.setState({
					textures: repos,
				});
				this.setStateLoadingContent(false);
			}).catch(err => {
				console.log('Error -->> ', err)
				this.setStateLoadingContent(false);
			});
	}

	getView = (id) => {
		this.setStateLoadingContent(true);
		getGLTFJson(id)
			.then(res => res.data)
			.then((repos) => {
				//console.log(repos);
				this.setState({
					gltfjson: JSON.stringify(repos),
					gltfobj: repos,
					activefile: id,
					splitfiles: repos,
					activesplit: id,
					dataselection: 0,
					includeparts: 0,
					firstshell: null,
					secondshell: null,

				});
				this.state.splitfiles["btree"] = [];
				this.state.splitfiles.tree.forEach(element => {
					if (element.bin) {
						element["selected"] = false;
						this.state.splitfiles.btree.push(element);
						//console.log("Adding", element);
					}
					//console.log("Not Adding", element);					
				});
				this.setStateLoadingContent(false);
			}).catch(err => {
				console.log('Error -->> ', err)
				this.setStateLoadingContent(false);
			});

	};

	getSplit = (id, includeParts, index) => {
		this.setStateLoadingContent(true);
		//console.log("id",id);
		getSplitFiles(id, includeParts,
			this.state.distancegap[index], this.state.anglegap[index], this.state.disect[index],
			this.state.xmove, this.state.ymove, this.state.zmove,
			this.state.xrotate, this.state.yrotate, this.state.zrotate, 0, "", "")
			.then(res => res.data)
			.then((repos) => {
				//console.log(repos);

				this.setState({
					selectedindex: index,
					gltfjson: JSON.stringify(repos),
					gltfobj: repos,
					activefile: id,
					splitfiles: repos,
					activesplit: id,
					dataselection: 0,
					includeparts: includeParts ? CONTINUOUSMINOR : CONTINUOUSSPLIT,
					firstshell: null,
					secondshell: null,
				});
				this.state.splitfiles["btree"] = [];
				this.state.splitfiles.tree.forEach(element => {
					if (element.bin) {
						element["selected"] = false;
						this.state.splitfiles.btree.push(element);
					}
				});
				this.setStateLoadingContent(false);
			}).catch(err => {
				console.log('Error -->> ', err)
				this.setStateLoadingContent(false);
			})

	};

	getHierarchySplit = (id, includeParts, index) => {
		this.setStateLoadingContent(true);
		getHierarchySplitFiles(id, includeParts,
			this.state.distancegap[index], this.state.anglegap[index], this.state.disect[index],
			this.state.xmove, this.state.ymove, this.state.zmove,
			this.state.xrotate, this.state.yrotate, this.state.zrotate, 0, "", "")
			.then(res => res.data)
			.then((repos) => {
				//console.log(repos);					
				this.setState({
					selectedindex: index,
					gltfjson: JSON.stringify(repos),
					gltfobj: repos,
					activefile: id,
					splitfiles: repos,
					activesplit: id,
					dataselection: 0,
					includeparts: includeParts ? HIERARCHYMINOR : HIERARCHYSPLIT,
					firstshell: null,
					secondshell: null,
				});
				this.state.splitfiles["btree"] = [];
				this.state.splitfiles.tree.forEach(element => {
					if (element.bin) {
						element["selected"] = false;
						this.state.splitfiles.btree.push(element);
					}
				});
				this.setStateLoadingContent(false);
			}).catch(err => {
				console.log('Error -->> ', err)
				this.setStateLoadingContent(false);
			});

	};

	getTransformation = (moverotate) => {
		this.setStateLoadingContent(true);
		const index = this.state.selectedindex;
		this.state.distancedata = DEFAULTDISTANCEDATA;
		//console.log(index, this.state, this.state.files, this.state.files[index]);
		(this.state.includeparts == CONTINUOUSMINOR || this.state.includeparts == CONTINUOUSSPLIT) ?
			getSplitFiles(this.state.files[index].id,
				(this.state.includeParts == CONTINUOUSMINOR),
				this.state.distancegap[index], this.state.anglegap[index], this.state.disect[index],
				this.state.xmove, this.state.ymove, this.state.zmove,
				this.state.xrotate, this.state.yrotate, this.state.zrotate, moverotate,
				this.state.firstshell.step.slice(0, -5), this.state.secondshell.step.slice(0, -5))
				.then(res => res.data)
				.then((repos) => {
					//console.log(repos);

					this.setState({
						distancedata: repos,
					});
					//console.log(repos);
					this.setStateLoadingContent(false);
				}).catch(err => {
					console.log('Error -->> ', err)
					this.setStateLoadingContent(false);
				}) :
			getHierarchySplitFiles(this.state.files[index].id,
				(this.state.includeparts == CONTINUOUSMINOR || this.state.includeparts == HIERARCHYMINOR),
				this.state.distancegap[index], this.state.anglegap[index], this.state.disect[index],
				this.state.xmove, this.state.ymove, this.state.zmove,
				this.state.xrotate, this.state.yrotate, this.state.zrotate, moverotate,
				this.state.firstshell.step.slice(0, -5), this.state.secondshell.step.slice(0, -5))
				.then(res => res.data)
				.then((repos) => {
					//console.log(repos);

					this.setState({
						distancedata: repos,
					});
					//console.log(repos);
					this.setStateLoadingContent(false);
				}).catch(err => {
					console.log('Error -->> ', err)
					this.setStateLoadingContent(false);
				})

	};

	myTheme = {
		'my-theme': {
			text: '#48b', // the colours used for foreground
			bg: '#ffd', // the colours used for background
			highlight: '#fd0', // the colours used for selected and hover items
			decal: '#da2', // the colours used  for open folder indicators and icons
			accent: '#bcd' // the colour used for row borders and empty file indicators
		}
	}

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
				? (
					childrenOf[parentId] = childrenOf[parentId] || []
				).push(item)
				: tree.push(item);
		});
		return tree;
	}

	render() {

		return <>
			<table style={{ width: "100%", height: "100%" }} >
				<tbody>
					<tr>
						<td style={{ paddingRight: "20px", padding: "5px" }} >
							<this.TableSplitPaneLeft />
						</td>
						<td style={{ border: "1px solid blue", paddingLeft: "20px", padding: "5px" }} >
							<this.TableSplitPaneRight />
						</td>
					</tr>
				</tbody>
			</table>

		</>
	}
}

export default DropZone;
