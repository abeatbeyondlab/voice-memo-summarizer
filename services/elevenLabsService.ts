export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');

    const response = await fetch('/api/elevenlabs', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to transcribe audio.');
    }

    const result = await response.json();
    return result.text || 'No transcription result found.';
};
