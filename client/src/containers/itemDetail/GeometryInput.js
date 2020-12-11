import React, { useState } from 'react'
import Select from '../../components/atoms/Select';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import Grid from '@material-ui/core/Grid';
import MaterialModal from './MaterialModal';

export default function GeometryInput({ itemProperties = {}, setItemProperties }) {

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const toggleMaterial = () => {
    setIsMaterialModalOpen(prevValue => {
      return !prevValue;
    })
  }

  const itemGeometry = itemProperties.itemGeometry || {}
  const handleOnChange = (name, value) => {
    setItemProperties(prevData => ({
      ...prevData,
      itemGeometry: {
        ...itemGeometry,
        [name]: value
      }
    }))
  }

  return (
    <>
      <MaterialModal
        toggleMaterial={toggleMaterial}
        isMaterialModalOpen={isMaterialModalOpen}
      />
      <Grid item xs={4} >
        <Select
          label="General Geometry"
          placeholder="Select"
          options={[
            { label: '1 Dimensional Solid', value: '1 Dimensional Solid' },
            { label: '2 Dimensional Solid', value: '2 Dimensional Solid' },
            { label: '3 Dimensional Solid', value: '3 Dimensional Solid' },
            { label: "Bulk Powder/Particles/Grains", value: "Bulk Powder/Particles/Grains" },
            { label: "Liquid", value: "Liquid" },
            { label: "Gas", value: "Gas" }]}
          onChange={(data) => handleOnChange('generalGeomerty', data.value)}
          value={itemGeometry.generalGeomerty && { label: itemGeometry.generalGeomerty }}
        />
      </Grid>

      {itemGeometry.generalGeomerty === 'Bulk Powder/Particles/Grains' &&
        <>
          <Grid item xs={4}>
            <Input
              label="X Dim (Length)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('xDim', event.target.value)}
              value={itemGeometry.xDim}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="X Tolerance"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('xTolerance', event.target.value)}
              value={itemGeometry.xTolerance}
            />
          </Grid>

          <Grid item xs={4} ></Grid>
          <Grid item xs={4}>
            <Input
              label="Y Dim (Length)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('yDim', event.target.value)}
              value={itemGeometry.yDim}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="Y Tolerance"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('yTolerance', event.target.value)}
              value={itemGeometry.yTolerance}
            />
          </Grid>

          <Grid item xs={4} ></Grid>
          <Grid item xs={4}>
            <Input
              label="Z Dim (Length)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('zDim', event.target.value)}
              value={itemGeometry.zDim}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="Z Tolerance"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('zTolerance', event.target.value)}
              value={itemGeometry.zTolerance}
            />
          </Grid>
        </>
      }

      {
        ['1 Dimensional Solid', '2 Dimensional Solid', '3 Dimensional Solid'].includes(itemGeometry.generalGeomerty) &&
        <>
          <Grid item xs={4}>
            <Input
              label="Mass (g)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('mass', event.target.value)}
              value={itemGeometry.mass}
            />
          </Grid>

          <Grid item xs={4}>
            <Input
              label="Volume (mm^3)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('volume', event.target.value)}
              value={itemGeometry.volume}
            />
          </Grid>

          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <Input
              label="Bounding Box x (mm)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('boundingBoxX', event.target.value)}
              value={itemGeometry.boundingBoxX}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="Bounding Box y (mm)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('boundingBoxY', event.target.value)}
              value={itemGeometry.boundingBoxY}
            />
          </Grid>

          <Grid item xs={4} ></Grid>
          <Grid item xs={4}>
            <Input
              label="Bounding Box z (mm)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('boundingBoxZ', event.target.value)}
              value={itemGeometry.boundingBoxZ}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="Number of Faces"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('numberOfFaces', event.target.value)}
              value={itemGeometry.numberOfFaces}
            />
          </Grid>

          <Grid item xs={4} ></Grid>
          <Grid item xs={4}>
            <Input
              label="Number of Edges"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('numberOfEdges', event.target.value)}
              value={itemGeometry.numberOfEdges}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="Number of Corners"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('numberOfCorners', event.target.value)}
              value={itemGeometry.numberOfCorners}
            />
          </Grid>
        </>
      }

      {itemGeometry.generalGeomerty === 'Bulk Powder/Particles/Grains' ?
        <Grid item xs={4}>
          <Select
            label="Mixture"
            placeholder="Select"
            options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" }]}
            onChange={(data) => handleOnChange('mixture', data.value)}
            value={itemGeometry.assembly && { label: itemGeometry.mixture }}
          />
        </Grid> :
        <Grid item xs={4}>
          <Select
            label="Assembly"
            placeholder="Select"
            options={[
              { label: "Single Material Part", value: "Single Material Part" },
              { label: "Multi Material Assembly", value: "Multi Material Assembly" }]}
            onChange={(data) => handleOnChange('assembly', data.value)}
            value={itemGeometry.assembly && { label: itemGeometry.assembly }}
          />
        </Grid>
      }
      {
        itemGeometry.assembly === 'Multi Material Assembly' ?
          <Grid item xs={4} >
            <Select
              isMulti
              label="Material"
              placeholder="Select"
              options={[
                { label: "Polymer", value: "Polymer" },
                { label: "Metal", value: "Metal" },
                { label: "Ceramic", value: "Ceramic" }]}
              onChange={(data) => data && handleOnChange('material', data.value)}
              value={Array.isArray(itemGeometry.material)
                && itemGeometry.material.map(item => ({ label: item }))}
            />
          </Grid> :

          <Grid item xs={4} >
            <Button onClick={toggleMaterial}>
              Select Material
            </Button>
            {/* <Select
              label="Material"
              placeholder="Select"
              options={[
                { label: "Polymer", value: "Polymer" },
                { label: "Metal", value: "Metal" },
                { label: "Ceramic", value: "Ceramic" }]}
              onChange={(data) => data && handleOnChange('material', [data.value])}
              value={Array.isArray(itemGeometry.material) && { label: itemGeometry.material[0] }}
            /> */}
          </Grid>
      }
      <Grid item xs={8} ></Grid>

    </>
  )
}
