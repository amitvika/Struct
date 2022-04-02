import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Tab, Tabs, Grid } from '@mui/material';
import { useParams, useHistory } from 'react-router-dom';

import BaseItemProperties from '@monostruct/common/containers/BaseItemPropertiesTab';
import GeometricDimensioning from '@monostruct/common/containers/GeometricDimensioningTab/GeometricDimensioningTab';
import CurrentUsage from './currentUsage';
import VendorDetails from './VendorDetails';
import ManufactureProcessingProcessSimulation from '@monostruct/common/containers/ManufactureProcessingProcessSimulation';
import ClientSetup from './clientSetup';
import AssemblyTabWithTree from '@monostruct/common/containers/AssemblyTabWithTree';
import Production from './production';
import SurfaceFinishAndTreatment from './SurfaceFinishAndTreatment';
import ComplianceAndCertifications from './ComplianceAndCertifications';

import ItemTypeConfigurations from '../itemTypeConfigurations';
import ItemAPI from '@monostruct/common/api/items.api';

import {
  SELECTFEATURE,
  PROCESSINGSTATUS
} from '@monostruct/common/gltf/Tree/utils';

import get from 'lodash/get';
import { useQuery } from '../../utils/customHooks';
import './style.css';
import LoadingModal from '@monostruct/common/components/LoadingModal';

import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import Classification from '@monostruct/common/containers/ClassificationTab';
import ProductDesignSetup from '../productDesignSetup';
import DetailComponentInnerHeader from '@monostruct/common/components/DetailComponentInnerHeader';
import { createChildItems } from '@monostruct/common/containers/BaseItemPropertiesTab/helper';

import {
  handleInternalUseProduct,
  handleProductDesignTab,
  setOrder,
  setStack,
  handleOtherTabCase,
  isOKToParseForProductDesignTab,
  isOKToParseForInternalUseProduct,
  isOKToParseForOtherTab,
  fetchGLTFAndTree,
  getOKTOParseForSetOrder
} from './ItemDetails.helper';
import MaterialTab from '@monostruct/common/containers/MaterialTab/MaterialTab';
import { getAFileFromStore } from '@monostruct/common/api/fileUpload.api';
import { AlertContext } from '@monostruct/common/context/AlertContext/AlertContextProvider';
import AssignToClient from './AssignToClient';
import SupplyingVendors from './SupplyingVendors';
import InstanceOfThisItem from './InstanceOfThisItem/InstanceOfThisItem';
import FeaturesTab from '../ItemFeaturesTab/FeaturesTab';

