import {
  ADD_CRED_EXCHANGE,
  UPDATE_CRED_EXCHANGE,
  REMOVE_CRED_EXCHANGE,
  SET_CRED_EXCHANGES,
} from '../actionTypes';

const initialState = {
  exchanges: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CRED_EXCHANGES:
      return {
        exchanges: action.records.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
      };
    case ADD_CRED_EXCHANGE:
      return {
        exchanges: [...state.exchanges, action.record].sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : 1
        ),
      };
    case UPDATE_CRED_EXCHANGE:
      let found = false;
      let exchangesList = state.exchanges.map((exchange) => {
        if (exchange.credentialExchangeId === action.record.credentialExchangeId) {
          found = true;
          if (exchange.state !== 'done') return action.record;
        }
        return exchange;
      });

      // Add a new one if none was found
      if (!found) {
        exchangesList = [...exchangesList, action.record].sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : 1
        );
      }
      return {
        exchanges: exchangesList,
      };
    case REMOVE_CRED_EXCHANGE:
      return {
        exchanges: state.exchanges.filter(
          (exchange) => exchange.credentialExchangeId !== action.id
        ),
      };
    default:
      return state;
  }
};

export default reducer;
