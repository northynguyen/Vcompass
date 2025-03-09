// Users.js
import React, { useState, useEffect, useContext } from 'react';
import ProfileCards from '../../components/ProfileCards/ProfileCards';
import './Users.css';
import { StoreContext } from '../../Context/StoreContext';
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

    const filteredUsers = searchTerm
        ? users.filter(user =>
            user.name?.toLowerCase() === searchTerm.toLowerCase()
        )
        : users;




    return (
        <div className="users-container1">
            <input
                type="text"
                placeholder="Search by profile name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            <div className="users-container">
                {filteredUsers.map((user, index) => (
                    <ProfileCards
                        key={index}
                        profile={user} // Pass user as profile
                        type="user" // Specify type as user
                    />
                ))}
            </div>
        </div>
    );
};



export default Users;

