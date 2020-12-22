
const path = require('path');
const fs = require('fs');
const url = require('url');

const { promisify } = require('util')
const { pipeline } = require('stream');
const pipelineAsync = promisify(pipeline)

const logger = require('pino')({
    prettyPrint: {
        ignore: 'pid,hostname' 

    },
});
const PORT = 3000
let counter = 0
const log = (...args) => logger.info(`[${counter++}] `.concat(...args))

const Busboy = require('busboy');
const FILE_EVENT_NAME = 'file-uploaded'
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
}

const handler = async function (req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    if (req.method === 'POST') {
        const { query: { socketId } } = url.parse(req.url, true)
        const { origin } = req.headers

        const busboy = new Busboy({ headers: req.headers });

        busboy.on('file', onFile(socketId));
        busboy.on('finish', onFinish(res, origin));

        try {
            await pipelineAsync(
                req,
                busboy
            )
        } catch (error) {
            log('error**', error.stack)
            return res.end(`Error!!: ${error.stack}`)
        }
    }

}


const onFile = (socketId) => async (fieldname, file, filename, encoding, mimetype) => {
    const saveTo = path.join('.', filename);
    log('Uploading: ' + saveTo);

    await pipelineAsync(
        file,
        async function* (data) {
            for await (const item of data) {
                const size = item.length
                log(`File [${filename}] got ${size} bytes`)

                io.to(socketId).emit(FILE_EVENT_NAME, size)

                yield item
            }
        },
        fs.createWriteStream(saveTo),
    )

    log(`File [${filename}] Finished`)
}

const onFinish = (res, origin) => () => {
    log('Upload complete');
    res.writeHead(303, {
        Connection: 'close',
        Location: origin,
        ...headers,
    });

    res.end();
}


const socketServer = require('http').createServer(handler);
const io = require('socket.io')(socketServer, {
    cors: {
        origin: "*",
        credentials: false,
      }
});

io.on('connection', (_socket) => {
    log('connected!', _socket.id)
});

socketServer.listen(PORT, () => {
    const addresses = socketServer.address()
    const { address: host, port } = addresses

    log(`Example app listening at http://${host}:${port}`)

});