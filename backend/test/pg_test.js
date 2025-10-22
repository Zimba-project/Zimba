const pgPool = require('../database/pg_connection');

const sql = {
    TEST: 'INSERT INTO "test" (username, password, joindate) VALUES ($1, $2, $3)',
};

async function testRegister(username, passwordHash, joindate) {
    let result = await pgPool.query(sql.TEST, [username, passwordHash, joindate]);
    return result.rows[0];
}

module.exports = { testRegister };