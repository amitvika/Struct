import React,{Component} from 'react';
class DisplaySpinner extends Component {
    constructor(props) {
        super(props)		
    }    
	render() {
        return ( this.props.loadingContent && (
            <div style={{position:'absolute', top:'40%',left:'50%'}}>
            <img style={{width: '90px', objectFit: 'scale-down', 
             position:'absolute',opacity:'0.95', align: 'middle' }} 
             src= {require("./assets/images/spinner.gif")}/></div> )
         );
    }
}

export default DisplaySpinner;
