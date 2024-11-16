const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// const tours = require(`${__dirname}/dev-data/data/tours-simple.json`);
const app = express();

// 1) MIDDLEWERE
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
  console.log('This module has acces to proces.env object');
}


app.use(express.json());

// express.static middlewere give acces to static files. Static means pre-rendered web pages that do not change on time. Dynamic means it is generated in real-time at the time of the request by the server.
app.use(express.static(`${__dirname}/public/`));

// it applies to any single request
app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Mount the tourRouter on the '/api/v1/tours' path
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


module.exports = app;

// Middlewere definition: Middleware is a function (or set of functions) that processes requests before they reach the route handlers (controllers) and/or processes responses before they are sent to the client. It operates in the "middleware stack" and is executed in the order in which it's defined in the application.

// Middleware and controllers are executed in the order they are defined with app.use()