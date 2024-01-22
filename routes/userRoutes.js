const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.get('/profile', UserController.profile);

module.exports = router;
