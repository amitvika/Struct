import React from 'react'
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';


function ClipboardText({ item_id }) {

  const handleCopyId = (event) => {
    navigator.clipboard.writeText(item_id)
    console.log(item_id)
    event.stopPropagation();
  }

  return (
    <Tooltip title="Copy to clipboard" aria-label="copy" placement="left">
      <IconButton onClick={handleCopyId}>
        <FileCopyOutlinedIcon />
      </IconButton>
    </Tooltip>

  )
}

export default ClipboardText
