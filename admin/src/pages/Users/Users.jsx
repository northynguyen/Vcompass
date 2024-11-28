// Users.js
import React, { useState, useEffect, useContext } from 'react';
import ProfileCards from '../../components/ProfileCards/ProfileCards';
import './Users.css';
import { StoreContext } from '../../Context/StoreContext';

const Users = () => {
    const [users, setUsers] = useState([]);
    const { url } = useContext(StoreContext);

    useEffect(() => {
        // Fetch users from the API
        fetch(`${url}/api/user/users/`)
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));
    }, [url]);

    return (
        <div className="users-container">
            {users.map((user, index) => (
                <ProfileCards
                    key={index}
                    profile={user} // Pass user as profile
                    type="user" // Specify type as user
                />
            ))}
        </div>
    );
};

export default Users;
