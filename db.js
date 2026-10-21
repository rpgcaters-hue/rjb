const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create SiteContent table
        db.run(`CREATE TABLE IF NOT EXISTS SiteContent (
            key TEXT PRIMARY KEY,
            value TEXT
        )`, (err) => {
            if (!err) {
                // Insert default content if empty
                db.get("SELECT COUNT(*) as count FROM SiteContent", (err, row) => {
                    if (row && row.count === 0) {
                        const defaultContent = [
                            ['hero_tagline', "<span class=\"tagline-line\">RPG Catering is Cuddalore's trusted event planner,</span><span class=\"tagline-line\">delivering premium wedding catering &amp; event services —</span><span class=\"tagline-line\">crafting unforgettable memories since 2006.</span>"],
                            ['about_title', "RPG CATERING AND EVENT MANAGEMENT"],
                            ['about_text', "<p>At <strong>RPG Catering and Event Management</strong> (RPG சமையல் கேட்டரிங் சர்வீஸ்) in Vannarapalayam, Cuddalore, we believe every celebration deserves extraordinary food and seamless hospitality. FSSAI Registered: <strong>24419407000193</strong>.</p><p>அனைத்து விதமான சுப நிகழ்ச்சிகளுக்கும் முதல் தரமான சைவ மற்றும் அசைவ உணவு வகைகள் தங்களின் விருப்பத்திற்கேற்ப குறித்த நேரத்தில் மிகச் சிறப்பாக செய்து தரப்படும். From intimate family gatherings to grand weddings, we ensure your guests enjoy every moment.</p><p class=\"about-studio__signature\">Taste That Creates Memories &bull; பந்தல் முதல் பந்தி வரை</p>"]
                        ];
                        const stmt = db.prepare("INSERT INTO SiteContent (key, value) VALUES (?, ?)");
                        defaultContent.forEach(item => stmt.run(item));
                        stmt.finalize();
                    }
                });
            }
        });

        // Create Services table
        db.run(`CREATE TABLE IF NOT EXISTS Services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            image_url TEXT
        )`, (err) => {
            if (!err) {
                db.get("SELECT COUNT(*) as count FROM Services", (err, row) => {
                    if (row && row.count === 0) {
                        const defaultServices = [
                            ["Wedding Catering", "wedding_catering.png"],
                            ["🎂 Birthday Party Catering", "event_catering.png"],
                            ["❤️ Anniversary Catering", "hero.png"],
                            ["🎉 Event Catering", "decor.png"],
                            ["🍽 Buffet & Live Counters", "buffet_catering.png"],
                            ["👨‍🍳 Professional Service Staff", "service_staff.png"]
                        ];
                        const stmt = db.prepare("INSERT INTO Services (title, image_url) VALUES (?, ?)");
                        defaultServices.forEach(item => stmt.run(item));
                        stmt.finalize();
                    }
                });
            }
        });

        // Create Gallery table
        db.run(`CREATE TABLE IF NOT EXISTS Gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_url TEXT
        )`, (err) => {
            if (!err) {
                db.get("SELECT COUNT(*) as count FROM Gallery", (err, row) => {
                    if (row && row.count === 0) {
                        const defaultGallery = [
                            ["hero.png"],
                            ["decor.png"],
                            ["catering.png"],
                            ["hero.png"],
                            ["wedding_catering.png"],
                            ["event_catering.png"]
                        ];
                        const stmt = db.prepare("INSERT INTO Gallery (image_url) VALUES (?)");
                        defaultGallery.forEach(item => stmt.run(item));
                        stmt.finalize();
                    }
                });
            }
        });
    }
});

module.exports = db;
