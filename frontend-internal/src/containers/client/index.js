import React, { useState, useEffect } from "react";

import ClientAPI from '../../api/clients.api';
import { columnsFields } from '../../constants/client'
import TableGridView from '../../components/TableGridView';
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
