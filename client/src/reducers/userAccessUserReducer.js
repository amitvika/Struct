import { UPDATE_USERS } from "../actions/types";
const initialState = {
  userAccessUsers: { newUsers: [], removedUsers: [] }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case UPDATE_USERS:
      return {
        ...state,
        userAccessUsers: action.payload
      };
    default: {
      return state;
    }
  }
}
