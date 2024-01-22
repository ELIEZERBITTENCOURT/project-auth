const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const { initializeDatabase } = require('./config/db');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());

initializeDatabase();

app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});