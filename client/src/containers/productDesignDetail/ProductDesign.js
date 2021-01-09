import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Spinner } from "reactstrap";

import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import API from '../../api/productDesign.api';
import { fetchClientsApi } from '../../api/clients.api';
import HistoryModal from "../ShowHistoryModal";

import Toolbar from './components/Toolbar'
import GridView from './components/GridView';
import TableView from './components/TableView';

const ProductDesign = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const [productDesignList, setProductDesignList] = useState([]);
  const [filteredProductDesignList, setFilteredProductDesignList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [snackBar, setSnackBar] = useState(false);
  const [snackBarAlertType, setSnackBarAlertType] = useState('');
  const [clientList, setClientList] = useState([]);
  const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
  const [selectedProductDesignId, setSelectedProductDesignId] = useState('');
  const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
  const [isGridViewSelected, setIsGridViewSelected] = useState(false);
  const columnsFields = ['id', 'name', 'clientName', 'created_by'];

  useEffect(() => {
    fetchClientList();
    fetchProductDesign();
  }, [])

  const fetchProductDesign = async () => {
    try {
      setIsLoading(true);

      const productRes = await API.getProductDesignApi();

      if (productRes && productRes.data) {
        const pd = productRes.data.map((x, index) => {
          return {
            id: x._id,
            name: x.name,
            client: x.client._id,
            clientName: x.client.name,
            created_by: x.createdBy.name,
            deleted_at: x.deletedAt
          }
        })

        setProductDesignList(pd)
        setFilteredProductDesignList(pd)
      }
      setIsLoading(false);

    } catch (error) {
      alertForError(error)
    }
  };

  const fetchClientList = async () => {
    try {
      const clientRes = await fetchClientsApi();
      if (clientRes && clientRes.data) {
        setClientList(clientRes.data)
      }

    } catch (error) {
      alertForError(error)
    }
  }

  const addProductDesign = (newData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        {
          const newProcessGroup = {
            name: newData.name,
            client: newData.client,
            user: isAuthenticated
              ? user._id
              : "Guest"
          }; //

          API.addProductDesignApi(newProcessGroup)
            .then(res => {
              fetchProductDesign();
            })
            .catch(err => {
              alertForError(err)
            });

        }
        resolve();
      }, 10);
    })
  }

  const updateProductDesign = (newData, oldData) => {
    new Promise((resolve, reject) => {
      setTimeout(() => {
        {
          console.log(newData.client);
          const data = {
            name: newData.name,
            user: user._id,
            client: newData.client
          }

          API.updateProductDesignApi(newData.id, data)
            .then(res => {
              fetchProductDesign()
            })
            .catch(err => {
              alertForError(err)
            });

        }
        resolve();
      }, 1000);
    })
  }

  const deleteProductDesign = (oldData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        {
          API.deleteProductDesignApi(oldData.id)
            .then(res => {
              fetchProductDesign();
            })
            .catch(err => {
              alertForError(err)
            });
        }
        resolve();
      }, 1000);
    })
  }

  const alertForError = (err) => {
    setIsLoading(false);
    if (err.response && err.response.data) {
      setMessage(err.response.data.message);
      setSnackBarAlertType("error");
      setSnackBar(true);
    }
  }

  const handleAlertClose = (event, reason) => {
    setSnackBar(!snackBar);
  };

  const handleShowDelete = () => {
    // const columns = this.state.columns;
    // if (!this.state.isDeletedItemVisible) {
    //   columns.push({ title: "Deleted At", field: "deleted_at" });
    // } else {
    //   columns.pop();
    // }
    // this.setState(
    //   state => ({
    //     isDeletedItemVisible: !state.isDeletedItemVisible
    //   }),
    //   () => this.retrieveFromDb()
    // );
  };

  const handleHistoryToggle = ({ rowId }) => {
    setIsHistoryModalOpened(!isHistoryModalOpened);
    setSelectedProductDesignId(rowId)
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
    <div style={{ marginLeft: '5%', marginRight: '5%' }}>
      <HistoryModal
        isVisible={isHistoryModalOpened}
        pageName={'ProcessGroup'}
        selectedItemId={selectedProductDesignId}
        handleHistoryToggle={handleHistoryToggle} />
      <Snackbar
        open={snackBar}
        autoHideDuration={10000}
        onClose={handleAlertClose}>
        <MuiAlert
          severity={snackBarAlertType}
          onClose={handleAlertClose}>
          {message}
        </MuiAlert>
      </Snackbar>

      <Toolbar
        isGridViewSelected={isGridViewSelected}
        setIsGridViewSelected={setIsGridViewSelected}
        isDeletedItemVisible={isDeletedItemVisible}
        handleShowDelete={handleShowDelete}
        isHistoryModalOpened={isHistoryModalOpened}
        handleHistoryToggle={handleHistoryToggle}
        clientList={clientList}
        productDesignList={productDesignList}
        filteredProductDesignList={filteredProductDesignList}
        setFilteredProductDesignList={setFilteredProductDesignList}
        columnsFields={columnsFields}
      />

      {
        isGridViewSelected ?
          <GridView
            productDesignList={filteredProductDesignList}
            handleHistoryToggle={handleHistoryToggle} /> :
          <TableView
            productDesignList={filteredProductDesignList}
            clientList={clientList}
            isDeletedItemVisible={isDeletedItemVisible}
            handleHistoryToggle={handleHistoryToggle}
            handleShowDelete={handleShowDelete}
            isHistoryModalOpened={isHistoryModalOpened}
            addProductDesign={addProductDesign}
            updateProductDesign={updateProductDesign}
            deleteProductDesign={deleteProductDesign}
          />

      }
    </div >
  );
}

export default ProductDesign;
