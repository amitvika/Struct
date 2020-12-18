import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";
import Grid from '@material-ui/core/Grid';
import Select from '../../components/atoms/Select';
import Input from '../../components/atoms/Input';
import Headding from '../../components/atoms/Headding';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@material-ui/core";
import Button from '../../components/atoms/Button';

import MaterialAPI from '../../api/material.api';

import './style.css';

export default function MaterialModal({ toggleMaterial, isMaterialModalOpen, handleMaterialPropertieView }) {

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [materialList, setMaterialList] = useState([]);
  const [filter, setFilter] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryLevel, setCategoryLevel] = useState(0);
  const [subcategoryOptionsOne, setSubcategoryOptionsOne] = useState([]);
  const [subcategoryOptionsTwo, setSubcategoryOptionsTwo] = useState([]);
  const [subcategoryOptionsThree, setSubcategoryOptionsThree] = useState([]);
  const [subcategoryOptionsFour, setSubcategoryOptionsFour] = useState([]);


  useEffect(() => {
    fetchCategories(categoryLevel, (data) => {
      setCategoryOptions(data.categories.map(item => {
        return {
          label: item.title,
          value: item.id
        }
      }))
      setSubcategoryOptionsTwo([]);
      setSubcategoryOptionsThree([]);
      setSubcategoryOptionsFour([]);
    })
  }, [])

  const fetchCategories = (id, callback) => {
    MaterialAPI.fetchCategories(`parent_id=${id}`)
      .then(res => {
        if (res.data) {
          callback(res.data)
        }
      })
      .catch(error => {

      })
  }

  const addMaterialToSelected = (data) => {
    setMaterialList(preMaterialList => {
      return preMaterialList.filter(material => material._id !== data._id);
    });

    setSelectedMaterials([...selectedMaterials, data])
  }

  const removeMaterialFromSelected = (data) => {
    setSelectedMaterials(preMaterialList => {
      return preMaterialList.filter(material => material._id !== data._id);
    });
    setMaterialList([...materialList, data])
  }

  const fetchData = ({ query = '' }) => {
    MaterialAPI.fetchMaterialApi(query)
      .then(res => {
        if (res.data) {
          setMaterialList(res.data.docs)
        }
        console.log('Response :-', res);
      })
      .catch(error => {
        console.log('Error :-', error);
      })
    return () => {

    }
  }

  const handleChange = (name, value) => {
    setFilter(prevFilter => {
      return {
        ...prevFilter,
        [name]: value
      }
    })
  }

  const searchMaterial = () => {
    let query = []
    Object.keys(filter).forEach((key, index) => {
      if (filter[key]) {
        query.push(`${key}=${filter[key]}`)
      }
    })
    fetchData({ query: query.join('&') })
  }

  const handleCategoryChange = (data) => {
    fetchCategories(data.value, (subCategories) => {
      if (subCategories.materials) {
        setMaterialList(subCategories.materials)
        // return;
      }

      setSubcategoryOptionsOne(subCategories.categories.map(item => {
        return {
          label: item.title,
          value: item.id
        }
      }))
    });
  }

  const handleSubCategoryOneChange = (data) => {
    fetchCategories(data.value, (subCategories) => {
      if (subCategories.materials) {
        setMaterialList(subCategories.materials)
        // return;
      }

      setSubcategoryOptionsTwo(subCategories.categories.map(item => {
        return {
          label: item.title,
          value: item.id
        }
      }));

      setSubcategoryOptionsThree([]);
      setSubcategoryOptionsFour([]);
    });
  }

  const handleSubCategoryTwoChange = (data) => {
    fetchCategories(data.value, (subCategories) => {
      if (subCategories.materials) {
        setMaterialList(subCategories.materials)
        // return;
      }

      setSubcategoryOptionsThree(subCategories.categories.map(item => {
        return {
          label: item.title,
          value: item.id
        }
      }))

      setSubcategoryOptionsFour([]);
    });
  }

  const handleSubCategoryThreeChange = (data) => {
    fetchCategories(data.value, (subCategories) => {
      if (subCategories.materials) {
        setMaterialList(subCategories.materials)
        // return;
      }

      setSubcategoryOptionsFour(subCategories.categories.map(item => {
        return {
          label: item.title,
          value: item.id
        }
      }))
    });
  }

  const handleSubCategoryFourChange = (data) => {
    fetchCategories(data.value, (subCategories) => {
      if (subCategories.materials) {
        setMaterialList(subCategories.materials)
        // return;
      }

      setSubcategoryOptionsFour(subCategories.categories.map(item => {
        return {
          label: item.title,
          value: item.id
        }
      }))
    });
  }

  return (
    <Modal isOpen={isMaterialModalOpen} toggle={toggleMaterial} style={{ width: '70%' }}>
      <ModalHeader toggle={toggleMaterial}>Select Material</ModalHeader>
      <ModalBody>
        <Grid className="section-padding-left" container spacing={4}>

          <Grid item xs={3} ><Headding title="Name Search" /></Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter"
              type="text"
              onChange={(event) => handleChange("search", event.target.value)}
            />
          </Grid>
          <Grid item xs={6} ></Grid>

          <Grid item xs={3} >
            <Headding title='Density Range (g/cm3)'></Headding>
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter Min"
              type="number"
              onChange={(event) => handleChange("densityMin", event.target.value)}
            />
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter Max"
              type="number"
              onChange={(event) => handleChange("densityMax", event.target.value)}
            />
          </Grid>
          <Grid item xs={3} ></Grid>
          {/* Tensile Strength */}
          <Grid item xs={3} >
            <Headding title='Tensile Strength (MPa)'></Headding>
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter Min"
              type="number"
              onChange={(event) => handleChange("tensileMin", event.target.value)}
            />
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter Max"
              type="number"
              onChange={(event) => handleChange("tensileMax", event.target.value)}
            />
          </Grid>
          <Grid item xs={3} ></Grid>

          {/* Elastic Modulus (GPa) */}
          <Grid item xs={3} >
            <Headding title='Elastic Modulus (GPa)'></Headding>
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter Min"
              type="number"
              onChange={(event) => handleChange("elasticMin", event.target.value)}
            />
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter Max"
              type="number"
              onChange={(event) => handleChange("elasticMax", event.target.value)}
            />
          </Grid>
          <Grid item xs={3} ></Grid>

          {/* Yield Strength (MPa) */}
          <Grid item xs={3} >
            <Headding title='Yield Strength (MPa)'></Headding>
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter Min"
              type="number"
              onChange={(event) => handleChange("yieldMin", event.target.value)}
            />
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter Max"
              type="number"
              onChange={(event) => handleChange("yieldMax", event.target.value)}
            />
          </Grid>
          <Grid item xs={3} ></Grid>

          {/* Flexural Modulus(GPa) */}
          <Grid item xs={3} >
            <Headding title='Flexural Modulus(GPa)'></Headding>
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter Min"
              type="number"
              onChange={(event) => handleChange("flexuralMin", event.target.value)}
            />
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter Max"
              type="number"
              onChange={(event) => handleChange("flexuralMax", event.target.value)}
            />
          </Grid>
        </Grid>
        <Grid className="section-padding-left" container spacing={4}>
          <>
            <Grid item xs={3} >
              <Headding title='Category'></Headding>
            </Grid>
            <Grid item xs={6} >
              <Select
                // label="Category"
                placeholder="Select"
                options={categoryOptions}
                onChange={handleCategoryChange}
              />
            </Grid>
            <Grid item xs={3} />
          </>
          {
            subcategoryOptionsOne.length > 0 &&
            <>
              <Grid item xs={3} >
                <Headding title='Sub Category 1'></Headding>
              </Grid>
              <Grid item xs={6} >
                <Select
                  // label="Sub Category"
                  placeholder="Select"
                  options={subcategoryOptionsOne}
                  onChange={handleSubCategoryOneChange}
                />
              </Grid>
              <Grid item xs={3} />
            </>
          }

          {
            subcategoryOptionsTwo.length > 0 &&
            <>
              <Grid item xs={3} >
                <Headding title='Sub Category 2'></Headding>
              </Grid>
              <Grid item xs={6} >
                <Select
                  // label="Sub Category"
                  placeholder="Select"
                  options={subcategoryOptionsTwo}
                  onChange={handleSubCategoryTwoChange}
                />
              </Grid>
              <Grid item xs={3} />
            </>
          }

          {
            subcategoryOptionsThree.length > 0 &&
            <>
              <Grid item xs={3} >
                <Headding title='Sub Category 2'></Headding>
              </Grid>
              <Grid item xs={6} >
                <Select
                  // label="Sub Category"
                  placeholder="Select"
                  options={subcategoryOptionsThree}
                  onChange={handleSubCategoryThreeChange}
                />
              </Grid>
              <Grid item xs={3} />
            </>
          }

          {
            subcategoryOptionsFour.length > 0 &&
            <>
              <Grid item xs={3} >
                <Headding title='Sub Category 2'></Headding>
              </Grid>
              <Grid item xs={6} >
                <Select
                  // label="Sub Category"
                  placeholder="Select"
                  options={subcategoryOptionsFour}
                  onChange={handleSubCategoryFourChange}
                />
              </Grid>
              <Grid item xs={3} />
            </>
          }

          <Grid item xs={12}>
            <Button onClick={searchMaterial}>
              Search Material
            </Button>
          </Grid>
        </Grid>

        <div>
          <h5 className="mt-2">Selected Material</h5>
          <TableContainer className="mb-2" component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>S No</TableCell>
                  <TableCell>Material Name</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  selectedMaterials.map(materialRow => (
                    <TableRow
                      key={materialRow._id}
                    >
                      <TableCell>{materialRow._id}</TableCell>
                      <TableCell onClick={() => removeMaterialFromSelected(materialRow)}>
                        {materialRow.name}
                      </TableCell>
                      <TableCell onClick={() => handleMaterialPropertieView(materialRow)}>View Material Properties</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
          <h5>Select Material</h5>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>S No</TableCell>
                  <TableCell>Material Name</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materialList.map(materialRow => (
                  <TableRow
                    key={materialRow._id}>
                    <TableCell>{materialRow._id}</TableCell>
                    <TableCell
                      onClick={() => addMaterialToSelected(materialRow)}>{materialRow.name}</TableCell>
                    <TableCell onClick={() => handleMaterialPropertieView(materialRow)}>View Material Properties</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </ModalBody>
    </Modal >
  )
}
