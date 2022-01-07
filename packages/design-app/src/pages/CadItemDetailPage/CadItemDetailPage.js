import React, { useState, useEffect } from 'react';
import ItemsAPI from '@monostruct/common/api/items.api';
import get from 'lodash/get';
import MaterialTab from '@monostruct/common/containers/MaterialTab/MaterialTab';
import ClassificationTab from '@monostruct/common/containers/ClassificationTab';
import './style.css';

import { useQuery } from '@monostruct/common/utils/customHooks';

import DetailPage from '../../components/DetailComponent/DetailComponent';

const CadMaker = () => {
  let query = useQuery();

  const [isLoading, setIsLoading] = useState(true);
  const [itemValue, setItemValue] = useState({});

  useEffect(() => {
    if (!query.get('id')) {
      return;
    }

    setIsLoading(true);
    ItemsAPI.getItemsAPI(`id=${query.get('id')}`)
      .then((itemDetailResponse) => {
        setItemValue(get(itemDetailResponse, 'data[0]', {}));

        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  }, [query.get('id')]);

  const handleSave = (change) => {
    ItemsAPI.updateItemAPI(itemValue.id, {
      id: itemValue.id,
      ...change,
      item_type: 'CAD'
    })
      .then((res) => {
        setItemValue(get(res, 'data', {}));
      })
      .catch();
  };

  const getTabs = () => {
    return [
      {
        tabName: 'CAD or Upload/Customize CAD File'
        // tabContent: BaseItemProperties
      },
      {
        tabName: 'Materials',
        tabContent: MaterialTab,
        tabProps: {
          itemProperties: itemValue,
          setItemProperties: setItemValue
        }
      },
      {
        tabName: 'GD&T And Assembly Constraints'
      },
      {
        tabName: 'Surface Finish and Treatment'
      },
      {
        tabName: 'Assembly'
      },
      {
        tabName: 'Classification',
        tabContent: ClassificationTab,
        tabProps: {
          handleSave
        }
      },
      {
        tabName: 'Functional Load and Simulation'
      },
      {
        tabName: 'Design Modifications'
      },
      {
        tabName: 'Manufacturing'
      },
      {
        tabName: 'Recycling and Sustainability'
      },
      {
        tabName: 'Assembly'
      },
      {
        tabName: 'Item Report'
      },
      {
        tabName: 'Make Item Configurable/Customizable'
      }
    ];
  };

  return (
    <DetailPage
      title={'CAD Design'}
      tabList={getTabs()}
      isAddDesignVisible={true}
      {...{ handleSave, itemValue, setItemValue }}
    />
  );
};

export default CadMaker;
