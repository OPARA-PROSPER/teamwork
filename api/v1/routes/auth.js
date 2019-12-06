const express = require('express');

const router = express.Router();

// load middlewares
const adminAuth = require('../middlewares/adminAuth');
const checkToken = require('../middlewares/tokenCheck');

// load controllers
const UsersController = require('../controllers/UsersController');
const gifsController = require('../controllers/gifsContoller');
const articlesController = require('../controllers/articlesController');

router.get('/auth', adminAuth, UsersController.getUsers);
router.post('/auth/create-user', adminAuth, UsersController.createUSer);
router.post('/auth/signin', UsersController.signIn);

router.post('/articles', articlesController.postArticles);
router.patch('/articles/:id', checkToken, articlesController.patchArticle);
router.delete('/articles/:id', checkToken, articlesController.deleteArticle);
router.post('/articles/:id/comment', checkToken, articlesController.commentArticle);
router.get('/articles/:id', checkToken, articlesController.getArticleById);

router.get('/feed', checkToken, articlesController.getArticles);

router.post('/gifs', checkToken, gifsController.postGifs);
router.delete('/gifs/:id', checkToken, gifsController.deleteGifs);
router.post('/gifs/:id/comment', checkToken, gifsController.commentGifs);
router.get('/gifs/:id', checkToken, gifsController.getGifById);

module.exports = router;
