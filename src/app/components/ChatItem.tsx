"use client"
import React from 'react'
import { Avatar, ChatBox } from '.'
import { ChatBoxProps } from './types'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

const ChatItem = ({
    type = "assistant",
    message,
    isLoading,
    isError,
    images,
    videoUrl,
    downloadUrl,
    videoHistory,
    isEditable,
    isEditing,
    videoGenerating,
    onEdit,
    onStartEdit,
    onCancelEdit,
    onStartNewStory,
    onEditStoryboard
}: ChatBoxProps) => {
    const isVisible = useWindowWidth();
    return (
        <div className={`flex gap-4 ${type === "assistant" ? "flex-row-reverse" : "flex-row"}`}>
            {isVisible && <Avatar type={type} />}
            <ChatBox
                type={type}
                message={message}
                isLoading={isLoading}
                isError={isError}
                images={images}
                videoUrl={videoUrl}
                downloadUrl={downloadUrl}
                videoHistory={videoHistory}
                isEditable={isEditable}
                isEditing={isEditing}
                videoGenerating={videoGenerating}
                onEdit={onEdit}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                onStartNewStory={onStartNewStory}
                onEditStoryboard={onEditStoryboard}
            />
        </div>
    )
}

export default ChatItem