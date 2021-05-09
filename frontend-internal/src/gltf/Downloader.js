import React, { Component } from 'react';

import Slider from "./Slider/components/Slider";
import { getFloat } from "./Tree/utils";
import Select from "./DropDown";
import Icon from './Tree/Icon'


const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.5;
const DEFAULTDISECT = false;
const DEFAULTSHOWDISECT = false;
const DEFAULTSHOWINFOONSELECT = false;

const DefaultMaterials = [
    { "id": 1, "name": "Basic" },
    { "id": 2, "name": "Lambert" },
    { "id": 3, "name": "Phong" },
    { "id": 4, "name": "Standard" },
    { "id": 5, "name": "Physical" }
]
const DEFAULTMATERIALTYPE = [{ "id": 1, "name": "Basic" }];


class Downloader extends Component {
    constructor(props) {
        super(props);
        const mylength = this.props.files.length;
        this.state = {
            distancegap: new Array(mylength).fill(DEFAULTDISTANCEGAP),
            anglegap: new Array(mylength).fill(DEFAULTANGLEGAP),
            disect: new Array(mylength).fill(DEFAULTDISECT),
            showdisect: new Array(mylength).fill(DEFAULTSHOWDISECT),
            showinfoonselect: new Array(mylength).fill(DEFAULTSHOWINFOONSELECT),
            materialtype: new Array(mylength).fill(DEFAULTMATERIALTYPE),
            files: this.props.files
        }
        //console.log("Constructor",this.props.files, this.state.materialtype);	
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        //console.log(nextProps,prevState);
        // do things with nextProps.someProp and prevState.cachedSomeProp
        if (nextProps.files !== prevState.files) {
            const mylength = nextProps.files.length;
            return {
                distancegap: new Array(mylength).fill(DEFAULTDISTANCEGAP),
                anglegap: new Array(mylength).fill(DEFAULTANGLEGAP),
                disect: new Array(mylength).fill(DEFAULTDISECT),
                showdisect: new Array(mylength).fill(DEFAULTSHOWDISECT),
                showinfoonselect: new Array(mylength).fill(DEFAULTSHOWINFOONSELECT),
                materialtype: new Array(mylength).fill(DEFAULTMATERIALTYPE),
                files: nextProps.files
            };
        } else {
            return null;
        }
    }

    /* componentWillReceiveProps(nextProps) {
        //console.log(nextProps, this.props.files);
        if (nextProps.files !== this.props.files) {
            //console.log("I am here");
            this.setState({
                distancegap: new Array(nextProps.files.length).fill(DEFAULTDISTANCEGAP),
                anglegap:new Array(nextProps.files.length).fill(DEFAULTANGLEGAP),
                disect: new Array(nextProps.files.length).fill(DEFAULTDISECT),
                materialtype: new Array(nextProps.files.length).fill(DEFAULTMATERIALTYPE),
            });
        }
        //console.log("Constructor",this.props.files, this.state.materialtype);	
      } */
    /* state = {
        distancegap: [],
        anglegap: [],
        disect:  [],
        materialtype:  [],
    } */

    myTheme = {
        'my-theme': {
            text: '#48b', // the colours used for foreground
            bg: '#ffd', // the colours used for background
            highlight: '#fd0', // the colours used for selected and hover items
            decal: '#da2', // the colours used  for open folder indicators and icons
            accent: '#bcd' // the colour used for row borders and empty file indicators
        }
    }

    render() {
        //console.log("Renderer",this.props.files, this.state.materialtype);
        const files = this.props.files.map((files, index) => (

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
                    <button value={files.filename}
                        onClick={() => {
                            if (this.props.getSplit) {
                                this.props.getSplit(files.id, true, index, this.state);
                            }
                        }}
                        type='button'>
                        <Icon
                            size="large"
                            icon="continuous"
                            theme={'my-theme'} customTheme={this.myTheme}
                        ></Icon>
						Continuous
					</button>
                </td>
                <td>
                    <button value={files.filename}
                        onClick={() => {
                            if (this.props.getHierarchySplit) {
                                this.props.getHierarchySplit(files.id, false, index, this.state, 0.3, 1.0);
                            }
                        }}
                        type='button'>
                        <Icon
                            size="large"
                            icon="hierarchy"
                            theme={'my-theme'} customTheme={this.myTheme}
                        ></Icon>
						Hierarchy
					</button>
                </td>
                <td>
                    <button value={files.filename}
                        onClick={() => {
                            if (this.props.getHierarchySplit) {
                                this.props.getHierarchySplit(files.id, true, index, this.state, 0.3, 1.0)
                            }
                        }}
                        type='button'>
                        <Icon
                            size="large"
                            icon="disectparts"
                            theme={'my-theme'} customTheme={this.myTheme}
                        ></Icon>
						Dissect
					</button>
                </td>
                <td>
                    <button value={files.filename}
                        onClick={() => {
                            if (this.props.getPartsStackable) {
                                this.props.getPartsStackable(files.id, index, this.state)
                            }
                        }}
                        type='button'>
                        <Icon
                            size="large"
                            icon="stackable"
                            theme={'my-theme'} customTheme={this.myTheme}
                        ></Icon>
						Stackable
					</button>
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
                                distancegap: distancegap
                            });
                            //console.log(e);

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
                                distancegap: distancegap
                            });
                            //console.log(e);
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
                                anglegap: anglegap
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
                                anglegap: anglegap
                            })
                        }} />

                </td>
                {/* <td>
				<label>
				 <input type="checkbox" 
					 
					defaultChecked={this.state.disect[index]} 
					onChange={ ()=> {  
						var disect = this.state.disect;
						disect[index] = !disect[index];						
						this.setState({ 
							disect: disect 
							});
						// console.log(e) 
					} }/>
				Disect Structure
				</label>
				</td>
				<td>
				<label>
				 <input type="checkbox" 
					 
					defaultChecked={this.state.showdisect[index]} 
					onChange={ ()=> {  
						var showdisect = this.state.showdisect;
						showdisect[index] = !showdisect[index];						
						this.setState({ 
							showdisect: showdisect 
							});
						// console.log(e) 
					} }/>
				Show if Disected
				</label>
				</td>*/}
                <td>
                    <label>
                        <input type="checkbox"

                            defaultChecked={this.state.showinfoonselect[index]}
                            onChange={() => {
                                var showinfoonselect = this.state.showinfoonselect;
                                showinfoonselect[index] = !showinfoonselect[index];
                                this.setState({
                                    showinfoonselect: showinfoonselect
                                });
                                if (this.props.setShowInfo) {
                                    this.props.setShowInfo(showinfoonselect[index], index);
                                }
                                // console.log(e) 
                            }} />
					Analyze On Click
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
                                            materialtype: materialtype
                                        });
                                        if (this.props.setGLTFMaterial) {
                                            this.props.setGLTFMaterial(datavalues, index);
                                        };
                                    }

                                }}
                        />
                    </div>
                </td>
            </tr>

        ));
        return (
            <div>
                { files && !!files.length &&
                    <aside>
                        <h4>Click Button to Split and View the File</h4>
                        <table><tbody>{files}</tbody></table>
                    </aside>
                }
            </div>);
    }

}
class Dynamic extends React.Component {
    markup(val) {
        return { __html: val }
    }

    render() {
        return <div dangerouslySetInnerHTML={this.markup(this.props.html)} />;
    }

}
export default Downloader;
