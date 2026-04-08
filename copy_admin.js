const { Pool } = require('pg');

const oldPool = new Pool({ connectionString: 'postgresql://postgres:***dB2026***@34.38.207.47:5432/dernekte-bugun' });
const newPool = new Pool({ connectionString: 'postgresql://postgres:***dB2026***@34.38.207.47:5432/sirkette-bugun' });

async function seed() {
    const res = await oldPool.query("SELECT * FROM users WHERE email = 'admin@dernektebugun.com'");
    if (res.rows.length === 0) {
        console.log("Eski veritabanında 'admin@dernektebugun.com' bulunamadı, script sonlandırıldı.");
        process.exit(1);
    }
    const u = res.rows[0];
    u.email = 'admin@db.com'; // Sizin istediğiniz yeni girişe atandı

    try {
        const keys = Object.keys(u).filter(k => u[k] !== undefined && u[k] !== null);
        const vals = keys.map(k => u[k]);
        const placeholders = keys.map((_, i) => '$' + (i + 1)).join(',');
        const cols = keys.map(k => `"${k}"`).join(',');
        const query = `INSERT INTO users (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

        await newPool.query(query, vals);
        console.log("Başarıyla 'admin@db.com' kullanıcısı kopyalandı!");
    } catch (err) {
        console.error("Kopyalama Hatası:", err);
    }
    process.exit(0);
}
seed();
