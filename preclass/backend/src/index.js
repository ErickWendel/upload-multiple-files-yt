const http = require('http')

const socketIo = require('socket.io');

const { logger } = require('./util');
const Routes = require('./routes');
const PORT = 3000

const handler = function (request, response) {
    const defaultRoute = async(request, response) => response.end('hello!');

    const routes = new Routes(io)
    const chosen = routes[request.method.toLowerCase()] || defaultRoute

    return chosen.apply(routes, [request, response])
}


const socketServer = http.createServer(handler);
const io = socketIo(socketServer, {
    cors: {
        origin: "*",
        credentials: false,
    }
});

io.on('connection', (socket) => logger.info('someone connected!', socket.id));

const startServer = () => {
    
    const { address: host, port } = socketServer.address()
    logger.info(`app running at http://${host}:${port}`)
}

socketServer.listen(PORT, startServer);