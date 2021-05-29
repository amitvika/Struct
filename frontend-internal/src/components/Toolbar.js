import React from 'react'
import { Grid, Paper } from '@material-ui/core';
import Checkbox from './atoms/Checkbox';
import Headding from './atoms/Headding';
import Space from './atoms/Space';
import Filter from './Filter';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddBox';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
    },
    Paper: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%'
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
    isDeletedItemVisible,
    handleShowDelete,
    isHistoryModalOpened,
    handleHistoryToggle,
    isAddEditLinkVisible,
    handleAddEditToggle,
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
                <Grid item xs={2}>
                    <Grid item xs>
                        <Checkbox
                            checked={isGridViewSelected}
                            size="large"
                            label="View GridView"
                            onChange={() => setIsGridViewSelected(!isGridViewSelected)}
                        />
                    </Grid>

                    {
                        isHistoryCheckboxVisible &&
                        <Grid item xs>
                            <Checkbox
                                checked={isHistoryModalOpened}
                                label="Show History"
                                onChange={handleHistoryToggle}
                            />
                        </Grid>
                    }

                    {
                        isDeleteCheckboxVisible &&
                        <Grid item xs>
                            <Checkbox
                                checked={isDeletedItemVisible}
                                label="View Archived"
                                onChange={handleShowDelete}
                            />
                        </Grid>
                    }


                </Grid>
                <Grid item xs>
                    <Filter
                        {...restProps} />
                </Grid>
                {
                    title === 'Items' &&
                    <Grid item xs={2} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Checkbox
                            label="Unused by Other Items"
                        />
                        <Checkbox
                            label="Unused by Clients"
                        />
                    </Grid>
                }

                <Space size={30} />
                <Grid container spacing={3}>
                    <Grid item xs>
                        <Box textAlign="center" m={1}>
                            <Headding as={'h4'} title={title}></Headding>
                        </Box>
                    </Grid>

                    {
                        isSearchBarVisible &&
                        <Grid item xs={2}>
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
                        </Grid>
                    }
                    {
                        isCustomAddButtonVisible &&
                        <Grid item xs={1}>
                            <IconButton color="primary" aria-label="upload picture" component="span" onClick={handleAddButtonPress}>
                                <AddIcon />
                            </IconButton>
                        </Grid>
                    }
                </Grid>

            </Grid>
        </Paper >
    )
}
