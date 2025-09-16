import React from 'react'
import { Button, Input } from '.'
import { ChatInputProps } from './types'
import { LuSend } from 'react-icons/lu'

const ChatInput = ({ placeholder="Type here...", value, onChange, onClick }: ChatInputProps) => {
    return (
        <div className='flex items-center justify-center px-2 gap-4'>
            <Input placeholder={placeholder} value={value} onChange={onChange} />
            <Button variant="icon" onClick={onClick} icon={<LuSend />} disabled={!value}/>
        </div> 
    )
}

export default ChatInput