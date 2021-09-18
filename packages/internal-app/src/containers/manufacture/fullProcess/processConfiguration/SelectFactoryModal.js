import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import MainModal from '@monostruct/common/components/Modal';
import FactoriesAPI from '@monostruct/common/api/factories.api';
import { useDispatch, useSelector } from 'react-redux';
import SelectorView from '@monostruct/common/components/SelectorView';
import { columnsFields } from '@monostruct/common/constants/factory';

export default function SelectFactoryModal({
  isModalOpened,
  toggleModal,
  selectedValue = {},
  setSelectedValue,
  assignFactory,
}) {
  const handleChange = (data) => {
    console.log('data', data);
    if (data[0]) {
      let updatedValue = { ...selectedValue, factory_id: data[0] };
      console.log('updatedValue', updatedValue);
      setSelectedValue(updatedValue);
      assignFactory(updatedValue);
    }
  };

  const fetchSelectedList = () => {
    return new Promise((resolve, reject) => {
      if (selectedValue.factory_id) {
        resolve([selectedValue.factory_id]);
      } else {
        resolve([]);
      }
      console.log(selectedValue.name);
    });
  };

  return (
    <MainModal open={isModalOpened} toggleModal={toggleModal}>
      <SelectorView
        title={'Factory'}
        fetchList={FactoriesAPI.fetchFactories}
        fetchSelectedList={fetchSelectedList}
        fields={columnsFields}
        mapValues={(data) => data}
        handleUpdate={handleChange}
        handleSelection={(data) => {}}
        isMultiSelection={false}
      />
    </MainModal>
  );
}
