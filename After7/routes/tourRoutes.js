const express = require('express');
const tourController = require('./../controllers/tourController');
const fs = require('fs');


// Creating a Router with express object
const router = express.Router();

// This param middlewere
router.param('id', tourController.checkID);

// Create a checkBody middlewere
// Check if the body contians the name and price property
// If not, send back 400(bad request)
// Add it to the post handler stack



// Associating HTTP methods with routes
// This is an abstraction for: 
// router.get('/', tourController.getAllTours);
router
  .route('/') // Match the base path (e.g., '/api/v1/tours')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.postTour)


router
  .route('/:id') // Match the path with an ID parameter (e.g., '/api/v1/tours/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour)

module.exports = router;