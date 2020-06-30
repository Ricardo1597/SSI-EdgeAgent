'use strict';
const indy = require('../../../index.js');
const messages = require('./messages')


exports.trustPingHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage
    const connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );   

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    if(message.response_requested){
        const trustPingResponseMessage = messages.createTrustPingResponse(message['@id'], comment);
        
        // Create and send proposal message to a given endpoint
        const [message, endpoint] = await indy.messages.prepareMessage(
            trustPingResponseMessage, 
            connection
        );
        indy.messages.sendMessage(message, endpoint);
    }

    // Do actions here

    return null;
};


exports.trustPingResponseHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage
    const connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );   

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    // Do actions here

    return null;
};