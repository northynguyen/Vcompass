import axios from 'axios';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'; // Import necessary chart components
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { FaHotel, FaUmbrellaBeach, FaUsers } from 'react-icons/fa';
import { FaBuildingUser } from "react-icons/fa6";
import { MdNoFood } from "react-icons/md";
import ReactLoading from 'react-loading';
import { StoreContext } from "../../Context/StoreContext";
import './Dashboard.css';

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashBoard = () => {
  const [users, setUsers] = useState();
  const [partners, setPartners] = useState();
  const [foodServices, setFoodServices] = useState();
  const [attractions, setAttractions] = useState();
  const [accommodations, setAccommodations] = useState();
  const { token, url } = useContext(StoreContext);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isPartnerLoading, setIsPartnerLoading] = useState(true);
  const [chartData, setChartData] = useState();
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    if (location.pathname !== path) {
        navigate(path);
    }
};
  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await axios.get(
          `${url}/api/accommodations`
        );
        if (response.data.success) {
          setAccommodations(response.data.accommodations);
          console.log(response);
        } else {
          console.error("Error fetching accommodations:");
        }
      } catch (error) {
      }
    };
    const fetchUsers = async () => {
      try {
        setIsUserLoading(true)
        const response = await axios.get(
          `${url}/api/user/users/`
        );
        if (response.data) {
          setUsers(response.data);
          console.log("user", response);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsUserLoading(false);
      }
    };
    const fetchPartners = async () => {
      try {
        setIsPartnerLoading(true)
        const response = await axios.get(
          `${url}/api/user/partners/`
        );
        if (response.data) {
          setPartners(response.data);
        } else {
        }
      } catch (error) {
      } finally {
        setIsPartnerLoading(false);
      }
    };
    const fetchFoodServices = async () => {
      try {
        const response = await axios.get(
          `${url}/api/foodservices`
        );
        if (response.data.success) {
          setFoodServices(response.data.foodService);
          console.log("foodService", response.data);
        } else {
          console.error("Error fetching accommodations:");
        }
      } catch (error) {
      }
    };
    const fetchAttractions = async () => {
      try {
        const response = await axios.get(
          `${url}/api/attractions`
        );
        if (response.data.success) {
          setAttractions(response.data.attractions);
          console.log("attraction", response.data);
        }
      } catch (error) {
      }
    };
    fetchAccommodations()
    fetchAttractions()
    fetchFoodServices()
    fetchUsers()
    fetchPartners()
  }, [token, url]);

  const calculateUnAccept = () => {
    return accommodations.filter(accommodation => accommodation.status === 'pending').length + foodServices.filter(foodService => foodService.status === 'pending').length;
  }
  const calculateMonthlyRegistrations = (data, labelName) => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };
    const dates = data.map((item) => new Date(item.createdAt));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const labels = [];
    const counts = [];
    let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

    while (currentDate <= maxDate) {
      labels.push(
        `${currentDate.toLocaleString("default", { month: "long" })} ${currentDate.getFullYear()}`
      );
      counts.push(0);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Đếm số lượng theo tháng
    data.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      const monthIndex =
        (itemDate.getFullYear() - minDate.getFullYear()) * 12 +
        itemDate.getMonth() -
        minDate.getMonth();
      counts[monthIndex]++;
    });

    return {
      labels,
      datasets: [
        {
          label: labelName,
          data: counts,
          fill: false,
          backgroundColor: labelName === "Người dùng" ? "#4CAF50" : "#2196F3",
          borderColor: labelName === "Người dùng" ? "#4CAF50" : "#2196F3",
        },
      ],
    };
  };
  useEffect(() => {
    if (!isPartnerLoading || !isUserLoading) {
      setChartData({
        labels: calculateMonthlyRegistrations(users, "Người dùng").labels,
        datasets: [
          ...calculateMonthlyRegistrations(users, "Người dùng").datasets,
          ...calculateMonthlyRegistrations(partners, "Nhà cung cấp").datasets,
        ],
      })
    }
  }, [isPartnerLoading, isUserLoading])

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.raw} người đăng ký mới`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Tháng',
        },
        ticks: {
          autoSkip: false, // Ngăn không cho tự động bỏ qua các tháng
          maxRotation: 90, // Xoay nhãn trục x nếu cần
          minRotation: 45, // Chỉ định góc quay tối thiểu
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Số người dùng mới',
        },
        ticks: {
          maxTicksLimit: 6,
          callback: (value) => Math.floor(value),
          beginAtZero: true,
        },
      },
    },
  };
  if (isUserLoading || isPartnerLoading) {
    return (
      <div className="loading-container">
        <ReactLoading type="spin" color="#000" height={50} width={50} />
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header with Summary Cards */}
      <div className="summary-user-cards">
        <div className="card">
          <FaUsers className="card-icon" />
          <div className="card-details">
            <p>{users.length}</p>
            <h3>Người dùng</h3>
          </div>
        </div>
        <div className="card">
          <FaBuildingUser className="card-icon" />
          <div className="card-details">
            <p>{partners.length}</p>
            <h3>Nhà cung cấp</h3>
          </div>
        </div>
      </div>
      <div className="summary-cards">
        <div className="card">
          <FaHotel className="card-icon" />
          <div className="card-details">
            <p>{accommodations ? accommodations.length : "Đang tải"}</p>
            <h3>Khách sạn, Chỗ ở</h3>
          </div>
        </div>
        <div className="card">
          <FaHotel className="card-red-icon" />
          <div className="card-details" >
            <p className="red-card-content">{accommodations ? calculateUnAccept() : "Đang tải"}</p>
            <h3 className="red-card-title" onClick={() => handleNavigation('/services')}>Chưa xét duyệt</h3>
          </div>
        </div>
        <div className="card">
          <MdNoFood className="card-icon" />
          <div className="card-details">
            <p>{foodServices ? foodServices.length : "Đang tải"}</p>
            <h3>Dịch vụ ăn uống</h3>
          </div>
        </div>

        <div className="card">
          <FaUmbrellaBeach className="card-icon" />
          <div className="card-details">
            <p>{attractions ? attractions.length : "Đang tải"}</p>
            <h3>Điểm tham quan</h3>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      {chartData &&
        <div className="chart-section">
          <h3>Biểu đồ thống kê người dùng theo tháng</h3>
          <Line data={chartData} options={options} />
        </div>
      }
    </div>
  );
};

export default DashBoard;
