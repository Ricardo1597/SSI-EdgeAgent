echo 'Initializing backend server...'
cd edge-agent/engineJS
ADMIN_PORT=5002 
INBOUND_PORT=5003 
POOL_IP=172.17.0.1 
npm start >/dev/null &
sleep 10
echo "Backend server admin port: $ADMIN_PORT"
echo "Backend server inbound port: $INBOUND_PORT" 
