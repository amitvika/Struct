import React, { useState, useEffect } from 'react'
import MaterialTable, { MTableToolbar } from "material-table";
import { Grid, Paper, Tab, Tabs } from "@material-ui/core";
import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        marginTop: '10px',
        marginBottom: '10px'
    },
    tabPaper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        cursor: 'pointer',
        transition: '0.3s',
        "&:hover, &:focus": {
            backgroundColor: '#DCDCDC'
        }
    },
}));

export default function ProcessConfiguration() {
    const [isSubTabVisible, setisSubTabVisible] = useState(true);


    const classes = useStyles();

    const [selectedTab, setSelectedTab] = useState("");
    const tabArray = ['Spool Based', 'Stacked', 'Grid', 'Grid-Stacked', 'Bulk Container', 'Liquid Vat',
        'Pressure Vessel']

    const handleTabChange = (tabName) => {
        setSelectedTab(tabName);
        setisSubTabVisible(false);

    }

    return (
        <div>
            {
                isSubTabVisible ?
                    <>
                        <Grid container spacing={1} style={{ visibility: isSubTabVisible ? "visible" : "hidden", }}>
                            {
                                tabArray.map(tabName =>
                                (
                                    <Grid item xs={2.5}>
                                        <Paper onClick={() => handleTabChange(tabName)}
                                            style={{
                                                backgroundColor: selectedTab === tabName ? "#343a40" : "",
                                                color: selectedTab === tabName ? "white" : ""
                                            }}
                                            className={classes.tabPaper}>{tabName}</Paper>

                                    </Grid>
                                )
                                )
                            }
                        </Grid>
                    </> : null
            }

        </div>

    )
}

