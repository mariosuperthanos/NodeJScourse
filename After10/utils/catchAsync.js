module.exports = fn => {
  // it return a middlewere function that is necessary for
  // passing err(using next()) into the global error handler
  return (req, res, next) => {
    // we don't care about the resolve val of the fn, but only about catching the errors
    fn(req, res, next).catch(err => next(err));
  }
}