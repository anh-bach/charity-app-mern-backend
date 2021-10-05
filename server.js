const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { readdirSync } = require('fs');

//app initialization
const app = express();

//database - connection
mongoose
  .connect(
    process.env.MONGO_URL.replace('<password>', process.env.MONGO_PASSWORD)
  )
  .then(() => console.log('DB connected'))
  .catch((err) => console.log('DB connection error: --> ', err));

//middleware -> helmet - for secure HTTP request
app.use(helmet());

//middlewares -> body parser
app.use(express.json({ limit: '2mb' }));

//middleware -> set CORS
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN_URL,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use(function (req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8');
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

//middleware-> cookie Parser
app.use(cookieParser());

//middleware -> morgan on development mode
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
