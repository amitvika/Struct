import React, { useState } from 'react'

import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';
import { Tab, Tabs, Grid } from '@mui/material';
import ChooseItemModal from './ChooseItemModal';
import SetupWorkPlane from './SetupWorkPlane';
import ChooseTools from './ChooseTools';
import ChooseRobot from './ChooseRobot';
import Layout from './Layout';

import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer';

import {
    DEFAULTBACKCOLOR,
    DEFAULTSELECTCOLOR,
    DEFAULTTOUCHCOLOR,
    SELECTHIRERACHY,
    STATEPROPS,
} from '@monostruct/common/gltf/Tree/utils';
import get from 'lodash/get';


export default function MachineAndToolWorkspaceProgramming({
    gltfjson = {},
    itemProperties = {},
    selectedOption,
    setSelectedOption,
    percentage,
    progressBarLoad,
    currentProgressText,
    completionProgressText,
    centerActionText,
    drawLine,
    activeGLTFFile,
    setActiveGLTFile,
}) {
    const [tabIndex, setTabIndex] = useState(-1);
    const [isModalOpened, setIsModalOpened] = useState(false);
    const [gltfobj, setGltfObj] = useState([]);
    const [fileId, setFileId] = useState(0);
    const [fileUUId, setfileUUId] = useState(itemProperties.fileUUId);
    const [progressBarRender, setProgressBarRender] = useState(false);
    const [percentager, setPercentager] = useState(percentage || 0);
    const [progressBarLoader, setProgressBarLoader] = useState(progressBarLoad);
    const [currentProgressTexter, setCurrentProgressTexter] =
        useState(currentProgressText);
    const [completionProgressTexter, setCompletionProgressTexter] = useState(
        completionProgressText
    );
    const [centerActionTexter, setCenterActionTexter] =
        useState(centerActionText);

    const [selectedGltfItemList, setSelectedGltfItemList] = useState([]);

    const [drawLiner, setDrawLiner] = useState(drawLine);

    const tabList = {
        chooseItem: 'Choose Item(s)',
        setupWorkPlane: 'Setup work plane',
        chooseRobot: 'Choose robot',
        chooseTools: 'Choose Tools (stationary or effector)',
        layout: 'Layout',
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

    const toggleModal = (data) => {
        setIsModalOpened(!isModalOpened);
    };


    const handleTabChange = (event, newTabIndex) => {

        setTabIndex(newTabIndex)

        if (newTabIndex === 'chooseItem') {
            setIsModalOpened(true)
        } else {
            setIsModalOpened(false)
        }
    }

    let gltfjsonlen = gltfobj ? Object.keys(gltfobj).length : 0;
    if (get(gltfobj, 'gltf.accessors')) {
        gltfjsonlen += gltfobj?.gltf?.accessors?.length;
    }

    const handleItemSelection = (data) => {
        setSelectedGltfItemList(data)
    }

    return (
        <Grid style={{
            display: 'flex',
            flexDirection: 'row'
        }}>
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
            <TabPanelContainer>

                {tabIndex === 'chooseItem' && <ChooseItemModal {...{
                    toggleModal,
                    isModalOpened,
                    handleItemSelection
                }} />}
                {tabIndex === 'setupWorkPlane' && <SetupWorkPlane />}
                {tabIndex === 'chooseRobot' && <ChooseRobot />}
                {tabIndex === 'chooseTools' && <ChooseTools />}
                {tabIndex === 'layout' && <Layout />}
                <GLTFRenderer
                    gltfobj={selectedGltfItemList}
                    fileGDT={itemProperties.fileGDT}
                    fileUUId={fileUUId}
                    fileAnimation={false}
                    activefile={
                        (fileId || fileUUId || '') +
                        gltfjsonlen.toString() +
                        tabIndex.toString()
                    }
                    backcolor={DEFAULTBACKCOLOR()}
                    selectcolor={DEFAULTSELECTCOLOR()}
                    touchcolor={DEFAULTTOUCHCOLOR()}
                    selectedoption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    splitmethod={SELECTHIRERACHY}
                    changedata={[]}
                    data2texture={null}
                    data3texture={null}
                    materialtype={STATEPROPS.materialname}
                    whatchanged={0}
                    dataselection={0}
                    activeDataTable={0}
                    setProgressBarRender={setProgressBarRender}
                    setPercentage={setPercentager}
                    setProgressBarLoad={setProgressBarLoader}
                    setCurrentProgressText={setCurrentProgressTexter}
                    setCompletionProgressText={setCompletionProgressTexter}
                    setCenterActionText={setCenterActionTexter}
                    drawLine={drawLiner}
                    edgecolor={STATEPROPS.edgecolor}
                    activeGLTFFile={activeGLTFFile}
                    setActiveGLTFile={setActiveGLTFile}
                    xyzEndEffectorPosition={{ X: 0, Y: 0, Z: 0 }}
                    setXYZEndEffectorPosition={null}
                    xyzControlPosition={{ X: 0, Y: 0, Z: 0 }}
                    setXYZControlPosition={null}
                    xyzBeginPosition={{ X: 0, Y: 0, Z: 0 }}
                    setXYZBeginPosition={null}
                    xyzShiftPosition={{ X: 0, Y: 0, Z: 0 }}
                    setXYZShiftPosition={null}
                    kinematicParameters={{
                        step: 1,
                        error: 4,
                        iterations: 21,
                        methods: 1,
                        gap: 0.001
                    }}
                    setKinematicParameters={null}
                    itemProperties={null}
                />
            </TabPanelContainer>
        </Grid >
    )
}
