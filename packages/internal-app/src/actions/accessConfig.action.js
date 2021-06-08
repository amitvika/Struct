import * as Types from "./types";
import { getUserAccessConfiguration } from '@ravibasil/common/api/accessConfig.api';

export const getUserAccessConfigurationAction = (id) => (dispatch) => {
  dispatch({ type: Types.ACCESS_CONFIGURATION_LOADING }); //sets idloading to true

  getUserAccessConfiguration(id)
    .then(res => {
      dispatch({
        type: Types.ACCESS_CONFIGURATION_SUCCESS,
        payload: res.data
      })
    })
    .catch(err => {
      dispatch({
        type: Types.ACCESS_CONFIGURATION_ERROR
      });
    });
};