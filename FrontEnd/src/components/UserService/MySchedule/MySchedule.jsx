/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import './MySchedule.css';
const MySchedule = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const schedules = [
        {
            id: 1,
            event: "Business Trip to Hanoi",
            date: "12th Oct 2024",
            createdDate: "1st Sept 2024",
            updatedDate: "5th Oct 2024",
            tripName: "Hanoi Business Trip",
            location: "Hanoi, Vietnam",
            totalPrice: "500 USD",
            imageUrl: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/554285992.jpg?k=42ea853b3e50553ddd67a58ac0baa8a1e7a9cec501bb3c91560dcd605b946b33&o=&hp=1" // Thay đổi thành URL hình ảnh thực tế
        },
        {
            id: 2,
            event: "Vacation to Phu Quoc",
            date: "25th Dec 2024",
            createdDate: "10th Oct 2024",
            updatedDate: "15th Oct 2024",
            tripName: "Phu Quoc Vacation",
            location: "Phu Quoc, Vietnam",
            totalPrice: "800 USD",
            imageUrl: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/582408500.jpg?k=166f1c3a899a6721f0338314285cd85901c7654eb7f96e3813dba7a0f62c97ff&o=&hp=1" // Thay đổi thành URL hình ảnh thực tế
        }
    ];

    // Lọc các lịch trình theo từ tìm kiếm
    const filteredSchedules = schedules.filter(schedule =>
        schedule.tripName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="my-schedule">
            <h2>My Schedule</h2>
            <input
                type="text"
                placeholder="Search by trip name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            {filteredSchedules.length === 0 ? (
                <p>No schedules found.</p>
            ) : (
                filteredSchedules.map(schedule => (
                    <div key={schedule.id} className="schedule-item">
                        <div className="schedule-details">
                            <h3>{schedule.tripName}</h3>
                            <p><strong>Event:</strong> {schedule.event}</p>
                            <p><strong>Date:</strong> {schedule.date}</p>
                            <p><strong>Created Date:</strong> {schedule.createdDate}</p>
                            <p><strong>Last Updated:</strong> {schedule.updatedDate}</p>
                            <p><strong>Location:</strong> {schedule.location}</p>
                            <p><strong>Total Price:</strong> {schedule.totalPrice}</p>
                            <div className="schedule-buttons">
                                <button className="details-btn">View Details</button>
                                <button className="edit-btn">Edit</button>
                                <button className="share-btn">Share</button>
                            </div>
                        </div>
                        <img src={schedule.imageUrl} alt={schedule.tripName} className="trip-image" />
                    </div>
                ))
            )}
        </div>
    );
};

export default MySchedule;
