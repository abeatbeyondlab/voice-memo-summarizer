"use client";

import React, { useState, useEffect, useCallback } from 'react';
import HomePage from '../components/HomePage';
import RoomPage from '../components/RoomPage';
import LoginPage from './login/page';
import { Room } from '../types';

export default function Home() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentPage, setCurrentPage] = useState<'home' | 'room'>('home');
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [authorized, setAuthorized] = useState(false);

    // Load state from localStorage on initial render
    useEffect(() => {
        try {
            const storedRooms = localStorage.getItem('rooms');
            if (storedRooms) {
                setRooms(JSON.parse(storedRooms));
            }
        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
        }
    }, []);
    
    // Persist rooms to localStorage
    const updateAndPersistRooms = useCallback((updatedRooms: Room[]) => {
        setRooms(updatedRooms);
        localStorage.setItem('rooms', JSON.stringify(updatedRooms));
    }, []);

    const handleLogin = (email: string, password: string) => {
        // In a real app, you would validate credentials here
        // For this demo, we'll just check if both fields are non-empty
        if (email && password) {
            setAuthorized(true);
        }
    };

    const createNewRoom = () => {
        const newRoom: Room = {
            id: `room_${Date.now()}`,
            name: `Room ${rooms.length + 1}`,
            createdAt: new Date().toISOString(),
            status: 'idle',
            audioDataUrl: null,
            transcription: '',
            summaryPoints: [],
            error: null,
        };
        const updatedRooms = [...rooms, newRoom];
        updateAndPersistRooms(updatedRooms);
        setCurrentRoomId(newRoom.id);
        setCurrentPage('room');
    };

    const navigateToRoom = (roomId: string) => {
        setCurrentRoomId(roomId);
        setCurrentPage('room');
    };

    const navigateToHome = () => {
        setCurrentRoomId(null);
        setCurrentPage('home');
    };

    const updateRoom = (roomId: string, updatedData: Partial<Room>) => {
        const updatedRooms = rooms.map(room =>
            room.id === roomId ? { ...room, ...updatedData } : room
        );
        updateAndPersistRooms(updatedRooms);
    };

    const currentRoom = rooms.find(room => room.id === currentRoomId);

    if (!authorized) {
        return <LoginPage onLogin={handleLogin} />;
    }

    if (currentPage === 'room' && currentRoom) {
        return <RoomPage 
            room={currentRoom} 
            onUpdateRoom={updateRoom} 
            onGoHome={navigateToHome}
        />;
    }

    return (
        <HomePage
            rooms={rooms}
            onCreateRoom={createNewRoom}
            onOpenRoom={navigateToRoom}
        />
    );
}
