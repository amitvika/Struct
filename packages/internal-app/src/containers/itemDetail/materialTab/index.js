import React, { useState, useEffect } from 'react';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid
} from '@mui/material';
import MaterialModal from './MaterialModal';
import MaterialPropertiesModal from './MaterialPropertiesModal';
import { Typography } from '@mui/material';

export default function MaterialTab({ itemProperties, setItemProperties }) {
  if (itemProperties.multiAssembly) {
    <MultiAssembly />;
  }
  return <SingleItemPartMaterial {...{ itemProperties, setItemProperties }} />;
}

function MultiAssembly() {
  return null;
}

function SingleItemPartMaterial({ itemProperties, setItemProperties }) {
  const itemGeometry = itemProperties.itemGeometry || {};

  const [materialProperties, setMaterialProperties] = useState({});
  const [selectedMaterials, setSelectedMaterials] = useState(
    itemGeometry.materials || []
  );
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isMaterialPropertiesModalOpen, setIsMaterialPropertiesModalOpen] =
    useState(false);

  useEffect(() => {
    setItemProperties((prevProps) => {
      return {
        ...prevProps,
        itemGeometry: {
          ...itemGeometry,
          materials: selectedMaterials
        }
      };
    });
    // console.log(
    //   'Changing item properties from Geometryinput selected materials',
    //   itemProperties,
    //   selectedMaterials
    // );
    return () => {};
  }, [selectedMaterials]);

  const toggleMaterialProperties = () => {
    setIsMaterialPropertiesModalOpen((prevValue) => {
      return !prevValue;
    });
  };

  const handleMaterialPropertieView = (material) => {
    setIsMaterialPropertiesModalOpen(true);
    setMaterialProperties(material);
  };

  const toggleMaterial = () => {
    setIsMaterialModalOpen((prevValue) => {
      return !prevValue;
    });
  };

  return (
    <>
      {isMaterialModalOpen && (
        <MaterialModal
          toggleMaterial={toggleMaterial}
          isMaterialModalOpen={isMaterialModalOpen}
          materialProperties={materialProperties}
          handleMaterialPropertieView={handleMaterialPropertieView}
          selectedMaterials={selectedMaterials}
          itemProperties={itemProperties}
          setItemProperties={setItemProperties}
          setSelectedMaterials={setSelectedMaterials}
        />
      )}
      {isMaterialPropertiesModalOpen && (
        <MaterialPropertiesModal
          toggleMaterialProperties={toggleMaterialProperties}
          isMaterialPropertiesModalOpen={isMaterialPropertiesModalOpen}
          materialProperties={materialProperties}
          setMaterialProperties={setMaterialProperties}
        />
      )}
      <Grid className="section-padding-left" container spacing={4}>
        <Grid item>
          <Typography fontSize={20} bold title={'Item Material'} />
          <Button
            size="large"
            variant="contained"
            color="primary"
            disabled={itemProperties.assemblyType === 'Multi-Item Assembly'}
            onClick={toggleMaterial}
          >
            Select Material
          </Button>
        </Grid>
        {selectedMaterials.length > 0 && (
          <Grid item xs={12}>
            <Typography bold title={'Selected Materials'} />

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
                  {selectedMaterials.map((materialRow) => (
                    <TableRow key={materialRow._id}>
                      <TableCell>{materialRow._id}</TableCell>
                      <TableCell>{materialRow.name}</TableCell>
                      <TableCell
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleMaterialPropertieView(materialRow)}
                      >
                        View Material Properties
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Grid>
    </>
  );
}
