import React, { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { StoreContext } from "../../../Context/StoreContext";
import ListAccommodation, { AccomItem } from "../../ListAccommodation/ListAccommodation";
import ListAttractions, { AttractionItem } from "../../ListAttractions/ListAttractions";
import ListFoodServices, { FoodServiceItem } from "../../ListFoodServices/ListFoodServices";
import "./AddActivity.css";
import axios from "axios";
// Thiết lập root element cho modal
Modal.setAppElement("#root");

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
      address: selected.display_name,
      latitude: parseFloat(selected.lat),
      longitude: parseFloat(selected.lon),
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
          onChange={(e) => {
            setActivityName(e.target.value);
            setCurDes((prev) => ({ ...prev, name: e.target.value }));
          }}
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

const AddActivity = ({ isOpen, closeModal, currentDay, destination, setInforSchedule, activity, city }) => {
  const [option, setOption] = React.useState("Accommodation");
  const [choice, setChoice] = React.useState("List");
  const [cost, setCost] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [curDes, setCurDes] = React.useState(null)
  const { url } = useContext(StoreContext);

  useEffect(() => {
    if (isOpen) {
      if (activity) {
        setCurDes(destination)
        setCost(activity.cost)
        setDescription(activity.description)
      } else {
        setCurDes(null);
        setCost()
        setDescription()
      }
      setOption(activity ? activity.activityType : "Accommodation");
    }

  }, [isOpen]);

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
        idDestination: curDes?._id || "default-id",
        address: curDes.address || "default-address",
        imgSrc: curDes.imgSrc || ["default-image"],
        name: curDes.name || "default-name",
        cost: parseInt(cost) || 0,
        description: description,
        timeStart: activity ? activity.timeStart : "00:00",
        timeEnd: activity ? activity.timeEnd : "00:30",
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

        return { ...prevSchedule, activities: updatedActivities };
      });

      closeModal();
    } catch (error) {
      console.error("Lỗi khi lưu activity:", error);
    }
  };
  
  

  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="add-activity-modal"
      overlayClassName="modal-overlay"
    >
      <div className="add-activity">
        <div className="modal-header">
          <h2>Thêm mới hoạt động</h2>
          <button onClick={closeModal} className="close-btn">
            <i className="fa-regular fa-circle-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          <Header setOption={setOption} setCurDes={setCurDes} />

          {option!=="Other" && (
             <select
             id="sort-by"
             value={choice}
             onChange={(e) => setChoice(e.target.value)}
           >
             <option value="List">Chọn từ danh sách</option>
             <option value="WishList">Chọn từ WishList</option>
             
           </select>
          )}
         
        {choice === "List" &&  (
          <>
            {option === "Attraction" && <ListAttractions status="Schedule" setCurDes={setCurDes} city={city} />}
            {option === "Accommodation" && <ListAccommodation status="Schedule" setCurDes={setCurDes} city={city} />}
            {option === "FoodService" && <ListFoodServices status="Schedule" setCurDes={setCurDes} city={city} />}
          </>
        )}

        {choice === "WishList" && (
          <>
            {option === "Attraction" && <ListAttractions status="WishList" setCurDes={setCurDes} city={city} />}
            {option === "Accommodation" && <ListAccommodation status="WishList" setCurDes={setCurDes} city={city} />}
            {option === "FoodService" && <ListFoodServices status="WishList" setCurDes={setCurDes} city={city} />}
          </>
        )}
          {option === "Other" && (
              <OtherItem
                setCurDes={setCurDes}
                curDes={curDes}
              />
            )}

          <div className="activity-infor-container">
            {option === "Accommodation" && curDes && (
              <AccomItem
                accommodation={curDes}
              />
            )}
            {option === "FoodService" && curDes && (
              <FoodServiceItem
                foodService={curDes}
              />
            )}
            {option === "Attraction" && curDes && (
              <AttractionItem
                attraction={curDes}
              />
            )}
           
            {
              (curDes || option==="Other") && (
                <FormAddActivity images={curDes?.images || null} cost={cost} setCost={setCost}
                  description={description} setDescription={setDescription} option={option} />
              )
            }
          </div>
        </div>
        {
          (curDes || activity || option === "Other") && (
            <div className="modal-footer">
              <button className="save-btn" onClick={handleSave}>Lưu</button>
            </div>
          )
        }
      </div>
    </Modal >

  )
};

const FormAddActivity = ({ images, cost, setCost, description, setDescription, option }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { url } = useContext(StoreContext);
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  return (
    <div className="form-group">
      <div className="name-price-container">
        <div className="title-container">
          <label className="expense-sub-title" htmlFor="name-expense">Tên chi phí</label>
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
        {option!=="Other" && <div className="img-add-activity-container">
          <button onClick={handlePrev} className="carousel-button">{"<"}</button>
          <img
            className="add-schedule-img"
            src={`${url}/images/${images[currentIndex]}`}
            alt={`slide-${currentIndex}`}
          />
          <button onClick={handleNext} className="carousel-button">{">"}</button>
        </div>}
      </div>
    </div>
  )
}

export default AddActivity;
