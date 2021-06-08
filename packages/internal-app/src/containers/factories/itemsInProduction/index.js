import React, { useState, useEffect } from 'react';

import Filter from '@ravibasil/common/components/TableGridView/Filter';
import GridView from '@ravibasil/common/components/TableGridView/GridView';
import Headding from '@ravibasil/common/components/atoms/Headding'
import Space from '@ravibasil/common/components/atoms/Space';

import {
    Grid,
    Paper,
} from '@material-ui/core';
import { Spinner } from "reactstrap";

import { columnsFields } from '../../../constants/item'
import ProductionAPI from '@ravibasil/common/api/production.api';
import get from 'lodash/get';

export default function ItemsInProduction({
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
        if (factoryId) {
            fetchItemList();
        }
    }, [factoryId]);

    const fetchItemList = async () => {
        try {
            setIsLoading(true);

            const itemRes = await ProductionAPI.itemsInProduction(`factory_id=${factoryId}`);

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
            setIsLoading(false);

        } catch (error) {
            console.log(error)
            setIsLoading(false);
        }
    };

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

            <Headding fontSize={20} title={itemList.length > 0 ? 'Items in Production' : 'No item In Production'} style={{ fontWeight: 'bold' }}></Headding>
            <GridView
                list={filteredItemList}
                handleHistoryToggle={() => false}
                columnsFields={columnsFields}
                isHistoryLinkVisible={false}
            />

        </div>
    )
}
