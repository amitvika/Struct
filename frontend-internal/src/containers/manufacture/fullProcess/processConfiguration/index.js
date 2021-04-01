import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import MainModal from '../../../../components/Modal'
import TableView from '../../../../components/TableView';
import API from '.././../../../api/items.api';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom";
import moment from 'moment';


const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});



export default function DenseTable() {
    let history = useHistory();

    const [ItemList, setItemList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [snackBar, setSnackBar] = useState(false);
    const [snackBarAlertType, setSnackBarAlertType] = useState('');
    const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
    const [isGridViewSelected, setIsGridViewSelected] = useState(true);
    const classes = useStyles();
    const [filteredItemList, setFilteredItemList] = useState([]);
    const [isModalOpened, setIsModalOpened] = React.useState(false);

    const [columns, setColumns] = useState([
        { title: 'ID', field: 'id' },
        { title: 'Name', field: 'name' },
        { title: 'Quantity', field: 'quantity' },
        { title: 'Production Start Date', field: 'productionStartDate',   },
        { title: 'Production End Date', field: 'productionEndDate', type: 'numeric', render: rowData => rowData && <span>12/31/2999</span> },
        {
            title: 'Select Factory',
            field: "id",
            editable: "never",
            render: rowData => rowData && <span style={{ cursor: 'pointer' }}
                onClick={(event) => {
                    event.stopPropagation();
                    toggleModal({ rowId: rowData.id })
                }}> Select Factory </span>
        },
    ])


    const toggleModal = () => {
        setIsModalOpened(!isModalOpened)
    }

    useEffect(() => {
        fetchItemList();
    }, []);

    const fetchItemList = async () => {
        try {
            setIsLoading(true);

            const ItemRes = await API.getItemsAPI();

            if (ItemRes && ItemRes.data) {
                const items = ItemRes.data.map((x, index) => {
                    return {
                        id: x._id,
                        name: x.name,
                        source: x.source,
                        logoUrl: x.logoUrl
                    }
                })

                setItemList(items)
                setFilteredItemList(items)
            }
            setIsLoading(false);

        } catch (error) {
            console.log(error)
            alertForError(error)
        }
    };


    const fetchList = (query) => {
        API
            .getItemsAPI(`limit=${query.pageSize}&page=${query.page + 1}&search=${query.search}`)
            .then(result => {
                let rowData = result.docs;

                rowData = rowData.map((item, index) => {
                    return {
                        id: item._id,
                        name: item.name,
                        source: item.source
                    };
                });

            })
            .catch(err => console.log(err));

    }


    const addItem = (newData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    const newClient = {
                        name: newData.name,
                        source: newData.source
                    }; //

                    API.addItemApi(newClient)
                        .then(res => {
                            fetchItemList();
                        })
                        .catch(err => {
                            alertForError(err)
                        });

                }
                resolve();
            }, 10);
        })
    }

    const handleTableRowClick = (event) => {
        history.push(`/items/${event.id}`);
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

    const updateItem = (newData, oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    console.log(newData.client);
                    const data = {
                        name: newData.name,
                        source: newData.source
                    }

                    API.updateItemAPI(newData.id, data)
                        .then(res => {
                            fetchItemList()
                        })
                        .catch(err => {
                            alertForError(err)
                        });

                }
                resolve();
            }, 1000);
        })
    }

    const deleteItem = (oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    API.deleteItemAPI(oldData.id)
                        .then(res => {
                            fetchItemList();
                        })
                        .catch(err => {
                            alertForError(err)
                        });
                }
                resolve();
            }, 1000);
        })
    }
  

    return (
        <Paper>
            <MainModal open={isModalOpened} toggleModal={toggleModal}>
                Hello
                </MainModal>
            <div
                style={{
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "larger",
                    color: "grey",
                    height: "33px",
                    margin: "22px"
                }}>
                Add Production Setup
            </div>
            {/* <MainModal open={isModalOpened} toggleModal={toggleModal}/> */}
            <TableView
                list={filteredItemList}
                handleAdd={addItem}
                handleUpdate={updateItem}
                handleDelete={deleteItem}
                handleTableRowClick={handleTableRowClick}
                columns={columns}
                setColumns={setColumns}
            >
            </TableView>


            {/* <MaterialTable
                title="Multiple Actions Preview"
                columns={[
                    { title: 'ID', field: 'id' },
                    { title: 'Name', field: 'name' },
                    { title: 'Quantity', field: 'quantity' },
                    { title: 'Production Start Date', field: 'productionStartDate', type: 'numeric' },
                    { title: 'Production End Date', field: 'productionEndDate', type: 'numeric' },


                ]}
                data={[
                    { id: 'Mehmet', name: 'Danver', quantity: 'Baran', productionStartDate: 1987, productionEndDate: '6312/31/2999' },
                ]}
                actions={[
                    {
                        icon: 'Select Factory',
                        tooltip: 'Select Factory',
                        onClick: () => toggleModal()
                    }
                ]}
                options={{
                    actionsColumnIndex: -1
                }}
            /> */}
        </Paper>

    );
}
