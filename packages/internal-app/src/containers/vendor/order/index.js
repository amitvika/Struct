import React,{useState} from "react";

import TableGridView from '@ravibasil/common/components/TableGridView';
import ClientAPI from '@ravibasil/common/api/clients.api';
// import { columnsFields } from '@ravibasil/common/constants/vendorProduct'
import { useHistory } from "react-router-dom";
import Link from '@material-ui/core/Link';

import IdentificationModal from  "../suppliedItems/identificationModal"

const Orders = () => {
    let history = useHistory();
    const handleItemClick = (id) => history.push(`/clients/${id}`);
    const [isModalOpened, setIsModalOpened] = React.useState(false);
    const [selectedValue, setSelectedValue] = useState({});


    const columnsFields = [
        { title: "ID", field: "id", editable: "never", align: 'center' },
        { title: "Estimated Delivery Date", field: "estimatedDeliveryDate", type: 'numeric' },
        {
            title: "Item Quantity",
            field: "itemQuantity",
            // editable: "never"
            type: 'numeric'
        },
        { title: "Unit Cost", field: "unitCost", type: 'numeric' },
        {
            title: 'Identification',
            field: "id",
            editable: "never",
            isFilterColumn: false,
            isGridViewVisible: false,
            render: rowData => rowData && <span style={{ cursor: 'pointer' }}
                onClick={(event) => {
                    handleIdentificationClick(event, rowData)

                    event.stopPropagation();
                }}><Link> Identification </Link></span>
        },
    ]

    const handleIdentificationClick = (event, rowData) => {
        if (rowData.factory_id) {
            history.push(`/clients/${rowData.factory_id}`)
            return;
        }

        event.stopPropagation();
        toggleModal(rowData)
    }

    const toggleModal = (data) => {
        if (!isModalOpened) {
            setSelectedValue(data);
        }
        else {
            setSelectedValue({});
        }

        setIsModalOpened(!isModalOpened);
    }
    return (
        <>
            {
                isModalOpened &&
                <IdentificationModal
                    isModalOpened={isModalOpened}
                    toggleModal={toggleModal}
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                    // assignFactory={assignFactory}
                    quantity={true}
                    // fields={columns} 
                    />
            }
            <TableGridView
                title={'Orders'}
                fields={columnsFields}
                fetchList={ClientAPI.fetchClientsApi}
                upsertListItem={ClientAPI.upsertClient}
                isAddEditActionsEnabled={true}
                handleItemClick={handleItemClick}
                isAddEditLinkVisible={true}
                toggleModal={handleIdentificationClick}

            />
        </>
    );
}

export default Orders;

