import React, { useState } from 'react';
import Box from '@mui/material/Box';

import SelectorView from '@monostruct/common/components/SelectorView';
import ItemAPI from '@monostruct/common/api/items.api';
import { columnsFields } from '@monostruct/common/constants/item';
import ProductOptions from './ProductOptions';
import { mapItems } from '../../../utils/mapper';
import get from 'lodash/get';
import SubHeaderWithArrow from 'src/components/SubHeaderWithArrow';

import {
  CustomTabs,
  CustomTab
} from '@monostruct/common/components/CustomTabs/CustomTabs';

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
    tabIndex: index
  };
}
const AssignToClient = ({ clientId, handleClientUpdate, clientData }) => {
  const [selectedTabIndex, setCurrentSelectedTab] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState({});

  const fetchSelectedList = () => {
    return new Promise((resole, reject) => {
      resole(get(clientData, 'linked_items', []));
    });
  };
  const handleTabChange = (newValue) => {
    setCurrentSelectedTab(newValue);
  };

  return (
    <>
      <Box>
        <CustomTabs>
          <CustomTab
            label="Assign to Client(s)"
            {...{ handleTabChange, selectedTabIndex }}
            {...a11yProps(0)}
          />
          <CustomTab
            label="Used In Client Assemblies"
            {...{ handleTabChange, selectedTabIndex }}
            {...a11yProps(1)}
          />
        </CustomTabs>
      </Box>
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
                  linked_items: data
                })
              }
              handleSelection={(data) => setSelectedProduct(data)}
            />
          </>
        )}
      </div>
    </>
  );
};
export default React.memo(AssignToClient);
