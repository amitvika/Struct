import { CHANGE_PAGE } from "./types";
export const changePage = page => dispatch => {
  dispatch({
    type: CHANGE_PAGE,
    payload: page
  });
  //console.log(page);
};
