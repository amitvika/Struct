import React from 'react'

import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import HistoryModal from "./HistoryModal";

export default function DefaultContainer(props) {
  return (
    <div style={{ marginLeft: '7%', marginRight: '7%' }}>
      <HistoryModal
        isVisible={props.isHistoryModalOpened}
        pageName={props.title}
        selectedItemId={props.selectedId}
        handleHistoryToggle={props.handleHistoryToggle} />
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
    </div>
  )
}
