import { createStore } from 'redux';
import allReducers from './reducers/rootReducer';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'redux',
  blacklist: ['auth'], // don't save token in local storage
  storage,
};

const persistedReducer = persistReducer(persistConfig, allReducers);

const store = createStore(
  persistedReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const persistor = persistStore(store);

export { store, persistor };
