import React from 'react';
import MaterialTable from 'material-table';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';


export default function MultipleDetailPanels({ assemblyTree = [] }) {
    const [value, setValue] = React.useState('female');

    const handleChange = (event) => {
        setValue(event.target.value);
    };
    const renderLeafElements = () => {

        console.log(assemblyTree)
        return assemblyTree
            // .filter(item => !item.leaf)
            .map(item => {
                const noOfChildren = renderChildElements({ parentId: item.i });
                return (
                    { ...item, name: item.n, item: '', assembly: noOfChildren.length > 0 ? 'Multi-Item Assembly' : 'Single-Item Assembly', children: noOfChildren }
                )
            })
    }

    const renderChildElements = ({ parentId }) => {
        return assemblyTree
            .filter(item => item.d === parentId)
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
        <div>
            <FormControlLabel value="female" control={<Radio />} label="Create Resultant Single Item Parts and Multi-Item Assemblies" onChange={handleChange} />
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
                parentChildData={(row, rows) => rows.find(a => a.i === row.parentId)}
                data={renderLeafElements()}
            />
        </div>
    )
}
