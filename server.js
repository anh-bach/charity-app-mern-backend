const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { readdirSync } = require('fs');

//app initialization
const app = express();

//database
mongoose
  .connect(
    process.env.MONGO_URL.replace('<password>', process.env.MONGO_PASSWORD)
  )
  .then(() => console.log('DB connected'))
  .catch((err) => console.log('DB connection error: --> ', err));

//middlewares
app.use(express.json({ limit: '2mb' }));
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

//routes middlewares
readdirSync('./routes').map((route) => {
  app.use('/api', require(`./routes/${route}`));
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`App is running on port: ${PORT}`));
