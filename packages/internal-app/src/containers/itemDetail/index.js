import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ItemAPI from '@monostruct/common/api/items.api';
import get from 'lodash/get';
import ItemDetail from './ItemDetail';
import LoadingModal from '@monostruct/common/components/LoadingModal';
import { NEW_ITEM, getFromSessionStorage } from '../../utils/usefulHelpers';

export default function ItemDetailMain() {
  let { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [itemValue, setItemValue] = useState(null);

  useEffect(() => {
    ItemAPI.getItemsAPI(`id=${id}`)
      .then((itemDetailResponse) => {
        if (get(itemDetailResponse, 'data[0]')) {
          setItemValue(get(itemDetailResponse, 'data[0]'));
        } else {
          setValueFromStore();
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setValueFromStore();
      });
  }, []);

  const setValueFromStore = () => {
    if (getFromSessionStorage(NEW_ITEM)) {
      setItemValue(getFromSessionStorage(NEW_ITEM));
    }
  };

  if (isLoading) {
    return <LoadingModal isLoading={true} />;
  }
  return <ItemDetail itemValue={itemValue} />;
}
