export const columnsFields = [
  {
    title: 'ID',
    field: 'id',
    editable: 'never',
    align: 'center',
    isLink: true,
    linkPrefix: '/factories/'
  },
  { title: 'Name', field: 'name', type: 'text' },
  { title: 'Created By', field: 'created_by_name', isFilterColumn: false }
];
