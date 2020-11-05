import React, { useState } from 'react'
import Select from '../../components/atoms/Select';
import Input from '../../components/atoms/Input';
import Grid from '@material-ui/core/Grid';

export default function GeometryInput({ itemData = {}, setItemData }) {

  const handleOnChange = (name, value) => {
    setItemData(prevData => ({ ...prevData, [name]: value }));
  }

  return (
    <>
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
          value={itemData.generalGeomerty && { label: itemData.generalGeomerty }}
        />
      </Grid>

      {itemData.generalGeomerty === 'Bulk Powder/Particles/Grains' &&
        <>
          <Grid item xs={4}>
            <Input
              label="X Dim (Length)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('xDim', event.target.value)}
              value={itemData.xDim}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="X Tolerance"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('xTolerance', event.target.value)}
              value={itemData.xTolerance}
            />
          </Grid>

          <Grid item xs={4} ></Grid>
          <Grid item xs={4}>
            <Input
              label="Y Dim (Length)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('yDim', event.target.value)}
              value={itemData.yDim}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="Y Tolerance"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('yTolerance', event.target.value)}
              value={itemData.yTolerance}
            />
          </Grid>

          <Grid item xs={4} ></Grid>
          <Grid item xs={4}>
            <Input
              label="Z Dim (Length)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('zDim', event.target.value)}
              value={itemData.zDim}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="Z Tolerance"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('zTolerance', event.target.value)}
              value={itemData.zTolerance}
            />
          </Grid>
        </>
      }

      {
        ['1 Dimensional Solid', '2 Dimensional Solid', '3 Dimensional Solid'].includes(itemData.generalGeomerty) &&
        <>
          <Grid item xs={4}>
            <Input
              label="Mass (g)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('mass', event.target.value)}
              value={itemData.mass}
            />
          </Grid>

          <Grid item xs={4}>
            <Input
              label="Volume (mm^3)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('volume', event.target.value)}
              value={itemData.volume}
            />
          </Grid>

          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <Input
              label="Bounding Box x (mm)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('boundingBoxX', event.target.value)}
              value={itemData.boundingBoxX}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="Bounding Box y (mm)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('boundingBoxY', event.target.value)}
              value={itemData.boundingBoxY}
            />
          </Grid>

          <Grid item xs={4} ></Grid>
          <Grid item xs={4}>
            <Input
              label="Bounding Box z (mm)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('boundingBoxZ', event.target.value)}
              value={itemData.boundingBoxZ}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="Number of Faces"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('numberOfFaces', event.target.value)}
              value={itemData.numberOfFaces}
            />
          </Grid>

          <Grid item xs={4} ></Grid>
          <Grid item xs={4}>
            <Input
              label="Number of Edges"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('numberOfEdges', event.target.value)}
              value={itemData.numberOfEdges}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              label="Number of Corners"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('numberOfCorners', event.target.value)}
              value={itemData.numberOfCorners}
            />
          </Grid>

        </>

      }

      {itemData.generalGeomerty === 'Bulk Powder/Particles/Grains' ?
        <Grid item xs={4}>
          <Select
            label="Mixture"
            placeholder="Select"
            options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" }]}
            onChange={(data) => handleOnChange('mixture', data.value)}
            value={itemData.assembly && { label: itemData.mixture }}
          />
        </Grid> :
        <Grid item xs={4}>
          <Select
            label="Assembly"
            placeholder="Select"
            options={[
              { label: "Single Material Part", value: "Single Material Part" },
              { label: "Multi-part Assembly", value: "Multi-part Assembly" }]}
            onChange={(data) => handleOnChange('assembly', data.value)}
            value={itemData.assembly && { label: itemData.assembly }}
          />
        </Grid>
      }

      <Grid item xs={4} >
        <Select
          label="Material"
          placeholder="Select"
          options={[
            { label: "Polymer", value: "Polymer" },
            { label: "Metal", value: "Metal" },
            { label: "Ceramic", value: "Ceramic" }]}
          onChange={(data) => handleOnChange('material', data.value)}
          value={itemData.material && { label: itemData.material }}
        />
      </Grid>
      <Grid item xs={8} ></Grid>

    </>
  )
}
