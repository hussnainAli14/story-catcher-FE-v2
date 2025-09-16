import React from 'react'
import { Avatar, ChatBox } from '.'
import { ChatBoxProps } from './types'

const ChatItem = ({type="assistant", message}: ChatBoxProps) => {
    return (
        <div className={`flex gap-4 ${type === "assistant" ? "flex-row-reverse" : "flex-row"}`}>
            <Avatar type={type} />
            <ChatBox type={type} message={message} />
        </div>
    )
}

export default ChatItem