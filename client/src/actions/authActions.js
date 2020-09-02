import axios from "axios";
import {
  USER_LOADED,
  USER_LOADING,
  AUTH_ERROR,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  REGISTER_FAIL,
  REGISTER_SUCCESS
} from "./types";
import { returnErrors } from "./errorActions";
import store from "../store";
import http from '../utils/axios';

export const loadUser = () => (dispatch, getState) => {
  dispatch({ type: USER_LOADING }); //sets idloading to true

  http
    .get("api/auth/user", tokenConfig(getState))
    .then(res =>
      dispatch({
        type: USER_LOADED,
        payload: res.data
      })
    )
    .catch(err => {
      dispatch(returnErrors(err.response.data, err.response.status));
      dispatch({
        type: AUTH_ERROR
      });
    });
};

//Register User
export const register = ({ name, email, password, password2 }) => dispatch => {
  //Headers
  const config = {
    headers: { "Content-type": "application/json" }
  };
  //Regquest body
  const body = JSON.stringify({ name, email, password, password2 });
  axios
    .post("/api/users", body, config)
    .then(res =>
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data
      })
    )
    .then(() => store.dispatch(loadUser()))
    .catch(err => {
      dispatch(
        returnErrors(err.response.data, err.response.status, "REGISTER_FAIL")
      );
      dispatch({
        type: REGISTER_FAIL
      });
    });
};

export const logout = () => {
  return {
    type: LOGOUT_SUCCESS
  };
};

export const login = ({ email, password }) => dispatch => {
  //Headers
  const config = {
    headers: { "Content-type": "application/json" }
  };
  //Regquest body
  const body = JSON.stringify({ email, password });
  axios
    .post("/api/auth", body, config)
    .then(res =>
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data //this is the response from the server
      })
    )
    .catch(err => {
      returnErrors(err.response.data, err.response.status, "LOGIN_FAIL");
      dispatch({
        type: LOGIN_FAIL
      });
    });
};

//setup config/headers and token
export const tokenConfig = getState => {
  const token = getState().auth.token; //getting the token from localstorage
  const config = {
    headers: {
      "Content-type": "application/json"
    }
  }; //add token to headers
  if (token) {
    config.headers["x-auth-token"] = token;
  }
  return config;
};
