import React, { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { v4 as uuidv4 } from 'uuid';
import { StoreContext } from "../../../Context/StoreContext";
import ListAccommodation, { AccomItem } from "../../ListAccommodation/ListAccommodation";
import ListAttractions, { AttractionItem } from "../../ListAttractions/ListAttractions";
import ListFoodServices, { FoodServiceItem } from "../../ListFoodServices/ListFoodServices";
import "./AddActivity.css";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PropTypes from 'prop-types';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

Modal.setAppElement("#root");


const OtherItem = ({ setCurDes, curDes }) => {
  const [activityName, setActivityName] = useState(curDes?.name || "");
  const [images, setImages] = useState(
    curDes?.imgSrc?.map((img) => {
      if (typeof img === "string") {
        return img;
      } else if (img instanceof File) {
        return URL.createObjectURL(img);
      }
      return "";
    }) || []
  );
  const [address, setAddress] = useState(curDes?.address || "");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { url } = useContext(StoreContext);

  // Hàm tìm kiếm địa chỉ
  const handleSearchAddress = async () => {
    if (!address?.trim()) return;
  
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: address,
          format: "json",
          addressdetails: 1, // lấy chi tiết địa chỉ
          limit: 5,           // giới hạn số kết quả
        },
        headers: {
          'Accept-Language': 'vi', // ưu tiên tiếng Việt
          'User-Agent': 'Vcompass/1.0 (vcompass@gmail.com)' // bắt buộc theo chính sách Nominatim
        },
      });
  
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm địa chỉ (Nominatim):", error);
    }
  };
  

  // Hàm chọn địa chỉ từ danh sách gợi ý
  const handleSelectAddress = (selected) => {
    setAddress(selected.display_name);
    setShowResults(false);

    // Cập nhật thông tin địa chỉ và tọa độ vào curDes
    setCurDes((prev) => ({
      ...prev,
     
      location: {
        latitude: parseFloat(selected.lat),
        longitude: parseFloat(selected.lon),
        address: selected.display_name,
      }
     
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newImages = files.map((file) => URL.createObjectURL(file));

    setImages((prevImages) => [...prevImages, ...newImages]);
    setCurDes((prev) => ({
      ...prev,
      imgSrc: [
        ...(prev?.imgSrc || []),
        ...files
      ],
    }));
  };

  const deleteOldMedia = async (media) => {
    if (media && media.length > 0) {
      try {
        console.log("Media to delete:", media);
        // Extract public_id from Cloudinary URL
        const extractPublicId = (url) => {
          if (!url) return null;
          // Cloudinary URL pattern: .../upload/v1234567890/folder_name/public_id.extension
          const matches = url.match(/\/upload\/v\d+\/(.+?)\.\w+$/);
          if (matches && matches[1]) {
            // Remove any folder prefix if present
            const parts = matches[1].split('/');
            return parts[parts.length - 1];
          }
          return null;
        };

        const publicId = extractPublicId(media);
        console.log("Extracted public_id:", publicId);

        if (!publicId) {
          console.error("Could not extract public_id from URL:", media);
          return;
        }

        const response = await axios.delete(`${url}/api/videos/delete-image`, {
          data: { imagePath: publicId },
        });

        if (response.data.success) {
          console.log("Deleted old media successfully:", response.data);
        } else {
          console.error("Error deleting old media:", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting old media:", error);
      }
    }
  };
  const handleRemoveImage = async (index) => {
    // const imgToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);

    setImages(newImages);
    setCurDes((prev) => ({
      ...prev,
      imgSrc: prev?.imgSrc?.filter((_, i) => i !== index),
    }));

    deleteOldMedia(images[index]);
  };

  useEffect(() => {
    // Cập nhật curDes khi có thay đổi
    setCurDes(prev => ({
      ...prev,
      name: activityName,
      address: address,
      activityType: "Other"
    }));
  }, [activityName, address, setCurDes]);

  return (
    <div className="other-item-container">
      <div className="form-group">
        <label htmlFor="activity-name">Tên hoạt động:</label>
        <input
          type="text"
          id="activity-name"
          className="input-field"
          placeholder="Nhập tên hoạt động"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="activity-address">Địa chỉ:</label>
        <div className="address-input-group">
          <input
            type="text"
            id="activity-address"
            className="input-field"
            placeholder="Nhập địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button type="button" className="search-btn" onClick={handleSearchAddress}>
            Tìm kiếm
          </button>
        </div>
        {showResults && (
          <ul className="search-results">
            {searchResults.map((result, index) => (
              <li key={index} onClick={() => handleSelectAddress(result)}>
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="activity-images">Thêm ảnh (tối đa 3 ảnh):</label>
        <input
          type="file"
          id="activity-images"
          className="input-field"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <div className="image-preview-container">
        {images &&
          images.map((img, index) => (
            <div key={index} className="image-preview">
              <img
                src={img.startsWith("blob:") ? img : img.includes("http") ? img : `${url}/images/${img}`}
                alt={`Upload ${index + 1}`}
              />
              <button className="remove-btn" onClick={() => handleRemoveImage(index)}>
                &times;
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

OtherItem.propTypes = {
  setCurDes: PropTypes.func.isRequired,
  curDes: PropTypes.object
};

const Header = ({ option, setOption, setCurDes }) => {
  const onChange = (value) => {
    setOption(value)
    setCurDes(null)
  }

  return (
    <div className="header-accom">
      <div className="header-left">
        <h1 className="num-title">Bạn muốn làm gì?</h1>
        <span className="num-text">Chọn hoạt động</span>
      </div>
      <div className="header-right">
        <label htmlFor="sort-by">Loại hoạt động</label>
        <select
          id="sort-by"
          value={option}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Accommodation">Nghỉ ngơi</option>
          <option value="FoodService">Ăn uống</option>
          <option value="Attraction">Tham quan</option>
          <option value="Other">Hoạt động Khác</option>
        </select>
      </div>
    </div>
  );
};

Header.propTypes = {
  option: PropTypes.string.isRequired,
  setOption: PropTypes.func.isRequired,
  setCurDes: PropTypes.func.isRequired
};

const AddActivity = ({ isOpen, closeModal, currentDay, destination, setInforSchedule, activity, city, socket, inforSchedule }) => {
  const [option, setOption] = React.useState("Accommodation");
  const [choice, setChoice] = React.useState("List");
  const [cost, setCost] = React.useState("")
  const [costDes, setCostDes] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [curDes, setCurDes] = React.useState(null)
  const [locations, setLocations] = useState([]);
  const { url } = useContext(StoreContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [listData, setListData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [errors, setErrors] = useState({
    costName: false,
    cost: false,
    description: false
  });


  useEffect(() => {
    if (isOpen) {
      if (activity) {
        setCurDes(destination)
        setCost(activity.cost)
        setCostDes(activity.costDescription)
        setDescription(activity.description)
      } else {
        setCurDes(null);
        setCostDes("")
        setCost("")
        setDescription("")
      }
      setOption(activity ? activity.activityType : "Accommodation");
    }
  }, [isOpen, activity, destination]);

  useEffect(() => {
    if (listData.length > 0) {
      const locationData = listData.map(item => {
        let latitude, longitude;
        console.log(item);
        if (option === 'Accommodation') {
      
          latitude = item.location?.latitude;
          longitude = item.location?.longitude;
         
        } else if (option === 'FoodService') {
         
          latitude = item.location?.latitude;
          longitude = item.location?.longitude;
         
        } else if (option === 'Attraction') {
         
          latitude = item.location?.latitude;
          longitude = item.location?.longitude;
          
        }
        
        return {
          latitude,
          longitude,
        };
      });
      
      setLocations(locationData.filter(loc => loc.latitude && loc.longitude));
    }
  }, [ listData, option]);

  const handleBack = () => {
    setErrors({
      costName: false,
      cost: false,
      description: false
    });
    setCostDes("");
    setCost("");
    setDescription("");
    setCurDes(null);
  };

  const handleSave = async () => {
    try {
      // Kiểm tra các trường bắt buộc
      const newErrors = {
        costName: !costDes.trim(),
        cost: !cost.trim(),
        description: !description.trim()
      };
      
      setErrors(newErrors);
      
      // Focus vào input đầu tiên có lỗi
      if (newErrors.costName) {
        document.getElementById('name-expense').focus();
        return;
      } else if (newErrors.cost) {
        document.getElementById('expense').focus();
        return;
      } else if (newErrors.description) {
        document.getElementById('des').focus();
        return;
      }

      const formData = new FormData();

      // Kiểm tra nếu có ảnh mới
      if (curDes?.imgSrc && curDes.imgSrc.length > 0) {
        console.log("Files to upload:", curDes.imgSrc);
        let fileCount = 0;
        curDes.imgSrc.forEach((file) => {
          if (file instanceof File) {
            console.log("Appending file:", file.name, file.type, file.size);
            formData.append('files', file);
            fileCount++;
          } else if (typeof file === 'string') {
            console.log("Skipping existing URL:", file);
          }
        });
        console.log("Total files to upload:", fileCount);
      }

      // Gửi ảnh lên server nếu có
      if (formData.has("files")) {
        try {
          setIsUploading(true);
          console.log("FormData contents:", Array.from(formData.entries()));
          console.log("Sending upload request...");
          const uploadResponse = await axios.post(`${url}/api/schedule/images/upload/new`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          console.log("Upload response:", uploadResponse.data);

          if (uploadResponse.data.success) {
            console.log("Upload successful:", uploadResponse.data);
            // Combine existing string URLs with newly uploaded files
            const existingUrls = curDes.imgSrc.filter(img => typeof img === 'string');
            const newFiles = (uploadResponse.data.files || []).map(file => file.path);
            console.log("Existing URLs:", existingUrls);
            console.log("New files:", newFiles);
            curDes.imgSrc = [...existingUrls, ...newFiles];
          } else {
            console.error("Upload failed:", uploadResponse.data.message);
            throw new Error(uploadResponse.data.message || "Upload failed");
          }
        } catch (uploadError) {
          console.error("Error during upload:", uploadError);
          if (uploadError.response) {
            console.error("Response data:", uploadError.response.data);
            console.error("Response status:", uploadError.response.status);
            console.error("Response headers:", uploadError.response.headers);
          }
          throw uploadError;
        } finally {
          setIsUploading(false);
        }
      }

      // Chuẩn bị dữ liệu activity mới
      const newActivity = {
        activityType: curDes?.activityType || "Other",
        idDestination: curDes?._id || uuidv4(),
        address: curDes.address || "default-address",
        imgSrc: curDes.imgSrc ? curDes.imgSrc.filter(img => typeof img === 'string') : ["default-image"],
        name: curDes.name || "default-name",
        cost: parseInt(cost) || 0,
        costDescription: costDes ? costDes : "",
        description: description,
        timeStart: activity ? activity.timeStart : "00:00",
        timeEnd: activity ? activity.timeEnd : "00:30",
        latitude: curDes.latitude || 0,
        longitude: curDes.longitude || 0,
      };

      // Cập nhật activity trong schedule
      setInforSchedule((prevSchedule) => {
        const updatedActivities = prevSchedule.activities.map((day) => {
          if (day.day === currentDay) {
            if (activity) {
              const existingActivityIndex = day.activity.findIndex(
                (act) => act._id === activity._id
              );
              const updatedActivitiesList =
                existingActivityIndex !== -1
                  ? [
                    ...day.activity.slice(0, existingActivityIndex),
                    { ...day.activity[existingActivityIndex], ...newActivity },
                    ...day.activity.slice(existingActivityIndex + 1),
                  ]
                  : day.activity;
              return { ...day, activity: updatedActivitiesList };
            } else {
              return { ...day, activity: [...day.activity, newActivity] };
            }
          }
          return day;
        });

        const newSchedule = {
          ...prevSchedule,
          activities: updatedActivities
        };

        // Emit sự kiện để update real-time
        if (socket?.current) {
          socket.current.emit('updateActivities', {
            scheduleId: inforSchedule._id,
            activities: updatedActivities
          });
        }

        return newSchedule;
      });

      closeModal();
    } catch (error) {
      console.error("Lỗi khi lưu activity:", error);
    }
  };

  const handlePrevImage = () => {
    if (curDes?.images?.length) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? curDes.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (curDes?.images?.length) {
      setCurrentImageIndex((prev) => 
        prev === curDes.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="add-activity-modal"
      overlayClassName="modal-overlay"
    >
      <div className="add-activity split-layout">
        <div className="modal-header">
          <h2>Thêm mới hoạt động</h2>
          <button onClick={closeModal} className="close-btn">
            <i className="fa-regular fa-circle-xmark"></i>
          </button>
        </div>
        {(!curDes || (option === "Other" && !curDes?.name)) && ( 
           <div className="search-filter-bar">
           <div className="filter-row">
             <div className="filter-group">
               <label htmlFor="activity-type">Loại hoạt động</label>
               <select
                 id="activity-type"
                 value={option}
                 onChange={(e) => {
                   setOption(e.target.value);
                   setCurDes(null);
                 }}
               >
                 <option value="Accommodation">Nghỉ ngơi</option>
                 <option value="FoodService">Ăn uống</option>
                 <option value="Attraction">Tham quan</option>
                 <option value="Other">Hoạt động Khác</option>
               </select>
             </div>
             
             {option !== "Other" && (
               <div className="filter-group">
                 <label htmlFor="list-type">Chọn từ</label>
                 <select
                   id="list-type"
                   value={choice}
                   onChange={(e) => setChoice(e.target.value)}
                 >
                   <option value="List">Danh sách</option>
                   <option value="WishList">WishList</option>
                 </select>
               </div>
             )}
           </div>
         </div>
        )}
       
        
        <div className="modal-content-container">
          {/* Left side - Original content */}
          <div className="modal-left-panel">
            <div className="modal-body">
              {!curDes && option !== "Other" ? (
                <div className="list-container">
                  {choice === "List" && (
                    <>
                      {option === "Attraction" && <ListAttractions status="Schedule" setCurDes={setCurDes} city={city} setListData={setListData} />}
                      {option === "Accommodation" && <ListAccommodation status="Schedule" setCurDes={setCurDes} city={city} setListData={setListData} />}
                      {option === "FoodService" && <ListFoodServices status="Schedule" setCurDes={setCurDes} city={city} setListData={setListData} />}
                    </>
                  )}

                  {choice === "WishList" && (
                    <>
                      {option === "Attraction" && <ListAttractions status="WishList" setCurDes={setCurDes} city={city} setListData={setListData} />}
                      {option === "Accommodation" && <ListAccommodation status="WishList" setCurDes={setCurDes} city={city} setListData={setListData} />}
                      {option === "FoodService" && <ListFoodServices status="WishList" setCurDes={setCurDes} city={city} setListData={setListData} />}
                    </>
                  )}
                </div>
              ) : (
                <div className="form-page">
                  {option !== "Other" && (
                    <button className="back-btn-add-activity" onClick={handleBack}>
                      <i className="fas fa-arrow-left"></i> Quay lại
                    </button>
                  )}
                  {option === "Other" && (
                    <OtherItem
                      setCurDes={setCurDes}
                      curDes={curDes}
                    />
                  )}
                  
                  {/* Destination Info Card */}
                  {option !== "Other" && curDes && (
                    <div className="destination-info">
                      <div className="destination-header">
                        <h4>{curDes.name}</h4>
                      </div>
                      <div className="destination-content">
                        {curDes.images && curDes.images.length > 0 && (
                          <div className="img-add-activity-container">
                            <button onClick={handlePrevImage} className="carousel-button">{"<"}</button>
                            <img
                              className="add-schedule-img"
                              src={`${url}/images/${curDes.images[currentImageIndex]}`}
                              alt={`${curDes.name}`}
                            />
                            <button onClick={handleNextImage} className="carousel-button">{">"}</button>
                          </div>
                        )}
                        
                        <div className="destination-details">
                          <div className="destination-detail-item">
                            <span className="detail-icon"><i className="fas fa-map-marker-alt"></i></span>
                            <span className="detail-text">{curDes.location?.address || curDes.address}</span>
                          </div>
                          {curDes.contact?.phone && (
                            <div className="destination-detail-item">
                              <span className="detail-icon"><i className="fas fa-phone"></i></span>
                              <span className="detail-text">{curDes.contact.phone}</span>
                            </div>
                          )}
                          {curDes.price && (
                            <div className="destination-detail-item">
                              <span className="detail-icon"><i className="fas fa-tag"></i></span>
                              <span className="detail-text">{curDes.price.toLocaleString()} VND</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="form-container-single">
                    <FormAddActivity
                      images={curDes?.images || null}
                      cost={cost}
                      setCost={setCost}
                      costDes={costDes}
                      setCostDes={setCostDes}
                      description={description}
                      setDescription={setDescription}
                      option={option}
                      curDes={curDes}
                      errors={errors}
                    />
                  </div>
                  
                  <div className="modal-footer">
                    <button 
                      className="save-btn" 
                      onClick={handleSave}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Đang tải lên...
                        </>
                      ) : (
                        "Lưu"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Map */}
          <div className="modal-right-panel">
            <h3>Vị trí trên bản đồ</h3>
            <LocationsMapView 
              locations={locations} 
              selectedLocation={curDes} 
              onSelectLocation={setCurDes} 
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

AddActivity.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  currentDay: PropTypes.number.isRequired,
  destination: PropTypes.object,
  setInforSchedule: PropTypes.func.isRequired,
  activity: PropTypes.object,
  city: PropTypes.string,
  socket: PropTypes.object,
  inforSchedule: PropTypes.object.isRequired
};

// Component to control the map zoom
const MapController = ({ locations, selectedLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    // Check if we have a red marker (selected location)
    const hasRedMarker = selectedLocation !== null;
    
    if (hasRedMarker) {
      // Zoom to the selected location
      const position = selectedLocation?.location?.latitude && selectedLocation?.location?.longitude 
        ? [selectedLocation.location.latitude, selectedLocation.location.longitude] 
        : selectedLocation?.latitude && selectedLocation?.longitude
        ? [selectedLocation.latitude, selectedLocation.longitude]
        : null;
      
      if (position) {
        map.setView(position, 15);
      }
    } else if (locations && locations.length > 0) {
      // No red marker, fit bounds to show all markers
      const bounds = L.latLngBounds([]);
      let hasValidLocations = false;
      
      locations.forEach(location => {
        if (location.latitude && location.longitude) {
          bounds.extend([location.latitude, location.longitude]);
          hasValidLocations = true;
        }
      });
      
      if (hasValidLocations) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, locations, selectedLocation]);
  
  return null;
};

MapController.propTypes = {
  locations: PropTypes.array,
  selectedLocation: PropTypes.object
};

// New component for displaying multiple locations on map
const LocationsMapView = ({ locations, selectedLocation, onSelectLocation }) => {
  const defaultPosition = [10.762622, 106.660172]; // Ho Chi Minh City coordinates
  const mapCenter = selectedLocation?.location?.latitude && selectedLocation?.location?.longitude 
    ? [selectedLocation.location.latitude, selectedLocation.location.longitude] 
    : selectedLocation?.latitude && selectedLocation?.longitude
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : defaultPosition;
  


  console.log("selectedLocation",selectedLocation);

  return (
    <div className="locations-map-container">
      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController locations={locations} selectedLocation={selectedLocation} />
      
        {locations && locations.length > 0 && locations.map((location, index) => {
          console.log(location);
          if (location.latitude && location.longitude) {
            const position = [location.latitude, location.longitude];
            const isSelected = selectedLocation && location && 
              (selectedLocation._id === location._id || 
              (selectedLocation.latitude === location.latitude && 
                selectedLocation.longitude === location.longitude));
            
            return (
              <Marker 
                key={location._id || index} 
                position={position}
                
                icon={isSelected ? 
                  new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  }) : 
                  new L.Icon.Default()
                }
              >
                <Popup 
                  autoPan={true}
                  closeButton={true}
                  closeOnClick={false}
                  keepInView={true}
                >
                  <div>
                    <strong>{location.name}</strong>
                    <p>{location.address}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
        
        {/* Display selected location if it's not from the locations array */}
        {selectedLocation && 
         selectedLocation.location &&
         selectedLocation.location.latitude && 
         selectedLocation.location.longitude && 
         !locations.find(loc => loc._id === selectedLocation._id) && (
          <Marker 
            position={[selectedLocation.location.latitude, selectedLocation.location.longitude]}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup 
              autoPan={true}
              closeButton={true}
              closeOnClick={false}
              keepInView={true}
            >
              <div>
                <strong>{selectedLocation.name || selectedLocation.foodServiceName || selectedLocation.attractionName}</strong>
                <p>{selectedLocation.location.address || "New Address"}</p>
                
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

LocationsMapView.propTypes = {
  locations: PropTypes.array,
  selectedLocation: PropTypes.object,
  onSelectLocation: PropTypes.func.isRequired
};

const FormAddActivity = ({ images, cost, setCost, description, setDescription, option, costDes, setCostDes, curDes, errors }) => {
  const { url } = useContext(StoreContext);
  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  const handleCostChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, ""); // Xoá dấu chấm cũ
    if (!/^\d*$/.test(rawValue)) return; // Chỉ chấp nhận số
  
    setCost(rawValue); // Lưu số gốc (không format)
  };
  
  return (
    <div className="form-container">
      <div className="destination-info">
        {option === "Accommodation" && curDes && (
          <AccomItem accommodation={curDes} />
        )}
        {option === "FoodService" && curDes && (
          <FoodServiceItem foodService={curDes} />
        )}
        {option === "Attraction" && curDes && (
          <AttractionItem attraction={curDes} />
        )}
      </div>

      <div className="form-group">
        <div className="info-container">
          <div className="title-container">
            <label className="expense-sub-title" htmlFor="name-expense">Tên chi phí</label>
            <input className={`input-field ${errors?.costName ? 'error-input' : ''}`}
              id="name-expense" required
              name="name"
              placeholder="Nhập tên chi phí"
              value={costDes}
              onChange={(e) => setCostDes(e.target.value)}
            />
            {errors?.costName && <span className="error-message-add">Vui lòng nhập tên chi phí.</span>}
            
            <label className="expense-sub-title" htmlFor="expense">Chi phí</label>
            <input
              className={`input-field ${errors?.cost ? 'error-input' : ''}`}
              id="expense"
              required
              name="name"
              placeholder="Nhập chi phí"
              value={formatNumber(cost)} // Hiển thị có format
              onChange={handleCostChange}
              type="text" // Phải dùng text để hiển thị dấu chấm
              inputMode="numeric" // Để vẫn hiện bàn phím số trên mobile
            />
            {errors?.cost && <span className="error-message-add ">Vui lòng nhập chi phí.</span>}
            
            <label className="expense-sub-title" htmlFor="des">Ghi chú</label>
            <textarea
              placeholder="Nhập ghi chú chi tiết"
              className={`input-field ${errors?.description ? 'error-input' : ''}`}
              id="des"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            {errors?.description && <span className="error-message-add ">Vui lòng nhập ghi chú.</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

FormAddActivity.propTypes = {
  images: PropTypes.array,
  cost: PropTypes.string.isRequired,
  setCost: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
  setDescription: PropTypes.func.isRequired,
  option: PropTypes.string.isRequired,
  costDes: PropTypes.string.isRequired,
  setCostDes: PropTypes.func.isRequired,
  curDes: PropTypes.object,
  errors: PropTypes.object
};

export default AddActivity;
