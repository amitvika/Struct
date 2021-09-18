import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Spinner } from 'reactstrap';

import API from '@monostruct/common/api/vendor.api';
import Toolbar from '@monostruct/common/components/TableGridView/Toolbar';
import TableView from '@monostruct/common/components/TableGridView/TableView';
import GridView from '@monostruct/common/components/TableGridView/GridView';
import DefaultContainer from '@monostruct/common/components/DefaultContainer';

export default function SuppliedItems() {
  let history = useHistory();
  let { id } = useParams();

  const dispatch = useDispatch();

  const [vendorList, setVendorList] = useState([]);
  const [filteredVendorList, setFilteredVendorList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [snackBar, setSnackBar] = useState(false);
  const [snackBarAlertType, setSnackBarAlertType] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
  const [isGridViewSelected, setIsGridViewSelected] = useState(true);
  const [isModalOpened, setIsModalOpened] = useState(false);

  const [columns, setColumns] = useState([
    { title: 'ID', field: 'id', editable: 'never', align: 'center' },
    { title: 'Estimated Delivery Date', field: 'estimated_delivery_date' },
    { title: 'Item Quantity', field: 'itemQuantity' },
    { title: 'Unit Cost', field: 'unitCost' },
    {
      title: 'Identification',
      field: 'identification',
      isFilterColumn: false,
      editable: 'never',
      render: (rowData) =>
        rowData && (
          <span
            style={{ cursor: 'pointer' }}
            onClick={(event) => {
              toggleModal();
              event.stopPropagation();
              // handleIdentificationToggle({ rowId: rowData.id })
            }}
          >
            {' '}
            Indentification Modal{' '}
          </span>
        ),
    },
  ]);
  const columnsFields = { id: 'ID', name: 'Name' };

  const alertForError = (err) => {
    setIsLoading(false);
    if (err.response && err.response.data) {
      setMessage(err.response.data.message);
      setSnackBarAlertType('error');
      setSnackBar(true);
    }
  };

  // const handleIndentificationToggle = ({ rowId }) => {
  //     setIsIdentificationModalOpened(!isIdentificationModalOpened);
  //     setSelectedVendorId(rowId)
  // }

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
    //   })
    // );
  };

  useEffect(() => {
    fetchVendorList();
  }, []);

  const fetchVendorList = async () => {
    try {
      setIsLoading(true);

      const vendorRes = await API.getVendorsApi();

      if (vendorRes && vendorRes.data) {
        const vendors = vendorRes.data.map((x, index) => {
          return {
            id: x._id,
            name: x.name,
            source: x.source,
            logoUrl: x.logoUrl,
          };
        });

        setVendorList(vendors);
        setFilteredVendorList(vendors);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      alertForError(error);
    }
  };

  const fetchList = (query) => {
    API.getVendorsApi(
      `limit=${query.pageSize}&page=${query.page + 1}&search=${query.search}`
    )
      .then((result) => {
        let rowData = result.docs;

        rowData = rowData.map((item, index) => {
          return {
            id: item._id,
            name: item.name,
            source: item.source,
          };
        });
      })
      .catch((err) => console.log(err));
  };

  const addVendor = (newData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        {
          const newClient = {
            name: newData.name,
            source: newData.source,
          }; //

          API.addVendorApi(newClient)
            .then((res) => {
              fetchVendorList();
            })
            .catch((err) => {
              alertForError(err);
            });
        }
        resolve();
      }, 10);
    });
  };

  const updateVendor = (newData, oldData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        {
          console.log(newData.client);
          const data = {
            name: newData.name,
            source: newData.source,
          };

          API.updateVendorApi(newData.id, data)
            .then((res) => {
              fetchVendorList();
            })
            .catch((err) => {
              alertForError(err);
            });
        }
        resolve();
      }, 1000);
    });
  };

  const deleteVendor = (oldData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        {
          API.deleteVendorApi(oldData.id)
            .then((res) => {
              fetchVendorList();
            })
            .catch((err) => {
              alertForError(err);
            });
        }
        resolve();
      }, 1000);
    });
  };

  const handleTableRowClick = (event) => {
    // history.push(`/vendors/${event.id}`);
    history.push({
      pathname: `/vendors/${id}`,
      search: `?tab=10`,
    });
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  const toggleModal = () => {
    setIsModalOpened(!isModalOpened);
  };

  return (
    <div>
      <DefaultContainer
        // isHistoryModalOpened={false}
        title={'Vendors'}
        selectedId={selectedVendorId}
        // handleIndentificationToggle={()=> toggleModal()}
        snackBar={snackBar}
        handleAlertClose={handleAlertClose}
        message={message}
        snackBarAlertType={snackBarAlertType}
      >
        {/* <IdentificationModal
                    isModalOpened={isModalOpened}
                    toggleModal={toggleModal}
                /> */}

        <Toolbar
          title={'Vendors'}
          isGridViewSelected={isGridViewSelected}
          setIsGridViewSelected={setIsGridViewSelected}
          // handleSearchBar={handleSearchBar}
          isDeletedItemVisible={isDeletedItemVisible}
          handleShowDelete={handleShowDelete}
          // isHistoryModalOpened={false}
          // handleIndentificationToggle={()=>toggleModal()}
          list={vendorList}
          filteredList={filteredVendorList}
          setFilteredList={setFilteredVendorList}
          columnsFields={columnsFields}
          isHistoryCheckboxVisible={false}
          isDeleteCheckboxVisible={false}
        />

        {isGridViewSelected ? (
          <GridView
            list={filteredVendorList}
            // handleIndentificationToggle={()=>toggleModal()}
            columnsFields={columnsFields}
            handleTableRowClick={handleTableRowClick}
          />
        ) : (
          <TableView
            list={filteredVendorList}
            handleAdd={addVendor}
            handleUpdate={updateVendor}
            handleDelete={deleteVendor}
            handleTableRowClick={handleTableRowClick}
            columns={columns}
            setColumns={setColumns}
          />
        )}
      </DefaultContainer>
    </div>
  );
}
