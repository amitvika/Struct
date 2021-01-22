import React from 'react';
import {
    Paper,
    Box,
    Grid,
    makeStyles
} from "@material-ui/core";
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';

import {
    Headding,
    Space
} from '../../../../../components'

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        marginTop: 10,
        marginBottom: 10
    },
}));
export default function ProcessStatistics() {
    const classes = useStyles();

    const [state, setState] = React.useState({
        majorMoldDirection: false,
        partingline: false,
        pusherLocations: false,
    });

    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.checked });
    };

    return (
        <div>
            <Paper elevation={3} className={classes.paper}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Headding fontSize={20} title={'Process + Item Specific Statistics'}></Headding>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid item xs={6}>
                            <FormControl component="fieldset">
                                <Headding title={`Least Number of Overhangs`}></Headding>
                                <FormGroup>
                                    <FormControlLabel
                                        control={<Switch checked={state.majorMoldDirection} onChange={handleChange} name="majorMoldDirection" />}
                                        label="Show Major Mold Directions"
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={state.partingline} onChange={handleChange} name="partingline" />}
                                        label="Show Parting Line(s)"
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={state.pusherLocations} onChange={handleChange} name="pusherLocations" />}
                                        label="Show Pusher Locations"
                                    />
                                </FormGroup>
                                <FormHelperText>Be careful</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>

                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            <Paper elevation={3} className={classes.paper}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Headding fontSize={20} title={'Mold Analysis'}></Headding>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid item xs={6}>
                           
                        </Grid>
                        <Grid item xs={6}>

                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </div >
    )
}
