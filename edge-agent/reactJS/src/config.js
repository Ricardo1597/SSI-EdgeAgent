const config = {
    endpoint: `http://localhost:${(process.env.REACT_APP_SERVER_PORT || 5000)}`,
    agentEndpoint: `http://localhost:${(process.env.REACT_APP_AGENT_PORT || 5001)}`
};

module.exports = config;