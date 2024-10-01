import React from 'react'
import './Sidebar.css'
import add from '../../assets/bx-plus-circle.svg'
import { NavLink } from 'react-router-dom'
const Sidebar = () => {
    return (
        <div className='sidebar'>
            <div className='sidebar-options'>
                <NavLink to={'/dashboard'} className='sidebar-option'>
                    <img src={add} alt="" />
                    <p>Dashboard</p>
                </NavLink>
                <NavLink to={'/users'} className='sidebar-option'>
                    <img src={add} alt="" className='sidebar-icon' />
                    <p>Users</p>
                </NavLink>
                <NavLink to={'/services'} className='sidebar-option' >
                    <img src={add} alt="" className='sidebar-icon' />
                    <p>Services</p>
                </NavLink>
                <NavLink to={'/tours'} className='sidebar-option'>
                    <img src={add} alt="" className='sidebar-icon' />
                    <p>Tours</p>
                </NavLink>
                <NavLink to={'/notifications'} className='sidebar-option'>
                    <img src={add} alt="" className='sidebar-icon' />
                    <p>Notifications</p>
                </NavLink>
            </div>
        </div>
    )
}

export default Sidebar