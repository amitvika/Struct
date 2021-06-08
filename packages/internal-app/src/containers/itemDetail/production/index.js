import React, { useState, useEffect } from 'react'
import { useDispatch,useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import get from 'lodash/get';

import Heading from '@ravibasil/common/components/atoms/Headding';
import GridView from '@ravibasil/common/components/TableGridView/GridView';
import ProductionAPI from '@ravibasil/common/api/production.api';
import ProductionApprovalModal from './ProductionApprovalModal'
import { showErrorAlert, showSuccessAlert } from '../../../actions/alert.action';
import SimpleBackdrop from '@ravibasil/common/components/Backdrop';

export default function Production(props) {
    const dispatch = useDispatch();

    const [isModalOpened, setIsModalOpened] = useState(false);
    const [selectedValue, setSelectedValue] = useState({});
    const { user } = useSelector(state => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    let { id: item_id } = useParams();

    const [list, setList] = useState([]);

    const [approvalList, setApprovalList] = useState([
        {
            id: 1,
            isApproved: false,
            approvedBy: ''
        },
        {
            id: 2,
            isApproved: false,
            approvedBy: ''
        },
        {
            id: 3,
            isApproved: false,
            approvedBy: ''
        }])

    const toggleModal = () => {
        setIsModalOpened(false);
        setSelectedValue({})
    }


    const handleCardSelect = (data) => {
        setSelectedValue(data);
        setIsModalOpened(true);
    }


    useEffect(() => {
        fetchList()
    }, [])

    const fetchList = async () => {
        try {
            setIsLoading(true);

            const productionRes = await ProductionAPI.fetchProductions(`item_id=${item_id}`);

            const productionList = get(productionRes, 'data', []);

            setList(productionList)
            setIsLoading(false);

        } catch (error) {
            console.log(error)
        }
    };

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

    return (
        <>
            <SimpleBackdrop open={isLoading} />
            <Heading>Production Approval</Heading>
            {isModalOpened &&
                <ProductionApprovalModal
                    isModalOpened={isModalOpened}
                    toggleModal={toggleModal}
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                    handleApproveItemForProduction={handleApproveItemForProduction}
                />}

            <GridView
                list={list}
                handleHistoryToggle={() => false}
                columnsFields={[
                    { field: 'id', title: 'ID' },
                    { field: 'name', title: 'Name' },
                    { field: 'quantity', title: 'Quantity' },
                    { field: 'start_date', title: 'Start date' },
                    { field: 'end_date', title: 'End date' },
                    { field: 'isApprovedforProduction', title: 'Production Approval' }
                ]}
                isHistoryLinkVisible={false}
                handleTableRowClick={handleCardSelect}
            />
        </>
    )
}