import axios from "axios";
import dotenv from "dotenv";
import Accommodation from "../models/accommodation.js";
import Attraction from "../models/attraction.js";
import FoodService from "../models/foodService.js";

dotenv.config(); // Đọc API Key từ .env

const API_KEY = process.env.GEMINIAI_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export const handleChatRequest = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: message }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const reply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response.";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error(
      "Error with Gemini API:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      error: "Error generating response from Gemini API",
      details: error.response?.data || error.message,
    });
  }
};

export const generateSchedule = async (req, res) => {
  try {
    const { city, startDate, numDays, userId, budget } = req.body;

    if (!city || !startDate || !numDays || !userId || !budget) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const accommodations = await Accommodation.find({ city });
    const attractions = await Attraction.find({ city });
    const foodServices = await FoodService.find({ city });
    const allDestinations = [
      ...accommodations.map((item) => ({
        _id: item._id,
        name: item.name,
        address: item.location?.address,
        type: "Accommodation",
        price: item.price,
      })),
      ...attractions.map((item) => ({
        _id: item._id,
        name: item.attractionName,
        address: item.location?.address,
        type: "Attraction",
        price: item.price,
      })),
      ...foodServices.map((item) => ({
        _id: item._id,
        name: item.foodServiceName,
        address: item.location?.address,
        type: "FoodService",
        price: item.price,
      })),
    ];
    const prompt = `
      Tôi có một danh sách các điểm đến (destination), mỗi điểm có id, tên, địa chỉ, loại hình (Attraction, FoodService, Accommodation), hình ảnh và chi phí dự kiến.
      Hãy tạo một lịch trình du lịch trong vòng ${numDays} ngày, bắt đầu từ ngày ${startDate}, với tổng ngân sách là ${budget} VND.

      **Yêu cầu:**
      - Phân bổ ngân sách hợp lý để không quá chênh lệch với budget.
      - Chỉ định chi phí cho từng hoạt động dựa trên ngân sách đã cho (dựa vào cost của mỗi destination được cung cấp).
      - Mỗi ngày có ít nhất 2-3 hoạt động với chi tiết đầy đủ (giờ bắt đầu, giờ kết thúc, mô tả...).
      
      **Danh sách điểm đến:**
      ${JSON.stringify(allDestinations, null, 2)}
      Hãy phân bổ hợp lý các điểm đến vào từng ngày, sắp xếp theo thời gian hợp lý và đảm bảo ngân sách phù hợp.
      🚨 **Lưu ý quan trọng:** Trả về sao cho reply có thể parse ra JSON bằng code bên dưới và đừng có những dấu làm cho JSON.parse bị lỗi, các destination phải lấy từ danh sách được cung cấp và phải có _id
      let reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      return res.status(200).json(JSON.parse(reply));
      **Định dạng phản hồi mong muốn:**
      json
      {
        "idUser": "${userId}",
        "scheduleName": "Tour ${city} ${numDays} ngày",
        "description": "Lịch trình được tạo từ AI",
        "address": "${city}",
        "numDays": ${numDays},
        "dateStart": "${startDate}",
        "dateEnd": "<tính toán dựa trên startDate + numDays>",
        "status": "Draft",
        "activities": [
          {
            "day": 1,
            "activity": [
              {
                "activityType": "Attraction || Accommodation || FoodService",
                "idDestination": "destination._id",
                "cost": "Phân bổ hợp lí",
                "costDescription": "Chi phí vé vào cửa",
                "description": "Mô tả hoạt động",
                "timeStart": "Sắp xếp hợp lý",
                "timeEnd": "Sắp xếp hợp lý"
              }
            ]
          }
        ],
        "createdAt": "<thời gian hiện tại>",
      }
    `;

    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    let reply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    reply = reply.replace(/```json|```/g, "").trim();
    return res.status(200).json(JSON.parse(reply));
    //return res.status(200).json({ reply, allDestinations });
  } catch (error) {
    console.error(
      "Error with Gemini API:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      error: "Error generating itinerary from Gemini API",
      details: error.response?.data || error.message,
    });
  }
};
