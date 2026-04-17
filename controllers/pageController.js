exports.homePage = (req, res) => {
    res.render('login');
};

exports.aboutPage = (req, res) => {
    res.render('about', {
        title: "About Page"
    });
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