let state_additionalSaveFunction = null;
const ItemDetail = ({ itemValue }) => {
  const history = useHistory();
  let { id } = useParams();
  let query = useQuery();

  const alertContext = React.useContext(AlertContext);

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
  const [allowFirstLevelItems, setAllowFirstLevelItems] = useState(
    itemValue?.child_item_status === 'INITIATED'
  );
  const [createAutoAssemblyOrder, setCreateAutoAssemblyOrder] = useState(false);
  const [createAutoStackability, setCreateAutoStackability] = useState(false);
  const [showKinematicMove, setShowKinematicMove] = useState(false);
  const [showKinematicSliderMove, setShowKinematicSliderMove] = useState(false);
  const [regenerateKinematicMove, setRegenerateKinematicMove] = useState(0);
  const [kinematicItemList, setKinematicItemList] = useState([]);
  const [activeGLTFFile, setActiveGLTFileState] = useState('');
  const [activeGDTTable, setActiveGDTTable] = useState('');
  const [drawAxisLines, setDrawAxisLines] = useState(null);
  const parserNeeded = ['pdcu', 'gdtac', 'iupc', 'assembly'];

  /* useEffect(() => {
    if (itemValue) {
      setItemProperties(itemValue);
      setAllowFirstLevelItems(itemValue.child_item_status === 'INITIATED');
    }
  }, [itemValue]); */
  const setActiveGLTFile = (data) => {
    try {
      setActiveGDTTable(0);
    } catch (error) {}
    try {
      setActiveGLTFileState(data);
    } catch (error) {}
  };

  useEffect(() => {
    let myTabIndex = tabIndex ? tabIndex : 'pdcu';
    if (query.get('tab')) {
      myTabIndex = query.get('tab');
      setTabIndex(myTabIndex);
    }
    setAllowFirstLevelItems(itemProperties?.child_item_status === 'INITIATED');
    setActiveGLTFile('');
    console.log(
      'Started handleGLTFAndTreeLoading from useeffect tabindex',
      itemProperties,
      myTabIndex,
      tabIndex
    );
    handleGLTFAndTreeLoading({
      item: itemProperties,
      myTabedIndex: myTabIndex,
      whatEffect: true
    });
  }, [tabIndex]);

  useEffect(() => {
    console.log(
      'Started handleGLTFAndTreeLoading from useeffect showKinematicMove',
      itemProperties,
      showKinematicMove,
      tabIndex
    );
    handleGLTFAndTreeLoading({
      item: itemProperties,
      myTabedIndex: tabIndex,
      whatEffect: false
    });
  }, [showKinematicMove]);

  useEffect(() => {
    console.log(
      'Started handleGLTFAndTreeLoading from useeffect showKinematicSliderMove',
      itemProperties,
      showKinematicSliderMove,
      tabIndex
    );
    handleGLTFAndTreeLoading({
      item: itemProperties,
      myTabedIndex: tabIndex,
      whatEffect: false
    });
  }, [showKinematicSliderMove]);

  useEffect(() => {
    handleGLTFAndTreeLoading({
      item: itemProperties,
      myTabedIndex: tabIndex,
      whatEffect: false
    });
    console.log(
      'Started handleGLTFAndTreeLoading from useeffect regenerateKinematicMove',
      itemProperties,
      regenerateKinematicMove,
      tabIndex
    );
  }, [regenerateKinematicMove]);

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

  const handleGLTFAndTreeLoading = ({ item, myTabedIndex, whatEffect }) => {
    if (
      myTabedIndex !== tabIndex ||
      (!item.fileId && !item.fileUUId) ||
      !parserNeeded.includes(myTabedIndex)
    ) {
      return;
    }
    console.log(
      'Started handleGLTFAndTreeLoading from functionnnns tabindex itemdetails',
      item,
      myTabedIndex
    );

    setGLTFAndTree({ item, myTabedIndex, whatEffect });
  };
  const existingAxis = (axis) => {
    return axis && (axis[0] != 0 || axis[1] != 0 || axis[2] != 0);
  };
  const setGLTFAndTree = async ({ item, myTabedIndex, whatEffect }) => {
    try {
      let updatedItemProp = {};
      let myTabIndex =
        (myTabedIndex === 'iupc' &&
          !showKinematicMove &&
          !showKinematicSliderMove) ||
        myTabedIndex === 'pdcu'
          ? 'gdtac'
          : myTabedIndex;
      let axisArray = [];
      if (myTabedIndex == 'iupc') {
        setDrawAxisLines(axisArray);
      }
      const gltfParam = {
        myTabedIndex: myTabIndex,
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
        let myFileKinamatic = null;
        let okToParse = await isOKToParseForInternalUseProduct({
          item,
          regenerateKinematicMove
        });

        if (!item.fileKinematic || item.fileKinematic === null) {
          updatedItemProp = await handleInternalUseProduct({
            item,
            myTabedIndex,
            myTabIndex,
            setIsLoading,
            setIsFileLoading,
            setProgressBarLoad,
            percentage,
            setPercentage,
            setCurrentProgressText,
            setCompletionProgressText,
            setgltfjson,
            kinematicItemList
          });
          console.log(
            'Setting active gltf file to',
            updatedItemProp.fileKinematic
          );
          myFileKinamatic = updatedItemProp.fileKinematic;
        } else {
          gltfParam.fileKinematic = item.fileKinematic;
          await fetchGLTFAndTree({
            ...gltfParam,
            okToParse,
            showKinematicMove,
            showKinematicSliderMove,
            regenerateKinematicMove
          });

          myFileKinamatic = item.fileKinematic;
        }

        if (activeGLTFFile != myFileKinamatic) {
          console.log('Setting active gltf file to', myFileKinamatic);
          setActiveGLTFile(myFileKinamatic);
        } else {
          console.log(
            'Setting active gltf file to',
            myFileKinamatic + regenerateKinematicMove.toString()
          );
          setActiveGLTFile(
            myFileKinamatic + regenerateKinematicMove.toString()
          );
        }
        let whichOneToLoad =
          (gltfParam.fileUUId ? gltfParam.fileUUId + '/' : '') +
          myFileKinamatic;
        console.log('Going to load axis info', whichOneToLoad);

        let axisRes = await getAFileFromStore(whichOneToLoad, 'axis', true);
        if (
          axisRes &&
          axisRes.data &&
          axisRes.data.AllAxis &&
          axisRes.data.AllAxis.length > 0
        ) {
          for (let index = 0; index < axisRes.data.AllAxis.length; index++) {
            let elementAxis = axisRes.data.AllAxis[index];
            if (Array.isArray(elementAxis) == false) {
              elementAxis = [elementAxis];
            }
            for (
              let indexAxis = 0;
              indexAxis < elementAxis.length;
              indexAxis++
            ) {
              const element = elementAxis[indexAxis];

              //console.log('Element for drawing axis', element);
              /* if (
              existingAxis(element.directing) &&
              element.rotation &&
              element.rotation[3] != 0
            ) {
              axisArray.push({
                axis: element.directing,
                position: element.locating ? element.locating : [0, 0, 0],
                name: element.display
              });
            } else {
              if (element.rotation && element.rotation[3] != 0) {
                axisArray.push({
                  axis: [
                    element.rotation[0],
                    element.rotation[1],
                    element.rotation[2]
                  ],
                  position: element.locating ? element.locating : [0, 0, 0],
                  name: element.display
                });
              }
            } */
              if (
                existingAxis(element.direction) &&
                element.rotation &&
                element.rotation[3] != 0
              ) {
                axisArray.push({
                  axis: element.direction,
                  position: element.location ? element.location : [0, 0, 0],
                  name: element.display
                });
              } else {
                if (element.rotated && element.rotation[3] != 0) {
                  axisArray.push({
                    axis: [
                      element.rotated[0],
                      element.rotated[1],
                      element.rotated[2]
                    ],
                    position: element.location ? element.location : [0, 0, 0],
                    name: element.display
                  });
                }
              }
            }
          }
          console.log('Getting points for axis', axisArray);
          setDrawAxisLines(axisArray);
        }
      } else if (myTabIndex === 'pdcu') {
        let okToParse = await isOKToParseForProductDesignTab({ item });
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
          console.log('Setting active gltf file to', updatedItemProp.fileStore);
          setActiveGLTFile(updatedItemProp.fileStore);
        } else {
          gltfParam.fileStore = item.fileStore;
          await fetchGLTFAndTree({
            ...gltfParam,
            okToParse,
            showKinematicMove: false,
            showKinematicSliderMove: false,
            regenerateKinematicMove: 0
          });
          console.log('Setting active gltf file to', item.fileStore);
          setActiveGLTFile(item.fileStore);
        }
      } else {
        let okToParse = await isOKToParseForOtherTab({ item });
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
            setCenterActionText,
            setItemProperties
          });
          console.log('Setting active gltf file to', updatedItemProp.fileGDT);
          setActiveGLTFile(updatedItemProp.fileGDT);
        } else {
          gltfParam.fileGDT = item.fileGDT;
          updatedItemProp = await fetchGLTFAndTree({
            ...gltfParam,
            okToParse,
            showKinematicMove: false,
            showKinematicSliderMove: false,
            regenerateKinematicMove: 0
          });
          console.log('Setting active gltf file to', item.fileGDT);
          setActiveGLTFile(item.fileGDT);
        }
      }

      setItemProperties((prev) => ({ ...prev, updatedItemProp }));
      handleSave(updatedItemProp); //Revert back after testing
      if (
        item.fileGDT &&
        item.child_item_status === 'INITIATED' &&
        whatEffect
      ) {
        console.log('Calling from itemdetail tab', item.fileGDT, whatEffect);
        const childrenCreated = await createChildItems({
          item,
          percentage,
          setPercentage,
          setCurrentProgressText,
          setCompletionProgressText,
          setCenterActionText,
          setIsLoading,
          setIsFileLoading,
          setProgressBarLoad
        });
        if (childrenCreated) {
          handleSave({ child_item_status: 'COMPLETED' });
        }
      }
    } catch (error) {}
    setIsLoading(false);
    setIsFileLoading(false);
    setProgressBarLoad(false);
  };

  const additionalSaveFunction = (saveFunction) => {
    state_additionalSaveFunction = saveFunction;
  };

  const handleSetOrder = async (props) => {
    const { item } = props;
    if (!item.fileId && !item.fileUUId) {
      return;
    }
    let okToParse = await getOKTOParseForSetOrder({ item });
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
        setItemProperties,
        setActiveGLTFile
      });
    } else {
      await fetchGLTFAndTree({
        myTabedIndex: 'mpps',
        fileStore: item.fileStore,
        fileGDT: item.fileGDT,
        fileMPPS: item.fileMPPS,
        fileStack: item.fileStack,
        fileKinematic: item.fileKinematic,
        fileUUId: item.fileUUId,
        showKinematicMove: false,
        showKinematicSliderMove: false,
        regenerateKinematicMove: 0,
        okToParse,
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
      console.log('Setting active gltf file to', item.fileMPPS);
      setActiveGLTFile(item.fileMPPS);
      if (itemProperties.fileMPPS != item.fileMPPS) {
        setItemProperties((prevData) => ({
          ...prevData,
          fileMPPS: item.fileMPPS
        }));
      }
    }
  };

  const handleSetStack = async (props) => {
    const { item } = props;
    if (!item.fileId && !item.fileUUId) {
      return;
    }
    await setStack({
      item,
      setIsLoading,
      setIsFileLoading,
      setProgressBarLoad,
      setPercentage,
      percentage,
      setCurrentProgressText,
      setCompletionProgressText,
      setgltfjson,
      setItemProperties,
      setActiveGLTFile
    });
  };
  // const handleItemUpdate = (change) => {
  //   let tempItemProperties = Object.assign({}, itemProperties, change);

  //   setItemProperties(tempItemProperties);
  // };

  const handleSave = async (change) => {
    // return; //FOr testing purpose..
    itemProperties.step = undefined;
    itemProperties.gltfjson = undefined;
    itemProperties.itemId = undefined;
    let updateItemProperties = Object.assign({}, itemProperties, change);

    if (
      itemProperties.actuator_motion_control &&
      Object.keys(itemProperties.actuator_motion_control).length > 0
    ) {
      updateItemProperties.actuator_motion_control = {
        ...itemProperties.actuator_motion_control,
        ...(change.actuator_motion_control
          ? change.actuator_motion_control
          : {})
      };
    }
    console.log('HANDLE SAVE', change, updateItemProperties);
    if (
      updateItemProperties &&
      Object.keys(updateItemProperties).length === 0
    ) {
      try {
        if (state_additionalSaveFunction) {
          state_additionalSaveFunction();
        }
      } catch (error) {}
      return;
    }

    ItemAPI.updateItemAPI(id, { ...updateItemProperties })
      .then((res) => {
        if (res && res.data) {
          setItemProperties(res.data);
          setAllowFirstLevelItems(res.data?.child_item_status === 'INITIATED');
          alertContext.openSuccessAlert({ message: 'Item Updated' });
        } else {
          alertContext.openErrorAlert({ message: 'Unable to save info' });
        }
      })
      .catch((error) => {
        alertContext.openErrorAlert({ message: 'Unable to save info' });
      });
    try {
      if (state_additionalSaveFunction) {
        state_additionalSaveFunction();
      }
    } catch (error) {}
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
        return <Classification {...{ handleSave }} />;
      case 'pdcu':
        return (
          <BaseItemProperties
            itemId={id}
            handleItemUpdateLocallay={handleSave}
            handleItemSaveOnServer={handleSave}
            drawLine={itemProperties.drawLine}
            distanceGap={itemProperties.distanceGap}
            angleGap={itemProperties.angleGap}
            {...{
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
              itemProperties,
              setItemProperties,
              gltfjson,
              setgltfjson,
              tabIndex,
              setTabIndex,
              isDesignSite: false
            }}
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
            setgltfjson={setgltfjson}
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
            additionalModelClick={null}
            activeGLTFFile={activeGLTFFile}
            setActiveGLTFile={setActiveGLTFile}
            activeGDTTable={activeGDTTable}
            setActiveGDTTable={setActiveGDTTable}
            drawAxisLines={drawAxisLines}
            setDrawAxisLines={setDrawAxisLines}
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
            handleItemUpdate={handleSave}
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
            showKinematicMove={showKinematicMove}
            setShowKinematicMove={setShowKinematicMove}
            showKinematicSliderMove={showKinematicSliderMove}
            setShowKinematicSliderMove={setShowKinematicSliderMove}
            regenerateKinematicMove={regenerateKinematicMove}
            setRegenerateKinematicMove={setRegenerateKinematicMove}
            kinematicItemList={kinematicItemList}
            setKinematicItemList={setKinematicItemList}
            activeGLTFFile={activeGLTFFile}
            setActiveGLTFile={setActiveGLTFile}
            activeGDTTable={activeGDTTable}
            setActiveGDTTable={setActiveGDTTable}
            drawAxisLines={drawAxisLines}
            setDrawAxisLines={setDrawAxisLines}
            {...{ handleSave }}
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
            setStack={handleSetStack}
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
            activeGLTFFile={activeGLTFFile}
            setActiveGLTFile={setActiveGLTFile}
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
        return (
          <AssemblyTabWithTree
            assemblyTree={get(gltfjson, 'tree', [])}
            activeGLTFFile={activeGLTFFile}
            setActiveGLTFile={setActiveGLTFile}
          />
        );
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
      case 'itemProperties':
        return 'Item Properties';
      case 'materials':
        return <MaterialTab {...{ itemProperties, setItemProperties }} />;
      case 'AssignToClient':
        return (
          <AssignToClient
            clientData={itemProperties}
            clientId={id}
            handleClientUpdate={handleSave}
          />
        );
      case 'sv':
        return (
          <SupplyingVendors
            vendorInfo={itemProperties}
            setVendorInfo={setItemProperties}
          />
        );
      case 'instanceOfThisItem':
        return <InstanceOfThisItem />;
      case 'features':
        return (
          <FeaturesTab
            {...{
              parsing_details_id: itemProperties.parsing_details_id,
              fileName: itemProperties.fileName
            }}
          />
        );
      default:
        return 'Undefined Tab Index';
    }
  };

  const handleTabChange = (event, newTabIndex) => {
    if (tabIndex !== newTabIndex) {
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
    itemProperties: 'Item Properties',
    gdtac: 'GD&T and Assembly Constraints',
    sft: 'Surface Finish and Treatment',
    materials: 'Materials',
    iupc: 'Internal Item Properties',
    features: 'Features',
    cf: 'Classification',
    cc: 'Compliance and Certifications',
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
    production: 'Production',
    assembly: 'Assembly',
    itemReport: 'Item Report',
    makeItemConfigurable: 'Make Item Configurable/Customizable',
    AssignToClient: 'Assign to Client(s)',
    sv: 'Supplying Vendors',
    instanceOfThisItem: 'Instance of this Item',
    pricing: 'pricing'
  };

  const renderTab = () => {
    let tabP = [];
    Object.keys(tabList).forEach((key, index) => {
      tabP.push(
        <Tab
          label={`${index + 1}. ${tabList[key]}`}
          value={key}
          key={key}
          sx={{ textAlign: 'left', minHeight: '30px', alignItems: 'start' }}
        />
      );
    });
    return tabP;
  };
  const itemName = (item) => {
    return item.name
      ? item.name + '0' == item.fileStore
        ? item.filePartName
        : item.name
      : item.filePartName
      ? item.filePartName
      : 'Untitled-2';
  };
  return (
    <>
      {<LoadingModal isLoading={isFileLoading} />}
      <Grid container>
        <Grid item sm={12}>
          <DetailComponentInnerHeader
            {...{
              prefix: 'Item',
              name: itemName(itemProperties),
              id: itemProperties.id,
              handleSave,
              tabName: tabList[tabIndex],
              action: '/items',
              title: 'Item Details',
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
