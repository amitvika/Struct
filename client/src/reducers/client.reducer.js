import * as Types from "../actions/types";

const initialState = {
  data: [],
  isLoading: false,
}

export default function (state = initialState, action) {
  switch (action.type) {
    case Types.CLIENTS_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case Types.CLIENTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: action.payload
      }

    case Types.CLIENTS_ERROR:
      return {
        ...state,
        isLoading: false
      }
    default: {
      return state;
    }
  }
}
