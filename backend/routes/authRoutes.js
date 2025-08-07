const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
// Password reset route can be added later
// router.post('/forgot-password', forgotPassword);

module.exports = router;