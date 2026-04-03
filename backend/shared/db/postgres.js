const pgp = require('pg-promise');
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env')
});

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};