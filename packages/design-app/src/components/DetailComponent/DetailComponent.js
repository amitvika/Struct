import React, { useState, useEffect } from 'react';

import DetailComponentTab from './DetailComponentTab';
import DetailComponentHeader from './DetailComponentHeader';
import ItemsAPI from '@monostruct/common/api/items.api';
import get from 'lodash/get';
import { useQuery } from '@monostruct/common/utils/customHooks';

export default function DetailPage({
  tabList,
  title,
  type,
  isAddDesignVisible = true
}) {
  let query = useQuery();

  const [isLoading, setIsLoading] = useState(true);
  const [itemValue, setItemValue] = useState({});

  useEffect(() => {
    if (!query.get('id')) {
      return;
    }

    setIsLoading(true);
    ItemsAPI.getItemsAPI(`id=${query.get('id')}`)
      .then((itemDetailResponse) => {
        setItemValue(get(itemDetailResponse, 'data[0]', {}));

        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  }, [query.get('id')]);

  const handleSaveProductDesignItem = (change) => {
    ItemsAPI.updateItemAPI(itemValue.id, {
      id: itemValue.id,
      ...change,
      item_type: type
    })
      .then((res) => {
        setItemValue(get(res, 'data', {}));
      })
      .catch();
  };

  return (
    <>
      <DetailComponentHeader
        {...{
          title,
          isAddDesignVisible,
          handleSaveProductDesignItem,
          itemValue,
          setItemValue
        }}
      />

      {tabList && <DetailComponentTab {...{ tabList }} />}
    </>
  );
}
