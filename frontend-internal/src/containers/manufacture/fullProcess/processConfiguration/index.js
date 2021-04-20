import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import MainModal from '../../../../components/Modal'
import TableView from '../../../../components/TableView';
import ProductionAPI from '.././../../../api/production.api';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom";
import get from 'lodash/get';

export default function ProductionTable() {

    let history = useHistory();

    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
    const [isGridViewSelected, setIsGridViewSelected] = useState(true);
    const [filteredList, setFilteredList] = useState([]);
    const [isModalOpened, setIsModalOpened] = React.useState(false);
    const [selectedItemId, setSelectedItemId] = useState('');


    const [columns, setColumns] = useState([
        { title: 'ID', field: 'id' },
        { title: 'Name', field: 'name' },
        { title: 'Quantity', field: 'quantity', type: 'numeric' },
        { title: 'Production Start Date', field: 'start_date', type: 'date' },
        { title: 'Production End Date', field: 'end_date', type: 'date' },
        {
            title: 'Select Factory',
            field: "id",
            editable: "never",
            render: rowData => rowData && <span style={{ cursor: 'pointer' }}
                onClick={(event) => {
                    event.stopPropagation();
                    toggleModal({ rowId: rowData.id })
                }}> Select</span>
        },
    ])

    const toggleModal = ({ rowId }) => {
        setIsModalOpened(!isModalOpened)
        setSelectedItemId(rowId)

    }

    useEffect(() => {
        fetchList();
    }, []);


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

    const handleAlertClose = (event, reason) => {
    };

    const fetchList = async () => {
        try {
            setIsLoading(true);

            const productionRes = await ProductionAPI.fetchProductions();

            const productionList = get(productionRes, 'data', []);
            setList(productionList)
            setFilteredList(productionList)
            setIsLoading(false);

        } catch (error) {
            console.log(error)
        }
    };

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
                            fetchList();
                        })
                        .catch(err => {
                        });

                }
                resolve();
            }, 10);
        })
    }

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
                            fetchList()
                        })
                        .catch(err => {
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
                            fetchList();
                        })
                        .catch(err => {
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

            <TableView
                title={'Add Production Setup'}
                list={filteredList}
                handleAdd={addItem}
                handleUpdate={updateItem}
                handleDelete={deleteItem}
                handleTableRowClick={handleTableRowClick}
                columns={columns}
                setColumns={setColumns}
            >
            </TableView>

        </Paper>

    );
}
