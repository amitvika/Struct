import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

import SelectorView from '@monostruct/common/components/SelectorView';
import ItemAPI from '@monostruct/common/api/items.api';

// import { columnsFields } from '@monostruct/common/constants/item'
import { mapItems } from '../../../utils/mapper';
import get from 'lodash/get';
import { useParams, useHistory } from 'react-router-dom';
import { Link } from '@mui/material';
import { useQuery } from 'src/utils/customHooks';
import ProductOption from './ProductOptions';

export default function IncomingVendorProducts({ setVendorInfo, vendorInfo }) {
  const { id } = useParams();
  let query = useQuery();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);

  const columnsFields = [
    { title: 'ID', field: 'id', editable: 'never', align: 'center' },
    { title: 'Name', field: 'name', type: 'text' },
    { title: 'Source', field: 'source' },
    { title: 'Assembly type', field: 'assemblyType' },
    {
      title: 'Identification',
      editable: 'never',
      type: 'href',
      render: (rowData) =>
        rowData && (
          <span
            style={{ cursor: 'pointer' }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Link> Identification </Link>
          </span>
        )
    }
  ];

  const fetchSelectedList = () => {
    return new Promise((resolve, reject) => {
      resolve(get(vendorInfo, 'suppliedItems', []));
    });
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  const handleSelection = (data) => {
    history.push(`/vendors/${id}?tab=1&item_id=${data.id}&p_name=${data.name}`);
  };
  if (query.get('item_id')) {
    return (
      <ProductOption
        productId={query.get('item_id')}
        productName={query.get('p_name')}
      />
    );
  } else {
    return (
      <SelectorView
        title={'Product'}
        fetchList={ItemAPI.getItemsAPI}
        fetchSelectedList={fetchSelectedList}
        fields={columnsFields}
        mapValues={mapItems}
        handleUpdate={(data) =>
          setVendorInfo({
            ...vendorInfo,
            suppliedItems: data
          })
        }
        handleSelection={handleSelection}
      />
    );
  }
}
