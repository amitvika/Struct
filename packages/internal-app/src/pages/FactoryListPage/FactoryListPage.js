import React from 'react';
import { useParams, useHistory } from 'react-router-dom';

import FactoriesAPI from '@monostruct/common/api/factories.api';

import { columnsFields } from '@monostruct/common/constants/factory';
import TableGridView from '@monostruct/common/components/TableGridView';

const FactoryListPage = () => {
  let { id: factory_id } = useParams();
  let history = useHistory();

  const handleItemClick = (id) => history.push(`/factories/${id}`);

  return (
    <TableGridView
      title={'Factory'}
      fields={columnsFields}
      fetchList={FactoriesAPI.fetchFactories}
      upsertListItem={(value) =>
        FactoriesAPI.upsertFactoryApi({ ...value, factory_id })
      }
      handleItemClick={handleItemClick}
      isEditLinkVisible={false}
    />
  );
};

export default FactoryListPage;
