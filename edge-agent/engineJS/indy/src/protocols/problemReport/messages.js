const uuid = require('uuid');

exports.createProblemReportMessage = (messageType, errorCode, description, impact, pthid) => {
    return {
        "@type": messageType,
        "@id": uuid(),
        "~thread": {
            pthid: pthid,
        },
        description: {
            en: description, 
            code: errorCode },
        impact: impact
    }
}