"use client"
import React from 'react'
import { Avatar, ChatBox } from '.'
import { ChatBoxProps } from './types'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

const ChatItem = ({type="assistant", message}: ChatBoxProps) => {
   const isVisible = useWindowWidth();
    return (
        <div className={`flex gap-4 ${type === "assistant" ? "flex-row-reverse" : "flex-row"}`}>
          {isVisible && <Avatar type={type} />}
            <ChatBox type={type} message={message} />
        </div>
    )
}

export default ChatItem