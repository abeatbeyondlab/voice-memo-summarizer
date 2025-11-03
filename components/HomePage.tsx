import React, { useState } from 'react';
import { Room } from '../types';
import { KeyIcon, CheckIcon } from '../components/icons';

interface HomePageProps {
    rooms: Room[];
    onCreateRoom: () => void;
    onOpenRoom: (roomId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ rooms, onCreateRoom, onOpenRoom }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-4xl mx-auto space-y-8">
                <header className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        Voice Memo Summarizer
                    </h1>
                    <p className="mt-2 text-gray-400">Record, transcribe, and summarize your voice memos.</p>
                </header>
                
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg space-y-4">
                     <button 
                        onClick={onCreateRoom}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                        Create New Room
                    </button>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg space-y-4">
                    <h2 className="text-xl font-semibold text-gray-200">Your Rooms</h2>
                    {rooms.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Open</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {rooms.map(room => (
                                        <tr key={room.id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{room.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(room.createdAt).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{room.status}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => onOpenRoom(room.id)} className="text-purple-400 hover:text-purple-300">Open</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-4">No rooms created yet. Create one above to get started!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
