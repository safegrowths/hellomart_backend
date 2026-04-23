const multer = require('multer');
const db = require('../db');
const {all_banner_list } = require('../models/admin');


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

exports.usersPage = async (req, res) => {
    try {
        const db = req.app.get('db'); // assumes you set app.set('db', pool) in app.js

        // ── 1. All users ──────────────────────────────────────────────────────
        const [users] = await db.promise().query(`
            SELECT id, name, image, mobile, amount, email,
                   business_name, upload_shop_logo, created_at
            FROM users
            ORDER BY created_at DESC
        `);

        // ── 2. All orders ─────────────────────────────────────────────────────
        const [orders] = await db.promise().query(`
            SELECT id, uniqueorder_id, user_id, bag_mrp, bag_discount,
                   coupon_discount, shipping_fee, grand_total,
                   status, payment_type, gateway_id, created_at
            FROM orders
            ORDER BY created_at DESC
        `);

        // ── 3. All order items ────────────────────────────────────────────────
        const [orderItems] = await db.promise().query(`
            SELECT id, order_id, uniqueorder_id, product_id,
                   quantity, price, mrp, status, product_attribute_id
            FROM order_items
        `);

        // ── 4. Aggregate: map orders → user, items → order ───────────────────

        // Map order_id → items[]
        const itemsByOrder = {};
        orderItems.forEach(item => {
            if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
            itemsByOrder[item.order_id].push(item);
        });

        // Map user_id → orders[]  (with items embedded)
        const ordersByUser = {};
        orders.forEach(order => {
            order.items = itemsByOrder[order.id] || [];
            if (!ordersByUser[order.user_id]) ordersByUser[order.user_id] = [];
            ordersByUser[order.user_id].push(order);
        });

        // Attach aggregated data to each user
        const enrichedUsers = users.map(user => {
            const userOrders = ordersByUser[user.id] || [];
            const totalOrdersCount  = userOrders.length;
            const totalSpent        = userOrders.reduce((s, o) => s + parseFloat(o.grand_total || 0), 0);
            const totalItemsOrdered = userOrders.reduce((s, o) => s + o.items.length, 0);

            return {
                ...user,
                orders: userOrders,
                totalOrdersCount,
                totalSpent: totalSpent.toFixed(2),
                totalItemsOrdered,
                // status flag: treat amount==0 && no orders as inactive (adjust as needed)
                isActive: true
            };
        });

        // ── 5. Dashboard summary stats ────────────────────────────────────────
        const stats = {
            totalUsers:   users.length,
            activeUsers:  enrichedUsers.filter(u => u.isActive).length,
            blockedUsers: enrichedUsers.filter(u => !u.isActive).length,
            totalRevenue: orders.reduce((s, o) => s + parseFloat(o.grand_total || 0), 0).toFixed(2),
            totalOrders:  orders.length
        };

        res.render('users', {
            title: 'Users',
            showNavigation: true,
            currentPage: 'users',
            users: enrichedUsers,
            stats,
            orders   // for chart / recent orders section
        });

    } catch (err) {
        console.error('usersPage error:', err);
        res.status(500).send('Database error: ' + err.message);
    }
};


// ── AJAX: toggle block/unblock (optional endpoint) ────────────────────────────
exports.toggleUserStatus = async (req, res) => {
    try {
        const db  = req.app.get('db');
        const { userId, status } = req.body; // status: 'active' | 'blocked'
        // Add a `status` column to your users table if not present:
        // ALTER TABLE users ADD COLUMN status ENUM('active','blocked') DEFAULT 'active';
        await db.promise().query(
            `UPDATE users SET status = ? WHERE id = ?`,
            [status, userId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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

        const category_list = await all_category_list(search, limit, offset);

        const countQuery = `SELECT COUNT(*) as total FROM categorise WHERE title LIKE ?`;
        const [[{ total }]] = await db.query(countQuery, [`%${search}%`]);
        const totalPages = Math.ceil(total / limit);

        // Pass a clean object – use 'categories' as array name
        res.render('category/list.ejs', {
            categories: category_list,
            currentPage: page,
            totalPages,
            search,
            pageName: 'Category'
        });
    } catch (error) {
        console.error(error);
        // Render an error page instead of JSON (because this is an HTML request)
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