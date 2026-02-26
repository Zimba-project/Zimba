require('dotenv').config();
const cors = require('cors');
const express = require('express');
const registerTestRoute = require("./test/registerTest");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const uploadRoutes = require("./routes/upload");
const aiRoutes = require("./routes/ai");
const usersRoutes = require("./routes/users");
const groupRoutes = require("./routes/groups");

console.log("Gemini AI integration ready");
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Welcome to the Zimba Backend API');
});

app.use("/api", registerTestRoute);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/uploads', express.static('/storage/uploads'));
app.use("/api/ai", aiRoutes);
app.use("/api/groups", groupRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;