'use strict';

const config = {
  // IP Address of the running ledger
  // testPoolIp: process.env.TEST_POOL_IP || '192.168.1.8',
  testPoolIp: process.env.TEST_POOL_IP || '172.17.0.1',

  // the port to run the agent server admin API on
  adminPort: process.env.ADMIN_PORT || 5000,

  // the port to run the agent server inbound API on
  inboundPort: process.env.INBOUND_PORT || 5001,

  // Change to your endpoint did's endpoint
  endpoint:
    (process.env.PUBLIC_DID_ENDPOINT || 'http://localhost') +
    ':' +
    (process.env.INBOUND_PORT || 5001),

  // Optional: Give your pool config a unique name
  poolName: process.env.POOL_NAME || 'von-network-local',
};

module.exports = config;
