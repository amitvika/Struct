import * as Types from "../actions/types";

const initialState = {
  data: {},
  isLoading: false,
}

export default function accessConfig(state = initialState, action) {
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
        data: action.payload
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
