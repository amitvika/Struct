import React from 'react'
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    modal: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        overflow: 'scroll',
        height: '100%',
        display: 'block'
    },
    paper: {
        display: "block",
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        marginLeft: '20%',
        marginRight: '20%',

    },
}));

export default function MainModal({ title, open, toggleModal, children }) {
    const classes = useStyles();


    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={toggleModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open} >
                    <Paper className={classes.paper} >

                        <h2 id="simple-modal-title">{title}</h2>
                        <p id="simple-modal-description">

                        </p>
                        {children}
                    </Paper>

                </Fade>
            </Modal>
        </div>
    )
}
