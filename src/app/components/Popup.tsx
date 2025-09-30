"use client"

import React, { useState } from 'react'
import { Button, Input } from '.';
import { PopupProps } from './types';

const Popup = ({handleClose, onGenerateVideo}: PopupProps) => {
    const [email, setEmail] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setError('');
    }

    const handleRegister = () => {
        setShowEmailInput(true);
    }

    const handleSubmitEmail = () => {
        if (!email.trim()) {
            setError('Please enter a valid email address');
            return;
        }

        // Just close the popup and pass the email to the parent
        // Don't start video generation yet
        onGenerateVideo(email);
        handleClose();
    }

    const handleCancel = () => {
        // Just close the popup without email
        // Don't start video generation yet
        onGenerateVideo();
        handleClose();
    }

    return (
        <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white sm:px-6 px-2 py-10 shadow-lg max-w-lg w-full mx-4 rounded-xl flex flex-col gap-4 relative'>
                <button className='absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-4xl cursor-pointer' onClick={handleClose}>×</button>
                
                <div className='pb-6'>
                    <h1 className='text-2xl font-mono-space font-bold text-forest pb-[1px] text-center'>Your Storyboard is Ready!</h1>
                    <p className='text-sm text-slate text-center'>
                        {!showEmailInput 
                            ? 'Would you like to register your email to receive your video when it\'s ready?'
                            : 'Enter your email to get your video delivered to your inbox.'
                        }
                    </p>
                </div>
                
                {showEmailInput && (
                    <Input placeholder='Type Email Here...' value={email} onChange={handleChange} />
                )}
                
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}
                
                <div className='flex flex-col sm:flex-row gap-4 sm:justify-end justify-center pt-6'>
                    {!showEmailInput ? (
                        <>
                            <Button 
                                onClick={handleCancel} 
                                text={isLoading ? 'Generating...' : 'Skip'} 
                                bgColor='bg-slate' 
                                disabled={isLoading} 
                            />
                            <Button 
                                onClick={handleRegister} 
                                text='Register Email' 
                                disabled={isLoading} 
                            />
                        </>
                    ) : (
                        <>
                            <Button 
                                onClick={() => setShowEmailInput(false)} 
                                text='Back' 
                                bgColor='bg-slate' 
                                disabled={isLoading} 
                            />
                            <Button 
                                onClick={handleSubmitEmail} 
                                text={isLoading ? 'Generating...' : 'Generate Video'} 
                                disabled={isLoading || !email.trim()} 
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Popup;