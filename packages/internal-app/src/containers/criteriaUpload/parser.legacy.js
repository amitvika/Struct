import readXlsxFile from 'read-excel-file';

export const hierarchyFileParser = async (file) => {
  try {
    const rows = await readXlsxFile(file, { sheet: 'Item_Type_H' });

    const numOfRows = rows.length;

    let dropList = [];
    let initialDropdown = { label: 'Item Type', options: [] };

    for (let i = 1; i < numOfRows; i++) {
      let dataRow = rows[i];
      if (dataRow[0]) {
        initialDropdown.options.push(dataRow[0]);
      }
    }

    dropList.push(initialDropdown);

    for (let i = 1; i < numOfRows; i++) {
      let dataRow = rows[i];
      let valueIndex = dataRow.findIndex(
        (dataColumn) => dataColumn !== null && dataColumn.trim().length > 0
      );
      let value = dataRow[valueIndex];
      let options = [];

      for (let j = i + 1; j < numOfRows; j++) {
        let nextDataRow = rows[j];
        let nextValueIndex = nextDataRow.findIndex(
          (dataColumn) => dataColumn !== null && dataColumn.trim().length > 0
        );

        if (valueIndex + 1 === nextValueIndex) {
          options.push(nextDataRow[nextValueIndex]);
        } else if (valueIndex < nextValueIndex) {
        } else if (valueIndex === nextValueIndex) {
          break;
        }
      }

      if (options.length > 0) {
        dropList.push({ label: value, options });
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
          'Inclusion Criteria': 'inclusionCriteria',
        },
      },
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
          fields: [rowItem.field],
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
