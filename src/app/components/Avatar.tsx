import React from 'react'
import { IoPersonSharp } from 'react-icons/io5'
import { AvatarProps } from './types'
import { RiRobot2Fill } from 'react-icons/ri'

const Avatar = ({ type="user" }: AvatarProps) => {
    return (
        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${type === "user" ? "bg-stone" : "bg-slate"}`}>
            {type === "user" ? <IoPersonSharp color='black' size={20} /> : <RiRobot2Fill color='white' size={20} />}
        </div>
    )
}

export default Avatar