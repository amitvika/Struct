import React, { useState } from 'react';
import { Spinner } from "reactstrap";

import SelectorView from '@ravibasil/common/components/SelectorView';
import ItemAPI from '@ravibasil/common/api/items.api';

import { columnsFields } from '@ravibasil/common/constants/item'
import { mapItems } from '../../../utils/mapper'
import get from 'lodash/get';

export default function IncomingVendorProducts({ setVendorValue, vendorValue }) {
    const [isLoading, setIsLoading] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState({});

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
