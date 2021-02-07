import {
  ADD_PRES_EXCHANGE,
  UPDATE_PRES_EXCHANGE,
  REMOVE_PRES_EXCHANGE,
  SET_PRES_EXCHANGES,
} from '../actionTypes';

export const setPresExchanges = (records) => {
  return {
    type: SET_PRES_EXCHANGES,
    records: records,
  };
};

export const addPresExchange = (record) => {
  return {
    type: ADD_PRES_EXCHANGE,
    record: record,
  };
};

export const updatePresExchange = (record) => {
  return {
    type: UPDATE_PRES_EXCHANGE,
    record: record,
  };
};

export const removePresExchange = (recordId) => {
  return {
    type: REMOVE_PRES_EXCHANGE,
    id: recordId,
  };
};
