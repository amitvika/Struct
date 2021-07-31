import React, { Fragment, useState } from "react";
import Button from "@material-ui/core/Button";
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  custom_file: {
    position: 'relative',
    width: '100%',
    height: 'calc(1.5em + .75rem + 2px)'
  },
  custom_file_input: {
    zIndex: 2,
    margin: 0,
    overflow: 'hidden',
    opacity: 0,
    position: 'relative',
    width: '100%',
    height: 'calc(1.5em + .75rem + 2px)'
  },
  custom_file_label: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '.375rem .75rem',
    lineHeight: 1.5,
    color: '#495057',
    left: 0,
    zIndex: 1,
    height: 'calc(1.5em + .75rem + 2px)',
    overflow: 'hidden',
    fontWeight: 400,
    backgroundColor: '#fff',
    border: '1px solid #ced4da',
    borderRadius: '.25rem',
    '&::after': {
      bottom: 0,
      zIndex: 3,
      display: 'block',
      height: 'calc(1.5em + .75rem)',
      content: '"Browse"',
      backgroundColor: '#e9ecef',
      borderLeft: 'inherit',
      borderRadius: '0 .25rem .25rem 0',
      position: 'absolute',
      top: 0,
      right: 0,
      padding: '.375rem .75rem',
      lineHeight: 1.5,
      color: '#495057'
    }
  }
}));

export default function FileUpload({ fileName, setFileName, handleFileUpload, itemId, label = "STEP, DXF, GERBER" }) {
  //State
  const [file, setFile] = useState("");
  // const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState();
  const [uploadPercentage, setUploadPercentage] = useState();
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const [isFileChanged, setIsFileChanged] = useState(false);

  //Methods
  const onChange = e => {
    if (!e.target.files[0]) {
      return;
    }
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
    setIsFileChanged(true);
  };

  const onSubmit = e => {
    const fileSize = file.size / 1024 / 1024;

    if (fileName.split('.').pop() === 'STL' && fileSize > 20) {
      setOpen(true)
      return;
    }

    e.preventDefault();
    handleFileUpload(file)
  };

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Box component="div" className={classes.custom_file}>
          <input
            id="btn-upload"
            name="btn-upload"
            className={classes.custom_file_input}
            type="file"
            onChange={onChange} />

          <label
            className={classes.custom_file_label}
            htmlFor="file">
            {
              isFileChanged ? fileName : label
            }
            {/* {label} */}
            {/* fileName*/}
          </label>

        </Box>

        <Button
          style={{ marginLeft: "1%", width: '25%' }}
          variant="contained"
          color="primary"
          type="button"
          onClick={onSubmit}            >
          Load File
        </Button>
      </div>
      {/* <FileHistory selectedFileName={fileName}
                link_id={file.id} /> */}
    </>
  );
}
