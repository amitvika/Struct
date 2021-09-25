import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Paper, Tab, Tabs, Grid } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import EditIcon from '@material-ui/icons/Edit';
import SubHeaderWithArrow from '../../components/SubHeaderWithArrow';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import BaseItemProperties from './baseItemProperties';
import GeometricDimensioning from './geometricDimensioning';
import CurrentUsage from './currentUsage';
import VendorDetails from './VendorDetails';
import Manufacturing from '../manufacture/index2';
import ClientSetup from './clientSetup';
import Assembly from './assembly';
import Production from './production';
import SurfaceFinishAndTreatment from './SurfaceFinishAndTreatment';
import ComplianceAndCertifications from './ComplianceAndCertifications';

import ItemTypeConfigurations from '../itemTypeConfigurations';
import ItemAPI from '@monostruct/common/api/items.api';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { setCurrentItemAction } from '../../actions/itemActions';
import get from 'lodash/get';
import { useQuery } from '../../utils/customHooks';
import './style.css';
import {
  getPartsStackableInfo,
  getPartsAssemblyOrder,
  getPartsKinematicOrder,
  getHierarchySplitFiles,
  getAFileFromStore,
  getGltfForStore,
  getTreeForStore,
  resourcePathURL,
} from '@monostruct/common/api/fileUpload.api';
import LoadingModal from '@monostruct/common/components/LoadingModal';

import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';

const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.5;
const DEFAULTEXPLODEGAP = 10;
const DEFAULTFROMCENTER = true;
const DEFAULTHOLESCALE = 0.77;
const DEFAULTREMOVEGAP = 8;
const DEFAULTANIMATIONTIME = 1.0;
const DEFAULTDISECT = false;
const DEFAULTSHOWDISECT = false;
const DEFAULTSHOWINFOONSELECT = false;
const DEFAULTMATERIALTYPE = [{ id: 1, name: 'Basic' }];

const stateprops = {
  distancegap: DEFAULTDISTANCEGAP,
  anglegap: DEFAULTANGLEGAP,
  explodegap: DEFAULTEXPLODEGAP,
  disect: DEFAULTDISECT,
  showdisect: DEFAULTSHOWDISECT,
  showinfoonselect: DEFAULTSHOWINFOONSELECT,
  materialtype: DEFAULTMATERIALTYPE,
  fromcenter: DEFAULTFROMCENTER,
  holescale: DEFAULTHOLESCALE,
  removegap: DEFAULTREMOVEGAP,
  animationtime: DEFAULTANIMATIONTIME,
};

