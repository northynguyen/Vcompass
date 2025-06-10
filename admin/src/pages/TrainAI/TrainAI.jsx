import axios from 'axios';
import { useContext, useEffect, useMemo, useState } from 'react';
import { HiDocumentReport } from "react-icons/hi";
import { PiSmileyAngryFill, PiSmileyFill } from "react-icons/pi";
import { RiCopilotFill } from "react-icons/ri";
import 'react-tabs/style/react-tabs.css';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import Loading from '../../components/Loading/Loading';
import { StoreContext } from '../../Context/StoreContext';
import './TrainAi.css';
const TrainAI = () => {
    const [userSatisfactions, setUserSatisfactions] = useState();
    const { token, url, user } = useContext(StoreContext);
    const [isTrainAILoading, setIsTrainAILoading] = useState(false)

    useEffect(() => {
        const fetchUserSatisfaction = async () => {
            try {
                const response = await axios.get(
                    `${url}/api/userSatisfaction/getAll`
                );
                if (response.data.success) {
                    console.log(response);
                    setUserSatisfactions(response.data.userSatisfactions);
                } else {
                    console.error("Error fetching userSatisfaction");
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchUserSatisfaction();
    }, [token, url]);
    const pieData = useMemo(() => {
        if (!userSatisfactions || userSatisfactions.length === 0) return [];

        // Tính tổng điểm và số lượng người
        const totalSatisfaction = userSatisfactions.reduce((acc, { score }) => {
            return acc + score; // Cộng dồn điểm của từng người
        }, 0);

        const totalPeople = userSatisfactions.length; // Tổng số người

        // Mức độ hài lòng (giả sử mỗi người có điểm từ 0 đến 1)
        const satisfactionLevel = totalSatisfaction / totalPeople;

        return [
            {
                name: "Hài Lòng",
                value: satisfactionLevel,
            },
            {
                name: "Chưa hài lòng",
                value: 1 - satisfactionLevel,
            },
        ];
    }, [userSatisfactions]);
    const handleTrainAI = async () => {
        try {
            setIsTrainAILoading(true)
            const response = await axios.post(`${url}/api/schedule/trainAI`);
            console.log(`Bắt đầu train AI`);
            if (response.data.success) {
                console.log(response);
                setIsTrainAILoading(false);
            } else {
                setIsTrainAILoading(false);
                console.error("Có lỗi khi huấn luyện AI");
            }
        } catch (err) {
            setIsTrainAILoading(false);
            console.error("❌ Failed to report satisfaction:", err.message);
        }
    };


    const COLORS = ['#184b7f', '#fb4141'];
    if (isTrainAILoading) {
        return (
            <Loading title="Đang huấn luyện AI"/>
        )
    }
    return (
        <div className="service-details">
            <div className="service-container">
                <h2 className='main-title'>Quản lý AI</h2>
                <div className="summary-user-cards">
                    <div className="left-train-ai-container">
                        <div className="infor-container">
                            <div className="card blue">
                                <HiDocumentReport className="card-icon" />
                                <div className="card-details">
                                    <p>{userSatisfactions?.length}</p>
                                    <h3>Số đánh giá</h3>
                                </div>
                            </div>
                            <div className={`card ${pieData[0]?.value >= 0.5 ? 'cyan' : 'orange'}`}>
                                {pieData[0]?.value >= 0.5 &&
                                    <PiSmileyFill className="card-icon" />
                                }
                                {pieData[0]?.value < 0.5 &&
                                    <PiSmileyAngryFill className="card-icon" />
                                }
                                <div className="card-details">
                                    <p className={`${pieData[0]?.value >= 0.5 ? '' : 'red-text'}`}>{(pieData[0]?.value * 100).toFixed(1)} %</p>
                                    <h3>Mức độ hài lòng</h3>
                                </div>
                            </div>
                        </div>
                        <div className="train-ai-container">
                            <div className="task-item btn-train-ai" onClick={handleTrainAI}>
                                <RiCopilotFill className="card-icon" />
                                <div className="card-details" >
                                    <p className="card-content">Huấn luyện mô hình</p>
                                </div>
                                {/* <IoIosArrowForward /> */}
                            </div>
                            {/* <p className="train-ai-description">Huấn luyện lần cuối: 18/4/2025</p> */}
                        </div>

                    </div>
                    <div className="chart-container">
                        <PieChart width={300} height={300}>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                labelLine={false}
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip className="chart-tool-tip" formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                            <Legend
                                iconSize={20}
                                wrapperStyle={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                            />
                        </PieChart>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TrainAI
