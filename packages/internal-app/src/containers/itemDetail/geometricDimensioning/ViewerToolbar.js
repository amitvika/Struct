import React, { useState, useEffect } from 'react'
import {
    SELECTBACKCOLOR, SELECTSELECTCOLOR, SELECTTOUCHCOLOR,
    DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR,
    getTexture, SELECT2DTEXTURE, SELECT3DTEXTURE,
    SELECTMATERIRAL, SELECTDISTANCE, SELECTSHOWINFO,
    SELECTSOLID, SELECTFACE, SELECTEDGE, SELECTCORNER, SELECTMEASURE,
    SELECTCONTINOUS, SELECTHIRERACHY, SELECTDISECTPARTS, SELECTSTACKABLE, 
    SELECTORDER, SELECTASSEMBLY, SELECTFEATURE, prettyPrintArray
} from "../../../gltf/Tree/utils";
import { motion } from 'framer-motion'
import Icon from '../../../gltf/Tree/Icon'
import {
    Grid
} from "@material-ui/core"

import styled from 'styled-components'
import SelectedFeatureMenu from './SelectedFeatureMenu';

const myTheme = {
    'my-theme': {
        text: '#48b', // the colours used for foreground
        bg: '#ffd', // the colours used for background
        highlight: '#fd0', // the colours used for selected and hover items
        decal: '#da2', // the colours used  for open folder indicators and icons
        accent: '#bcd' // the colour used for row borders and empty file indicators
    }
}
export default function ViewerToolbar({
    splitMethod = 0,
    selectedOption,
    setSelectedOption,
    resetSelections,
    selectAllSelectedSolids,
    selectedObjects,
    parentObjects
}) {
    console.log("FromViewToolbar",selectedObjects,parentObjects);
    return (
        <>
            {splitMethod != 0 && (
                <MotionButton>
                    <button value={"Assembly"}
                        className={(selectedOption == SELECTASSEMBLY) ? "buttonTrue" : "buttonFalse"}
                        onClick={() => {
                            const previousSelectedOption = selectedOption;
                            setSelectedOption(SELECTASSEMBLY);
                            if (previousSelectedOption == SELECTMEASURE) {
                                resetSelections();
                            }
                            selectAllSelectedSolids(SELECTASSEMBLY);
                            //console.log(this.state.selectedOption);					
                        }} type='button'>
                        <Icon
                            size="large"
                            icon="assembly"
                            theme={'my-theme'} customTheme={myTheme}
                        ></Icon>
                            Select Assemblies
					</button>
					&nbsp;
                    <button value={"Solid"}
                        className={(selectedOption == SELECTSOLID) ? "buttonTrue" : "buttonFalse"}
                        onClick={() => {

                            const previousSelectedOption = selectedOption;
                            setSelectedOption(SELECTSOLID);
                            if (previousSelectedOption == SELECTMEASURE) {
                                resetSelections();
                            }
                            selectAllSelectedSolids(SELECTSOLID);
                        }} type='button'>
                        <Icon
                            size="large"
                            icon="solid"
                            theme={'my-theme'} customTheme={myTheme}
                        ></Icon>
								Select Parts
							</button>
							&nbsp;
                    {splitMethod == SELECTDISECTPARTS && (
                        <span>
                            {/* <button value={"Face"}
                                className={(selectedOption == SELECTFACE) ? "buttonTrue" : "buttonFalse"}
                                onClick={() => {
                                    const previousSelectedOption = selectedOption;
                                    setSelectedOption(SELECTFACE);
                                    if (previousSelectedOption == SELECTMEASURE) {
                                        resetSelections();
                                    }
                                    //console.log(this.state.selectedOption);					
                                }} type='button'>
                                <Icon
                                    size="large"
                                    icon="face"
                                    theme={'my-theme'} customTheme={myTheme}
                                ></Icon>
									Select Faces
								</button>
								&nbsp; */}
                            <button value={"Features"}
                                className={(selectedOption == SELECTFEATURE) ? "buttonTrue" : "buttonFalse"}
                                onClick={() => {
                                    const previousSelectedOption = selectedOption;
                                    setSelectedOption(SELECTFEATURE);
                                    if (previousSelectedOption == SELECTMEASURE) {
                                        resetSelections();
                                    }                                  
                                    //console.log(this.state.selectedOption);					
                                }} type='button'>
                                <Icon
                                    size="large"
                                    icon="face"
                                    theme={'my-theme'} customTheme={myTheme}
                                ></Icon>
									Select Features
							</button>
							&nbsp;
                            <button value={"Edge"}
                                className={(selectedOption == SELECTEDGE) ? "buttonTrue" : "buttonFalse"}
                                onClick={() => {
                                    const previousSelectedOption = selectedOption;
                                    setSelectedOption(SELECTEDGE);
                                    if (previousSelectedOption == SELECTMEASURE) {
                                        resetSelections();
                                    }
                                    //console.log(this.state.selectedOption);					
                                }} type='button'>
                                <Icon
                                    size="large"
                                    icon="edge"
                                    theme={'my-theme'} customTheme={myTheme}
                                ></Icon>
									Select Edges
							</button>
							&nbsp;
                            {/* <button value={"Corner"}
                                className={(selectedOption == SELECTCORNER) ? "buttonTrue" : "buttonFalse"}
                                onClick={() => {
                                    const previousSelectedOption = selectedOption;
                                    setSelectedOption(SELECTCORNER);
                                    if (previousSelectedOption == SELECTMEASURE) {
                                        resetSelections();
                                    }
                                    //console.log(this.state.selectedOption);					
                                }} type='button'>
                                <Icon
                                    size="large"
                                    icon="corner"
                                    theme={'my-theme'} customTheme={myTheme}
                                ></Icon>
									Select Corners
								</button>
								&nbsp; */}
                            
                        </span>
                    )}
                    {splitMethod != SELECTSTACKABLE && splitMethod != SELECTASSEMBLY && (
                        <span>
                            <button value={"measure"}
                                className={(selectedOption == SELECTMEASURE) ? "buttonTrue" : "buttonFalse"}
                                onClick={() => {
                                    const previousSelectedOption = selectedOption;
                                    setSelectedOption(SELECTMEASURE);
                                    if (previousSelectedOption != SELECTMEASURE) {
                                        resetSelections();
                                    }
                                    //console.log(this.state.selectedOption);						
                                }} type='button'>
                                <Icon
                                    size="large"
                                    icon="measure"
                                    theme={'my-theme'} customTheme={myTheme}
                                ></Icon>
								Find Relation
							</button>
                        </span>
                    )}
                </MotionButton>
            )}

            <SelectedFeatureMenu
                featureList={selectedObjects} />
        </>
    )
}


const MotionButton = styled(motion.div)`
.buttonTrue {
    display: inline-block;
    padding: 5px 12px;
    font-size: 13px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    outline: none;
    color: #E866E8;
    background-color: #179917;
    border: none;
    border-radius: 5px;
    box-shadow: 0 2px #999;
  }
  
  .buttonFalse {
    display: inline-block;
    padding: 5px 12px;
    font-size: 13px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    outline: none;
    color: #E800E8;
    background-color: #17FF17;
    border: none;
    border-radius: 5px;
    box-shadow: 0 2px #999;
  }
  
`;