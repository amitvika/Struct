import React from 'react';
import {
    Paper,
    Grid,
    makeStyles,
    Divider
} from "@material-ui/core";

import {
    Headding,

    Input
} from '../../../../components'

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        marginTop: 10,
        marginBottom: 10
    },
    dividerStyle: {
        marginTop: '20px',
        marginBottom: '20px'
    }
}));

export default function ProcessStaticsAndAnalysis() {
    const classes = useStyles();

    const handleOnChange = () => {

    }
    return (
        <Paper elevation={3} className={classes.paper}>

            <Headding fontSize={20} title={'Starting Workpiece/Item'}></Headding>

            <Paper elevation={3} className={classes.paper}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Headding fontSize={18} title={'Machining Analysis'}></Headding>
                    </Grid>


                    <Grid item xs={12}>
                        <Grid item xs={12} style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}>
                            <Grid item xs={6}>
                                <Headding as={'span'} fontSize={'16px'} title={'Number of Part Flips'} />
                            </Grid>
                            <Grid item xs={6}>
                                <Input
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('mass', event.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <Grid item xs={12} style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}>
                            <Grid item xs={6}>
                                <Headding as={'span'} fontSize={'16px'} title={'Number of Tool Paths'} />
                            </Grid>
                            <Grid item xs={6}>
                                <Input
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('mass', event.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <Grid item xs={12} style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}>
                            <Grid item xs={6}>
                                <Headding as={'span'} fontSize={'16px'} title={'Number of Tools Utilized'} />
                            </Grid>
                            <Grid item xs={6}>
                                <Input
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('mass', event.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <Grid item xs={12} style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}>
                            <Grid item xs={6}>
                                <Headding as={'span'} fontSize={'16px'} title={'Total Tool Utilization Cost'} />
                            </Grid>
                            <Grid item xs={6}>
                                <Input
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('mass', event.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <Grid item xs={12} style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}>
                            <Grid item xs={6}>
                                <Headding as={'span'} fontSize={'16px'} title={'Issues'} />
                            </Grid>
                            <Grid item xs={6}>
                                <Input
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('mass', event.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider className={classes.dividerStyle} />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Grid item xs={12} style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}>
                            <Grid item xs={6}>
                                <Headding as={'span'} fontSize={'16px'} title={'GD&T Not Setup'} />
                            </Grid>
                            <Grid item xs={6}>
                                <Input
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('mass', event.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={12} style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}>
                            <Grid item xs={6}>
                                <Headding as={'span'} fontSize={'16px'} title={'Required Tools Not Available'} />
                            </Grid>
                            <Grid item xs={6}>
                                <Input
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('mass', event.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={12} style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}>
                            <Grid item xs={6}>
                                <Headding as={'span'} fontSize={'16px'} title={'Required Tool Cost Not Configured'} />
                            </Grid>
                            <Grid item xs={6}>
                                <Input
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('mass', event.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <Grid item xs={12} style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}>
                            <Grid item xs={6}>
                                <Headding as={'span'} fontSize={'16px'} title={'Non-Machinable Feature'} />
                            </Grid>
                            <Grid item xs={6}>
                                <Input
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('mass', event.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                </Grid>

            </Paper>
        </Paper>
    )
}
