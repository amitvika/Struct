import React, { useState, useEffect } from 'react'
import OperationAccess from "./OperationAccess";
import ClientBasedAccess from "./ClientBasedAccess";
import ClientAPI from '../../../api/clients.api';
import AccessSetupAPI from '../../../api/accessSetup.api';
import get from 'lodash/get';

import ClientObjectAccess from './ClientObjectAccess';
import ProcessGroupObjectAccess from './ProcessGroupObjectAccess';
import ItemObjectAccess from './ItemObjectAccess';
import ProcessObjectAccess from './ProcessObjectAccess';

export default function MyAccess() {
    const [clientList, setClientList] = useState([]);
    const [myAccess, setMyAccess] = useState({});

    useEffect(() => {
        fetchData()
        return () => {
        }
    }, []);

    const fetchData = async () => {
        try {

            const accessRes = await AccessSetupAPI.fetchMyAccess();
            setMyAccess(get(accessRes, 'data', {}))

            const clientRes = await ClientAPI.fetchClientsApi()

            setClientList(get(clientRes, 'data', []));
        }
        catch (err) {
            console.log(err)
        }

    }

    return (
        <div>
            <OperationAccess {...myAccess} />

            <div className="mb-2"> </div>

            <ClientBasedAccess
                access={myAccess}
                clientList={clientList}
            />

            <div className="mb-2"></div>
            <ClientObjectAccess
                {...myAccess}
            />

            <div className="mb-2"></div>
            <ProcessGroupObjectAccess
                {...myAccess} />

            <div className="mb-2"></div>
            <ItemObjectAccess
                {...myAccess} />

            <div className="mb-2"></div>
            <ProcessObjectAccess
                {...myAccess} />
        </div>
    )
}
