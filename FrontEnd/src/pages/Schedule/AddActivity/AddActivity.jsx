import React, { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import mongoose from "mongoose";
import { StoreContext } from "../../../Context/StoreContext";
import ListPlaces, { ListItem as PlaceItem } from "../../../components/ListPlaces";
import "./AddActivity.css";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";

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

// Add BookingsList component definition before its usage
const BookingsList = ({ bookings, onSelectBooking, selectedBooking }) => {
  return (
    <div className="bookings-list">
      {bookings.map((booking) => (
        <div
          key={booking._id}
          className={`booking-item ${selectedBooking?._id === booking._id ? 'selected' : ''}`}
        >
          <div className="booking-header">
            <h4>{booking.accommodationId?.name}</h4>
            <span className={`status ${booking.status}`}>{booking.status === 'confirmed' ? "Đã duyệt" : "Đang chờ duyệt" }</span>
          </div>
          <div className="booking-details">
            <p><i className="fas fa-calendar"></i> Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
            <p><i className="fas fa-calendar"></i> Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
            <p><i className="fas fa-users"></i> {booking.numberOfGuests.adult} người lớn, {booking.numberOfGuests.child} trẻ em</p>
            <p><i className="fas fa-money-bill"></i> {booking.totalAmount.toLocaleString()} VND</p>
            {booking.roomType && (
              <p><i className="fas fa-bed"></i> Loại phòng: {booking.roomType}</p>
            )}
          </div>
          <button 
            className="select-booking-btn"
            onClick={() => onSelectBooking(booking)}
          >
            Chọn
          </button>
        </div>
      ))}
    </div>
  );
};

BookingsList.propTypes = {
  bookings: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    accommodation: PropTypes.shape({
      name: PropTypes.string.isRequired
    }),
    status: PropTypes.string.isRequired,
    checkInDate: PropTypes.string.isRequired,
    checkOutDate: PropTypes.string.isRequired,
    numberOfGuests: PropTypes.shape({
      adult: PropTypes.number.isRequired,
      child: PropTypes.number.isRequired
    }).isRequired,
    totalAmount: PropTypes.number.isRequired
  })).isRequired,
  onSelectBooking: PropTypes.func.isRequired,
  selectedBooking: PropTypes.shape({
    _id: PropTypes.string.isRequired
  })
};

