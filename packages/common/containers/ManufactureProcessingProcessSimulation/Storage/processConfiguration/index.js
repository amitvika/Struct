import React, { useState, useEffect } from 'react'
import MaterialTable, { MTableToolbar } from "material-table";
import { Grid, Paper, Tab, Tabs } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import CollapseTab from './CollapseTab';


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

export default function ProcessConfiguration(props) {
    const classes = useStyles();
    //const {itemProperties, setStack}=props;
    const [selectedTab, setSelectedTab] = useState("");
    const tabArray = ['Spool Based', 'Stacked', 'Grid', 'Grid-Stacked', 'Bulk Container', 'Liquid Vat',
        'Pressure Vessel']

    const handleTabChange = (tabName) => {
        setSelectedTab(tabName);
    }
    return (
        <div>
        <CollapseTab {...props}/>
    </div>
    )
}
