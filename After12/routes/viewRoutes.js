const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://cdnjs.cloudflare.com;"
  );
  next();
});


router.get('/',authController.isLoggedIn, viewsController.getOverview)
router.get('/tour/:slug',authController.isLoggedIn, viewsController.getTour);
//The-Sea-Explorer
router.get('/login', authController.isLoggedIn,viewsController.getLoginForm)
router.get('/me', authController.protect, viewsController.getAccount)

// router.post('/submit-user-data', authController.protect, viewsController.updateUserData)

module.exports = router;