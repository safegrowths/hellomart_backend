const express = require('express');
const router = express.Router();

const pageController = require('../controllers/pageController');

router.get('/', pageController.homePage);
router.get('/about', pageController.aboutPage);
router.get('/dashboard', pageController.dashboardPage);
router.get('/users', pageController.usersPage);
router.get('/users', pageController.usersPage);
router.get('/categories', pageController.categorisePage);
router.get('/subcategories', pageController.subcategorisePage);
router.get('/settings', pageController.settingsPage);
router.get('/product-attributes', pageController.getProductAttributes);

module.exports = router;