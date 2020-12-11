const MaterialHierarchyModel = require('../models/MaterialHierarchy.model');
const MaterialModel = require('../models/Material.model');

const xlsxFile = require('read-excel-file/node');
const fs = require('fs');
const path = require('path');
const neatCsv = require('neat-csv');

exports.load = async (req, res) => {
  try {

    const fileList = await getFileNameFromDirectory();

    fileList.map(file => {
      //read
      xlsxFile(file)
        .then(rows => {
          const material = processMaterialFile(rows);
          addMaterialToDatabase(material);
        })
        .catch(error => {
          console.log('Excel file read error', error)
        })
    });

    res.send({ message: 'File imported sucessfully' })
  }
  catch (error) {
    console.log(error)
  }
}

const addMaterialToDatabase = (data) => {
  const materialToBeInserted = new MaterialModel(data);

  materialToBeInserted.save()
    .then(item => {

    })
    .catch(error => {
      console.log('Database inserted error', data.name)
    })
}

const processMaterialFile = (rows) => {
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

  return materialObj;
}

const getFileNameFromDirectory = () => {
  return new Promise((resolve, reject) => {
    const dirname = '../../../Downloads/NonMetalsMatMatch/'
    fs.readdir(dirname, function (err, filenames) {
      if (err) {
        reject(err);
        return;
      }
      resolve(filenames.map(filename => dirname + filename));
    });
  })

}


exports.loadHierarchy = (req, res) => {
  fs.readFile('../../../Downloads/nonmetals hierarchy.csv', async (err, data) => {
    try {
      if (err) {
        console.error(err)
        return
      }
      const rows = await neatCsv(data)
      const dataToBeInserted = parseHierarchy(rows);
      const dataInserted = await MaterialHierarchyModel.insertMany(dataToBeInserted);
      res.send(dataInserted);
    } catch (error) {
      res.status(500).send(error)
    }
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


exports.getMaterials = async (req, res) => {
  try {
    let query = { $and: [] };

    // if (req.query.vendorId && req.query.search) {
    //   query = {
    //     $and: [{ vendorId: req.query.vendorId },
    //     { deletedAt: null },
    //     { name: { '$regex': new RegExp(`${req.query.search}`, "i") } }]
    //   }
    // }
    // else if (req.query.vendorId) {
    //   query = { $and: [{ vendorId: req.query.vendorId }, { deletedAt: null }] }
    // }
    // else 
    if (req.query.search) {
      query.$and.push({ name: { '$regex': new RegExp(`${req.query.search}`, "i") } })
    }

    if (req.query.density) {
      query.$and.push({ 'properties.name': { '$regex': new RegExp(`Density`, "i") }  })
    }

    if(query.$and.length === 0){
      query = {}
    }

    const options = {
      // page: req.query.page,
      // limit: req.query.limit,
      // sort: { date: -1 },
    };

    const item = await MaterialModel.paginate(query, options)

    res.json(item);
  } catch (error) {
    res.send(error)
  }
}