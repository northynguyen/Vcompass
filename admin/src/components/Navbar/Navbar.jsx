import React from 'react'
import './Navbar.css'
import avatar from '../../assets/avatar.png'
const Navbar = () => {
    return (
        <div className='navbar'>
            <div className="logo">
                <h1>VCompass</h1>
            </div>
            <img src={avatar} alt="avatar" className='avatar' />
        </div>
    )
}

export default Navbar