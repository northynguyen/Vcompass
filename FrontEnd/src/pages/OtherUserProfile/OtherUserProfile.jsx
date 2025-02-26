import axios from "axios";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { CgProfile } from "react-icons/cg";
import { FaTransgender } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { HiDotsHorizontal } from "react-icons/hi";
import { RiUserUnfollowLine } from "react-icons/ri";
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StoreContext } from "../../Context/StoreContext";
import ImagesModal from '../../components/ImagesModal/ImagesModal';
import PostCard from "../../components/Poster/PostCard";
import "./OtherUserProfile.css";

export default function OtherUserProfile() {
  const [isFollow, setIsFollow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { url, token, user } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [currentUser, setCurrentUser] = useState();
  const [currentTab, setCurrentTab] = useState("Bài viết");
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [imageList, setImageList] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [openFollowerMenu, setOpenFollowerMenu] = useState(null);
  const [unfollowerList, setUnfollowerList] = useState([]);

  const navigate = useNavigate();
  const onFollowClick = () => {
    handleToggleFollow()
  }
  const toggleFollowerMenu = (id) => {
    setOpenFollowerMenu(openFollowerMenu === id ? null : id); // Nếu bấm lại sẽ ẩn menu
  };
  const onCreateNewPostClick = () => {
    navigate("/create-schedule")
  }
  const calculateTotalLikes = () => {
    return schedules.reduce((total, schedule) => total + (schedule.likes.length || 0), 0);
  }
  const calculateTotalPosts = () => {
    return schedules.reduce((total, schedule) => total + (schedule.isPublic ? 1 : 0), 0);
  }
  const openModal = (index) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  // Close the Modal
  const closeModal = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    if (schedules) {
      setTotalLikes(calculateTotalLikes());
      setTotalPosts(calculateTotalPosts());
      filterImage()
      filterVideo()
    }
  }, [schedules]);
  const handleScheduleClick = (id) => {
    navigate(`/schedule-view/${id}`);
  };
  const filterImage = () => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]; // Danh sách các định dạng ảnh hợp lệ
    const imageList = [];

    const collectImages = (imgSrcArray) => {
      imgSrcArray?.forEach(img => {
        if (allowedExtensions.some(ext => img.endsWith(ext))) {
          imageList.push(img);
        }
      });
    };

    // Duyệt schedules chính
    schedules.forEach(schedule => {
      if (schedule.imgSrc) {
        collectImages(schedule.imgSrc);
      }
    });

    // Duyệt schedules trong activities
    schedules.forEach(schedule => {
      schedule.activities?.forEach(day => {
        day.activity?.forEach(acc => {
          if (acc.imgSrc) {
            collectImages(acc.imgSrc);
          }
        });
      });
    });

    setImageList(imageList);
  };
  const handleUserClick = (id) => {
    navigate(`/otherUserProfile/${id}`);
    window.location.reload()
  };

  const filterVideo = () => {
    const mp4Video = [];
    const allowedExtensions = [".mov", ".mp4", ".avi", ".mkv", ".flv", ".webm"];

    schedules.forEach(schedule => {
      if (schedule.imgSrc) {
        if (allowedExtensions.some(ext => schedule.videoSrc?.endsWith(ext))) {
          mp4Video.push(schedule.videoSrc);
        }
      }
    });
    setVideoList(mp4Video);
  };
  const handleToggleFollow = async () => {
    try {
      const newStatus = !isFollow;
      setIsFollow(newStatus);
      const action = newStatus ? "add" : "remove";
      const response = await fetch(
        `${url}/api/user/user/follow-or-unfollow?otherUserId=${currentUser._id}&action=${action}`,
        {
          method: "PUT",
          headers: { token: token },
        }
      );

      const result = await response.json();
      if (!result.success) {
        toast.error(result.message);
      }
      toast.success(result.message);
    } catch (error) {
      setIsFollow((prevState) => !prevState);
    }
  };
  const handleToggleFollowForFollower = async (id, action) => {
    try {
      const response = await fetch(
        `${url}/api/user/user/follow-or-unfollow?otherUserId=${id}&action=${action}`,
        {
          method: "PUT",
          headers: { token: token },
        }
      );
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        setUnfollowerList((prevList) => {
          if (action === "remove") {
            return [...prevList, id];
          } else {
            return prevList.filter((unfollowedId) => unfollowedId !== id);
          }
        });
      }

    } catch (error) {
    }
  };
  useEffect(() => {
    const fetchSchedulesData = async () => {
      try {
        const schedulesResponse = await axios.get(
          `${url}/api/schedule/otherUser/getSchedules/${id}`
        );
        if (schedulesResponse.data.success) {
          setSchedules(schedulesResponse.data.schedules);
          console.log('schedulesResponse:', schedulesResponse)
        } else {
          console.error("Failed to fetch schedules:", schedulesResponse.data.message);
        }
      } catch (error) {
        console.error("Error fetching schedules or wishlists:", error);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${url}/api/user/user/${id}/followers`);
        if (response.data.success) {
          setCurrentUser(response.data.user)
          console.log("CurrentUser", response.data.user)
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (token) {
      fetchUser()
      fetchSchedulesData();
    }
  }, [token, url]);
  useEffect(() => {
    if (currentUser && user) {
      console.log("user ", user)
      if (currentUser._id === user._id) {
        setIsMyProfile(true);
        console.log('my profile')
      } else {
        currentUser?.follower?.forEach(flw => {
          if (flw._id === user._id) {
            setIsFollow(true)
          }
        })
      }
    }
  }, [currentUser, user]);
  const isUnFollow = useMemo(() => (id) => unfollowerList.includes(id), [unfollowerList]);
  useEffect(() => {
    console.log("unfollowerList updated:", unfollowerList);
  }, [unfollowerList]);
  const otherUserTabList = ["Bài viết", "Ảnh", "Video", "Người theo dõi"]
  const myTabList = ["Bài viết", "Ảnh", "Video", "Người theo dõi", "Đang theo dõi"]

  if (isLoading || !currentUser) return <div>Loading...</div>;
  return (
    <div className="fanpage-container">
      <div className="fanpage-header-container">
        {/* Header */}
        <div className="fanpage-header">
          <div className="fanpage-header-left">
            <img src={currentUser.avatar && currentUser.avatar.includes("http") ? currentUser.avatar : currentUser.avatar ? `${url}/images/${currentUser.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="Avatar" className="fanpage-avatar" />
            <div>
              <h1 className="fanpage-title">{currentUser.name}</h1>
              {!isLoading &&
                <p className="fanpage-stats">{totalPosts} bài viết • {totalLikes} lượt thích • {currentUser.follower.length} người theo dõi</p>
              }
            </div>
          </div>
          {!isMyProfile &&
            <button
              className={`fanpage-watch-button ${isFollow ? "followed" : ""}`}
              onClick={onFollowClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isFollow ? (isHovered ? "Bỏ theo dõi" : "Đang theo dõi") : "Theo dõi"}
            </button>
          }
          {isMyProfile &&
            <button
              className={`fanpage-watch-button ${isFollow ? "followed" : ""}`}
              onClick={onCreateNewPostClick}
            >
              Tạo lịch trình mới
            </button>
          }
        </div>

        {/* Tabs */}
        <div className="fanpage-tabs">
          {(isMyProfile ? myTabList : otherUserTabList).map((tab) => (
            <button
              key={tab}
              className={`fanpage-tab-button ${currentTab === tab ? "tab-active" : ""}`}
              onClick={() => setCurrentTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {/* Posts */}
      <div className="fanpage-content">
        <div className="fanpage-introduce">
          <div>
            <h5 className="fanpage-title">Giới thiệu </h5>
            <div className="profile-detail-infor">
              <FaLocationDot />
              <p className="profile-detail-infor-text">Sống ở {currentUser.address}</p>
            </div>
            <div className="profile-detail-infor">
              <FaTransgender />
              <p className="profile-detail-infor-text">
                {`Giới tính ${currentUser.gender === 'male' ? "Nam" : "Nữ"}`}
              </p>
            </div>

          </div>
        </div>
        <div className="fanpage-posts">
          {currentTab === "Bài viết" &&
            <div className="post-section">
              {!isLoading &&
                schedules?.slice().reverse().map((schedule) => (
                  schedule.isPublic &&
                  <PostCard
                    key={schedule._id}
                    schedule={schedule}
                    handleScheduleClick={handleScheduleClick}
                  />
                ))}
            </div>}
          {currentTab === "Ảnh" &&
            <div className="image-section">
              {!isLoading &&
                imageList.map((img, index) => (
                  <img
                    key={index}
                    src={img?.includes("http") ? img : `${url}/images/${img}`}
                    alt={`Image ${index}`}
                    className="image-item"
                    onClick={() => openModal(index)}
                  />
                ))}
            </div>}
          {currentTab === "Video" &&
            <div className="video-section">
              {!isLoading &&
                videoList.map((video, index) => (
                  <video
                    key={index}
                    className="content-video"
                    src={video}
                    loop
                    muted
                    controls>
                    Your browser does not support the video tag.
                  </video>
                ))}
            </div>}
          {currentTab === "Người theo dõi" &&
            <div className="follower-section">
              {!isLoading &&
                currentUser?.follower?.map((follower) => (
                  <div className="follower-item" key={follower._id}>
                    <div className="follower-info">
                      <img src={follower.avatar && follower.avatar.includes("http") ? follower.avatar : follower.avatar ? `${url}/images/${follower.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="Avatar" className="follower-avatar"
                        onClick={() => { handleUserClick(follower._id) }} />
                      <div>
                        <a className="follower-name" onClick={() => { handleUserClick(follower._id) }}>{follower.name}</a>
                        <p className="follower-num-follower">{follower.follower.length} người theo dõi</p>
                      </div>
                    </div>
                    {isMyProfile &&
                      <div className="follower-more-info">
                        <HiDotsHorizontal />
                      </div>
                    }
                  </div>
                ))}
            </div>}
          {currentTab === "Đang theo dõi" &&
            <div className="follower-section">
              {!isLoading &&
                currentUser?.following?.map((following) => (
                  <div className="follower-item" key={following._id}>
                    <div className="follower-info">
                      <img src={following.avatar && following.avatar.includes("http") ? following.avatar : following.avatar ? `${url}/images/${following.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="Avatar" className="follower-avatar"
                        onClick={() => { handleUserClick(following._id) }} />
                      <div>
                        <a className="follower-name" onClick={() => { handleUserClick(following._id) }}>{following.name}</a>
                        <p className="follower-num-follower">{following.follower.length} người theo dõi</p>
                      </div>
                    </div>
                    {isMyProfile && (
                      isUnFollow(following._id) ? (
                        <button className="follower-follow-button" onClick={() => handleToggleFollowForFollower(following._id, "add")}>
                          Theo dõi
                        </button>
                      ) : (
                        <div className="follower-more-info">
                          <HiDotsHorizontal onClick={() => toggleFollowerMenu(following._id)} />
                          {openFollowerMenu === following._id && (
                            <div className="dropdown-menu">
                              <div className="follower-menu-button" onClick={() => handleUserClick(following._id)}>
                                <CgProfile />
                                <button>Xem hồ sơ</button>
                              </div>
                              <div className="follower-menu-button" onClick={() => handleToggleFollowForFollower(following._id, "remove")}>
                                <RiUserUnfollowLine />
                                <button>Bỏ theo dõi</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ))}
            </div>}
        </div>
      </div>
      <ImagesModal
        isOpen={isModalOpen}
        images={imageList}
        selectedIndex={selectedImageIndex}
        onClose={closeModal}
      />
    </div>

  );
}
