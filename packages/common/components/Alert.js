import React from 'react';
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from '@material-ui/lab/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { hideAlert } from '../actions/alert.action';

export default function Alert() {
    const dispatch = useDispatch();

    const message = useSelector(state => state.alert.message);
    const isVisible = useSelector(state => state.alert.isVisible);
    const success = useSelector(state => state.alert.success)

    const handleSnackbarClose = () => {
        dispatch(hideAlert());
    }


    return (
        <Snackbar open={isVisible} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <MuiAlert elevation={6} variant="filled" onClose={handleSnackbarClose} severity={success ? "success" : "error"}>
                {message}
            </MuiAlert>
        </Snackbar>
    )
}
