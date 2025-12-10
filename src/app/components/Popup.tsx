"use client"

import React, { useState } from 'react'
import { Button, Input } from '.';
import { PopupProps } from './types';

const Popup = ({ handleClose, onGenerateVideo }: PopupProps) => {
    const [email, setEmail] = useState('');
    const [isLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setError('');
    }

    const handleSubmitEmail = () => {
        if (!email.trim()) {
            setError('Please enter a valid email address');
            return;
        }

        // Just close the popup and pass the email to the parent
        onGenerateVideo(email);
        handleClose();
    }

    return (
        <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white sm:px-6 px-4 py-10 shadow-lg max-w-lg w-full mx-4 rounded-xl flex flex-col gap-6 relative'>
                <button className='absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-4xl cursor-pointer' onClick={handleClose}>×</button>

                <div className='text-center space-y-2'>
                    <h1 className='text-xl font-poppins font-bold text-forest'>Your video will be sent to your email address</h1>
                </div>

                <div className="space-y-4">
                    <Input placeholder='Please enter here' value={email} onChange={handleChange} />

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <p className='text-xs text-slate text-center italic'>
                        This is kept totally private--we will never sell nor spam
                    </p>
                </div>

                <div className='flex justify-center'>
                    <Button
                        onClick={handleSubmitEmail}
                        text={isLoading ? 'Processing...' : 'Enter'}
                        disabled={isLoading || !email.trim()}
                    />
                </div>
            </div>
        </div>
    )
}

export default Popup;