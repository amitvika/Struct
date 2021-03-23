import React from 'react'
import { Button, Link, Paper } from '@material-ui/core'
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import MainModal from '../../../../components/Modal';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    text: {
        textAlign: "center",
        fontSize: "x-large",
        color: "#787676",
        fontWeight: "600"
    },
    gridContainer: {
        margin: "5px",
    },
    innerGrid: {
        maxWidth: "19%",
        textAlign: "center",
    },
    paper: {
        color: " #65696c",
    },
    button: {
        color: " #65696c",
    },

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
                <div className={classes.text} elevation={3}>Key Factors</div>
                <MainModal open={isModalOpened} toggleModal={toggleModal} />
                <Grid className={classes.gridContainer} container spacing={3} >
                    {
                        tabArray.map((item) => (

                            <Grid className={classes.innerGrid} item xs={3} sm={3}>


                                <Paper className={classes.paper} className={classes.paper} onClick={toggleModal}>
                                    <Button className={classes.button} >{item}</Button>
                                </Paper>

                            </Grid>
                        ))
                    }

                </Grid>

            </Paper>
        </div>
    )
}
