import React, { useState } from 'react'

import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';
import { Tab, Tabs, Grid } from '@mui/material';
import ChooseItemModal from './ChooseItemModal';
import SetupWorkPlane from './SetupWorkPlane';
import ChooseTools from './ChooseTools';
import ChooseRobot from './ChooseRobot';
import Layout from './Layout';

export default function MachineAndToolWorkspaceProgramming() {
    const [tabIndex, setTabIndex] = useState(-1);
    const [isModalOpened, setIsModalOpened] = useState(false);

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


    return (
        <Grid>
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
                {tabIndex === 'setupWorkPlane' && <ChooseItemModal {...{
                    toggleModal,
                    isModalOpened
                }} />}
                {tabIndex === 'setupWorkPlane' && <SetupWorkPlane />}
                {tabIndex === 'chooseRobot' && <ChooseRobot />}
                {tabIndex === 'chooseTools' && <ChooseTools />}
                {tabIndex === 'layout' && <Layout />}
            </TabPanelContainer>
        </Grid >
    )
}
