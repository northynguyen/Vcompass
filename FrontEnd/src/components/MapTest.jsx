import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

const API_KEY = "AlzaSyRfs_BZB8uC9kjZwRvrNkMjQq_eSW8Hqmj"; // Thay bằng API Key của bạn
const LOCATION = { lat: 10.3465, lon: 107.0843 }; // Toạ độ Vũng Tàu
const SEARCH_RADIUS = 5000; // Bán kính tìm kiếm (mét)
const PLACE_TYPES = [  "restaurants", "hotels", "attractions" ]; // Loại địa điểm

const MapWithPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const mapRef = useRef(null);

  // Custom Icon for markers (Số thứ tự 1,2,3,...)
  const getMarkerIcon = (index) =>
    L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color:red;color:white;width:24px;height:24px;border-radius:50%;display:flex;justify-content:center;align-items:center;font-weight:bold;">
               ${index + 1}
             </div>`,
      iconSize: [24, 24],
    });

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const results = await Promise.all(
          PLACE_TYPES.map(async (type) => {
            const response = await axios.get(
              `https://maps.gomaps.pro/maps/api/place/nearbysearch/json`,
              {
                params: {
                  location: `${LOCATION.lat},${LOCATION.lon}`,
                  radius: SEARCH_RADIUS,
                    keyword: type,               
                  key: API_KEY,
                },
              }
            );
            return response.data.results;
          })
        );
        const allPlaces = results.flat();
        console.log("All places:", allPlaces);
        setPlaces(allPlaces);
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };

    fetchPlaces();
  }, []);

  // Xử lý sự kiện lăn chuột để thay đổi địa điểm hiện tại
  useEffect(() => {
    const handleScroll = (event) => {
      if (event.deltaY > 0) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % places.length);
      } else {
        setCurrentIndex((prevIndex) =>
          prevIndex === 0 ? places.length - 1 : prevIndex - 1
        );
      }
    };

    window.addEventListener("wheel", handleScroll);
    return () => window.removeEventListener("wheel", handleScroll);
  }, [places]);

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>📍 Danh sách địa điểm</h2>
      {places.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <h3>{places[currentIndex].name}</h3>
          <p>{places[currentIndex].vicinity}</p>
          <p>{places[currentIndex].rating}</p>
          <p>{places[currentIndex].types.join(", ")}</p>
          {places[currentIndex].opening_hours && (
            <p>
              Giờ mở cửa:{" "}
              {places[currentIndex].opening_hours.open_now ? "Đang mở cửa" : "Đã đóng cửa"}
            </p>
          )}

          {places[currentIndex].photos && (
            <img
              src={`https://maps.gomaps.pro/maps/api/place/photo?maxwidth=400&photoreference=${places[currentIndex].photos[0].photo_reference}&key=AlzaSyRfs_BZB8uC9kjZwRvrNkMjQq_eSW8Hqmj`}
              alt={places[currentIndex].name}
              style={{ width: "100%", height: "auto", borderRadius: "10px" }}
            />
          )}

          {places[currentIndex].website && (
            <a
              href={places[currentIndex].website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
          )}
          
         
        </div>
      )}

      <MapContainer
        center={[LOCATION.lat, LOCATION.lon]}
        zoom={14}
        style={{ height: "500px", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {places.map((place, index) => (
          <Marker
            key={index}
            position={[place.geometry.location.lat, place.geometry.location.lng]}
            icon={getMarkerIcon(index)}
          >
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.vicinity}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapWithPlaces;
