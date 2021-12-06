import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';

function ClipboardText({ item_id }) {
  const handleCopyId = (event) => {
    navigator.clipboard.writeText(item_id);
    event.stopPropagation();
  };

  return (
    <Tooltip
      title="Copy to clipboard"
      aria-label="copy"
      placement="left"
      style={{ zIndex: '3' }}
    >
      <IconButton onClick={handleCopyId} size="large">
        <FileCopyOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
}

export default ClipboardText;
