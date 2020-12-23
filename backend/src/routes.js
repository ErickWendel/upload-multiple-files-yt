const url = require('url');
const { logger, pipelineAsync } = require('./util');
const UploadHandler = require('./uploadHandler');


class Routes {
    #io
    constructor(io) {
        this.#io = io
    }
    async options(request, response) {
        response.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
        });

        return response.end();
    }

    async post(request, response) {
        const { headers } = request
        const { query: { socketId } } = url.parse(request.url, true)

        const uploadHandler = new UploadHandler(this.#io, socketId)
        const busboyInstance = uploadHandler.registerEvents(response, headers)

        try {
            await pipelineAsync(
                request,
                busboyInstance
            )

        } catch (error) {
            logger.error('error** ' + error.stack)
            return response.end(`Error!!: ${error.stack}`)
        }
    }

}

module.exports = Routes