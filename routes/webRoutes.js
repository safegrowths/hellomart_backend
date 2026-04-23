const express = require('express');
const router = express.Router();

const pageController = require('../controllers/pageController');

router.get('/', pageController.homePage);
router.get('/about', pageController.aboutPage);
router.get('/dashboard', pageController.dashboardPage);
router.get('/users', pageController.usersPage);
router.get('/categoriess', pageController.categorisePage);
router.get('/subcategoriess', pageController.subcategorisePage);
router.get('/settings', pageController.settingsPage);
router.get('/product-attributes', pageController.getProductAttributes);
router.get('/coupon', pageController.couponForm);
router.get('/categorisee', pageController.categoryview);
router.post('/category_add', pageController.addCategory);


router.put('/category_edit/:id', pageController.updateCategory);   // or POST with _method
router.delete('/category_delete/:id', pageController.deleteCategory);
router.get('/banner-list', pageController.bannerPage);
router.get('/orders-add', pageController.showAddOrderForm);
router.post('/orders-create', pageController.createOrder);
router.get('/users_view', pageController.users_view);
router.get('/products', pageController.productsForm);
router.get('/transactions', pageController.transactionsForm);
router.get('/subcategories', pageController.subcategoryview);
router.post('/subcategories_add', pageController.add_subcategory);
router.post('/subcategories_update', pageController.update_subcategory);
router.get('/subcategories_delete/:id', pageController.delete_subcategory);
router.get('/subcategories_status/:id', pageController.toggle_status);




module.exports = router;