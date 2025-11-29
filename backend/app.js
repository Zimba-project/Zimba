require('dotenv').config();
const cors = require('cors');
const express = require('express');
const registerTestRoute = require("./test/registerTest");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Welcome to the Zimba Backend API');
});

// existing test route
app.use("/api", registerTestRoute);

// new auth routes
app.use("/api/auth", authRoutes);

// new post routes
app.use("/api/posts", postRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
module.exports = app;
