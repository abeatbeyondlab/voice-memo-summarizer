"use client";

import React, { useState } from 'react';

interface LoginPageProps {
    onLogin: (email: string, password: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        
        // Send credentials to the API
        const formData = new FormData(e.currentTarget);
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            body: formData,
        });
        
        const data = await response.json();
        
        if (data.success) {
            onLogin(email, password);
        } else {
            setError(data.error || 'An unexpected error occurred.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md mx-auto space-y-8">
                <header className="text-center">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        Voice Memo Summarizer
                    </h1>
                    <p className="mt-2 text-gray-400">Demo Login</p>
                </header>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-900/50 p-3 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900/50 p-3 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                                <strong className="font-bold">Error:</strong>
                                <span className="block sm:inline ml-2">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
