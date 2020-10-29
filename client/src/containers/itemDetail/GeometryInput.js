import React, { useState } from 'react'
import Space from '../../components/atoms/Space';
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
            { label: "Bulk Powder", value: "Bulk Powder" },
            { label: "Particles", value: "Particles" },
            { label: "Grains", value: "Grains" }]}
          onChange={(data) => handleOnChange('generalGeomerty', data.value)}
          value={itemData.generalGeomerty && { label: itemData.generalGeomerty }}
        />
      </Grid>
      <Grid item xs={8} ></Grid>

      {itemData.generalGeomerty &&
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
          <Grid item xs={4} ></Grid>
        </>
      }

      <Space size={10}></Space>
      <Grid item xs={4}>
        <Select
          label="Item Type"
          placeholder="Select"
          options={[
            { label: "Single Material Part", value: "Single Material Part" },
            { label: "Metal", value: "Metal" }]}
          onChange={(data) => handleOnChange('itemType', data.value)}
          value={itemData.itemType && { label: itemData.itemType }}
        />
      </Grid>
      <Grid item xs={8} ></Grid>

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
      {
        itemData.material &&
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
          <Grid item xs={8} ></Grid>
          <Grid item xs={4}>
            <Input
              label="Volume (mm^3)"
              placeholder="Enter"
              type="number"
              onChange={(event) => handleOnChange('volume', event.target.value)}
              value={itemData.volume}
            />
          </Grid>
          <Grid item xs={8}></Grid>
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
    </>
  )
}
