const xlsxFile = require('read-excel-file/node');
const fs = require('fs');
const neatCsv = require('neat-csv');

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
          else if (rowItem[1] !== null) {
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


exports.loadHierarchy = (req, res) => {
  fs.readFile('../../../Downloads/nonmetals hierarchy.csv', async (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    neatCsv(data)
      .then((rows) => {
        res.send(parseHierarchy(rows));
        // console.log(rows)
      })
      .catch(error => {
        console.log(error)
      })
  }
  )
}

const parseHierarchy = (rows) => {
  let count = 1;

  let materialObjectWithKeys = {
  };
  rows.map(hierarchyItem => {
    let parentId = 0;
    let hierarchyList = extractWords(hierarchyItem.hierarchy, hierarchyItem.mats)
    hierarchyList.map(itemName => {
      if (materialObjectWithKeys[itemName]) {
        parentId = materialObjectWithKeys[itemName].id;
      }
      else if (isNaN(itemName)) {
        materialObjectWithKeys[itemName] = { id: count, title: itemName, parentId };
        parentId = count
        count++;
      }
    })
  });

  let materialCategories = [];
  // console.log(JSON.stringify(materialObjectWithKeys))
  Object.keys(materialObjectWithKeys).forEach((key, value) => {
    materialCategories.push(materialObjectWithKeys[key]);
  });

  return materialCategories;
}

const extractWords = (text, materialName) => {
  // console.log('--->>>>>text', text)
  text = text.replace(materialName, '');
  let words = [];

  let tempWord = '';
  for (let i = 0; i < text.length; i++) {
    let currentLetter = text.charAt(i);
    let previousLetter = text.charAt(i - 1);

    let isCurrentLetterUpperCase = isCharacterUpperCase(currentLetter);
    let isPreviousLetterLowerCase = isCharacterLowerCase(previousLetter);

    if (isNaN(currentLetter) && isNaN(previousLetter) && isCurrentLetterUpperCase && isPreviousLetterLowerCase) {
      words.push(tempWord);
      tempWord = currentLetter;
    }
    else {
      tempWord += currentLetter;
    }
  }

  words.push(tempWord);
  words.push(materialName);
  return words;
}

const isCharacterLowerCase = (character) => {
  if (isCharacterSpaceOrNumeric(character)) {
    return false
  }
  else if (character == character.toLowerCase()) {
    return true
  }
  else {
    return false
  }
}

const isCharacterUpperCase = (character) => {
  if (isCharacterSpaceOrNumeric(character)) {
    return false
  }
  else if (character == character.toUpperCase()) {
    return true
  }
  else {
    return false
  }
}
const isCharacterSpaceOrNumeric = (character) => {
  if (character === ' ' || character === '') {
    return true;
  }
  //special characters
  else if (character === '(' || character === '-') {
    return true;
  }
  else {
    return false
  }
}