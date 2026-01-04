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

        // More robust check for storyboard message
        const isStoryboard = lastMessage &&
            lastMessage.type === 'assistant' &&
            (
                lastMessage.message.includes('Storyboard:') ||
                lastMessage.message.includes('Your video will be ready') ||
                lastMessage.message.includes('Scene 1')
            );

        const isStoryboardReady = isStoryboard && !lastMessage.isLoading;

        // Check if there is ANY storyboard message in the history
        const existingStoryboardIndex = messages.findIndex(msg =>
            msg.type === 'assistant' &&
            (
                msg.message.includes('Storyboard:') ||
                msg.message.includes('Your video will be ready') ||
                msg.message.includes('Scene 1')
            )
        );

        if (scrollToIndex !== -1) {
            // Scroll to the newly completed video
            const videoElement = videoRefs.current.get(scrollToIndex);
            if (videoElement) {
                setTimeout(() => {
                    videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Mark this video as scrolled to
                    scrolledToVideos.current.add(scrollToIndex);
                }, 100);
            }
        } else if (isStoryboard) {
            // If the LAST message is a storyboard (loading or not), scroll to TOP of it
            const targetElement = videoRefs.current.get(lastMessageIndex);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
            }
        } else if (existingStoryboardIndex !== -1) {
            // If a storyboard exists in history, we want to stay focused on it
            // UNLESS the new message is a user message (user typing) or an error
            // But if it's "Your video is generating...", we want to stay on storyboard

            // If the last message is "Your video is generating...", scroll to storyboard top
            if (lastMessage && lastMessage.message.includes('Your video is generating')) {
                const targetElement = videoRefs.current.get(existingStoryboardIndex);
                if (targetElement) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 150);
                }
            } else {
                // For other messages (like user input), standard behavior?
                // Actually, if user is typing, we might want to see input.
                // But the user request specifically mentioned "Your video is generating..." causing scroll.

                // Let's only prevent scroll if it's that specific message, otherwise default behavior
                // or if we want to be safe, if storyboard exists, always prioritize it unless user action?

                // Current decision: If "Your video is generating...", force scroll to storyboard top.
                // Otherwise, default scroll to bottom (e.g. for user messages).
                chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (chatEndRef.current) {
            // Only scroll to bottom for regular messages if no storyboard exists
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