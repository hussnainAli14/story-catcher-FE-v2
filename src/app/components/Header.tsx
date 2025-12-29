import React from 'react'

const Header = () => {
    return (
        <header className='w-full px-12 py-6 bg-forest text-mist flex justify-between items-center'>
            <div className="flex flex-col">
                <h1 className='font-poppins text-3xl uppercase tracking-wider'>STORY CATCHER</h1>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-light">by Numina</span>
                </div>
            </div>
            <div className="text-2xl font-light italic opacity-80 hidden md:block">
                Visualize Your Moment of Realization
            </div>
        </header >
    )
}

export default Header