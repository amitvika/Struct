import React, { useState, useEffect } from 'react';
import { Paper, Icon, Typography, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';

import Select from '@monostruct/common/components/atoms/Select';
import Input from '@monostruct/common/components/atoms/Input';
import Headding from '@monostruct/common/components/atoms/Headding';
import LargeFileUpload from '@monostruct/common/gltf/LargeFileUpload';
import LoadingModal from '@monostruct/common/components/LoadingModal';
import { getFileNameWithoutExtension } from '@monostruct/common/gltf/Tree/utils';
import { createChildItems } from './helper';
import Checkbox from '@mui/material/Checkbox';
import DuplicateGeometryModal from './DuplicateGeometryModal';

const useStyles = makeStyles((theme) => ({
  item_row: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
}));
export default function GeometryInput({
  itemProperties = {},
  setItemProperties,
  removeFile,
  handleFileUpload,
  itemId,
  isFileLoading,
  setIsFileLoading,
  label,
  distanceGap,
  setDistanceGap,
  angleGap,
  setAngleGap,
  drawLine,
  setDrawLine,
  allowFirstLevelItems,
  setAllowFirstLevelItems,
  createAutoAssemblyOrder,
  setCreateAutoAssemblyOrder,
  createAutoStackability,
  setCreateAutoStackability,
  handleItemSaveOnServer,
  percentage,
  setPercentage,
  setCurrentProgressText,
  setCompletionProgressText,
  setCenterActionText,
  setIsLoading,
  setProgressBarLoad,
  isDesignSite
}) {
  const classes = useStyles();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  // const [fileId, setFileId] = useState(0);
  const itemGeometry = itemProperties.itemGeometry || {};

  const handleSwitchChange = async (event) => {
    setAllowFirstLevelItems(event.target.checked);
    if (event.target.checked) {
      if (itemProperties.child_item_status === 'NOT_INITIATED') {
        handleItemSaveOnServer({
          child_item_status: 'INITIATED'
        });
        const itemClone = {
          ...itemProperties,
          fileGDT: getFileNameWithoutExtension(itemProperties.fileName) + '3'
        };
        console.log(
          'Calling create child items from Geometry input',
          itemProperties.fileName
        );
        const childrenCreated = await createChildItems({
          item: itemClone,
          percentage,
          setPercentage,
          setCurrentProgressText,
          setCompletionProgressText,
          setCenterActionText,
          setIsLoading,
          setIsFileLoading,
          setProgressBarLoad
        });
        if (childrenCreated) {
          handleItemSaveOnServer({
            child_item_status: 'COMPLETED'
          });
        }
      }
    }
  };

  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const handleOnChange = (name, value) => {
    setItemProperties((prevData) => ({
      ...prevData,
      itemGeometry: {
        ...itemGeometry,
        [name]: value
      }
    }));
    // console.log(
    //   'Changing item properties from Geometryinput from name value',
    //   itemProperties,
    //   name,
    //   value
    // );
  };

  return (
    <div style={{ margin: 10 }}>
      {<LoadingModal isLoading={isFileLoading} />}

      <Paper style={{ padding: 20, margin: 10 }} variant="outlined" square>
        <Grid className="section-padding-left" container spacing={4}>
          <Grid item xs={12}>
            <Typography
              variant={'h4'}
              style={{
                fontSize: 'xxLarge',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Design Source
            </Typography>
          </Grid>

          <Grid item>
            <LargeFileUpload
              itemId={itemId}
              handleFileUpload={handleFileUpload}
              removeFile={removeFile}
              itemProperties={itemProperties}
              setItemProperties={setItemProperties}
              datauuid={null}
              isFileLoading={isFileLoading}
              setIsFileLoading={setIsFileLoading}
              label={label}
              distanceGap={distanceGap}
              setDistanceGap={setDistanceGap}
              angleGap={angleGap}
              setAngleGap={setAngleGap}
              drawLine={drawLine}
              setDrawLine={setDrawLine}
              {...{
                createAutoAssemblyOrder,
                setCreateAutoAssemblyOrder,
                createAutoStackability,
                setCreateAutoStackability
              }}
            />
          </Grid>

          <Grid item className={classes.item_row}>
            <Typography variant="h6" noWrap>
              {'Create child items:'}
            </Typography>
            <Switch
              checked={
                allowFirstLevelItems ||
                itemProperties.child_item_status === 'INITIATED'
              }
              onChange={handleSwitchChange}
              inputProps={{ 'aria-label': 'controlled' }}
              disabled={
                itemProperties.child_item_status !== 'NOT_INITIATED' ||
                !itemProperties.fileUUId ||
                (itemProperties.stepTreeLength > 0 &&
                  itemProperties.assemblyType != 'Multi-Item Assembly')
              }
            />
          </Grid>

          <Grid item className={classes.item_row}>
            <Typography variant="h6">{'Child Items Created :'}</Typography>
            <Typography variant="h6">
              {itemProperties.child_item_created}
            </Typography>
          </Grid>
          <Grid item className={classes.item_row}>
            <DuplicateGeometryModal />
          </Grid>

          <Grid item className={classes.item_row}>
            <Typography variant="h6">{'Assembly Type :'}</Typography>
            <Typography variant="h6">{itemProperties.assemblyType}</Typography>
          </Grid>
          <Grid item className={classes.item_row}>
            <Typography variant="h6">{'Direct Parent ID :'}</Typography>
            <Typography variant="h6">
              {itemProperties.direct_parent_id}
            </Typography>
          </Grid>
          <Grid item className={classes.item_row}>
            <Typography variant="h6">{'Origin Parent ID :'}</Typography>
            <Typography variant="h6" fontWeight="fontWeightBold">
              {itemProperties.origin_parent_id}
            </Typography>
          </Grid>

          {!isDesignSite && (
            <Grid item className={classes.item_row}>
              <Typography variant="h6">{'Not for Public Use :'}</Typography>
              <Checkbox
                onChange={(event) =>
                  handleItemSaveOnServer({
                    not_for_public_use: event.target.checked
                  })
                }
                checked={itemProperties.not_for_public_use}
                defaultChecked={true}
              />
            </Grid>
          )}

          <Grid item className={classes.item_row}>
            <Typography variant="h6">Item Type</Typography>

            <Select
              placeholder="Select"
              options={[
                {
                  label: 'Machine - Compound/Tool/Workholding',
                  value: 'Machine - Compound/Tool/Workholding'
                },
                { label: 'Unassembled Kit', value: 'Unassembled Kit' },
                {
                  label: 'Structure and/or Facade',
                  value: 'Any Other Object/Item'
                },
                { label: 'Building', value: 'Building' }
              ]}
              onChange={(data) => handleOnChange('itemType', data.value)}
              value={
                (itemGeometry.itemType && {
                  label:
                    itemGeometry.itemType == 'Any Other Object/Item'
                      ? 'Structure and/or Facade'
                      : itemGeometry.itemType,
                  value:
                    itemGeometry.itemType == 'Structure and/or Facade'
                      ? 'Any Other Object/Item'
                      : itemGeometry.itemType
                }) || {
                  label: 'Structure and/or Facade',
                  value: 'Any Other Object/Item'
                }
              }
            />
          </Grid>

          {itemGeometry.itemType === 'Any Other Object/Item' && (
            <>
              <Grid item xs={4} style={{ display: 'flex' }}>
                <Headding bold title={'Item Category'}></Headding>
                <Icon style={{ marginLeft: '18px' }} id="TooltipExample">
                  info
                </Icon>
                <Tooltip
                  title={`This allows for selection of the general geometry or matter
                  state of the item. The downstream impacts include how the item
                  is handled and transported within Struct Production Systems`}
                ></Tooltip>
              </Grid>
              <Grid item xs={8}>
                <Select
                  // label="General Geometry"
                  placeholder="Select"
                  options={[
                    { label: ' Solid', value: ' Solid' },
                    {
                      label: 'Bulk Powder/Particles/Grains',
                      value: 'Bulk Powder/Particles/Grains'
                    },
                    { label: 'Liquid', value: 'Liquid' },
                    { label: 'Gas', value: 'Gas' }
                  ]}
                  onChange={(data) =>
                    handleOnChange('generalGeomerty', data.value)
                  }
                  value={
                    (itemGeometry.generalGeomerty && {
                      label: itemGeometry.generalGeomerty
                    }) || { label: ' Solid', value: ' Solid' }
                  }
                />
              </Grid>
            </>
          )}

          {itemGeometry.generalGeomerty === 'Bulk Powder/Particles/Grains' && (
            <>
              <Grid item xs={4}>
                <Headding bold title={'Mixture'} />
              </Grid>
              <Grid item xs={8}>
                <Select
                  // label="Mixture"
                  placeholder="Select"
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' }
                  ]}
                  onChange={(data) => handleOnChange('mixture', data.value)}
                  value={
                    (itemGeometry.mixture && {
                      label: itemGeometry.mixture
                    }) || { label: 'No', value: 'No' }
                  }
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {itemGeometry.generalGeomerty === 'Bulk Powder/Particles/Grains' && (
        <Paper style={{ padding: 20, margin: 10 }}>
          <Grid className="section-padding-left" container spacing={4}>
            <Grid item xs={12}>
              <Headding size={10} bold title={'Dimensional Properties'} />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'X Dim (Length)'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="X Dim (Length)"
                placeholder="Enter"
                type="number"
                onChange={(event) => handleOnChange('xDim', event.target.value)}
                value={itemGeometry.xDim}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'X Tolerance'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="X Tolerance"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('xTolerance', event.target.value)
                }
                value={itemGeometry.xTolerance}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Y Dim (Length)'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Y Dim (Length)"
                placeholder="Enter"
                type="number"
                onChange={(event) => handleOnChange('yDim', event.target.value)}
                value={itemGeometry.yDim}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Y Tolerance'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Y Tolerance"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('yTolerance', event.target.value)
                }
                value={itemGeometry.yTolerance}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Z Dim (Length)'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Z Dim (Length)"
                placeholder="Enter"
                type="number"
                onChange={(event) => handleOnChange('zDim', event.target.value)}
                value={itemGeometry.zDim}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Z Tolerance'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Z Tolerance"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('zTolerance', event.target.value)
                }
                value={itemGeometry.zTolerance}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {['Solid'].includes(itemGeometry.generalGeomerty) && (
        <Paper style={{ padding: 20, margin: 10 }}>
          <Grid className="section-padding-left" container spacing={4}>
            <Grid item xs={12}>
              <Headding size={10} bold title={'Dimensional Properties'} />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Mass (g)'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Mass (g)"
                placeholder="Enter"
                type="number"
                onChange={(event) => handleOnChange('mass', event.target.value)}
                value={itemGeometry.mass}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Volume (mm^3)'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Volume (mm^3)"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('volume', event.target.value)
                }
                value={itemGeometry.volume}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Bounding Box x (mm)'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Bounding Box x (mm)"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('boundingBoxX', event.target.value)
                }
                value={itemGeometry.boundingBoxX}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Bounding Box y (mm)'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Bounding Box y (mm)"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('boundingBoxY', event.target.value)
                }
                value={itemGeometry.boundingBoxY}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Bounding Box z (mm)'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Bounding Box z (mm)"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('boundingBoxZ', event.target.value)
                }
                value={itemGeometry.boundingBoxZ}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Number of Faces'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Number of Faces"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('numberOfFaces', event.target.value)
                }
                value={itemGeometry.numberOfFaces}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Number of Edges'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Number of Edges"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('numberOfEdges', event.target.value)
                }
                value={itemGeometry.numberOfEdges}
              />
            </Grid>

            <Grid item xs={4}>
              <Headding bold title={'Number of Corners'} />
            </Grid>
            <Grid item xs={8}>
              <Input
                // label="Number of Corners"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('numberOfCorners', event.target.value)
                }
                value={itemGeometry.numberOfCorners}
              />
            </Grid>
          </Grid>
        </Paper>
      )}
    </div>
  );
}
