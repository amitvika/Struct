import React, { useState } from 'react'
import Filter from '../TableGridView/Filter';
import TableView from '../TableGridView/TableView';

export default function TableWithFilter() {
  const [columns, setColumns] = useState([
    {
      title: 'Name', field: 'name',
      editComponent: props => (
        <input
          type="text"
          value={props.value}
          onChange={e => props.onChange(e.target.value)}
        />
      )
    },
    { title: 'Surname', field: 'surname' },
    { title: 'Birth Year', field: 'birthYear', type: 'numeric' },
    {
      title: 'Birth Place',
      field: 'birthCity',
      lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },
    },
  ]);

  const [data, setData] = useState([
    { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
    { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
  ]);

  return (
    <div>
      <Filter isSearchBarVisible={true} columnsFields={columns}/>
      <TableView
        list={data}
        columns={columns}
        isSelectionEnabled={true}
        isSearchEnabled={false}
      />
    </div>
  )
}
