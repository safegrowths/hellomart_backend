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

// ✅ Get Categories (all / filter)
router.get('/categories', pageController.getCategories);

// ✅ Toggle Status
router.post('/toggle-category', pageController.toggleCategory);

// ✅ Delete Category
router.post('/delete-category', pageController.deleteCategory);

module.exports = router;