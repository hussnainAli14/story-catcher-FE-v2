"use client"

import React, { useState } from 'react'
import { Button, Input } from '.';
import { PopupProps } from './types';

type PopupStep = 'email' | 'thank-you' | 'instructions';

const Popup = ({ handleClose, onGenerateVideo }: PopupProps) => {
    const [step, setStep] = useState<PopupStep>('email');
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
        // Pass email to parent immediately so it's stored
        onGenerateVideo(email);
        // Move to next step instead of closing
        setStep('thank-you');
    }

    const handleNext = () => {
        setStep('instructions');
    }

    const handleFinalClose = () => {
        handleClose();
    }

    const handleDismiss = () => {
        if (step === 'email') {
            // If skipping email, skip 'thank-you' and go straight to 'instructions'
            setStep('instructions');
        } else {
            handleClose();
        }
    }

    return (
        <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white sm:px-6 px-4 py-10 shadow-lg max-w-lg w-full mx-4 rounded-xl flex flex-col gap-6 relative'>
                <button className='absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-4xl cursor-pointer' onClick={handleDismiss}>×</button>

                {step === 'email' && (
                    <>
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

                            <p className='text-lg text-center font-medium'>
                                This is kept totally private we will never sell nor spam
                            </p>
                        </div>

                        <div className='flex justify-center'>
                            <Button
                                onClick={handleSubmitEmail}
                                text={isLoading ? 'Processing...' : 'Enter'}
                                disabled={isLoading || !email.trim()}
                            />
                        </div>
                    </>
                )}

                {step === 'thank-you' && (
                    <>
                        <div className='text-center space-y-4'>
                            <h1 className='text-2xl font-poppins font-bold text-forest'>Thank you!</h1>

                            <div className="space-y-4 text-left p-4 text-md sm:text-xl">
                                <p className="text-gray-700">
                                    Your story stays private
                                    unless you choose to share it. .
                                </p>
                                <p className="text-gray-700">
                                    If you choose, you can enter your
                                    story on the <strong>
                                        Moments of Realization
                                    </strong> YouTube channel.
                                </p>
                                <p className="text-gray-700">
                                    Each month we will select the <strong>
                                        most
                                        moving video</strong>. Winning entries are
                                    guaranteed <strong>
                                        10,000 views</strong>.
                                </p>
                            </div>
                        </div>

                        <div className='flex justify-center'>
                            <Button
                                onClick={handleNext}
                                text="Next"
                            />
                        </div>
                    </>
                )}

                {step === 'instructions' && (
                    <>
                        <div className='text-center space-y-4'>
                            <h1 className='text-2xl font-poppins font-bold text-forest'>What happens next?</h1>

                            <div className="space-y-3 text-left p-4 text-md sm:text-xl">
                                <p className="text-gray-700">
                                    Your video will appear <b>below</b> very shortly.
                                </p>
                                <p className="text-gray-700">
                                    Please <b>view the video</b>.
                                </p>
                                <p className="text-gray-700">
                                    If you choose, then you can <b>edit the script</b> and generate a revised video.
                                </p>

                                {step === 'instructions' && (
                                    <p className="text-gray-700">
                                        Check the <strong>
                                            email inbox</strong> for personal copy.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className='flex justify-center'>
                            <Button
                                onClick={handleFinalClose}
                                text="Close"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Popup;