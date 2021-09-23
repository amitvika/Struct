import React, { useState } from 'react';

import TableGridView from '@monostruct/common/components/TableGridView';
import ItemsAPI from '@monostruct/common/api/items.api';
import { useHistory } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import DatePickerForMT from '@monostruct/common/components/DatePickerForMT';
import moment from 'moment';
import IdentificationModal from './identificationModal';
import { useQuery } from '../../../utils/customHooks';

const Orders = () => {
  let history = useHistory();
  let query = useQuery();

  const [isModalOpened, setIsModalOpened] = useState(false);
  const [selectedValue, setSelectedValue] = useState({});

  const handleItemClick = (id) => history.push(`/clients/${id}`);

  const columnsFields = [
    { title: 'ID', field: 'id', editable: 'never', align: 'center' },

    {
      title: 'Estimated Delivery Date',
      field: 'estimated_delivery_date',
      type: 'date',
      render: (rowData) => moment(rowData.start_date).format('DD/MM/YYYY'),
      editComponent: (props) => <DatePickerForMT {...props} />,
    },
    {
      title: 'Item Quantity',
      field: 'item_quantity',
      type: 'numeric',
      isFilterColumn: false,
    },
    {
      title: 'Unit Cost',
      field: 'unit_cost',
      type: 'numeric',
      isFilterColumn: false,
    },
    {
      title: 'Identification',
      field: 'id_',
      editable: 'never',
      isLink: true,
      isFilterColumn: false,
      onClick: (event, rowData) => {
        event.stopPropagation();
        toggleModal(rowData);
      },
      // isGridViewVisible: false,
      render: (rowData) =>
        rowData && (
          <span
            style={{ cursor: 'pointer' }}
            onClick={(event) => {
              handleIdentificationClick(event, rowData);
            }}
          >
            <Link style={{ fontWeight: 'bold' }}> Identification </Link>
          </span>
        ),
    },
  ];

  const handleIdentificationClick = (event, rowData) => {
    event.stopPropagation();
    toggleModal(rowData);
  };

  const toggleModal = (data) => {
    if (!isModalOpened) {
      setSelectedValue(data);
    } else {
      setSelectedValue({});
    }

    setIsModalOpened(!isModalOpened);
  };

  return (
    <>
      {isModalOpened && (
        <IdentificationModal
          isModalOpened={isModalOpened}
          toggleModal={toggleModal}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
          quantity={true}
        />
      )}
      <TableGridView
        title={'Orders'}
        fields={columnsFields}
        fetchList={() =>
          ItemsAPI.getItemOrders(`item_id=${query.get('item_id')}`)
        }
        upsertListItem={(data) =>
          ItemsAPI.upsertItemOrder({ ...data, item_id: query.get('item_id') })
        }
        isAddEditActionsEnabled={true}
        handleItemClick={handleItemClick}
        isAddEditLinkVisible={true}
        toggleModal={handleIdentificationClick}
      />
    </>
  );
};

export default Orders;
