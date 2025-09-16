export type InputProps = {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export type ButtonProps = {
    onClick: () => void;
    text?: string;
    icon?: React.ReactNode;
    variant?: "icon" | "text";
    disabled?: boolean;
}

export type ChatInputProps = InputProps & ButtonProps;

export type AvatarProps = {
    type?: "user" | "assistant";
}

export type ChatBoxProps = AvatarProps & {
    message: string;
}

export type ChatProps = {
    messages: ChatBoxProps[];
}