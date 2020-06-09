'use strict';
const indy = require('../../index.js');

module.exports = function(config) { //factory function creates object and returns it.
    const factory = {};
    const messageHandlerMap = {};

    if(!config) {
        config = {};
    }

    factory.defineHandler = function(messageType, handler) {
        if(!messageType || typeof messageType !== 'string') {
            throw Error("Invalid message type: messageType must be a non-empty string");
        }
        if(!handler || typeof handler !== 'function') {
            throw Error("Invalid message handler: handler must be a function");
        }
        if(messageHandlerMap.hasOwnProperty(messageType)) {
            throw Error(`Duplicate message handler: handler already exists for message type ${messageType}`);
        }
        messageHandlerMap[messageType] = handler;
    };

    factory.middleware = async function(req, res) {
        try{
            let decryptedMessage = await indy.wallet.unpack(req.body);
            console.log("Message received: " + JSON.stringify(decryptedMessage));

            if(messageHandlerMap[decryptedMessage.message['@type']]) {
                let handler = messageHandlerMap[decryptedMessage.message['@type']];
                if(handler.length === 2) { // number of parameters
                    handler(decryptedMessage, function(err) {
                        if(err) {
                            console.error(err.stack);
                            throw err;
                        } else {
                            res.status(202).send("Accepted");
                        }
                    })
                } else {
                    handler(decryptedMessage)
                        .then((data) => {
                            res.status(202).send("Accepted");
                        })
                        .catch((err) => {
                            console.error(err.stack);
                            throw err;
                        })
                }
            } else {
                throw new Error('Invalid Message')
            }

        } catch(err) {
            console.error(err.stack);
            if(err.message === "Invalid Request" || err.message === "Invalid Message") {
                res.status(400).send(err.message);
            } else {
                res.status(500).send("Internal Server Error");
            }
        }
    };

    if(config.defaultHandlers) {
        factory.defineHandler(indy.connections.MessageType.ConnectionRequest, indy.connections.handlers.requestHandler);
        factory.defineHandler(indy.connections.MessageType.ConnectionResponse, indy.connections.handlers.responseHandler);
        factory.defineHandler(indy.connections.MessageType.ConnectionAck, indy.connections.handlers.acknowledgeHandler);
        // factory.defineHandler(indy.messages.MessageType.BasicMessage, indy.messages.handlers.basicMessageHandler);
        // factory.defineHandler(indy.messages.MessageType.ForwardMessage, indy.messages.handlers.forwardMessageHandler);
        // factory.defineHandler(indy.messages.MessageType.TrustPingMessage, indy.messages.handlers.trustPingMessageHandler);
        factory.defineHandler(indy.credentialExchange.MessageType.CredentialProposal, indy.credentialExchange.handlers.proposalHandler);
        factory.defineHandler(indy.credentialExchange.MessageType.CredentialOffer, indy.credentialExchange.handlers.offerHandler);
        factory.defineHandler(indy.credentialExchange.MessageType.CredentialRequest, indy.credentialExchange.handlers.requestHandler);
        factory.defineHandler(indy.credentialExchange.MessageType.CredentialIssuance, indy.credentialExchange.handlers.credentialHandler);
        factory.defineHandler(indy.credentialExchange.MessageType.CredentialAck, indy.credentialExchange.handlers.acknowledgeHandler);
        factory.defineHandler(indy.presentationExchange.MessageType.PresentationProposal, indy.presentationExchange.handlers.proposalHandler);
        factory.defineHandler(indy.presentationExchange.MessageType.PresentationRequest, indy.presentationExchange.handlers.requestHandler);
        factory.defineHandler(indy.presentationExchange.MessageType.Presentation, indy.presentationExchange.handlers.presentationHandler);
        factory.defineHandler(indy.presentationExchange.MessageType.PresentationAck, indy.presentationExchange.handlers.acknowledgeHandler);
    }

    return factory;
};