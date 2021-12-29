import React from 'react';

import DetailComponentTab from './DetailComponentTab';
import DetailComponentHeader from './DetailComponentHeader';

export default function DetailPage({
  tabList,
  title,
  type,
  isAddDesignVisible = true
}) {
  return (
    <>
      <DetailComponentHeader {...{ title, isAddDesignVisible }} />

      {tabList && <DetailComponentTab {...{ tabList }} />}
    </>
  );
}
