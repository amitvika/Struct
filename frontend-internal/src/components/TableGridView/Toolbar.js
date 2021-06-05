import React from 'react'
import { Grid, Paper } from '@material-ui/core';
import Checkbox from '../atoms/Checkbox';
import Headding from '../atoms/Headding';
import Space from '../atoms/Space';
import Filter from './Filter';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddBox';
import Box from '@material-ui/core/Box';

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
    handleAddButtonPress = () => { },
    ...restProps
}) {
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
                    <Grid container spacing={3}>
                        <Grid item xs>
                            <Box textAlign="center" m={1}>
                                <Headding as={'h4'} title={title}></Headding>
                            </Box>
                        </Grid>
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
            </Grid>
        </Paper >
    )
}
