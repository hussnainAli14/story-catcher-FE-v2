"use client"

import React, { useState, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { Header } from '../components';

const Preview = () => {
    const [dimensions, setDimensions] = useState({ width: 1000, height: 500 });

    useEffect(() => {
        const updateDimensions = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            const maxWidth = Math.min(screenWidth * 0.9, 1000);
            const aspectRatio = 16/9; 
            const height = screenHeight / aspectRatio;

            
            setDimensions({ width: maxWidth, height });
        };

        // Set initial dimensions
        updateDimensions();

        // Update on window resize
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    return (
        <>
        <Header />
        <h1 className='text-3xl font-bold text-center font-tektur text-forest py-10'>Your Story is Ready to Play</h1>
        <div className='flex justify-center items-center pt-6 sm:px-4 px-2'>
        <ReactPlayer 
            src='https://www.youtube.com/watch?v=LXb3EKWsInQ' 
            controls 
            width={dimensions.width} 
            height={dimensions.height}
            style={{ maxWidth: '100%'}}
        />
        </div>
        </>
    )
}

export default Preview;