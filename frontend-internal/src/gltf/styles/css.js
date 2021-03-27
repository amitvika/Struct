// import { Global, css } from "@emotion/core";
export const styles = css`
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
	a {
		color: #FF0;
	}
	a:hover {
		 color: #00F
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
		content: '\25B6';
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
  .split-pane {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: row;
  }
  
  .split-pane-left,
  .split-pane-right {
    flex: 1;
    overflow: hidden;
  }
  .split-pane-left {
    background: linear-gradient(#ffffff 50%, rgba(255, 255, 255, 0) 0) 0 0,
      radial-gradient(circle closest-side, #ffffff 53%, rgba(255, 255, 255, 0) 0)
        0 0,
      radial-gradient(circle closest-side, #ffffff 50%, rgba(255, 255, 255, 0) 0)
        55px 0 #48b;
    background-size: 110px 200px;
    background-repeat: repeat-x;
  }
  .split-pane-right {
    background: radial-gradient(
          circle at 0% 50%,
          rgba(96, 16, 48, 0) 9px,
          #613 10px,
          rgba(96, 16, 48, 0) 11px
        )
        0px 10px,
      radial-gradient(
        at 100% 100%,
        rgba(96, 16, 48, 0) 9px,
        #613 10px,
        rgba(96, 16, 48, 0) 11px
      ),
      #8a3;
    background-size: 20px 20px;
  }
  
  .separator {
    border: 50px solid black;
    cursor: col-resize;
    width: 100px;
    height: 100px;
  }
  
	.horizontal-slider {
        width: 100%;
        max-width: 500px;
        height: 50px;
        border: 1px solid grey;
    }
    .vertical-slider {
        height: 380px;
        width: 50px;
        border: 1px solid grey;
    }
    .example-thumb {
        font-size: 0.9em;
        text-align: center;
        background-color: black;
        color: white;
        cursor: pointer;
        border: 5px solid gray;
        box-sizing: border-box;
    }
    .example-thumb.active {
        background-color: grey;
    }
    .example-track {
        position: relative;
        background: #ddd;
    }
    .example-track.example-track-1 {
        background: #f00;
    }
    .example-track.example-track-2 {
        background: #0f0;
    }
    .example-mark {
        width: 8px;
        height: 8px;
        border: 2px solid #000;
        background-color: #fff;
        cursor: pointer;
        border-radius: 50%;
        vertical-align: middle;
    }
    .horizontal-slider .example-track {
        top: 20px;
        height: 10px;
    }
    .horizontal-slider .example-thumb {
        top: 1px;
        width: 50px;
        height: 48px;
        line-height: 38px;
    }
    .horizontal-slider .example-mark {
        margin: 0 calc(25px - 6px);
        bottom: calc(50% - 6px);
    }
    .vertical-slider .example-thumb {
        left: 1px;
        width: 48px;
        line-height: 40px;
        height: 50px;
    }
    .vertical-slider .example-track {
        left: 20px;
        width: 10px;
    }
    .vertical-slider .example-mark {
        margin: calc(25px - 6px) 0;
        left: calc(50% - 6px);
    }
	/**
* Rangeslider
*/
.rangeslider {
  margin: 20px 0;
  position: relative;
  background: #e6e6e6;
  -ms-touch-action: none;
  touch-action: none;
}
.rangeslider,
.rangeslider .rangeslider__fill {
  display: flex;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
}
.rangeslider .rangeslider__handle {
  background: #fff;
  border: 1px solid #ccc;
  cursor: pointer;
  display: inline-block;
  position: absolute;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4), 0 -1px 3px rgba(0, 0, 0, 0.4);
}
.rangeslider .rangeslider__handle .rangeslider__active {
  opacity: 1;
}
.rangeslider .rangeslider__handle-tooltip {
  width: 40px;
  height: 40px;
  text-align: center;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  font-weight: normal;
  font-size: 14px;
  transition: all 100ms ease-in;
  border-radius: 4px;
  display: inline-block;
  color: white;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
}
.rangeslider .rangeslider__handle-tooltip span {
  margin-top: 12px;
  display: inline-block;
  line-height: 100%;
}
.rangeslider .rangeslider__handle-tooltip:after {
  content: ' ';
  position: absolute;
  width: 0;
  height: 0;
}
/**
* Rangeslider - Horizontal slider
*/
.rangeslider-horizontal {
  height: 12px;
  border-radius: 10px;
}
.rangeslider-horizontal .rangeslider__fill {
  height: 100%;
  background-color: #7cb342;
  border-radius: 10px;
  top: 0;
}
.rangeslider-horizontal .rangeslider__handle {
  width: 30px;
  height: 30px;
  border-radius: 30px;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
}
.rangeslider-horizontal .rangeslider__handle:after {
  content: ' ';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 6px;
  left: 6px;
  border-radius: 50%;
  background-color: #dadada;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4) inset, 0 -1px 3px rgba(0, 0, 0, 0.4) inset;
}
.rangeslider-horizontal .rangeslider__handle-tooltip {
  top: -55px;
}
.rangeslider-horizontal .rangeslider__handle-tooltip:after {
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(0, 0, 0, 0.8);
  left: 50%;
  bottom: -8px;
  transform: translate3d(-50%, 0, 0);
}
/**
* Rangeslider - Vertical slider
*/
.rangeslider-vertical {
  margin: 20px auto;
  height: 150px;
  max-width: 10px;
  background-color: transparent;
}
.rangeslider-vertical .rangeslider__fill,
.rangeslider-vertical .rangeslider__handle {
  position: absolute;
}
.rangeslider-vertical .rangeslider__fill {
  width: 100%;
  background-color: #7cb342;
  box-shadow: none;
  bottom: 0;
}
.rangeslider-vertical .rangeslider__handle {
  width: 30px;
  height: 10px;
  left: -10px;
  box-shadow: none;
}
.rangeslider-vertical .rangeslider__handle-tooltip {
  left: -100%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
}
.rangeslider-vertical .rangeslider__handle-tooltip:after {
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid rgba(0, 0, 0, 0.8);
  left: 100%;
  top: 12px;
}
/**
* Rangeslider - Reverse
*/
.rangeslider-reverse.rangeslider-horizontal .rangeslider__fill {
  right: 0;
}
.rangeslider-reverse.rangeslider-vertical .rangeslider__fill {
  top: 0;
  bottom: inherit;
}
/**
* Rangeslider - Labels
*/
.rangeslider__labels {
  position: relative;
}
.rangeslider-vertical .rangeslider__labels {
  position: relative;
  list-style-type: none;
  margin: 0 0 0 24px;
  padding: 0;
  text-align: left;
  width: 250px;
  height: 100%;
  left: 10px;
}
.rangeslider-vertical .rangeslider__labels .rangeslider__label-item {
  position: absolute;
  transform: translate3d(0, -50%, 0);
}
.rangeslider-vertical .rangeslider__labels .rangeslider__label-item::before {
  content: '';
  width: 10px;
  height: 2px;
  background: black;
  position: absolute;
  left: -14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: -1;
}
.rangeslider__labels .rangeslider__label-item {
  position: absolute;
  font-size: 14px;
  cursor: pointer;
  display: inline-block;
  top: 10px;
  transform: translate3d(-50%, 0, 0);
}


`;