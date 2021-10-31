import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import Grid from '@material-ui/core/Grid';
import Select from '@monostruct/common/components/atoms/Select';
import Headding from '@monostruct/common/components/atoms/Headding';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';

export default function HoleTolerancing({ selectedHoleValue }) {
  const [holeValueList, setHoleValueList] = useState([]);
  const [holeSizeList, setHoleSizeList] = useState([]);
  // const [selectedHoleValue, setSelectedHoleValue] = useState('');
  const [selectedHoleSize, setSelectedHoleSize] = useState('');
  const [lookUpTableSchema, setLookUpTableSchema] = useState(null);

  useEffect(() => {
    CriteriaUploadAPI.fetchCriteriaUpload(
      `type=Internal Use Product Configuration`
    )
      .then((resp) => {
        let lookUp = get(resp, 'data[0].lookUpTableSchema');
        if (lookUp) {
          setLookUpTableSchema(get(resp, 'data[0].lookUpTableSchema'));
          parser(lookUp);
        }
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    parser();
  }, []);

  const parser = (lookUp) => {
    let holeValueArr = [];
    let holeSizeArr = [];

    for (let key in lookUp) {
      if (lookUp.hasOwnProperty(key)) {
        // console.log(`${key} : ${obj[key]}`)
        let holeSizeValue = key.split('_');
        holeValueArr = [...holeValueArr, holeSizeValue[0]];
        holeSizeArr = [...holeSizeArr, holeSizeValue[1]];
      }
    }

    setHoleValueList([...new Set(holeValueArr)]);
    setHoleSizeList([...new Set(holeSizeArr)]);
  };

  if (!lookUpTableSchema) {
    return null;
  }

  let selectedParsedObj =
    lookUpTableSchema[`${selectedHoleValue}_${selectedHoleSize}`];

  return (
    <>
      {/* <Select
        placeholder="Select Hole Value"
        options={holeValueList.map((item) => ({
          label: item,
          value: item
        }))}
        onChange={(data) => setSelectedHoleValue(data.value)}
        value={selectedHoleValue}
      /> */}

      {selectedHoleValue && (
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Headding bold title={'Hole Size'} />
          </Grid>
          <Grid item xs={8}>
          </Grid>
        </Grid>
      )}
      {selectedParsedObj && (
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Headding bold title={'Tolerance range: '} />
          </Grid>
          <Grid item xs={8}>
            <Headding
              title={` ${selectedParsedObj[`Upper Bound`]} to ${
                selectedParsedObj[`Lower Bound`]
              }`}
            />
          </Grid>
        </Grid>
      )}
    </>
  );
}
