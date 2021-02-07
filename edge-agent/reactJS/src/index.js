import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Provider } from 'react-redux';
import interceptors from './interceptors';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { SnackbarProvider } from 'notistack';

interceptors.setupInterceptors(store);

ReactDOM.render(
  <React.Fragment>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SnackbarProvider maxSnack={4}>
          <App id="App" />
        </SnackbarProvider>
      </PersistGate>
    </Provider>
  </React.Fragment>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
