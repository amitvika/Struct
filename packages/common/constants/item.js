export const columnsFields = [
  { title: 'ID', field: 'id', editable: 'never', align: 'center' },
  { title: 'Name', field: 'name', type: 'text' },
  { title: 'Source', field: 'source' },
  { title: 'Assembly type', field: 'assemblyType' },
  { title: 'Direct Parent ID', field: 'parent_id' },
  { title: 'Origin Parent ID', field: 'assemblyType' }
];

export const columnsForItemView = [
  {
    title: 'ID',
    field: 'id',
    editable: 'never',
    isLink: true,
    linkPrefix: '/items/'
  },
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
  {
    title: 'Direct Parent ID',
    field: 'direct_parent_id',
    editable: 'never',
    isLink: true,
    linkPrefix: '/items/'
  },
  {
    title: 'Origin Parent ID',
    field: 'origin_parent_id',
    editable: 'never',
    isLink: true,
    linkPrefix: '/items/'
  },
  {
    title: 'Child Items Created',
    field: 'child_item_created',
    editable: 'never'
  },
  {
    title: 'File Name',
    editable: 'never',
    field: 'fileStore'
  },
  {
    title: 'Material',
    editable: 'never',
    field: 'material'
  }
];

export const fieldsForOmniDesign = [
  {
    title: 'Name',
    field: 'name',
    type: 'text',
    style: { fontSize: '18px', fontWeight: 'bold' }
  },
  {
    title: 'Type',
    field: 'item_type',
    editable: 'never',
    style: { fontSize: '18px', fontWeight: 'bold' }
  },
  {
    title: 'Designer',
    field: 'designer',
    editable: 'never'
  },
  {
    title: 'Created At',
    field: 'created_at',
    editable: 'never'
  },
  {
    title: 'Modified at',
    field: 'updated_at',
    editable: 'never'
  },
  {
    title: 'File Loaded',
    field: 'file_loaded'
  },
  {
    title: 'ID',
    field: 'id',
    editable: 'never',
    align: 'center'
  }
];
