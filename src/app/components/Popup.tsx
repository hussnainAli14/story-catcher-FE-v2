"use client"

import React, { useState } from 'react'
import { Button, Input } from '.';
import { PopupProps } from './types';

const Popup = ({handleClose}: PopupProps) => {
    const [email, setEmail] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const handleSend = () => {
        console.log(email);
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
                <div className='flex flex-col sm:flex-row gap-4 sm:justify-end justify-center pt-6'>
                <Button onClick={handleSend} text='Send 📩' />
                <Button onClick={handleClose} text='No Thanks!' bgColor='bg-slate' />
                </div>
            </div>
        </div>
    )
}

export default Popup;