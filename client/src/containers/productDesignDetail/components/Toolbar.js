import React from 'react'
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import Checkbox from '../../../components/atoms/Checkbox';
import Headding from '../../../components/atoms/Headding';
import Select from '../../../components/atoms/Select';
import Input from '../../../components/atoms/Input';

export default function Toolbar({
  isGridViewSelected,
  setIsGridViewSelected,
  handleSearchBar,
  isDeletedItemVisible,
  handleShowDelete,
  isHistoryModalOpened,
  handleHistoryToggle,
  clientList
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
        <Grid item sm sm={2}>
          <Input
            placeholder={'Search ID...'}
            type="text"
            onChange={(event) => handleSearchBar(event.target.value, "id")}
          />
        </Grid>
        <Grid item sm sm={2}>
          <Input
            placeholder={'Search Name...'}
            onChange={(event) => handleSearchBar(event.target.value, "name")}
          />
        </Grid>
        <Grid item sm sm={2}>
          <Select
            placeholder="Select"
            options={clientList.map(client => {
              return ({ label: client.name, value: client.name })
            })}
            onChange={(event) => handleSearchBar(event.value, "clientName")}
          />
        </Grid>
        <Grid item sm sm={2}>
          <Input
            placeholder={'Search Created By...'}
            onChange={(event) => handleSearchBar(event.target.value, "created_by")} />
        </Grid>

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
