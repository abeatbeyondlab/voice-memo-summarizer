import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided.' }, { status: 400 });
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const model = 'gemini-flash-latest';

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [{ text: text }] },
            config: {
                systemInstruction: "sei un generatore di bullet point. tutte le volte che ti fornisco un testo generi una lista di bullet point a partire dal testo",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        bulletsPoints: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            }
                        }
                    },
                    required: ["bulletsPoints"]
                }
            }
        });

        if (!response || !response.text) {
            return NextResponse.json({ error: 'Received an empty response from Gemini API.' }, { status: 500 });
        }

        const jsonResponse = JSON.parse(response.text);
        return NextResponse.json({ bulletPoints: jsonResponse.bulletsPoints || [] });

    } catch (error) {
        console.error('Error in Gemini API route:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