const ItemDetail = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  let { id } = useParams();
  let query = useQuery();

  const currentItem = useSelector((state) => state.item.currentItem);
  const [dispensing, setDispensing] = useState({});
  const [tabIndex, setTabIndex] = useState('pdcu');
  const [itemProperties, setItemProperties] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [gltfjson, setgltfjson] = useState({});
  const parserNeeded = ['pdcu', 'gdtac', 'iupc', 'assembly'];

  useEffect(() => {
    let myTabIndex = 'pdcu';
    if (query.get('tab')) {
      myTabIndex = query.get('tab');
      setTabIndex(myTabIndex);
    }

    const toFetchItem = !itemProperties || !itemProperties.fileId;
    //console.log("got", tabIndex, myTabIndex, toFetchItem, currentItem, itemProperties);
    if (toFetchItem) {
      (async () => {
        //setIsLoading(true);
        const itemDetailResponse = await ItemAPI.getItemsAPI(`id=${id}`);

        const _currentItem = get(itemDetailResponse, 'data[0]', {});

        dispatch(setCurrentItemAction(_currentItem));

        setGLTFAndTree(_currentItem, myTabIndex);

        setIsLoading(false);
      })();
    } else {
      setGLTFAndTree(itemProperties, myTabIndex);
    }
  }, [tabIndex]);

  useEffect(() => {
    if (currentItem) {
      setItemProperties(currentItem);
    }
  }, [currentItem]);

  const doesFileExist = (urlAsFile) => {
    var xhr = new XMLHttpRequest();
    try {
      xhr.open('HEAD', urlAsFile, false);
      xhr.send();

      return xhr.status !== 404;
    } catch (exception) {
      console.log(exception);
      return false;
    }
    return false;
  };
  const setStack = (item) => {
    if (!item.fileId) {
      return;
    }
    if (!item.fileStack || item.fileStack === null) {
      console.log('Checking Store', item.fileStore);
      if (item.fileStore && item.fileStore.length > 0) {
        const fileStack =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'S0';
        console.log('Checking Stack', fileStack);
        if (doesFileExist(resourcePathURL + fileStack + '.gltf')) {
          console.log('Found', fileStack);
          item.fileStack = fileStack;
        } else {
          console.log('Stack Not Found', fileStack);
        }
      } else {
        console.log('Store Not Found', item.fileStore);
      }
    }
    if (!item.fileStack || item.fileStack === null) {
      //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
      setIsLoading(true);
      getPartsStackableInfo(
        item.fileId,
        stateprops.distancegap,
        stateprops.anglegap,
        stateprops.animationtime
      )
        .then((res) => res.data)
        .then((repos) => {
          console.log(repos);
          const multiAssmebly = get(repos, 'tree', []).length > 0;
          const stack = repos['store'];
          item.fileStack = stack;
          setgltfjson({
            ...repos,
            kinematic: item.fileKinematic,
            mpps: item.fileMPPS,
            store: item.fileStore,
            stack: stack,
            gdt: item.fileGDT,
            multiAssmebly: multiAssmebly,
          });
          setItemProperties((prevData) => ({
            ...prevData,
            fileStack: stack,
          }));
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log('Error While Parsing', err);
        });
    } else {
      //console.log("Up1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
      fetchGLTFAndTree(
        'stack',
        item.fileStore,
        item.fileGDT,
        item.fileMPPS,
        item.fileStack,
        item.fileKinematic
      );
    }
  };
  const setOrder = (item) => {
    if (!item.fileId) {
      return;
    }
    if (!item.fileMPPS || item.fileMPPS === null) {
      console.log('Checking Store', item.fileStore);
      if (item.fileStore && item.fileStore.length > 0) {
        const fileMPPS =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'M0';
        console.log('Checking Order', fileMPPS);
        if (doesFileExist(resourcePathURL + fileMPPS + '.gltf')) {
          console.log('Found', fileMPPS);
          item.fileMPPS = fileMPPS;
        } else {
          console.log('Order Not Found', fileMPPS);
        }
      } else {
        console.log('Store Not Found', item.fileStore);
      }
    }
    if (!item.fileMPPS || item.fileMPPS === null) {
      //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
      setIsLoading(true);
      console.log('Setting here');
      getPartsAssemblyOrder(
        item.fileId,
        stateprops.distancegap,
        stateprops.anglegap,
        stateprops.explodegap,
        stateprops.fromcenter,
        stateprops.holescale,
        stateprops.removegap,
        stateprops.animationtime
      )
        .then((res) => res.data)
        .then((repos) => {
          console.log('Coming Here');
          const multiAssmebly = get(repos, 'tree', []).length > 0;
          const mpps = repos['store'];
          item.fileMPPS = mpps;
          setgltfjson({
            ...repos,
            kinematic: item.fileKinematic,
            mpps: mpps,
            store: item.fileStore,
            stack: item.fileStack,
            gdt: item.fileGDT,
            multiAssmebly: multiAssmebly,
          });
          setItemProperties((prevData) => ({
            ...prevData,
            fileMPPS: mpps,
          }));
          setIsLoading(false);
          console.log('Done');
        })
        .catch((err) => {
          setIsLoading(false);
          console.log('Error While Parsing', err);
        });
    } else {
      //console.log("Up1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
      fetchGLTFAndTree(
        'mpps',
        item.fileStore,
        item.fileGDT,
        item.fileMPPS,
        item.fileStack,
        item.fileKinematic
      );
    }
  };
  const setGLTFAndTree = (item, myTabIndex) => {
    if (myTabIndex == tabIndex) {
      if (!item.fileId || !parserNeeded.includes(myTabIndex)) {
        setIsLoading(false);
        return;
      }
      if (myTabIndex == 'iupc') {
        console.log('Checking iupc', myTabIndex, item);
        if (!item.fileKinematic || item.fileKinematic === null) {
          console.log('Checking Store', item.fileStore);
          if (item.fileStore && item.fileStore.length > 0) {
            const fileKinematic =
              item.fileStore.slice(0, item.fileStore.length - 1) + 'K0';
            console.log('Checking Kinematic', fileKinematic);
            if (doesFileExist(resourcePathURL + fileKinematic + '.gltf')) {
              console.log('Found', fileKinematic);
              item.fileKinematic = fileKinematic;
            } else {
              console.log('Kinematic Not Found', fileKinematic);
            }
          } else {
            console.log('Store Not Found', item.fileStore);
          }
        }
        if (!item.fileKinematic || item.fileKinematic === null) {
          console.log(
            'Up0',
            myTabIndex,
            tabIndex,
            item.fileStore,
            item.fileKinematic,
            item.fileId
          );
          setIsLoading(true);
          getPartsKinematicOrder(
            item.fileId,
            stateprops.distancegap,
            stateprops.anglegap,
            stateprops.animationtime
          )
            .then((res) => res.data)
            .then((repos) => {
              const multiAssmebly = get(repos, 'tree', []).length > 0;
              const kinematic = repos['store'];
              item.fileKinematic = kinematic;
              setgltfjson({
                ...repos,
                kinematic: kinematic,
                mpps: item.fileMPPS,
                store: item.fileStore,
                stack: item.fileStack,
                gdt: item.fileGDT,
                multiAssmebly: multiAssmebly,
              });
              setItemProperties((prevData) => ({
                ...prevData,
                fileKinematic: kinematic,
              }));
              setIsLoading(false);
            })
            .catch((err) => {
              setIsLoading(false);
              console.log('Error While Parsing', err);
            });
        } else {
          //console.log("Up1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
          fetchGLTFAndTree(
            myTabIndex,
            item.fileStore,
            item.fileGDT,
            item.fileMPPS,
            item.fileStack,
            item.fileKinematic
          );
        }
      } else if (myTabIndex == 'pdcu') {
        if (!item.fileStore || item.fileStore === null) {
          //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
          setIsLoading(true);
          getHierarchySplitFiles(
            item.fileId,
            true,
            stateprops.distancegap,
            stateprops.anglegap,
            stateprops.disect,
            0,
            0,
            0
          )
            .then((res) => res.data)
            .then((repos) => {
              const multiAssmebly = get(repos, 'tree', []).length > 0;
              const store = repos['store'];
              item.fileStore = store;
              console.log('Fetching Data', {
                ...repos,
                kinematic: item.fileKinematic,
                mpps: item.fileMPPS,
                stack: item.fileStack,
                gdt: item.fileGDT,
                multiAssmebly: multiAssmebly,
              });
              setgltfjson({
                ...repos,
                kinematic: item.fileKinematic,
                mpps: item.fileMPPS,
                stack: item.fileStack,
                gdt: item.fileGDT,
                multiAssmebly: multiAssmebly,
              });
              setItemProperties((prevData) => ({
                ...prevData,
                fileStore: store,
              }));
              setIsLoading(false);
            })
            .catch((err) => {
              setIsLoading(false);
              console.log('Error While Parsing', err);
            });
        } else {
          //console.log("Up1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
          fetchGLTFAndTree(
            myTabIndex,
            item.fileStore,
            item.fileGDT,
            item.fileMPPS,
            item.fileStack,
            item.fileKinematic
          );
        }
      } else {
        if (!item.fileGDT || item.fileGDT === null) {
          console.log('Checking Store', item.fileStore);
          if (item.fileStore && item.fileStore.length > 0) {
            const fileGDT =
              item.fileStore.slice(0, item.fileStore.length - 1) + '3';
            console.log('Checking GDT', fileGDT);
            if (doesFileExist(resourcePathURL + fileGDT + '.gltf')) {
              console.log('Found', fileGDT);
              item.fileGDT = fileGDT;
            } else {
              console.log('GDT Not Found', fileGDT);
            }
          } else {
            console.log('Store Not Found', item.fileStore);
          }
        }
        if (!item.fileGDT || item.fileGDT === null) {
          //console.log("Down0f",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId,isLoading);

          setIsLoading(true);
          //console.log("Down0t",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId,isLoading);
          getHierarchySplitFiles(
            item.fileId,
            true,
            stateprops.distancegap,
            stateprops.anglegap,
            stateprops.disect,
            0,
            0.3,
            0.5
          )
            .then((res) => res.data)
            .then((repos) => {
              const gdt = repos['store'];
              item.fileGDT = gdt;
              console.log('Fetching Data', {
                ...repos,
                kinematic: item.fileKinematic,
                mpps: item.fileMPPS,
                stack: item.fileStack,
                gdt: gdt,
                store: item.fileStore,
              });

              setgltfjson({
                ...repos,
                kinematic: item.fileKinematic,
                mpps: item.fileMPPS,
                stack: item.fileStack,
                gdt: gdt,
                store: item.fileStore,
              });
              //console.log("After getting reposi",repos, {...repos,gdt:gdt,store:item.fileStore},isLoading);
              setItemProperties((prevData) => ({
                ...prevData,
                fileGDT: gdt,
              }));
              //console.log("After getting reposf",repos, {...repos,gdt:gdt,store:item.fileStore},isLoading);
              setIsLoading(false);
              //console.log("Setting False to show gltf");
            })
            .catch((err) => {
              setIsLoading(false);
              console.log('Error While Disecting', err);
            });
        } else {
          //console.log("Down1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
          fetchGLTFAndTree(
            myTabIndex,
            item.fileStore,
            item.fileGDT,
            item.fileMPPS,
            item.fileStack,
            item.fileKinematic
          );
        }
      }
    } else {
      //console.log("Else",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
    }
  };
  const handleCopyId = (event) => {
    navigator.clipboard.writeText(id);
    console.log('---', id);
    event.stopPropagation();
  };
  const fetchGLTFAndTree = async (
    myTabIndex,
    fileStore,
    fileGDT,
    fileMPPS,
    fileStack,
    fileKinematic
  ) => {
    try {
      let obj = {
        gltf: {},
        tree: {},
        store: fileStore,
        gdt: fileGDT,
        mpps: fileMPPS,
        stack: fileStack,
        kinematic: fileKinematic,
      };
      setIsLoading(true);
      let whichOneToLoad = null;
      if (myTabIndex == 'pdcu') {
        whichOneToLoad = fileStore;
      } else if (myTabIndex == 'mpps') {
        whichOneToLoad = fileMPPS;
      } else if (myTabIndex == 'stack') {
        whichOneToLoad = fileStack;
      } else if (myTabIndex == 'iupc') {
        whichOneToLoad = fileKinematic;
      } else {
        whichOneToLoad = fileGDT;
      }
      console.log(
        'Checking',
        myTabIndex,
        whichOneToLoad,
        'FileStore',
        fileStore,
        'fileMPPS',
        fileMPPS,
        'fileStack',
        fileStack,
        'fileKinematic',
        fileKinematic,
        'fileGDT',
        fileGDT
      );
      const gltfRes = await getGltfForStore(whichOneToLoad);
      const treeRes = await getTreeForStore(whichOneToLoad);
      let stackRes = { data: null };
      let orderRes = { data: null };
      if (myTabIndex == 'stack') {
        stackRes = await getAFileFromStore(whichOneToLoad, 'stack');
      }
      if (myTabIndex == 'mpps') {
        orderRes = await getAFileFromStore(whichOneToLoad, 'order');
      }
      const multiAssmebly = treeRes.length > 0;
      console.log('Fetched Data', {
        ...obj,
        gltf: gltfRes.data,
        tree: treeRes.data,
        stackable: stackRes.data,
        assemblyorder: orderRes.data,
        multiAssmebly: multiAssmebly,
      });

      setgltfjson({
        ...obj,
        gltf: gltfRes.data,
        tree: treeRes.data,
        stackable: stackRes.data,
        assemblyorder: orderRes.data,
        multiAssmebly: multiAssmebly,
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('Error', error);
    }
    /* if (myTabIndex == "pdcu") {
            //console.log("Up",myTabIndex,tabIndex,fileStore,fileGDT);
            try {
                let obj = { gltf: {}, tree: {}, store: fileStore, gdt: fileGDT };
                setIsLoading(true);
                const gltfRes = await getGltfForStore(fileStore);
                const treeRes = await getTreeForStore(fileStore);
                const multiAssmebly = treeRes.length > 0;
                setgltfjson({ ...obj, gltf: gltfRes.data, tree: treeRes.data, multiAssmebly: multiAssmebly });
                setIsLoading(false);

            } catch (error) {
                setIsLoading(false);
                console.log('Error', error);
            }
        } else {
            //console.log("Down",myTabIndex,tabIndex,fileStore,fileGDT);
            try {
                let obj = { gltf: {}, tree: {}, store: fileStore, gdt: fileGDT };
                setIsLoading(true);
                const gltfRes = await getGltfForStore(fileGDT);
                const treeRes = await getTreeForStore(fileGDT);
                setgltfjson({ ...obj, gltf: gltfRes.data, tree: treeRes.data });
                setIsLoading(false);
                //console.log(gltfRes,treeRes);

            } catch (error) {
                setIsLoading(false);
                console.log('Error', error);
            }

        } */
  };

  const renderPageSwitch = () => {
    if (!get(itemProperties, '_id')) {
      return null;
    }
    //console.log(itemProperties,itemProperties.fileId);
    switch (tabIndex) {
      case 0:
        return 'Add vendor items here';
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
          />
        );
      case 'cu':
        return <CurrentUsage itemId={id} />;
      case 'gdtac':
        console.log(itemProperties, itemProperties.fileGDT);
        return (
          <GeometricDimensioning
            fileId={itemProperties.fileId || ''}
            fileGDT={itemProperties.fileGDT}
            gltfjson={gltfjson}
            isLoading={isLoading}
            //assemblyTree={get(gltfjson, 'tree', [])}
            tabIndex={tabIndex}
          />
        );
      case 'iupc':
        console.log('IUPC', itemProperties, gltfjson);
        return (
          <ItemTypeConfigurations
            itemId={id}
            fileId={itemProperties.fileId}
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
            gltfjson={gltfjson}
            setgltfjson={setgltfjson}
            isLoading={isLoading}
          />
        );
      case 5:
        return <VendorDetails />;
      case 'mpps':
        return (
          <Manufacturing
            itemId={id}
            fileId={itemProperties.fileId}
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
            fetchList={ItemAPI.getItemsAPI}
            setStack={setStack}
            setOrder={setOrder}
            gltfjson={gltfjson}
            isLoading={isLoading}
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
        return 'Design Product Design';
      default:
        return 'Undefined Tab Index';
    }
  };

  const handleSave = () => {
    // setIsLoading(true);
    console.log(itemProperties);
    itemProperties.step = undefined;
    itemProperties.gltfjson = undefined;
    itemProperties.itemId = undefined;

    ItemAPI.updateItemAPI(id, { ...itemProperties })
      .then((res) => {
        setItemProperties(res.data);
        dispatch(showSuccessAlert({ message: 'All data is saved' }));
      })
      .catch((error) => {
        dispatch(showErrorAlert({ message: 'Unable to save info' }));
      });
  };

  const handleTabChange = (event, newTabIndex) => {
    if (tabIndex != newTabIndex) {
      setIsLoading(true);
      setTabIndex(newTabIndex);
      //setGLTFAndTree(currentItem,newTabIndex);
      //setIsLoading(false);
      history.push({
        pathname: `/items/${id}`,
        search: `?tab=${newTabIndex}`,
      });
    }
    //console.log("IsLoading, inside",isLoading);
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
    production: 'Production',
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
    console.log(tabP);
    return tabP;
  };

  return (
    <>
      <LoadingModal isLoading={isLoading} />
      <Grid container>
        <Grid item sm={12}>
          <SubHeaderWithArrow action={'/items'} title={'Items Details'} />
          <Paper style={{ padding: 10, margin: 10, display: 'flex' }}>
            <Grid>
              <h4>Item Name: {itemProperties.name}</h4>
              <Grid style={{ display: 'flex' }}>
                <p>Item ID:{id} </p>
                {/* <ClipboardText handleCopyId={handleCopyId} /> */}
              </Grid>
            </Grid>
            <Grid style={{ margin: 'auto' }}>
              <h4>{tabList[tabIndex]}</h4>
            </Grid>

            <Grid style={{ marginLeft: 'auto' }}>
              <Button>
                <AddBoxIcon />
              </Button>
              <Button>
                <EditIcon />
              </Button>
            </Grid>
          </Paper>
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
          left: '10%',
        }}
        open={true}
      >
        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </Snackbar>
    </>
  );
};

export default ItemDetail;
