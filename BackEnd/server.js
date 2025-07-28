// index.js
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const dataRoutes = require('./routes/dataRoutes');
const annotationRoutes = require('./routes/anotationRoute');
const usersRoutes = require('./routes/userRoute');
const progressRoute = require("./routes/progressRoute")

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// Use routes
app.use('/api/data', dataRoutes);
app.use('/api/annotation', annotationRoutes);
app.use('/api/users', usersRoutes);
app.use("/api/progress", progressRoute);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

