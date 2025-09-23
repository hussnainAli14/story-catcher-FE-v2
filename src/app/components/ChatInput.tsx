import React, { useState } from 'react'
import { Button, Input } from '.'
import { ChatInputProps } from './types'
import { LuSend } from 'react-icons/lu'

const ChatInput = ({ placeholder="Type here...", value, onChange, onClick, disabled }: ChatInputProps) => {
    const [inputValue, setInputValue] = useState(value || '');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange?.(e);
    };

    const handleClick = () => {
        if (inputValue.trim() && !disabled) {
            onClick?.();
            setInputValue(''); // Clear input after sending
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim() && !disabled) {
            handleClick();
        }
    };

    return (
        <div className='flex items-center justify-center px-2 gap-4'>
            <Input 
                placeholder={placeholder} 
                value={inputValue} 
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={disabled}
            />
            <Button 
                variant="icon" 
                onClick={handleClick} 
                icon={<LuSend />} 
                disabled={!inputValue.trim() || disabled}
            />
        </div> 
    )
}

export default ChatInput