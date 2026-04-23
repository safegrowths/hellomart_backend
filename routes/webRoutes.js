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
// ✅ Add Category

router.get('/coupon', pageController.couponForm);
router.get('/categorisee', pageController.categoriseForm);

// ✅ Get Categories (all / filter)
router.get('/category_view', pageController.categoryview);
router.get('/users_view', pageController.usersview);

// ✅ Toggle Status


// ✅ Delete Category

router.get('/banner-list', pageController.bannerPage);
router.get('/orders-add', pageController.showAddOrderForm);
router.post('/orders-create', pageController.createOrder);
router.get('/products', pageController.productsForm);
router.get('/transactions', pageController.transactionsForm);


// HTML pages

module.exports = router;