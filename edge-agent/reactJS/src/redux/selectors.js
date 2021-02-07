export const getToken = (store) =>
  store && store.auth && store.auth.accessToken ? store.auth.accessToken : '';

export const getConnections = (store) =>
  store && store.conn && store.conn.connections ? store.conn.connections : [];

export const getCompletedConnections = (store) =>
  store && store.conn && store.conn.connections
    ? store.conn.connections.filter((connection) => connection.state === 'complete')
    : [];

export const getCredExchanges = (store) =>
  store && store.cred && store.cred.exchanges ? store.cred.exchanges : [];

export const getPresExchanges = (store) =>
  store && store.pres && store.pres.exchanges ? store.pres.exchanges : [];
