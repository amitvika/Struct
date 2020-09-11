import * as Types from "../actions/types";

const initialState = {
  accessConfig: {},
  clients:[],
  isLoading: false,
}

export default function (state = initialState, action) {
  switch (action.type) {
    case Types.ACCESS_CONFIGURATION_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case Types.ACCESS_CONFIGURATION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        accessConfig: action.payload.accessConfig,
        clients: action.payload.clients
      }

    case Types.ACCESS_CONFIGURATION_ERROR:
      return {
        ...state,
        isLoading: false
      }
    default: {
      return state;
    }
  }
}
