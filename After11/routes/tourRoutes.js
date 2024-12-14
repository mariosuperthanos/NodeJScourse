const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');


const fs = require('fs');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
// router.use()

// Creating a Router with express object

// This param middlewere
// router.param('id', tourController.checkID);

// Create a checkBody middlewere
// Check if the body contians the name and price property
// If not, send back 400(bad request)
// Add it to the post handler stack



// Associating HTTP methods with routes

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMothlyPlan
);

// This is an abstraction for: 
// router.get('/', tourController.getAllTours);
router
  .route('/') // Match the base path (e.g., '/api/v1/tours')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/tours-within/:distance/center/:latlng/:unit')
  .get(tourController.getToursWithin);
// /tours-distance/233/center/-40,45/unit/mi

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistance)

router
  .route('/:id') // Match the path with an ID parameter (e.g., '/api/v1/tours/:id')
  .get(tourController.getTourById)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );


module.exports = router;