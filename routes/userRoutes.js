const express = require('express');
const router = express.Router();
const authController=require('..//controllers/authenticationController')
const userController = require('../controllers/userController');


router.route('/signup').post(authController.signup)
router.route('/login').post(authController.login)
router.route('/forgotPassword').post(authController.forgotPassword)
router.route('/resetPassword/:token').patch(authController.resetPassword)
// since middleware execute in sequence after this all the routes will be executed

router.use(authController.protect);

router.patch(
  '/updateMyPassword',
  authController.updatePassword
);
router.patch(
  '/updateMe',
  userController.updateMe
);
router.delete(
  '/deleteMe',
  userController.deleteMe
);
router.route('/')
.get(userController.getUsers)
.post(userController.createUsers);

router.get(
  '/me',
  userController.getMe,
  userController.getUser
)
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser);

module.exports = router;
