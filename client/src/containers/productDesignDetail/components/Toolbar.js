import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import Checkbox from '../../../components/atoms/Checkbox';
import Headding from '../../../components/atoms/Headding';

import CheckboxFilter from '../../../components/CheckboxFilter'

export default function Toolbar({
  isGridViewSelected,
  setIsGridViewSelected,
  isDeletedItemVisible,
  handleShowDelete,
  isHistoryModalOpened,
  handleHistoryToggle,
  productDesignList,
  filteredProductDesignList,
  setFilteredProductDesignList,
  columnsFields
}) {

  return (
    <Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px' }} >
      <Grid container justify="space-between">
        <Grid item sm sm={12}>
          <Headding title='New Product Design'></Headding>
        </Grid>
        <Grid item sm sm={2}>
          <Checkbox
            checked={isGridViewSelected}
            size="large"
            label="View GridView"
            onClick={() => setIsGridViewSelected(!isGridViewSelected)}
          />
        </Grid>
        <CheckboxFilter
          list={productDesignList}
          filteredList={filteredProductDesignList}
          setFilteredList={setFilteredProductDesignList}
          columnsFields={columnsFields}
        />


        <Grid item sm sm={6}>
          <Checkbox
            checked={isDeletedItemVisible}
            label="Show Deletions"
            onChange={handleShowDelete}
          />
          <Checkbox
            checked={isHistoryModalOpened}
            label="Show history"
            onChange={handleHistoryToggle}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}
