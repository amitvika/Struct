export const columnsFields = [
  { title: 'ID', field: 'id', editable: 'never', align: 'center' },
  { title: 'Name', field: 'name', type: 'text' },
  { title: 'Source', field: 'source' },
  { title: 'Assembly type', field: 'assemblyType' }
];

export const columnsForItemView = [
  { title: 'ID', field: 'id', editable: 'never' },
  { title: 'Name', field: 'name', type: 'text' },
  {
    title: 'Source',
    field: 'source'
  },
  {
    title: 'Assembly',
    field: 'assemblyType',
    lookup: {
      'Single Item Part': 'Single Item Part',
      'Multi-Item Assembly': 'Multi-Item Assembly'
    }
  }
];
