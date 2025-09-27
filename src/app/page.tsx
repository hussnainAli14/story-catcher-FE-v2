"use client"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { storyAPI } from '@/lib/api';

export default function Home() {
    const router = useRouter();
    const [isCheckingHealth, setIsCheckingHealth] = useState(true);
    const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
    const [retryCount, setRetryCount] = useState(0);

    const checkBackendHealth = async () => {
        try {
            setIsCheckingHealth(true);
            
            // Start both the health check and minimum delay timer
            const [isHealthy] = await Promise.all([
                storyAPI.checkHealth(),
                new Promise(resolve => setTimeout(resolve, 2000)) // Minimum 2 second delay
            ]);
            
            if (isHealthy) {
                setHealthStatus('healthy');
                // Small delay to show the success state before navigating
                setTimeout(() => {
                    router.push('/intake');
                }, 1000);
            } else {
                setHealthStatus('unhealthy');
                setIsCheckingHealth(false);
            }
        } catch (error) {
            console.error('Health check failed:', error);
            setHealthStatus('unhealthy');
            setIsCheckingHealth(false);
        }
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setHealthStatus('checking');
        checkBackendHealth();
    };

    const handleStart = () => {
        router.push('/intake');
    };

    useEffect(() => {
        checkBackendHealth();
    }, [checkBackendHealth]);

    const getStatusMessage = () => {
        switch (healthStatus) {
            case 'checking':
                return 'Checking backend connection...';
            case 'healthy':
                return 'Backend connected! Redirecting...';
            case 'unhealthy':
                return 'Backend server is not available';
            default:
                return 'Checking backend connection...';
        }
    };

    const getStatusColor = () => {
        switch (healthStatus) {
            case 'checking':
                return 'text-blue-600';
            case 'healthy':
                return 'text-green-600';
            case 'unhealthy':
                return 'text-red-600';
            default:
                return 'text-blue-600';
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-10" style={{ backgroundImage: 'url(/images/background.jpg)', backgroundSize:'cover', backgroundPosition:'center' }}>
            <div className='flex flex-col items-center justify-center font-tektur'>
                <h1 className='text-3xl text-center font-tektur text-forest'>Story Catcher</h1>
                <h4 className='text-center font-normal text-slate'>Your life changing moment in video.</h4>
                
                <DotLottieReact
                    src="https://lottie.host/45485b95-ce71-466e-9b7d-cdd2be88d721/urJFCKyByY.lottie"
                    loop
                    autoplay
                    className='sm:w-100 sm:h-50 w-50 h-30'
                />

                {/* Health Status */}
                <div className="flex flex-col items-center gap-4 mt-6">
                    <div className={`text-sm font-space-mono ${getStatusColor()}`}>
                        {getStatusMessage()}
                    </div>
                    
                    {isCheckingHealth && (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-xs text-gray-600">Loading Story Catcher...</span>
                        </div>
                    )}

                    {healthStatus === 'unhealthy' && (
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-xs text-gray-600 text-center max-w-xs">
                                Please check the backend server status
                            </p>
                            <button 
                                onClick={handleRetry}
                                className="px-4 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                            >
                                Retry ({retryCount})
                            </button>
                        </div>
                    )}

                    {healthStatus === 'healthy' && (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            <span className="text-xs text-green-600">Redirecting...</span>
                        </div>
                    )}
                </div>

                {/* Manual Start Button (only show if unhealthy) */}
                {healthStatus === 'unhealthy' && (
                    <button 
                        className='border-b-2 border-forest text-forest font-space-mono text-sm font-bold mt-4 cursor-pointer hover:text-green-700 transition-colors'
                        onClick={handleStart}
                    >
                        Start Your Story (Offline Mode)
                    </button>
                )}
            </div>
        </div>
    );
}
