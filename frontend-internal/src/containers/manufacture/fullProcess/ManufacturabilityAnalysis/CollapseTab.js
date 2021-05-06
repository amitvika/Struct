import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ClearIcon from '@material-ui/icons/Clear';
import { Button, Grid, Paper } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';



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
    const [checked, setChecked] = React.useState(true);

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

    return (
        <List component="nav">
            <Paper>
            <div style={{ display: "flex" }}>
            <ListItem button onClick={() => handleListItem('Spool Based')}>
                Spool Based
                {currentTab === 'Spool Based' ? <ExpandLess /> : <ExpandMore />}

            </ListItem>
            <Button><ClearIcon /></Button>
                <Checkbox
                    checked={checked}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
                </div>
            
            <Collapse in={currentTab === 'Spool Based'} timeout="auto" unmountOnExit>
                this is first tab
            </Collapse>
            </Paper>
            <Paper>

            <div style={{ display: "flex" }}>
            <ListItem button onClick={() => handleListItem('Stacked')}>
                Stacked 
                {currentTab === 'Stacked' ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Button><ClearIcon /></Button>
                <Checkbox
                    checked={checked}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
                </div>
            <Collapse in={currentTab === 'Stacked'} timeout="auto" unmountOnExit>
                this is second tab
            </Collapse>
            </Paper>

            <Paper>

            <div style={{ display: "flex" }}>
            <ListItem button onClick={() => handleListItem('Grid')}>
                Grid 
            
                {currentTab === 'Grid' ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Button><ClearIcon /></Button>
                <Checkbox
                    checked={checked}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
                </div>
            <Collapse in={currentTab === 'Grid'} timeout="auto" unmountOnExit>
                This is third Tab
            </Collapse>
            </Paper>

            <Paper>

            <div style={{ display: "flex" }}>
            <ListItem button onClick={() => handleListItem('Grid-Stacked')} >
                Grid-Stacked 
                {currentTab === 'Grid-Stacked' ? <ExpandLess /> : <ExpandMore />}
            </ListItem><Button><ClearIcon /></Button>
                <Checkbox
                    checked={checked}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
</div>
            <Collapse in={currentTab === 'Grid-Stacked'} timeout="auto" unmountOnExit>
                this is Fourth tab
            </Collapse>
            </Paper>

            <Paper>

            <div style={{ display: "flex" }}>
            <ListItem button onClick={() => handleListItem('Bulk Container')}>
                Bulk Container 
                {currentTab === 'Bulk Container' ? <ExpandLess /> : <ExpandMore />}

            </ListItem>
            <Button><ClearIcon /></Button>
                <Checkbox
                    checked={checked}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                /></div>
            <Collapse in={currentTab === 'Bulk Container'} timeout="auto" unmountOnExit>
                this is Fifth tab
            </Collapse>
            </Paper>

            <Paper>

            <div style={{ display: "flex" }}>
            <ListItem button onClick={() => handleListItem('Liquid Vat')}>
                Liquid Vat 
                {currentTab === 'Liquid Vat' ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Button><ClearIcon /></Button>
                <Checkbox
                    checked={checked}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                /></div>
            <Collapse in={currentTab === 'Liquid Vat'} timeout="auto" unmountOnExit>
                This is sixth Tab
            </Collapse>
            </Paper>

            <Paper>

            <div style={{ display: "flex" }}>
            <ListItem button onClick={() => handleListItem('Pressure Vessel')}>
                Pressure Vessel 
                {currentTab === 'Pressure Vessel' ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Button><ClearIcon /></Button>
                <Checkbox
                    checked={checked}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                /></div>
            <Collapse in={currentTab === 'Pressure Vessel'} timeout="auto" unmountOnExit>
                This is seventh Tab
            </Collapse>
            </Paper>

        </List>
    );
}