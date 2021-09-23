import React, { useState } from 'react';
import Select from '@monostruct/common/components/atoms/Select';
import Input from '@monostruct/common/components/atoms/Input';
import Grid from '@material-ui/core/Grid';
import EndMillOptions from './EndMillOptions';

export default function ToolTypeOptions({ itemConfiguration, handleOnChange }) {
  const renderToolFirstType = () => {
    if (itemConfiguration.toolType === 'Rotational Tool') {
      return (
        <Grid item xs={4}>
          <Select
            label="Rotational Tool"
            placeholder="Select"
            options={[
              { label: 'Drill Bit', value: 'Drill Bit' },
              { label: 'End Mill', value: 'End Mill' },
              { label: 'Rotary Saw', value: 'Rotary Face' },
              { label: 'Rotary Face', value: 'Rotary Face' },
            ]}
            onChange={(data) =>
              handleOnChange('toolTypeRotationTool', data.value)
            }
            value={
              itemConfiguration.toolTypeRotationTool && {
                label: itemConfiguration.toolTypeRotationTool,
              }
            }
          />
        </Grid>
      );
    } else if (itemConfiguration.toolType === 'Static Tool') {
      return (
        <Grid item xs={4}>
          <Select
            label="Static Tool"
            placeholder="Select"
            options={[
              { label: 'Cutter', value: 'Cutter' },
              { label: 'Mold', value: 'Mold' },
            ]}
            onChange={(data) =>
              handleOnChange('toolTypeStaticTool', data.value)
            }
            value={
              itemConfiguration.toolTypeStaticTool && {
                label: itemConfiguration.toolTypeStaticTool,
              }
            }
          />
        </Grid>
      );
    } else {
      return null;
    }
  };

  const renderToolSecondType = () => {
    if (itemConfiguration.toolTypeRotationTool === 'Rotary Saw') {
      return (
        <Grid item xs={4}>
          <Select
            label="Rotary Saw"
            placeholder="Select"
            options={[
              { label: 'Abrasive (Ceramics)', value: 'Abrasive (Ceramics)' },
              { label: 'Toothed', value: 'Toothed' },
              { label: 'Grinding wheel', value: 'Grinding wheel' },
              { label: 'Sanding Wheel', value: 'Sanding Wheel' },
            ]}
            onChange={(data) => handleOnChange('toolTypeRotarySaw', data.value)}
            value={
              itemConfiguration.toolTypeRotarySaw && {
                label: itemConfiguration.toolTypeRotarySaw,
              }
            }
          />
        </Grid>
      );
    } else if (itemConfiguration.toolTypeRotationTool === 'Rotary Face') {
      return (
        <Grid item xs={4}>
          <Select
            label="Static Tool"
            placeholder="Select"
            options={[
              { label: 'Sander', value: 'Sander' },
              { label: 'Polisher', value: 'Polisher' },
              { label: 'Brush', value: 'Brush' },
            ]}
            onChange={(data) =>
              handleOnChange('toolTypeRotaryFace', data.value)
            }
            value={
              itemConfiguration.toolTypeRotaryFace && {
                label: itemConfiguration.toolTypeRotaryFace,
              }
            }
          />
        </Grid>
      );
    } else if (itemConfiguration.toolTypeRotationTool === 'End Mill') {
      return (
        <EndMillOptions
          itemConfiguration={itemConfiguration}
          handleOnChange={handleOnChange}
        />
      );
    } else {
      return null;
    }
  };

  const renderToolThirdType = () => {
    if (
      itemConfiguration.toolTypeRotationTool === 'Rotary Face' &&
      itemConfiguration.toolTypeRotaryFace === 'Brush'
    ) {
      return (
        <Grid item xs={4}>
          <Input
            label="Travel Length (mm)"
            placeholder="Enter"
            type="number"
            onChange={(event) =>
              handleOnChange('toolTypeTravelLength', event.target.value)
            }
            value={itemConfiguration.toolTypeTravelLength}
          />
        </Grid>
      );
    }
  };

  return (
    <>
      <Grid item xs={4}>
        <Select
          label="Tool Type"
          placeholder="Select"
          options={[
            { label: 'Rotational Tool', value: 'Rotational Tool' },
            { label: 'Static Tool', value: 'Static Tool' },
            { label: 'Dynamic Mold', value: 'Dynamic Mold' },
          ]}
          onChange={(data) => handleOnChange('toolType', data.value)}
          value={
            itemConfiguration.toolType && { label: itemConfiguration.toolType }
          }
        />
      </Grid>
      {renderToolFirstType()}
      {renderToolSecondType()}
      {renderToolThirdType()}
    </>
  );
}
