import React from 'react'
import CopyLogo from '../assets/images/copy.png';
import {
    makeStyles
} from '@material-ui/core';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';

const useStyles = makeStyles((theme) => ({
    copy_img: {
        cursor: 'pointer',
        width: '18%',
        marginLeft: '15px',
        padding: '2px',
        opacity: '0.6',
        color: '#371919',
        '&:active': {
            backgroundColor: '#c9c5c5'
    }
    },

}));

function ClipboardText({handleCopyId}) {
    const classes = useStyles();
    return (
        <FileCopyOutlinedIcon  onClick={handleCopyId} className={classes.copy_img}></FileCopyOutlinedIcon>
    )
}

export default ClipboardText
