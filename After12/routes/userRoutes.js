const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/singup', authController.singup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// this will protect all routes that comes after this endpoint
router.use(authController.protect);

router.patch('/updatePassword', 
  authController.updatePassword
);

router.get(
  '/me',
  userController.getMe,
  userController.getUser
)

router.patch('/updateMe',
  userController.uploadUserPhoto,
  userController.updateMe
);

router.delete('/deleteMe',
  userController.deleteMe
); 

router.use(authController.restrictTo('admin')); 

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router;