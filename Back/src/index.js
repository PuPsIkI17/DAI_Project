const express = require('express');
const bodyParser = require('body-parser');
const mealsRouter = require('./routes/Router');
const cors = require('cors')


const app = express();

// Setup parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

var corsOptions = {
    origin: "*"
};
app.use(cors(corsOptions));

// Setup Router
app.use('/', mealsRouter);

// Start listening
app.listen(9091);
