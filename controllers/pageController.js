const db = require('../db');
const {all_banner_list } = require('../models/admin');
const multer = require('multer');

exports.homePage = (req, res) => {
    res.render('login');
};

exports.aboutPage = (req, res) => {
    res.render('about', {
        title: "About Page"
    });
};

exports.getProductAttributes = async (req, res) => {
    try {
        // Ensure database connection exists
        if (!db || typeof db.query !== 'function') {
            throw new Error('Database connection not available');
        }

        // Fetch all products with non‑null productattribute
        const [rows] = await db.query(`
            SELECT id, sub_category_id, category_id, vendor_name, vendor_id, 
                   image, created_at, updated_at, nutrientdesc, foodtype, 
                   productattribute 
            FROM products 
            WHERE productattribute IS NOT NULL AND productattribute != ''
        `);

        // Parse JSON for each product
        const productsWithAttributes = rows.map(product => {
            let attributes = [];
            try {
                const parsed = JSON.parse(product.productattribute);
                if (Array.isArray(parsed)) {
                    attributes = parsed;
                } else if (parsed && typeof parsed === 'object') {
                    // If it's a single object, wrap in array
                    attributes = [parsed];
                }
            } catch (e) {
                // Invalid JSON – keep empty array
                console.warn(`Invalid productattribute for product ${product.id}:`, e.message);
            }
            return { ...product, attributes };
        });

        res.render('products', {
            title: 'Product Attributes',
            showNavigation: true,
            currentPage: 'products',
            products: productsWithAttributes
        });
    } catch (error) {
        console.error('Error in getProductAttributes:', error);
        // Generic error message – do not leak internal details
        res.status(500).send(`Unable to load product attributes. Please try again later. '${error}'`);
    }
};

exports.dashboardPage = (req, res) => {
    res.render('dashboard', { 
        title: 'Dashboard',
        showNavigation: true,
        currentPage: 'dashboard'
    });
};

exports.usersPage = (req, res) => {
    res.render('users', { 
        title: 'Users',
        showNavigation: true,
        currentPage: 'users'
    });
};

exports.categorisePage = (req, res) => {
    res.render('categorise', { 
        title: 'Categorise',
        showNavigation: true,
        currentPage: 'categorise'
    });
};

exports.subcategorisePage = (req, res) => {
    res.render('subcategorise', { 
        title: 'Subcategorise',
        showNavigation: true,
        currentPage: 'subcategorise'
    });
};
// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/categories/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage }).single('image');

// Helper function to run queries
const runQuery = (sql, params) => db.promise().execute(sql, params);

