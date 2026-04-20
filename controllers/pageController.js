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
        attributes = JSON.parse(product.productattribute);
        // Ensure it's always an array
        if (!Array.isArray(attributes)) attributes = [];
      } catch(e) {
        attributes = [];
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
    console.error(error);
    res.status(500).send('Server Error');
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