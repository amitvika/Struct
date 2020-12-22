const MaterialHierarchyModel = require('../models/MaterialHierarchy.model');
const MaterialModel = require('../models/Material.model');

const xlsxFile = require('read-excel-file/node');
const fs = require('fs');
const path = require('path');
const neatCsv = require('neat-csv');

exports.load = async (req, res) => {
  try {

    const fileList = await getFileNameFromDirectory();

    for (let i = fileList.length - 1; i >= 0; i--) {

      let file = fileList[i]
      // }
      // fileList.map(file => {
      //read

      xlsxFile(file)
        .then(rows => {
          const material = processMaterialFile(rows);
          addMaterialToDatabase(material, file);
        })
        .catch(error => {
          console.log('Excel file read error', error)
        })
    }
    // });

    res.send({ message: 'File imported sucessfully' })
  }
  catch (error) {
    console.log(error)
  }
}

const addMaterialToDatabase = (data, file) => {
  // const materialToBeInserted = new MaterialModel(data);

  MaterialModel.updateOne({
    name: data.name
  }, data, { upsert: true })
    .then(item => {
      console.log('Files updates successfully', file)
    })
    .catch(error => {
      console.log('Database inserted error', file, data.name)
    })
}

const processMaterialFile = (rows) => {
  let materialObj = {
    name: rows[0][0],
    chemicalComposition: [],
    description: '',
    properties: [],
    applications: [],
    technologicalProperties: []
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
        min: extractNumber(rowItem[2]),
        max: extractNumber(rowItem[3]),
        unit: rowItem[4],
        comment: extractStringContent(rowItem[2])
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
                min: extractNumber(rowItem[2]),
                max: extractNumber(rowItem[3]),
                unit: rowItem[4],
                comment: extractStringContent(rowItem[2])
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
              min: extractNumber(rowItem[2]),
              max: extractNumber(rowItem[3]),
              unit: rowItem[4],
              comment: extractStringContent(rowItem[2])
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
    else if (itemName === 'Technological properties' && rowItem[1]) {
      materialObj.technologicalProperties.push({ name: rowItem[1], value: rowItem[2] });
    }
  }

  return materialObj;
}

const extractNumber = (exactValue) => {
  if (typeof exactValue === 'number' && !isNaN(exactValue)) {
    return exactValue
  }
  else {
    return 0
  }
}

const extractStringContent = (value) => {
  if (isNaN(value)) {
    return value
  }
  else {
    return '';
  }
}

const getFileNameFromDirectory = () => {
  return new Promise((resolve, reject) => {
    const dirname = '../../../Downloads/aluminums/'
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
  fs.readFile('../../../Downloads/aluminums hierarchy.csv', async (err, data) => {
    try {
      if (err) {
        console.error(err)
        return
      }
      const rows = await neatCsv(data)

      const lastHierarichal = await MaterialHierarchyModel.find().sort({ id: -1 }).limit(1)
      let lastInsertedId = 0;
      if (lastHierarichal) {
        lastInsertedId = lastHierarichal[0].id
      }

      const dataToBeInserted = parseHierarchy(rows, lastInsertedId);
      const dataInserted = await MaterialHierarchyModel.insertMany(dataToBeInserted);

      console.log('---', lastHierarichal)
      res.send(dataToBeInserted);
    } catch (error) {
      console.log('Error', error)
      res.status(500).send(error)
    }
  }
  )
}

const parseHierarchy = (rows, lastInsertedId) => {
  let count = parseInt(lastInsertedId) + 1;

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
    if (req.query.search != undefined) {
      query.$and.push({ name: { '$regex': new RegExp(`${req.query.search}`, "i") } })
    }

    //density
    if (req.query.densityMax || req.query.densityMin) {
      query.$and.push(buildQueryForProperties({ name: "Density", unit: "g/cm³", max: req.query.densityMax, min: req.query.densityMin }))
    }

    //tensile  strenght
    if (req.query.tensileMax || req.query.tensileMin) {
      query.$and.push(buildQueryForProperties({ name: "Tensile", unit: "MPa", max: req.query.tensileMax, min: req.query.tensileMin }))
    }

    //Elastic Modulus
    if (req.query.elasticMax || req.query.elasticMin) {
      query.$and.push(buildQueryForProperties({ name: "Elastic Modulus", unit: "GPa", max: req.query.elasticMax, min: req.query.elasticMin }))
    }

    //Yield Strength
    if (req.query.yieldMax || req.query.yieldMin) {
      query.$and.push(buildQueryForProperties({ name: "Yield Strength", unit: "MPa", max: req.query.yieldMax, min: req.query.yieldMin }))
    }

    //Flexural Modulus
    if (req.query.flexuralMax || req.query.flexuralMin) {
      query.$and.push(buildQueryForProperties({ name: "Flexural Modulus", unit: "GPa", max: req.query.flexuralMax, min: req.query.flexuralMin }))
    }

    if (query.$and.length === 0) {
      query = {}
    }

    console.log(JSON.stringify(query))

    const options = {
      // page: req.query.page,
      // limit: req.query.limit,
      // sort: { date: -1 },
    };

    const item = await MaterialModel.paginate(query, options)

    res.json(item);
  } catch (error) {
    console.log(error)
    res.send(error)
  }
}

const buildQueryForProperties = ({ name, unit, max, min }) => {
  let query = {}
  if (max && min) {
    query = {
      "properties": {
        "$elemMatch": {
          "name": { '$regex': new RegExp(`${name}`, "i") },
          "value": {
            "$elemMatch": {
              "unit": unit,
              "$and": [{
                "min": {
                  "$gte": min * 1000000
                }
              }, {
                "max": {
                  "$lte": max * 1000000
                }
              }]
            }
          }
        }
      }
    }
  }
  else if (min) {
    query = {
      "properties": {
        "$elemMatch": {
          "name": { '$regex': new RegExp(`${name}`, "i") },
          "value": {
            "$elemMatch": {
              "unit": unit,
              "min": {
                "$eq": min
              }
            }
          }
        }
      }
    }
  }
  else if (max) {
    query = {
      "properties": {
        "$elemMatch": {
          "name": { '$regex': new RegExp(`${name}`, "i") },
          "value": {
            "$elemMatch": {
              "unit": unit,
              "max": {
                "$eq": max
              }
            }
          }
        }
      }
    }
  }
  return query;
}


exports.getMaterialCategories = async (req, res) => {
  try {
    const parent_id = req.query.parent_id;

    const materialCategories = await MaterialHierarchyModel.find({ parentId: parent_id });

    if (!materialCategories) {
      res.send([]);
    }

    const titleArray = materialCategories.map(mc => mc.title);
    const itemMaterials = await MaterialModel.find({ name: { $in: titleArray } });

    res.send({ categories: materialCategories, materials: itemMaterials })

  }
  catch (error) {
    console.log('Error', error)
    res.status(500).send(error)

  }
}