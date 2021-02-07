/* 
 `npm start`
   Now open your browser and join localhost:8080
*/

import React from "react";
import { render } from "react-dom";
import DropZone from "./DropZone";
import { Global, css } from "@emotion/core";
const styles = css`
	html,
	body,
	#root {
		margin: 0;
		padding: 0;
		height: 100%;
		width: 100%;
		overflow: hidden;
	  }
  
	#box {
		margin: 0;
		padding: 0;
		height: 100%;
		width: 100%;
	}

	#rowheader {
		width: 100%;
		height: 150px;
		background-color:red;
	}

	#rowcontent {
		width: 100%;
		position: absolute;
		top: 150px;
		bottom: 0;
		background-color:blue;
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

render(<App />, document.getElementById("root"));
