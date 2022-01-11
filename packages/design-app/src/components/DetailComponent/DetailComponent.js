import React, { useState, useEffect } from 'react';

import DetailComponentTab from './DetailComponentTab';
import DetailComponentHeader from './DetailComponentHeader';
import { useParams, useHistory } from 'react-router-dom';

export default function DetailPage({
  tabList,
  title,
  isAddDesignVisible = true,
  handleSave,
  itemValue,
  setItemValue,
  changeUrlOnTabChange,
  urlPathname
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

      {tabList && (
        <DetailComponentTab
          {...{ tabList, changeUrlOnTabChange, urlPathname }}
        />
      )}
    </>
  );
}
