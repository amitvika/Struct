import { GET_ITEMS, ADD_ITEM, DELETE_ITEM, ITEMS_LOADING } from "./types";
import { tokenConfig } from "./authActions";
import { returnErrors } from "./errorActions";
import axios from "axios";
export const getItems = () => dispatch => {
  dispatch(setItemsLoading());
  axios
    .get("/api/items")
    .then(res =>
      dispatch({
        type: GET_ITEMS,
        payload: res.data
      })
    )
    .catch(err =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

export const deleteItem = id => (dispatch, getState) => {
  axios
    .delete(`/api/items/${id}`, tokenConfig(getState))
    .then(res =>
      dispatch({
        type: DELETE_ITEM,
        payload: id
      })
    )
    .catch(err =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

export const addItem = item => (dispatch, getState) => {
  //dispatch(setItemsLoading());
  axios
    .post("/api/items", item, tokenConfig(getState))
    .then(res =>
      dispatch({
        type: ADD_ITEM,
        payload: res.data
      })
    )
    .catch(err =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

export const setItemsLoading = () => {
  return {
    type: ITEMS_LOADING
  };
};

//each action creater is a function that we have to create
//thunk allows to call dispatch method directly.  Thus will pass in dispatch. Wehenever we want to send data, we call dispatch (sort of like sending data with a promise) contains type and payload
//all the above dispatches fetchPosts to the reducer
//from component, remove the fetch component and the contructor as we do not need the component state anymore as state will now come from redux
/*Export const createhPost = (postData)=>dispatch=>{ 
  Post request from the form component
fetch(‘uri’,{
Method: ‘Post’,
Headers: {
‘content-type’:’application/json’
},
Body: JSON.stringify(postData)
})
.then(res=> res.json())
.then(data=>     dispatch({       //dispatching this to the PostReducer     
type:NEW.POST,
payload:data
}));
};*/
