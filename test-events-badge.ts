import 'dotenv/config';
import { getUnreadEventCount } from './lib/actions/event';

async function test() {
    try {
        console.log("Testing getUnreadEventCount...");
        const count = await getUnreadEventCount();
        console.log("Unread count:", count);
    } catch (e) {
        console.error("Action error:", e);
    } finally {
        process.exit();
    }
}
test();
