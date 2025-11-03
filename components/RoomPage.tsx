import React from 'react';
import { Room } from '../types';
import VoiceMemo from '../components/VoiceMemo';

interface RoomPageProps {
    room: Room;
    onUpdateRoom: (roomId: string, updatedData: Partial<Room>) => void;
    onGoHome: () => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ room, onUpdateRoom, onGoHome }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
             <div className="w-full max-w-2xl mx-auto">
                <div className="mb-6">
                    <button onClick={onGoHome} className="text-purple-400 hover:text-purple-300">&larr; Back to Home</button>
                </div>
                <VoiceMemo
                    room={room}
                    onUpdate={(updatedData) => onUpdateRoom(room.id, updatedData)}
                />
            </div>
        </div>
    );
};

export default RoomPage;
