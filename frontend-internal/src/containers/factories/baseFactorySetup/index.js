import React, { useState, useEffect } from 'react';

import Filter from '../../../components/Filter';
import GridView from '../../../components/GridView';
import Headding from '../../../components/atoms/Headding'
import Space from '../../../components/atoms/Space';

import {
    Grid,
    Typography,
    makeStyles,
    Paper,
} from '@material-ui/core';
import { Spinner } from "reactstrap";

import { columnsFields } from '../../../constants/item'
import ItemAPI from '../../../api/items.api';
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

    useEffect(() => {
        fetchItemList();
    }, [factoryId]);

    const fetchItemList = async () => {
        try {
            setIsLoading(true);

            const itemRes = await ItemAPI.getItemsAPI();

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
        setFilteredItemList(prevState => {
            let updatedState = prevState.filter(item => item.id != data.id);
            return updatedState;
        });

        setSelectedItem(data)
        setFactoryValue(prevState => ({ ...prevState, selectedItemId: data.id }))
    }

    const handleClientRemove = (data) => {
        setFilteredItemList(preMaterialList => {
            return [data, ...preMaterialList];
        });
        setSelectedItem({});
        setFactoryValue(prevState => ({ ...prevState, selectedItemId: null }))
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

            <Headding fontSize={20} title={'Selected Item'} style={{ fontWeight: 'bold' }}></Headding>
            <GridView
                list={Object.keys(selectedItem).length > 0 ? [selectedItem] : []}
                handleHistoryToggle={() => false}
                columnsFields={columnsFields}
                handleTableRowClick={handleClientRemove}
                isHistoryLinkVisible={false}
            />

            <Space size={20} />
            <Headding fontSize={20} title={'Choose Item'} style={{ fontWeight: 'bold' }}></Headding>
            <GridView
                list={filteredItemList}
                handleHistoryToggle={() => false}
                columnsFields={columnsFields}
                handleTableRowClick={handleItemSelect}
                isHistoryLinkVisible={false}
            />
        </div>
    )
}
