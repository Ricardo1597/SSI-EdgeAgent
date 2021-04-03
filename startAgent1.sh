#!/bin/bash

starting_port=5100
ending_port=5650
port_to_use=-1

for i in $(seq $starting_port $ending_port); do
    if ! [[ $(sudo netstat -plnt | grep ":$i") ]]; then
        port_to_use=$i
        break
    elif [ "$i" == "$ending_port" ]; then
        echo "no ports to use"
    else
    	port_to_use=$((port_to_use + 1))
    fi
done

if [ "$port_to_use" == "-1" ]; then
	exit 1
fi

echo 'Initializing backend server...'
cd edge-agent/engineJS
export ADMIN_PORT=$port_to_use 
export INBOUND_PORT=$(( port_to_use + 1 ))
POOL_IP=172.17.0.1 
npm start >/dev/null &
# Let backend initialize
sleep 10 
echo "Backend server admin port: $ADMIN_PORT"
echo "Backend server inbound port: $INBOUND_PORT"

echo 'Initializing frontend server...'
cd ../reactJS
export REACT_APP_SERVER_PORT=$ADMIN_PORT 
export REACT_APP_AGENT_PORT=$INBOUND_PORT
npm start --silent
echo "Frontend server port: $REACT_APP_SERVER_PORT"
echo "Frontend agent port: $REACT_APP_AGENT_PORT"