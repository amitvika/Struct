import React from 'react';

import DetailComponentTab from './DetailComponentTab';
import DetailComponentHeader from './DetailComponentHeader';
import AddDesign from './AddDesignForm';

export default function DetailPage({ tabList, title }) {
  return (
    <>
      <DetailComponentHeader {...{ title }} />
      <AddDesign />
      {tabList && <DetailComponentTab {...{ tabList }} />}
    </>
  );
}
