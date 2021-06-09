import { CHANGE_PAGE } from "../actions/types";
const initialState = {
  page: { navType: "MainNav", page: "ProcessGroups", objId: 0 }
};

export default function pageReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_PAGE:
      return {
        ...state,
        page: action.payload
      };
    default: {
      return state;
    }
  }
}
