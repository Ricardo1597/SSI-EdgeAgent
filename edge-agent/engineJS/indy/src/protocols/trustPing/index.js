'use strict';
const indy = require('../../../index.js');
const messages = require('./messages')

exports.handlers = require('./handlers');
exports.MessageType = messages.MessageType;
exports.NewMessageType = messages.NewMessageType;


// Create and send trust ping
exports.createAndSendTrustPing = async (connectionId, comment=null) => {
    // Get connection to send message (presentation proposal)
    const connection = await indy.connections.getConnection(
        connectionId
    );
    if( connection.state !== indy.connections.ConnectionState.Complete) {
        throw new Error(`Invalid state trasition. Connection is not completed yet.`);
    }

    const trustPingMessage = messages.createTrustPing(
        true, 
        comment
    );
    
    // Create and send proposal message to a given endpoint
    const [message, endpoint] = await indy.messages.prepareMessage(
        trustPingMessage, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);

    // Save created presentation exchange record in the wallet
    await this.addPresentationExchangeRecord(
        presentationExchangeRecord.presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord), 
        {'connectionId': connection.connectionId, 'threadId': presentationExchangeRecord.threadId}
    );
    
    return [presentationExchangeRecord, presentationProposalMessage];
}