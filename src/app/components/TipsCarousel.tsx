import React, { useState, useEffect, useRef } from 'react';

interface TipsCarouselProps {
    phase: 'start' | 'email-submitted';
}

const EARLY_LOOP = [
    "Your video will be ready in about 1 minute",
    "Meanwhile, the script for your video is below",
    "Take a few seconds to read the script you will be able to edit later"
];

const LATE_LOOP = [
    "The script for your video is below",
    "Take a few seconds to read the script you will be able to edit later",
    "Your video will appear below very shortly",
    "If you choose, then you can edit the script",
    "And generate a revised video"
];

const THANK_YOU_SEQUENCE = [
    "Thank you!",
    "Your video will be anonymous",
    "Each month we will select the most moving Moment of Realization video",
    "If you choose, we will publish these on the Moments of Realization website winning entries are guaranteed 10,000 views"
];

const TipsCarousel = ({ phase }: TipsCarouselProps) => {
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [thankYouIndex, setThankYouIndex] = useState(-1); // -1 means not playing
    const [mainIndex, setMainIndex] = useState(0);
    const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

    // Track if we have already triggered the thank you sequence to prevent re-triggering
    const hasTriggeredThankYou = useRef(false);

    // Timer for 30s switch
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsElapsed(s => s + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Trigger Thank You sequence when phase changes to email-submitted
    useEffect(() => {
        if (phase === 'email-submitted' && !hasTriggeredThankYou.current) {
            hasTriggeredThankYou.current = true;
            setThankYouIndex(0);
            setFadeState('in');
        }
    }, [phase]);

    // Carousel Animation Logic
    useEffect(() => {
        const showDuration = 4000;
        const fadeDuration = 500;

        const interval = setInterval(() => {
            setFadeState('out');

            setTimeout(() => {
                // Logic to determine next message state
                setThankYouIndex(currentThankYouIdx => {
                    if (currentThankYouIdx >= 0) {
                        // Currently playing Thank You sequence
                        if (currentThankYouIdx < THANK_YOU_SEQUENCE.length - 1) {
                            return currentThankYouIdx + 1;
                        } else {
                            // Finished Thank You sequence, go back to main loop
                            return -1;
                        }
                    }
                    return -1;
                });

                setMainIndex(currentMainIdx => currentMainIdx + 1);
                setFadeState('in');
            }, fadeDuration);

        }, showDuration + fadeDuration);

        return () => clearInterval(interval);
    }, []);

    // Determine which message to show
    let currentMessage = "";

    if (thankYouIndex >= 0) {
        currentMessage = THANK_YOU_SEQUENCE[thankYouIndex];
    } else {
        const currentLoop = secondsElapsed < 30 ? EARLY_LOOP : LATE_LOOP;
        currentMessage = currentLoop[mainIndex % currentLoop.length];
    }

    return (
        <div className={`p-4 border rounded-lg transition-colors duration-500 bg-orange-50 border-orange-200 min-h-[80px] flex items-center justify-center`}>
            <p
                className={`text-sm text-orange-800 text-center font-medium transition-opacity duration-500 ${fadeState === 'in' ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {thankYouIndex === 0 && <span className="mr-2">✨</span>}
                {thankYouIndex === -1 && secondsElapsed < 5 && <span className="mr-2">⏳</span>}
                {currentMessage}
            </p>
        </div>
    );
};

export default TipsCarousel;
