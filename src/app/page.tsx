"use client"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
  export default function Home() {

    const router = useRouter();

    const handleStart = () => {
      router.push('/intake');
    }

    useEffect(() => {
     const timeout = setTimeout(() => {
        handleStart();
      }, 3000);
      return () => clearTimeout(timeout);
    }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10"  style={{ backgroundImage: 'url(/images/background.jpg)', backgroundSize:'cover', backgroundPosition:'center' }}>
      <div className='flex flex-col items-center justify-center font-tektur'>
        <h1 className='text-3xl text-center font-tektur text-forest'>Story Catcher</h1>
        <h4 className='text-center font-normal text-slate'>Your life changing moment in video.</h4>
<DotLottieReact
      src="https://lottie.host/45485b95-ce71-466e-9b7d-cdd2be88d721/urJFCKyByY.lottie"
      loop
      autoplay
      className='sm:w-100 sm:h-50 w-50 h-30'
    />
    <button className='border-b-2 border-forest text-forest font-space-mono text-sm font-bold mt-10 cursor-pointer' onClick={handleStart}>
    Start Your Story
    </button>
    </div>
    </div>
  );
}
