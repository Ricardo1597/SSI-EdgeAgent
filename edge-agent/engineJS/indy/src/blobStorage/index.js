const sdk = require('indy-sdk')
const path = require('path');

// Get handle for the blob storage file reader
exports.createTailsReader = async (tailsLocalPath) => {
    try {
        tailsReaderConfig = {
            "base_dir": path.dirname(tailsLocalPath),
            "file": path.basename(tailsLocalPath),
        }
        console.log(tailsReaderConfig)
        return await sdk.openBlobStorageReader("default", tailsReaderConfig)    
    } catch(err) {
        throw new Error('Tails file does not exist: ', err);
    }
}

// Get handle for the blob storage file writer
exports.createTailsWriter = async (tailsBaseDir) => {
    tailsWriterConfig = {
        "base_dir": tailsBaseDir, 
        "uri_pattern": ""
    }
    return await sdk.openBlobStorageWriter("default", tailsWriterConfig)
}