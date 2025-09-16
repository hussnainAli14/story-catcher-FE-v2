import React from 'react'
import ChatItem from './ChatItem'
import { ChatProps } from './types'

const Chat = ({messages}: ChatProps) => {
    return (
        <div className='flex flex-col gap-4 overflow-y-auto'>
            {messages.map((message, index) => (
                <ChatItem key={index} type={message.type} message={message.message} />
            ))}
        </div>
    )
}

export default Chat