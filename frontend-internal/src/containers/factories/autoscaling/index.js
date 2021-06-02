import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TableView from '../../../components/TableGridView/TableView';
import ProductionAPI from '.././../../api/production.api';
import { Spinner } from "reactstrap";
import { useHistory, useParams } from "react-router-dom";
import get from 'lodash/get';
import { useDispatch, useSelector } from 'react-redux';
import { showErrorAlert, showSuccessAlert } from '../../../actions/alert.action';
import {
    MuiPickersUtilsProvider,
    DatePicker
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import moment from 'moment';
import { reject } from 'lodash';
import ApprovalModal from '../../../components/ApprovalModal';
export default function Autoscaling() {

    let history = useHistory();
    const dispatch = useDispatch();
    let { id: item_id } = useParams();
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredList, setFilteredList] = useState([]);
    const [isModalOpened, setIsModalOpened] = React.useState(false);
    const [selectedValue, setSelectedValue] = useState({});
    const [columns, setColumns] = useState([
        { title: 'ID', field: 'id', editable: "never" },
        { title: 'Name', field: 'name' },
        {
            title: 'Production Start Date',
            field: 'start_date',
            type: 'date',
            // value="2013-01-08",
            render: rowData => moment(rowData.start_date).format('DD/MM/YYYY'),
            editComponent: (props) => <CustomDatePicker {...props} />
        },
        {
            title: 'Production End Date',
            field: 'end_date',
            type: 'date',
            render: rowData => moment(rowData.end_date).format('DD/MM/YYYY'),
            editComponent: (props) => <CustomDatePicker {...props} value={props.value ? props.value : new Date('12/31/2099')} />
        },
        {
            title: 'Approval',
            field: "id",
            editable: "never",
            render: rowData => rowData && <span style={{ cursor: 'pointer' }}
                onClick={(event) => {
                    event.stopPropagation();
                    toggleModal(rowData)
                }}> Approval</span>
        },
    ])
    const CustomDatePicker = (props) => (
        <MuiPickersUtilsProvider utils={DateFnsUtils}
            locale={props.dateTimePickerLocalization}>
            <DatePicker
                format="dd/MM/yyyy"
                value={props.value || new Date()}
                onChange={props.onChange}
                clearable
                InputProps={{
                    style: {
                        fontSize: 13,
                    }
                }}
            />
        </MuiPickersUtilsProvider>
    )

    const toggleModal = (data) => {
        if (!isModalOpened) {
            setSelectedValue(data);
        }
        else {
            setSelectedValue({});
        }

        setIsModalOpened(!isModalOpened);
    }

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            setIsLoading(true);

            const productionRes = await ProductionAPI.fetchProductions(`item_id=${item_id}`);

            const productionList = get(productionRes, 'data', []);

            setList(productionList)
            setFilteredList(productionList)
            setIsLoading(false);

        } catch (error) {
            console.log(error)
        }
    };

    const upsertItem = (newData) => {
        return new Promise((resolve, reject) => {
            ProductionAPI.upsertProduction(newData)
                .then(res => {
                    if (res.data) {
                        dispatch(showSuccessAlert({ message: `Production updated` }));

                        const availableDoc = list.find(document => document.id == res.data.id);

                        if (availableDoc) {
                            const updatedList = list.map(document => {
                                if (document.id === res.data.id) {
                                    return { ...res.data, id: res.data.id }
                                }
                                return document
                            })

                            setList(updatedList);
                            setFilteredList(updatedList);

                            setIsModalOpened(false);
                        }
                        else {
                            const updatedList = [
                                { ...res.data, id: res.data.id },
                                ...list
                            ];
                            setList(updatedList);

                            setFilteredList(updatedList);

                            toggleModal(res.data);
                        }

                    }
                    resolve();
                })
                .catch(err => {
                    dispatch(showErrorAlert({ message: `Unable to update Production` }));
                    reject();
                });
        })

    }
    const handleApproveItemForProduction = (productionId, data) => {
        setIsLoading(true)
        setIsModalOpened(false);
        ProductionAPI.approveItemForProduction(productionId, data)
            .then(res => {

                setList(list.map(production => {
                    if (production.id === get(res, 'data.id')) {
                        return res.data;
                    }
                    return production;
                }))
                setIsLoading(false)
                dispatch(showSuccessAlert({ message: 'Production approved for production' }));
            })
            .catch(error => {
                dispatch(showErrorAlert({ message: 'Unable to save info' }));
                setIsLoading(false)
            })
    }
    const addItem = (newData) => {
        let updateValue = { ...newData, item_id }
        return upsertItem(updateValue)
    }

    const updateItem = (newData, oldData) => {
        return upsertItem(newData)
    }

    const deleteItem = (oldData) => {
        let updateValue = { ...oldData, is_archived: true }
        return upsertItem(updateValue)
    }

    const assignFactory = (value) => {
        if (Object.keys(value).length > 0) {
            upsertItem(value)
        }

    }
    const handleTableRowClick = (event) => {
        // history.push(`/items/${event.id}`);
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
        <Paper>
            {
                isModalOpened &&
                <ApprovalModal
                    isModalOpened={isModalOpened}
                    toggleModal={toggleModal}
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                    assignFactory={assignFactory}
                    handleApproveItemForProduction={handleApproveItemForProduction} 
                    fields={columns}/>
            }

            <TableView
                title={'Add Production Setup'}
                list={filteredList}
                handleAdd={addItem}
                handleUpdate={updateItem}
                handleDelete={deleteItem}
                handleTableRowClick={handleTableRowClick}
                columns={columns}
                setColumns={setColumns}
                isAddEditActionsEnabled={true}
            >
            </TableView>

        </Paper>
    )
}
