import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    selectedTab: {
        backgroundColor: "blue",

    }
}));

export default function Index2() {

    const [selectedTab, setSelectedTab] = useState("");
    const [selectedTab2, setSelectedTab2] = useState("");
    const [isSubTabVisible, setisSubTabVisible] = useState(false);


    const classes = useStyles();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    const tabArray = ['Process', 'Machining', 'Injection Casting', 'Assembly', 'Photolithography', 'Unpacking',
        'PCB Assembly', 'Extrusion', '3D Printing', 'Forming',
        ' Textile Assembly', 'Powder Stamping and Sintering', ' Coatings', ' Temperature and Gas Treatments',
        ' Photochemical Machining']

    const tabArray2 = ['Manufacturability Analysis', 'Process Configuration', 'Process Statistics and Analysis', 'Process Steps']

    const handleTabChange = (tabName) => {
        setSelectedTab(tabName);
        setSelectedTab2(tabArray2[1]);
        setisSubTabVisible(true);
    }

    const handleTabChange2 = (tabName2) => {
        setSelectedTab2(tabName2);
    }


    return (
        <>
            <Paper className={classes.paper} style={{ marginTop: "50px" }}>
                <Grid container spacing={1}>
                    {
                        tabArray.map(tabName =>
                        (
                            <Grid item xs={2.5}>
                                <Paper onClick={() => "handleTabChange(tabName); handleTabChange2(tabName2);"}


                                    style={{
                                        backgroundColor: selectedTab === tabName ? "#343a40" : "",
                                        color: selectedTab === tabName ? "white" : "",


                                    }}
                                    className={classes.paper}>{tabName}</Paper>

                            </Grid>
                        )

                        )
                    }
                </Grid>
            </Paper>


            <Paper style={{
                visibility: isSubTabVisible ? "visible" : "hidden"
            }} className={classes.paper}>
                <Grid container spacing={1}>
                    {
                        tabArray2.map(tabName2 => (
                            <Grid item xs={3}>

                                <Paper onClick={() => handleTabChange2(tabName2)} style={{
                                    backgroundColor: selectedTab2 === tabName2 ? "#3369FF" : "",
                                    color: selectedTab2 === tabName2 ? "white" : ""
                                }}
                                    className={classes.paper}>{tabName2}</Paper>

                            </Grid>
                        )
                        )
                    }
                </Grid>
            </Paper>




        </>)

}
