import React, { useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {
    Paper,
    IconButton,
} from '@mui/material';
import SuppliedItems from '.';


function TabPanel(props) {

    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
}));



export default function ProductOptions({clientData}) {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    const [selectedProduct, setSelectedProduct] = useState({});


    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    // const handleProductBreadcrumbSelect = () => {
    //     setSelectedProduct(selectedProduct);
    // }

    return (
        <div className={classes.root}>
                <>
                    <AppBar position="static" color="default">
                        <Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px', display: 'flex' }} >

                            <IconButton color="primary" component="span" size="large">
                                <ArrowBackIcon />
                            </IconButton>
                            <Tabs
                                value={value}
                                onChange={handleChange}
                                indicatorColor="primary"
                                textColor="primary"
                                variant="scrollable"
                                scrollButtons="auto"
                                aria-label="scrollable auto tabs example"
                            >
                                <Tab label="Orders" {...a11yProps(0)} />
                                <Tab label="Identification" {...a11yProps(1)} />
                                <Tab label="Delivery" {...a11yProps(2)} />
                                <Tab label="Packaging" {...a11yProps(3)} />
                            </Tabs>
                        </Paper>
                    </AppBar>
                
                
                    <TabPanel value={value} index={0}>
                        Orders
            </TabPanel>
                    <TabPanel value={value} index={1}>
                        Identification
            </TabPanel>
                    <TabPanel value={value} index={2}>
                        Delivery
            </TabPanel>
                    <TabPanel value={value} index={3}>
                        Packaging
            </TabPanel>
                </> 
               
        </div>
    );
}
