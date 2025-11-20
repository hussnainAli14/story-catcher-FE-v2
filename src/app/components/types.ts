import React from 'react';

export type InputProps = {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export type ButtonProps = {
    onClick: () => void;
    text?: string;
    icon?: React.ReactNode;
    variant?: "icon" | "text";
    disabled?: boolean;
    bgColor?: string;
}

export type ChatInputProps = InputProps & ButtonProps;

export type AvatarProps = {
    type?: "user" | "assistant";
}

export type ChatBoxProps = AvatarProps & {
    id?: string;
    message: string;
    isLoading?: boolean;
    isError?: boolean;
    images?: string[];
    videoUrl?: string;
    videoHistory?: string[]; // Array of all videos generated for this storyboard
    isEditable?: boolean;
    isEditing?: boolean;
    onEdit?: (newMessage: string) => void;
    onStartEdit?: () => void;
    onCancelEdit?: () => void;
    videoGenerating?: boolean;
    shouldScrollTo?: boolean; // Flag to trigger scroll when video is ready
}

export type ChatProps = {
    messages: ChatBoxProps[];
    onEditMessage?: (index: number, newMessage: string) => void;
    onStartEditing?: (index: number) => void;
    onCancelEditing?: (index: number) => void;
    videoGenerated?: boolean;
    videoGenerating?: boolean;
}

export type PopupProps = {
    handleClose: () => void;
    onGenerateVideo: (email?: string) => void;
}