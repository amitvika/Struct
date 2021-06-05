import React, { useState, useEffect } from 'react';

import { Grid, Paper, Icon, Button } from '@material-ui/core';
import Select from '../atoms/Select';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
}));

export default function Filter({
    list = [],
    filteredList = [],
    setFilteredList,
    columnsFields = [],
    isSearchBarVisible = false,
}) {
    const classes = useStyles();

    const [selectedFieldName, setSelectedFieldName] = useState('');
    const [selectedFieldOptions, setSelectedFieldOptions] = useState([]);
    const [selectedFields, setSelectedFields] = useState({});
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        filtered();
    }, [selectedFields])

    const filtered = () => {
        const myArrayFiltered = list.filter((el) => {
            let flag = true;

            Object.keys(selectedFields).forEach(key => {
                const fieldValues = selectedFields[key];

                if (flag && fieldValues.length > 0 && fieldValues.length !== 1) {
                    flag = fieldValues.some((f) => f === el[key]);
                }
            });

            return flag;
        });

        setFilteredList(myArrayFiltered)
    }

    const handleChange = (data, field) => {

        setSelectedFieldOptions(get_unique_options(field))

        setSelectedFields(prev => {
            return {
                ...prev,
                [field]: data
            }
        });
        setSelectedFieldName(field)
    }



    const get_unique_options = (field) => {
        if (field === selectedFieldName) {
            return selectedFieldOptions;
        }

        const array = filteredList;

        let flags = [], output = [], l = array.length, i;

        for (i = 0; i < l; i++) {
            if (flags[array[i][field]]) {
                continue;
            }

            let tempValue = array[i][field];
            if (tempValue && tempValue.trim().length > 0) {
                flags[array[i][field]] = true;
                output.push(array[i][field]);
            }
        }
        return output;
    }

    const getValues = (item) => {
        if (selectedFields[item.field]) {
            return selectedFields[item.field]
        }
        else {
            return [""]
        }
    }

    const handleSearchInput = (event) => {
        let searchText = event.target.value
        setSearchTerm(searchText)

        const filteredData = list.filter((item) => {
            for (const key in item) {
                const currentValue = item[key]
                console.log("current value", currentValue)
                if (typeof currentValue === "string" && currentValue.includes(searchText)) {

                    return true;
                }
            }
            return false
        })
        setFilteredList(filteredData)
    }

    const renderItem = () => {
        let item = [];
        let columns = Object.keys(columnsFields).length;
        if (isSearchBarVisible) {
            columns += 1;
        }
        let sizeOfEachEl = parseInt(10 / columns);
        columnsFields
            .filter(fieldItem => fieldItem.isFilterColumn === false ? fieldItem.isFilterColumn : true)
            .map((fieldItem, index) => {
                item.push(
                    <Grid item sm sm={sizeOfEachEl} style={{ marginLeft: "7px" }} key={`${fieldItem.field}`}>
                        <Select
                            isCheckbox
                            isMulti
                            onChange={(data) => handleChange(data, fieldItem.field)}
                            options={get_unique_options(fieldItem.field)}
                            placeholder={`Select ${fieldItem.title}`}
                            value={getValues(fieldItem)} />
                    </Grid>
                )
            });

        if (isSearchBarVisible) {
            item.push(
                <Grid item sm sm={sizeOfEachEl} style={{ marginLeft: "7px" }} key={`search_box`}>
                    {/* <Paper component="div" className={classes.root}>

                        <InputBase
                            className={classes.input}
                            placeholder="Search FIelds"
                            inputProps={{ 'aria-label': 'search google maps' }}
                            onChange={handleSearchInput}
                        />

                        <IconButton type="button" aria-label="search" className={classes.iconButton}>
                            <SearchIcon
                            />
                        </IconButton>
                    </Paper> */}
                    <TextField
                        className={classes.margin}
                        id="input-with-icon-textfield"
                        variant="outlined"
                        size="small"
                        onChange={handleSearchInput}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>)
        }
        return item;
    }

    return (
        <>
            <Grid item sm sm={1} style={{ display: 'flex', justifyContent: 'center' }}>
                <Icon style={{ marginTop: '10px' }}>search</Icon>
            </Grid>
            <Grid item sm sm={1}>
                <Button
                    variant="contained"
                    color="primary"
                    type="button"
                    onClick={() => {
                        setFilteredList(list);
                        setSelectedFields({});
                        setSearchTerm('');
                    }}>
                    Clear
          </Button>
            </Grid>
            {
                renderItem()
            }
        </>
    )
}
