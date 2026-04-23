const express = require('express');
const router = express.Router();

const pageController = require('../controllers/pageController');

router.get('/', pageController.homePage);
router.get('/about', pageController.aboutPage);
router.get('/dashboard', pageController.dashboardPage);
router.get('/users', pageController.usersPage);
router.get('/categoriess', pageController.categorisePage);
router.get('/subcategories', pageController.subcategorisePage);
router.get('/settings', pageController.settingsPage);
router.get('/product-attributes', pageController.getProductAttributes);
router.get('/coupon', pageController.couponForm);
router.get('/categorisee', pageController.categoriseForm);
router.get('/category_view', pageController.categoryview);
router.get('/banner-list', pageController.bannerPage);
router.get('/orders-add', pageController.showAddOrderForm);
router.post('/orders-create', pageController.createOrder);
router.get('/users_view', pageController.users_view);
router.get('/products', pageController.productsForm);
router.get('/transactions', pageController.transactionsForm);




module.exports = router;