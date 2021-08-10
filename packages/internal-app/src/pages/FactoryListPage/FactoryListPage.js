import React from "react";
import { useParams, useHistory } from "react-router-dom";

import FactoriesAPI from '@ravibasil/common/api/factories.api';

import { columnsFields } from '@ravibasil/common/constants/factory';
import TableGridView from '@ravibasil/common/components/TableGridView';

const FactoryListPage = () => {
    let { id: factory_id } = useParams();
    let history = useHistory();

    const handleItemClick = (id) => history.push(`/factories/${id}`);

    return (
        <TableGridView
            title={'Factory'}
            fields={columnsFields}
            fetchList={() => FactoriesAPI.fetchFactories()}
            upsertListItem={(value) => FactoriesAPI.upsertFactoryApi({ ...value, factory_id })}
            handleItemClick={handleItemClick}
        />
    );
}

export default FactoryListPage;
