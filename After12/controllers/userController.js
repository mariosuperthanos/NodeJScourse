const { use } = require('../routes/tourRoutes');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   // a definiton of how we want to store our file
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })

// const multerFilter = (req, file, cb) => {
//   if(file.mimetype.startsWith('image')) {
//     cb(null, true)
//   } else {
//     cb(new AppError('Not an image! Please upload only images', 400), false)
//   }
// }

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter
// });

// exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields)  => { 
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)){
      newObj[el] = obj[el];
    }
  })
  
  return newObj;
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);

exports.updateMe = catchAsync(async(req, res, next) => {
  // 1) Create error if user POSTs password data
  if(req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates.Please use /updateMyPassword', 400))
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filterBody = filterObj(req.body, 'name', 'email');
  if(req.file) filterBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new:true,
    runValidators:true
  });

  res.status(200).json({
    status: 'succes',
    data: {
      updatedUser
    }
  });
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  // update the active field
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'succes',
    data: null
  })
})

exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Please use /singup instead!'
  })
}

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);