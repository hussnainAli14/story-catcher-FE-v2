"use client"
import React, { useState } from 'react'
import { Chat, ChatInput, Header, Popup } from '../components'
import { messages } from '@/utils/dummyData'

const Intake = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    }

    return (
        <>
       { isPopupOpen && <Popup handleClose={handleClosePopup} />}
        <div className="h-screen flex flex-col"  style={{ backgroundImage: 'url(/images/background.jpg)', backgroundSize:'cover', backgroundPosition:'center' }}>
          <Header />
           <div className='flex-1 sm:px-20 px-5 pb-10 overflow-y-auto scrollbar-hide'>
          <h1 className='text-3xl font-bold text-center font-tektur text-forest py-10'>Answer a Few Questions to Generate Your Video</h1>
            
            <Chat messages={messages} />
          </div>
          <div className='sm:px-10 py-4 '>
            <ChatInput placeholder="Type here..." value={""} onChange={() => {}} onClick={() => {}} />
          </div>
        </div>
        </>
    )
}

export default Intake