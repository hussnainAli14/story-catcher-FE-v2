import React from 'react'
import { Button, Input } from '.';

const Popup = () => {
    return (
        <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center'>
            <div className='bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 flex flex-col justify-center items-center'>
                <h1>Want Your Story Delivered?</h1>
                <p>Enter your email to get your story delivered to your inbox.</p>
                <Input placeholder='Email' />
                <div className='flex gap-4 justify-end'>
                <Button onClick={() => {}} text='Send 📩' />
                <Button onClick={() => {}} text='No Thanks!' />
                </div>
            </div>
        </div>
    )
}

export default Popup;