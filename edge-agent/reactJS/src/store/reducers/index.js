import authReducer from './authReducer';
import appReducer from './appReducer';
import { combineReducers } from 'redux';

export default combineReducers({
  auth: authReducer,
  app: appReducer,
});
