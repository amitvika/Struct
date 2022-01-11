import React, { useState, useEffect, useContext } from 'react';
import { useQuery } from '@monostruct/common/utils/customHooks';
import ItemDetailHOC from '@monostruct/common/containers/ItemDetailHOC/ItemDetailHOC';

import ItemsAPI from '@monostruct/common/api/items.api';
import MaterialTab from '@monostruct/common/containers/MaterialTab/MaterialTab';
import ClassificationTab from '@monostruct/common/containers/ClassificationTab';
import AssemblyTab from '@monostruct/common/containers/AssemblyTab';

import DetailPage from '../../components/DetailComponent/DetailComponent';
import BaseItemProperties from '@monostruct/common/containers/BaseItemPropertiesTab';
import { AlertContext } from '@monostruct/common/context/AlertContext/AlertContext';
import GeometricDimensioning from '@monostruct/common/containers/GeometricDimensioningTab/GeometricDimensioningTab';

import get from 'lodash/get';
import './style.css';
const CadMakerItemDetail = (props) => {
  const {
    allowFirstLevelItems,
    setAllowFirstLevelItems,
    createAutoAssemblyOrder,
    setCreateAutoAssemblyOrder,
    activeGLTFFile,
    setActiveGLTFile,
    setCreateAutoStackability,
    createAutoStackability,
    selectedOption,
    setSelectedOption,
    setPercentage,
    setProgressBarLoad,
    setCurrentProgressText,
    setCompletionProgressText,
    setCenterActionText,
    progressBarLoad,
    percentage,
    currentProgressText,
    completionProgressText,
    centerActionText,
    gltfjson,
    setgltfjson,
    tabIndex,
    setTabIndex,
    itemValue,
    setItemValue,
    handleSave,
    activeGDTTable,
    setActiveGDTTable,
    drawAxisLines,
    setDrawAxisLines,
    internalProductConfig,
    isLoading,
    additionalSaveFunction,
    SELECTFEATURE
  } = props;

  const getTabs = () => {
    return [
      {
        tabName: 'CAD or Upload/Customize CAD File',
        tabContent: BaseItemProperties,
        tabProps: {
          itemProperties: itemValue,
          setItemProperties: setItemValue,
          allowFirstLevelItems,
          setAllowFirstLevelItems,
          createAutoAssemblyOrder,
          setCreateAutoAssemblyOrder,
          activeGLTFFile,
          setActiveGLTFile,
          setCreateAutoStackability,
          createAutoStackability,
          selectedOption,
          setSelectedOption,
          setPercentage,
          setProgressBarLoad,
          setCurrentProgressText,
          setCompletionProgressText,
          setCenterActionText,
          progressBarLoad,
          percentage,
          currentProgressText,
          completionProgressText,
          centerActionText,
          gltfjson,
          setgltfjson,
          tabIndex,
          setTabIndex
        }
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
        tabName: 'GD&T And Assembly Constraints',
        tabContent: GeometricDimensioning,
        tabProps: {
          fileId: itemValue.fileId,
          fileGDT: itemValue.fileGDT,
          fileUUId: itemValue.fileUUId,
          gltfjson,
          setgltfjson,
          isLoading,
          tabIndex,
          keyName: { name: '', option: SELECTFEATURE },
          handleChangeOfSelection: null,
          additionalSaveFunction,
          progressBarLoad,
          percentage,
          currentProgressText,
          completionProgressText,
          centerActionText,
          selectedOption,
          setSelectedOption,
          setPercentage,
          setProgressBarLoad,
          setCurrentProgressText,
          setCompletionProgressText,
          setCenterActionText,
          drawLine: itemValue.drawLine,
          additionalModelClick: null,
          activeGLTFFile,
          setActiveGLTFile,
          activeGDTTable,
          setActiveGDTTable,
          drawAxisLines,
          setDrawAxisLines,
          internalProductConfig
        }
      },
      {
        tabName: 'Surface Finish and Treatment'
      },
      {
        tabName: 'Assembly',
        tabContent: AssemblyTab,
        tabProps: {
          assemblyTree: get(gltfjson, 'tree', []),
          activeGLTFFile: activeGLTFFile,
          setActiveGLTFile: setActiveGLTFile
        }
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

  if (!itemValue) {
    return null;
  }

  return (
    <DetailPage
      title={'CAD Design'}
      tabList={getTabs()}
      isAddDesignVisible={true}
      {...{ handleSave, itemValue, setItemValue }}
    />
  );
};

const ItemDetailWrappper = ItemDetailHOC(CadMakerItemDetail);

const ItemDetailContainer = () => {
  const alertContext = useContext(AlertContext);
  let query = useQuery();

  const [isLoading, setIsLoading] = useState(true);

  const [itemValue, setItemValue] = useState({});

  const handleSave = (change) => {
    ItemsAPI.updateItemAPI(itemValue.id, {
      id: itemValue.id,
      ...change,
      item_type: 'CAD'
    })
      .then((res) => {
        setItemValue(get(res, 'data', {}));
      })
      .catch((error) => {
        // setItemValue((prev) => ({ ...prev, ...change }));
        if (get(error, 'response.status') === 401) {
          alertContext.openErrorAlert({ message: 'Not a valid user' });
        }
      });
  };

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

  return <ItemDetailWrappper {...{ itemValue, setItemValue, handleSave }} />;
};

export default ItemDetailContainer;
