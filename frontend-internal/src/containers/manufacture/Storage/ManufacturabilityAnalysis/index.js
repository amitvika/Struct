import React from 'react'
import { Button, Link, Paper } from '@material-ui/core'
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import MainModal from '../../../../components/Modal';
// import MainModal from '../../../../components/Modal'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,


    }
}))

export default function ManufacturabilityAnalysis() {
    const classes = useStyles();
    const [isModalOpened, setIsModalOpened] = React.useState(false);


    const toggleModal = () => {
        setIsModalOpened(!isModalOpened)
    }

    const tabArray = ["Stackability", "Fragility", "Size Constraints", "Quantity/Time", "Physical State"]
    return (
        <div className={classes.root}>
            <Paper>
                <div style={{
                    textAlign: "center",
                    fontSize: "x-large",
                    color: "#787676",
                    fontWeight: "600"
                }} elevation={3}>
                    Key Factors
                    </div>
                <MainModal open={isModalOpened} toggleModal={toggleModal}/>
                <Grid container spacing={3} style={{ margin: "5px", }}>
                    {
                        tabArray.map((item) => (

                            <Grid style={{ maxWidth: "19%", textAlign: "center", }} item xs={3} sm={3}>

                                
                                    <Paper style={{ color: " #65696c", }} className={classes.paper} onClick={toggleModal}>
                                    <Button style={{ color: " #65696c", }}>{item}</Button> </Paper>

                            </Grid>
                        ))
                    }

                </Grid>

            </Paper>
        </div>
    )
}
