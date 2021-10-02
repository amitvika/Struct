import React from 'react';

import DetailComponentTab from './DetailComponentTab';
import DetailComponentHeader from './DetailComponentHeader';

export default function DetailPage({ tabList, title }) {
  return (
    <>
      <DetailComponentHeader {...{ title }} />
      {tabList.length > 0 && <DetailComponentTab {...{ tabList }} />}
    </>
  );
}
