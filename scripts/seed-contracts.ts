import "dotenv/config";
import { db } from "../lib/db/index";
import { contracts } from "../lib/db/schema";

async function main() {
    console.log("Seeding contracts...");
    console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is missing!");
        process.exit(1);
    }

    const initialContracts = [
        {
            type: 'KVKK' as const,
            version: '1.0',
            title: 'Kişisel Verilerin Korunması Aydınlatma Metni',
            content: `
<h1>Kişisel Verilerin Korunması</h1>
<p>Bu metin, DernekteBugün uygulaması kapsamında kişisel verilerinizin nasıl işlendiğini açıklar...</p>
<p><strong>1. Veri Sorumlusu:</strong> Şirket Yönetimi...</p>
<p><strong>2. İşlenen Veriler:</strong> Ad, soyad, telefon, e-posta...</p>
            `,
            isActive: true,
        },
        {
            type: 'USER_AGREEMENT' as const,
            version: '1.0',
            title: 'Kullanıcı Sözleşmesi',
            content: `
<h1>Kullanıcı Sözleşmesi</h1>
<p>Lütfen uygulamayı kullanmadan önce bu sözleşmeyi dikkatlice okuyunuz.</p>
<p><strong>1. Taraflar:</strong>...</p>
<p><strong>2. Kullanım Koşulları:</strong>...</p>
            `,
            isActive: true,
        },
        {
            type: 'ASSOCIATION_AGREEMENT' as const,
            version: '1.0',
            title: 'Şirket Tüzüğü ve Üyelik Şartları',
            content: `
<h1>Şirket Tüzüğü</h1>
<p>Derneğimizin tüzüğüne ve üyelik şartlarına uyacağınızı taahhüt edersiniz.</p>
<p><strong>Madde 1:</strong>...</p>
            `,
            isActive: true,
        },
    ];

    for (const contract of initialContracts) {
        await db.insert(contracts).values(contract);
        console.log(`Inserted contract: ${contract.title}`);
    }

    console.log("Seeding completed.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
