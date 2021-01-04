'use strict';
const indy = require('../../index.js');

module.exports = function (config) {
  //factory function creates object and returns it.
  const factory = {};
  const messageHandlerMap = {};

  if (!config) {
    config = {};
  }

  factory.defineHandler = (messageType, handler) => {
    if (!messageType || typeof messageType !== 'string') {
      throw Error('Invalid message type: messageType must be a non-empty string');
    }
    if (!handler || typeof handler !== 'function') {
      throw Error('Invalid message handler: handler must be a function');
    }
    if (messageHandlerMap.hasOwnProperty(messageType)) {
      throw Error(
        `Duplicate message handler: handler already exists for message type ${messageType}`
      );
    }
    messageHandlerMap[messageType] = handler;
  };

  factory.middleware = async (req, res) => {
    try {
      let decryptedMessage = await indy.wallet.unpack(req.body);
      console.log('Message received: ' + JSON.stringify(decryptedMessage));

      if (messageHandlerMap[decryptedMessage.message['@type']]) {
        let handler = messageHandlerMap[decryptedMessage.message['@type']];
        if (handler.length === 3) {
          // number of parameters
          handler(decryptedMessage, req.app.io, function (err) {
            if (err) {
              console.error(err);
              res.status(400).send(err);
            } else {
              res.status(202).send();
            }
          });
        } else {
          handler(decryptedMessage, req.app.io)
            .then((data) => {
              res.status(202).send();
            })
            .catch((err) => {
              console.error(err);
              res.status(400).send(err);
            });
        }
      } else {
        throw new Error('Invalid Message');
      }
    } catch (err) {
      console.error(err);
      if (err.message === 'Invalid Request' || err.message === 'Invalid Message') {
        res.status(400).send(err.message);
      } else {
        res.status(500).send('Internal Server Error');
      }
    }
  };

  if (config.defaultHandlers) {
    factory.defineHandler(
      indy.connections.MessageType.ConnectionRequest,
      indy.connections.handlers.requestHandler
    );
    factory.defineHandler(
      indy.connections.MessageType.ConnectionResponse,
      indy.connections.handlers.responseHandler
    );
    factory.defineHandler(
      indy.connections.MessageType.ConnectionAck,
      indy.connections.handlers.acknowledgeHandler
    );
    factory.defineHandler(
      indy.connections.MessageType.ProblemReport,
      indy.connections.handlers.problemReportHandler
    );
    factory.defineHandler(
      indy.trustPing.MessageType.TrustPing,
      indy.trustPing.handlers.trustPingHandler
    );
    factory.defineHandler(
      indy.trustPing.MessageType.TrustPingResponse,
      indy.trustPing.handlers.trustPingResponseHandler
    );
    // factory.defineHandler(indy.messages.MessageType.BasicMessage, indy.messages.handlers.basicMessageHandler);
    // factory.defineHandler(indy.messages.MessageType.ForwardMessage, indy.messages.handlers.forwardMessageHandler);
    factory.defineHandler(
      indy.credentialExchange.MessageType.CredentialProposal,
      indy.credentialExchange.handlers.proposalHandler
    );
    factory.defineHandler(
      indy.credentialExchange.MessageType.CredentialOffer,
      indy.credentialExchange.handlers.offerHandler
    );
    factory.defineHandler(
      indy.credentialExchange.MessageType.CredentialRequest,
      indy.credentialExchange.handlers.requestHandler
    );
    factory.defineHandler(
      indy.credentialExchange.MessageType.CredentialIssuance,
      indy.credentialExchange.handlers.credentialHandler
    );
    factory.defineHandler(
      indy.credentialExchange.MessageType.CredentialAck,
      indy.credentialExchange.handlers.acknowledgeHandler
    );
    factory.defineHandler(
      indy.credentialExchange.MessageType.RevocationNotification,
      indy.credentialExchange.handlers.revocationHandler
    );
    factory.defineHandler(
      indy.credentialExchange.MessageType.ProblemReport,
      indy.credentialExchange.handlers.problemReportHandler
    );
    factory.defineHandler(
      indy.presentationExchange.MessageType.PresentationProposal,
      indy.presentationExchange.handlers.proposalHandler
    );
    factory.defineHandler(
      indy.presentationExchange.MessageType.PresentationRequest,
      indy.presentationExchange.handlers.requestHandler
    );
    factory.defineHandler(
      indy.presentationExchange.MessageType.Presentation,
      indy.presentationExchange.handlers.presentationHandler
    );
    factory.defineHandler(
      indy.presentationExchange.MessageType.PresentationAck,
      indy.presentationExchange.handlers.acknowledgeHandler
    );
    factory.defineHandler(
      indy.presentationExchange.MessageType.ProblemReport,
      indy.presentationExchange.handlers.problemReportHandler
    );
  }

  // Add new message types
  factory.defineHandler(
    indy.connections.NewMessageType.ConnectionRequest,
    indy.connections.handlers.requestHandler
  );
  factory.defineHandler(
    indy.connections.NewMessageType.ConnectionResponse,
    indy.connections.handlers.responseHandler
  );
  factory.defineHandler(
    indy.connections.NewMessageType.ConnectionAck,
    indy.connections.handlers.acknowledgeHandler
  );
  factory.defineHandler(
    indy.connections.NewMessageType.ProblemReport,
    indy.connections.handlers.problemReportHandler
  );
  factory.defineHandler(
    indy.trustPing.NewMessageType.TrustPing,
    indy.trustPing.handlers.trustPingHandler
  );
  factory.defineHandler(
    indy.trustPing.NewMessageType.TrustPingResponse,
    indy.trustPing.handlers.trustPingResponseHandler
  );
  // factory.defineHandler(indy.messages.NewMessageType.BasicMessage, indy.messages.handlers.basicMessageHandler);
  // factory.defineHandler(indy.messages.NewMessageType.ForwardMessage, indy.messages.handlers.forwardMessageHandler);
  factory.defineHandler(
    indy.credentialExchange.NewMessageType.CredentialProposal,
    indy.credentialExchange.handlers.proposalHandler
  );
  factory.defineHandler(
    indy.credentialExchange.NewMessageType.CredentialOffer,
    indy.credentialExchange.handlers.offerHandler
  );
  factory.defineHandler(
    indy.credentialExchange.NewMessageType.CredentialRequest,
    indy.credentialExchange.handlers.requestHandler
  );
  factory.defineHandler(
    indy.credentialExchange.NewMessageType.CredentialIssuance,
    indy.credentialExchange.handlers.credentialHandler
  );
  factory.defineHandler(
    indy.credentialExchange.NewMessageType.CredentialAck,
    indy.credentialExchange.handlers.acknowledgeHandler
  );
  factory.defineHandler(
    indy.credentialExchange.NewMessageType.RevocationNotification,
    indy.credentialExchange.handlers.revocationHandler
  );
  factory.defineHandler(
    indy.credentialExchange.NewMessageType.ProblemReport,
    indy.credentialExchange.handlers.problemReportHandler
  );
  factory.defineHandler(
    indy.presentationExchange.NewMessageType.PresentationProposal,
    indy.presentationExchange.handlers.proposalHandler
  );
  factory.defineHandler(
    indy.presentationExchange.NewMessageType.PresentationRequest,
    indy.presentationExchange.handlers.requestHandler
  );
  factory.defineHandler(
    indy.presentationExchange.NewMessageType.Presentation,
    indy.presentationExchange.handlers.presentationHandler
  );
  factory.defineHandler(
    indy.presentationExchange.NewMessageType.PresentationAck,
    indy.presentationExchange.handlers.acknowledgeHandler
  );
  factory.defineHandler(
    indy.presentationExchange.NewMessageType.ProblemReport,
    indy.presentationExchange.handlers.problemReportHandler
  );

  return factory;
};
