"use client"
import React from 'react'
import { Avatar, ChatBox } from '.'
import { ChatBoxProps } from './types'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

const ChatItem = ({type="assistant", message, isLoading, isError, images, videoUrl}: ChatBoxProps) => {
   const isVisible = useWindowWidth();
    return (
        <div className={`flex gap-4 ${type === "assistant" ? "flex-row-reverse" : "flex-row"}`}>
          {isVisible && <Avatar type={type} />}
            <ChatBox type={type} message={message} isLoading={isLoading} isError={isError} images={images} videoUrl={videoUrl} />
        </div>
    )
}

export default ChatItem