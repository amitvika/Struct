import React from 'react';
import ClassficationFilter from './ClassficationFilter';
import InternalProductFilter from './InternalProductFilter';

export default function AdditionalFilter(props) {
  return (
    <>
      <InternalProductFilter {...props} />
      <ClassficationFilter {...props} />
    </>
  );
}
