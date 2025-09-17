"use client"

import React from 'react'
import { ButtonProps } from './types'

const Button = ({ onClick, text, icon, variant="text", disabled=false, bgColor="bg-forest" }: ButtonProps) => {
    return (
        <button className={`${bgColor} font-space-mono text-mist flex items-center justify-center py-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-80 hover:scale-105 transition-all duration-300 ${variant === "icon" ? "rounded-full px-2" : "rounded-xl px-4"}`} onClick={onClick} disabled={disabled}>{text || icon}</button>
    )
}

export default Button
