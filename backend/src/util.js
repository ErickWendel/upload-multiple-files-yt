const logger = require('pino')({
    prettyPrint: {
        ignore: 'pid,hostname'

    },
});

const { promisify } = require('util')
const { pipeline } = require('stream');
const pipelineAsync = promisify(pipeline)


module.exports = {
    pipelineAsync,
    promisify,
    logger: logger,
}