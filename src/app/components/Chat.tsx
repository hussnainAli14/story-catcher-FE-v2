import React, { useEffect, useRef } from 'react'
import ChatItem from './ChatItem'
import { ChatProps } from './types'

const Chat = ({
    messages, 
    onEditMessage, 
    onStartEditing, 
    onCancelEditing,
    videoGenerated = false,
    videoGenerating = false
}: ChatProps) => {
    const chatEndRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const scrolledToVideos = useRef<Set<number>>(new Set());

    // Auto-scroll to bottom when messages change (for regular messages)
    useEffect(() => {
        // Check if there's a message that should scroll to (newly completed video)
        const scrollToIndex = messages.findIndex((msg, idx) => 
            msg.shouldScrollTo && 
            msg.videoUrl && 
            !scrolledToVideos.current.has(idx)
        );
        
        if (scrollToIndex !== -1) {
            // Scroll to the newly completed video
            const videoElement = videoRefs.current.get(scrollToIndex);
            if (videoElement) {
                setTimeout(() => {
                    videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Mark this video as scrolled to
                    scrolledToVideos.current.add(scrollToIndex);
                }, 100); // Small delay to ensure DOM is updated
            }
        } else if (chatEndRef.current) {
            // Otherwise scroll to bottom for regular messages
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const setVideoRef = (index: number, element: HTMLDivElement | null) => {
        if (element) {
            videoRefs.current.set(index, element);
        } else {
            videoRefs.current.delete(index);
        }
    };

    return (
        <div className='flex flex-col gap-4 overflow-y-auto'>
            {messages.map((message, index) => (
                <div
                    key={index}
                    ref={(el) => {
                        // Set ref for video messages that should scroll to
                        if (message.videoUrl && message.shouldScrollTo) {
                            setVideoRef(index, el);
                        }
                    }}
                >
                    <ChatItem 
                        type={message.type} 
                        message={message.message} 
                        isLoading={message.isLoading}
                        isError={message.isError}
                        images={message.images}
                        videoUrl={message.videoUrl}
                        isEditable={message.isEditable && !videoGenerating}
                        isEditing={message.isEditing}
                        videoGenerating={videoGenerating}
                        onEdit={(newMessage) => onEditMessage?.(index, newMessage)}
                        onStartEdit={() => onStartEditing?.(index)}
                        onCancelEdit={() => onCancelEditing?.(index)}
                    />
                </div>
            ))}
            {/* Invisible element to scroll to */}
            <div ref={chatEndRef} />
        </div>
    )
}

export default Chat