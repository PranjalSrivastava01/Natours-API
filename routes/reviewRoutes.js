const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authenticationController');
const router = express.Router({
  mergeParams:true
});
router.use(authController.protect)
//POST 
router.route('/')
  .get(reviewController.getAllReviews)
  .post(authController.protect,
    reviewController.setTorUserIds,
    reviewController.createReview);

  router.route('/:id')
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);
  module.exports = router;
