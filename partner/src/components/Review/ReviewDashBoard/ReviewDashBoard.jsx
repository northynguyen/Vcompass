import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { FaHotel } from "react-icons/fa";
import { IoMdRestaurant } from "react-icons/io";
import ReactLoading from 'react-loading';
import { toast } from 'react-toastify';
import { StoreContext } from "../../../Context/StoreContext";
import ReviewCard from '../ReviewCard/ReviewCard';
import StatisticsPanel from '../StatisticsPanel/StatisticsPanel';
import './ReviewDashBoard.css';

const ReviewDashboard = () => {
    const [accommodations, setAccommodations] = useState();
    const [currentType, setCurrentType] = useState("accommodation");
    const [foodServices, setFoodService] = useState();
    const [currentService, setCurrentService] = useState();
    const [isAccomLoading, setIsAccomLoading] = useState(true);
    const [isFoodServiceLoading, setIsBookingLoading] = useState(true);
    const { token, url, user } = useContext(StoreContext);
    const [ratings, setRatings] = useState();
    let selectedIndex = 0;

    useEffect(() => {
        const fetchAccommodations = async () => {
            try {
                setIsAccomLoading(true)
                const response = await axios.get(
                    `${url}/api/accommodations/${user._id}`
                );
                if (response.data.success) {
                    setAccommodations(response.data.accommodations);
                } else {
                    console.error("Error fetching accommodations:");
                }
            } catch (error) {
            } finally {
                setIsAccomLoading(false);
            }
        };
        const fetchFoodServices = async () => {
            try {
                setIsBookingLoading(true)
                const response = await axios.get(
                    `${url}/api/foodServices/partner/${user._id}`
                );
                if (response.data.success) {
                    setFoodService(response.data.foodService);
                } else {
                    console.error("Error fetching accommodations:");
                }
            } catch (error) {
            } finally {
                setIsBookingLoading(false);
            }
        };
        fetchFoodServices()
        fetchAccommodations()
    }, [token, url]);
    useEffect(() => {
        if (currentType === 'accommodation' && accommodations) {
            setCurrentService(accommodations[0])
            setRatings(accommodations[0]?.ratings)
        } else if (currentType === 'foodService' && foodServices) {
            setCurrentService(foodServices[0])
            setRatings(foodServices[0]?.ratings)
        }
    }, [currentType]);
    useEffect(() => {
        if (!isAccomLoading) {
            setCurrentService(accommodations[0])
            setRatings(accommodations[0]?.ratings)
        }
    }, [isAccomLoading]);
    useEffect(() => {
        if (currentType === 'accommodation' && !isAccomLoading) {
            setCurrentService(accommodations[selectedIndex])
            setRatings(accommodations[selectedIndex]?.ratings)
        } else if (currentType === 'foodService' && !isFoodServiceLoading) {
            console.log('foodService', foodServices[selectedIndex])
            setRatings(foodServices[selectedIndex]?.ratings)
        }   
    }, [accommodations, foodServices]);
    const handleResponse = (ratingId, responseText) => {
        if (currentType === "accommodation") {
            updateResponse(ratingId, responseText)
            setAccommodations((prevAccommodations) => {
                return prevAccommodations.map((accommodation) => {
                    if (accommodation._id === currentService._id) {
                        const updatedRatings = accommodation.ratings.map((rating) => {
                            if (rating._id === ratingId) {
                                return {
                                    ...rating,
                                    response: responseText,
                                    responseTime: new Date(),
                                };
                            }
                            return rating;
                        });
                        return {
                            ...accommodation,
                            ratings: updatedRatings,
                        };
                    }
                    return accommodation;
                });
            })
        } else if (currentType === 'foodService') {
            updateResponse(ratingId, responseText)
            setFoodService((prevFoodService) => {
                return prevFoodService.map((foodService) => {
                    if (foodService._id === currentService._id) {
                        const updatedRatings = foodService.ratings.map((rating) => {
                            if (rating._id === ratingId) {
                                return {
                                    ...rating,
                                    response: responseText,
                                    responseTime: new Date(),
                                };
                            }
                            return rating;
                        });
                        return {
                            ...foodService,
                            ratings: updatedRatings,
                        };
                    }
                    return foodService;
                });
            })
        }
    }
    const handleFilterChange = (value) => {
        let sortedRatings = [...ratings];
        switch (value) {
            case 'oldest':
                sortedRatings.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
                break;
            case 'newest':
                sortedRatings.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'notResponse':
                sortedRatings.sort((a, b) => (!a.response ? -1 : 1));
                break;
            case 'responsed':
                sortedRatings.sort((a, b) => (a.response ? -1 : 1));
                break;
            default:
                break;
        }
        setRatings(sortedRatings);
    }
    const handleServiceChange = (index) => {
        selectedIndex = index
        if (currentType === 'accommodation') {
            setCurrentService(accommodations[selectedIndex]);
            setRatings(accommodations[selectedIndex].ratings)
        } else if (currentType === 'foodService') {
            setCurrentService(foodServices[selectedIndex]);
            setRatings(foodServices[selectedIndex].ratings)
        }
    }
    const updateResponse = (ratingId, responseText) => {
        const responseData = {
            response: responseText,
            responseTime: new Date(),
        };
        if (currentType === 'accommodation') {
            axios.put(`${url}/api/accommodations/updateRating/${currentService._id}/ratings/${ratingId}`, responseData)
                .then((response) => {
                    if (response.data.message) {
                        toast.success(response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error updating rating:', error);
                    toast.error('Phản hồi không thành công');
                });
        } else if (currentType === 'foodService') {
            axios.put(`${url}/api/foodServices/updateRating/${currentService._id}/ratings/${ratingId}`, responseData)
                .then((response) => {
                    if (response.data.message) {
                        toast.success(response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error updating rating:', error);
                    toast.error('Phản hồi không thành công');
                });
        }

    }
    if (isFoodServiceLoading || isAccomLoading) {
        return (
            <div className="loading-container">
                <ReactLoading type="spin" color="#000" height={50} width={50} />
            </div>
        );
    }
    return (
        <div className="review-dashboard">
            <h2  className='main-title'>Đánh giá dịch vụ</h2>

            <div className="service-bar">
                <div className="date-actions">
                    <button
                        className={`btn-overview date-actions-btn ${currentType === "accommodation" ? "active" : ""}`}
                        onClick={() => setCurrentType("accommodation")}
                    >
                        <FaHotel /> Khách sạn
                    </button>
                    <button
                        className={`btn-details date-actions-btn ${currentType === "foodService" ? "active" : ""}`}
                        onClick={() => setCurrentType("foodService")}>
                        <IoMdRestaurant /> Dịch vụ ăn uống
                    </button>
                </div>
                {currentType === "accommodation" &&
                    <select name="responseStatus" onChange={(event) => {
                        handleServiceChange(event.target.selectedIndex);
                    }}>
                        {accommodations
                            .map((accom, index) => (
                                <option key={index} value={accom._id}>
                                    {`${accom.name}     (${accom.ratings.length} đánh giá)`}
                                </option>
                            ))}
                    </select>
                }
                {currentType === "foodService" &&
                    <select name="responseStatus" onChange={(event) => {
                        handleServiceChange(event.target.selectedIndex);
                    }}>
                        {foodServices.map((foodService, index) => {
                            return (
                                <option className='aligned-option' key={index} value={foodService._id}>
                                    {`${foodService.foodServiceName}     (${foodService.ratings.length} đánh giá)`}
                                </option>
                            );
                        })}
                    </select>
                }

            </div>
            {ratings && <StatisticsPanel ratings={ratings} />}
            <div className="filter-bar">
                <h5>Sắp xếp theo: </h5>
                <select name="responseStatus" onChange={(event) => { handleFilterChange(event.target.value) }}>
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="notResponse">Chưa phản hồi</option>
                    <option value="responsed">Đã phản hồi</option>
                </select>
            </div>
            {ratings &&
                <div className="review-list">
                    {ratings.map((rating) => (
                        <ReviewCard
                            key={rating._id}
                            service={currentService}
                            rating={rating}
                            handleResponse={(id, response) => handleResponse(id, response)}
                            url={url}
                        />
                    ))}
                </div>
            }
        </div>
    );
};

export default ReviewDashboard;