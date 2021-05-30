import React, { useState, useEffect } from "react";

import AccessSetupAPI from '../../api/accessSetup.api';
import { columnsFields } from '../../constants/client'
import TableGridView from '../../components/TableGridView';

const Client = () => {

    return (
        <TableGridView
            title={'Client'}
            fields={columnsFields}
            fetchList={AccessSetupAPI.fetchAccessSetup}
            upsertListItem={AccessSetupAPI.upsertAccessSetup}
        />
    );
}

export default Client;
