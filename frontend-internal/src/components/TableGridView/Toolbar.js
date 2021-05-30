import React from 'react'
import { Grid, Paper } from '@material-ui/core';
import Checkbox from '../atoms/Checkbox';
import Headding from '../atoms/Headding';
import Space from '../atoms/Space';
import Filter from './Filter';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddBox';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
    },
    Paper: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
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


export default function Toolbar({
    title,
    isGridViewSelected,
    setIsGridViewSelected,
    isViewArchivedChecked,
    handleViewArchived,
    isHistoryModalOpened,
    handleHistoryToggle,
    isDeleteCheckboxVisible = true,
    isHistoryCheckboxVisible = true,
    isCustomAddButtonVisible = false,
    isSearchBarVisible = false,
    handleAddButtonPress = () => { },
    handleSearchInput = () => { },
    ...restProps
}) {
    const classes = useStyles();
    return (
        <Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px' }} >
            <Grid container>

                <Grid item sm sm={2}>
                    <Grid item sm sm={12}>
                        <Checkbox
                            checked={isGridViewSelected}
                            size="large"
                            label="View GridView"
                            onChange={() => setIsGridViewSelected(!isGridViewSelected)}
                        />
                    </Grid>

                    {
                        isHistoryCheckboxVisible &&
                        <Grid item sm sm={12}>
                            <Checkbox
                                checked={isHistoryModalOpened}
                                label="Show History"
                                onChange={handleHistoryToggle}
                            />
                        </Grid>
                    }

                    {
                        isDeleteCheckboxVisible &&
                        <Grid item sm sm={12}>
                            <Checkbox
                                checked={isViewArchivedChecked}
                                label="View Archived"
                                onChange={handleViewArchived}
                            />
                        </Grid>
                    }


                </Grid>
                <Grid item sm sm={10}>
                    <Grid item sm sm={12} style={{ display: 'flex' }}>
                        <Filter
                            {...restProps} />
                        {
                            title === 'Items' &&
                            <Grid item sm sm={3} style={{ display: 'flex', flexDirection: 'column' }}>
                                <Checkbox
                                    label="Unused by Other Items"
                                />
                                <Checkbox
                                    label="Unused by Clients"
                                />
                            </Grid>
                        }
                    </Grid>
                    <Space size={30} />
                    <Grid container>
                        <Grid item xs>
                            <Box textAlign="center" m={1}>
                                <Headding as={'h4'} title={title}></Headding>
                            </Box>
                        </Grid>

                        {
                            isSearchBarVisible &&
                            <Paper component="form" className={classes.Paper}>
                                <InputBase
                                    className={classes.input}
                                    placeholder="Search FIelds"
                                    inputProps={{ 'aria-label': 'search google maps' }}
                                    onChange={handleSearchInput}
                                />

                                <IconButton type="submit" aria-label="search">
                                    <SearchIcon
                                    />
                                </IconButton>
                            </Paper>
                        }

                        {
                            isCustomAddButtonVisible &&
                            <IconButton color="primary" aria-label="upload picture" component="span" onClick={handleAddButtonPress}>
                                <AddIcon />
                            </IconButton>
                        }
                    </Grid>
                </Grid>
            </Grid>
        </Paper >
    )
}
