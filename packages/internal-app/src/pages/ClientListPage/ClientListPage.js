import React from 'react';

import TableGridView from '@monostruct/common/components/TableGridView';
import ClientAPI from '@monostruct/common/api/clients.api';
import { columnsFields } from '@monostruct/common/constants/client';
import { useHistory } from 'react-router-dom';

const ClientListPage = () => {
  let history = useHistory();
  const handleItemClick = (id) => history.push(`/clients/${id}`);

  return (
    <TableGridView
      title={'Client'}
      fields={columnsFields}
      fetchList={ClientAPI.fetchClientsApi}
      upsertListItem={ClientAPI.upsertClient}
      isAddEditActionsEnabled={true}
      handleItemClick={handleItemClick}
      isAddEditLinkVisible={true}
    />
  );
};

export default ClientListPage;
