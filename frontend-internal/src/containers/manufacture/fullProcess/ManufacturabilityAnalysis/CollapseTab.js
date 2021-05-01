import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';


export default function NestedList() {
    const [currentTab, setCurrentTab] = React.useState(true);

    const handleListItem = (value) => {
        if (currentTab === value) {
            setCurrentTab(null);
        }
        else {
            setCurrentTab(value)

        }
    }


    return (
        <List component="nav">
            <ListItem button onClick={() => handleListItem('Tab 1')} >
                Tab 1
                {currentTab === 'Tab 1' ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={currentTab === 'Tab 1'} timeout="auto" unmountOnExit>
                this is first tab
            </Collapse>
            <ListItem button onClick={() => handleListItem('Tab 2')}>
                Tab 2
                {currentTab === 'Tab 2' ? <ExpandLess /> : <ExpandMore />}

            </ListItem>
            <Collapse in={currentTab === 'Tab 2'} timeout="auto" unmountOnExit>
                this is second tab
            </Collapse>
            <ListItem button onClick={() => handleListItem('Tab 3')}>
                Tab 3
                {currentTab === 'Tab 3' ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={currentTab === 'Tab 3'} timeout="auto" unmountOnExit>
                This is third Tab
            </Collapse>
            <ListItem button onClick={() => handleListItem('Tab 4')} >
                Tab 4
                {currentTab === 'Tab 4' ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={currentTab === 'Tab 4'} timeout="auto" unmountOnExit>
                this is Fourth tab
            </Collapse>
            <ListItem button onClick={() => handleListItem('Tab 5')}>
                Tab 5
                {currentTab === 'Tab 5' ? <ExpandLess /> : <ExpandMore />}

            </ListItem>
            <Collapse in={currentTab === 'Tab 5'} timeout="auto" unmountOnExit>
                this is Fifth tab
            </Collapse>
            <ListItem button onClick={() => handleListItem('Tab 6')}>
                Tab 6
                {currentTab === 'Tab 6' ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={currentTab === 'Tab 6'} timeout="auto" unmountOnExit>
                This is sixth Tab
            </Collapse>
        </List>
    );
}