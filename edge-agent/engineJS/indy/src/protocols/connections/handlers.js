'use strict';
const indy = require('../../../index.js');
const connectionsIndex = require('./index');
const generalTypes = require('../generalTypes');

exports.requestHandler = async (decryptedMessage, socket) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage;

    try {
        // verify if did and did document are present and are valid
        try {
            validateConnectionField(message, sender_verkey);
        } catch (err) {
            throw {
                externalMessage: 'Invalid DID or DID Document in message connection field.',
                internalMessage: err,
            };
        }

        const invitation = await indy.connections.getInvitation(message['~thread']['pthid']);
        
        if(!invitation){ // Invitation not found
            throw {
                externalMessage: 'Invitation not valid.',
                internalMessage: `Invitation for verkey ${recipient_verkey} not found!`,
            };
        }

        if(!invitation.isActive) { // Cannot accept request for inactive invitation
            throw {
                externalMessage: 'Invitation not valid.',
                internalMessage: 'This invitation is currently inactive.',
            };
        }

        if(!invitation.isMultiuse && invitation.timesUsed > 0) { // Cannot use singleuse invitation more than once
            throw {
                externalMessage: 'Invitation not valid.',
                internalMessage: 'This invitation can only be used once!',
            };
        }

        let connection = {};
        // This is intended to let the issuer use the same public did/verkey for 
        // all the connections. The main problem with this is the need of saving
        // the verkey of the other party as well.
        // if(invitation.isPublic) {
        //     connection = await connectionsIndex.createPublicDidConnection(
        //         invitation.myDid,
        //         generalTypes.Initiator.Self,
        //         message['@id']
        //     );    
        // } else {
        //     connection = await connectionsIndex.createPeerDidConnection(
        //         generalTypes.Initiator.Self,
        //         message['@id']
        //     );
        // }
        
        // Just create a new did/verkey for each new connection
        connection = await connectionsIndex.createPeerDidConnection(
            generalTypes.Initiator.Self,
            invitation.alias,
            message['@id']
        );

        // Add did document to the wallet
        await indy.didDoc.addLocalDidDocument(message.connection.did_doc);
        
        // Add connection record
        connection.alias = invitation.alias;
        connection.invitation = invitation;
        connection.theirDid = message.connection.did;
        connection.state = connectionsIndex.ConnectionState.Requested;
        await connectionsIndex.addConnection(
            connection.connectionId, 
            JSON.stringify(connection),
            {'myVerkey': connection.myVerkey}
        );

        // Update invitation times used
        invitation.timesUsed++;
        invitation.updatedAt = indy.utils.getCurrentDate();
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.Invitation, 
            invitation.invitationId, 
            JSON.stringify(invitation)
        );

        // Emit event to client-side
        socket.emit('notification', { 
            protocol: 'connection',
            type: 'request',
            record: connection
        });

        let autoAccept = false // REMOVE LATER AND USE USER OPTION
        if(autoAccept)
            await indy.connections.createAndSendResponse(connection.connectionId);
        
        console.log("Connection Id created in request handler: ", connection.connectionId);

    } catch(error){ 
        // In invitation we need to create and send this message in a different way
        // because we couldn't yet have a connection record created.

        // Create problem report message if there is an external message error
        console.log('Create and send problem report message.')
        const problemReportMessage = indy.problemReport.messages.createProblemReportMessage(
            connectionsIndex.MessageType.ProblemReport,
            "request_processing_error",
            error.externalMessage || "Internal server error.",
            "message",
            message['@id']
        );
        
        const endpoint = message.connection.did_doc.service[0].serviceEndpoint;
        console.log(endpoint);
        const messageToSend = await indy.wallet.pack(problemReportMessage, [sender_verkey], recipient_verkey);
        console.log(messageToSend);
        // Send problem report message
        indy.messages.sendMessage(messageToSend, endpoint);

        throw error.internalMessage || error;
    }

    return null;
};