// 1. List categories (GET)
exports.categoryPage = async (req, res) => {
    try {
        const search = req.query.search || "";
        let page = parseInt(req.query.page) || 1;
        let limit = 10;
        let offset = (page - 1) * limit;

        let whereClause = "";
        let queryParams = [];
        if (search) {
            whereClause = "WHERE title LIKE ?";
            queryParams.push(`%${search}%`);
        }

        // Get total count
        const [countResult] = await runQuery(`SELECT COUNT(*) as total FROM categorise ${whereClause}`, queryParams);
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);

        // Get paginated data
        const sql = `SELECT id, title, image, status, type, created_at, updated_at FROM categorise ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
        const [rows] = await runQuery(sql, [...queryParams, limit, offset]);

        res.render('category/list', {
            data: rows,
            currentPage: page,
            totalPages,
            search,
            pageName: 'Category'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// 2. Get single category (for edit modal)
exports.getCategoryById = async (req, res) => {
    try {
        const id = req.params.id;
        const [rows] = await runQuery('SELECT id, title, image, type, status FROM categorise WHERE id = ?', [id]);
        if (rows.length) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.json({ success: false, message: 'Category not found' });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 3. Add category (POST)
exports.addCategory = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.json({ success: false, message: err.message });
        try {
            const { title, type, status } = req.body;
            if (!title) return res.json({ success: false, message: 'Title is required' });
            let image = null;
            if (req.file) image = '/uploads/categories/' + req.file.filename;

            await runQuery(
                'INSERT INTO categorise (title, image, type, status, created_at) VALUES (?, ?, ?, ?, NOW())',
                [title, image, type, status]
            );
            res.json({ success: true, message: 'Category added successfully' });
        } catch (error) {
            res.json({ success: false, message: error.message });
        }
    });
};

// 4. Update category (POST)
exports.updateCategory = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.json({ success: false, message: err.message });
        try {
            const { id, title, type, status, existing_image } = req.body;
            if (!id || !title) return res.json({ success: false, message: 'Missing data' });

            let image = existing_image;
            if (req.file) image = '/uploads/categories/' + req.file.filename;

            await runQuery(
                'UPDATE categorise SET title = ?, image = ?, type = ?, status = ?, updated_at = NOW() WHERE id = ?',
                [title, image, type, status, id]
            );
            res.json({ success: true, message: 'Category updated' });
        } catch (error) {
            res.json({ success: false, message: error.message });
        }
    });
};

// 5. Delete category (POST)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.json({ success: false, message: 'ID required' });
        await runQuery('DELETE FROM categorise WHERE id = ?', [id]);
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 6. Toggle status (POST)
exports.toggleStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) return res.json({ success: false, message: 'Missing data' });
        await runQuery('UPDATE categorise SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

exports.settingsPage = (req, res) => {
    res.render('settings', { 
        title: 'Settings',
        showNavigation: true,
        currentPage: 'settings'
    });
};

// Show Add Category form (HTML)
exports.showAddForm = (req, res) => {
  res.render('category_add', {
    title: 'Add Category',
    showNavigation: true,
    currentPage: 'category_add'
  });
};

exports.productsForm = (req, res) => {
  res.render('products', {
    title: 'products',
    showNavigation: true,
    currentPage: 'products'
  });
};

exports.transactionsForm = (req, res) => {
  res.render('transactions', {
    title: 'transactions',
    showNavigation: true,
    currentPage: 'transactions'
  });
};

exports.couponForm = (req, res) => {
  res.render('coupon', {
    title: 'coupon',
    showNavigation: true,
    currentPage: 'coupon'
  });
};
exports.categoriseForm = (req, res) => {
  res.render('categorise', {
    title: 'categorise',
    showNavigation: true,
    currentPage: 'categorise'
  });
};


// Add Order Form (GET)
exports.showAddOrderForm = (req, res) => {
  res.render('order', {   // or 'orders/add' depending on your view path
    title: 'Add New Order',
    showNavigation: true,
    currentPage: 'order'
  });
};

// Process New Order (POST) – example stub
exports.createOrder = (req, res) => {
  const { customer, orderId, amount, status, orderDate, notes } = req.body;
  // Here you would save to database, then redirect
  console.log('New order:', req.body);
  // Flash success message and redirect
  res.redirect('/orders');
};

// Show List Categories page (HTML)
exports.showListPage = (req, res) => {
  res.render('list', {
    title: 'Categories List',
    showNavigation: true,
    currentPage: 'list'
  });
};

exports.bannerPage = async (req, res) => {
    try {
        const search = req.query.search || "";
        let page = parseInt(req.query.page) || 1;
        let limit = 10; // records per page
        let offset = (page - 1) * limit;
        
        category_list = await all_banner_list(search,limit,offset);
        console.log(`category_list`,category_list)
        
        const [[countResult]] = await db.query(
            "SELECT COUNT(*) AS total FROM banner WHERE name LIKE ?",
            [`%${search}%`]
        );
        const totalRecords = countResult.total;
        const totalPages = Math.ceil(totalRecords / limit);
        
        data={
            data:category_list,
            currentPage: page,
            totalPages,
            search,
            pageName:'Banners'
        }
        res.render('banner/list.ejs',data);
        return;
    } catch (error) {
        console.error("Error sending SMS:", error);
        return res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
    }
};