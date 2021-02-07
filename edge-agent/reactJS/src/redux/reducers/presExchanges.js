import {
  ADD_PRES_EXCHANGE,
  UPDATE_PRES_EXCHANGE,
  REMOVE_PRES_EXCHANGE,
  SET_PRES_EXCHANGES,
} from '../actionTypes';

const initialState = {
  exchanges: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PRES_EXCHANGES:
      return {
        exchanges: action.records.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
      };
    case ADD_PRES_EXCHANGE:
      return {
        exchanges: [...state.exchanges, action.record].sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : 1
        ),
      };
    case UPDATE_PRES_EXCHANGE:
      let found = false;
      let exchangesList = state.exchanges.map((exchange) => {
        if (exchange.presentationExchangeId === action.record.presentationExchangeId) {
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
    case REMOVE_PRES_EXCHANGE:
      return {
        exchanges: state.exchanges.filter(
          (exchange) => exchange.presentationExchangeId !== action.id
        ),
      };
    default:
      return state;
  }
};

export default reducer;
