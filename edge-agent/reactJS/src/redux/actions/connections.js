import {
  SET_CONNECTIONS,
  ADD_CONNECTION,
  UPDATE_CONNECTION,
  REMOVE_CONNECTION,
} from '../actionTypes';

export const setConnections = (records) => {
  return {
    type: SET_CONNECTIONS,
    connections: records,
  };
};

export const addConnection = (record) => {
  return {
    type: ADD_CONNECTION,
    connection: record,
  };
};

export const updateConnection = (record) => {
  return {
    type: UPDATE_CONNECTION,
    connection: record,
  };
};

export const removeConnection = (recordId) => {
  return {
    type: REMOVE_CONNECTION,
    connectionId: recordId,
  };
};
