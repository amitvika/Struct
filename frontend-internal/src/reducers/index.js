import { combineReducers } from "redux";
import accessConfigReducer from './accessConfig.reducer';
import clientReducer from "./client.reducer";
import itemReducer from "./itemReducer";
import errorReducer from "./errorReducer";
import authReducer from "./authReducer";
import pagesReducer from "./pageReducer";
import userAccessUserReducer from "./userAccessUserReducer";
import loading from './loading';
import accessReducer from './viewAccess.reducer';
import alertReducer from './alert.reducer';
import themeReducer from './theme.reducer'
import teamReducer from './team.reducer';

export default combineReducers({
  item: itemReducer,
  error: errorReducer,
  auth: authReducer,
  page: pagesReducer,
  userAccessUsers: userAccessUserReducer,
  loading,
  access: accessReducer,
  accessConfig: accessConfigReducer,
  clients: clientReducer,
  alert: alertReducer,
  theme: themeReducer,
  team: teamReducer
});
