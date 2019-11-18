const express = require('express');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();
const AuthController = require('../controllers/authController');

router.get('/auth', adminAuth, AuthController.getUsers);
router.post('/auth/create-user', adminAuth, AuthController.createUSer);
router.post('/auth/signin', AuthController.signIn);
router.post('/articles', AuthController.postArticles);
router.patch('/articles/:id', AuthController.patchArticle);

module.exports = router;
