import { db } from "./lib/db";
import { ibans } from "./lib/db/schema";

async function main() {
    const allIbans = await db.select().from(ibans);
    console.log("All IBANs:", allIbans);
    process.exit(0);
}

main().catch(console.error);
