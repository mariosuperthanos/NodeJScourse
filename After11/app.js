const path = require('path');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControler')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// const tours = require(`${__dirname}/dev-data/data/tours-simple.json`);
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views'));
// 1) GLOBAL MIDDLEWERE
// Set security HTTP headers
app.use(helmet());

console.log(process.env.NODE_ENV);
// Development logging
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
  console.log('This module has acces to proces.env object');
}

// limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  messag: 'Too many requests form this IP, please try again in an hour' 
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
// req.body is a json object by default
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS 
app.use(xss())

// Prevent parameters pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsAverage',
    'ratingsQuantity',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));


// Test middlewre
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// Mount the tourRouter on the '/api/v1/tours' path
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// all the routes that weren't handled before
app.all('*', (req, res, next) => {
  // because next() has an argument, Express will skip all the middleweres
  // and pass the error in global error handling middlewere
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Express knows that this function is an error handling middlewere
// because it has 4 parameters
app.use(globalErrorHandler);

module.exports = app;