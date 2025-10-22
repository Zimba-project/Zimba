const express = require("express");
const router = express.Router();
const pgPool = require("../database/pg_connection"); 

const sql = {
  REGISTER: 'INSERT INTO "test" (username, password, joindate) VALUES ($1, $2, $3) RETURNING *;',
};

router.post("/registerTest", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const joindate = new Date();

    const result = await pgPool.query(sql.REGISTER, [username, password, joindate]);

    res.status(201).json({
      message: "User registered successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
