import { combineReducers } from "redux";
import accessConfigReducer from './accessConfig.reducer';
import itemReducer from "./itemReducer";
import errorReducer from "./errorReducer";
import authReducer from "./authReducer";
import pagesReducer from "./pageReducer";
import userAccessUserReducer from "./userAccessUserReducer";
import loading from './loading';
import accessReducer from './viewAccess.reducer';;
//import clientReducer from "./clientReducer";
export default combineReducers({
  item: itemReducer,
  error: errorReducer,
  auth: authReducer,
  page: pagesReducer,
  userAccessUsers: userAccessUserReducer,
  loading,
  access: accessReducer,
  accessConfig: accessConfigReducer
  //all reducers go in this file object
});
