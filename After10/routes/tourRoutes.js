const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const fs = require('fs');


// Creating a Router with express object
const router = express.Router();

// This param middlewere
// router.param('id', tourController.checkID);

// Create a checkBody middlewere
// Check if the body contians the name and price property
// If not, send back 400(bad request)
// Add it to the post handler stack



// Associating HTTP methods with routes

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly/:year').get(tourController.getMothlyPlan);

// This is an abstraction for: 
// router.get('/', tourController.getAllTours);
router
  .route('/') // Match the base path (e.g., '/api/v1/tours')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour)


router
  .route('/:id') // Match the path with an ID parameter (e.g., '/api/v1/tours/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;