import React from 'react';
import MaterialTable from 'material-table';

export default function MultipleDetailPanels({ assemblyTree = [] }) {

  const renderLeafElements = () => {
    return assemblyTree
      // .filter(item => !item.leaf)
      .map(item => {
        const noOfChildren = renderChildElements({ parentId: item.id }).length;
        return (
          { ...item, name: item.name, item: '', assembly: noOfChildren > 0 ? 'Multi-Item Assembly' : 'Single-Item Assembly', children: noOfChildren }
        )
      })
  }

  const renderChildElements = ({ parentId }) => {
    return assemblyTree
      .filter(item => item.parentId === parentId)
      .map(item => {
        return (
          <div
            style={{

            }}
          >
            {item.name}
          </div>
        )
      })
  }
  return (
    <MaterialTable
      title="Assembly Tree"
      columns={[
        { title: 'Name', field: 'name' },
        { title: 'Item', field: 'item' },
        { title: 'Assembly', field: 'assembly' },
        {
          title: 'Children',
          field: 'children'
        },
      ]}
      parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
      data={renderLeafElements()}
    />
  )
}
