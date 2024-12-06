import React from 'react';
import PropTypes from 'prop-types';

const AmenitiesEditor = ({ availableAmenities, selectedAmenities, onAmenitiesChange }) => (
    <div>
        <h2>Tiện nghi</h2>
        <div className="amenities-edit">
            {availableAmenities.map((amenity, index) => (
                <label key={index} className="amenity-option">
                    <input
                        type="checkbox"
                        value={amenity}
                        checked={selectedAmenities.includes(amenity)}
                        onChange={onAmenitiesChange}
                    />
                    {amenity}
                </label>
            ))}
        </div>
    </div>
);

AmenitiesEditor.propTypes = {
    availableAmenities: PropTypes.array.isRequired,
    selectedAmenities: PropTypes.array.isRequired,
    onAmenitiesChange: PropTypes.func.isRequired,
};

export default AmenitiesEditor;
