import React, { useState, useEffect } from 'react';

import ItemAPI from '@monostruct/common/api/items.api';

import {
  SELECTFEATURE,
  PROCESSINGSTATUS
} from '@monostruct/common/gltf/Tree/utils';

import get from 'lodash/get';

import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';

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
} from './ItemDetailHOC.helper';

import { getAFileFromStore } from '@monostruct/common/api/fileUpload.api';
import { createChildItems } from '@monostruct/common/containers/BaseItemPropertiesTab/helper';
let state_additionalSaveFunction = null;

const ItemDetailHOC = (Component) =>
  function Comp(props) {
    const { itemValue, setItemValue, handleSave } = props;

    const [tabIndex, setTabIndex] = useState('pdcu');
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
    const [createAutoAssemblyOrder, setCreateAutoAssemblyOrder] =
      useState(false);
    const [createAutoStackability, setCreateAutoStackability] = useState(false);
    const [showKinematicMove, setShowKinematicMove] = useState(false);
    const [regenerateKinematicMove, setRegenerateKinematicMove] = useState(0);
    const [kinematicItemList, setKinematicItemList] = useState([]);
    const [activeGLTFFile, setActiveGLTFileState] = useState('');
    const [activeGDTTable, setActiveGDTTable] = useState('');
    const [drawAxisLines, setDrawAxisLines] = useState(null);
    const parserNeeded = ['pdcu', 'gdtac', 'iupc', 'assembly'];

    const setActiveGLTFile = (data) => {
      try {
        setActiveGDTTable(0);
      } catch (error) {}
      try {
        setActiveGLTFileState(data);
      } catch (error) {}
    };

    // console.log('--------itemValue', itemValue);

    // useEffect(() => {
    //   if (!itemValue) {
    //     return;
    //   }

    // let myTabIndex = tabIndex ? tabIndex : 'pdcu';
    // if (query.get('tab')) {
    //   myTabIndex = query.get('tab');
    //   setTabIndex(myTabIndex);
    // }
    // setAllowFirstLevelItems(
    //   itemValue?.child_item_status === 'INITIATED'
    // );
    // setActiveGLTFile('');
    //   handleGLTFAndTreeLoading({
    //     item: itemValue,
    //     myTabedIndex: myTabIndex
    //   });
    // }, [tabIndex]);

    useEffect(() => {
      if (!itemValue) {
        return;
      }
      handleGLTFAndTreeLoading({
        item: itemValue,
        myTabedIndex: tabIndex
      });
    }, [itemValue, showKinematicMove, regenerateKinematicMove]);

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

    const existingAxis = (axis) => {
      return axis && (axis[0] != 0 || axis[1] != 0 || axis[2] != 0);
    };

    const setGLTFAndTree = async ({ item, myTabedIndex }) => {
      try {
        let updatedItemProp = {};
        let myTabIndex =
          (myTabedIndex === 'iupc' && !showKinematicMove) ||
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

          let axisRes = await getAFileFromStore(whichOneToLoad, 'axis');
          if (
            axisRes &&
            axisRes.data &&
            axisRes.data.AllAxis &&
            axisRes.data.AllAxis.length > 0
          ) {
            for (let index = 0; index < axisRes.data.AllAxis.length; index++) {
              const element = axisRes.data.AllAxis[index];
              //console.log('Element for drawing axis', element);
              if (
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
              }
              if (
                existingAxis(element.direction) &&
                element.rotation &&
                element.rotation[3] != 0
              ) {
                axisArray.push({
                  axis: element.direction,
                  position: element.location ? element.location : [0, 0, 0],
                  name: 'MULT' + element.display
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
                    name: 'MULT' + element.display
                  });
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
            console.log(
              'Setting active gltf file to',
              updatedItemProp.fileStore
            );
            setActiveGLTFile(updatedItemProp.fileStore);
          } else {
            gltfParam.fileStore = item.fileStore;
            await fetchGLTFAndTree({
              ...gltfParam,
              okToParse,
              showKinematicMove: false,
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
              setItemValue
            });
            console.log('Setting active gltf file to', updatedItemProp.fileGDT);
            setActiveGLTFile(updatedItemProp.fileGDT);
          } else {
            gltfParam.fileGDT = item.fileGDT;
            updatedItemProp = await fetchGLTFAndTree({
              ...gltfParam,
              okToParse,
              showKinematicMove: false,
              regenerateKinematicMove: 0
            });
            console.log('Setting active gltf file to', item.fileGDT);
            setActiveGLTFile(item.fileGDT);
          }
        }

        setItemValue((prev) => ({ ...prev, updatedItemProp }));
        handleSave(updatedItemProp); //Revert back after testing
        if (item.fileGDT && item.child_item_status === 'INITIATED') {
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
          setItemValue,
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
          setItemValue
        });
        console.log('Setting active gltf file to', item.fileMPPS);
        setActiveGLTFile(item.fileMPPS);
        if (itemValue.fileMPPS != item.fileMPPS) {
          setItemValue((prevData) => ({
            ...prevData,
            fileMPPS: item.fileMPPS
          }));
        }
      }
    };

    // const handleItemUpdate = (change) => {
    //   let tempItemProperties = Object.assign({}, itemValue, change);

    //   setItemValue(tempItemProperties);
    // };

    // const handleSave = async (change) => {
    //   console.log('HANDLE SAVE', change);
    //   // return; //FOr testing purpose..
    //   itemValue.step = undefined;
    //   itemValue.gltfjson = undefined;
    //   itemValue.itemId = undefined;
    //   let updateItemProperties = Object.assign({}, itemValue, change);

    //   if (Object.keys(itemValue.actuator_motion_control).length > 0) {
    //     itemValue.actuator_motion_control = {
    //       ...itemValue.actuator_motion_control,
    //       ...change.actuator_motion_control
    //     };
    //   }

    //   if (Object.keys(updateItemProperties).length === 0) {
    //     try {
    //       if (state_additionalSaveFunction) {
    //         state_additionalSaveFunction();
    //       }
    //     } catch (error) {}
    //     return;
    //   }

    //   ItemAPI.updateItemAPI(id, { ...updateItemProperties })
    //     .then((res) => {
    //       if (res && res.data) {
    //         setItemValue(res.data);
    //         setAllowFirstLevelItems(
    //           res.data?.child_item_status === 'INITIATED'
    //         );
    //       } else {
    //       }
    //     })
    //     .catch((error) => {});
    //   try {
    //     if (state_additionalSaveFunction) {
    //       state_additionalSaveFunction();
    //     }
    //   } catch (error) {}
    // };

    return (
      <Component
        {...props}
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
          gltfjson,
          setgltfjson,
          tabIndex,
          setTabIndex
        }}
      />
    );
  };

export default ItemDetailHOC;
