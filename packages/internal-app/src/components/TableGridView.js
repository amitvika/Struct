import React from 'react';

import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { useDispatch, useSelector } from 'react-redux';
import CommonTableGridView from '@monostruct/common/components/TableGridView';

export default function TableGridView(props) {
  const dispatch = useDispatch();
  return (
    <CommonTableGridView
      {...props}
      showSuccessAlert={(data) => dispatch(showSuccessAlert(data))}
      showErrorAlert={(data) => dispatch(showErrorAlert(data))}
    />
  );
}
