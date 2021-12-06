import React, { useState } from 'react';
import Select from '@monostruct/common/components/atoms/Select';
import Input from '@monostruct/common/components/atoms/Input';
import { Grid, Paper } from '@mui/material';

export default function FunctionalElements({ productDesign = {} }) {
  // const functionElements = productDesign.functionElements;
  const [functionElements, setFunctionElements] = useState({});

  const handleOnChange = (name, value) => {
    // setItemProperties(prevData => ({
    //   ...prevData,
    //   functionElements: {
    //     ...functionElements,
    //     [name]: value
    //   }
    // }))
    setFunctionElements((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const renderUserInterface = () => {
    return (
      <>
        <Grid item xs={4}>
          <Select
            label="User Interface"
            placeholder="Select"
            options={[
              { label: 'Type', value: 'Type' },
              { label: 'Display', value: 'Display' },
              { label: 'Buttons', value: 'Buttons' },
            ]}
            onChange={(data) => handleOnChange('userInterface', data.value)}
            value={
              functionElements.userInterface && {
                label: functionElements.userInterface,
              }
            }
          />
        </Grid>
        {functionElements.userInterface === 'Display' && (
          <>
            <Grid item xs={4}>
              <Input
                label="Length"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange(
                    'userInterfaceDisplayLength',
                    event.target.value
                  )
                }
                value={functionElements.userInterfaceDisplayLength}
              />
            </Grid>
            <Grid item xs={4}>
              <Input
                label="Width"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange(
                    'userInterfaceDisplayWidth',
                    event.target.value
                  )
                }
                value={functionElements.userInterfaceDisplayWidth}
              />
            </Grid>
          </>
        )}
      </>
    );
  };

  const renderStaticMotionElements = () => {
    return (
      <>
        <Grid item xs={4}>
          <Select
            label="Static Motion Elements"
            placeholder="Select"
            options={[
              {
                label: 'Linear Slide Mechanism',
                value: 'Linear Slide Mechanism',
              },
            ]}
            onChange={(data) =>
              handleOnChange('staticMotionElements', data.value)
            }
            value={
              functionElements.staticMotionElements && {
                label: functionElements.staticMotionElements,
              }
            }
          />
        </Grid>
        {functionElements.staticMotionElements === 'Linear Slide Mechanism' && (
          <>
            <Grid item xs={4}>
              <Input
                label="Maximum Load - Down (kg)"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('maxLoad', event.target.value)
                }
                value={functionElements.maxLoad}
              />
            </Grid>
            <Grid item xs={4}>
              <Input
                label="Lateral Load %"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('lateralLoad', event.target.value)
                }
                value={functionElements.lateralLoad}
              />
            </Grid>
            <Grid item xs={4}>
              <Input
                label="Up Load %"
                placeholder="Enter"
                type="number"
                onChange={(event) =>
                  handleOnChange('upLoad', event.target.value)
                }
                value={functionElements.upLoad}
              />
            </Grid>
            <Grid item xs={4}>
              <Select
                label="Type"
                placeholder="Select"
                options={[
                  { label: 'Retraction', value: 'Retraction' },
                  { label: 'Linear Span', value: 'Linear Span' },
                ]}
                onChange={(data) => handleOnChange('type', data.value)}
                value={
                  functionElements.type && { label: functionElements.type }
                }
              />
            </Grid>
          </>
        )}
      </>
    );
  };

  const renderPowerConversion = () => {
    return (
      <>
        <Grid item xs={4}>
          <Select
            label="Power Conversion Type"
            placeholder="Select"
            options={[
              {
                label: 'Mechanical to Mechanical',
                value: 'Mechanical to Mechanical',
              },
              {
                label: 'Electrical to Electrical',
                value: 'Electrical to Electrical',
              },
              {
                label: 'Electrical to Mechanical',
                value: 'Electrical to Mechanical',
              },
            ]}
            onChange={(data) =>
              handleOnChange('powerConversionType', data.value)
            }
            value={
              functionElements.powerConversionType && {
                label: functionElements.powerConversionType,
              }
            }
          />
        </Grid>
        {functionElements.powerConversionType ===
          'Mechanical to Mechanical' && (
          <>
            <Grid item xs={4}>
              <Select
                label="Mechanical to Mechanical Type"
                placeholder="Select"
                options={[
                  { label: 'Rotational', value: 'Rotational' },
                  { label: 'Linear', value: 'Linear' },
                ]}
                onChange={(data) => handleOnChange('mmType', data.value)}
                value={
                  functionElements.mmType && { label: functionElements.mmType }
                }
              />
            </Grid>
            {functionElements.mmType === 'Rotational' && (
              <>
                <Grid item xs={4}>
                  <Input
                    label="Max Torque (Nm)"
                    placeholder="Enter"
                    type="number"
                    onChange={(event) =>
                      handleOnChange('maxTorque', event.target.value)
                    }
                    value={functionElements.maxTorque}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Input
                    label="Max RPM"
                    placeholder="Enter"
                    type="number"
                    onChange={(event) =>
                      handleOnChange('maxRPM', event.target.value)
                    }
                    value={functionElements.maxRPM}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Input
                    label="Max Output Shaft Precision (arc-seconds)"
                    placeholder="Enter"
                    type="number"
                    onChange={(event) =>
                      handleOnChange('maxOutputShaft', event.target.value)
                    }
                    value={functionElements.maxOutputShaft}
                  />
                </Grid>
              </>
            )}
          </>
        )}

        {functionElements.powerConversionType ===
          'Electrical to Electrical' && (
          <>
            <Grid item xs={4}>
              <Select
                label="Electrical to Electrical Type"
                placeholder="Select"
                options={[
                  { label: 'DC', value: 'DC' },
                  { label: 'AC', value: 'AC' },
                ]}
                onChange={(data) => handleOnChange('eeType', data.value)}
                value={
                  functionElements.eeType && { label: functionElements.eeType }
                }
              />
            </Grid>
          </>
        )}

        {functionElements.powerConversionType ===
          'Electrical to Mechanical' && (
          <>
            <Grid item xs={4}>
              <Select
                label="Electrical to Mechanical Type"
                placeholder="Select"
                options={[
                  { label: 'Rotational Motor', value: 'Rotational Motor' },
                ]}
                onChange={(data) => handleOnChange('emType', data.value)}
                value={
                  functionElements.emType && { label: functionElements.emType }
                }
              />
            </Grid>
            {functionElements.emType === 'Rotational Motor' && (
              <>
                <Grid item xs={4}>
                  <Input
                    label="Max Torque (Nm)"
                    placeholder="Enter"
                    type="number"
                    onChange={(event) =>
                      handleOnChange('maxTorque', event.target.value)
                    }
                    value={functionElements.maxTorque}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Input
                    label="Max RPM"
                    placeholder="Enter"
                    type="number"
                    onChange={(event) =>
                      handleOnChange('MaxRPM', event.target.value)
                    }
                    value={functionElements.MaxRPM}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Input
                    label="Max Output Shaft Precision (arc-seconds)"
                    placeholder="Enter"
                    type="number"
                    onChange={(event) =>
                      handleOnChange('maxOutputShaft', event.target.value)
                    }
                    value={functionElements.maxOutputShaft}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Select
                    label="Type"
                    placeholder="Select"
                    options={[
                      { label: 'Stepper', value: 'Stepper' },
                      { label: 'Permanent Magnet', value: 'Permanent Magnet' },
                      { label: 'Induction', value: 'Induction' },
                    ]}
                    onChange={(data) =>
                      handleOnChange('rotationalMotorType', data.value)
                    }
                    value={
                      functionElements.rotationalMotorType && {
                        label: functionElements.rotationalMotorType,
                      }
                    }
                  />
                </Grid>
              </>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <div>
      <Paper elevation={0} className="FunctionalElements">
        <Grid className="section-padding-left" container spacing={4}>
          {renderUserInterface()}
          {renderStaticMotionElements()}
          {renderPowerConversion()}
        </Grid>
      </Paper>
    </div>
  );
}
