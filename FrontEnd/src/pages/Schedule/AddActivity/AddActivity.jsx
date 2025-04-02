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

// Component to recenter map when coordinates change
const MapCenterSetter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

MapCenterSetter.propTypes = {
  center: PropTypes.array
};

const OtherItem = ({ setCurDes, curDes }) => {
  const [activityName, setActivityName] = useState(curDes?.name || "");
  const [images, setImages] = useState(
    curDes?.imgSrc?.map((img) => (typeof img === "string" ? img : URL.createObjectURL(img))) || []
  );
  const [address, setAddress] = useState(curDes?.address || "");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { url } = useContext(StoreContext);

  // Hàm tìm kiếm địa chỉ
  const handleSearchAddress = async () => {
    if (!address) return;

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`
      );
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm địa chỉ:", error);
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

  const handleRemoveImage = async (index) => {
    const imgToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);

    setImages(newImages);
    setCurDes((prev) => ({
      ...prev,
      imgSrc: prev?.imgSrc?.filter((_, i) => i !== index),
    }));

    if (!imgToRemove.startsWith("blob:")) {
      try {
        await axios.delete(`${url}/api/deleteImage`, {
          data: { imagePath: imgToRemove },
        });
        console.log(`Đã xóa ảnh: ${imgToRemove}`);
      } catch (error) {
        console.error("Lỗi khi xóa ảnh:", error);
      }
    }
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
                src={img.startsWith("blob:") ? img : `${url}/images/${img}`}
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
    setCurDes(null);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Kiểm tra nếu có ảnh mới
      if (curDes?.imgSrc && curDes.imgSrc.length > 0) {
        curDes.imgSrc.forEach((file) => {
          if (file instanceof File) {
            formData.append("images", file); // 'images' là key backend mong đợi
          }
        });
      }

      // Gửi ảnh lên server nếu có
      if (formData.has("images")) {
        const uploadResponse = await axios.post(`${url}/api/schedule/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (uploadResponse.data.success) {
          console.log("Thanh công khi upload ảnh:", uploadResponse.data);
          curDes.imgSrc = (uploadResponse.data.files || []).map((file) => file.filename);
        } else {
          console.error("Lỗi khi upload ảnh:", uploadResponse.data.message);
        }
      }

      // Chuẩn bị dữ liệu activity mới
      const newActivity = {
        activityType: curDes?.activityType || "Other",
        idDestination: curDes?._id || uuidv4(),
        address: curDes.address || "default-address",
        imgSrc: curDes.imgSrc || ["default-image"],
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
                    <button className="back-btn" onClick={handleBack}>
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
                    />
                  </div>
                  
                  <div className="modal-footer">
                    <button className="save-btn" onClick={handleSave}>Lưu</button>
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

// New component for displaying multiple locations on map
const LocationsMapView = ({ locations, selectedLocation, onSelectLocation }) => {
  const defaultPosition = [10.762622, 106.660172]; // Ho Chi Minh City coordinates
  const mapCenter = selectedLocation?.location?.latitude && selectedLocation?.location?.longitude 
    ? [selectedLocation.location.latitude, selectedLocation.location.longitude] 
    : selectedLocation?.latitude && selectedLocation?.longitude
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : defaultPosition;
  
  const handleMarkerClick = (location) => {
    onSelectLocation(location);
  };

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

const FormAddActivity = ({ images, cost, setCost, description, setDescription, option, costDes, setCostDes, curDes }) => {
  const { url } = useContext(StoreContext);
  
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
            <input className="input-field"
              id="name-expense" required
              name="name"
              placeholder="Nhập tên chi phí"
              value={costDes}
              onChange={(e) => setCostDes(e.target.value)}
            />
            <label className="expense-sub-title" htmlFor="des">Chi phí</label>
            <input className="input-field"
              id="name-expense" required
              name="name"
              placeholder="Nhập chi phí"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <label className="expense-sub-title" htmlFor="des">Ghi chú</label>
            <textarea
              placeholder="Nhập ghi chú chi tiết"
              className="input-field" id="des"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
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
  curDes: PropTypes.object
};

export default AddActivity;
