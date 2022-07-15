import React, { useState } from 'react'
import MainModal from '@monostruct/common/components/Modal';
import ItemsAPI from '@monostruct/common/api/items.api';
import SelectorView from '@monostruct/common/components/SelectorView';
import { columnsForItemView } from '@monostruct/common/constants/item';

export default function ChooseItemModal({
    isModalOpened,
    toggleModal,
    handleItemSelection
}) {

    const fetchSelectedList = () => {
        return new Promise((resolve, reject) => {
            resolve([]);
        });
    };

    const getSelectedItem = (updatedItem) => {
        console.log('-updatedItem---->>>', updatedItem)
    }

    return (
        <MainModal open={isModalOpened} toggleModal={toggleModal}>
            <SelectorView
                title={'Choose Item'}
                fetchList={() => ItemsAPI.getItemsAPI(`page=1&limit=100&select_fields= name,source,multiAssembly,direct_parent_id,origin_parent_id,child_item_created,fileStore,material,fileUUId,child_item_status`)}
                fetchSelectedList={fetchSelectedList}
                fields={columnsForItemView}
                mapValues={(data) => data}
                isMultiSelection={true}
                isItemSelectionVisible={true}
                getSelectedItem={getSelectedItem}
            />
        </MainModal>
    )
}
