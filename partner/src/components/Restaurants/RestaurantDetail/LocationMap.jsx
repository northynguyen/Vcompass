import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const redIcon = new L.Icon({
    iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-location-icon-download-in-svg-png-gif-file-formats--marker-pointer-map-pin-navigation-finance-and-economy-pack-business-icons-2561454.png?f=webp&w=256',
    iconSize: [41, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const LocationMap = ({ formData, setFormData, searchQuery, setSearchQuery, searchResults, setSearchResults, mapRef }) => {
    const getAddressFromCoords = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error(error);
            alert('Error fetching address. Please try again.');
            return '';
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const address = await getAddressFromCoords(latitude, longitude);
                setFormData(prevData => ({
                    ...prevData,
                    location: {
                        ...prevData.location,
                        latitude,
                        longitude,
                        address
                    }
                }));
                if (mapRef.current) {
                    mapRef.current.flyTo([latitude, longitude], 20);
                }
            }, (error) => {
                console.error(error);
                alert('Unable to retrieve your location.');
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleLocationSearch = async (e) => {
        e.preventDefault();
        if (searchQuery) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json`);
                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error(error);
                alert('Error searching for location. Please try again.');
            }
        }
    };

    const handleLocationSelect = (lat, lon, address) => {
        setFormData(prevData => ({
            ...prevData,
            location: {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                address,
            }
        }));
        setSearchResults([]);
        setSearchQuery(address);
        if (mapRef.current) {
            mapRef.current.flyTo([lat, lon], 20);
        }
    };

    const LocationMarker = () => {
        useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                const address = await getAddressFromCoords(lat, lng);

                setFormData(prevData => ({
                    ...prevData,
                    location: {
                        latitude: lat,
                        longitude: lng,
                        address
                    }
                }));

                const map = e.target;
                map.flyTo([lat, lng], 15);
            },
        });

        return (
            <Marker position={[formData.location.latitude, formData.location.longitude]} icon={redIcon} />
        );
    };

    return (
        <div>
            <h2>Vị trí</h2>
            <p>Địa chỉ:
                <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.location.address}
                    onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        location: { ...prevData.location, address: e.target.value }
                    }))}
                    className="edit-input"
                />
            </p>
            <p>Tọa độ:
                <input
                    type="number"
                    name="latitude"
                    value={formData.location.latitude}
                    onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        location: { ...prevData.location, latitude: parseFloat(e.target.value) || 0 }
                    }))}
                    className="edit-input-small"
                    step="0.000001"
                /> ,
                <input
                    type="number"
                    name="longitude"
                    value={formData.location.longitude}
                    onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        location: { ...prevData.location, longitude: parseFloat(e.target.value) || 0 }
                    }))}
                    className="edit-input-small"
                    step="0.000001"
                />
            </p>

            <form onSubmit={handleLocationSearch} className="location-search-form">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm địa điểm"
                    className="location-search-input"
                />
                <button type="submit">Tìm</button>
            </form>

            {searchResults.length > 0 && (
                <ul className="location-search-results">
                    {searchResults.map((result, index) => (
                        <li key={index} onClick={() => handleLocationSelect(result.lat, result.lon, result.display_name)}>
                            {result.display_name}
                        </li>
                    ))}
                </ul>
            )}

            <button type="button" onClick={getCurrentLocation} className="current-location-button">
                Sử dụng vị trí hiện tại
            </button>

            <MapContainer
                center={[formData.location.latitude, formData.location.longitude]}
                zoom={15}
                style={{ width: '100%', height: '500px' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
            </MapContainer>
        </div>
    );
};

LocationMap.propTypes = {
    formData: PropTypes.object.isRequired,
    setFormData: PropTypes.func.isRequired,
    searchQuery: PropTypes.string.isRequired,
    setSearchQuery: PropTypes.func.isRequired,
    searchResults: PropTypes.array.isRequired,
    setSearchResults: PropTypes.func.isRequired,
    mapRef: PropTypes.object.isRequired,
};

export default LocationMap;
