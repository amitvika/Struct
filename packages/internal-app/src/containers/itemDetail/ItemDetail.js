import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Paper, Tab, Tabs, Grid } from '@material-ui/core';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import BaseItemProperties from './baseItemProperties';
import GeometricDimensioning from './geometricDimensioning';
import CurrentUsage from './currentUsage';
import VendorDetails from './VendorDetails';
import ManufactureProcessingProcessSimulation from '@monostruct/common/containers/ManufactureProcessingProcessSimulation';
import ClientSetup from './clientSetup';
import Assembly from './assembly';
import Production from './production';
import SurfaceFinishAndTreatment from './SurfaceFinishAndTreatment';
import ComplianceAndCertifications from './ComplianceAndCertifications';

import ItemTypeConfigurations from '../itemTypeConfigurations';
import ItemAPI from '@monostruct/common/api/items.api';

import {
  SELECTFEATURE,
  PROCESSINGSTATUS
} from '@monostruct/common/gltf/Tree/utils';

import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import get from 'lodash/get';
import { useQuery } from '../../utils/customHooks';
import './style.css';
import LoadingModal from '@monostruct/common/components/LoadingModal';

import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import Classification from '../classification';
import ProductDesignSetup from '../productDesignSetup';
import DetailComponentInnerHeader from '@monostruct/common/components/DetailComponentInnerHeader';

import {
  handleInternalUseProduct,
  handleProductDesignTab,
  setOrder,
  handleOtherTabCase,
  isOKToParseForProductDesignTab,
  isOKToParseForInternalUseProduct,
  isOKToParseForOtherTab,
  fetchGLTFAndTree,
  getOKTOParseForSetOrder
} from './ItemDetails.helper';

