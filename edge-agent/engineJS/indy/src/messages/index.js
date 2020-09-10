'use strict';
const axios = require('axios');
const indy = require('../../index');

exports.prepareMessage = async (payload, connection, invitation = null) => {
  let { endpoint, recipientKeys, routingKeys, senderVk } = await getMessageArgs(
    connection,
    invitation
  );
  let message = await indy.wallet.pack(payload, recipientKeys, senderVk);

  // Check for routing keys (not in use right now)
  if (routingKeys && routingKeys.length > 0) {
    for (const routingKey of routingKeys) {
      const [recipientKey] = recipientKeys;
      const forwardMessage = messages.createForwardMessage(recipientKey, message);
      message = await indy.wallet.pack(forwardMessage, [routingKey], senderVk);
    }
  }
  return [message, endpoint];
};

exports.sendMessage = async (payload, endpoint) => {
  if (!endpoint) {
    throw new Error(`Missing endpoint. I don't know how and where to send the message.`);
  }

  console.log('Sending message...');
  console.log(payload);

  // sleep for 1 second to ensure the order in the messages sent
  await new Promise((r) => setTimeout(r, 1000));

  axios
    .post(`${endpoint}`, payload)
    .then((res) => {
      if (res.status < 200 || res.status > 299) {
        console.log('Unexpected response status: ', res.status);
      }
    })
    .catch((error) => {
      console.error('Error status: ', error.response.status);
      console.error('Error Description: ', error.response.data);
    });
};

async function getMessageArgs(connection, invitation = null) {
  if (invitation) {
    // public invitation needs to get the document from the blockchain
    if (invitation.did && invitation.did.split(':')[1] !== 'peer') {
      const didDoc = await indy.ledger.getDidAttribute(
        null,
        invitation.did,
        null,
        'did-document',
        null
      );
      if (!didDoc) {
        throw new Error(`DidDoc for invitation with did ${invitation.did} not found!`);
      }
      return {
        endpoint: didDoc.service[0].serviceEndpoint,
        recipientKeys: didDoc.service[0].recipientKeys,
        routingKeys: didDoc.service[0].routingKeys,
        senderVk: connection.myVerkey,
      };
    }
    return {
      endpoint: invitation.serviceEndpoint,
      recipientKeys: invitation.recipientKeys,
      routingKeys: invitation.routingKeys || [],
      senderVk: connection.myVerkey,
    };
  }

  const theirDidDoc = await indy.did.resolveDid(connection.theirDid);

  if (!theirDidDoc) {
    throw new Error(`DidDoc for connection with verkey ${connection.myVerkey} not found!`);
  }

  return {
    endpoint: theirDidDoc.service[0].serviceEndpoint,
    recipientKeys: theirDidDoc.service[0].recipientKeys,
    routingKeys: theirDidDoc.service[0].routingKeys,
    senderVk: connection.myVerkey,
  };
}
