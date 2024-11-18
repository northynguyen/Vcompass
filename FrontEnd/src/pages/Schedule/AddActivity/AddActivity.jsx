import React, { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { StoreContext } from "../../../Context/StoreContext";
import ListAccommodation, { AccomItem } from "../../ListAccommodation/ListAccommodation";
import ListAttractions, { AttractionItem } from "../../ListAttractions/ListAttractions";
import ListFoodServices, { FoodServiceItem } from "../../ListFoodServices/ListFoodServices";
import "./AddActivity.css";
// Thiết lập root element cho modal
Modal.setAppElement("#root");


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
          <option value="Accommodations">Nghỉ ngơi</option>
          <option value="FoodServices">Ăn uống</option>
          <option value="Attractions">Tham quan</option>
          <option value="Other">Hoạt động Khác</option>
        </select>
      </div>
    </div>
  );
};

const AddActivity = ({ isOpen, closeModal, currentDay, destination, setInforSchedule, activity, city }) => {
  const [option, setOption] = React.useState("Accommodations");
  const [cost, setCost] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [curDes, setCurDes] = React.useState(null)

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
      setOption("Accommodations")
    }

  }, [isOpen]);

  const handleSave = () => {
    //if (cost == "")
    const newActivity = {
      activityType: curDes.activityType,
      idDestination: curDes._id || "default-id",
      cost: parseInt(cost) || 0,
      description: description,
      timeStart: activity ? activity.timeStart : "00:00",
      timeEnd: activity ? activity.timeEnd : "00:30",
    };
    setInforSchedule((prevSchedule) => {
      const updatedActivities = prevSchedule.activities.map((day) => {
        if (day.day === currentDay) {
          if (activity) {
            const existingActivityIndex = day.activity.findIndex((act) => act._id === activity._id);
            const updatedActivitiesList = existingActivityIndex !== -1
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
          {option === "Attractions" && <ListAttractions status="Schedule"
            setCurDes={setCurDes} city={city} />}
          {option === "Accommodations" && <ListAccommodation status="Schedule"
            setCurDes={setCurDes} city={city} />}
          {option === "FoodServices" && <ListFoodServices status="Schedule"
            setCurDes={setCurDes} city={city} />}
          {option === "Other" &&
            <div className="form-group">
              <select className="input-field">
                <option>Vui lòng chọn hoạt động</option>
                <option>Chỗ nghỉ</option>
                <option>Vui chơi</option>
                <option>An uong </option>
                <option>Tự chọn </option>
              </select>
            </div>}
          <div className="activity-infor-container">
            {option === "Accommodations" && curDes && (
              <AccomItem
                accommodation={curDes}
              />
            )}
            {option === "FoodServices" && curDes && (
              <FoodServiceItem
                foodService={curDes}
              />
            )}
            {option === "Attractions" && curDes && (
              <AttractionItem
                attraction={curDes}
              />
            )}
            {
              (curDes) && (
                <FormAddActivity images={curDes.images} cost={cost} setCost={setCost}
                  description={description} setDescription={setDescription} />
              )
            }
          </div>
        </div>
        {
          (curDes || activity) && (
            <div className="modal-footer">
              <button className="save-btn" onClick={handleSave}>Lưu</button>
            </div>
          )
        }
      </div>
    </Modal >

  )
};

const FormAddActivity = ({ images, cost, setCost, description, setDescription }) => {
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
        <div className="img-add-activity-container">
          <button onClick={handlePrev} className="carousel-button">{"<"}</button>
          <img
            className="add-schedule-img"
            src={`${url}/images/${images[currentIndex]}`}
            alt={`slide-${currentIndex}`}
          />
          <button onClick={handleNext} className="carousel-button">{">"}</button>
        </div>
      </div>
    </div>
  )
}

export default AddActivity;
