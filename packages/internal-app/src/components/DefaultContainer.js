import React from 'react'

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from '@mui/material/Alert';
import HistoryModal from "./HistoryModal";

export default function DefaultContainer(props) {
    return (
        <>
            <HistoryModal
                isVisible={props.isHistoryModalOpened}
                pageName={props.title}
                selectedItemId={props.selectedId}
                handleHistoryToggle={props.handleHistoryToggle}
            />
            <Snackbar
                open={props.snackBar}
                autoHideDuration={10000}
                onClose={props.handleAlertClose}>
                <MuiAlert
                    severity={props.snackBarAlertType}
                    onClose={props.handleAlertClose}>
                    {props.message}
                </MuiAlert>
            </Snackbar>
            {props.children}
        </>
    )
}
