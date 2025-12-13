import React, { useEffect, useRef } from 'react'
import ChatItem from './ChatItem'
import { ChatProps } from './types'

const Chat = ({
    messages,
    onEditMessage,
    onStartEditing,
    onCancelEditing,
    videoGenerated = false,
    videoGenerating = false,
    onStartNewStory
}: ChatProps) => {
    const chatEndRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const scrolledToVideos = useRef<Set<number>>(new Set());

    // Find the storyboard message index
    const storyboardIndex = messages.findIndex(msg =>
        msg.type === 'assistant' &&
        (msg.message.includes('**Storyboard:') || msg.message.includes('**Your video will be ready')) &&
        msg.message.includes('**Scene') &&
        !msg.isLoading
    );

    const handleEditStoryboard = () => {
        if (storyboardIndex !== -1 && onStartEditing) {
            onStartEditing(storyboardIndex);
        }
    };

    // Auto-scroll to bottom when messages change (for regular messages)
    useEffect(() => {
        // Check if there's a message that should scroll to (newly completed video)
        const scrollToIndex = messages.findIndex((msg, idx) =>
            msg.shouldScrollTo &&
            msg.videoUrl &&
            !scrolledToVideos.current.has(idx)
        );

        // Check if the last message is a storyboard (and not loading)
        const lastMessageIndex = messages.length - 1;
        const lastMessage = messages[lastMessageIndex];
        const isStoryboardReady = lastMessage &&
            lastMessage.type === 'assistant' &&
            (lastMessage.message.includes('**Storyboard:') || lastMessage.message.includes('**Your video will be ready')) &&
            !lastMessage.isLoading;

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
        } else if (isStoryboardReady) {
            // If storyboard is ready, scroll to the message BEFORE it (the "Thank you" message)
            // or to the top of the storyboard if no previous message
            const targetIndex = lastMessageIndex > 0 ? lastMessageIndex - 1 : lastMessageIndex;
            const targetElement = videoRefs.current.get(targetIndex);

            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        } else if (chatEndRef.current) {
            // Otherwise scroll to bottom for regular messages
            // Only scroll if we didn't just scroll to storyboard
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
                    key={message.id || index}
                    ref={(el) => {
                        // Set ref for video messages that should scroll to
                        if (message.videoUrl && message.shouldScrollTo) {
                            setVideoRef(index, el);
                        }
                        // Also set ref for storyboard messages (or messages right before them)
                        // We store all refs to be safe for custom scrolling logic
                        setVideoRef(index, el);
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
                        onStartNewStory={onStartNewStory}
                        onEditStoryboard={handleEditStoryboard}
                    />
                </div>
            ))}
            {/* Invisible element to scroll to */}
            <div ref={chatEndRef} />
        </div>
    )
}

export default Chat