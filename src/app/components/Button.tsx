"use client"

import React from 'react'
import { ButtonProps } from './types'

const Button = ({ onClick, text, icon, variant="text", disabled=false }: ButtonProps) => {
    return (
        <button className={`bg-forest font-space-mono text-mist flex items-center justify-center py-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${variant === "icon" ? "rounded-full px-2" : "rounded-xl px-4"}`} onClick={onClick} disabled={disabled}>{text || icon}</button>
    )
}

export default Button
