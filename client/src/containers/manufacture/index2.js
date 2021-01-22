import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';

import Assembly from './assembly'
import Maching from './machining';
import InjectionCasting from './injectionCasting';

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

    },
    dividerStyle: {
        marginTop: '20px',
        marginBottom: '20px'
    }
}));

export default function Index2() {

    const [selectedTab, setSelectedTab] = useState("");
    const [selectedSubTab, setselectedSubTab] = useState("");
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

    const subTabArray = ['Manufacturability Analysis', 'Process Configuration', 'Process Statistics and Analysis', 'Process Steps']

    const handleTabChange = (tabName) => {
        setSelectedTab(tabName);
        setselectedSubTab(subTabArray[1]);
        setisSubTabVisible(true);
    }

    const handleTabChange2 = (tabName2) => {
        setselectedSubTab(tabName2);
    }

    const renderDetailPanel = () => {

        if (selectedTab === 'Machining') {
            return <Maching
                selectedSubTab={selectedSubTab} />
        }
        else if (selectedTab === 'Injection Casting') {
            return <InjectionCasting
                selectedSubTab={selectedSubTab} />
        }
        else if (selectedTab === 'Assembly') {
            return <Assembly
                selectedSubTab={selectedSubTab} />
        }
        else {

            return null

        }

    }


    return (
        <>
            <Paper elevation={3} className={classes.paper}>
                <Grid container spacing={1}>
                    {
                        tabArray.map(tabName =>
                        (
                            <Grid item xs={2.5}>
                                <Paper onClick={() => handleTabChange(tabName)}
                                    style={{
                                        backgroundColor: selectedTab === tabName ? "#343a40" : "",
                                        color: selectedTab === tabName ? "white" : ""
                                    }}
                                    className={classes.paper}>{tabName}</Paper>

                            </Grid>
                        )

                        )
                    }
                </Grid>
            </Paper>

            {
                isSubTabVisible ?
                    <>
                        <Divider className={classes.dividerStyle} />
                        <Paper elevation={3} style={{
                            visibility: isSubTabVisible ? "visible" : "hidden"
                        }} className={classes.paper}>
                            <Grid container spacing={1}>
                                {
                                    subTabArray.map(tabName2 => (
                                        <Grid item xs={3}>

                                            <Paper onClick={() => handleTabChange2(tabName2)} style={{
                                                backgroundColor: selectedSubTab === tabName2 ? "#3369FF" : "",
                                                color: selectedSubTab === tabName2 ? "white" : ""
                                            }}
                                                className={classes.paper}>{tabName2}</Paper>

                                        </Grid>
                                    )
                                    )
                                }
                            </Grid>
                        </Paper>
                        <Divider className={classes.dividerStyle} />

                        {renderDetailPanel()}

                    </> : null
            }


        </>)

}
