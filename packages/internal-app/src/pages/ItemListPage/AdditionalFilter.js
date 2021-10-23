import React, { useEffect, useState } from 'react';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import get from 'lodash/get';
import DynamicHierarchyDropdowns from '@monostruct/common/containers/DynamicHierarchyDropdowns';

export default function AdditionalFilter({
  list = [],
  filteredList = [],
  setFilteredList = () => {}
}) {
  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [selections, setSelections] = useState([
    { key: 'Item Type', formFields: [] }
  ]);
  const [stateUpdated, setStateUpdated] = useState(false);

  useEffect(() => {
    CriteriaUploadAPI.getHierarchyStructure()
      .then((resp) => {
        const hierarchySchemaArr = get(resp, 'data.hierarchySchema', []);
        setHierarchyDropdownList(hierarchySchemaArr);
      })
      .catch((error) => {});
  }, []);

  const handleOnDropdownSelectionChange = () => {
    setStateUpdated(!stateUpdated);

    const filteredData = list.filter(({ hierarchySelections }) => {
      let flagList = '';
      selections.map((selection) => {
        const selectionIndex = hierarchySelections.findIndex(
          (hs) => hs.value === selection.value
        );
        flagList += ` ${selectionIndex > -1}`;
      });

      if ((flagList.match(/true/g) || []).length === selections.length) {
        return true;
      } else {
        return false;
      }
    });
    setFilteredList(filteredData);
  };

  const clearSelections = () => {
    setSelections({ key: 'Item Type', formFields: [] });
    setFilteredList(list);
  };

  return (
    <DynamicHierarchyDropdowns
      {...{
        hierarchyDropdownList,
        selections,
        setSelections,
        handleOnDropdownSelectionChange,
        inToolbar: true,
        clearSelections
      }}
    />
  );
}
