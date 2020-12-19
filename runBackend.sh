echo 'Initializing backend server...'
cd edge-agent/engineJS
ADMIN_PORT=5000 
INBOUND_PORT=5001 
POOL_IP=172.17.0.1 
npm start >/dev/null &
sleep 10
echo 'Backend server admin port: 5000'
echo 'Backend server inbound port: 5001'
