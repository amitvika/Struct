import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import TileData from './MyMachines/TileData';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import Logo from '../assets/images/pizza.webp';
import { Link } from '@mui/material';
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: "12px",
        marginTop: "91px",
        marginLeft: "149px",

        // overflow: 'none',
        backgroundColor: theme.palette.background.paper,


    },
    gridList: {
        width: "83%",
        height: " 100%",
        


    },
    icon: {
        color: 'rgba(255, 255, 255, 0.54)',
    },
    paper: {
        padding: theme.spacing(2),
        margin: '10px',
        maxWidth: 500,
    },
    image: {
        width: 128,
        height: 128,
    },
    img: {
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
    },
    gridListTile: {
        overflow: "none",
    }
}));


export default function GridCards({ detailLink }) {
    let history = useHistory();
    const classes = useStyles();

    function handleClick() {

        // history.push("/myMachineDetail");
        history.push(detailLink);
    }
    return (
        <div className={classes.root}>

            <ImageList cellHeight={180} className={classes.gridList} cols={4}>

                {TileData.map((tile) => (
                    <ImageListItem className={classes.gridListTile}>
                        <ButtonBase>
                            <Paper
                                className={classes.paper}
                                elevation={7}
                                onClick={() => handleClick()} >

                                <Grid container spacing={3} >

                                    <Grid item style={{ alignItems: "center" }}>
                                        <ButtonBase className={classes.image}>
                                            <img className={classes.img} alt="complex" src={Logo} />
                                        </ButtonBase>
                                    </Grid>

                                    <Grid item xs={1} sm container style={{ alignItems: "center" }}>
                                        <Grid item xs container direction="column" spacing={2} >
                                            <Grid item xs >
                                                <Typography gutterBottom variant="subtitle1">
                                                    <div>
                                                        Name: khfkjdhfjdhbkj
                                                </div>
                                                    <div>
                                                        ID
                                                </div>
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                    </Grid>
                                </Grid>
                            </Paper>
                        </ButtonBase>

                    </ImageListItem>
                ))}
            </ImageList>

        </div>
    );
}
