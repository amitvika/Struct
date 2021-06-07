import React, { useState, useEffect } from 'react';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import {
    Paper,
    Typography,
    IconButton,
} from '@material-ui/core';
import { Spinner } from "reactstrap";

import { columnsFields } from '../../../constants/item'
import ItemAPI from '../../../api/items.api';
// import ProductOptions from './productOptions'
import ProductOptions from './productOptions'

import { mapItems } from '../../../utils/mapper'
import SelectorView from '../../../components/SelectorView'
import get from 'lodash/get';

export default function IncomingVendorProducts({ setVendorValue, vendorValue }) {
    const [isLoading, setIsLoading] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState({});

    const [isItemSelectionVisible, setIsItemSelectionVisible] = useState(false);

    // const onClick = () => setIsItemSelectionVisible(!isItemSelectionVisible);
    const [state, setState] = useState({
        checkedA: true,
    });
    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.checked });
    };

    const handleProductBreadcrumbSelect = () => {
        setSelectedProduct({});
    }

    const fetchSelectedList = () => {
        return new Promise((resolve, reject) => {
            resolve(get(vendorValue, 'suppliedItems', []))
        })
    }

    const handleItemSelect = (suppliedItems) => {
        setVendorValue({ ...vendorValue, suppliedItems })
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

            <SelectorView
                title={'Product'}
                fetchList={ItemAPI.getItemsAPI}
                fetchSelectedList={fetchSelectedList}
                fields={columnsFields}
                mapValues={mapItems}
                handleUpdate={handleItemSelect}
                handleSelection={(data) => setSelectedProduct(data)}
            />

        </div >
    )

}
