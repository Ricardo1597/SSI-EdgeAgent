import authReducer from './auth';
import connReducer from './connections';
import credExchangeReducer from './credExchanges';
import presExchangeReducer from './presExchanges';
import { combineReducers } from 'redux';

export default combineReducers({
  auth: authReducer,
  conn: connReducer,
  cred: credExchangeReducer,
  pres: presExchangeReducer,
});
