import React, { useState } from 'react';

import SelectorView from '@monostruct/common/components/SelectorView';
import ItemAPI from '@monostruct/common/api/items.api';
import { columnsFields } from '@monostruct/common/constants/item';
import ProductOptions from './productOptions';
import { mapItems } from '../../../utils/mapper';
import get from 'lodash/get';
import SubHeaderWithArrow from 'src/components/SubHeaderWithArrow';

export default function Products({ clientId, handleClientUpdate, clientData }) {
  const [selectedProduct, setSelectedProduct] = useState({});

  const fetchSelectedList = () => {
    return new Promise((resole, reject) => {
      resole(get(clientData, 'linked_items', []));
    });
  };

  return (
    <div>
      {Object.keys(selectedProduct).length > 0 ? (
        <>
          <SubHeaderWithArrow
            title={`Configure Product: ${selectedProduct.name}`}
          />
          <ProductOptions />
        </>
      ) : (
        <>
          <SelectorView
            title={'Product'}
            fetchList={ItemAPI.getItemsAPI}
            fetchSelectedList={fetchSelectedList}
            fields={columnsFields}
            mapValues={mapItems}
            handleUpdate={(data) =>
              handleClientUpdate({
                ...clientData,
                linked_items: data,
              })
            }
            handleSelection={(data) => setSelectedProduct(data)}
          />
        </>
      )}
    </div>
  );
}
