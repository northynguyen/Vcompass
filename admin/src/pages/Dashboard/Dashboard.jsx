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
import { Line } from 'react-chartjs-2';
import { FaHotel, FaUmbrellaBeach, FaUsers } from 'react-icons/fa';
import { FaBuildingUser } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { MdNoFood } from "react-icons/md";
import { TbMessageReportFilled } from "react-icons/tb";
import ReactLoading from 'react-loading';
import { useNavigate } from 'react-router-dom';
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
  const [reports, setReports] = useState([]);
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
          `${url}/api/accommodations/all`
        );
        if (response.data.success) {
          setAccommodations(response.data.accommodations);
        } else {
          console.error("Error fetching accommodations:");
        }
      } catch (error) {
        console.error("Error fetching accommodations:", error);
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
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setIsPartnerLoading(false);
      }
    };
    const fetchFoodServices = async () => {
      try {
        const response = await axios.get(
          `${url}/api/foodservices/all`
        );
        if (response.data.success) {
          setFoodServices(response.data.foodService);
        } else {
          console.error("Error fetching accommodations:");
        }
      } catch (error) {
        console.error("Error fetching food services:", error);
      }
    };
    const fetchAttractions = async () => {
      try {
        const response = await axios.get(
          `${url}/api/attractions?limit=100`
        );
        if (response.data.success) {
          setAttractions(response.data.attractions);
        }
      } catch (error) {
        console.error("Error fetching attractions:", error);
      }
    };
    const fetchReports = async (status) => {
      try {
        const query = status !== "All" ? `?status=${status}` : "";
        const response = await fetch(`${url}/api/reports/${query}`, {
          headers: { token: token },
        });

        if (!response.ok) {
          throw new Error("Lỗi khi lấy báo cáo");
        }

        const data = await response.json();

        if (data.success) {
          setReports(data.reports);
        }
      } catch (error) {
        console.error("Lỗi khi lấy báo cáo:", error);
      }
    };
    fetchAccommodations()
    fetchAttractions()
    fetchFoodServices()
    fetchUsers()
    fetchPartners()
    fetchReports("All")
  }, [token, url]);

  const calculateUnAccept = () => {
    return accommodations.filter(accommodation => accommodation.status === 'pending').length + foodServices.filter(foodService => foodService.status === 'pending').length;
  }
  const calculateUnResolveReport = () => {
    return reports.filter(report => report.status === 'pending').length;
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
        `${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`
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
          tension: 0.4,
          backgroundColor: labelName === "Người dùng" ? "#003bff" : "#ff9a00",
          borderColor: labelName === "Người dùng" ? "#003bff" : "#ff9a00",
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
          autoSkip: true,
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
        <div className="card blue">
          <FaUsers className="card-icon" />
          <div className="card-details">
            <p>{users.length}</p>
            <h3>Người dùng</h3>
          </div>
        </div>
        <div className="card orange">
          <FaBuildingUser className="card-icon" />
          <div className="card-details">
            <p>{partners.length}</p>
            <h3>Nhà cung cấp</h3>
          </div>
        </div>
        <div className="card pink">
          <FaHotel className="card-icon" />
          <div className="card-details">
            <p>{accommodations ? accommodations.length : "Đang tải"}</p>
            <h3>Khách sạn, Chỗ ở</h3>
          </div>
        </div>
        <div className="card cyan">
          <MdNoFood className="card-icon" />
          <div className="card-details">
            <p>{foodServices ? foodServices.length : "Đang tải"}</p>
            <h3>Dịch vụ ăn uống</h3>
          </div>
        </div>
        <div className="card yellow">
          <FaUmbrellaBeach className="card-icon" />
          <div className="card-details">
            <p>{attractions ? attractions.length : "Đang tải"}</p>
            <h3>Điểm tham quan</h3>
          </div>
        </div>
      </div>

      <div className="chart-container">
        {/* Revenue Chart */}
        {chartData &&
          <div className="chart-section">
            <h4>Thống kê người dùng mới</h4>
            <Line data={chartData} options={options} />
          </div>
        }
        <div className="left-chart-container">
          <div className="title">
            <h4>Nhiệm vụ</h4>
          </div>
          <div className="task-item" onClick={() => handleNavigation('/services')}>
            <FaHotel className="card-red-icon" />
            <div className="card-details" >
              <p className="red-card-content">{accommodations && foodServices ? calculateUnAccept() : "Đang tải"}</p>
              <h3 className="red-card-title">Dịch vụ chưa xét duyệt</h3>
            </div>
            <IoIosArrowForward />
          </div>
          <hr className="task-divider" />
          {reports && <div className="task-item" onClick={() => handleNavigation('/reportmanagement')}>
            <TbMessageReportFilled className="card-red-icon" />
            <div className="card-details" >
              <p className="red-card-content">{reports ? calculateUnResolveReport() : "Đang tải"}</p>
              <h3 className="red-card-title">Báo cáo chưa xem xét</h3>
            </div>
            <IoIosArrowForward />
          </div>}

        </div>
      </div>
    </div>
  );
};

export default DashBoard;
