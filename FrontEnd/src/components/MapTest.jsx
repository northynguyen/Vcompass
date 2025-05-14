import { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import "./Maptest.css"; // Import file CSS

// QUAN TRỌNG: LỖI INVALIDKEYMAPerror
// Nếu bạn đang gặp lỗi "InvalidKeyMapError", hãy thực hiện các bước sau:
// 1. Truy cập Google Cloud Console: https://console.cloud.google.com/
// 2. Tạo một dự án mới hoặc chọn dự án hiện có
// 3. Bật các API sau:
//    - Maps JavaScript API
//    - Places API
// 4. Tạo API Key mới: API & Services > Credentials > Create Credentials > API Key
// 5. (Quan trọng) Đảm bảo rằng tài khoản Google Cloud của bạn đã bật Billing (ngay cả khi dùng Free Tier)
// 6. (Tùy chọn) Giới hạn API Key chỉ cho Maps JavaScript API và Places API
// 7. (Tùy chọn) Giới hạn địa chỉ HTTP Referrer cho tên miền của bạn (ví dụ: localhost:3000/*, yourdomain.com/*)
// 8. Thay thế API Key dưới đây bằng API Key mới của bạn

const LOCATION = { lat: 10.3465, lng: 107.0843 }; // Toạ độ Vũng Tàu
const SEARCH_RADIUS = 5000; // Bán kính tìm kiếm (mét)
const PLACE_TYPES = ["lodging", "restaurant", "tourist_attraction"]; // Loại địa điểm

const libraries = ["places"]; // Thêm thư viện Places API

const MapTest = () => {
  const { isLoaded, loadError } = useLoadScript({
    libraries,
  });

  const [places, setPlaces] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const placesServiceRef = useRef(null);

  useEffect(() => {
    if (!isLoaded) return;

    const initPlacesService = (map) => {
      // Initialize Places Service with the map
      const service = new window.google.maps.places.PlacesService(map);
      placesServiceRef.current = service;
      
      // Perform the search
      fetchNearbyPlaces();
    };

    const fetchNearbyPlaces = () => {
      if (!placesServiceRef.current) return;

      // Reset places array before new search
      setPlaces([]);

      // Search for places by type
      PLACE_TYPES.forEach(type => {
        const request = {
          location: new window.google.maps.LatLng(LOCATION.lat, LOCATION.lng),
          radius: SEARCH_RADIUS,
          type: type,
          rankBy: window.google.maps.places.RankBy.PROMINENCE, // Sắp xếp theo mức độ nổi bật
          fields: ['name', 'geometry', 'photos', 'rating', 'user_ratings_total', 'vicinity', 'place_id']
        };

        placesServiceRef.current.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            console.log(`Found ${results.length} ${type} places`);
            setPlaces(prevPlaces => {
              // Combine results but avoid duplicates based on place_id
              const newPlaces = [...prevPlaces];
              results.forEach(result => {
                if (!newPlaces.some(place => place.place_id === result.place_id)) {
                  newPlaces.push(result);
                }
              });
              return newPlaces;
            });
            setError(null);
          } else {
            console.error(`Places search failed for type ${type}: ${status}`);
            if (places.length === 0) {
              setError(`Không thể tải dữ liệu địa điểm loại ${type}. Vui lòng thử lại sau.`);
            }
          }
        });
      });
    };

    // We need to wait for the map to be loaded
    const onMapLoad = (map) => {
      mapRef.current = map;
      initPlacesService(map);
    };

    // If the map is already loaded, initialize the service
    if (mapRef.current) {
      initPlacesService(mapRef.current);
    } else {
      // Will be called when the map loads
      window.initMap = onMapLoad;
    }
  }, [isLoaded]);

  const nextPlace = () => {
    if (places.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % places.length);
    setSelectedPlace(places[(currentIndex + 1) % places.length]);
  };

  const prevPlace = () => {
    if (places.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? places.length - 1 : prevIndex - 1
    );
    setSelectedPlace(places[currentIndex === 0 ? places.length - 1 : currentIndex - 1]);
  };

  if (loadError) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>⚠️ Lỗi tải bản đồ</h2>
          <p>Không thể tải Google Maps. Vui lòng kiểm tra kết nối internet và thử lại.</p>
          <p>Chi tiết lỗi: {loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="container">
        <div className="loading-message">
          <h2>Đang tải bản đồ...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>📍 Danh sách địa điểm</h2>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {places.length > 0 && (
        <div className="details-card">
          <h3>{places[currentIndex].name}</h3>
          <p><strong>Địa chỉ:</strong> {places[currentIndex].vicinity || "N/A"}</p>
          <p><strong>Đánh giá:</strong> {places[currentIndex].rating || "Chưa có"} / 5 ⭐</p>
          <p><strong>Số lượng đánh giá:</strong> {places[currentIndex].user_ratings_total || 0}</p>
          {places[currentIndex].photos && places[currentIndex].photos.length > 0 && (
            <img
              src={places[currentIndex].photos[0].getUrl({ maxWidth: 400, maxHeight: 300 })}
              alt={places[currentIndex].name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x300?text=Không+có+ảnh';
              }}
            />
          )}
          <div className="nav-buttons">
            <button onClick={prevPlace}>◀ Trước</button>
            <span>{currentIndex + 1}/{places.length}</span>
            <button onClick={nextPlace}>Tiếp ▶</button>
          </div>
        </div>
      )}

      <div className="map-container">
        <GoogleMap
          center={LOCATION}
          zoom={14}
          mapContainerStyle={{ height: "100%", width: "100%", borderRadius: "12px" }}
          options={{
            styles: [
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#ffffff" }]
              },
              {
                featureType: "all",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#000000" }]
              }
            ]
          }}
          onLoad={(map) => {
            mapRef.current = map;
            if (window.google) {
              const service = new window.google.maps.places.PlacesService(map);
              placesServiceRef.current = service;
              
              // Perform the search for each place type
              PLACE_TYPES.forEach(type => {
                const request = {
                  location: new window.google.maps.LatLng(LOCATION.lat, LOCATION.lng),
                  radius: SEARCH_RADIUS,
                  type: type
                };

                service.nearbySearch(request, (results, status) => {
                  if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    setPlaces(prevPlaces => {
                      // Combine results but avoid duplicates based on place_id
                      const newPlaces = [...prevPlaces];
                      results.forEach(result => {
                        if (!newPlaces.some(place => place.place_id === result.place_id)) {
                          newPlaces.push(result);
                        }
                      });
                      return newPlaces;
                    });
                  }
                });
              });
            }
          }}
        >
          {places.map((place, index) => (
            <Marker
              key={place.place_id || index}
              position={{
                lat: typeof place.geometry.location.lat === 'function' 
                  ? place.geometry.location.lat() 
                  : place.geometry.location.lat,
                lng: typeof place.geometry.location.lng === 'function'
                  ? place.geometry.location.lng()
                  : place.geometry.location.lng
              }}
              label={{ text: (index + 1).toString(), color: "white" }}
              onClick={() => setSelectedPlace(place)}
            />
          ))}

          {selectedPlace && (
            <InfoWindow
              position={{
                lat: typeof selectedPlace.geometry.location.lat === 'function'
                  ? selectedPlace.geometry.location.lat()
                  : selectedPlace.geometry.location.lat,
                lng: typeof selectedPlace.geometry.location.lng === 'function'
                  ? selectedPlace.geometry.location.lng()
                  : selectedPlace.geometry.location.lng
              }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div>
                <h4>{selectedPlace.name}</h4>
                <p>{selectedPlace.vicinity}</p>
                <p>Đánh giá: {selectedPlace.rating || "Chưa có"} / 5 ⭐</p>
                {selectedPlace.photos && selectedPlace.photos.length > 0 && (
                  <img 
                    src={selectedPlace.photos[0].getUrl({ maxWidth: 200, maxHeight: 150 })}
                    alt={selectedPlace.name}
                    style={{ maxWidth: '100%', marginTop: '8px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                    }}
                  />
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default MapTest;
