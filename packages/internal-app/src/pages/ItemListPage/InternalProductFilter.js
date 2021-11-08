import React, { useEffect, useState } from 'react';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import get from 'lodash/get';
import DynamicHierarchyDropdowns from '@monostruct/common/containers/DynamicHierarchyDropdowns';

export default function InternalProductFilter({
  list = [],
  filteredList = [],
  setFilteredList = () => {},
  isFilterResetted
}) {
  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [selections, setSelections] = useState([
    { key: 'Internal Use Product Configuration', formFields: [] }
  ]);
  const [stateUpdated, setStateUpdated] = useState(false);

  useEffect(() => {
    CriteriaUploadAPI.fetchCriteriaUpload(
      `type=Internal Use Product Configuration`
    )
      .then((resp) => {
        const hierarchySchemaArr = get(resp, 'data[0].hierarchySchema', []);
        setHierarchyDropdownList(hierarchySchemaArr);
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    if (isFilterResetted) {
      setSelections([{ key: 'Internal Use Product Configuration', formFields: [] }]);
      setFilteredList(list);
    }
  }, [isFilterResetted]);

  const handleOnDropdownSelection = () => {
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
        handleOnDropdownSelection,
        inToolbar: true,
        filterTitle: 'Internal Product Configuration'
      }}
    />
  );
}
