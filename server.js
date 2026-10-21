const express = require('express');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 8080;

// Setup Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'rkg-wedding-planner-secret',
    resave: false,
    saveUninitialized: false
}));

// Setup Multer for Image Uploads (Stored locally in public/uploads)
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExt}`;
        cb(null, fileName);
    }
});
const upload = multer({ storage: storage });

// Local Gallery Data Store (Fast & reliable)
const GALLERY_FILE = path.join(__dirname, 'public', 'gallery-data.json');

function getGallery() {
    try {
        if (fs.existsSync(GALLERY_FILE)) {
            const data = JSON.parse(fs.readFileSync(GALLERY_FILE, 'utf8'));
            return Array.isArray(data) ? data : [];
        }
    } catch (e) {
        console.error("Error reading gallery-data.json:", e);
    }
    return [];
}

function saveGallery(items) {
    try {
        fs.writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2), 'utf8');
    } catch (e) {
        console.error("Error saving gallery-data.json:", e);
    }
}

// Admin Authentication Middleware
const requireAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Static content for landing page
const staticContent = {
    hero_tagline: "<span class=\"tagline-line\">RPG Catering is Cuddalore's trusted event planner,</span><span class=\"tagline-line\">delivering premium wedding catering and event services</span><span class=\"tagline-line\">across Tamil Nadu and Puducherry —</span><span class=\"tagline-line\">crafting unforgettable memories since 2006.</span>",
    about_title: "RPG CATERING AND EVENT MANAGEMENT",
    about_text: "<p>At <strong>RPG Catering and Event Management</strong> (RPG சமையல் கேட்டரிங் சர்வீஸ்) in Vannarapalayam, Cuddalore, we believe every celebration deserves extraordinary food and seamless hospitality. FSSAI Registered: <strong>24419407000193</strong>.</p><p>அனைத்து விதமான சுப நிகழ்ச்சிகளுக்கும் முதல் தரமான சைவ மற்றும் அசைவ உணவு வகைகள் தங்களின் விருப்பத்திற்கேற்ப குறித்த நேரத்தில் மிகச் சிறப்பாக செய்து தரப்படும். From intimate family gatherings to grand weddings, we ensure your guests enjoy every moment.</p><p class=\"about-studio__signature\">Taste That Creates Memories &bull; பந்தல் முதல் பந்தி வரை</p>"
};

const staticServices = [
    { id: 1, title: "Wedding Catering (சுப முகூர்த்த விருந்து)", image_url: "wedding_catering.png" },
    { id: 2, title: "Birthday Party Catering", image_url: "event_catering.png" },
    { id: 3, title: "Anniversary Celebrations", image_url: "hero.png" },
    { id: 4, title: "Special Occasions & Family Events", image_url: "decor.png" },
    { id: 5, title: "Buffet & Live Counters (Maska Bun Stall)", image_url: "buffet_catering.png" },
    { id: 6, title: "Professional Service Staff & Hospitality", image_url: "service_staff.png" }
];

const additionalServices = [
    { id: 1, title: "DJ & Sound Setup", image_url: "as_dj_sound.jpg" },
    { id: 2, title: "Stage & Mandap Decor", image_url: "as_mandap_decor.jpg" },
    { id: 3, title: "Lighting & Ambience", image_url: "as_lighting_ambience.jpg" },
    { id: 4, title: "Photography & Videography", image_url: "as_photography_video.jpg" },
    { id: 5, title: "Corporate Events & Exhibitions", image_url: "as_corporate_events.jpg" },
    { id: 6, title: "Cultural Programs & Orchestra", image_url: "as_cultural_orchestra.jpg" },
    { id: 7, title: "Live Streaming & Webcasting", image_url: "as_live_streaming.jpg" },
    { id: 8, title: "Live Refreshment Stalls", image_url: "as_refreshment_stalls.jpg" }
];

// --- PUBLIC ROUTES ---
app.get('/', (req, res) => {
    const gallery = getGallery();
    res.render('index', { content: staticContent, services: staticServices, additionalServices: additionalServices, gallery });
});

app.get('/gallery', (req, res) => {
    const gallery = getGallery();
    res.render('gallery', { gallery });
});

app.get('/food', (req, res) => {
    res.render('food');
});

app.get('/food-items', (req, res) => {
    try {
        const menuData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'menu-data.json'), 'utf8'));
        res.render('food-items', { categories: menuData.categories || [] });
    } catch (e) {
        console.error("Error reading menu-data.json:", e);
        res.render('food-items', { categories: [] });
    }
});

app.get('/download-marriage-food', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'marriage-food.pdf');
    res.download(filePath, 'RPG-Catering-Marriage-Food-Menu.pdf');
});

app.get('/download-master-menu', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'RPG-Catering-Master-Menu-Catalog.pdf');
    res.download(filePath, 'RPG-Catering-Master-Menu-Catalog.pdf');
});

app.get('/download-dinner-special', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'RPG-Special-Dinner-Menu-Collection.pdf');
    res.download(filePath, 'RPG-Special-Dinner-Menu-Collection.pdf');
});

app.get('/download-dinner-menus', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'Consolidated_8_Dinner_Menus.xlsx');
    res.download(filePath, 'Consolidated_8_Dinner_Menus.xlsx');
});

app.get('/download-consolidated-menu', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'Consolidated_Menu_Updated_Final.xlsx');
    res.download(filePath, 'Consolidated_Menu_Updated_Final.xlsx');
});

app.get('/download-menu', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'RPG-Catering-Services-Menu.pdf');
    res.download(filePath, 'RPG-Catering-Services-Official-Menu.pdf');
});

// --- ADMIN ROUTES ---
app.get('/login', (req, res) => {
    if (req.session.loggedIn) return res.redirect('/admin');
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Simple auth for Admin panel
    const validUsername = username && username.trim().toLowerCase() === 'admin';
    const validPassword = password === 'admin123' || (password && await bcrypt.compare(password, '$2b$10$m1qdpKSHBjRYiqCWu.bjAelGYxAzJqGRhv29pTDW7JpIRycX1quh.'));
    
    if (validUsername && validPassword) {
        req.session.loggedIn = true;
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/admin', requireAuth, (req, res) => {
    const gallery = getGallery();
    res.render('admin', { gallery });
});

// Admin: Add Gallery Images (Upload to Local Storage & Update Gallery JSON)
app.post('/admin/gallery', requireAuth, upload.array('images', 20), (req, res) => {
    if (!req.files || req.files.length === 0) return res.redirect('/admin');
    
    const category = req.body.category || 'Uncategorized';
    const gallery = getGallery();
    
    for (const file of req.files) {
        const imageUrl = '/uploads/' + file.filename;
        const newEntry = {
            id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
            image_url: imageUrl,
            category: category,
            created_at: new Date().toISOString()
        };
        gallery.unshift(newEntry);
    }
    
    saveGallery(gallery);
    res.redirect('/admin?success=1');
});

// Admin: Delete Gallery Image
app.post('/admin/gallery/delete/:id', requireAuth, (req, res) => {
    const gallery = getGallery();
    const itemIndex = gallery.findIndex(item => String(item.id) === String(req.params.id));
    
    if (itemIndex !== -1) {
        const item = gallery[itemIndex];
        // If image is inside /uploads/, remove it from disk
        if (item.image_url && item.image_url.startsWith('/uploads/')) {
            const localPath = path.join(__dirname, 'public', item.image_url);
            if (fs.existsSync(localPath)) {
                try { fs.unlinkSync(localPath); } catch (e) {}
            }
        }
        gallery.splice(itemIndex, 1);
        saveGallery(gallery);
    }
    
    res.redirect('/admin');
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
module.exports = app;
