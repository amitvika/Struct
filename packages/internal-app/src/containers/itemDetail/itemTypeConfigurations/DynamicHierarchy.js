import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import FileUpload from '@ravibasil/common/components/FileUpload';
import Headding from '@ravibasil/common/components/atoms/Headding';
import Select from '@ravibasil/common/components/atoms/Select';
import Input from '@ravibasil/common/components/atoms/Input';

import readXlsxFile from 'read-excel-file';

export default function DynamicHierarchy() {

    const [criteriaFields, setHierarchyFields] = useState({});
    const [currentHierarchyValue, setCurrentHierarchyValue] = useState('Actuator');

    const handleHierarchyFileUpload = (file) => {
        let obj = {};
        let currentHierarachy = ""

        readXlsxFile(file).then((rows) => {
            mapExcelRows(rows);
        })
    }


    const mapExcelRows = (rows) => {

        let currentRow;
        let nextRow;
        let currentValue;
        // let parentValue;
        let currentOptionsArray = [];
        let currentKey = "Item Type";

        for (let i = 0; i < 9; i++) {

            for (let i = 1; i < rows.length; i++) {

                currentRow = rows[i];
                nextRow = rows[i + 1];

                let currentDataIndex = currentRow.findIndex(dataColumn => dataColumn !== null && dataColumn.trim().length > 0);
                currentValue = currentRow[currentDataIndex];

                if (
                    (currentDataIndex + 1) < rows.length
                    && currentRow[currentDataIndex + 1] === null
                    && nextRow !== undefined
                    && nextRow[currentDataIndex] === null
                ) {
                }
                else {
                    console.log('push--->>>>', currentValue)
                    return { option: currentValue }
                }

            }
        }
    }


    const renderFields = (fields) => {
        return fields.map(fieldItem => {
            return (
                <Grid container spacing={2} container key={fieldItem.fieldName}>
                    <Grid item xs={4}>
                        <Headding bold title={fieldItem.fieldName} />
                    </Grid>
                    <Grid item xs={8}>
                        {
                            fieldItem.fieldType === 'Input' &&
                            <Input
                                placeholder="Enter"
                                type={fieldItem.dataType === "Numerical" ? "number" : "text"}
                            // onChange={(event) => handleOnChange('xTolerance', event.target.value)}
                            // value={itemGeometry.xTolerance}
                            />
                        }
                        {
                            fieldItem.fieldType === 'select' &&
                            <Select
                                placeholder="Select"
                                options={fieldItem.options.split('|').map(option => ({ label: option, value: option }))}
                            // onChange={(data) => handleOnChange('itemType', data.value)}
                            // value={itemGeometry.itemType && { label: itemGeometry.itemType }}
                            />
                        }

                    </Grid>
                </Grid>
            );
        })
    }

    const renderHierarchy = () => {
        if (currentHierarchyValue && criteriaFields[currentHierarchyValue]) {
            let { fields = [], criteriaTitle = "" } = criteriaFields[currentHierarchyValue];
            return (
                <Paper style={{ padding: 20, margin: 10 }}>
                    <Headding>{criteriaTitle}</Headding>
                    {renderFields(fields)}
                </Paper>)
        }
        else {
            return null;
        }
    }

    return (
        <Paper style={{ padding: 20, margin: 10 }}>
            <FileUpload handleFileUpload={handleHierarchyFileUpload} label="Select Hierarchy File" />
            {renderHierarchy()}
        </Paper>
    )
}


// {
//     "Item Type" : {
//         label: "Item Type",
//         criteriaValue: "",
//         options: ["Actuator", "Tools", "Motion Control", "Workholding/ToolHolding"]
//     },
//     "Actuator" : {
//         label: "Actuator",
//         criteriaValue: "Actuator",
//         options: ["Linear" "Rotational"]
//     }   
// }