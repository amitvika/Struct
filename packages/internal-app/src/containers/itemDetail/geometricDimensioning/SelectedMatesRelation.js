import React,{  useState, useEffect } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import LabelledCheckBox  from '@ravibasil/common/components/LabelledCheckBox';
import Checkbox from '@material-ui/core/Checkbox';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import CircleChecked from '@material-ui/icons/CheckCircleOutline';

const SelectedMatesRelation = (props) => {
    const {
      mates,
      featureList,
      onSelect  = (a,b)=>{console.log(a,b);}  
    } = props 
    const myCheckBoxes=[ "coplaner", "parallel", "normal", "opposite",  
                         "concentric", "coradial", "angle", "offset"];
    
    const fillCheckboxValues = () => {
        var isSelected = [];        
        for (let index = 0; index < myCheckBoxes.length-2; index++) {
            isSelected.push(false);
            var valuefound=true;
            for (let mateindex = 1; mateindex < props.mates.length; mateindex++) {
                const element = props.mates[mateindex];
                if(element) {
                    for (let relation = 0; relation < mateindex; relation++) {
                        if(element[relation]) {
                            if(element[relation][index+2]!==true) {
                                valuefound=false;
                                break;
                            }
                        }                       
                    }
                }
                
            }
            isSelected.push(valuefound);            
        };
        return isSelected;
    }
    
    const [_isSelected, _setIsSelected] = useState( () => {      
             return fillCheckboxValues();
        } ) ;

    useEffect(() => {         
            _setIsSelected(fillCheckboxValues());
          }, [props.mates]);

    const renderTable = () => {
        const myStyle = { width:"10px" }
        var coplaner = true;
        var concentric = true;
        var coradial = true;
        var angle = 0;
        //var offset = 0;
        var anglefound = true;
        const AngleIndex=8;
        const mateAngle=myCheckBoxes.length-2;
        for (let index = 0; index < featureList.length; index++) {
            const element = featureList[index];
            if( (element['kind']=="Plane") || (element['kind']=="Line") ) {
                concentric=false;
                coradial = false;
                break;
            }
            
        }
        for (let index = 0; index < featureList.length; index++) {
            const element = featureList[index];
            if( (element['kind']=="Circle") || (element['kind']=="Cylinder") ||
                (element['kind']=="Sphere") || (element['kind']=="Cone")) {
                    coplaner=false;
                    break;
            }
            
        }
        if(mates.length>1) {
            if(mates[1].length>=1) {
                if(mates[1][0].length>8) {
                    angle =  mates[1][0][AngleIndex];        
                    for (let mateindex = 1; mateindex < mates.length; mateindex++) {
                        const element = mates[mateindex];           
                        if (anglefound) {
                            if(element) {
                                for (let relation = 0; relation < mateindex; relation++) {
                                    if(element[relation]) {
                                        if(element[relation][AngleIndex]!==angle) {
                                            anglefound=false;
                                            break;
                                        }
                                    }                            
                                }
                            }                            
                        } else {
                            break;
                        }           
                    }
                }                
            }            
        } else {
            anglefound = false;
        }
        return myCheckBoxes.map((row,index) => (
            <React.Fragment>
            <TableRow key={index*3}>                               
                <TableCell key={3*index+1} align="right" style={myStyle} ><LabelledCheckBox         
                    checked = {_isSelected[2*index]} 
                    disabled= {myCheckBoxes[index]=="coplaner"?!coplaner:
                               myCheckBoxes[index]=="concentric"?!concentric:
                               myCheckBoxes[index]=="coradial"?!coradial:false
                            }
                    label={row}
                    onChange={ (label,e)=> {  
                        console.log(e);                           
                        _setIsSelected(o => {
                            const _o = o.slice()
                            _o[2*index] = !_o[2*index]
                            return _o
                          })                     
                        
                        onSelect(label,e);
                
                } }/> </TableCell>  
                <TableCell key={3*index+2} align="left" ><Checkbox         
                    checked =  {_isSelected[2*index+1]}  
                    checkedIcon = {<CircleChecked/>}
                    icon = {<CancelOutlinedIcon/>}
                    label={row}                    
                    onChange={ (label,e)=> {  
                        console.log(e);
                        const dataselect = e;    
                        _setIsSelected(o => {
                            const _o = o.slice()
                            _o[2*index+1] = !_o[2*index+1]
                            return _o
                          })   
                        
                        onSelect(label,e);
                
                } }/> </TableCell>                
            </TableRow>
            {(index>=mateAngle) && (
                <TableRow key={3*index+9} style={myStyle}>                    
                    <TableCell key={3*index+10} align="right" size="small" style={myStyle}>
                        <input type="number" aria-invalid="false" id={"Numb"+3*index+10} value={(anglefound&&index==mateAngle)?angle:""} onChange={(e)=>{console.log(e);}} />                            
                     </TableCell>  
                    {/*  <TableCell key={3*index+11} align="right">
                        <input type="number" aria-invalid="false" id={"Numb"+3*index+11}/>                        
                     </TableCell> */}                                     
                </TableRow>
            )}
            </React.Fragment>

            
        ))
    }

    return (
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>                       
                        <TableCell align="right">Mate</TableCell>
                        <TableCell align="right">Estimated Mate</TableCell>                        
                    </TableRow>
                </TableHead>
                <TableBody>
                    {renderTable()}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
export default SelectedMatesRelation