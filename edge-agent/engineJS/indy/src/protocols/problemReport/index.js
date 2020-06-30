const indy = require('../../../index.js');
const messages = require('./messages')

exports.messages = messages;

// Using problem report protocol to hadling rejections
exports.sendProblemReport = async (record, recordId, rejectError, impact, messageType, recordType, stateToTransit=null) => {
    if( rejectError.state && record.state != rejectError.state) {
        throw new Error(`Invalid state trasition.`);
    }

    // Create problem report message
    const problemReportMessage = indy.problemReport.messages.createProblemReportMessage(
        messageType,
        rejectError.code,
        rejectError.description,
        impact,
        record.threadId
    );

    // Get connection to send message (problem report)
    let connection = {};
    if(recordType === indy.recordTypes.RecordType.Connection){
        connection = record;
    } else {
        connection = await indy.connections.getConnection(record.connectionId);
    }
    const [message, endpoint] = await indy.messages.prepareMessage(
        problemReportMessage, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);
    
    // Update record
    if(stateToTransit) {
        record.state = stateToTransit;
    }
    record.error = {
        self: true,
        description: problemReportMessage.description 
    };
    record.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        recordType, 
        recordId, 
        JSON.stringify(record)
    );
  
    return [record, problemReportMessage];
}
