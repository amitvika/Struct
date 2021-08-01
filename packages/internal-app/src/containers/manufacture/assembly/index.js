import React, { useState, useEffect } from 'react'
import ProcessConfiguration from './processConfiguration'
import API from '@ravibasil/common/api/assemblyManufacture.api'
import ManufacturabilityAnalysis from './manufacturabilityAnalysis'

export default function Assembly(props) {

    const { selectedSubTab, itemId } = props;
   
    const [assemblyManufactureValues, setassemblyManufactureValues] = useState({ itemId: itemId });
   
    useEffect(() => {

        API.getAssemblyManufactureByItem(itemId)
            .then(res => {
                if (res.data) {
                    setassemblyManufactureValues(res.data)
                    console.log(res.data);
                }
            })
            .catch(error => {
                console.log(error);
            })

    }, []);

    

    const handleAssemblyManufactureChange = (updatedValues) => {
        updatedValues = {
            ...assemblyManufactureValues,
            ...updatedValues
        }
        setassemblyManufactureValues(updatedValues);
        syncAssemblyManufactureWithServer(updatedValues);
    }


    const syncAssemblyManufactureWithServer = (values) => {
        console.log(values)

        if (!values) {
            return
        }

        API.upsertAssemblyManufacture({ ...values, itemId: itemId })
            .then(res => {
                console.log('Response', res)
                if (res.data) {
                    setassemblyManufactureValues(res.data)
                }
            })
            .catch(error => {
                console.log('error', error)
            })
    }
    console.log(assemblyManufactureValues);
    return (
        <div>
            {
                selectedSubTab === 'Process Configuration' ?
                    <ProcessConfiguration
                        assemblyManufactureValues={assemblyManufactureValues}
                        handleAssemblyManufactureChange={handleAssemblyManufactureChange} /> : null
            }
            {
                selectedSubTab === 'Manufacturability Analysis' ?
                    <ManufacturabilityAnalysis {...props}/> : null
            }

        </div>
    )
}
