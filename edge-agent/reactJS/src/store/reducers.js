const initState = {
  accessToken: '',
  connections: [],
};

export const rootReducer = (state = initState, action) => {
  console.log(action);
  switch (action.type) {
    case 'UPDATE_ACCESSTOKEN':
      return {
        ...state,
        accessToken: action.token,
      };
    case 'INIT_CONNECTIONS':
      return {
        ...state,
        connections: action.connections,
      };
    case 'ADD_CONNECTION':
      console.log(state.connections);
      return {
        ...state,
        connections: [...state.connections, action.connection].sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : 1
        ),
      };
    case 'UPDATE_CONNECTION':
      let found = false;
      let connections = state.connections.map((connection) => {
        if (connection.connectionId === action.connection.connectionId) {
          found = true;
          return action.connection;
        }
        return connection;
      });

      // Add a new one if non was found
      if (!found) {
        console.log('new connection');
        connections = [...connections, action.connection].sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : 1
        );
      }
      return {
        ...state,
        connections: connections,
      };
    case 'REMOVE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(
          (connection) => (connection.connectionId = action.connectionId)
        ),
      };
    default:
      return state;
  }
};
