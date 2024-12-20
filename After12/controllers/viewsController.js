const Review = require('../models/reviewModel');
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async(req, res) =>{
  // 1) Get tour data from collection
  const tours = await Tour.find();
  
  // 2) Build template

  // 3) Render the template using tour data form 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async(req, res, next) => {
  const tour = await Tour.find({ slug: req.params.slug }).populate('reviews', 'review rating user');
  console.log(tour[0]);

  if(!tour[0]) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    tour: tour[0],
    title: `${tour[0].name} Tour`
  })
});

exports.getLoginForm = catchAsync(async(req, res) =>{
  res.status(200).render('login', {
    title: 'Log into your account'
  })
})

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  })
}

exports.updateUserData = catchAsync(async(req, res, next) =>{
  console.log('Update: ', req.body);
  console.log('users data', )
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    name: req.body.name,
    email: req.body.email
  },
  {
    new: true,
    runValidators: true
  }
  )
  console.log('fafasf ', updatedUser);

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  })
  
})