require('dotenv').config();

const registerTestRoute = require("./test/registerTest");

const cors = require('cors');
const express = require('express');

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.use("/api", registerTestRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT,() => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Zimba Backend API');
});

module.exports = app;