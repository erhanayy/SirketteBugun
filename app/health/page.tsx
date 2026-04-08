import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function HealthPage() {
    const t0 = performance.now();
    let dbStatus = "Unknown";
    let userCount = 0;
    let connTime = 0;
    let dataTime = 0;
    let errorMsg = null;

    try {
        // 1. Test basic connectivity
        const checkStart = performance.now();
        await db.execute(sql`SELECT 1`);
        connTime = performance.now() - checkStart;

        // 2. Fetch basic user count to test schema/mapping
        const dataStart = performance.now();
        const result = await db.select({ id: users.id }).from(users).limit(10);
        dataTime = performance.now() - dataStart;

        userCount = result.length;
        dbStatus = `Bağlantı Başarılı.`;
    } catch (err: any) {
        dbStatus = "Hata";
        errorMsg = err.message || JSON.stringify(err);
    }

    const t1 = performance.now();
    const totalTime = t1 - t0;

    return (
        <div style={{ padding: '50px', fontSize: '20px', fontFamily: 'sans-serif' }}>
            <h1>Mekanik Test & DB Bağlantı Sayfası</h1>
            <ul style={{ lineHeight: '1.8' }}>
                <li><strong>Sayfa Render Süresi (Toplam):</strong> {totalTime.toFixed(2)} ms</li>
                <li><strong>Veritabanı Durumu:</strong> {dbStatus}</li>
                <li><strong>Bağlantı Testi (SELECT 1):</strong> {connTime.toFixed(2)} ms</li>
                <li><strong>Veri Çekme Testi (LIMIT 10):</strong> {dataTime.toFixed(2)} ms</li>
                <li><strong>Örnek Kullanıcı Sayısı (Max 10):</strong> {userCount}</li>
            </ul>

            {errorMsg && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
                    <strong>Veritabanı Hatası Detayı:</strong> <br />
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{errorMsg}</pre>
                </div>
            )}
        </div>
    );
}
