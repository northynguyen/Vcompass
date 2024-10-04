import { FaBed, FaMoneyBillWave, FaUtensils, FaSmile } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'; // Import necessary chart components
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
  // Example data for charts (Revenue over time)
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Hotel Revenue',
        data: [12000, 19000, 3000, 5000, 20000, 30000],
        fill: false,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
      },
      {
        label: 'Restaurant Revenue',
        data: [15000, 21000, 5000, 4000, 15000, 25000],
        fill: false,
        backgroundColor: '#FFC107',
        borderColor: '#FFC107',
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard-container">
      {/* Header with Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <FaBed className="card-icon" />
          <div className="card-details">
            <h3>Total Bookings</h3>
            <p>250</p>
          </div>
        </div>
        <div className="card">
          <FaUtensils className="card-icon" />
          <div className="card-details">
            <h3>Table Reservations</h3>
            <p>75</p>
          </div>
        </div>
        <div className="card">
          <FaMoneyBillWave className="card-icon" />
          <div className="card-details">
            <h3>Total Revenue</h3>
            <p>$45,000</p>
          </div>
        </div>
        <div className="card">
          <FaSmile className="card-icon" />
          <div className="card-details">
            <h3>Customer Satisfaction</h3>
            <p>95%</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-section">
        <h3>Revenue Overview</h3>
        <Line data={data} options={options} />
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <h3>Recent Activities</h3>
        <ul>
          <li>Room 101 was booked by John Doe.</li>
          <li>Table for 4 reserved by Jane Smith.</li>
          <li>Room 205 was checked out.</li>
          <li>Table for 2 reserved by Mark Williams.</li>
        </ul>
      </div>
    </div>
  );
};

export default DashBoard;
