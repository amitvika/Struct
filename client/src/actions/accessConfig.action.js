import * as Types from "./types";
import { getUserAccessConfiguration } from '../api/accessConfig.api';

export const getUserAccessConfigurationAction = async (id) => (dispatch, getState) => {
  dispatch({ type: Types.CBA_LOADING }); //sets idloading to true

  getUserAccessConfiguration(id)
    .then(res => {
      dispatch({
        type: Types.CBA_SUCCESS,
        payload: res.data
      })
    })
    .catch(err => {
      dispatch({
        type: Types.CBA_ERROR
      });
    });
};