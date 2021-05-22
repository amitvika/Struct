import React, { useState, useEffect } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ClearIcon from '@material-ui/icons/Clear';
import { Button, Grid, Paper } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentItemAction } from '../../../../actions/itemActions';
import { getPartsStackableInfo } from '../../../../api/fileUpload.api'


export default function NestedList({ setItemValue }) {
    const dispatch = useDispatch();
    const [currentTab, setCurrentTab] = useState(true);
    // const currentItem = useSelector(state => state.item.currentItem);
    const [dispensing, setDispensing] = useState({});

    const currentItem = useSelector(state => state.item.currentItem);
    const [splitfiles, setsplitfiles] = useState({});

    useEffect(() => {

        setDispensing(currentItem.dispensing)

    }, [currentItem])


    useEffect(() => {
        console.log("----", currentItem)

        getPartsStackableInfo(currentItem.fileId)
            .then(res => {
                setsplitfiles(res.data);
            })
            .catch(err => {

            })
    }, []);
    // const handleChange = (event) => {
    //     const updatedItem = {
    //         ...currentItem,
    //         dispensing: {
    //             ...dispensing,
    //             [event.target.name]: event.target.checked
    //         }
    //     };


    //     dispatch(setCurrentItemAction(updatedItem));

    // };

    const handleListItem = (value) => {
        if (currentTab === value) {
            setCurrentTab(null);
        }
        else {
            setCurrentTab(value)

        }
    }
    return (
        <>
            {splitfiles.stackable && splitfiles.stackable.length > 0 && (
                <List component="nav">
                    <StackableChild
                        title={"Any Direction"}
                        handleListItem={handleListItem}
                        currentTab={currentTab}
                        stackValue={splitfiles.stackable[0].direction}
                    />
                    <StackableChild
                        title={"Top"}
                        handleListItem={handleListItem}
                        currentTab={currentTab}
                        stackValue={splitfiles.stackable[0].top}
                    />
                    <StackableChild
                        title={"Bottom"}
                        handleListItem={handleListItem}
                        currentTab={currentTab}
                        stackValue={splitfiles.stackable[0].bottom}
                    />
                    <StackableChild
                        title={"Right"}
                        handleListItem={handleListItem}
                        currentTab={currentTab}
                        stackValue={splitfiles.stackable[0].right}
                    />
                    <StackableChild
                        title={"Left"}
                        handleListItem={handleListItem}
                        currentTab={currentTab}
                        stackValue={splitfiles.stackable[0].left}
                    />
                    <StackableChild
                        title={"Front"}
                        handleListItem={handleListItem}
                        currentTab={currentTab}
                        stackValue={splitfiles.stackable[0].front}
                    />
                    <StackableChild
                        title={"Back"}
                        handleListItem={handleListItem}
                        currentTab={currentTab}
                        stackValue={splitfiles.stackable[0].back}
                    />
                </List>
            )}
        </>
    );
}

export const prettyPrintArray = (json, maxlength = 30) => {
    if (json) {
        return JSON.stringify(json)
    }
    return "No Info"
}

const StackableChild = ({ title, currentTab, handleListItem, stackValue }) => {
    return (
        <Grid>
            <Paper style={{
                marginTop: "7px",
                backgroundColor: stackValue ? "#349E28" : '',
                color: stackValue ? "white" : ""
            }}>
                <div style={{ display: "display" }}>
                    <ListItem button onClick={() => handleListItem(title)}>{title}
                        {currentTab === title ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                </div>
            </Paper>

            <Collapse in={currentTab === title}
                timeout="auto"
                unmountOnExit>
                {prettyPrintArray(stackValue)}
            </Collapse>

        </Grid>
    )
}
