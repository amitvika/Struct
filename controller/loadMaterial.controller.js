const xlsxFile = require('read-excel-file/node');

exports.load = (req, res) => {
  xlsxFile('../../../Downloads/NonMetalsMatMatch/acma0001-boron-nitride-h-bn-.xlsx')
    .then((rows) => {
      // console.log('----->>>', rows);
      let materialObj = {
        name: rows[0][0],
        chemicalComposition: [],
        description: '',
        properties: [],
        applications:[]
      };
      let propName = '';
        
      for (let i = 0; i < rows.length; i++) {
        const rowItem = rows[i];
        
        console.log('--rowItem->>>',propName === "Chemical composition", rowItem[1] !== null)

        if (rowItem[0] !== null) {
          propName = rowItem[0];
        }
        else if (propName === "Chemical composition" && rowItem[1] !== null) {
         
          materialObj.chemicalComposition.push({
            name: rowItem[1],
            max: rowItem[2],
            min: rowItem[3],
            unit: rowItem[4]
          })
        }
        else if (propName === "Description" && rowItem[1] === "Description") {
          materialObj.description = rowItem[2];
        }
        else if (propName === 'Properties' && rowItem[1]) {
          materialObj.properties.push({
            name: rowItem[1],
            max: rowItem[2],
            min: rowItem[3],
            unit: rowItem[4]
          })
        }
        else if(propName === 'Applications'  && rowItem[1]){
          materialObj.applications.push(rowItem[1]);
        }
      }
      return res.send(materialObj)
    })
    .catch(error => {
      console.log('->>>>', error)
    })
}