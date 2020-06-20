const indy = require('../../../index.js');
const messages = require('./messages')

exports.messages = messages;

// Using problem report protocol to hadling rejections
exports.rejectExchange = async (record, recordId, rejectError, messageType, recordType, stateToTransit) => {
    if( record.state != rejectError.state) {
        throw new Error(`Invalid state trasition.`);
    }

    // Get connection to send message (exchange rejection)
    const connection = await indy.connections.getConnection(record.connectionId);

    const rejectMessage = messages.createProblemeReportMessage(
        messageType,
        rejectError.code,
        rejectError.description,
        "thread",
        connection.threadId
    );

    const [message, endpoint] = await indy.messages.prepareMessage(
        rejectMessage, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);
    
    // Update record
    record.state = stateToTransit;
    record.error = {
        self: true,
        description: rejectMessage.description 
    };
    record.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        recordType, 
        recordId, 
        JSON.stringify(record)
    );
  
    return [record, rejectMessage];
}