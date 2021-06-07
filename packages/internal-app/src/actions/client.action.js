import * as Types from "./types";
import { fetchClientsApi } from '../api/clients.api';

export const fetchClientAction = () => (dispatch) => {
  dispatch({ type: Types.CLIENTS_LOADING }); //sets idloading to true

  fetchClientsApi()
    .then(res => {
      dispatch({
        type: Types.CLIENTS_SUCCESS,
        payload: res.data
      })
    })
    .catch(err => {
      dispatch({
        type: Types.CLIENTS_ERROR
      });
    });
};