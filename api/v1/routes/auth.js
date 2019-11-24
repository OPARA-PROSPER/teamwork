const express = require('express');

const router = express.Router();

// load middlewares
const adminAuth = require('../middlewares/adminAuth');
const checkToken = require('../middlewares/tokenCheck');

// load controllers
const authUserController = require('../controllers/authUserController');
const gifsController = require('../controllers/gifsContoller');
const articlesController = require('../controllers/articlesController');

router.get('/auth', adminAuth, authUserController.getUsers);
router.post('/auth/create-user', adminAuth, authUserController.createUSer);
router.post('/auth/signin', authUserController.signIn);

router.post('/articles', articlesController.postArticles);
router.patch('/articles/:id', checkToken, articlesController.patchArticle);
router.delete('/articles/:id', checkToken, articlesController.deleteArticle);

router.post('/gifs', checkToken, gifsController.postGifs);
router.delete('/gifs/:id', checkToken, gifsController.deleteGifs);

module.exports = router;
