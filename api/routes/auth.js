const express = require('express');
const auth = require('../middlewares/auth');

const router = express.Router();
const AuthController = require('../controllers/authController');

router.post('/auth/create-user', auth, AuthController.createUSer);
router.post('/auth/signin', AuthController.signIn);

module.exports = router;
