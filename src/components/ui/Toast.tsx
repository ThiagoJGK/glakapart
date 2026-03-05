'use client';
import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-forest' : 'bg-red-500';

    return (
        <div className={`fixed bottom-8 right-8 ${bgColor} text-white px-6 py-4 rounded shadow-lg z-50 flex items-center animate-fade-in-up`}>
            <div className="mr-3">
                {type === 'success' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </div>
            <span className="font-ui text-sm tracking-wide">{message}</span>
        </div>
    );
};






