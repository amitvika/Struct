import React from 'react';

import DetailComponentTab from './DetailComponentTab';
import DetailComponentHeader from './DetailComponentHeader';
import AddDesign from './AddDesignForm';

export default function DetailPage({
  tabList,
  title,
  isAddDesignVisible = true,
}) {
  return (
    <>
      <DetailComponentHeader {...{ title }} />
      {isAddDesignVisible && <AddDesign />}
      {tabList && <DetailComponentTab {...{ tabList }} />}
    </>
  );
}
