import React,{useState} from 'react'
import Input from '../components/atoms/Input'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Headding from '@ravibasil/common/components/atoms/Headding';


export default function AddNewDesign() {
    const [value, setValue] = useState('')
    const onChange =(e) => {
        setValue(e.target.value)
    }
    return (
        <Grid container xs={4} style={{display: 'flex', justifyContent: 'flex-end',padding: '10px',alignItems: 'center',}}>
            <Grid item xs={3} ><Headding title="Name Search" /></Grid>
            <Grid item xs={3} >
                <Input
                style={{padding: '15px'}}
                    placeholder="Enter"
                    type="text"
                // value={searchText}
                onChange={onChange}
                />
            </Grid>
                    <Button variant="contained" color="primary">
                      Save
                    </Button>

        </Grid>
    )
}
