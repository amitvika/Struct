import React, { useState, useEffect } from 'react';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import get from 'lodash/get';
import Grid from '@material-ui/core/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';

export default function InternalCircularFaces({ holeSize }) {
  const [hierarchySchema, setHierarchySchema] = useState(null);
  const [lookUpTableSchema, setLookUpTableSchema] = useState(null);
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

      const lookUp = get(respLookUpTable, 'data[0].lookUpTableSchema');

      setLookUpTableSchema(lookUp);
      if (lookUp) {
        setLocalState((prev) => ({
          ...prev,
          computedHoleSize: getHoleSize(lookUp)
        }));
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const parseValue = (data) => {
    let options = data.options.map((item) => {
      const selectedParsedObj =
        lookUpTableSchema[`${item.label}_${localState.computedHoleSize}`];
      return {
        value: item.label,
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

  const getHoleSize = (lookUp) => {
    let holeSize = 1;
    let holeSizeArr = [];

    for (let key in lookUp) {
      if (lookUp.hasOwnProperty(key)) {
        // console.log(`${key} : ${obj[key]}`)
        let holeSizeValue = key.split('_');
        holeSizeArr = [...holeSizeArr, holeSizeValue[1]];
      }
    }
    holeSizeArr = [...new Set(holeSizeArr)];

    holeSizeArr.sort(function (a, b) {
      return a - b;
    });

    let computedHoleSize = holeSize;

    for (let i = 0; i < holeSizeArr.length; i++) {
      let currentHoleSize = holeSizeArr[i];
      let nextHoleSize = holeSizeArr[i + 1];

      if (
        (currentHoleSize == holeSize || currentHoleSize < holeSize) &&
        nextHoleSize > holeSize
      ) {
        computedHoleSize = nextHoleSize;
        break;
      } else if (
        currentHoleSize > holeSize ||
        ((currentHoleSize < holeSize || currentHoleSize == holeSize) &&
          !nextHoleSize)
      ) {
        computedHoleSize = currentHoleSize;
        break;
      }
    }

    return computedHoleSize;
  };

  useEffect(() => {
    if (localState.holeType === 'Hole' && localState.computedHoleSize) {
      setHoleToleranceObj(parseValue(get(hierarchySchema, '[1]', {})));
    }
  }, [localState.holeType, hierarchySchema]);

  const holeType = get(hierarchySchema, '[0]');

  if (!holeSize || !holeType) {
    return null;
  }

  const holeToleranceRange = lookUpTableSchema
    ? lookUpTableSchema[
        `${localState.holeTolerance}_${localState.computedHoleSize}`
      ]
    : {};

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
          {holeToleranceRange && (
            <ItemContainer title={'Tolerance range:'}>
              <Headding
                title={` ${holeToleranceRange[`Lower Bound`]} to ${
                  holeToleranceRange[`Upper Bound`]
                }`}
              />
            </ItemContainer>
          )}
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
