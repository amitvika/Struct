import React, { useState } from 'react'
import {
  Button,
  Typography,
  Paper,
  Radio,
  FormControlLabel,
  IconButton
} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { Link } from 'react-router-dom';
import ThreejsViewModal from '../ThreejsViewModal';

export default function AssemblyComponent({ setIsAddComponentModalOpen, selectedItem }) {
  const [isThreejsModalVisible, setIsThreejsModalVisible] = useState(false);

  const removeComponent = () => {

  }

  const handleRadioButton = () => {

  }

  const handleThreejsVisibility = () => {
    setIsThreejsModalVisible(prev => !prev)
  }

  return (
    <div>
      <ThreejsViewModal
        isVisible={isThreejsModalVisible} />
      <Paper>
        <div className="AssemblyComponent__Header">
          <Typography >Component 1 </Typography>
          <Button
            variant="contained"
            color="secondary"
            className='AssemblyComponent__Delete--Button'
            startIcon={<DeleteIcon />}
            onClick={removeComponent}>
            Delete
          </Button>
        </div>

        <div className="AssemblyComponent__Body">
          <div className="AssemblyComponent__Content">
            <Button variant="contained" color="primary" onClick={() => setIsAddComponentModalOpen(true)}>
              Select Component
            </Button>
            <Link target="_blank" to={`/items/${selectedItem._id}`}>{selectedItem.name}</Link>
          </div>
          <div className="AssemblyComponent__Content">
            <Button variant="contained" color="primary" onClick={() => handleThreejsVisibility(true)}>
              Assemble
            </Button>
          </div>

          <div className="AssemblyComponent__Content">
            <Button variant="contained" color="primary" onClick={() => setIsAddComponentModalOpen(true)}>
              Workholding
            </Button>
          </div>
          <div className=".AssemblyComponent__Content--Workholding">
            <FormControlLabel value="New Workholding" control={<Radio />} label="New Workholding" />

            <div className="AsseblyComponent_Workholding">
              <Button onClick={() => setIsAddComponentModalOpen(true)} onClick={() => handleThreejsVisibility(true)}>
                Transfer Workholding 1
              </Button>

              <span>None</span>

              <IconButton color="primary" aria-label="New Workholding">
                <AddIcon />
              </IconButton>
            </div>
          </div>
        </div>
      </Paper>
    </div>
  )
}