exports.responseHandler = async (decryptedMessage, socket) => {
    const { message, recipient_verkey, sender_verkey } = decryptedMessage;
    
    let connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );

    // If no connection was found, it is not possible to use Report Problem Protocol
    if(!connection) {
        throw new Error(`Connection for verkey ${recipient_verkey} not found.`);
    }

    // Verify signature in connection field
    const originalMessage = await indy.crypto.verify(
        message, 
        'connection', 
        connection.invitation.recipientKeys
    );

    try {
        // verify if did and did document are present and are valid
        try {
            validateConnectionField(originalMessage, sender_verkey);
        } catch (err) {
            throw {
                externalMessage: 'Invalid DID or DID Document in message connection field.',
                internalMessage: err,
            };
        }
        
        connection.theirDid = originalMessage.connection.did;
        // If it is a public did then it's in the blockchain and there's no need to save it in the wallet
        if(connection.theirDid.split(':')[1] === "peer") {
            await indy.didDoc.addLocalDidDocument(originalMessage.connection.did_doc);
        }

        if(connection.state != connectionsIndex.ConnectionState.Requested){
            throw {
                externalMessage: 'Unable to accept response at current state.',
                internalMessage: `Invalid state transition.`
            };
        }

        // Update connection record
        connection.state = connectionsIndex.ConnectionState.Responded;
        connection.updatedAt = indy.utils.getCurrentDate();
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.Connection, 
            connection.connectionId, 
            JSON.stringify(connection)
        );

        // Emit event to client-side
        socket.emit('notification', { 
            protocol: 'connection',
            type: 'response',
            record: connection
        });
        
        let autoAccept = true // REMOVE LATER AND USE USER OPTION
        if(autoAccept)
            await indy.connections.createAndSendAck(connection.connectionId);

    } catch(error){
        // problem report
        await sendHandlerProblemReport(
            connection,
            {
                code: "response_processing_error",
                description: error.externalMessage || "Internal server error."
            }
        );
        throw error;
    }

    return null;
};

exports.acknowledgeHandler = async (decryptedMessage) => {
    const { message, recipient_verkey, sender_verkey } = decryptedMessage;
    
    let connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );

    // If no connection was found, it is not possible to use Report Problem Protocol
    if(!connection) {
        throw new Error(`Connection for verkey ${recipient_verkey} not found.`);
    }

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);
    
    try {

        if(connection.state != connectionsIndex.ConnectionState.Responded){
            throw {
                externalMessage: 'Unable to accept ack at current state.',
                internalMessage: `Invalid state transition.`
            };
        }

        if (message['status'] === "OK"){
            if(connection.state !== connectionsIndex.ConnectionState.Complete) {
                connection.state = connectionsIndex.ConnectionState.Complete;
                connection.updatedAt = indy.utils.getCurrentDate();
                await indy.wallet.updateWalletRecordValue(
                    indy.recordTypes.RecordType.Connection, 
                    connection.connectionId, 
                    JSON.stringify(connection)
                );
            }
        } else {
            throw {
                externalMessage: 'Invalid message. Wrong status.',
                internalMessage: 'Invalid message.'
            };
        }

    } catch(error){
        // problem report
        await sendHandlerProblemReport(
            connection,
            {
                code: "acknowledge_processing_error",
                description: error.externalMessage || "Internal server error."
            }
        );
        throw error;
    }

    return null;
};


exports.problemReportHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage;

    let connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );   

    if(!message.description || !message.description.code) {
        console.log("Received connection problem report without error code.")
        return;
    }

    switch(message.description.code) {
        case "request_not_accepted":
        case "request_processing_error":
            if(connection.state != connectionsIndex.ConnectionState.Requested) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Connection request returned with a problem.");
            connection.state = connectionsIndex.ConnectionState.Invited;
            break;
        case "response_not_accepted":
        case "response_processing_error":
            if(connection.state != connectionsIndex.ConnectionState.Responded) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Connection response returned with a problem.");
            connection.state = connectionsIndex.ConnectionState.Requested;
            break;
        case "acknowledge_processing_error":
            if(connection.state != connectionsIndex.ConnectionState.Complete) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Connection acknowledge returned with a problem.");
            connection.state = connectionsIndex.ConnectionState.Responded;
            break;
        case "connection_abandoned":
            console.log("Connection abandoned.");
            connection.state = connectionsIndex.ConnectionState.Error;
            connection.error = {
                self: false,
                description: message.description
            };
            break;
        default:
            console.log(message.description);
    }

    // update record (for now just return to previous state or error state)
    connection.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        JSON.stringify(connection)
    );

    return null;
};


const sendHandlerProblemReport = async (connection, error) => {
    await indy.problemReport.sendProblemReport(
        connection,
        connection.connectionId,
        error,
        "message",
        connectionsIndex.MessageType.ProblemReport,
        indy.recordTypes.RecordType.Connection
    );
}

const validateConnectionField = (message, sender_verkey) => {
    if (!message.connection) 
        throw 'Invalid message';

    if(!message.connection.did) 
        throw 'No DID provided.';
    if(!message.connection.did_doc) 
        throw 'No DIDDoc provided.';
    if(message.connection.did != message.connection.did_doc.id) 
        throw 'Connection Did does not match DidDoc id.';
    
    const service = message.connection.did_doc.service[0]
    if (!service) 
        throw 'No communication service provided.';
    if (service.recipientKeys && service.recipientKeys.length == 0)
        throw 'No service recipient keys provided.';
    // Check if sender verkey is in service recipient keys
    if (service.recipientKeys.indexOf(sender_verkey) == -1) 
        throw 'Sender verkey is not in the provided service recipient keys.';
}