require('dotenv').config();
require('./config/db');

const express = require('express');
const app = express();

const PORT = process.env.PORT || 8001;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));

// Increase request size
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const webRoutes = require('./routes/webRoutes');
app.use('/', webRoutes);

const apIRoutes = require('./routes/api');
app.use('/api', apIRoutes);

app.get('/', (req, res) => {
    res.send("Server + Database Connected 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});