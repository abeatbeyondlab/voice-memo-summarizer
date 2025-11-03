import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Simply return a success response
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in logout API route:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
