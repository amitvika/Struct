import React, { useEffect, useState } from 'react';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import get from 'lodash/get';
import DynamicHierarchyDropdowns from '@monostruct/common/containers/DynamicHierarchyDropdowns';

export default function AdditionalFilter({
  list = [],
  filteredList = [],
  setFilteredList = () => {},
  isFilterResetted
}) {
  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [selections, setSelections] = useState([
    { key: 'Item Type', formFields: [] }
  ]);
  const [stateUpdated, setStateUpdated] = useState(false);

  useEffect(() => {
    CriteriaUploadAPI.getInternaUseProductConfiguration()
      .then((resp) => {
        const hierarchySchemaArr = get(resp, 'data.hierarchySchema', []);
        setHierarchyDropdownList(hierarchySchemaArr);
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    if (isFilterResetted) {
      setSelections([{ key: 'Item Type', formFields: [] }]);
      setFilteredList(list);
    }
  }, [isFilterResetted]);

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

  return (
    <DynamicHierarchyDropdowns
      {...{
        hierarchyDropdownList,
        selections,
        setSelections,
        handleOnDropdownSelectionChange,
        inToolbar: true
      }}
    />
  );
}
