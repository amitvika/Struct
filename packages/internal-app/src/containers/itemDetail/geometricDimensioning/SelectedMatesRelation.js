import React,{  useState } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CheckBox  from '@ravibasil/common/components/CheckBox';

const SelectedMatesRelation = (props) => {
    const {
      data,
      featureList,
      onSelect  = (a,b)=>{console.log(a,b);}  
    } = props 
    const myCheckBoxes=[ "coplaner", "parallel", "normal", "opposite",  
                         "concentric", "coradial", "offset","angle"];
    const [state, setstate] = useState({
        dataselect : data||data?.selectedshell||false,
    })
    const renderTable = () => {

        return myCheckBoxes.map((row,index) => (
            <React.Fragment>
            <TableRow key={index}>  
                             
                <TableCell align="right"><CheckBox         
                    checked = {data?.selectedshell} 
                    label={row}
                    onChange={ (label,e)=> {  
                        console.log(e);
                        const dataselect = e;    
                        setstate({
                            dataselect: dataselect                 
                        });
                        data.selectedshell = dataselect;
                        onSelect(label,e);
                
                } }/> </TableCell>  
                <TableCell align="right"><CheckBox         
                    checked = {data?.selectedshell} 
                    label={row}
                    disabled={index%2==0}
                    onChange={ (label,e)=> {  
                        console.log(e);
                        const dataselect = e;    
                        setstate({
                            dataselect: dataselect                 
                        });
                        data.selectedshell = dataselect;
                        onSelect(label,e);
                
                } }/> </TableCell>                
            </TableRow>
            {(index>myCheckBoxes.length-3) && (
                <TableRow key={index+5}>                    
                    <TableCell align="right">{row}{index}</TableCell>  
                    <TableCell align="right">{row}{index}</TableCell>                
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