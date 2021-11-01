import React from 'react';

import TableGridView from '@monostruct/common/components/TableGridView';
import API from '@monostruct/common/api/vendor.api';
// import { columnsFields } from '@monostruct/common/constants/client';
import { useHistory } from 'react-router-dom';
 
const columnsFields = ([
  { title: 'ID', field: 'id', editable: 'never', align: 'center' },
  { title: 'Name', field: 'name', type: 'text' }
]);

const VendorListPage = () => {
  let history = useHistory();
  const handleItemClick = (id) => history.push(`/vendors/${id}`);

  return (
    <TableGridView
      title={'Vendors'}
      fields={columnsFields}
      fetchList={API.getVendorsApi}
      upsertListItem={API.updateVendorApi}
      isAddEditActionsEnabled={true}
      handleItemClick={handleItemClick}
      isAddEditLinkVisible={true}
    />
  );
};

export default VendorListPage;
