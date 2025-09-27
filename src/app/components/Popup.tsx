"use client"

import React, { useState } from 'react'
import { Button, Input } from '.';
import { PopupProps } from './types';
import { supabase } from '@/lib/supabase';

const Popup = ({handleClose, videoUrl}: PopupProps) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const handleSend = async () => {
        if (!email.trim()) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Save email and video link to Supabase
            const { data, error } = await supabase
                .from('story_submissions')
                .insert([
                    {
                        email: email.trim(),
                        video_url: videoUrl || null,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) {
                console.error('Error saving to Supabase:', error);
                setError('Failed to save your email. Please try again.');
            } else {
                setIsSuccess(true);
                // Close popup after 2 seconds
                setTimeout(() => {
                    handleClose();
                }, 2000);
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    if (isSuccess) {
        return (
            <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center'>
                <div className='bg-white sm:px-6 px-2 py-10 rounded-lg shadow-lg max-w-lg w-full mx-4 rounded-xl flex flex-col gap-4 relative'>
                    <div className='pb-6 text-center'>
                        <div className="text-green-600 text-6xl mb-4">✓</div>
                        <h1 className='text-2xl font-mono-space font-bold text-forest pb-[1px]'>Thank You!</h1>
                        <p className='text-sm text-slate'>Your story will be delivered to your inbox shortly.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center'>
            <div className='bg-white sm:px-6 px-2 py-10 rounded-lg shadow-lg max-w-lg w-full mx-4 rounded-xl flex flex-col gap-4 relative'>
            <button className='absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-4xl cursor-pointer' onClick={handleClose}>×</button>
                
                <div className='pb-6'>
                <h1 className='text-2xl font-mono-space font-bold text-forest pb-[1px] text-center'>Want Your Story Delivered?</h1>
                <p className='text-sm text-slate text-center'>Enter your email to get your story delivered to your inbox.</p>
                </div>
                <Input placeholder='Type Email Here...' value={email} onChange={handleChange} />
                
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}
                
                <div className='flex flex-col sm:flex-row gap-4 sm:justify-end justify-center pt-6'>
                <Button onClick={handleSend} text={isLoading ? 'Sending...' : 'Send 📩'} disabled={isLoading} />
                <Button onClick={handleClose} text='No Thanks!' bgColor='bg-slate' />
                </div>
            </div>
        </div>
    )
}

export default Popup;