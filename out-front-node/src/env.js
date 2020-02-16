'use strict'
require('dotenv').config()
const process = require('process');

module.exports = {
    worker: process.env.WORKER_ADDRESS.toLowerCase(),
    bnKey: process.env.BLOCKNATIVE_API_KEY,
    bnUrl: process.env.BLOCKNATIVE_URL,
};
