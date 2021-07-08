import React, { useState } from 'react';
import { Spinner } from "reactstrap";

import SelectorView from '@ravibasil/common/components/SelectorView';
import ItemAPI from '@ravibasil/common/api/items.api';

import { columnsFields } from '@ravibasil/common/constants/item'
import { mapItems } from '../../../utils/mapper'
import get from 'lodash/get';
import { useParams, useHistory } from "react-router-dom";

export default function IncomingVendorProducts({
    setVendorInfo,
    vendorInfo
}) {
    const { id } = useParams();
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);

    const [state, setState] = useState({
        checkedA: true,
    });
    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.checked });
    };

    const fetchSelectedList = () => {
        return new Promise((resolve, reject) => {
            resolve(get(vendorInfo, 'suppliedItems', []))
        })
    }

    const handleItemSelect = (suppliedItems) => {
        setVendorInfo({ ...vendorInfo, suppliedItems })
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

    const handleSelection = (data) => {        
        history.push(`/vendors/${id}?tab=1&product=${data.id}&p_name=${data.name}`);
    }


    return (
        <SelectorView
            title={'Product'}
            fetchList={ItemAPI.getItemsAPI}
            fetchSelectedList={fetchSelectedList}
            fields={columnsFields}
            mapValues={mapItems}
            handleUpdate={(data) => setVendorInfo({
                ...vendorInfo,
                suppliedItems: data
            })}
            handleSelection={handleSelection}
        />)
}
