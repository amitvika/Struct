import * as Types from "../actions/types";
const initialState = {
  cba: [],
  isCBALoading: false,
}

export default function (state = initialState, action) {
  switch (action.type) {
    case Types.CBA_LOADING:
      return {
        ...state,
        isCBALoading: true
      };
    case Types.CBA_SUCCESS:
      return {
        ...state,
        isCBALoading: false,
        cba: action.payload
      }

    case Types.CBA_ERROR:
      return {
        ...state,
        isCBALoading: false
      }
    default: {
      return state;
    }
  }
}