const AddActivity = ({ isOpen, closeModal, currentDay, destination, setInforSchedule, activity, city, socket, inforSchedule }) => {
  const [option, setOption] = React.useState("Accommodation");
  const [choice, setChoice] = React.useState("List");
  const [cost, setCost] = React.useState("")
  const [costDes, setCostDes] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [curDes, setCurDes] = React.useState(null)
  const [locations, setLocations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { url, getImageUrl, token } = useContext(StoreContext);
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
        console.log("curdes",destination)
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
    } else{
      setCurDes(null);
      setCostDes("")
      setCost("")
      setDescription("")
      setOption("Accommodation")
    }
  }, [isOpen, activity, destination]);

  // Clear listData when switching between List and WishList
  useEffect(() => {
    setListData([]);
    setLocations([]);
  }, [choice, option]);

  useEffect(() => {
    if (listData.length > 0) {
      const locationData = listData.map(item => {
        let latitude, longitude, name, address, rating, totalReviews;
        
        if (option === 'Accommodation') {
          latitude = item.location?.latitude;
          longitude = item.location?.longitude;
          name = item.name;
          address = item.location?.address;
        } else if (option === 'FoodService') {
          latitude = item.location?.latitude;
          longitude = item.location?.longitude;
          name = item.foodServiceName;
          address = item.location?.address;
        } else if (option === 'Attraction') {
          latitude = item.location?.latitude;
          longitude = item.location?.longitude;
          name = item.attractionName;
          address = item.location?.address;
        }

        // Calculate rating information
        if (item.ratings && item.ratings.length > 0) {
          const totalRating = item.ratings.reduce((sum, rating) => sum + (Number(rating.rate) || 0), 0);
          rating = (totalRating / item.ratings.length).toFixed(1);
          totalReviews = item.ratings.length;
        } else if (item.averageRating !== undefined) {
          rating = item.averageRating.toFixed(1);
          totalReviews = item.ratings ? item.ratings.length : 0;
        } else {
          rating = 'Chưa có đánh giá';
          totalReviews = 0;
        }

        return {
          ...item, // Include full item data
          latitude,
          longitude,
          name,
          address,
          rating,
          totalReviews
        };
      });

      setLocations(locationData.filter(loc => loc.latitude && loc.longitude));
    }
  }, [listData, option]);

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
      const newErrors = {
        costName: costDes === null || costDes === undefined || costDes === '',
        cost: cost === null || cost === undefined || cost === '',
        description: description === null || description === undefined || description === ''
      };

      setErrors(newErrors);

      if (newErrors.costName || newErrors.cost || newErrors.description) {
        return;
      }

      const formData = new FormData();

      if (curDes?.imgSrc && curDes.imgSrc.length > 0) {
        curDes.imgSrc.forEach((file) => {
          if (file instanceof File) {
            formData.append('files', file);
          }
        });
      }

      if (formData.has("files")) {
        try {
          setIsUploading(true);
          const uploadResponse = await axios.post(`${url}/api/schedule/images/upload/new`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (uploadResponse.data.success) {
            const existingUrls = curDes.imgSrc.filter(img => typeof img === 'string');
            const newFiles = (uploadResponse.data.files || []).map(file => file.path);
            curDes.imgSrc = [...existingUrls, ...newFiles];
          }
        } catch (uploadError) {
          console.error("Error during upload:", uploadError);
          throw uploadError;
        } finally {
          setIsUploading(false);
        }
      }

      const newActivity = {
        activityType: curDes?.activityType || option,
        idDestination: curDes?._id || new mongoose.Types.ObjectId(),
        address: curDes.address || "default-address",
        imgSrc: curDes.imgSrc ? curDes.imgSrc.filter(img => typeof img === 'string') : ["default-image"],
        name: curDes.name || "default-name",
        cost: parseInt(cost) || 0,
        costDescription: costDes ? costDes : "",
        description: description,
        timeStart: activity ? activity.timeStart : "00:00",
        timeEnd: activity ? activity.timeEnd : "00:30",
        latitude: curDes?.location?.latitude || curDes?.latitude || 0,
        longitude: curDes?.location?.longitude || curDes?.longitude || 0,
        bookingId: (option === "Accommodation" && choice === "Booked" && selectedBooking?._id) ? selectedBooking._id : null
      };

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
                  : [...day.activity, { ...newActivity }];
              return { ...day, activity: updatedActivitiesList };
            } else {
              return { ...day, activity: [...day.activity, { ...newActivity }] };
            }
          }
          return day;
        });

        const newSchedule = {
          ...prevSchedule,
          activities: updatedActivities
        };

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

  // Add useEffect to fetch bookings when tab changes
  useEffect(() => {
    const fetchBookings = async () => {
      if (option === "Accommodation" && choice === "Booked") {
        try {
          // Parse and validate the date
          let formattedDate = null;
          if (inforSchedule?.dateStart) {
            // Parse DD-MM-YYYY format
            const [day, month, year] = inforSchedule.dateStart.split('-');
            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
              // Format as YYYY-MM-DD for the API
              formattedDate = date.toISOString().split('T')[0];
            }
          }
          
          if (!formattedDate) {
            console.error("Invalid date format:", inforSchedule?.dateStart);
            return;
          }

          const response = await axios.get(`${url}/api/bookings/user/getBookingForSchedule`, {
            params: {
              dateStart: formattedDate
            },
            headers: { token }
          });
          if (response.data.success) {
            const validBookings = response.data.bookings.filter(booking => booking.accommodationId.city.toLowerCase().includes(city.toLowerCase()));
            console.log("validBookings",validBookings)
            setBookings(validBookings);
          }
        } catch (error) {
          console.error("Error fetching bookings:", error);
        }
      }
    };
    fetchBookings();
  }, [choice, option, inforSchedule?.dateStart, token]);

  // Add handler for booking selection
  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    
    // Create a formatted accommodation object for curDes
    const accommodationData = {
      ...booking.accommodationId,
      name: booking.accommodationId.name,
      location: booking.accommodationId.location,
      images: booking.accommodationId.images,
      activityType: "Accommodation"
    };
    
    setCurDes(accommodationData);
    setCost(booking.totalAmount.toString());
    setCostDes(`Đặt phòng ${booking.accommodationId.name} - ${booking.roomType || 'Phòng tiêu chuẩn'}`);
    setDescription(`Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}\nCheck-out: ${new Date(booking.checkOutDate).toLocaleDateString()}\nSố khách: ${booking.numberOfGuests.adult} người lớn, ${booking.numberOfGuests.child} trẻ em`);
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


        <div>

        </div>
        <div className="modal-content-container">

          {/* Left side - Original content */}
          <div className="modal-left-panel">
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
                        {option === "Accommodation" && (
                          <option value="Booked">Đã đặt</option>
                        )}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="modal-body-add-activity">
              {!curDes && option !== "Other" ? (
                <div className="list-container">
                  {choice === "List" && (
                    <>
                      {option === "Attraction" && <ListPlaces status="Schedule" setCurDes={setCurDes} city={city} setListData={setListData} type="attraction" />}
                      {option === "Accommodation" && <ListPlaces status="Schedule" setCurDes={setCurDes} city={city} setListData={setListData} type="accommodation" />}
                      {option === "FoodService" && <ListPlaces status="Schedule" setCurDes={setCurDes} city={city} setListData={setListData} type="foodService" />}
                    </>
                  )}

                  {choice === "WishList" && (
                    <>
                      {option === "Attraction" && <ListPlaces status="WishList" setCurDes={setCurDes} city={city} setListData={setListData} type="attraction" />}
                      {option === "Accommodation" && <ListPlaces status="WishList" setCurDes={setCurDes} city={city} setListData={setListData} type="accommodation" />}
                      {option === "FoodService" && <ListPlaces status="WishList" setCurDes={setCurDes} city={city} setListData={setListData} type="foodService" />}
                    </>
                  )}

                  {choice === "Booked" && option === "Accommodation" && (
                    <BookingsList
                      bookings={bookings}
                      onSelectBooking={handleBookingSelect}
                      selectedBooking={selectedBooking}
                    />
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
                            <button onClick={handlePrevImage} className="carousel-button">
                              <IoIosArrowDropleft />

                            </button>
                            <img
                              className="add-schedule-img"
                              src={getImageUrl(curDes,currentImageIndex)}
                              alt={`${curDes.name}`}
                            />
                            <button onClick={handleNextImage} className="carousel-button">
                              <IoIosArrowDropright />

                            </button>
                          </div>
                        )}

                        {/* <div className="destination-details">
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
                          {curDes.price && curDes.price >0 && (
                            <div className="destination-detail-item">
                              <span className="detail-icon"> <IoMdCash /></span>
                              <span className="detail-text">{curDes.price.toLocaleString().replace(/,/g, '.')} VND</span>
                            </div>
                          )}
                        </div> */}
                      </div>
                    </div>
                  )}

                  <div className="form-container-single">
                    <FormAddActivity
                      cost={cost}
                      setCost={setCost}
                      description={description}
                      setDescription={setDescription}
                      option={option}
                      costDes={costDes}
                      setCostDes={setCostDes}
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
const LocationsMapView = ({ locations, selectedLocation }) => {
  const defaultPosition = [10.762622, 106.660172]; // Ho Chi Minh City coordinates
  const mapCenter = selectedLocation?.location?.latitude && selectedLocation?.location?.longitude
    ? [selectedLocation.location.latitude, selectedLocation.location.longitude]
    : selectedLocation?.latitude && selectedLocation?.longitude
      ? [selectedLocation.latitude, selectedLocation.longitude]
      : defaultPosition;

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
                  <div style={{ minWidth: '150px', textAlign: 'left' }}>
                    <strong style={{ fontSize: '12px', color: '#333' }}>
                      {location.name}
                    </strong>
                    
                    {/* Rating display */}
                    <div style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ color: '#ff6b35', fontSize: '12px' }}>
                        {'★'.repeat(Math.floor(Number(location.rating) || 0))}
                        {'☆'.repeat(5 - Math.floor(Number(location.rating) || 0))}
                      </span>
                      <span style={{ fontSize: '10px', color: '#666' }}>
                        {location.rating !== 'Chưa có đánh giá' 
                          ? `${location.rating} (${location.totalReviews})`
                          : 'Chưa có đánh giá'
                        }
                      </span>
                    </div>
                    
                    {/* Address */}
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#888', lineHeight: '1.2' }}>
                      📍 {location.address}
                    </p>
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
                <div style={{ minWidth: '150px', textAlign: 'left' }}>
                  <strong style={{ fontSize: '12px', color: '#333' }}>
                    {selectedLocation.name || selectedLocation.foodServiceName || selectedLocation.attractionName}
                  </strong>
                  
                  {/* Rating display for selected location */}
                  {selectedLocation.ratings && (
                    <div style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {(() => {
                        let rating, totalReviews;
                        if (selectedLocation.ratings.length > 0) {
                          const totalRating = selectedLocation.ratings.reduce((sum, r) => sum + (Number(r.rate) || 0), 0);
                          rating = (totalRating / selectedLocation.ratings.length).toFixed(1);
                          totalReviews = selectedLocation.ratings.length;
                        } else if (selectedLocation.averageRating !== undefined) {
                          rating = selectedLocation.averageRating.toFixed(1);
                          totalReviews = selectedLocation.ratings.length;
                        } else {
                          rating = 'Chưa có đánh giá';
                          totalReviews = 0;
                        }

                        return (
                          <>
                            <span style={{ color: '#ff6b35', fontSize: '12px' }}>
                              {'★'.repeat(Math.floor(Number(rating) || 0))}
                              {'☆'.repeat(5 - Math.floor(Number(rating) || 0))}
                            </span>
                            <span style={{ fontSize: '10px', color: '#666' }}>
                              {rating !== 'Chưa có đánh giá' 
                                ? `${rating} (${totalReviews})`
                                : 'Chưa có đánh giá'
                              }
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  
                  {/* Address */}
                  <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#888', lineHeight: '1.2' }}>
                    📍 {selectedLocation.location.address || "New Address"}
                  </p>
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
  selectedLocation: PropTypes.object
};

const FormAddActivity = ({ cost, setCost, description, setDescription, option, costDes, setCostDes, curDes, errors }) => {
  const formatNumber = (value) => {
    if (value === undefined || value === null || value === '') {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleCostChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, ""); // Xoá dấu chấm cũ
    if (!/^\d*$/.test(rawValue)) return; // Chỉ chấp nhận số

    setCost(rawValue); // Lưu số gốc (không format)
  };

  return (
    <div className="form-container">
      {/* Chỉ hiển thị destination-info khi không phải Other */}
      {option !== "Other" && curDes && (
        <div className="destination-info">
          <PlaceItem 
            item={curDes} 
            status="Default" 
            setCurDes={() => {}} 
            type={option === "Accommodation" ? "accommodation" : 
                option === "FoodService" ? "foodService" : 
                option === "Attraction" ? "attraction" : ""}
          />
        </div>
      )}

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
