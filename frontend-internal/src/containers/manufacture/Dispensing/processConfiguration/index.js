import React, { useState, useEffect } from 'react'
import MaterialTable, { MTableToolbar } from "material-table";
import { Grid, Paper, Tab, Tabs } from "@material-ui/core";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
// import ClearIconbox from '@material-ui/icons/Clear';
import { Button } from 'reactstrap';

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
    const classes = useStyles();
    const [isSubTabVisible, setisSubTabVisible] = useState(true);
    const [selectedTab, setSelectedTab] = useState("");
    const [checked, setChecked] = React.useState(true);

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };



    const tabArray = ['Spool Based', 'Stacked', 'Grid', 'Grid-Stacked', 'Bulk Container', 'Liquid Vat',
        'Pressure Vessel']

    const handleTabChange = (tabName) => {
        setSelectedTab(tabName);
        setisSubTabVisible(false);

    }
    return (
        <Paper elevation={3} className={classes.paper}>
            <Grid container spacing={1}>
                {
                    tabArray.map(tabName =>
                    (
                        <Grid item style={{ display: "flex" }}>

                            <Paper onClick={() => handleTabChange(tabName)}
                                style={{
                                    backgroundColor: selectedTab === tabName ? "#343a40" : "",
                                    color: selectedTab === tabName ? "white" : ""
                                }}
                                className={classes.tabPaper} >
                                <Checkbox
                                    checked={checked}
                                    onChange={handleChange}
                                    inputProps={{ 'aria-label': 'primary checkbox' }}
                                /> {tabName}
                                
                                    {/* <ClearIconbox /> */}
                            
                            </Paper>

                        </Grid>
                    )
                    )
                }
            </Grid>

        </Paper>

    )
}

