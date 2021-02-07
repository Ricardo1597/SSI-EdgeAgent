import { UPDATE_ACCESS_TOKEN } from '../actionTypes';

export const updateToken = (token) => {
  return {
    type: UPDATE_ACCESS_TOKEN,
    token: token,
  };
};
