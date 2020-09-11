import * as Types from "./types";
import { fetchClientsApi } from '../api/access';

export const fetchClientAction = () => (dispatch, getState) => {
  dispatch({ type: Types.CBA_LOADING }); //sets idloading to true

  fetchClientsApi()
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