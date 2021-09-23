import React, { useState } from 'react';
import GridView from '@monostruct/common/components/TableGridView/GridView';

export default function Styles() {
  const filteredItemList = ['1', '2', '3'];
  const columnsFields = [
    { title: 'Name', field: 'name', type: 'text' },
    { title: 'Template', field: 'template', type: 'text' },
  ];

  return (
    <div>
      <GridView
        list={filteredItemList}
        handleHistoryToggle={false}
        columnsFields={columnsFields}
        handleTableRowClick={false}
        isAddEditLinkVisible={false}
        handleEditButtonPress={false}
      />
    </div>
  );
}
