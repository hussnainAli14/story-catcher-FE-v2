import React, { useEffect, useRef } from 'react'
import ChatItem from './ChatItem'
import { ChatProps } from './types'

const Chat = ({messages}: ChatProps) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className='flex flex-col gap-4 overflow-y-auto'>
            {messages.map((message, index) => (
                <ChatItem 
                    key={index} 
                    type={message.type} 
                    message={message.message} 
                    isLoading={message.isLoading}
                    isError={message.isError}
                    images={message.images}
                    videoUrl={message.videoUrl}
                />
            ))}
            {/* Invisible element to scroll to */}
            <div ref={chatEndRef} />
        </div>
    )
}

export default Chat