import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const demoEmail = process.env.DEMO_USER_EMAIL;
        const demoPassword = process.env.DEMO_USER_PASSWORD;

        if (!demoEmail || !demoPassword) {
            return NextResponse.json({ error: 'Authentication credentials not configured.' }, { status: 500 });
        }

        if (email === demoEmail && password === demoPassword) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
        }
    } catch (error) {
        console.error('Error in login API route:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
