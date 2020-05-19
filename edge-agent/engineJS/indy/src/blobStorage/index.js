const fs = require('fs')
const sdk = require('indy-sdk')

// Get handle for the blob storage file reader
exports.createTailsReader = async (path) => {
    try {
        if (fs.existsSync(path)) {
            tails_reader_config = {
                "base_dir": str(tails_file_path.parent.absolute()),
                "file": str(tails_file_path.name),
            }
            return await sdk.openBlobStorageReader("default", tails_reader_config)        
        }
    } catch(err) {
        throw new Error('Tails file does not exist: ', err);
    }
}

// Get handle for the blob storage file writer
exports.createTailsWriter = async (tails_base_dir) => {
    tails_writer_config = {
        "base_dir": tails_base_dir, 
        "uri_pattern": ""
    }
    return await sdk.openBlobStorageWriter("default", tails_writer_config)
}