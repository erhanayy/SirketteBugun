import 'dotenv/config';
import { db } from '../lib/db';
import { pushSubscriptions } from '../lib/db/schema';

async function run() {
    const res = await db.select().from(pushSubscriptions);
    console.log("All push subscriptions:", JSON.stringify(res, null, 2));
    process.exit(0);
}
run();
