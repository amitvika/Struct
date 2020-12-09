const xlsxFile = require('read-excel-file/node');

exports.load = (req, res) => {
  xlsxFile('../../../Downloads/NonMetalsMatMatch/good00004-aluminium-copper-metal-matrix-composite-al427915-.xlsx')
    .then((rows) => {
      // console.log('----->>>', rows);
      let materialObj = {
        name: rows[0][0],
        chemicalComposition: [],
        description: '',
        properties: [],
        applications: []
      };
      let itemName = '';
      let propertyName = '';

      for (let i = 0; i < rows.length; i++) {
        const rowItem = rows[i];

        if (rowItem[0] !== null) {
          itemName = rowItem[0];
        }
        else if (itemName === "Chemical composition" && rowItem[1] !== null) {

          materialObj.chemicalComposition.push({
            elementName: rowItem[1],
            max: rowItem[2],
            min: rowItem[3],
            unit: rowItem[4]
          })
        }
        else if (itemName === "Description" && rowItem[1] === "Description") {
          materialObj.description = rowItem[2];
        }
        else if (itemName === 'Properties') {
          const propertyItem = materialObj.properties.find(property => property.name === propertyName);

          if (propertyItem && rowItem[2] !== null) {
            materialObj.properties.map(property => {
              if (property.name === propertyName) {
                return {
                  ...property,
                  value: property.value.push({
                    max: rowItem[2],
                    min: rowItem[3],
                    unit: rowItem[4]
                  })
                }
              }
              return property;
            })
          }
          else if (!propertyItem && rowItem[1] !== null) {
            propertyName = rowItem[1];

            if (rowItem[2] !== null) {
              materialObj.properties.push({
                name: rowItem[1],
                value: [{
                  max: rowItem[2],
                  min: rowItem[3],
                  unit: rowItem[4]
                }]
              })
            }
            else {
              materialObj.properties.push({
                name: rowItem[1],
                value: []
              })
            }
          }
          else if(rowItem[1] !== null){
            propertyName = rowItem[1];
            materialObj.properties.push({
              name: rowItem[1],
              value: []
            })
          }
          
        }
        else if (itemName === 'Applications' && rowItem[1]) {
          materialObj.applications.push(rowItem[1]);
        }
      }
      return res.send(materialObj)
    })
    .catch(error => {
      console.log('->>>>', error)
    })
}