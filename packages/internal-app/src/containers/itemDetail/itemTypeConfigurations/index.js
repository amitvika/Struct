import React, { useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Headding from '@ravibasil/common/components/atoms/Headding';

import DynamicCriteria from './DynamicCriteria';
import DynamicHierarchy from './DynamicHierarchy';
import CriteriaUploadAPI from '@ravibasil/common/api/criteriaUpload.api';
import get from 'lodash/get';

export default function ItemTypeConfiguration() {
  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [initialValue, setInitialValue] = useState(['Item Type']);
  const [criteriaFields, setCriteriaFields] = useState({});
  const [title, setTitle] = useState([]);

  useEffect(() => {
    CriteriaUploadAPI.getCadDetails()
      .then((resp) => {
        setTitle(get(resp, 'data.name', []));
        setHierarchyDropdownList(get(resp, 'data.hierarchySchema', {}));
        setCriteriaFields(get(resp, 'data.criteriaSchema', []));
      })
      .catch((error) => {});
  }, []);

  if(hierarchyDropdownList.length === 0){
    return null;
  }

  return (
    <Paper style={{ padding: 20, margin: 10 }}>
      <Headding >{title}</Headding>
      <DynamicHierarchy
        hierarchyDropdownList={hierarchyDropdownList}
        initialValue={initialValue}
        setInitialValue={setInitialValue}
      />
      <DynamicCriteria
        criteriaFields={criteriaFields}
        currentCrieteriaValue={initialValue.slice(1).join('|')}
      />
    </Paper>
  );
}
