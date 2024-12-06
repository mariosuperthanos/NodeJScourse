const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const { appendFile } = require('fs');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

const createSendToken = (user, statusCode, res) => {
  const tokenToSend = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: false,
    httpOnly: true  // recive the cookie, store it and send it automatically along with every request
  }
  if(process.env.NODE_ENV === 'production'){
    cookieOptions.secure = true; // reduce the man-in-the-middle attacks
  }

  res.cookie('jwt', tokenToSend, cookieOptions)

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    tokenToSend,
    data: {
      user
    }
  })
}

exports.singup = catchAsync(async(req, res, next) => {
  // This implementation allows user to identify as admins
  // const newUser = await User.create(req.body);

  // This implementation get only the required fields
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  })
  
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async(req, res, next) =>{
  const { email, password } = req.body;

  // 1) Check if email and password exist 
  if(!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct and explicitly selct password
  const user = await User.findOne({ email }).select('+password');

  console.log(user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if(
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if(!token) {
    return next(new AppError("You are not logged in! Please log in to get acces.", 401))
  }

  // 2) Verification token - if the token was modified or expired
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  
  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if(!freshUser) {
    return next(new AppError('The token belonging to this user does no longer exists.', 401));
  }

  // 4) Check if user changed password after the token was issued
  if(freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  };

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

// wrapper function that returns the middlewere function
exports.restrictTo =  (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'lead-guide']. role = 'user'
    if(!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403
      ));
    }

    next();
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    return next(new AppError('There is no user with email adress.', 404))
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
    email: user.email,
    subject: 'Your password reset token(valid for 10 min)',
    message
  });

  res.status(200).json({
    status: 'succes',
    message: 'Token sent to email'
  })
  } catch(err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
})

exports.resetPassword = catchAsync(async(req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // the token is the only thing we know about the user
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if(!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async(req, res, next) => {
  // we don't have to get the id from the JWT again. We can take it from the req.user from the protect middlewere
  const userID = res.user.id;

  console.log(userID);

  const user = await User.findById(userID).select('+password');
  const userPassword = user.password;

  console.log(1);
  // 2) Check if POSTed current password is correct(get password from body and compare it)
  const verifyPassword = req.body.currentPassword;

  if(!(await user.correctPassword(verifyPassword, userPassword))){
    next(new AppError('Your password is incorect! Write it again or sing up.'));
  }

  // 3) If so, update the password(update it using save)
  user.password = req.body.newPassword;
  await user.save({ validateBeforeSave: true });

  // 4) Log user in, send JWT (token = sign(id...))
  createSendToken(user, 200, res);
})