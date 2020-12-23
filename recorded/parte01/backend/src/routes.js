const url = require('url')
class Routes {
    #io
    constructor(io) {
        this.#io = io
    }

    async post(request, response) {
        const { headers } = request
        const { query: { socketId } } = url.parse(request.url, true)
        const redirectTo = headers.origin
        
        this.#io.to(socketId).emit('file-uploaded', 5e9)
        this.#io.to(socketId).emit('file-uploaded', 5e9)
        this.#io.to(socketId).emit('file-uploaded', 5e9)
        this.#io.to(socketId).emit('file-uploaded', 5e9)

        const onFinish = (response, redirectTo) => {
            response.writeHead(303, {
                Connection: 'close',
                Location: `${redirectTo}?msg=Files uploaded with success!`
            })

            response.end()
        }
        setTimeout(() => {
            return onFinish(response, headers.origin)
            
        }, 2000);
    }
}

module.exports = Routes