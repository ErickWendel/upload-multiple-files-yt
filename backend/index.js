let counter = 0
const log = (...args) => console.log(`[${counter++}]`, ...args)

const path = require('path');
const fs = require('fs');

const Busboy = require('busboy');
const { promisify } = require('util')
const { pipeline } = require('stream');
const pipelineAsync = promisify(pipeline)

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    'Access-Control-Max-Age': 2592000, // 30 days
    /** add other headers as per requirement */
};

const handler = async function (req, res) {

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    if (req.method === 'POST') {
        const busboy = new Busboy({ headers: req.headers });
        busboy.on('file', onFile(req.socket));
        busboy.on('finish', onFinish(res));

        try {
            await pipelineAsync(
                req,
                busboy
            )
            return;
        } catch (error) {
            log('error**', error.stack)
            return res.end(`Error!!: ${error.stack}`)
        }
    }

}


const onFile = (socket) => (fieldname, file, filename, encoding, mimetype) => {
    const saveTo = path.join('.', filename);
    log('Uploading: ' + saveTo);
    file.pipe(fs.createWriteStream(saveTo));
    log(`File [${fieldname}]: filename: '${filename}', encoding: ${encoding}, mimetype: ${mimetype}`);
    file.on('data', (data) => {
        const size = data.length
        log(`File [${fieldname}] got ${size} bytes`)
        
        socket.emit('file-uploaded', size)
    });
    file.on('end', () => log(`File [${fieldname}] Finished`));
}

const onFinish = res => () => {
    log('Upload complete');
    res.writeHead(303, { 
        Connection: 'close' ,
        ...headers,
    });

    res.end("That's all folks!");
}


const socketServer = require('http').createServer(handler);
const io = require('socket.io')(socketServer);

io.on('connection', (_socket) => {
    console.log('connected!', _socket.id)
});

socketServer.listen(3000, () => {
    const addresses = socketServer.address()
    const { address: host, port } = addresses

    log('Example app listening at http://%s:%s', host, port)

});