import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioBlob = formData.get('file') as Blob;

        if (!audioBlob) {
            return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 });
        }

        const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
        if (!elevenLabsApiKey) {
            return NextResponse.json({ error: 'ElevenLabs API key is not configured.' }, { status: 500 });
        }

        const elevenLabsUrl = 'https://api.elevenlabs.io/v1/speech-to-text';
        const elevenLabsHeaders = {
            'xi-api-key': elevenLabsApiKey,
        };

        const elevenLabsFormData = new FormData();
        elevenLabsFormData.append('file', audioBlob, 'audio.webm');
        elevenLabsFormData.append('model_id', 'scribe_v1');

        const elevenLabsResponse = await fetch(elevenLabsUrl, {
            method: 'POST',
            headers: elevenLabsHeaders,
            body: elevenLabsFormData,
        });

        if (!elevenLabsResponse.ok) {
            const errorBody = await elevenLabsResponse.json();
            console.error('ElevenLabs API Error:', errorBody);
            return NextResponse.json({ error: 'Failed to transcribe audio.' }, { status: elevenLabsResponse.status });
        }

        const result = await elevenLabsResponse.json();
        return NextResponse.json({ text: result.text });

    } catch (error) {
        console.error('Error in ElevenLabs API route:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
