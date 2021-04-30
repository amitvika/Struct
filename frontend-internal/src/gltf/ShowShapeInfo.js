import React,{Component} from 'react';
import Modal from 'react-modal';
import DisplayStructure from "./DisplayStructure"
Modal.setAppElement('body')
const DEFAULTDATA = {
	name: "None",
	structure : []
}
class ShowShapeInfo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  showModal: this.props.showModal,
		  data:this.props.data
		};		
		this.handleCloseModal = this.handleCloseModal.bind(this);
	}
	
	static getDerivedStateFromProps(nextProps, prevState) {
		//console.log(nextProps,prevState);
		// do things with nextProps.someProp and prevState.cachedSomeProp
		var toSet = false;
		if(prevState.data) {
			if(nextProps.data) {
				toSet = prevState.data.name!=nextProps.data.name;
			} else {
				toSet = true;
			}
		} else {
			if(nextProps.data) {
				toSet = true;
			}
		}
		//console.log("Prop change",nextProps, prevState);
		if((nextProps.showModal != prevState.showModal) || toSet) {
			
			return {
				showModal: nextProps.showModal,	
				data : nextProps.data			
			};
		} else {
			return null;
		}
	}
	 
	handleCloseModal () {
		//console.log("before",this.state.showModal);
		this.setState({ showModal: false });
		if(this.props.closeModal) {
			this.props.closeModal();
		}
		//console.log("after",this.state.showModal);
	}
	myTheme = {
		'my-theme': {
		  text: '#48b', // the colours used for foreground
		  bg: '#ffd', // the colours used for background
		  highlight: '#fd0', // the colours used for selected and hover items
		  decal: '#da2', // the colours used  for open folder indicators and icons
		  accent: '#bcd' // the colour used for row borders and empty file indicators
		}
	}
	render () {
		return <Modal 
					isOpen={this.state.showModal}
					contentLabel="Show Shape Information"
					onRequestClose={this.handleCloseModal}
					shouldCloseOnOverlayClick={false}
					/* style={{
						overlay: {
							backgroundColor: 'papayawhip'
						},
						content: {
							color: 'lightsteelblue'
						}
					}} */
				>
					<button onClick={this.handleCloseModal}>Close {this.state.data? this.state.data.name: ""}</button>
					<DisplayStructure nodes={this.state.data? this.state.data.structures : DEFAULTDATA} theme={'my-theme'} customTheme={this.myTheme} grow={true} structure={false} />
					<button onClick={this.handleCloseModal}>Close {this.state.data? this.state.data.name: ""}</button>
				</Modal>			
	}
}
export default ShowShapeInfo;
