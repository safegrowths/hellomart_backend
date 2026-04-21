const db = require('../db');

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
exports.addCategory = async (req, res) => {
  try {
    const { title, image, status, type } = req.body;

    if (!title) {
      return res.json({ status: false, msg: "Title required" });
    }

    const sql = `
      INSERT INTO categorise (title, image, status, type, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    await db.query(sql, [
      title,
      image || '',
      status || 1,
      type || 1
    ]);

    res.json({
      status: true,
      msg: "Category added successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories= async (req, res) => {
  try {
    const { status, type } = req.query;

    let sql = `SELECT * FROM categorise WHERE 1`;
    let params = [];

    if (status !== undefined) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY id DESC`;

    const [rows] = await db.query(sql, params);

    res.json({
      status: true,
      data: rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.toggleCategory = async (req, res) => {
  try {
    const { id } = req.body;

    await db.query(`
      UPDATE categorise 
      SET status = IF(status = 1, 0, 1)
      WHERE id = ?
    `, [id]);

    res.json({
      status: true,
      msg: "Status updated"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;

    await db.query(`DELETE FROM categorise WHERE id = ?`, [id]);

    res.json({
      status: true,
      msg: "Deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.settingsPage = (req, res) => {
    res.render('settings', { 
        title: 'Settings',
        showNavigation: true,
        currentPage: 'settings'
    });
};