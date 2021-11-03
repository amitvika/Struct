import readXlsxFile from 'read-excel-file';

export const hierarchyFileParser = async (file, title) => {
  try {
    const rows = await readXlsxFile(file, { sheet: 'Item_Type_H' });

    let criteriaSchema = await criteriaFileParser(file);

    const numOfRows = rows.length;

    let initialIndex = 1;
    if (rows[1][0] !== null && rows[1][1] === null && rows[2][0] !== null) {
      initialIndex = 2;
    }

    let dropList = [];
    let initialDropdown = {
      title: title || 'Item Type',
      options: [],
      headerName: initialIndex === 2 ? rows[1][0] : title
    };

    for (let i = initialIndex; i < numOfRows; i++) {
      let dataRow = rows[i];
      if (dataRow[0]) {
        initialDropdown.options.push({
          label: dataRow[0],
          value: dataRow[0],
          form: criteriaSchema[dataRow[0]]
        });
      }
    }

    dropList.push(initialDropdown);

    for (let i = 1; i < numOfRows; i++) {
      let dataRow = rows[i];
      let valueIndex = dataRow.findIndex(
        (dataColumn) => dataColumn !== null && dataColumn.trim().length > 0
      );
      let parentValue = dataRow[valueIndex];
      let options = [];

      for (let j = i + 1; j < numOfRows; j++) {
        let nextDataRow = rows[j];
        let nextValueIndex = nextDataRow.findIndex(
          (dataColumn) => dataColumn !== null && dataColumn.trim().length > 0
        );

        if (valueIndex + 1 === nextValueIndex) {
          let key = `${parentValue}|${nextDataRow[nextValueIndex]}`;
          options.push({
            value: key,
            label: nextDataRow[nextValueIndex],
            form: criteriaSchema[key]
          });
        } else if (valueIndex < nextValueIndex) {
        } else if (valueIndex === nextValueIndex) {
          break;
        }
      }

      if (options.length > 0) {
        dropList.push({
          title: parentValue,
          options,
          headerName: dataRow[valueIndex + 1]
        });
      }
    }

    return dropList;
  } catch (error) {
    console.log('Error in parsing hierarchy file', error);
    return [];
  }
};

export const criteriaFileParser = async (file) => {
  try {
    const map = {
      'Hierarchy Level': 'hierarchyLevel',
      'Criteria Title': 'criteriaTitle',
      FIELD: {
        field: {
          'Field Name': 'fieldName',
          Field: 'fieldType',
          Type: 'dataType',
          'Special Input': 'specialInput',
          'Input Units': 'inputUnits',
          'Numerical Input Min': '',
          'Numerical Input Max': '',
          'Select Options': 'options',
          'Exclusion criteria': 'exclusionCriteria',
          'Inclusion Criteria': 'inclusionCriteria'
        }
      }
    };

    let obj = {};
    let currentHierarachy = '';

    const { rows } = await readXlsxFile(file, { sheet: 'Item_Type_C', map });

    rows.map((rowItem) => {
      if (rowItem.hierarchyLevel) {
        currentHierarachy = rowItem.hierarchyLevel;

        obj[rowItem.hierarchyLevel] = {
          hierarchyLevel: rowItem.hierarchyLevel,
          criteriaTitle: rowItem.criteriaTitle,
          fields: [rowItem.field]
        };
      } else if (!rowItem.hierarchyLevel && currentHierarachy) {
        let { fields } = obj[currentHierarachy];

        if (Array.isArray(fields)) {
          fields.push(rowItem.field);
        }

        obj[currentHierarachy].fields = fields;
      }
    });

    return obj;
  } catch (error) {
    console.log('Error in parsing criteria file', error);
    return {};
  }
};

export const LookUpTableParser = async (file) => {
  try {
    const rows = await readXlsxFile(file, { sheet: 'Look_Up_Table' });
    const holeSize = rows[1];

    const numOfRows = rows.length;

    let lookUpTableObj = {};

    let holeValue = null;
    let prevHoleSizeValueKey = '';

    for (let i = 2; i < numOfRows; i++) {
      let holeSizeRow = rows[i];
      if (holeSizeRow[0]) {
        holeValue = holeSizeRow[0];
      }

      for (let j = 2; j < holeSizeRow.length; j++) {
        let keyName = `${holeValue}_${holeSize[j]}`;

        if (holeSizeRow[j] === null && prevHoleSizeValueKey) {
          lookUpTableObj[keyName] = lookUpTableObj[prevHoleSizeValueKey];
        } else {
          prevHoleSizeValueKey = keyName;
          lookUpTableObj[keyName] = {
            ...lookUpTableObj[keyName],
            [holeSizeRow[1]]: holeSizeRow[j]
          };
        }
      }
    }

    return lookUpTableObj;
  } catch (error) {
    console.log('Error in parsing criteria file', error);
    return {};
  }
};
