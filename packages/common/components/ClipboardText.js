import React from 'react'
import CopyLogo from '../assets/images/copy.png';
import {
    makeStyles
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    copy_img: {
        cursor: 'pointer',
        width: '12%',
        marginLeft: '15px',
        padding: '4px',
        borderStyle: 'solid',
        borderRadius: '14px',
        color: '#371919',
        '&:active': {
            backgroundColor: '#c9c5c5'
    }
    },

}));

function ClipboardText({handleCopyId}) {
    const classes = useStyles();
    return (
        <img
            src={CopyLogo}
            className={classes.copy_img}
            onClick={handleCopyId}>
        </img>
    )
}

export default ClipboardText
