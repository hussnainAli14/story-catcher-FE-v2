import React, { useState } from 'react'
import { ChatBoxProps } from './types'
import Storyboard from './Storyboard'

const ChatBox = ({
    message,
    type = "assistant",
    isLoading,
    isError,
    images,
    videoUrl,
    videoHistory,
    isEditable = false,
    isEditing = false,
    onEdit,
    onStartEdit,
    onCancelEdit,
    videoGenerating = false
}: ChatBoxProps) => {
    const [editText, setEditText] = useState(message);

    // Update editText when message changes or when editing starts
    React.useEffect(() => {
        if (isEditing) {
            setEditText(message);
        }
    }, [isEditing, message]);

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
    const isStoryboard = (message.includes('**Your video will be ready') || message.includes('**Storyboard:')) && message.includes('**Scene');

    const handleSave = () => {
        if (onEdit) {
            onEdit(editText);
        }
    };

    const handleCancel = () => {
        setEditText(message);
        if (onCancelEdit) {
            onCancelEdit();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div className={`flex w-full md:max-w-1/2 px-4 py-2 ${getBoxStyles()} font-space-mono text-forest ${isEditable && !isEditing ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            onClick={isEditable && !isEditing ? onStartEdit : undefined}>
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Generating your story...</span>
                </div>
            ) : isEditing ? (
                <div className="w-full space-y-3">
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 font-space-mono text-base leading-relaxed resize-none focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest focus:ring-opacity-20 min-h-[200px]"
                        rows={Math.max(8, editText.split('\n').length)}
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm bg-forest text-white rounded hover:bg-green-700 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : isStoryboard ? (
                <div className="w-full relative group">
                    <Storyboard
                        content={message}
                        images={images}
                        videoUrl={videoUrl}
                        videoHistory={videoHistory}
                        videoGenerating={videoGenerating}
                    />
                    {isEditable && !videoGenerating && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStartEdit?.();
                                }}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg text-sm"
                                title="Edit storyboard - Make changes and generate a new video"
                            >
                                ✏️ Edit
                            </button>
                        </div>
                    )}
                </div>
            ) : videoUrl ? (
                <div className="w-full">
                    <div className="mb-3">{message}</div>
                    <Storyboard
                        content=""
                        images={images}
                        videoUrl={videoUrl}
                        videoHistory={videoHistory}
                    />
                </div>
            ) : (
                <div className="relative">
                    {message}
                    {isEditable && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStartEdit?.();
                                }}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
                                title="Edit storyboard - Click to modify your story before generating video"
                            >
                                ✏️ Edit
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ChatBox