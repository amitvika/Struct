import React, { useState, useEffect } from 'react';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import get from 'lodash/get';
import Grid from '@material-ui/core/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';

export default function InternalCircularFaces({ holeSize }) {
  const [hierarchySchema, setHierarchySchema] = useState(null);
  const [lookUpTableSchema, setLookUpTableSchema] = useState(null);
  const [holeTypeObj, setHoleTypeObj] = useState(null);
  const [holeToleranceObj, setHoleToleranceObj] = useState(null);
  const [localState, setLocalState] = useState({});

  useEffect(() => {
    fetchHierarchyAndLookUp();
  }, []);

  const fetchHierarchyAndLookUp = async () => {
    try {
      const respHierarchy = await CriteriaUploadAPI.fetchCriteriaUpload(
        `type=Internal Circular faces`
      );
      const respLookUpTable = await CriteriaUploadAPI.fetchCriteriaUpload(
        `type=Internal Use Product Configuration`
      );

      setHierarchySchema(get(respHierarchy, 'data[0].hierarchySchema', {}));
      setLookUpTableSchema(get(respLookUpTable, 'data[0].lookUpTableSchema'));
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const parseValue = (data) => {
    let options = data.options.map((item) => {
      const selectedParsedObj = lookUpTableSchema[`${item.label}_${holeSize}`];
      return {
        ...item,
        label: `${item.label} - ${selectedParsedObj[`Lower Bound`]} to ${
          selectedParsedObj[`Upper Bound`]
        }`
      };
    });

    return {
      ...data,
      options
    };
  };

  useEffect(() => {
    if (localState.holeType === 'Hole') {
      setHoleToleranceObj(parseValue(get(hierarchySchema, '[1]', {})));
    }
  }, [localState.holeType, hierarchySchema]);

  const holeType = get(hierarchySchema, '[0]');

  if (!holeSize || !holeType) {
    return null;
  }

  const handleOnChange = (name, value) =>
    setLocalState((prev) => ({ ...prev, [name]: value }));

  return (
    <>
      <DropDown
        {...{
          field: holeType,
          handleOnChange: (data) => handleOnChange('holeType', data.value),
          value: localState.holeType
        }}
      />
      {localState.holeType === 'Hole' && (
        <>
          <ItemContainer title={'Hole Size'}>
            <Headding title={`${holeSize}`} />
          </ItemContainer>
          <DropDown
            {...{
              field: holeToleranceObj,
              handleOnChange: (data) =>
                handleOnChange('holeTolerance', data.value),
              value: localState.holeTolerance
            }}
          />
        </>
      )}
    </>
  );
}

const ItemContainer = ({ title, children }) => {
  return (
    <Grid container spacing={2} key={title}>
      <Grid item xs={4}>
        <Headding bold title={title} />
      </Grid>
      <Grid item xs={8}>
        {children}
      </Grid>
    </Grid>
  );
};

const DropDown = ({ field, value, handleOnChange }) => {
  if (!field) {
    return null;
  }

  return (
    <ItemContainer title={field.headerName}>
      <Select
        placeholder="Select"
        options={field.options}
        onChange={handleOnChange}
        value={value}
      />
    </ItemContainer>
  );
};
