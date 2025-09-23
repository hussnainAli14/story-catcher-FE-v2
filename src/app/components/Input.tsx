import React from 'react'
import { InputProps } from './types'

const Input = ({ placeholder="Type here...", value, onChange, onKeyPress, disabled }: InputProps) => {
    return (
        <input 
            type="text" 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange}
            onKeyPress={onKeyPress}
            disabled={disabled}
            className={`w-full font-space-mono text-ink p-2 focus:outline-forest focus:outline-1 focus:border-none border border-stone rounded-sm ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`} 
        />
    )
}

export default Input