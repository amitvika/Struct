import React, { useState, useEffect } from 'react';
import DynamicHierarchyDropdowns from '@monostruct/common/containers/DynamicHierarchyDropdowns';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import get from 'lodash/get';

export default function InternalCircularFaces({ handleStateUpdate }) {
  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [selections, setSelections] = useState([
    { key: 'Item Type', formFields: [] }
  ]);
  const [stateUpdated, setStateUpdated] = useState(false);

  useEffect(() => {
    CriteriaUploadAPI.fetchCriteriaUpload(`type=Internal Circular faces`)
      .then((resp) => {
        if (resp.data) {
          setHierarchyDropdownList(get(resp, 'data[0].hierarchySchema', []));
          // setSelections(get(resp, 'data[0].hierarchySchema[0]', []))
        }
      })
      .catch((error) => {});
  }, []);

  const handleOnDropdownSelection = () => {
    setStateUpdated(!stateUpdated);

    const holeValueObj = selections.find((item) => item.key === 'Hole');
    if (holeValueObj) {
      let holeValueArr = holeValueObj.value.split('|');
      handleStateUpdate({
        selectedHoleValue: holeValueArr[1] || holeValueArr[0]
      });
    } else {
      handleStateUpdate({ selectedHoleValue: '' });
    }
  };

  return (
    <DynamicHierarchyDropdowns
      {...{
        hierarchyDropdownList,
        selections,
        setSelections,
        handleOnDropdownSelection,
        isPaperContainer: false
      }}
    />
  );
}
