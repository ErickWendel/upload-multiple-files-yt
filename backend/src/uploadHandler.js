const path = require('path');
const fs = require('fs');

const Busboy = require('busboy');
const { logger, pipelineAsync } = require('./util');


const FILE_EVENT_NAME = 'file-uploaded'

class UploadHandler {
    #io
    #socketId

    constructor(io, socketId) {
        this.#io = io
        this.#socketId = socketId
    }

    registerEvents(response, headers) {
        const busboy = new Busboy({ headers });
        const redirectTo = headers.origin

        busboy.on('file', this.#onFile.bind(this));
        busboy.on('finish', this.#onFinish(response, redirectTo));

        return busboy
    }

    #handleFileBytes(filename) {

        async function* handleData(data) {
            for await (const item of data) {
                const size = item.length
                // logger.info(`File [${filename}] got ${size} bytes to ${this.#socketId}`)
                this.#io.to(this.#socketId).emit(FILE_EVENT_NAME, size)

                yield item
            }
        }

        return handleData.bind(this)
    }

    async #onFile(fieldname, file, filename) {
        const saveTo = path.join(__dirname, '../', 'downloads', filename);
        logger.info('Uploading: ' + saveTo);

        await pipelineAsync(
            file,
            this.#handleFileBytes.apply(this, [filename]),
            fs.createWriteStream(saveTo),
        )

        logger.info(`File [${filename}] Finished`)
    }


    #onFinish(response, redirectTo) {
        return () => {
            logger.info('Upload complete');

            response.writeHead(303, {
                Connection: 'close',
                Location: redirectTo,
            });

            response.end();
        }
    }
}


module.exports = UploadHandler