let state_additionalSaveFunction = null;
const ItemDetail = ({ itemValue }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  let { id } = useParams();
  let query = useQuery();

  const [tabIndex, setTabIndex] = useState('pdcu');
  const [itemProperties, setItemProperties] = useState(itemValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [gltfjson, setgltfjson] = useState({});
  const [percentage, setPercentage] = useState(0);
  const [currentProgressText, setCurrentProgressText] = useState(null);
  const [completionProgressText, setCompletionProgressText] = useState(null);
  const [centerActionText, setCenterActionText] = useState(null);
  const [progressBarLoad, setProgressBarLoad] = useState(false);
  const [internalProductConfig, setInternalProductConfig] = useState(null);
  const [selectedOption, setSelectedOption] = useState(SELECTFEATURE);
  const [allowFirstLevelItems, setAllowFirstLevelItems] = useState(false);
  const [createAutoAssemblyOrder, setCreateAutoAssemblyOrder] = useState(false);
  const [createAutoStackability, setCreateAutoStackability] = useState(false);
  const parserNeeded = ['pdcu', 'gdtac', 'iupc', 'assembly'];

  useEffect(() => {
    let myTabIndex = 'pdcu';
    if (query.get('tab')) {
      myTabIndex = query.get('tab');
      setTabIndex(myTabIndex);
    }

    handleGLTFAndTreeLoading({ item: itemValue, myTabedIndex: myTabIndex });
  }, [tabIndex]);

  useEffect(() => {
    CriteriaUploadAPI.fetchCriteriaUpload(
      `type=Internal Use Product Configuration`
    )
      .then((resp) => {
        if (get(resp, 'data[0]')) {
          setInternalProductConfig(get(resp, 'data[0]'));
        }
      })
      .catch((error) => {});
  }, []);

  const handleGLTFAndTreeLoading = ({ item, myTabedIndex }) => {
    if (
      myTabedIndex !== tabIndex ||
      (!item.fileId && !item.fileUUId) ||
      !parserNeeded.includes(myTabedIndex)
    ) {
      return;
    }

    setGLTFAndTree({ item, myTabedIndex });
  };

  const setGLTFAndTree = async ({ item, myTabedIndex }) => {
    try {
      let updatedItemProp = {};

      let myTabIndex =
        myTabedIndex === 'iupc' || myTabedIndex === 'pdcu'
          ? 'gdtac'
          : myTabedIndex;

      const gltfParam = {
        myTabIndex: myTabIndex,
        fileStore: item.fileStore,
        fileGDT: item.fileGDT,
        fileMPPS: item.fileMPPS,
        fileStack: item.fileStack,
        fileKinematic: item.fileKinematic,
        fileUUId: item.fileUUId,
        setIsLoading,
        setProgressBarLoad,
        percentage,
        setPercentage,
        setCurrentProgressText,
        setCompletionProgressText,
        setgltfjson
      };

      if (myTabIndex === 'iupc') {
        if (!item.fileKinematic || item.fileKinematic === null) {
          updatedItemProp = await handleInternalUseProduct({
            item,
            myTabedIndex,
            myTabIndex,
            setgltfjson
          });
        } else {
          let okToParse = await isOKToParseForInternalUseProduct({ item });

          await fetchGLTFAndTree({
            ...gltfParam,
            okToParse
          });
        }
      } else if (myTabIndex === 'pdcu') {
        const okToParse = await isOKToParseForProductDesignTab({ item });

        if (
          okToParse > PROCESSINGSTATUS.INPROGRESS ||
          !item.fileStore ||
          item.fileStore === null
        ) {
          updatedItemProp = await handleProductDesignTab({
            item,
            myTabedIndex,
            myTabIndex,
            setIsLoading,
            setIsFileLoading,
            setProgressBarLoad,
            allowFirstLevelItems,
            createAutoAssemblyOrder,
            createAutoStackability,
            percentage,
            setPercentage,
            setCurrentProgressText,
            setCompletionProgressText,
            setgltfjson
          });
        } else {
          await fetchGLTFAndTree({
            ...gltfParam,
            okToParse
          });
        }
      } else {
        if (!item.fileGDT || item.fileGDT === null) {
          updatedItemProp = await handleOtherTabCase({
            item,
            myTabedIndex,
            myTabIndex,
            setIsLoading,
            setIsFileLoading,
            setProgressBarLoad,
            allowFirstLevelItems,
            createAutoAssemblyOrder,
            createAutoStackability,
            setPercentage,
            percentage,
            setCurrentProgressText,
            setCompletionProgressText,
            setgltfjson,
            setItemProperties
          });
        } else {
          let okToParse = await isOKToParseForOtherTab({ item });
          await fetchGLTFAndTree({
            ...gltfParam,
            okToParse
          });
        }
      }

      setItemProperties((prev) => ({ ...prev, updatedItemProp }));
      handleSave(updatedItemProp);
    } catch (error) {
      console.log('Error', error);
    }
    setIsLoading(false);
    setIsFileLoading(false);
    setProgressBarLoad(false);
  };

  const additionalSaveFunction = (saveFunction) => {
    state_additionalSaveFunction = saveFunction;
  };

  const handleSetOrder = async (item) => {
    if (!item.fileId && !item.fileUUId) {
      return;
    }

    if (!item.fileMPPS || item.fileMPPS === null) {
      setOrder({
        item,
        setIsLoading,
        setIsFileLoading,
        setProgressBarLoad,
        setPercentage,
        percentage,
        setCurrentProgressText,
        setCompletionProgressText,
        setgltfjson,
        setItemProperties
      });
    } else {
      let okToParse = await getOKTOParseForSetOrder({ item });
      fetchGLTFAndTree(
        'mpps',
        item.fileStore,
        item.fileGDT,
        item.fileMPPS,
        item.fileStack,
        item.fileKinematic,
        item.fileUUId,
        okToParse
      );
      if (itemProperties.fileMPPS != item.fileMPPS) {
        setItemProperties((prevData) => ({
          ...prevData,
          fileMPPS: item.fileMPPS
        }));
      }
    }
  };

  const renderPageSwitch = () => {
    if (!get(itemProperties, 'id') && !id) {
      return null;
    }
    if (tabIndex != 'gdtac' && tabIndex != 'iupc' && tabIndex != 'mpps') {
      additionalSaveFunction(null);
    }
    switch (tabIndex) {
      case 0:
        return 'Add vendor items here';
      case 'cf':
        return <Classification handleItemUpdateLocallay={handleItemUpdate} />;
      case 'pdcu':
        return (
          <BaseItemProperties
            itemId={id}
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
            gltfjson={gltfjson}
            setgltfjson={setgltfjson}
            tabIndex={tabIndex}
            setTabIndex={setTabIndex}
            handleItemUpdateLocallay={handleItemUpdate}
            handleItemSaveOnServer={handleSave}
            progressBarLoad={progressBarLoad}
            percentage={percentage}
            currentProgressText={currentProgressText}
            completionProgressText={completionProgressText}
            centerActionText={centerActionText}
            //setProgressBarRender={setProgressBarRender}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            drawLine={
              /* checkDBNull(itemProperties.drawLine)
                ? true
                : */ itemProperties.drawLine
            }
            distanceGap={
              /* checkDBNull(itemProperties.drawLine)
                ? STATEPROPS.distancegap
                :  */ itemProperties.distanceGap
            }
            angleGap={
              /* checkDBNull(itemProperties.drawLine)
                ? STATEPROPS.anglegap
                : */ itemProperties.angleGap
            }
            allowFirstLevelItems={allowFirstLevelItems}
            setAllowFirstLevelItems={setAllowFirstLevelItems}
            createAutoAssemblyOrder={createAutoAssemblyOrder}
            setCreateAutoAssemblyOrder={setCreateAutoAssemblyOrder}
            createAutoStackability={createAutoStackability}
            setCreateAutoStackability={setCreateAutoStackability}
          />
        );
      case 'cu':
        return <CurrentUsage itemId={id} />;
      case 'gdtac':
        return (
          <GeometricDimensioning
            fileId={itemProperties.fileId}
            fileGDT={itemProperties.fileGDT}
            fileUUId={itemProperties.fileUUId}
            gltfjson={gltfjson}
            isLoading={isLoading}
            //assemblyTree={get(gltfjson, 'tree', [])}
            tabIndex={tabIndex}
            keyName={{ name: '', option: SELECTFEATURE }}
            handleChangeOfSelection={null}
            additionalSaveFunction={additionalSaveFunction}
            progressBarLoad={progressBarLoad}
            percentage={percentage}
            currentProgressText={currentProgressText}
            completionProgressText={completionProgressText}
            centerActionText={centerActionText}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            //setProgressBarRender={setProgressBarRender}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            drawLine={
              /* checkDBNull(itemProperties.drawLine)
                ? true
                :  */ itemProperties.drawLine
            }
            {...{ internalProductConfig }}
          />
        );
      case 'iupc':
        return (
          <ItemTypeConfigurations
            itemId={id}
            fileId={itemProperties.fileId}
            fileUUId={itemProperties.fileUUId}
            fileGDT={itemProperties.fileGDT}
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
            gltfjson={gltfjson}
            setgltfjson={setgltfjson}
            isLoading={isLoading}
            handleItemUpdate={handleItemUpdate}
            tabIndex={tabIndex}
            additionalSaveFunction={additionalSaveFunction}
            progressBarLoad={progressBarLoad}
            percentage={percentage}
            currentProgressText={currentProgressText}
            completionProgressText={completionProgressText}
            centerActionText={centerActionText}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            //setProgressBarRender={setProgressBarRender}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            internalProductConfig={internalProductConfig}
            drawLine={
              /* checkDBNull(itemProperties.drawLine)
                ? true
                : */ itemProperties.drawLine
            }
          />
        );
      case 5:
        return <VendorDetails />;
      case 'mpps':
        return (
          <ManufactureProcessingProcessSimulation
            itemId={id}
            fileId={itemProperties.fileId}
            fileUUId={itemProperties.fileUUId}
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
            fetchList={ItemAPI.getItemsAPI}
            // setStack={setStack}
            setOrder={handleSetOrder}
            gltfjson={gltfjson}
            isLoading={isLoading}
            additionalSaveFunction={additionalSaveFunction}
            progressBarLoad={progressBarLoad}
            percentage={percentage}
            currentProgressText={currentProgressText}
            completionProgressText={completionProgressText}
            centerActionText={centerActionText}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            //setProgressBarRender={setProgressBarRender}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            drawLine={
              /* checkDBNull(itemProperties.drawLine)
                ? true
                :  */ itemProperties.drawLine
            }
          />
        );
      case 7:
        return (
          <ClientSetup
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
          />
        );
      case 'assembly':
        return <Assembly assemblyTree={get(gltfjson, 'tree', [])} />;
      case 'production':
        return <Production />;
      case 'sft':
        return <SurfaceFinishAndTreatment />;
      case 'cc':
        return (
          <ComplianceAndCertifications
            itemValue={itemProperties}
            setItemValue={setItemProperties}
          />
        );
      case 'fls':
        return 'Functional Load and Simulation';
      case 'dm':
        return 'Design Modifications';
      case 'slfpi':
        return 'Software Loading for PCBs, ICs';
      case 'pv':
        return 'Production Validations';
      case 'ps':
        return 'Process Sharing';
      case 'wmm':
        return 'Warranty & Maintenance Management';
      case 'pd':
        return 'Product Documentation';
      case 'rs':
        return 'Recycling & Sustainability';
      case 'pds':
        return <ProductDesignSetup {...{ itemId: id, gltfjson }} />;
      default:
        return 'Undefined Tab Index';
    }
  };

  const handleItemUpdate = (change) => {
    let tempItemProperties = Object.assign({}, itemProperties, change);
    console.log(
      'Changing itemproperties in hanldeitemupdate',
      tempItemProperties
    );
    setItemProperties(tempItemProperties);
  };

  const handleSave = (change) => {
    itemProperties.step = undefined;
    itemProperties.gltfjson = undefined;
    itemProperties.itemId = undefined;

    let updateItemProperties = Object.assign({}, itemProperties, change);

    if (Object.keys(updateItemProperties).length === 0) {
      return;
    }

    ItemAPI.updateItemAPI(id, { ...updateItemProperties })
      .then((res) => {
        if (res && res.data) {
          console.log(
            'Changing item properties from handle save after UpdateItemAPI',
            res.data
          );
          setItemProperties(res.data);
          dispatch(showSuccessAlert({ message: 'Item Updated' }));
        } else {
          dispatch(showErrorAlert({ message: 'Unable to save info' }));
        }
      })
      .catch((error) => {
        dispatch(showErrorAlert({ message: 'Unable to save info' }));
      });
    try {
      if (state_additionalSaveFunction) {
        state_additionalSaveFunction();
      }
    } catch (error) {
      console.log('Error while saving', error);
    }
  };

  const handleTabChange = (event, newTabIndex) => {
    if (tabIndex !== newTabIndex) {
      console.log(tabIndex, newTabIndex);
      setIsLoading(true);
      setTabIndex(newTabIndex);
      history.push({
        pathname: `/items/${id}`,
        search: `?tab=${newTabIndex}`
      });
    }
  };

  const tabList = {
    pdcu: 'Product Design or CAD Upload',
    cf: 'Classification',
    cc: 'Compliance and Certifications',
    gdtac: 'GD&T and Assembly Constraints',
    sft: 'Surface Finish and Treatment',
    fls: 'Functional Load and Simulation',
    dm: 'Design Modifications',
    slfpi: 'Software Loading for PCBs, ICs',
    cu: 'Current Usage',
    mpps: 'Manufacture, Processing, & Process Simulation',
    pv: 'Production Validations',
    ps: 'Process Sharing',
    wmm: 'Warranty & Maintenance Management',
    pd: 'Product Documentation',
    rs: 'Recycling & Sustainability',
    pds: 'Product Design Setup',
    iupc: 'Internal Use Product Configurations',
    production: 'Production'
  };

  const renderTab = () => {
    let tabP = [];
    Object.keys(tabList).forEach((key, index) => {
      tabP.push(
        <Tab
          label={`${index + 1}. ${tabList[key]}`}
          value={key}
          key={key}
          style={{ textAlign: 'left', minHeight: '30px' }}
        />
      );
    });
    return tabP;
  };

  return (
    <>
      {<LoadingModal isLoading={isFileLoading} />}
      <Grid container>
        <Grid item sm={12}>
          <DetailComponentInnerHeader
            {...{
              prefix: 'Item',
              name: itemProperties.name,
              id: itemProperties.id,
              handleSave,
              tabName: tabList[tabIndex],
              action: '/items',
              title: 'Items Details',
              allowEditTitle: true
            }}
          />
        </Grid>
      </Grid>
      <Grid container style={{ flexWrap: 'unset' }}>
        <TabContainer>
          <Tabs
            className="MuiTab-wrapper"
            orientation="vertical"
            variant="scrollable"
            value={tabIndex}
            onChange={handleTabChange}
          >
            {renderTab()}
          </Tabs>
        </TabContainer>
        <TabPanelContainer>{renderPageSwitch()}</TabPanelContainer>
      </Grid>
      <Snackbar
        style={{
          left: '10%'
        }}
        open={true}
      >
        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={() => handleSave()}
        >
          Save
        </Button>
      </Snackbar>
    </>
  );
};

export default ItemDetail;
