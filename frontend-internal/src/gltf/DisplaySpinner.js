import React, { Component } from 'react';
//import myimage from "./assets/images/spinner.gif"
class DisplaySpinner extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        console.log(process.env.PUBLIC_URL);
        return (this.props.loadingContent && (
            <div style={{ position: 'absolute', top: '40%', left: '50%' }}>
                <img style={{
                    width: '90px', objectFit: 'scale-down',
                    position: 'absolute', opacity: '0.95', align: 'middle'
                }}
                    src={process.env.PUBLIC_URL +"/spinner.gif"} alt="Processing" /></div>)
        );
    }
}

export default DisplaySpinner;
