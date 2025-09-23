import React from 'react'
import { ChatBoxProps } from './types'
import Storyboard from './Storyboard'

const ChatBox = ({ message, type="assistant", isLoading, isError }: ChatBoxProps) => {
    const getBoxStyles = () => {
        if (isError) {
            return "bg-red-100 border border-red-300 text-red-700";
        }
        if (isLoading) {
            return "bg-gray-100 border border-gray-300 text-gray-600";
        }
        return type === "user" 
            ? "bg-flash-white rounded-xl rounded-tl-none" 
            : "bg-alabster rounded-xl rounded-tr-none";
    };

    // Check if the message contains a storyboard
    const isStoryboard = message.includes('**Storyboard:') && message.includes('**Scene');

    return (
        <div className={`flex max-w-full md:max-w-1/2 px-4 py-2 ${getBoxStyles()} font-space-mono text-forest`}>
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Generating your story...</span>
                </div>
            ) : isStoryboard ? (
                <div className="w-full">
                    <Storyboard content={message} />
                </div>
            ) : (
                message
            )}
        </div>
    )
}

export default ChatBox