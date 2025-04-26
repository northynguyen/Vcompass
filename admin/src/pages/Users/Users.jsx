// Users.js
import React, { useContext, useEffect, useState } from 'react';
import ProfileCards from '../../components/ProfileCards/ProfileCards';
import { StoreContext } from '../../Context/StoreContext';
import './Users.css';
const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { url } = useContext(StoreContext);

    useEffect(() => {
        // Fetch users from the API
        fetch(`${url}/api/user/users/`)
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));
    }, [url]);

    const filteredUsers = searchTerm?.trim()
        ? users.filter(user =>
            user.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
        )
        : users;

    return (
        <div className="users-container1">
            <h2 className="main-title">Quản lý người dùng</h2>
            <input
                type="text"
                placeholder="Tìm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            <div className="users-container">
                {filteredUsers.map((user, index) => (
                    <ProfileCards
                        key={index}
                        profile={user}
                        type="user"
                    />
                ))}
            </div>
        </div>
    );
};



export default Users;

