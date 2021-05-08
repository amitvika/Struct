import React from 'react';
import {

    Paper,
    Grid,

} from "@material-ui/core"
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { AppBar, Toolbar, IconButton, Typography, Button } from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import GLTFRenderer from '../../../gltf/GltfRenderer';
import { DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, SELECTSOLID, SELECTHIRERACHY } from "../../../gltf/Tree/utils";
const DEFAULTMATERIALNAME = "Basic";
const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    toolbar: {
        background: '#343a40'
    },
    title: {
        flexGrow: 1,
        display: 'none',
        color: 'white',
        [
            theme.breakpoints.up('sm')]: {
            display: 'block',
        },
        
            root: {
                flexGrow: 1,
                width: '100%',
                backgroundColor: theme.palette.background.paper,
            },
            ProcessTabs:{
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))',
                justifyItems: 'center',
                display: 'grid'
            }
      
        
    },
}));


export default function GeometricDimensioning({ gltfjson, fileId = '' }) {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	}

    return (
        <div>
            {/* <Toolbar className={classes.toolbar}>

        <Typography className={classes.title} variant="h6" noWrap>
          Part Geometry
          </Typography>

        <Typography className={classes.title} variant="h6" noWrap>
          Part Assembly
          </Typography>

        <Typography className={classes.title} variant="h6" noWrap>
          GD&T Specifications
          </Typography>
      </Toolbar> */}
            <div className={classes.root}>
                <AppBar position="static" color="default">
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="scrollable auto tabs example"
                        classes={classes.ProcessTabs}>

                    </Tabs>
                </AppBar>

              



            </div>
            {
                Object.keys(gltfjson).length > 0 &&
                <GLTFRenderer
                    gltfjson={JSON.stringify(gltfjson)}
                    gltfobj={gltfjson}
                    activefile={fileId}
                    backcolor={DEFAULTBACKCOLOR}
                    selectcolor={DEFAULTSELECTCOLOR}
                    touchcolor={DEFAULTTOUCHCOLOR}
                    selectedoption={SELECTSOLID}
                    splitmethod={SELECTHIRERACHY}
                    changedata={[]}
                    data2texture={null}
                    data3texture={null}
                    materialtype={DEFAULTMATERIALNAME}
                    whatchanged={0} dataselection={0}
                />
            }
        </div>
    )
}
