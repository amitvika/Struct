import React, { useState, useEffect } from 'react';

import DetailComponentTab from './DetailComponentTab';
import DetailComponentHeader from './DetailComponentHeader';
import ProductDesignAPI from '@monostruct/common/api/productDesign.api';
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
    ProductDesignAPI.fetchProductDesigns(`id=${query.get('id')}`)
      .then((itemDetailResponse) => {
        setItemValue(get(itemDetailResponse, 'data[0]', {}));
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  }, [query.get('id')]);

  const handleSaveProductDesignItem = (change) => {
    ProductDesignAPI.upsertProductDesign({ id: itemValue.id, ...change, type })
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
