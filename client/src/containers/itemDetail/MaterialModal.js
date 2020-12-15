import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";
import Grid from '@material-ui/core/Grid';
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

export default function MaterialModal({ toggleMaterial, isMaterialModalOpen }) {

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [materialList, setMaterialList] = useState([]);
  const [filter, setFilter] = useState({});

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

  return (
    <Modal isOpen={isMaterialModalOpen} toggle={toggleMaterial} className={'Material__Modal'}>
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
          <Grid item xs={3} ></Grid>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  selectedMaterials.map(materialRow => (
                    <TableRow
                      key={materialRow._id}
                      onClick={() => removeMaterialFromSelected(materialRow)}
                    >
                      <TableCell>{materialRow._id}</TableCell>
                      <TableCell>{materialRow.name}</TableCell>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {materialList.map(materialRow => (
                  <TableRow
                    key={materialRow._id}
                    onClick={() => addMaterialToSelected(materialRow)}
                  >
                    <TableCell>{materialRow._id}</TableCell>
                    <TableCell>{materialRow.name}</TableCell>
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
