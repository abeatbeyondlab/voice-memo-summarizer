export const summarizeText = async (text: string): Promise<string[]> => {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to get summary from Gemini API.');
    }

    const result = await response.json();
    return result.bulletPoints || [];
};
