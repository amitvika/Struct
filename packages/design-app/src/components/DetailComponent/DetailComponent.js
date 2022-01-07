import React, { useState, useEffect } from 'react';

import DetailComponentTab from './DetailComponentTab';
import DetailComponentHeader from './DetailComponentHeader';

import { useQuery } from '@monostruct/common/utils/customHooks';

export default function DetailPage({
  tabList,
  title,
  isAddDesignVisible = true,
  handleSave,
  itemValue,
  setItemValue
}) {
  return (
    <>
      <DetailComponentHeader
        {...{
          title,
          isAddDesignVisible,
          handleSave,
          itemValue,
          setItemValue
        }}
      />

      {tabList && <DetailComponentTab {...{ tabList }} />}
    </>
  );
}
