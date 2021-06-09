import { UPDATE_USERS } from "./types";
export const updateUsers = users => dispatch => {
  dispatch({
    type: UPDATE_USERS,
    payload: users
  });
};
