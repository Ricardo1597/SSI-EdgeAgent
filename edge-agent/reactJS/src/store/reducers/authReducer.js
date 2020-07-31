const initState = {
  accessToken: '',
};

export default (state = initState, action) => {
  console.log(action);
  switch (action.type) {
    case 'UPDATE_ACCESSTOKEN':
      return {
        ...state,
        accessToken: action.token,
      };
    default:
      return state;
  }
};
