import React, { useEffect, useState } from 'react';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import get from 'lodash/get';
import DynamicHierarchyDropdowns from '@monostruct/common/containers/DynamicHierarchyDropdowns';

export default function Classification({
  handleItemUpdateLocallay,
  isFilterResetted
}) {
  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [selections, setSelections] = useState([
    { key: 'Classification Configuration', form: { fields: [] } }
  ]);
  const [stateUpdated, setStateUpdated] = useState(false);

  useEffect(() => {
    CriteriaUploadAPI.fetchCriteriaUpload(`type=Classification Configuration`)
      .then((resp) => {
        const hierarchySchemaArr = get(resp, 'data[0].hierarchySchema', []);
        setHierarchyDropdownList(hierarchySchemaArr);
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    handleItemUpdateLocallay({ classificationConfig: selections });
  }, [stateUpdated]);

  const handleOnDropdownSelection = () => {
    setStateUpdated(!stateUpdated);
  };

  return (
    <DynamicHierarchyDropdowns
      {...{
        hierarchyDropdownList,
        selections,
        setSelections,
        handleOnDropdownSelection
      }}
    />
  );
}
