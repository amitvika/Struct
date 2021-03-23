/* 
 `npm start`
   Now open your browser and join localhost:8080
*/

import React from "react";
import ReactDOM from "react-dom";
import DropZone from "./gltf/DropZone";
import { Global, css } from "@emotion/core";

const styles = css`
	* {
		
		margin:0;
		padding:0;
	}
 
	html,
	body,
	#root {
		
		height: 100%;
		width: 100%;
		margin: 0;
		padding: 0;
	}
  
	#box {
		min-height:100%;
		
	}

	#rowheader {
		
		width: 100%;
		height:30%; 
    	overflow-y: scroll;
		background-color:red;
	}

	#rowcontent {	
			
		padding-bottom: 2px; 
		height: 70%;
		background-color:blue;
	}

	.gui-wrap {
	  position: absolute;
	  top:0;
	  right: 0;
	  bottom: 0;
	  pointer-events: none;
	}

	.gui-wrap > .main {
	  pointer-events: all;
	  max-height: 100%;
	  overflow: auto;
	}

	.dg li.gui-stats:not(.folder) {
	  height: auto;
	}
		
	ul, #myUL {
		list-style-type: none;
	}
	
	#myUL {
		margin: 0;
		padding: 0;
	}

	
	.caret {
		cursor: pointer;		 
	}
	
	.caret::before {
		content: "\25B6";
		color: black;
		display: inline-block;
		margin-right: 6px;
	}
	
	.caret-down::before {
		transform: rotate(90deg);
	}
	
	.nested {
		display: none;
	}
	
	.active {
		display: flex;
	}
  
`;
const App = () => {
  return (
    <>
		<Global {...styles} />
		<DropZone/>		  
    </>	
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
