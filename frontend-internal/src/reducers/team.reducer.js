import * as Types from "../actions/types";
const initialState = {
  teams: [],
  isLoading: false,
}

export default function (state = initialState, action) {
  switch (action.type) {
    case Types.TEAMS_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case Types.TEAMS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        teams: action.payload
      }

    case Types.TEAMS_ERROR:
      return {
        ...state,
        teams: [],
        isLoading: false
      }
    default: {
      return state;
    }
  }
}
