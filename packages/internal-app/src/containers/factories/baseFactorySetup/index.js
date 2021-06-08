import React, { useState, useEffect } from 'react';

import Filter from '@ravibasil/common/components/TableGridView/Filter';
import GridView from '@ravibasil/common/components/TableGridView/GridView';
import Headding from '@ravibasil/common/components/atoms/Headding'
import Space from '@ravibasil/common/components/atoms/Space';
import ItemAPI from '@ravibasil/common/api/items.api';

import {
    Grid,
    Typography,
    makeStyles,
    Paper,
} from '@material-ui/core';
import { Spinner } from "reactstrap";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';


import { columnsFields } from '../../../constants/item'
import get from 'lodash/get';

export default function BaseFactorySetup({
    factoryId,
    setFactoryValue,
    factoryValue
}) {
    const [isLoading, setIsLoading] = useState(false);

    const [itemList, setItemList] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [filteredItemList, setFilteredItemList] = useState([]);

    const [isItemSelectionVisible, setIsItemSelectionVisible] = useState(false);

    const onClick = () => setIsItemSelectionVisible(!isItemSelectionVisible);
    const [state, setState] = useState({
        checkedA: true,
    });
    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.checked });
    };

    useEffect(() => {
        fetchItemList();
    }, [factoryId]);

    const fetchItemList = async () => {
        try {
            setIsLoading(true);

            const itemRes = await ItemAPI.getItemsAPI(`itemType=Structure`);

            const items = get(itemRes, 'data', []).map((item, index) => {
                return {
                    id: item._id,
                    name: item.name,
                    source: item?.vendorId?.name || 'STRUCT',
                    assemblyType: item.assemblyType
                }
            })
            setItemList(items)
            setFilteredItemList(items)

            if (factoryValue.selectedItemId) {
                const selectedItem = items.find(item => item.id === factoryValue.selectedItemId);
                setSelectedItem(selectedItem);

                setItemList(items.filter(item => item.id !== factoryValue.selectedItemId))
                setFilteredItemList(items.filter(item => item.id !== factoryValue.selectedItemId))
            }
            else {
                setItemList(items)
                setFilteredItemList(items)
            }
            setIsLoading(false);

        } catch (error) {
            console.log(error)
            setIsLoading(false);
        }
    };

    const handleItemSelect = (data) => {
        if (isItemSelectionVisible) {
            setFilteredItemList(prevState => {
                let updatedState = prevState.filter(item => item.id != data.id);
                return updatedState;
            });

            setSelectedItem(data)
            setFactoryValue(prevState => ({ ...prevState, selectedItemId: data.id }));

        }
    }

    const handleClientRemove = (data) => {
        if (isItemSelectionVisible) {

            setFilteredItemList(preMaterialList => {
                return [data, ...preMaterialList];
            });
            setSelectedItem({});
            setFactoryValue(prevState => ({ ...prevState, selectedItemId: null }))
        }
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
        <div>
            {/* Filter section */}
            <Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px' }} >
                <Grid container>
                    <Filter
                        list={itemList}
                        filteredList={filteredItemList}
                        setFilteredList={setFilteredItemList}
                        columnsFields={columnsFields}
                    />
                </Grid>
            </Paper>
            <Space size={20} />

            <div style={{ display: 'flex' }}>

                <Headding fontSize={20} title={'Configure Items'} style={{
                    fontWeight: 'bold',
                    alignItems: 'center',
                    display: 'flex'
                }}></Headding>
                <FormGroup style={{ marginLeft: '20px' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                onClick={onClick}
                                checked={state.checkedB}
                                onChange={handleChange}
                                name="checkedB"
                                color="primary"
                            />
                        }
                        label="Add/Remove Item"
                    />
                </FormGroup>
            </div>

            {
                factoryValue.selectedItemId ?
                    <>

                        <Headding fontSize={20} title={'Selected Item'} style={{ fontWeight: 'bold' }}></Headding>
                        <GridView
                            list={selectedItem ? [selectedItem] : []}
                            handleHistoryToggle={() => false}
                            columnsFields={columnsFields}
                            handleTableRowClick={handleClientRemove}
                            isHistoryLinkVisible={false}
                        />
                    </> :
                    <Headding fontSize={20} title={'No item Selected'} style={{ fontWeight: 'bold' }}></Headding>
            }

            {
                isItemSelectionVisible &&
                <>
                    <Space size={20} />
                    <Headding fontSize={20} title={'Choose Item'} style={{ fontWeight: 'bold' }}></Headding>
                    <GridView
                        list={filteredItemList}
                        handleHistoryToggle={() => false}
                        columnsFields={columnsFields}
                        handleTableRowClick={handleItemSelect}
                        isHistoryLinkVisible={false}
                    />
                </>
            }
        </div>
    )
}
