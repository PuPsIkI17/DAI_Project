const express = require('express');
const bodyParser = require('body-parser');
const mealsRouter = require('./routes/Router');

const app = express();

// Setup parser
app.use(bodyParser.json());

// Setup Router
app.use('/', mealsRouter);

// Start listening
app.listen(9091);
