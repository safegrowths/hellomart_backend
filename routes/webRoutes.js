const express = require('express');
const router = express.Router();

const pageController = require('../controllers/pageController');

router.get('/', pageController.homePage);
router.get('/about', pageController.aboutPage);
router.get('/dashboard', pageController.dashboardPage);
router.get('/users', pageController.usersPage);
router.get('/users', pageController.usersPage);
router.get('/categoriess', pageController.categorisePage);
router.get('/subcategories', pageController.subcategorisePage);
router.get('/settings', pageController.settingsPage);
router.get('/product-attributes', pageController.getProductAttributes);
// ✅ Add Category
router.post('/add-category', pageController.addCategory);
router.get('/coupon', pageController.couponForm);
router.get('/categorisee', pageController.categoriseForm);

// ✅ Get Categories (all / filter)
router.get('/category_view', pageController.categoryPage);
router.get('/category_get/:id', pageController.getCategoryById);
router.post('/category_add', pageController.addCategory);
router.post('/category_update', pageController.updateCategory);
router.post('/category_delete', pageController.deleteCategory);
router.post('/category_toggle-status', pageController.toggleStatus);

// ✅ Toggle Status
router.post('/toggle-category', pageController.toggleCategory);

// ✅ Delete Category
router.post('/delete-category', pageController.deleteCategory);
router.get('/banner-list', pageController.bannerPage);
router.get('/orders-add', pageController.showAddOrderForm);
router.post('/orders-create', pageController.createOrder);
router.get('/products', pageController.productsForm);
router.get('/transactions', pageController.transactionsForm);


// HTML pages

module.exports = router;