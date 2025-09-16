import React from 'react'
import { ChatBoxProps } from './types'

const ChatBox = ({ message, type="assistant" }: ChatBoxProps) => {
    return (
        <div className={`flex max-w-full md:max-w-1/2 px-4 py-2 ${type === "user" ? "bg-flash-white rounded-xl rounded-tl-none" : "bg-alabster rounded-xl rounded-tr-none "} font-space-mono text-forest`}>
            {message}
        </div>
    )
}

export default ChatBox