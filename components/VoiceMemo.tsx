import React, { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../services/elevenLabsService';
import { summarizeText } from '../services/geminiService';
import { MicIcon, StopIcon, ProcessingIcon, BulletPointsIcon, CheckIcon, ErrorIcon, DragHandleIcon } from './icons';
import { Room } from '../types';

interface VoiceMemoProps {
    room: Room;
    onUpdate: (updatedData: Partial<Room>) => void;
}

// Helper to convert a data URL to a Blob
const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return blob;
};

const VoiceMemo: React.FC<VoiceMemoProps> = ({ room, onUpdate }) => {
    const { status, audioDataUrl, transcription, summaryPoints, error } = room;
    const [localAudioBlob, setLocalAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const dragItem = useRef<number | null>(null);

    const updateRoom = (data: Partial<Room>) => {
        onUpdate(data);
    };
    
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setLocalAudioBlob(blob);
                
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    updateRoom({ audioDataUrl: base64data, status: 'recorded' });
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            updateRoom({ status: 'recording', error: null });
        } catch (err) {
            console.error('Error starting recording:', err);
            updateRoom({ error: 'Could not access microphone. Please check permissions.', status: 'error' });
        }
    }, [updateRoom]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const handleTranscribe = async () => {
        let blobToTranscribe = localAudioBlob;

        if (!blobToTranscribe && audioDataUrl) {
            try {
                blobToTranscribe = await dataUrlToBlob(audioDataUrl);
                setLocalAudioBlob(blobToTranscribe);
            } catch (err) {
                console.error("Could not convert audio data URL to blob", err);
                updateRoom({ error: 'Failed to load recorded audio.', status: 'error' });
                return;
            }
        }
        
        if (!blobToTranscribe) {
            updateRoom({ error: 'No audio recorded to transcribe.', status: 'error' });
            return;
        }

        updateRoom({ status: 'transcribing', error: null });
        try {
            const text = await transcribeAudio(blobToTranscribe);
            updateRoom({ transcription: text, status: 'transcribed' });
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'An unknown error occurred during transcription.';
            updateRoom({ error: message, status: 'error' });
        }
    };

    const handleSummarize = async () => {
        if (!transcription) {
            updateRoom({ error: 'No transcription available to summarize.', status: 'error' });
            return;
        }
        updateRoom({ status: 'summarizing', error: null });
        try {
            const bulletPoints = await summarizeText(transcription);
            updateRoom({ summaryPoints: bulletPoints, status: 'summarized' });
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'An unknown error occurred during summarization.';
            updateRoom({ error: message, status: 'error' });
        }
    };

    const handleDragStart = (position: number) => {
        dragItem.current = position;
    };

    const handleDrop = (position: number) => {
        if (dragItem.current === null) return;
        const newSummaryPoints = [...summaryPoints];
        const draggedItemContent = newSummaryPoints.splice(dragItem.current, 1)[0];
        newSummaryPoints.splice(position, 0, draggedItemContent);
        dragItem.current = null;
        updateRoom({ summaryPoints: newSummaryPoints });
    };

    const renderStatusPill = (text: string, icon: React.ReactNode) => (
        <div className="absolute top-4 right-4 bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-full flex items-center space-x-2">
            {icon}
            <span>{text}</span>
        </div>
    );
    
     const resetState = () => {
        updateRoom({
            status: 'idle',
            audioDataUrl: null,
            transcription: '',
            summaryPoints: [],
            error: null,
        });
        setLocalAudioBlob(null);
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
    };

    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-gray-200">{room.name}</h1>
            </header>

            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative flex items-start space-x-3">
                    <div className="pt-0.5"><ErrorIcon /></div>
                    <div>
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                </div>
            )}

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg relative min-h-[10rem] flex flex-col justify-center items-center space-y-4">
                {status === 'idle' && (
                    <button onClick={startRecording} className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105">
                        <MicIcon />
                        <span>Start Recording</span>
                    </button>
                )}

                {status === 'recording' && (
                    <>
                        {renderStatusPill('Recording...', <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>)}
                        <button onClick={stopRecording} className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105">
                            <StopIcon />
                            <span>Stop Recording</span>
                        </button>
                    </>
                )}

                {(status === 'recorded' || status === 'transcribing' || status === 'transcribed' || status === 'summarizing' || status === 'summarized') && audioDataUrl && (
                    <div className="w-full text-center space-y-4">
                        <h3 className="font-semibold text-lg text-gray-300">Your Recording</h3>
                        <audio src={audioDataUrl} controls className="w-full" />
                    </div>
                )}
            </div>

            {(status === 'recorded' || status === 'transcribing') && (
                <div className="flex justify-center">
                    <button onClick={handleTranscribe} disabled={status === 'transcribing'} className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-wait text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105">
                        {status === 'transcribing' ? <ProcessingIcon /> : <CheckIcon />}
                        <span>{status === 'transcribing' ? 'Transcribing...' : 'Transcribe'}</span>
                    </button>
                </div>
            )}

            {(status === 'transcribed' || status === 'summarizing' || status === 'summarized') && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg relative space-y-4">
                    {renderStatusPill('Transcription Complete', <CheckIcon />)}
                    <h3 className="font-semibold text-lg text-gray-300">Transcription (Editable)</h3>
                    <textarea
                        value={transcription}
                        onChange={(e) => updateRoom({ transcription: e.target.value })}
                        className="w-full h-40 bg-gray-900/50 p-4 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                        aria-label="Editable transcription text"
                    />
                    {status !== 'summarized' && (
                        <div className="flex justify-center pt-4">
                            <button onClick={handleSummarize} disabled={status === 'summarizing'} className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-wait text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105">
                                {status === 'summarizing' ? <ProcessingIcon /> : <BulletPointsIcon />}
                                <span>{status === 'summarizing' ? 'Summarizing...' : 'Summarize to Bullet Points'}</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {status === 'summarized' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg relative space-y-4">
                    {renderStatusPill('Summary Complete', <CheckIcon />)}
                    <h3 className="font-semibold text-lg text-gray-300">Summary (Drag to reorder)</h3>
                    <div className="text-gray-300 bg-gray-900/50 p-4 rounded-md">
                        {summaryPoints.length > 0 ? (
                            <ul className="space-y-2">
                                {summaryPoints.map((point, index) => (
                                    <li key={index} draggable onDragStart={() => handleDragStart(index)} onDrop={() => handleDrop(index)} onDragOver={(e) => e.preventDefault()} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-lg">
                                        <DragHandleIcon />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400">No summary was generated from the text.</p>
                        )}
                    </div>
                </div>
            )}
            
            {status !== 'idle' && status !== 'recording' && (
                <div className="text-center">
                    <button onClick={resetState} className="text-gray-400 hover:text-white transition-colors duration-200">
                        Start Over in This Room
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceMemo;
