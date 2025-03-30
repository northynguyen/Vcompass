import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import "./Maptest.css"; // Import file CSS

const LOCATION = { lat: 10.3465, lng: 107.0843 }; // Toạ độ Vũng Tàu
const SEARCH_RADIUS = 5000; // Bán kính tìm kiếm (mét)
const PLACE_TYPES = ["lodging", "restaurant", "tourist_attraction"]; // Loại địa điểm

const MapTest = () => {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: API_KEY });
  const [places, setPlaces] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
          {
            params: {
              location: `${LOCATION.lat},${LOCATION.lng}`,
              radius: SEARCH_RADIUS,
              type: PLACE_TYPES.join("|"),
              key: API_KEY,
            },
          }
        );
        setPlaces(response.data.results);
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };

    fetchPlaces();
  }, []);

  const nextPlace = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % places.length);
    setSelectedPlace(places[(currentIndex + 1) % places.length]);
  };

  const prevPlace = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? places.length - 1 : prevIndex - 1
    );
    setSelectedPlace(places[currentIndex === 0 ? places.length - 1 : currentIndex - 1]);
  };

  if (!isLoaded) return <p>Loading Maps...</p>;

  return (
    <div className="container">
      <h2>📍 Danh sách địa điểm</h2>

      {places.length > 0 && (
        <div className="details-card">
          <h3>{places[currentIndex].name}</h3>
          <p><strong>Địa chỉ:</strong> {places[currentIndex].vicinity || "N/A"}</p>
          <p><strong>Đánh giá:</strong> {places[currentIndex].rating || "Chưa có"} / 5 ⭐</p>
          <p><strong>Số lượng đánh giá:</strong> {places[currentIndex].user_ratings_total || 0}</p>
          {places[currentIndex].photos && (
            <img
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${places[currentIndex].photos[0].photo_reference}&key=${API_KEY}`}
              alt={places[currentIndex].name}
            />
          )}
          <div className="nav-buttons">
            <button onClick={prevPlace}>◀ Trước</button>
            <button onClick={nextPlace}>Tiếp ▶</button>
          </div>
        </div>
      )}

      <GoogleMap
        center={LOCATION}
        zoom={14}
        mapContainerStyle={{ height: "500px", width: "100%", borderRadius: "10px" }}
      >
        {places.map((place, index) => (
          <Marker
            key={index}
            position={{
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            }}
            label={{ text: (index + 1).toString(), color: "white" }}
            onClick={() => setSelectedPlace(place)}
          />
        ))}

        {selectedPlace && (
          <InfoWindow
            position={{
              lat: selectedPlace.geometry.location.lat,
              lng: selectedPlace.geometry.location.lng,
            }}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div>
              <h4>{selectedPlace.name}</h4>
              <p>{selectedPlace.vicinity}</p>
              <p>Đánh giá: {selectedPlace.rating || "Chưa có"} / 5 ⭐</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapTest ;
