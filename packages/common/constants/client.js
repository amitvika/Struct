export const columnsFields = [
  {
    title: 'ID',
    field: 'id',
    editable: 'never',
    align: 'center',
    isLink: true,
    linkPrefix: '/clients/'
  },
  { title: 'Name', field: 'name', type: 'text' },
  {
    title: 'Created By',
    field: 'created_by_name',
    editable: 'never'
  },
  {
    title: 'History',
    field: 'id',
    editable: 'never',
    isFilterColumn: false,
    isGridViewVisible: false,
    render: (rowData) =>
      rowData && (
        <span
          style={{ cursor: 'pointer' }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {' '}
          Show History{' '}
        </span>
      )
  }
];

export const documentationFields = [
  { title: 'ID', field: 'id', editable: 'never', align: 'center' },
  { title: 'Name', field: 'name' },
  {
    title: 'Category',
    field: 'category',
    editable: 'never'
  },
  {
    title: 'Note',
    field: 'note',
    editable: 'never'
  },
  {
    title: 'File URL',
    field: 'file_url',
    editable: 'never'
  },
  {
    title: 'Created By',
    field: 'created_by',
    editable: 'never'
  },
  {
    title: 'Updated By',
    field: 'updated_By',
    editable: 'never'
  },
  {
    title: 'Description',
    field: 'description',
    editable: 'never'
  }
];

export const clientFields = [
  { title: 'ID', field: 'id', editable: 'never', align: 'center' },
  { title: 'Name', field: 'name', type: 'text' },
  {
    title: 'Created By',
    field: 'created_by',
    editable: 'never'
  },
  {
    title: 'History',
    field: 'id',
    editable: 'never',
    render: (rowData) =>
      rowData && (
        <span
          style={{ cursor: 'pointer' }}
          onClick={(event) => {
            event.stopPropagation();
            // handleHistoryToggle({ rowId: rowData.id })
          }}
        >
          {' '}
          Show History{' '}
        </span>
      )
  }
];
