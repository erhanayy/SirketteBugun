import 'dotenv/config'; // Load env vars
import { db } from "@/lib/db";
import { users, tenants, chats, chatParticipants } from "@/lib/db/schema";

async function main() {
    console.log("--- Tenants ---");
    const allTenants = await db.select().from(tenants);
    console.log(allTenants);

    console.log("\n--- Users ---");
    const allUsers = await db.select().from(users);
    console.log(allUsers.map(u => ({ id: u.id, name: u.fullName, phone: u.phoneNumber })));

    console.log("\n--- Chats ---");
    const allChats = await db.select().from(chats);
    console.log(allChats);

    console.log("\n--- Chat Participants ---");
    const allParticipants = await db.select().from(chatParticipants);
    console.log(allParticipants);
}

main().catch(console.error).then(() => process.exit(0));
