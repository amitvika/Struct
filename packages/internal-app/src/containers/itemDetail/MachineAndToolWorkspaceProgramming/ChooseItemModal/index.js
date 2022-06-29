import React from 'react'
import MainModal from '@monostruct/common/components/Modal';
import FactoriesAPI from '@monostruct/common/api/factories.api';
import SelectorView from '@monostruct/common/components/SelectorView';
import { columnsFields } from '@monostruct/common/constants/factory';

export default function ChooseItemModal({
    isModalOpened,
    toggleModal,
}) {

    const handleChange = () => {
    }

    const fetchSelectedList = () => {
        return new Promise((resolve, reject) => {
            resolve([]);
        });
    };

    return (
        <MainModal open={isModalOpened} toggleModal={toggleModal}>
            <SelectorView
                title={'Choose Item'}
                fetchList={FactoriesAPI.fetchFactories}
                fetchSelectedList={fetchSelectedList}
                fields={columnsFields}
                mapValues={(data) => data}
                handleUpdate={handleChange}
                handleSelection={(data) => { }}
                isMultiSelection={false}
                isItemSelectionVisible={true}
            />
        </MainModal>
    )
}
