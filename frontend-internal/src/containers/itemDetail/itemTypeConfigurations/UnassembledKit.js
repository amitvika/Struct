import React, { useState } from 'react'

import {
  Grid,
  Paper
} from '@material-ui/core';
import MaterialTable from "material-table";

export default function UnassembledKit() {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([
    { title: 'Item Unpacking Sequence #', field: 'ius', editable: "never" },
    { title: 'ID', field: 'id', editable: "never" },
    { title: 'Name', field: 'name' },
  ]);

  return (
    <Grid item xs={12}>
      <MaterialTable
        columns={columns}
        data={data}
        title="Kit Items and Unpacking Order"
        options={{
          actionsColumnIndex: 5,
          addRowPosition: "first"
        }}
        editable={{
          onRowAdd: newData =>
            new Promise((resolve, reject) => {
              // setData(prevData => [...prevData, { name: newData }])
              resolve()
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {

            }),
          onRowDelete: (newData, oldData) =>
            new Promise((resolve, reject) => {
            })
        }}
      />
    </Grid>
  )
}
