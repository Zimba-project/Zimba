require('dotenv').config();
const { Pool } = require('pg');

const pgPool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
    ssl: {rejectUnauthorized: false}
});

pgPool.connect((err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Postgres connection ready");
    }
});

module.exports = pgPool;