import { UPDATE_ACCESS_TOKEN } from '../actionTypes';

const initState = {
  accessToken: '',
};

export default (state = initState, action) => {
  console.log(action);
  switch (action.type) {
    case UPDATE_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.token,
      };
    default:
      return state;
  }
};
