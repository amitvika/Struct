import React from 'react'
import Headding from '../../components/atoms/Headding';
import {
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";
import Grid from '@material-ui/core/Grid';

export default function MaterialProperties({ materialProperties = {}, toggleMaterialProperties, isMaterialPropertiesModalOpen }) {

  const renderProperties = () => {
    if (materialProperties.properties.length === 0) {
      return;
    }
    return (
      <>
        <Grid item xs={12}>
          <Headding bold title={'Properties'} />
        </Grid>
        {
          materialProperties.properties.map(p => {
            return (
              <>
                <Grid item xs={4}></Grid>
                <Grid item xs={8}>
                  <Headding title={p.name}></Headding>
                </Grid>
                {p.value.map(item => {
                  return (
                    <>
                      <Grid item xs={6} />
                      <Grid item xs={2}>
                        <Headding title={item.min/1000000} />
                      </Grid>
                      <Grid item xs={2}>
                        <Headding title={item.max/1000000} />
                      </Grid>
                      <Grid item xs={2}>
                        <Headding title={item.unit} />
                      </Grid>
                    </>
                  )
                })}

              </>
            )
          })
        }
      </>
    )
  }

  const renderChemicalComposition = () => {
    if (materialProperties.chemicalComposition.length === 0) {
      return;
    }
    return (
      <>
        <Grid item xs={12}>
          <Headding bold title={'Chemical Composition'} />
        </Grid>
        {
          materialProperties.chemicalComposition.map(p => {
            return (
              <>
                <Grid item xs={3}></Grid>
                <Grid item xs={1}>
                  <Headding title={p.elementName}></Headding>
                </Grid>
                <Grid item xs={1}>
                  <Headding title={p.min/1000000}></Headding>
                </Grid>
                <Grid item xs={1}>
                  <Headding title={p.max/1000000}></Headding>
                </Grid>
                <Grid item xs={1}>
                  <Headding title={p.unit}></Headding>
                </Grid>
                <Grid item xs={5} />
              </>
            )
          })
        }
      </>
    )
  }

  const renderTechnologiesProperties = () => {
    if (materialProperties.technologicalProperties.length === 0) {
      return;
    }

    return (
      <>
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
      </>
    )
  }

  const renderApplications = () => {
    if (materialProperties.applications.length === 0) {
      return;
    }

    return (
      <>
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
      </>
    )
  }

  if (Object.keys(materialProperties).length === 0) {
    return null;
  }

  return (
    <Modal isOpen={isMaterialPropertiesModalOpen} toggle={toggleMaterialProperties}>
      <ModalHeader toggle={toggleMaterialProperties}>{materialProperties.name}</ModalHeader>
      <ModalBody>

        <Grid className="section-padding-left" container spacing={4}>

          <Grid item xs={3}>
            <Headding bold title={'Description'} />
          </Grid>
          <Grid item xs={9}>
            <Headding title={materialProperties.description}></Headding>
          </Grid>

          {renderChemicalComposition()}

          {renderTechnologiesProperties()}

          {renderProperties()}

          {renderApplications()}
        </Grid>
      </ModalBody>
    </Modal >
  )
}
