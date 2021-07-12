import React, { useState, useEffect } from 'react';
import Input from '../../components/atoms/Input'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Headding from '@ravibasil/common/components/atoms/Headding';

export default function Product({ handleSave, name }) {
    const [value, setValue] = useState('')

    const onChange = (e) => {
        setValue(e.target.value)
    }

    useEffect(() => {
        if (name) {
            setValue(name);
        }
    }, [name])

    return (
        <Paper>
            <Grid container >
                <Grid item xs={6} >
                </Grid>
                <Grid item xs={6} style={{ display: 'flex', justifyContent: 'space-evenly', padding: '10px', alignItems: 'center', }}>
                    <Headding fontSize={30} title="Design Name" />
                    <Input
                        placeholder="Enter"
                        type="text"
                        onChange={onChange}
                        value={value}
                    />
                    <Button variant="contained" color="primary" size="large" onClick={() => handleSave(value)}>
                        Save
                    </Button>
                </Grid>
            </Grid>
        </Paper >
    );
}