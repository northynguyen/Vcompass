import React from 'react';

const OperatingHoursEditor = ({ operatingHours, onOperatingHourChange, onAddOperatingHour, onRemoveOperatingHour }) => {
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
        <div className="operating-hours-edit-section">
            <h2>Giờ Mở Cửa</h2>
            {operatingHours.map((oh, index) => (
                <div key={index} className="operating-hours-entry">
                    <div className="operating-hours-fields">
                        <label htmlFor={`startDay-${index}`}>Từ:</label>
                        <select
                            id={`startDay-${index}`}
                            value={oh.startDay}
                            onChange={(e) => onOperatingHourChange(index, 'startDay', e.target.value)}
                            className="day-select"
                        >
                            {daysOfWeek.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>

                        <label htmlFor={`endDay-${index}`}>Đến:</label>
                        <select
                            id={`endDay-${index}`}
                            value={oh.endDay}
                            onChange={(e) => onOperatingHourChange(index, 'endDay', e.target.value)}
                            className="day-select"
                        >
                            {daysOfWeek.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>

                        <label htmlFor={`openTime-${index}`}>Mở cửa:</label>
                        <input
                            id={`openTime-${index}`}
                            type="time"
                            value={oh.openTime}
                            onChange={(e) => onOperatingHourChange(index, 'openTime', e.target.value)}
                            className="time-input"
                            step="1800"
                        />

                        <label htmlFor={`closeTime-${index}`}>Đóng cửa:</label>
                        <input
                            id={`closeTime-${index}`}
                            type="time"
                            value={oh.closeTime}
                            onChange={(e) => onOperatingHourChange(index, 'closeTime', e.target.value)}
                            className="time-input"
                            step="1800"
                        />
                    </div>
                    <button type="button" onClick={() => onRemoveOperatingHour(index)} className="remove-oh-button">Xóa</button>
                </div>
            ))}
            <button type="button" onClick={onAddOperatingHour} className="add-oh-button">Thêm Giờ Mở Cửa</button>
        </div>
    );
};



export default OperatingHoursEditor;
