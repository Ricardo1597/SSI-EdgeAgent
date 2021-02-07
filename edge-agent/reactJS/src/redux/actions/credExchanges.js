import {
  ADD_CRED_EXCHANGE,
  UPDATE_CRED_EXCHANGE,
  REMOVE_CRED_EXCHANGE,
  SET_CRED_EXCHANGES,
} from '../actionTypes';

export const setCredExchanges = (records) => {
  return {
    type: SET_CRED_EXCHANGES,
    records: records,
  };
};

export const addCredExchange = (record) => {
  return {
    type: ADD_CRED_EXCHANGE,
    record: record,
  };
};

export const updateCredExchange = (record) => {
  return {
    type: UPDATE_CRED_EXCHANGE,
    record: record,
  };
};

export const removeCredExchange = (recordId) => {
  return {
    type: REMOVE_CRED_EXCHANGE,
    id: recordId,
  };
};
