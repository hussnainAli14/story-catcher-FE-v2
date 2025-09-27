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
    message: string;
    isLoading?: boolean;
    isError?: boolean;
    images?: string[];
    videoUrl?: string;
}

export type ChatProps = {
    messages: ChatBoxProps[];
}

export type PopupProps = {
    handleClose: () => void;
}