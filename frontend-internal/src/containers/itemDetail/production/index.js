import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import MainModal from '../../../components/Modal'
import { Paper, Grid } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Heading from '../../../components/atoms/Headding'
import GridView from '../../../components/GridView';
import { useSelector } from 'react-redux';
import API from '../../../api/items.api';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {

    padding: theme.spacing(2),
    margin: '10px 2px 10px 2px',
    maxWidth: 400,
    minWidth: 400,
    cursor: 'pointer',
    transition: '0.3s',
    "&:hover, &:focus": {
      backgroundColor: '#DCDCDC'
    }
  },

  image: {
    width: 55,
    height: 70,
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
  },
}));

export default function Production(props) {
  const [filteredItemList, setFilteredItemList] = useState([]);
  const classes = useStyles();
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [checked, setChecked] = useState(true);
  const [state, setState] = useState({});
  const [showText, setShowText] = useState();
  const [selectedCard, setSelectedCard] = useState(-1);
  const { user } = useSelector(state => state.auth);
  const [approvalList, setApprovalList] = useState([
    {
      id: 1,
      isApproved: false,
      approvedBy: ''
    },
    {
      id: 2,
      isApproved: false,
      approvedBy: ''
    },
    {
      id: 3,
      isApproved: false,
      approvedBy: ''
    }])

  const toggleModal = () => {
    setIsModalOpened(!isModalOpened)
  }

  const handleApprovalStatus = (data) => {

    const updatedApprovalList = approvalList.map(approvalItem => {
      if (approvalItem.id === data.id) {
        return {
          ...approvalItem,
          isApproved: approvalItem.isApproved ? false : true
        }
      }
      return approvalItem

    });

    setApprovalList(updatedApprovalList)

    // setState({ ...state, [event.target.name]: event.target.checked });
    // setShowText(!showText);
  }

  const handleCardSelect = (data) => {
    setSelectedCard(data);
    setIsModalOpened(true);
  }
  const [isLoading, setIsLoading] = useState(false);

  const handleTableRowClick = (event) => {
    history.push(`/Items/${event.id}`);
  }

  if (isLoading) {
    return (<div
      style={{
        display: "flex",
        justifyContent: "center"
      }}
    >
      <Spinner animation="border" />
    </div>)
  }



  return (
    <>
      <Heading>Production Approval</Heading>
      <MainModal open={isModalOpened} toggleModal={toggleModal} >
        <Paper style={{ padding: 10 }}>

          <Grid container spacing={4}>
            <Grid item xs={4}>ID</Grid>
            <Grid item xs={8}>{selectedCard.id}</Grid>

            <Grid item xs={4}>Name</Grid>
            <Grid item xs={8}>{selectedCard.name}</Grid>

          </Grid>

          <Heading>Approvals</Heading>

          <Grid container spacing={4}>
            {
              approvalList.map(approval => {
                return (<>
                  <Grid item xs={approval.isApproved ? 6 : 12}>
                    <FormControlLabel
                      control={<Checkbox onClick={() => handleApprovalStatus(approval)} />}
                      label="Approved For Production"
                    />
                  </Grid>
                  {approval.isApproved ?
                    <Grid item xs={6}>{user.email} has approved for production at </Grid> :
                    null

                  }
                </>)

              })
            }
          </Grid>

        </Paper>
      </MainModal>

      <GridView
        handleTableRowClick={handleTableRowClick}
        list={[{ id: 1, name: 'Tesa' }, { id: 1, name: 'Tata' }]}
        handleHistoryToggle={() => false}
        columnsFields={{ id: 'ID', name: 'Name', 'Production Approval' : 'Production Approval' }}
        isHistoryLinkVisible={false}
        handleTableRowClick={handleCardSelect}
      />
    </>
  )
}
// list = { filteredVendorList }
// handleHistoryToggle = { handleHistoryToggle }
// columnsFields = { columnsFields }
// handleTableRowClick = { handleTableRowClick }