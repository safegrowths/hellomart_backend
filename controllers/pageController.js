const multer = require('multer');
const db = require('../db');
const {all_banner_list } = require('../models/admin');

// GET SUBCATEGORIES LIST
const all_subcategory_list = async (search, status, limit, offset) => {
    let sql = `
        SELECT sc.id, sc.title, sc.image, sc.categorise_id, sc.status,
               sc.created_at, c.title as category_name
        FROM sub_categorise sc
        LEFT JOIN categorise c ON sc.categorise_id = c.id
        WHERE sc.title LIKE ?
    `;

    let params = [`%${search}%`];

    if (status !== 'all') {
        sql += ` AND sc.status = ?`;
        params.push(status);
    }

    sql += ` ORDER BY sc.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(sql, params);
    return rows;
};
const subcategory_count = async (search, status) => {
    let sql = `SELECT COUNT(*) as total FROM sub_categorise WHERE title LIKE ?`;
    let params = [`%${search}%`];

    if (status !== 'all') {
        sql += ` AND status = ?`;
        params.push(status);
    }

    const [[{ total }]] = await db.query(sql, params);
    return total;
};

exports.subcategoryview = async (req, res) => {
    try {
        const search = req.query.search || "";
        const status = req.query.status || "all";
        let page = parseInt(req.query.page) || 1;

        if (page < 1) page = 1;

        const limit = 10;
        const offset = (page - 1) * limit;

        const subcategories = await all_subcategory_list(search, status, limit, offset);
        const total = await subcategory_count(search, status);

        const totalPages = Math.ceil(total / limit);

        // categories dropdown ke liye
        const [categories] = await db.query(`SELECT id, title FROM categorise WHERE status=1`);

        res.render('subcategorise', {
            title: 'Subcategory List',
            subcategories,
            categories,
            currentPage: page,
            totalPages,
            search,
            status,
            pageName: 'Subcategory'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading subcategories");
    }
};
exports.delete_subcategory = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(`DELETE FROM sub_categorise WHERE id=?`, [id]);

        res.json({ msg: "Deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Delete failed" });
    }
};

exports.toggle_status = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(`
            UPDATE sub_categorise 
            SET status = IF(status=1, 0, 1)
            WHERE id=?
        `, [id]);

        res.json({ msg: "Status updated" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Status update failed" });
    }
};

exports.update_subcategory = async (req, res) => {
    try {
        const { id, title, categorise_id, status, description } = req.body;

        const sql = `
            UPDATE sub_categorise 
            SET title=?, categorise_id=?, status=?, description=?, updated_at=NOW()
            WHERE id=?
        `;

        await db.query(sql, [
            title,
            categorise_id,
            status,
            description,
            id
        ]);

        res.json({ msg: "Updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Update failed" });
    }
};
exports.add_subcategory = async (req, res) => {
    try {
        const { title, categorise_id, status, description } = req.body;

        if (!title || !categorise_id) {
            return res.status(400).json({ msg: "Required fields missing" });
        }

        const sql = `
            INSERT INTO sub_categorise (title, categorise_id, status, description, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;

        await db.query(sql, [
            title,
            categorise_id,
            status || 1,
            description || ""
        ]);

        res.json({ msg: "Subcategory added successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error adding subcategory" });
    }
};
// COUNT

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



exports.settingsPage = (req, res) => {
    res.render('settings', { 
        title: 'Settings',
        showNavigation: true,
        currentPage: 'settings'
    });
};


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



exports.showAddOrderForm = (req, res) => {
  res.render('order', {   
    title: 'Add New Order',
    showNavigation: true,
    currentPage: 'order'
  });
};


exports.createOrder = (req, res) => {
  const { customer, orderId, amount, status, orderDate, notes } = req.body;
  // Here you would save to database, then redirect
  console.log('New order:', req.body);
  // Flash success message and redirect
  res.redirect('/orders');
};


exports.showListPage = (req, res) => {
  res.render('list', {
    title: 'Categories List',
    showNavigation: true,
    currentPage: 'list'
  });
};


const all_users_list = async (search, limit, offset) => {
    const sql = `
        SELECT id, name, image, mobile, email, created_at
        FROM users
        WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(sql, [
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        limit,
        offset
    ]);

    return rows;
};

exports.users_view = async (req, res) => {
    try {
        const search = req.query.search || "";
        let page = parseInt(req.query.page) || 1;
        if (isNaN(page) || page < 1) page = 1;

        const limit = 10;
        const offset = (page - 1) * limit;

        // ✅ Get users list from function
        const users = await all_users_list(search, limit, offset);

        // ✅ Count
        const [[countResult]] = await db.query(
            `SELECT COUNT(*) as total FROM users 
             WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ?`,
            [`%${search}%`, `%${search}%`, `%${search}%`]
        );

        const totalRecords = countResult.total;
        const totalPages = Math.ceil(totalRecords / limit);

        res.render('users', {
            users,
            currentPage: page,
            totalPages,
            search,
            limit,
            pageName: 'Users'
        });

    } catch (error) {
        console.error("Error in users_view:", error);
        res.status(500).send(error.message);
    }
};

const all_category_list = async (search, limit, offset) => {
    const sql = `
        SELECT id, title AS name, image, status, created_at, updated_at
        FROM categorise
        WHERE title LIKE ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [`%${search}%`, limit, offset]);
    return rows;
};

exports.categoryview = async (req, res) => {
    try {
        const search = req.query.search || "";
        let page = parseInt(req.query.page) || 1;
        if (isNaN(page) || page < 1) page = 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Get categories for current page
        const categories = await all_category_list(search, limit, offset);

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM categorise WHERE title LIKE ?`;
        const [[{ total }]] = await db.query(countQuery, [`%${search}%`]);
        const totalPages = Math.ceil(total / limit);

        // Render the view
        res.render('category/list', {
            title: 'Category List',
            categories: categories,
            currentPage: page,
            totalPages: totalPages,
            search: search,
            pageName: 'Category'
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Failed to load categories' });
    }
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