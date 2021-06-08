import React from "react";

import TableGridView from '@ravibasil/common/components/TableGridView';
import ClientAPI from '@ravibasil/common/api/clients.api';
import { columnsFields } from '../../constants/client'
import { useHistory } from "react-router-dom";

const Client = () => {
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
            isAddEditLinkVisible ={ true}
        />
    );
}

export default Client;
