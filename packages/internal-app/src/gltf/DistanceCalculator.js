import React,{Component} from 'react';

import { getMinimumDistance } from '@ravibasil/common/api/fileUpload.api';
import { prettyPrintArray,getFloat } from "./Tree/utils";
import DisplaySpinner from "./DisplaySpinner";


const DEFAULTDISTANCEDATA = {
	"distance":null,
	"points1":[],
	"points2":[],
    "coplaner":"",
    "parallel":"",
    "normal": "",
    "opposite": "", 
    "concentric":"",
    "coradial": ""
};
const MOVEONLY=1;
const ROTATEONLY=2;
class DistanceCalculator extends Component {
    constructor(props) {
        super(props)		
    }
    state = {       
        xmove:0.0,
        ymove:0.0,
        zmove:0.0,
        xrotate:0.0,
        yrotate:0.0,
        zrotate:0.0,
        distancedata:DEFAULTDISTANCEDATA,
        loadingContent:false,
        firstshell:this.props.firstshell,
        secondshell:this.props.secondshell
    }
    static getDerivedStateFromProps(nextProps, prevState) {
		//console.log(nextProps,prevState);
		// do things with nextProps.someProp and prevState.cachedSomeProp
		if ( (nextProps.firstshell !== prevState.firstshell) && 
             (nextProps.secondshell !== prevState.secondshell) ) {
			return {
				firstshell: nextProps.firstshell,
                secondshell : nextProps.secondshell,
                distancedata : DEFAULTDISTANCEDATA
			};
		} else {
			return null;
		} 
	}
    setStateLoadingContent = (stage) => {
		this.setState({ loadingContent : stage } );
	}
	getTransformation = (moverotate) => {
		this.setStateLoadingContent(true);	
		this.setState({ 
            distancedata:DEFAULTDISTANCEDATA,					 
        });		
        getMinimumDistance(
            this.state.xmove,this.state.ymove,this.state.zmove,
            this.state.xrotate,this.state.yrotate,this.state.zrotate,moverotate,
            this.props.firstshell.step.slice(0, -5), this.props.secondshell.step.slice(0, -5))
        .then(res => res.data)
        .then((repos) => {
            //console.log(repos);
                        
            this.setState({ 
                distancedata:repos,					 
            });
            //console.log(repos);
            this.setStateLoadingContent(false);
        }).catch(err => {
            console.log('Error -->> ', err)
            this.setStateLoadingContent(false);	
        })

	};
	render() {
        return (
        <div>
		<DisplaySpinner loadingContent={this.state.loadingContent} />
		{!this.props.firstshell && (
            <div>
                ID : {this.props.stepfile}
            </div>				
        )}
        {this.props.firstshell && (				
            <table>
                <tbody>
                    <tr>
                        <td>
                            ID :<br></br> 
                            {this.props.stepfile}
                        </td>
                        <td>								
                            First Shell:<br></br> {this.props.firstshell.name}
                        </td>
                        {this.props.secondshell &&(
                            <>
                            <td>
                                Second Shell:<br></br> {this.props.secondshell.name}
                            </td>
                            <td>
                                Move: 
                                <br></br>X :
                                <input style={{width: '50px'}} type="number"
                                    value={this.state.xmove}
                                    min={0} 
                                    max={10} 
                                    step={0.1}   
                                    onChange={(e) =>{ 
                                        const xmove = getFloat(e.target.value);						
                                        this.setState({ 
                                            xmove: xmove,
                                            distancedata: DEFAULTDISTANCEDATA 
                                    })}} />
                                <br></br>Y :
                                <input style={{width: '50px'}} type="number"
                                    value={this.state.ymove}
                                    min={0} 
                                    max={10} 
                                    step={0.1}   
                                    onChange={(e) =>{ 
                                        const ymove = getFloat(e.target.value);						
                                        this.setState({ 
                                            ymove: ymove,
                                            distancedata: DEFAULTDISTANCEDATA  
                                    })}} />
                                <br></br>Z :
                                <input style={{width: '50px'}} type="number"
                                    value={this.state.zmove}
                                    min={0} 
                                    max={10} 
                                    step={0.1}   
                                    onChange={(e) =>{ 
                                        const zmove = getFloat(e.target.value);						
                                        this.setState({ 
                                            zmove: zmove,
                                            distancedata: DEFAULTDISTANCEDATA 
                                    })}} />
                            </td>
                            <td>
                                Rotate: 
                                <br></br>XY :
                                <input style={{width: '50px'}} type="number"
                                    value={this.state.zrotate}
                                    min={0} 
                                    max={10} 
                                    step={0.1}   
                                    onChange={(e) =>{ 
                                        const zrotate = getFloat(e.target.value);						
                                        this.setState({ 
                                            zrotate: zrotate,
                                            distancedata: DEFAULTDISTANCEDATA 
                                    })}} />
                                <br></br>XZ :
                                <input style={{width: '50px'}} type="number"
                                    value={this.state.yrotate}
                                    min={0} 
                                    max={10} 
                                    step={0.1}   
                                    onChange={(e) =>{ 
                                        const yrotate = getFloat(e.target.value);						
                                        this.setState({ 
                                            yrotate: yrotate,
                                            distancedata: DEFAULTDISTANCEDATA 
                                    })}} />
                                <br></br>YZ :
                                <input style={{width: '50px'}} type="number"
                                    value={this.state.xrotate}
                                    min={0} 
                                    max={10} 
                                    step={0.1}   
                                    onChange={(e) =>{ 
                                        const xrotate = getFloat(e.target.value);						
                                        this.setState({ 
                                            xrotate: xrotate,
                                            distancedata: DEFAULTDISTANCEDATA 
                                    })}} />
                            </td>
                            <td>
                                <button value={"Move"}  
                                onClick={() =>{ this.getTransformation(MOVEONLY);													
                                            }} type='button'>
                                    Move <br></br> And<br></br> Find <br></br> Minimum <br></br> Distance <br></br>And <br></br> Relation
                                </button>
                            </td>
                            <td>
                                <button value={"Rotate"}  
                                onClick={() =>{ this.getTransformation(ROTATEONLY);													
                                            }} type='button'>
                                    Rotate <br></br> And <br></br>Find<br></br> Minimum<br></br> Distance <br></br>And <br></br> Relation
                                </button>
                            </td>
                            </>
                        )}							
                    </tr>
                    { this.state.distancedata.distance !== null && (
                        <tr>
                            <td colSpan="7">
                                {prettyPrintArray(this.state.distancedata,120)}
                            </td>								
                        </tr>
                    )}
                </tbody>
            </table>
        )}
        </div>
        );
	}
}

export default DistanceCalculator;
