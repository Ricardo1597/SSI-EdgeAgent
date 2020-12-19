echo 'Initializing frontend server...'
cd edge-agent/reactJS
REACT_APP_SERVER_PORT=5000 
REACT_APP_AGENT_PORT=5001
npm start
