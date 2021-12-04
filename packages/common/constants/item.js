export const columnsFields = [
  { title: 'ID', field: 'id', editable: 'never', align: 'center' },
  { title: 'Name', field: 'name', type: 'text' },
  { title: 'Source', field: 'source' },
  { title: 'Assembly type', field: 'assemblyType' },
  { title: 'Direct Parent ID', field: 'parent_id' },
  { title: 'Origin Parent ID', field: 'assemblyType' }
];

export const columnsForItemView = [
  { title: 'ID', field: 'id', editable: 'never' },
  { title: 'Name', field: 'name', type: 'text', editable: 'never' },
  {
    title: 'Source',
    field: 'source',
    editable: 'never'
  },
  {
    title: 'Assembly',
    field: 'assemblyType',
    editable: 'never',
    lookup: {
      'Single Item Part': 'Single Item Part',
      'Multi-Item Assembly': 'Multi-Item Assembly'
    }
  },
  { title: 'Direct Parent ID', field: 'direct_parent_id', editable: 'never' },
  { title: 'Origin Parent ID', field: 'origin_parent_id', editable: 'never' },
  {
    title: 'Child Items Created',
    field: 'child_item_created',
    editable: 'never'
  }
];
