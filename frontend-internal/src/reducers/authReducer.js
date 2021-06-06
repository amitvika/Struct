import {
  USER_LOADED,
  USER_LOADING,
  AUTH_ERROR,
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT_SUCCESS,
  REGISTER_SUCCESS,
  REGISTER_FAIL
} from "../actions/types";
const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  isLoading: false,
  user: null,
  isLoginStarted: false
};

export default function authReducer(state = initialState, action) {
  // console.log('=======>>>>',action)
  switch (action.type) {
    case USER_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload
      };
    case LOGIN_START:
      return {
        isLoginStarted: true
      }

    case LOGIN_SUCCESS:
      localStorage.setItem("token", action.payload.token);
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoginStarted: false
      }
    case REGISTER_SUCCESS:
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        isLoading: false
      };
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case LOGOUT_SUCCESS:
    case REGISTER_FAIL:
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isLoginStarted: false
      };
    default: {
      return state;
    }
  }
}
