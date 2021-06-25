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
//import { motion } from 'framer-motion'
//import Icon from '../../../gltf/Tree/Icon'
//import { Grid } from "@material-ui/core"
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
//import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

//import styled from 'styled-components'
import SelectedFeatureMenu from './SelectedFeatureMenu';
import SelectedMatesRelation from './SelectedMatesRelation';
import Button from "@material-ui/core/Button";
import ApartmentOutlinedIcon from '@material-ui/icons/ApartmentOutlined';
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
//import InboxOutlinedIcon from '@material-ui/icons/InboxOutlined';
import ExtensionOutlinedIcon from '@material-ui/icons/ExtensionOutlined';
import FilterDramaOutlinedIcon from '@material-ui/icons/FilterDramaOutlined';
//import SettingsSystemDaydreamOutlinedIcon from '@material-ui/icons/SettingsSystemDaydreamOutlined';

/* import { RadioGroup, Radio } from '@material-ui/core';
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import CircleChecked from '@material-ui/icons/RadioButtonCheckedRounded'; */

/* const myTheme = {
    'my-theme': {
        text: '#48b', // the colours used for foreground
        bg: '#ffd', // the colours used for background
        highlight: '#fd0', // the colours used for selected and hover items
        decal: '#da2', // the colours used  for open folder indicators and icons
        accent: '#bcd' // the colour used for row borders and empty file indicators
    }
} */
export default function ViewerToolbar({
    splitMethod = 0,
    selectedOption,
    setSelectedOption,
    resetSelections,
    selectAllSelectedSolids,
    selectedObjects,
    parentObjects,
    mates
}) {
    //console.log("FromViewToolbar",selectedObjects,parentObjects,mates);
    return (
        <>
            {splitMethod != 0 && (
                
                <span>
                    <Button
                        value={"Assembly"}
                        //style={{ marginLeft: "1%"}}
                        variant="contained"
                        color={(selectedOption == SELECTASSEMBLY)?"primary":"default"}
                        type="button"
                        onClick={() => {
                            const previousSelectedOption = selectedOption;
                            setSelectedOption(SELECTASSEMBLY);
                            if (previousSelectedOption == SELECTMEASURE) {
                                resetSelections();
                            }
                            selectAllSelectedSolids(SELECTASSEMBLY);
                            //console.log(this.state.selectedOption);					
                        }} 
                        startIcon={<ApartmentOutlinedIcon/>}
                        /* {<Icon
                            size="small"
                            icon="assembly"
                            theme={'my-theme'} customTheme={myTheme}
                        ></Icon>}  */          
                    >
                        Select<br></br>Assemblies
                    </Button>               
					&nbsp;
                    <Button
                        value={"Solid"}
                        style={{ marginLeft: "1%" }}
                        variant="contained"
                        color={(selectedOption == SELECTSOLID)?"primary":"default"}
                        type="button"
                        onClick={() => {
                            const previousSelectedOption = selectedOption;
                            setSelectedOption(SELECTSOLID);
                            if (previousSelectedOption == SELECTMEASURE) {
                                resetSelections();
                            }
                            selectAllSelectedSolids(SELECTSOLID);
                            //console.log(this.state.selectedOption);					
                        }} 
                        startIcon= {<DashboardOutlinedIcon/>}
                       /*  {<Icon
                            size="small"
                            icon="solid"
                            theme={'my-theme'} customTheme={myTheme}
                        ></Icon>} */           
                    >
                      Select<br></br>Parts
                    </Button> 
                    &nbsp;
                    {splitMethod == SELECTDISECTPARTS && (
                        <React.Fragment>
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
                           
                            <Button
                                value={"Edge"}
                                style={{ marginLeft: "1%"}}
                                variant="contained"
                                color={(selectedOption == SELECTEDGE)?"primary":"default"}
                                type="button"
                                onClick={() => {
                                    const previousSelectedOption = selectedOption;
                                    setSelectedOption(SELECTEDGE);
                                    if (previousSelectedOption == SELECTMEASURE) {
                                        resetSelections();
                                    }                                    
                                    //console.log(this.state.selectedOption);					
                                }} 
                                startIcon={<FilterDramaOutlinedIcon/>} 
                                /* {<Icon
                                    size="small"
                                    icon="edge"
                                    theme={'my-theme'} customTheme={myTheme}
                                ></Icon>} */           
                            >
                                Select<br></br>Edges
                            </Button> 
                            &nbsp;
                            <Button
                                value={"Features"}
                                style={{ marginLeft: "1%"}}
                                variant="contained"
                                color={(selectedOption == SELECTFEATURE)?"primary":"default"}
                                type="button"
                                onClick={() => {
                                    const previousSelectedOption = selectedOption;
                                    setSelectedOption(SELECTFEATURE);
                                    if (previousSelectedOption == SELECTMEASURE) {
                                        resetSelections();
                                    }                                    
                                    //console.log(this.state.selectedOption);					
                                }} 
                                startIcon={<ExtensionOutlinedIcon/>}
                                /* {<Icon
                                    size="small"
                                    icon="face"
                                    theme={'my-theme'} customTheme={myTheme}
                                ></Icon>}   */         
                            >
                                Specify<br></br> Assembly Mates
                            </Button>                        
                                                      
                        </React.Fragment>
                    )}
                    {/* {splitMethod != SELECTSTACKABLE && splitMethod != SELECTASSEMBLY && (
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
                    )} */}
                    </span>                    
            )}
            <TableContainer>
            <Table aria-label="simple table" style={{ verticalAlign: 'top', margin:'0' }}>                
                <TableBody style={{ verticalAlign: 'top', margin:'0' }}>
                    <TableRow style={{ verticalAlign: 'top', margin:'0' }}>
                        <TableCell style={{ verticalAlign: 'top', margin:'0' }}>
                            <SelectedFeatureMenu 
                                features = {(selectedOption == SELECTFEATURE)}
                                featureList={(selectedOption == SELECTFEATURE)?selectedObjects:parentObjects} />
                        </TableCell>
                        {
                            (selectedObjects?.length >=2) && (selectedOption == SELECTFEATURE) && (
                                <TableCell align="right" style={{ verticalAlign: 'top', margin:'0' }}>
                                    <SelectedMatesRelation mates={mates} featureList={selectedObjects} />
                                </TableCell>
                            )
                        }                                                                 
                    </TableRow>
                </TableBody>
            </Table>
            </TableContainer>            
            
        </>
    )
}


/* const MotionButton = styled(motion.div)`
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
  
`; */