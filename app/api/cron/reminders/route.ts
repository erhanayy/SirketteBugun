import { NextResponse } from 'next/server';
import { runRemindersCron } from '@/lib/actions/scheduler';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'fallback_secret';

        // Basic security check
        if (authHeader !== `Bearer ${cronSecret}` && request.headers.get('x-cron-secret') !== cronSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const res = await runRemindersCron();

        if (res.success) {
            return NextResponse.json({ success: true, message: res.message });
        } else {
            return NextResponse.json({ success: false, error: res.message }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Cron API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
