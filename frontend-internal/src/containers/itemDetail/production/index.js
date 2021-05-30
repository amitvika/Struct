import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';

import Heading from '../../../components/atoms/Headding';
import GridView from '../../../components/TableGridView/GridView';
import { useSelector } from 'react-redux';
import ProductionAPI from './../../../api/production.api';
import { useParams } from "react-router-dom";
import { Spinner } from "reactstrap";
import get from 'lodash/get';
import ProductionApprovalModal from './ProductionApprovalModal'
import { showErrorAlert, showSuccessAlert } from '../../../actions/alert.action';
import SimpleBackdrop from '../../../components/Backdrop';

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
                columnsFields={{
                    id: 'ID',
                    name: 'Name',
                    quantity: 'Quantity',
                    start_date: 'Start date',
                    end_date: 'End date',
                    isApprovedforProduction: 'Production Approval'
                }}
                isHistoryLinkVisible={false}
                handleTableRowClick={handleCardSelect}
            />
        </>
    )
} 