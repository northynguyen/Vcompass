/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { StoreContext } from "../../Context/StoreContext";
import { Helmet } from "react-helmet-async";

import L from "leaflet";
import "leaflet-routing-machine";
import _ from "lodash";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Tooltip } from "react-tooltip";
import ConfirmDialog from "../../components/Dialog/ConfirmDialog";
import ActivityTime, {
  AccomActivity,
  AttractionActivity,
  FoodServiceActivity,
  OtherActivity,
} from "./ActivityTime/ActivityTime";
import AddActivity from "./AddActivity/AddActivity";
import Comment from "./Comment/Comment";
import Expense from "./Expense/Expense";
import InviteTripmatesModal from "./InviteTripmatesModal/InviteTripmatesModal";
import RecommendPlace from "./RecommendPlace/RecommendPlace";
import "./Schedule.css";

// Component for dynamic meta tags
const ScheduleMetaTags = ({ schedule, url: baseUrl }) => {
  if (!schedule) return null;

  const currentUrl = window.location.href;
  const imageUrl = schedule.imgSrc && schedule.imgSrc[0]
    ? (schedule.imgSrc[0].includes('http') ? schedule.imgSrc[0] : `${baseUrl}/images/${schedule.imgSrc[0]}`)
    : schedule.videoSrc || 'https://res.cloudinary.com/dmdzku5og/image/upload/v1753888598/du-lich-viet-nam_a5b5777f771c44a89aee7f59151e7f95_xh9zbs.jpg';

  const description = schedule.description || `Lịch trình du lịch ${schedule.address} - ${schedule.numDays} ngày với nhiều hoạt động thú vị.`;
  const title = `${schedule.scheduleName} - Du lịch ${schedule.address}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="VCompass" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Additional Meta Tags */}
      <meta name="author" content={schedule.idUser?.name || 'VCompass User'} />
      <meta name="keywords" content={`du lịch, ${schedule.address}, lịch trình, VCompass, ${schedule.type?.join(', ') || ''}`} />
    </Helmet>
  );
};

const MapViewWithRoute = ({ activities, scheduleID }) => {
  const [activitiesWithCoordinates, setActivitiesWithCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading
  const { url } = useContext(StoreContext);
  const mapRef = useRef(null); // Tham chiếu bản đồ
  const routingControlRef = useRef(null); // Tham chiếu cho routing control
  const mapContainerId = `map-container-${scheduleID}`; // ID duy nhất cho mỗi bản đồ

  // Hàm fetch dữ liệu từ API
  const fetchData = useCallback(
    async (id, type) => {
      try {
        let response;
        let location = null;

        switch (type) {
          case "Accommodation":
            response = await fetch(`${url}/api/accommodations/getAccomm/${id}`);
            location = await response.json();
            break;
          case "FoodService":
            response = await fetch(`${url}/api/foodservices/${id}`);
            location = await response.json();
            break;
          case "Attraction":
            response = await fetch(`${url}/api/attractions/${id}`);
            location = await response.json();
            break;
          case "Other":
            response = await fetch(`${url}/api/schedule/${scheduleID}?activityId=${id}`);
            location = await response.json();
            break;
          default:
            throw new Error("Unknown type");
        }

        return location;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [url, scheduleID]
  );

  // Hàm lấy thông tin vị trí các hoạt động và cập nhật trạng thái
  useEffect(() => {
    const fetchActivitiesCoordinates = async () => {
      setIsLoading(true); // Bắt đầu tải
      const updatedActivities = await Promise.all(
        activities.map(async (activity) => {
          if (activity.latitude && activity.longitude) {
            return activity;
          }

          const locationData =
            activity.activityType === "Other"
              ? await fetchData(activity._id, "Other")
              : await fetchData(activity.idDestination, activity.activityType);

          if (locationData) {
            let coordinates = null;

            switch (activity.activityType) {
              case "Accommodation":
                coordinates = locationData?.accommodation?.location
                  ? [
                    locationData.accommodation.location.latitude,
                    locationData.accommodation.location.longitude,
                  ]
                  : null;
                break;
              case "Attraction":
                coordinates = locationData?.attraction?.location
                  ? [
                    locationData.attraction.location.latitude,
                    locationData.attraction.location.longitude,
                  ]
                  : null;
                break;
              case "FoodService":
                coordinates = locationData?.foodService?.location
                  ? [
                    locationData.foodService.location.latitude,
                    locationData.foodService.location.longitude,
                  ]
                  : null;
                break;
              case "Other":
                if (locationData?.other?.address) {
                  const encodedAddress = encodeURIComponent(locationData.other.address);
                  const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json`
                  );
                  const data = await response.json();
                  if (data && data.length > 0) {
                    coordinates = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                  }
                }
                break;
              default:
                break;
            }

            if (coordinates) {
              return { ...activity, latitude: coordinates[0], longitude: coordinates[1] };
            }
          }

          return activity; // Trả về hoạt động gốc nếu không có thông tin vị trí
        })
      );

      setActivitiesWithCoordinates(updatedActivities);
      setIsLoading(false); // Kết thúc tải
    };

    if (activities.length > 0) {
      fetchActivitiesCoordinates();
    }
  }, [activities, fetchData]);

  // Hàm khởi tạo và cập nhật bản đồ, thêm markers và tuyến đường
  useEffect(() => {
    if (activitiesWithCoordinates.length > 0) {
      // Khởi tạo bản đồ nếu chưa có
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerId).setView(
          [activitiesWithCoordinates[0].latitude, activitiesWithCoordinates[0].longitude],
          12
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current);
      }

      // Thêm markers cho các hoạt động
      activitiesWithCoordinates.forEach((activity, index) => {
        if (activity.latitude && activity.longitude) {
          L.marker([activity.latitude, activity.longitude], {
            icon: L.divIcon({
              className: "custom-icon",
              html: `<div class="marker-number">${index + 1}</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 30],
            }),
          })
            .addTo(mapRef.current)
            .bindPopup(`Điểm ${index + 1}: ${activity.description || "Không có mô tả"}`);
        }
      });

      // Cập nhật tuyến đường
      if (routingControlRef.current) {
        mapRef.current.removeControl(routingControlRef.current); // Gỡ bỏ routing cũ
      }

      routingControlRef.current = L.Routing.control({
        waypoints: activitiesWithCoordinates
          .filter((activity) => activity.latitude && activity.longitude)
          .map((activity) => L.latLng(activity.latitude, activity.longitude)),
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: "blue", weight: 4 }],
        },
        show: false,
      }).addTo(mapRef.current);
    }

    // Cleanup khi component unmount hoặc activities thay đổi
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activitiesWithCoordinates, mapContainerId]);

  return (
    <div>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", textAlign: "center", padding: "20px" }}>
          <div className="spinner-map"></div>
        </div>
      ) : (
        <div id={mapContainerId} style={{ height: "400px", width: "100%" }}></div>
      )}
    </div>
  );
};

const Activity = ({
  activity,
  setCurrentActivity,
  setCurrentDestination,
  openModal,
  setInforSchedule,
  mode,
  inforSchedule,
  socket,
  setShowLogin
}) => {
  //console.log("activities", activity);
  return (
    <div className="time-schedule-list">
      {activity.length > 0 &&
        activity.map((myactivity, index) => (
          <Draggable key={myactivity._id} draggableId={myactivity._id} index={index} isDragDisabled={mode === "view"}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="activity-item"
              >
                <ActivityItem
                  key={index}
                  activity={myactivity}
                  index={index}
                  setCurrentDestination={setCurrentDestination}
                  inforSchedule={inforSchedule}
                  setInforSchedule={setInforSchedule}
                  setCurrentActivity={setCurrentActivity}
                  openModal={openModal}
                  mode={mode}
                  socket={socket}
                  setShowLogin={setShowLogin}
                />
              </div>
            )}
          </Draggable>
        ))}
    </div>
  );
};

const ActivityItem = ({
  index,
  activity,
  setCurrentActivity,
  setCurrentDestination,
  openModal,
  setInforSchedule,
  mode,
  inforSchedule,
  socket,
  setShowLogin
}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { url } = useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //console.log("activity", activity.activityType);
  const fetchData = async (id, type) => {
    try {
      let response;
      switch (type) {
        case "Accommodation":
          response = await fetch(`${url}/api/accommodations/getAccomm/${id}`);
          break;
        case "FoodService":
          response = await fetch(`${url}/api/foodservices/${id}`);
          break;
        case "Attraction":
          response = await fetch(`${url}/api/attractions/${id}`);
          break;
        case "Other":
          // console.log("id 1111", id);
          response = await fetch(`${url}/api/schedule/${inforSchedule._id}?activityId=${id}`);
          break;
        default:
          throw new Error("Unknown type");
      }
      const result = await response.json();
      setIsLoading(false);
      if (!response.ok) {
        throw new Error(result.message || "Error fetching data");
      }

      // console.log('Fetched food service data:', result);

      setData(result);
    } catch (err) {
      console.log(err);
    } finally { /* empty */ }
  };

  useEffect(() => {
    if (activity?.idDestination && activity?.activityType && activity?.activityType !== "Other") {
      fetchData(activity.idDestination, activity.activityType);
    }
    if (activity?.activityType === "Other" && activity?._id !== "default-id" && activity?._id !== undefined) {
      fetchData(activity._id, "Other");
    }
  }, [activity]);
  const handleEdit = () => {
    setCurrentActivity(activity);
    switch (activity.activityType) {
      case "Accommodation":
        data.accommodation.activityType = "Accommodation";
        setCurrentDestination(data.accommodation);
        break;
      case "FoodService":
        data.foodService.activityType = "FoodService";
        setCurrentDestination(data.foodService);
        break;
      case "Attraction":
        data.attraction.activityType = "Attraction";
        setCurrentDestination(data.attraction);
        break;
      case "Other":
        //console.log("other data", data.other);
        setCurrentDestination(data.other);
        break;
      default:
        throw new Error("Unknown type");
    }
    openModal();
  };

  const handleConfirmDelete = async () => {
    try {
      //console.log(`${url}/api/schedule/${inforSchedule._id}/activities/${activity._id}`);
      const response = await axios.delete(
        `${url}/api/schedule/${inforSchedule._id}/activities/${activity._id}`
      );
      if (response.status === 200) {
        setIsModalOpen(false);
        setInforSchedule((prevSchedule) => {
          const updatedActivities = prevSchedule.activities.map((day) => ({
            ...day,
            activity: day.activity.filter((act) => act._id !== activity._id),
          }));

          return { ...prevSchedule, activities: updatedActivities };
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="activity-infor">
      <ActivityTime
        activity={activity}
        mode={mode}
        setInforSchedule={setInforSchedule}
        socket={socket}
        inforSchedule={inforSchedule}
      />
      <div className="num-activity">
        -<div className="circle-num">{index + 1}</div>-
      </div>
      {!isLoading && (
        <>
          {activity.activityType === "Accommodation" &&
            <AccomActivity
              data={data.accommodation}
              activity={activity}
              handleEdit={handleEdit}
              setIsOpenModal={setIsModalOpen}
              mode={mode}
              setShowLogin={setShowLogin}
            />
          }
          {activity.activityType === "FoodService" && (
            <FoodServiceActivity
              data={data?.foodService}
              activity={activity}
              handleEdit={handleEdit}
              setIsOpenModal={setIsModalOpen}
              mode={mode}
              setShowLogin={setShowLogin}
            />
          )}
          {activity.activityType === "Attraction" && data.attraction && (
            <AttractionActivity
              data={data.attraction}
              activity={activity}
              handleEdit={handleEdit}
              setIsOpenModal={setIsModalOpen}
              mode={mode}
              setShowLogin={setShowLogin}
            />
          )}
          {activity.activityType === "Other" &&
            (
              (
                <OtherActivity
                  data={data.other}
                  activity={activity}
                  handleEdit={handleEdit}
                  setIsOpenModal={setIsModalOpen}
                  mode={mode}
                />
              ))}
        </>
      )}

      {isModalOpen && (
        <ConfirmDialog
          isOpen={isModalOpen}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsModalOpen(false)}
          message="Bạn có chắc chắn muốn xóa mục này không?"
        />
      )}
    </div>
  );
};

const convertDateFormat = (date) => {
  const [day, month, year] = date.split("-");
  return `${day}-${month}-${year}`;
};


const InforScheduleMedal = ({
  isOpen,
  closeModal,
  inforSchedule,
  setInforSchedule,
  socket,
}) => {
  const [scheduleName, setScheduleName] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numDays, setNumDays] = useState(0);
  const [description, setDescription] = useState("");
  const [imgSrc, setImgSrc] = useState([]);
  const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Preview ảnh
  const [videoPreview, setVideoPreview] = useState(null); // Preview video
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const { url } = useContext(StoreContext);

  const travelTypes = [
    'Du lịch vui chơi',
    'Du lịch học tập',
    'Du lịch nghỉ dưỡng',
    'Du lịch thương mại',
    'Du lịch văn hóa',
    'Du lịch ẩm thực',
    'Du lịch mạo hiểm',
    'Du lịch sinh thái',
    'Du lịch tâm linh',
    'Du lịch cộng đồng',
    'Du lịch khám phá thiên nhiên',
    'Du lịch tự túc (backpacking)',
    'Du lịch lịch sử',
    'Du lịch tình nguyện',
    'Du lịch chữa lành',
  ];

  useEffect(() => {
    if (inforSchedule) {
      const startDate = convertDateToJSDateVietnam(inforSchedule.dateStart);
      const endDate = convertDateToJSDateVietnam(inforSchedule.dateEnd);

      setScheduleName(inforSchedule.scheduleName || "");
      setStartDay(startDate);
      setEndDate(endDate);
      setNumDays(inforSchedule.numDays || 0);
      setDescription(inforSchedule.description || "");
      setImgSrc(inforSchedule.imgSrc || []);
      setVideoPreview(inforSchedule.videoSrc || null);
      setSelectedTypes(inforSchedule.type || []);
    }
  }, [inforSchedule, isOpen]);

  const convertDateToJSDateVietnam = (dateString) => {
    const [day, month, year] = dateString.split("-");
    const date = new Date(year, month - 1, day);
    date.setHours(date.getHours() + 7 - date.getTimezoneOffset() / 60);
    return date;
  };

  const convertJSDateToDateString = (jsDate) => {
    const day = String(jsDate.getDate()).padStart(2, "0");
    const month = String(jsDate.getMonth() + 1).padStart(2, "0");
    const year = jsDate.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDay") {
      const newStartDay = new Date(value);
      setStartDay(newStartDay);
      // Dùng numDays hiện tại từ state
      const newEndDate = new Date(newStartDay.getTime() + (numDays - 1) * 24 * 60 * 60 * 1000);
      setEndDate(newEndDate);
    } else if (name === "numDays") {
      const newNumDays = Number(value);
      if (startDay) {
        const newEndDate = new Date(startDay.getTime() + newNumDays * 24 * 60 * 60 * 1000);
        setEndDate(newEndDate);
      }
    } else {
      switch (name) {
        case "scheduleName":
          setScheduleName(value);
          break;
        case "description":
          setDescription(value);
          break;
        default:
          break;
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImgSrc(files);
    if (files.length > 0) {
      const previewUrl = URL.createObjectURL(files[0]);
      setImagePreview(previewUrl);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (duration > 30) {
        alert('Video quá dài, giới hạn 30 giây!');
        setVideoFile(null);
        setVideoPreview(null); // Xóa video preview nếu quá dài
      } else {
        setVideoFile(file);
        setVideoPreview(video.src);
      }
    };
  };


  const uploadVideo = async (videoFile) => {
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await axios.post(`${url}/api/videos/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        return response.data.url;  // Trả về URL của video
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  };

  // Hàm upload ảnh lên server
  const uploadImages = async (imgFiles) => {
    const formData = new FormData();
    formData.append('image', imgFiles);

    try {
      const response = await axios.post(`${url}/api/videos/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        return response.data.url;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  };

  // Hàm xóa dữ liệu cũ (video hoặc ảnh)
  const deleteOldMedia = async (media) => {
    if (media && media.length > 0) {
      try {
        const response = await axios.delete(`${url}/api/videos/delete-image`, {
          data: { imagePath: media },
        });

        if (response.data.success) {
          console.log("Deleted old media successfully.");
        } else {
          console.error("Error deleting old media:", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting old media:", error);
      }
    }
  };
  const extractVideoPath = (videoSrc) => {

    try {
      const urlParts = new URL(videoSrc);
      const pathParts = urlParts.pathname.split('/');

      // Bỏ đi những phần không cần thiết, giữ lại "videos/apb3yzzgyotcagjxnqbz"
      const videoPath = pathParts.slice(-2).join('/').replace(/\.[^/.]+$/, ""); // Xóa phần đuôi file (.mov, .mp4,...)
      return videoPath;
    } catch (error) {
      console.error("Invalid video URL:", error);
      return null;
    }
  };
  const deleteVideo = async (videoSrc) => {
    if (!videoSrc) {
      return;
    }
    try {
      const videoPath = extractVideoPath(videoSrc);
      const response = await axios.delete(`${url}/api/videos/`, {
        data: { videoPath: videoPath },
      });

      if (response.data.success) {
        console.log("Deleted video successfully.");
      } else {
        console.error("Error deleting video:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const handleTypeSelection = (selectedType) => {
    setSelectedTypes(prev => {
      if (prev.includes(selectedType)) {
        return prev.filter(type => type !== selectedType);
      } else {
        return [...prev, selectedType];
      }
    });
  };

  const handleSubmit = async () => {
    if (isNaN(startDay)) {
      console.error("Invalid start date");
      return;
    }

    const startDayString = convertJSDateToDateString(startDay);
    const endDateString = convertJSDateToDateString(endDate);

    let uploadedImgSrc = [];
    let videoSrc = null;

    try {
      setIsLoading(true);
      // Upload video nếu có
      if (mediaType === 'video' && videoFile) {
        const uploadResponse = await uploadVideo(videoFile);
        videoSrc = uploadResponse;
        await deleteOldMedia(inforSchedule.imgSrc?.[0]);
        await deleteVideo(inforSchedule.videoSrc);
      }

      // Upload ảnh nếu có
      else if (mediaType === 'image' && imgSrc.length > 0 && imgSrc[0] instanceof File) {
        const uploadedFiles = await uploadImages(imgSrc[0]);
        uploadedImgSrc = uploadedFiles;
        console.log("uploadedImgSrc", uploadedImgSrc);
        await deleteOldMedia(inforSchedule.imgSrc?.[0]);
        await deleteVideo(inforSchedule.videoSrc);
      }

      // Tạo một biến để lưu giá trị cuối cùng của imgSrc
      const finalImgSrc = mediaType === 'image'
        ? (imgSrc[0] instanceof File ? [uploadedImgSrc] : inforSchedule.imgSrc)
        : null;

      // Cập nhật thông tin lịch trình
      setInforSchedule((prev) => ({
        ...prev,
        scheduleName,
        description,
        dateStart: startDayString,
        dateEnd: endDateString,
        imgSrc: finalImgSrc,
        videoSrc,
        type: selectedTypes,
      }));

      toast.success("Lịch trình đã được cập nhật thành công!");
      closeModal();

      // Sử dụng giá trị finalImgSrc trong socket.emit
      if (socket) {
        socket.current.emit('updateScheduleInfo', {
          scheduleId: inforSchedule._id,
          scheduleInfo: {
            scheduleName,
            description,
            dateStart: startDayString,
            dateEnd: endDateString,
            imgSrc: finalImgSrc, // Sử dụng giá trị đã tính toán
            videoSrc,
            type: selectedTypes,
          }
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Có lỗi xảy ra trong quá trình upload!");
    }

    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="add-expense-modal"
      overlayClassName="modal-overlay"
    >
      {isLoading &&
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      }
      <div className="add-activity">
        <div className="modal-header">
          <h4>Chỉnh sửa lịch trình</h4>
          <button onClick={closeModal} className="close-btn">
            <i className="fa-regular fa-circle-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="expense-sub-title" htmlFor="schedule-name">
              Tên lịch trình
            </label>
            <input
              className="input-field"
              id="schedule-name"
              name="scheduleName"
              placeholder="Nhập tên lịch trình"
              value={scheduleName}
              onChange={handleChange}
              required
            />

            <label className="expense-sub-title" htmlFor="start-day">
              Chọn ngày bắt đầu
            </label>
            <input
              className="input-field"
              type="date"
              id="start-day"
              name="startDay"
              value={startDay && new Date(startDay).toISOString().split("T")[0]}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
            />

            <label className="expense-sub-title" htmlFor="description">
              Mô tả
            </label>
            <textarea
              className="input-field"
              id="description"
              name="description"
              value={description}
              onChange={handleChange}
              placeholder="Nhập ghi chú chi tiết"
            ></textarea>

            <label className="expense-sub-title">Loại hình du lịch</label>
            <div className="travel-types-container">
              {travelTypes.map((travelType, index) => (
                <button
                  key={index}
                  type="button"
                  className={`type-button ${selectedTypes.includes(travelType) ? 'selected' : ''}`}
                  onClick={() => handleTypeSelection(travelType)}
                >
                  {travelType}
                </button>
              ))}
            </div>

            <label className="expense-sub-title">Chọn loại tệp</label>
            <div className="radio-group">
              <div style={{ display: 'flex' }}>
                <input
                  type="radio"
                  id="image"
                  name="mediaType"
                  value="image"
                  checked={mediaType === 'image'}
                  onChange={() => { setMediaType('image'), setImgSrc([]) }}
                />
                <label htmlFor="image">Ảnh</label>
              </div>
              <div style={{ display: 'flex' }}>
                <input
                  type="radio"
                  id="video"
                  name="mediaType"
                  value="video"
                  checked={mediaType === 'video'}
                  onChange={() => setMediaType('video')}
                />
                <label htmlFor="video">Video</label>
              </div>
            </div>

            {mediaType === 'image' && (
              <div>
                <label className="expense-sub-title" htmlFor="image-upload">
                  Ảnh bìa
                </label>
                <input
                  className="input-field"
                  id="image-upload"
                  name="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                />
                {(imagePreview || inforSchedule.imgSrc?.[0]) && (
                  <img src={imagePreview ? imagePreview : inforSchedule.imgSrc?.[0]} alt="Image Preview" />
                )}
              </div>
            )}

            {mediaType === 'video' && (
              <div>
                <label className="expense-sub-title" htmlFor="video-upload">
                  Video
                </label>
                <input
                  className="input-field"
                  id="video-upload"
                  name="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
                <video width="100%" controls>
                  <source src={videoPreview} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={closeModal}>
              Hủy bỏ
            </button>
            <button className="btn-submit" onClick={handleSubmit}>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const DateSchedule = ({
  schedule,
  setInforSchedule,
  mode,
  city,
  inforSchedule,
  index,
  socket,
  setShowLogin
}) => {
  const [scheduleDate, setScheduleDate] = useState(schedule);
  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentDestination, setCurrentDestination] = useState(null);
  const [viewMode, setViewMode] = useState("overview");
  const [currentMapIndex, setCurrentMapIndex] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (schedule) {
      setScheduleDate(schedule);
      setCurrentActivity(null);
      setCurrentDestination(null);
    }
  }, [schedule]);

  useEffect(() => {
    if (!isModalOpen) {
      console.log("clear curdess")
      setCurrentActivity(null);
      setCurrentDestination(null);
    }
  }, [isModalOpen]);

  // Add weather fetch effect
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [day, month, year] = inforSchedule.dateStart.split("-");
        let addressTemp = inforSchedule.address;

        if (addressTemp === "Bà Rịa - Vũng Tàu") addressTemp = "Vũng Tàu";
        if (addressTemp === "Lâm Đồng") addressTemp = "Đà Lạt";

        const startDate = new Date(year, month - 1, day);
        const currentDate = new Date();
        const diffTime = startDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 14) {
          // Bước 1: Lấy lat, lon từ tên địa điểm
          const geoRes = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${addressTemp}&limit=1&appid=e888d6c55a0c9f77c0f19776c545cd5d`
          );
          const geoData = await geoRes.json();
          if (!geoData.length) throw new Error("Không tìm thấy địa điểm.");

          const { lat, lon } = geoData[0];

          // Bước 2: Lấy dự báo 14 ngày
          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=14&appid=e888d6c55a0c9f77c0f19776c545cd5d&units=metric&lang=vi`
          );
          const weatherData = await weatherRes.json();

          setWeatherData(weatherData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thời tiết:", error);
      }
    };

    if (inforSchedule?.dateStart && inforSchedule?.address) {
      fetchWeather();
    }
  }, [inforSchedule?.dateStart, inforSchedule?.address]);


  // Function to get weather for specific day
  const getWeatherForDay = (dayIndex) => {
    if (!weatherData?.list) return null;

    const [day, month, year] = inforSchedule.dateStart.split("-");
    const startDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    const diffTime = startDate - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Get weather data for the specific day
    const weatherIndex = dayIndex + diffDays;
    return weatherData.list[weatherIndex];
  };

  const toggleDetails = () => {
    setIsOpen(!isOpen);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleMapView = (dayIndex) => {
    if (currentMapIndex === dayIndex) {
      setViewMode("overview");
      setCurrentMapIndex(null); // Close the map view if it's already open for this day
    } else {
      setCurrentMapIndex(dayIndex); // Open the map view for the selected day
    }
  };
  return (
    <div className="detail-container">
      <Droppable droppableId={`${index}`} disabled={mode === "view"}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="activity-details"
          >
            <div className="date-section">
              <div className="date-header">
                <div className="date-header-left">
                  <h2>
                    Ngày {scheduleDate.day}{" "}
                    <i
                      className={`fa-solid ${isOpen ? "fa-chevron-down" : "fa-chevron-left"
                        }`}
                      style={{ cursor: "pointer" }}
                      onClick={toggleDetails}
                    ></i>
                  </h2>
                  <div className={`weather-container ${isMobile ? "is-hidden" : ""}`}>
                    {getWeatherForDay(index) && (
                      <div className="weather-info">
                        <img
                          src={`http://openweathermap.org/img/wn/${getWeatherForDay(index).weather[0].icon}@2x.png`}
                          alt={getWeatherForDay(index).weather[0].description}
                        />
                        <div className="weather-details">
                          <span className="temperature">{Math.round(getWeatherForDay(index).temp.day)} / {Math.round(getWeatherForDay(index).temp.night)}°C</span>
                          <span className="description">{getWeatherForDay(index).weather[0].description}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div></div>
                </div>
                <div className="date-actions">
                  <button
                    className={`btn-overview ${viewMode === "overview" ? "active" : ""}`}
                    onClick={() => setViewMode("overview")}
                  >
                    Tổng quan
                  </button>
                  <button
                    className={`btn-details ${viewMode === "details" ? "active" : ""}`}
                    onClick={() => setViewMode("details")}
                  >
                    Xem chi tiết
                  </button>
                  <button
                    className={`btn-details ${viewMode === "map" ? "active" : ""}`}
                    onClick={() => {
                      toggleMapView(index); // Toggle map for the current day
                      setViewMode("map"); // Switch to map view
                    }}
                  >
                    Xem map
                  </button>
                </div>
              </div>

              {isOpen &&
                (viewMode === "map" && currentMapIndex === index ? (
                  // Show the map only if the currentMapIndex matches the day index
                  <MapViewWithRoute activities={scheduleDate.activity} scheduleID={inforSchedule._id} />
                ) : viewMode === "details" ? (
                  // Detailed view
                  scheduleDate.activity && scheduleDate.activity.length > 0 ? (
                    <Activity
                      activity={scheduleDate.activity}
                      setCurrentActivity={setCurrentActivity}
                      openModal={openModal}
                      inforSchedule={inforSchedule}
                      setInforSchedule={setInforSchedule}
                      setCurrentDestination={setCurrentDestination}
                      mode={mode}
                      socket={socket}
                      setShowLogin={setShowLogin}
                    />
                  ) : (
                    <p>Chưa có hoạt động nào</p>
                  )
                ) : (
                  // Overview view
                  <div className="activity-overview-container">
                    {scheduleDate.activity && scheduleDate.activity.length > 0 ? (
                      <ul className="activity-overview-list">
                        {scheduleDate.activity.map((act, index) => {
                          const activityTypeMap = {
                            Accommodation: "Chỗ ở",
                            Attraction: "Tham quan",
                            FoodService: "Ăn uống",
                          };

                          return (
                            <li
                              key={index}
                              className={`activity-type-${act.activityType}`}
                            >
                              <span className="activity-time">
                                {act.timeStart} - {act.timeEnd}
                              </span>
                              <span className="activity-type">
                                {activityTypeMap[act.activityType] || "Khác"}
                              </span>
                              <span className="activity-description">
                                {act.description || "Không có mô tả"}
                              </span>
                              <span className="activity-cost">
                                {act.cost.toLocaleString()} VND
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="no-activity-message">Chưa có hoạt động nào trong ngày này.</p>
                    )}
                  </div>
                ))}

              {isOpen && mode === "edit" && (
                <div className="add-new">
                  <button onClick={() => {
                    setCurrentActivity(null);
                    openModal();
                  }}>
                    <i className="fa-solid fa-plus add-icon"></i>
                    Thêm mới
                  </button>
                </div>
              )}
              {isOpen && mode === "edit" && (
                <RecommendPlace
                  city={city}
                  onSelectPlace={(place) => {
                    // Handle adding the selected place to the schedule
                    if (mode === "edit") {
                      // When a place is selected, we can open the add activity modal with prefilled data
                      const placeData = place.data;

                      // Ensure proper data formatting for different place types
                      const newDestination = {
                        _id: placeData._id,
                        name: place.type === 'Attraction' ? placeData.attractionName : placeData.foodServiceName,
                        type: place.type,
                        location: placeData.location,
                        images: placeData.images,
                        activityType: place.type,
                        // Add necessary properties based on type
                        ...(place.type === 'Attraction' ? {
                          attractionName: placeData.attractionName,
                          price: placeData.price,
                          amenities: placeData.amenities || [],
                          ratings: placeData.ratings || [],
                          description: placeData.description
                        } : {
                          foodServiceName: placeData.foodServiceName,
                          price: placeData.price || { minPrice: 0, maxPrice: 0 },
                          amenities: placeData.amenities || [],
                          ratings: placeData.ratings || [],
                          description: placeData.description,
                          serviceType: placeData.serviceType
                        })
                      };

                      // Create a minimal activity object to prefill the modal
                      const prefillActivity = {
                        activityType: place.type,
                        idDestination: placeData._id,
                        description: place.type === 'Attraction' ? placeData.attractionName : placeData.foodServiceName,
                        cost: place.type === 'Attraction' ? placeData.price : placeData.price?.minPrice || 0,
                        timeStart: "09:00",
                        timeEnd: "11:00",
                      };

                      // Set current activity and destination for the modal
                      setCurrentActivity(prefillActivity);
                      setCurrentDestination(newDestination);
                      openModal();
                    }
                  }}
                />
              )}

              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>

      <AddActivity
        isOpen={isModalOpen}
        closeModal={closeModal}
        currentDay={scheduleDate.day}
        activity={currentActivity}
        destination={currentDestination}
        setInforSchedule={setInforSchedule}
        city={city}
        socket={socket}
        inforSchedule={inforSchedule}
      />
    </div>
  );
};



const Schedule = ({ mode, setShowLogin }) => {
  const { url, token, user, getImageUrl } = useContext(StoreContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inforSchedule, setInforSchedule] = useState(null);
  const [isOpenInforSchedule, setIsOpenInforSchedule] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [isSaved, setIsSaved] = useState(false); // State to track wishlist status
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [totalActivities, setTotalActivities] = useState(0);
  const [cursors, setCursors] = useState(new Map());
  const [inactiveUsers, setInactiveUsers] = useState(new Set());
  const [viewTimer, setViewTimer] = useState(null);
  const [hasLoggedView, setHasLoggedView] = useState(false);
  const location = useLocation();
  const type = location.state?.type;

  // Thêm socket ref vào đây
  const socket = useRef(null);

  // Add log activity function
  const logActivity = async (actionType, content) => {
    try {
      await axios.post(
        `${url}/api/logs/create`,
        {
          userId: user._id,
          scheduleId: id,
          actionType,
          content
        },
        { headers: { token } }
      );
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };
  const reportSatisfaction = async (action, score, scheduleId) => {
    const userId = user._id
    console.log("action, score:", action, score)
    try {
      await axios.post(`${url}/api/userSatisfaction`, {
        userId,
        scheduleId,
        action,
        score,
      });
      console.log(`📤 Sent: ${action} (${score})`);
    } catch (err) {
      console.error("❌ Failed to report satisfaction:", err.message);
    }
  };
  const handleLike = (scheduleId) => {
    reportSatisfaction("like", 0.7, scheduleId);
  };
  const handleComment = (scheduleId) => {
    reportSatisfaction("comment", 0.8, scheduleId);
  };
  const handleSave = (scheduleId) => {
    reportSatisfaction("save", 0.9, scheduleId);
  };
  const handleEdit = (scheduleId) => {
    reportSatisfaction("edit", 1.0, scheduleId);
  };
  // Add view timer effect
  useEffect(() => {
    if (mode === "view" && inforSchedule && user && !hasLoggedView) {
      // Clear any existing timer
      if (viewTimer) {
        clearTimeout(viewTimer);
      }

      // Set new timer for 30 seconds
      const timer = setTimeout(async () => {
        await logActivity('view', 'Đã xem lịch trình trên 30 giây');
        setHasLoggedView(true);
      }, 30000);

      setViewTimer(timer);

      // Cleanup on unmount
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [mode, inforSchedule, user, hasLoggedView]);

  // Reset view logging when component unmounts or schedule changes
  useEffect(() => {
    return () => {
      setHasLoggedView(false);
      if (viewTimer) {
        clearTimeout(viewTimer);
      }
    };
  }, [id]);

  const toggleWishlist = async () => {
    try {
      if (!user) {
        setShowLogin(true);
        return;
      }
      const newStatus = !isSaved;
      setIsSaved(newStatus);

      const action = newStatus ? "add" : "remove";
      const response = await fetch(
        `${url}/api/user/user/${user._id}/addtoWishlist?type=schedule&itemId=${id}&action=${action}`,
        {
          method: "POST",
          headers: { token: token },
        }
      );
      if (type === "foryou" && newStatus === "add") {
        handleSave(id)
      }

      const result = await response.json();
      if (result.success) {
        // Log like action
        await logActivity('save', newStatus ? 'Đã lưu lịch trình' : 'Đã bỏ lưu lịch trình');
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error.message);
      setIsSaved((prevState) => !prevState);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${url}/api/schedule/${id}`);
      setInforSchedule(response.data.schedule);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchSchedule();
  }, [id]);

  useEffect(() => {
    if (inforSchedule) {
      setDateStart(convertDateFormat(inforSchedule.dateStart));
      setDateEnd(convertDateFormat(inforSchedule.dateEnd));

    }
  }, [loading]);

  useEffect(() => {
    setLoading(true);
    if (inforSchedule) {
      const isOwner = user && inforSchedule.idUser._id === user._id;
      const isInvitee = user && inforSchedule.idInvitee.some(invitee => invitee._id.toString() === user._id.toString());

      // Nếu đang ở chế độ "edit" và user không phải owner cũng không phải invitee -> Chuyển hướng 404
      if (mode === "edit" && !isOwner && !isInvitee) {
        setLoading(false);
        window.location.href = '/404';
      } else {
        setLoading(false);
      }
    }
  }, [inforSchedule, mode, user]);

  const updateSchedule = async () => {
    try {
      const response = await axios.put(
        `${url}/api/schedule/update/${inforSchedule._id}`,
        {
          ...inforSchedule,
        }
      );
      if (response.data.success) {
        console.log("Cập nhật lịch trình thành công:", response.data);
        // setInforSchedule(response.data.schedule)
      } else {
        console.error(
          "Lỗi khi cập nhật lịch trình:",
          response.data.message
        );
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };
  useEffect(() => {
    if (inforSchedule) {
      const newTotalActivities = inforSchedule.activities.reduce(
        (sum, day) => sum + day.activity.length,
        0
      );
      const updateAndFetch = async () => {
        await updateSchedule();
        fetchSchedule();
      };
      if (newTotalActivities > totalActivities) {
        updateAndFetch()
      }
      else if (mode === "edit") {
        updateSchedule();
      }
      setTotalActivities(newTotalActivities);
    }
  }, [inforSchedule]);

  const openInforSchedule = () => {
    setIsOpenInforSchedule(true);
  };

  const closeInforSchedule = () => {
    setIsOpenInforSchedule(false);
  };

  const onCompleted = () => {
    setInforSchedule((prevInfor) => {
      return { ...prevInfor, status: "Complete" };
    });
    navigate("/my-schedule");
    toast.success("Chỉnh sửa hoàn tất");
  };
  const onEdit = async () => {
    try {
      if (!user) {
        setShowLogin(true);
        return;
      }
      // Copy media from old schedule
      const response = await axios.post(
        `${url}/api/videos/copy-media`,
        { schedule: inforSchedule },
        { headers: { token } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const { imgSrc, videoSrc, activities } = response.data;

      // Reset bookingId for accommodation activities
      const updatedActivities = activities.map(day => ({
        ...day,
        activity: day.activity.map(act => {
          if (act.activityType === "Accommodation") {
            return { ...act, bookingId: null };
          }
          return act;
        })
      }));

      const newSchedule = {
        ...inforSchedule,
        status: "Draft",
        likes: [],
        comments: [],
        createdAt: new Date(),
        imgSrc: imgSrc || [],
        videoSrc: videoSrc || null,
        activities: updatedActivities
      };
      delete newSchedule._id;

      const createResponse = await axios.post(
        url + "/api/schedule/addNew",
        { schedule: newSchedule },
        { headers: { token } }
      );

      if (createResponse.data.success) {
        if (type === "foryou") {
          handleEdit(id)
        }
        // Log edit action
        await logActivity('edit', 'Đã bắt đầu chỉnh sửa lịch trình');

        const scheduleId = createResponse.data.schedule._id;
        window.location.href = `/schedule-edit/${scheduleId}`;
        toast.success("Lấy thành công");
      } else {
        toast.error(createResponse.data.message);
      }
    } catch (error) {
      console.error("Error in onEdit:", error);
      toast.error("Có lỗi xảy ra khi chỉnh sửa");
    }
  };
  const extractExpenses = (tour) => {
    const expenses = [];
    tour.activities.forEach((day) => {
      day.activity.forEach((activity) => {
        const expense = {
          id: Math.random(),
          location: tour.address,
          cost: activity.cost,
          costDescription: activity.costDescription,
          icon: activity.imgSrc,
        };
        expenses.push(expense);
      });
    });
    return expenses;
  };

  const extractAdditionExpenses = (tour) => {
    const additonExpenses = [];
    tour.additionalExpenses.forEach((addExpense) => {
      const additonExpense = {
        id: addExpense._id,
        name: addExpense.name,
        cost: addExpense.cost,
        description: addExpense.description,
      };
      additonExpenses.push(additonExpense);
    });
    return additonExpenses;
  };

  const calculateDaysAndNights = (dateStart, dateEnd) => {
    const [dayStart, monthStart, yearStart] = dateStart.split("-");
    const [dayEnd, monthEnd, yearEnd] = dateEnd.split("-");
    const startDate = new Date(`${yearStart}-${monthStart}-${dayStart}`);
    const endDate = new Date(`${yearEnd}-${monthEnd}-${dayEnd}`);
    const timeDifference = endDate - startDate;
    const daysDifference = timeDifference / (1000 * 3600 * 24) + 1;
    const nights = daysDifference - 1;
    return `${daysDifference} ngày ${nights} đêm`;
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Nếu cùng một DateSchedule
    if (source.droppableId === destination.droppableId) {
      const dayIndex = parseInt(source.droppableId, 10);
      const updatedActivities = Array.from(
        inforSchedule.activities[dayIndex].activity
      );

      // Di chuyển trong cùng một ngày
      const [movedItem] = updatedActivities.splice(source.index, 1);
      updatedActivities.splice(destination.index, 0, movedItem);

      const updatedSchedule = [...inforSchedule.activities];
      updatedSchedule[dayIndex].activity = updatedActivities;

      setInforSchedule((prev) => {
        const newSchedule = {
          ...prev,
          activities: updatedSchedule,
        };

        // Emit sự kiện để update real-time
        if (socket.current) {
          socket.current.emit('updateActivities', {
            scheduleId: inforSchedule._id,
            activities: updatedSchedule
          });
        }

        return newSchedule;
      });
    } else {
      // Nếu khác DateSchedule
      const sourceDayIndex = parseInt(source.droppableId, 10);
      const destDayIndex = parseInt(destination.droppableId, 10);

      const sourceDay = Array.from(
        inforSchedule.activities[sourceDayIndex].activity
      );
      const destDay = Array.from(
        inforSchedule.activities[destDayIndex].activity
      );

      // Di chuyển sang ngày khác
      const [movedItem] = sourceDay.splice(source.index, 1);
      destDay.splice(destination.index, 0, movedItem);

      const updatedSchedule = [...inforSchedule.activities];
      updatedSchedule[sourceDayIndex].activity = sourceDay;
      updatedSchedule[destDayIndex].activity = destDay;

      setInforSchedule((prev) => {
        const newSchedule = {
          ...prev,
          activities: updatedSchedule,
        };

        // Emit sự kiện để update real-time
        if (socket.current) {
          socket.current.emit('updateActivities', {
            scheduleId: inforSchedule._id,
            activities: updatedSchedule
          });
        }

        return newSchedule;
      });
    }
  };

  const onCloseInviteModal = () => {
    setOpenInviteModal(false);
  };

  useEffect(() => {
    if (mode === "edit" && inforSchedule) {
      const allUsers = new Set([
        inforSchedule.idUser._id,
        ...(inforSchedule.idInvitee?.map(user => user._id) || [])
      ]);
      setInactiveUsers(allUsers);

      socket.current = io(url, {
        transports: ['websocket'],
        upgrade: false
      });

      socket.current.emit('joinSchedule', {
        scheduleId: inforSchedule._id,
        user: user
      });

      // Lắng nghe các sự kiện update
      socket.current.on('activitiesUpdated', (activities) => {
        setInforSchedule(prev => ({ ...prev, activities }));
      });

      socket.current.on('scheduleInfoUpdated', (scheduleInfo) => {
        setInforSchedule(prev => ({ ...prev, ...scheduleInfo }));
      });

      socket.current.on('expensesUpdated', (expenses) => {
        setInforSchedule(prev => ({
          ...prev,
          additionalExpenses: expenses
        }));
      });

      // Thêm lại các event listeners cho cursor
      socket.current.on('cursorUpdate', (cursor) => {
        setCursors(prev => new Map(prev.set(cursor.userId, cursor)));
        setInactiveUsers(prev => {
          const next = new Set(prev);
          next.delete(cursor.userId);
          return next;
        });
      });

      socket.current.on('userJoined', (user) => {
        toast(`${user.name} đã tham gia chỉnh sửa`, {
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
        });
      });

      socket.current.on('userLeft', (userId) => {
        setCursors(prev => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
      });

      socket.current.on('userInactive', (userId) => {
        setInactiveUsers(prev => new Set(prev.add(userId)));
      });

      // Tối ưu handleMouseMove với throttle
      const handleMouseMove = _.throttle((e) => {
        if (socket.current) {
          const scheduleElement = document.querySelector('.custom-schedule');
          if (scheduleElement) {
            const targetElement = e.target.closest('button, h2, .activity-item, .expense-item, .time-schedule-item, input, select');

            if (targetElement) {
              const elementRect = targetElement.getBoundingClientRect();
              const scheduleRect = scheduleElement.getBoundingClientRect();

              const relativeX = ((e.clientX - elementRect.left) / elementRect.width) * 100;
              const relativeY = ((e.clientY - elementRect.top) / elementRect.height) * 100;

              socket.current.volatile.emit('cursorMove', {
                scheduleId: inforSchedule._id,
                x: relativeX,
                y: relativeY,
                targetInfo: {
                  type: targetElement.tagName.toLowerCase(),
                  className: targetElement.className,
                  id: targetElement.id,
                  text: targetElement.textContent?.slice(0, 50),
                  offsetTop: targetElement.offsetTop,
                  offsetLeft: targetElement.offsetLeft,
                  width: elementRect.width,
                  height: elementRect.height
                }
              });
            }
          }
        }
      }, 16);

      document.addEventListener('mousemove', handleMouseMove);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        handleMouseMove.cancel();
        if (socket.current) {
          socket.current.emit('leaveSchedule', inforSchedule._id);
          socket.current.disconnect();
        }
      };
    }
  }, [mode, inforSchedule?._id, user]);

  // Thêm hàm render cursors
  const renderCursors = () => {
    const scheduleElement = document.querySelector('.custom-schedule');
    if (!scheduleElement) return null;

    return Array.from(cursors.values()).map(cursor => {
      let position = {
        left: `${cursor.x}%`,
        top: `${cursor.y}%`
      };

      // Nếu có thông tin về phần tử đang hover
      if (cursor.targetInfo) {
        // Tìm phần tử tương ứng dựa trên thông tin
        const targetElement = findMatchingElement(cursor.targetInfo);

        if (targetElement) {
          const elementRect = targetElement.getBoundingClientRect();
          // Tính toán vị trí chính xác trên phần tử
          position = {
            left: `${elementRect.left + (cursor.x * elementRect.width / 100)}px`,
            top: `${elementRect.top + (cursor.y * elementRect.height / 100)}px`
          };
        }
      }

      return (
        <div
          key={cursor.userId}
          className="cursor-container"
          style={{
            ...position,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="cursor"></div>
          <div className="cursor-label">{cursor.name}</div>
        </div>
      );
    });
  };

  // Hàm tìm phần tử tương ứng dựa trên thông tin
  const findMatchingElement = (targetInfo) => {
    const elements = document.querySelectorAll(
      `${targetInfo.type}${targetInfo.className ? `.${targetInfo.className.split(' ').join('.')}` : ''}${targetInfo.id ? `#${targetInfo.id}` : ''}`
    );

    // Tìm phần tử phù hợp nhất dựa trên vị trí và nội dung
    return Array.from(elements).find(element => {
      const matchesText = !targetInfo.text || element.textContent?.includes(targetInfo.text);
      const matchesPosition = Math.abs(element.offsetTop - targetInfo.offsetTop) < 10 &&
        Math.abs(element.offsetLeft - targetInfo.offsetLeft) < 10;
      return matchesText && matchesPosition;
    });
  };

  // Thêm lại các hàm xử lý video popup
  const openVideoPopup = () => setIsVideoOpen(true);
  const closeVideoPopup = () => setIsVideoOpen(false);
  const isUnActive = (id) => {
    if (id === user._id)
      return false;
    return inactiveUsers.has(id);
  }

  // Add share function
  const handleShare = async () => {
    // Use meta tags URL for better social sharing preview
    const shareUrl = `${url}/api/schedule/meta/${id}`;
    const shareText = `Xem lịch trình "${inforSchedule.scheduleName}" tại ${inforSchedule.address}`;

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: inforSchedule.scheduleName,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to copy link
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link đã được sao chép vào clipboard!");
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("Link đã được sao chép vào clipboard!");
      } catch (fallbackError) {
        toast.error("Không thể sao chép link. Vui lòng thử lại!");
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="custom-schedule">
      {/* Dynamic Meta Tags for Social Sharing */}
      <ScheduleMetaTags schedule={inforSchedule} url={url} />

      <div className="custom-schedule-header">
        <div>
          <h1 className="num-title">
            {mode === "view" ? "Xem  lịch trình" : "Chỉnh sửa lịch trình"}
          </h1>
          <span className="num-text">Tác giả: {inforSchedule.idUser.name}</span>

        </div>
        <div>
          {mode === "view" && (
            <button className="custom-schedule-btn" onClick={onEdit}>
              Chỉnh sửa ngay
            </button>
          )}

          {mode === "edit" && (
            <div className="invitee_container">
              <div className="invitee_item" data-tooltip-id="avata-tooltip">
                <img
                  className={`invitee_image ${isUnActive(inforSchedule.idUser._id) ? "unactive_avatar" : ""}`}
                  src={inforSchedule.idUser.avatar && inforSchedule.idUser.avatar.includes("http") ? inforSchedule.idUser.avatar : `${url}/images/${inforSchedule.idUser.avatar}`}
                  alt={inforSchedule.idUser.name}
                />

              </div>
              <Tooltip
                id="avata-tooltip"
                place="bottom"
                style={{ fontSize: "12px", zIndex: "999", borderRadius: "10px" }}
                content={inforSchedule.idUser._id === user._id ? "Bạn" : `${inforSchedule.idUser.name}${inactiveUsers.has(inforSchedule.idUser._id) ? "" : " (Hoạt động)"}`} />

              {inforSchedule.idInvitee?.map((invitee, index) => (
                <div key={index} className="invitee_item" data-tooltip-id={`avata-tooltip-${index}`}>
                  <img
                    className={`invitee_image ${isUnActive(invitee._id) ? "unactive_avatar" : ""}`}
                    src={invitee.avatar && invitee.avatar.includes("http") ? invitee.avatar : `${url}/images/${invitee.avatar}`}
                    alt={invitee.name}
                  />
                  <Tooltip
                    id={`avata-tooltip-${index}`}
                    place="bottom"
                    style={{ fontSize: "12px", zIndex: "999", borderRadius: "10px" }}
                    content={
                      invitee._id === user._id
                        ? "Bạn"
                        : `${invitee.name}${inactiveUsers.has(invitee._id) ? "" : " (Hoạt động)"}`
                    }
                  />

                </div>
              ))}
              <button className="invitee_button" data-tooltip-id="save-tooltip" onClick={() => setOpenInviteModal(true)}>
                <i className="fa-solid fa-user-plus"></i>
                <Tooltip id="save-tooltip" place="top" style={{ fontSize: "12px", zIndex: "999", borderRadius: "10px" }} content="Thêm người tham gia" />
              </button>
            </div>
          )}
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd} >
        <div className="schedule-container">
          <div className="schedule-image">
            {inforSchedule.imgSrc && inforSchedule.imgSrc[0] ? (

              <img
                className="custom-schedule-image"
                src={getImageUrl(inforSchedule)}
                alt="Schedule Image"
              />
            ) : inforSchedule.videoSrc ? (
              <div>
                <video
                  className="custom-schedule-video"
                  controls
                  src={inforSchedule.videoSrc}
                  poster="https://res.cloudinary.com/dmdzku5og/image/upload/v1753888598/du-lich-viet-nam_a5b5777f771c44a89aee7f59151e7f95_xh9zbs.jpg"
                >
                  Your browser does not support the video tag.
                </video>
                <button onClick={openVideoPopup} className="video-button">
                  Xem video
                </button>
              </div>
            ) : (
              // Nếu không có cả ảnh lẫn video, hiển thị ảnh mặc định
              <img
                className="custom-schedule-image"
                src="https://res.cloudinary.com/dmdzku5og/image/upload/v1753888598/du-lich-viet-nam_a5b5777f771c44a89aee7f59151e7f95_xh9zbs.jpg"
                alt="Default Alaska"
              />
            )}
          </div>

          <div className="header-container">
            <div className="activity-header">
              <div className="title-des">
                <h2>{inforSchedule.scheduleName}</h2>
                <div className="date-schedule">
                  <div className="numday-title">
                    <i className="fa-regular fa-calendar-days"></i>
                    <p>Từ</p>
                  </div>
                  <input value={inforSchedule.dateStart} disabled={true} />
                  <p>Đến</p>
                  {/* Bind the date input to dateEnd state */}
                  <input value={inforSchedule.dateEnd} disabled={true} />
                </div>
                <div className="date-schedule">
                  <div className="numday-title">
                    <i className="fa-regular fa-clock"></i>
                    <p>Số ngày</p>
                  </div>
                  <p>{calculateDaysAndNights(dateStart, dateEnd)}</p>
                </div>
                <p className="des-schedule">{inforSchedule.description}</p>
              </div>
              <div className="confirm-booking">
                {mode === "edit" ? (
                  <div className="title-button" onClick={openInforSchedule}>
                    <i className="fa-solid fa-pen schedule-icon"></i>
                    <button className="save-and-share-btn">
                      Chỉnh sửa
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className={`title-button ${isSaved ? "saved" : ""} `} onClick={toggleWishlist}>
                      <i className="fa-solid fa-bookmark schedule-icon"></i>
                      <button
                        className="save-and-share-btn"
                      >
                        Lưu lịch trình
                      </button>
                    </div>
                    <div className="title-button" onClick={handleShare} style={{ cursor: 'pointer' }}>
                      <i className="fa-solid fa-share schedule-icon"></i>
                      <button className="save-and-share-btn">
                        Chia sẻ lịch trình
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {inforSchedule.activities?.length > 0 ? (
            inforSchedule.activities.map((schedule, index) => {
              return (
                <DateSchedule
                  key={index}
                  index={index}
                  schedule={schedule}
                  city={inforSchedule.address}
                  setInforSchedule={setInforSchedule}
                  mode={mode}
                  inforSchedule={inforSchedule}
                  socket={socket}
                  setShowLogin={setShowLogin}
                />
              );
            })
          ) : (
            <p>No schedule available</p>
          )}
        </div>
      </DragDropContext>

      <div className="footer-schedule">
        <Expense
          expenses={extractExpenses(inforSchedule)}
          additionExpenses={extractAdditionExpenses(inforSchedule)}
          setInforSchedule={setInforSchedule}
          mode={mode}
          socket={socket}
          inforSchedule={inforSchedule}
        />
      </div>
      {mode === "edit" && (
        <div className="save-schedule">
          <button className="btn-save-schedule" onClick={onCompleted}>
            Hoàn thành
          </button>
        </div>
      )}

      <Comment
        schedule={inforSchedule}
        {...(type === "foryou" && {
          onLikeClick: handleLike,
          onComment: handleComment
        })}
        setShowLogin={setShowLogin}
        handleShare={handleShare}
      />
      <InforScheduleMedal
        isOpen={isOpenInforSchedule}
        closeModal={closeInforSchedule}
        inforSchedule={inforSchedule}
        setInforSchedule={setInforSchedule}
        socket={socket}
      />


      <Modal
        isOpen={isVideoOpen}
        onRequestClose={closeVideoPopup}
        contentLabel="Video Popup"
        className="video-popup-modal"
        overlayClassName="video-popup-overlay"
      >
        <div className="video-popup-content">
          <button onClick={closeVideoPopup} className="close-popup-button" >
            <i className="fa-regular fa-circle-xmark"></i>
          </button>
          <video
            className="popup-video"
            controls
            autoPlay
            loop
            src={inforSchedule.videoSrc}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </Modal>

      <InviteTripmatesModal isOpen={openInviteModal} onClose={onCloseInviteModal} schedule={inforSchedule} setInforSchedule={setInforSchedule}> </InviteTripmatesModal>

      {/* Render cursors */}
      {mode === "edit" && (
        <div className="cursors-container">
          {renderCursors()}
        </div>
      )}
    </div>
  );
};

export default Schedule;