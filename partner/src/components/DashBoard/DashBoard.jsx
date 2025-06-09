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
} from 'chart.js';
import { useContext, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { FaRegSmileBeam } from 'react-icons/fa';
import { LiaMoneyBillWaveSolid } from "react-icons/lia";
import { TbBed, TbBedOff } from "react-icons/tb";
import ReactLoading from 'react-loading';
import { StoreContext } from "../../Context/StoreContext";
import './DashBoard.css';

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
  const [bookings, setBookings] = useState([]);
  const [accommodations, setAccommodations] = useState();
  const { token, url, user } = useContext(StoreContext);
  const [isAccomLoading, setIsAccomLoading] = useState(true);
  const [isBookingLoading, setIsBookingLoading] = useState(true);
  const [chartData, setChartData] = useState();
  const partnerId = user._id;
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsBookingLoading(true);
        const response = await axios.get(`${url}/api/bookings/partner/getAll`, { headers: { token } });
        if (response.data.success) {
          const bookingsData = response.data.bookings;
          setBookings(bookingsData);
        } else {
          console.error("Failed to fetch bookings", response.data.message);
        }
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setIsBookingLoading(false);
      }
    };
    const fetchAccommodations = async () => {
      try {
        setIsAccomLoading(true)
        const response = await axios.get(
          `${url}/api/accommodations/${partnerId}`
        );
        if (response.data.success) {
          setAccommodations(response.data.accommodations);
          console.log(response.data.accommodations);
        } else {
          console.error("Error fetching accommodations:");
        }
      } catch (error) {
      } finally {
        setIsAccomLoading(false);
      }
    };
    fetchBookings();
    fetchAccommodations()
  }, [token, url]);

  const countCancelled = () => {
    return bookings.filter(booking => booking.status === 'cancelled').length;
  }
  const calculateRevenue = () => {
    let revenue = 0
    bookings.map(booking => revenue += booking.totalAmount)
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenue.toFixed(0));
  }
  const calculateSatisfaction = () => {
    let satitisfactionReviews = 0
    let totalReviews = 0
    accommodations.map(accom => {
      totalReviews += accom.ratings.length
      accom.ratings.map(rating => {
        rating.rate >= 3
        satitisfactionReviews++
      })
    })
    return satitisfactionReviews / totalReviews * 100
  }
  const calculateMonthlyRevenue = (bookings) => {
    if (!bookings.length) return { labels: [], data: [] };
    const dates = bookings.map((booking) => new Date(booking.createdAt));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const labels = [];
    const revenues = [];
    let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

    while (currentDate <= maxDate) {
      labels.push(
        `${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`
      );
      revenues.push(0);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    bookings.forEach((booking) => {
      const bookingDate = new Date(booking.createdAt);
      const monthIndex =
        (bookingDate.getFullYear() - minDate.getFullYear()) * 12 +
        bookingDate.getMonth() -
        minDate.getMonth();
      revenues[monthIndex] += booking.totalAmount;
    });
    const data = {
      labels,
      datasets: [
        {
          label: 'Doanh thu khách sạn trong tháng',
          data: revenues,
          fill: false,
          tension: 0.4,
          backgroundColor: '#003bff',
          borderColor: '#003bff',
        },
      ],
    };
    console.log("chartData: ", data);
    setChartData(data)
  };
  useEffect(() => {
    if (!isBookingLoading && !isAccomLoading)
      calculateMonthlyRevenue(bookings);
  }, [isBookingLoading, isAccomLoading])


  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `Doanh thu: ${tooltipItem.raw.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`;
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
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Doanh thu',
        },
        ticks: {
          beginAtZero: true,
          callback: (value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
        },
      },
    },
  };
  if (isBookingLoading || isAccomLoading) {
    return (
      <div className="loading-container">
        <ReactLoading type="spin" color="#000" height={50} width={50} />
      </div>
    );
  } else
    return (
      <div className="dashboard-container">
        {/* Header with Summary Cards */}
        <div className="summary-user-cards">
          <div className="card blue">
            <TbBed className="card-icon" />
            <div className="card-details">
              <p>{bookings.length}</p>
              <h3>Đặt phòng</h3>
            </div>
          </div>
          <div className="card orange">
            <TbBedOff className="card-red-icon" />
            <div className="card-details">
              <p className='red-card-content'>{countCancelled()}</p>
              <h3 className='red-card-title'>Hủy đặt phòng</h3>
            </div>
          </div>
          <div className="card pink">
            <LiaMoneyBillWaveSolid className="card-icon" />
            <div className="card-details">
              <p>{calculateRevenue()}</p>
              <h3>Doanh thu</h3>
            </div>
          </div>
          <div className="card cyan">
            <FaRegSmileBeam className="card-icon" />
            <div className="card-details">
              <p>{calculateSatisfaction()}%</p>
              <h3>Mức độ hài lòng</h3>
            </div>
          </div>
        </div>

        <div className="chart-container">
          {chartData &&
            <div className="chart-section">
              <h4>Biểu đồ doanh thu theo tháng</h4>
              <Line data={chartData} options={options} />
            </div>
          }
          <div className="left-chart-container">
            <div className="recent-activities">
              <h4>Hoạt động gần đây</h4>
              <ul>
                {bookings
                  .slice(-5)
                  .reverse()
                  .map((booking, index) => (
                    <li key={index}>
                      {`${booking.userId?.name} ${booking.status === "canceled" ? "đã hủy đặt phòng" : "đã đặt phòng"
                        } lúc ${new Date(booking.createdAt).toLocaleString()}`}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
};
export default DashBoard;
