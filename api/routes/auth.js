const express = require('express');
const auth = require('../middlewares/auth');

const router = express.Router();
const AuthController = require('../controllers/authController');

router.get('/auth', auth, AuthController.getUsers);
router.post('/auth/create-user', AuthController.createUSer);
router.post('/auth/signin', AuthController.signIn);

module.exports = router;
