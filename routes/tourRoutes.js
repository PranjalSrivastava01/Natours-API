const tourController = require('../controllers/tourController');
const express = require('express');
const authController = require('../controllers/authenticationController');
const router = express.Router();
// const reviewController=require('../controllers/reviewController')
// router.param('id', tourController.checkID);
const reviewRouter = require('../routes/reviewRoutes');
router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(authController.protect,
  authController.restrictTo('admin', 'lead-guide','guide'),
  tourController.getMonthlyPlan
  );

  router
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getTours);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.createTour);
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );
module.exports = router;

// POST/tour/234567/reviews//
// GET / tour/234567/reviews
//GET /tour/23456787654/reviews/34567643

// router
// .route('/:tourId/reviews')
// .post(
//   authController.protect,
//   reviewController.createReview
// );
