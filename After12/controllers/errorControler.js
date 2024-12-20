const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
  // convert the error and adding a message
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);

}

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if(req.originalUrl.startsWith('/api')){
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    }); 
  } else{
    // RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
      title: 'Something wrong wrong!',
      msg: err.message
    })
  }
}

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR: ', err);

    // 2) Send generic error
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR: ', err);

    // 2) Send generic error
    return res.status(500).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.'
    });
  }
};


// Error handler middlewere function
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if(process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res)
  } else if(process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message, name: err.name };

    if(error.kind === "ObjectId") error = handleCastErrorDB(err);
    if(error.code === 11000) error = handleDuplicateFieldsDB(err);
    if(error.name === "ValidationError") error = handleValidationErrorDB(error);
    if(error.name === "JsonWebTokenError") error = handleJWTError();
    if(error.name === "TokenExpiredError") error = handleJWTExpiredError();
    
    sendErrorProd(error, req, res);
  }

}