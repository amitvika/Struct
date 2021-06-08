import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";
import Grid from '@material-ui/core/Grid';
import {
  Paper,
  Icon,
} from "@material-ui/core";

import Headding from '@ravibasil/common/components/atoms/Headding';
import MaterialAPI from '@ravibasil/common/api/material.api';

export default function MaterialProperties({ materialProperties = {}, toggleMaterialProperties, isMaterialPropertiesModalOpen }) {
  const [hierarchy, setHierarchy] = useState(null);

  useEffect(() => {
    MaterialAPI.fetchMaterialHierarchy(materialProperties.name)
      .then(res => {
        if (res.data) {
          setHierarchy(res.data.join(' > '))
        }
      })
      .catch(error => {

      })
  }, [materialProperties.name])

  const renderProperties = () => {
    if (materialProperties.properties.length === 0) {
      return;
    }
    return (
      <Paper style={{ padding: 20, margin: 10 }}>
        <Grid className="section-padding-left" container spacing={4}>
          <Grid item xs={12}>
            <Headding bold title={'Properties'} />
          </Grid>
          {
            materialProperties.properties.map(p => {
              return (
                <>
                  <Grid item xs={3}></Grid>
                  <Grid item xs={2}>
                    <Headding title={p.name}></Headding>
                  </Grid>
                  <Grid item xs={2}>Min</Grid>
                  <Grid item xs={2}>Max</Grid>
                  <Grid item xs={2}>Unit</Grid>
                  {p.value.map(item => {
                    return (
                      <>
                        <Grid item xs={5} />
                        <Grid item xs={2}>
                          <Headding title={(Math.round(item.min / 1000000)).toFixed(2)} />
                        </Grid>
                        <Grid item xs={2}>
                          <Headding title={(Math.round(item.max / 1000000)).toFixed(2)} />
                        </Grid>
                        <Grid item xs={2}>
                          <Headding title={item.unit} />
                        </Grid>
                        {/* <Grid item xs={3} /> */}
                      </>
                    )
                  })}

                </>
              )
            })
          }
        </Grid>
      </Paper>
    )
  }

  const renderChemicalComposition = () => {
    if (materialProperties.chemicalComposition.length === 0) {
      return;
    }
    return (
      <Paper style={{ padding: 20, margin: 10 }}>
        <Grid className="section-padding-left" container spacing={4}>
          <Grid item xs={12}>
            <Headding bold title={'Chemical Composition'} />
          </Grid>
          <Grid item xs={5}></Grid>
          <Grid item xs={2}>Min</Grid>
          <Grid item xs={2}>Max</Grid>
          <Grid item xs={2}>Unit</Grid>
          {
            materialProperties.chemicalComposition.map(p => {
              return (
                <>
                  <Grid item xs={3}></Grid>
                  <Grid item xs={2}>
                    <Headding title={p.elementName}></Headding>
                  </Grid>
                  <Grid item xs={2}>
                    <Headding title={(Math.round(p.min / 1000000)).toFixed(2)}></Headding>
                  </Grid>
                  <Grid item xs={2}>
                    <Headding title={(Math.round(p.max / 1000000)).toFixed(2)}></Headding>
                  </Grid>
                  <Grid item xs={2}>
                    <Headding title={p.unit}></Headding>
                  </Grid>
                </>
              )
            })
          }
        </Grid>
      </Paper>
    )
  }

  const renderTechnologiesProperties = () => {
    if (materialProperties.technologicalProperties.length === 0) {
      return;
    }

    return (
      <Paper style={{ padding: 20, margin: 10 }}>
        <Grid className="section-padding-left" container spacing={4}>
          <Grid item xs={12}>
            <Headding bold title={'Technological properties'} />
          </Grid>
          {
            materialProperties.technologicalProperties.map(tp => {
              return (
                <>
                  <Grid item xs={3}></Grid>
                  <Grid item xs={2}>
                    <Headding title={tp.name}></Headding>
                  </Grid>
                  <Grid item xs={7}>
                    <Headding title={tp.value}></Headding>
                  </Grid>
                </>
              )
            })
          }
        </Grid>
      </Paper>
    )
  }

  const renderApplications = () => {
    if (materialProperties.applications.length === 0) {
      return;
    }

    return (
      <Paper style={{ padding: 20, margin: 10 }}>
        <Grid className="section-padding-left" container spacing={4}>
          <Grid item xs={12}>
            <Headding bold title={'Applications'} />
          </Grid>
          {
            materialProperties.applications.map(item => {
              return (
                <>
                  <Grid item xs={3}></Grid>
                  <Grid item xs={7}>
                    <Headding title={item} />
                  </Grid>
                </>
              )
            })
          }
        </Grid>
      </Paper>
    )
  }

  if (Object.keys(materialProperties).length === 0) {
    return null;
  }

  return (
    <Modal isOpen={isMaterialPropertiesModalOpen} toggle={toggleMaterialProperties} style={{ width: '70%' }}>
      <ModalHeader toggle={toggleMaterialProperties}>{materialProperties.name}</ModalHeader>
      <ModalBody>
        <Paper style={{ padding: 20, margin: 10 }}>
          <Grid className="section-padding-left" container spacing={4}>

            <Grid item xs={3}>
              <Headding bold title={'Material Hierarchy'} />
            </Grid>
            <Grid item xs={9}>
              {hierarchy}
            </Grid>

            <Grid item xs={3}>
              <Headding bold title={'Description'} />
            </Grid>
            <Grid item xs={9}>
              <Headding title={materialProperties.description}></Headding>
            </Grid>
          </Grid>
        </Paper>

        {renderChemicalComposition()}

        {renderTechnologiesProperties()}

        {renderProperties()}

        {renderApplications()}

      </ModalBody>
    </Modal >
  )
}
