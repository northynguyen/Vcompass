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
  let prompt = ""
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
        type: "Accommodation",
        price: item.price,
      })),
      ...attractions.map((item) => ({
        _id: item._id,
        name: item.attractionName,
        type: "Attraction",
        price: item.price,
      })),
      ...foodServices.map((item) => ({
        _id: item._id,
        name: item.foodServiceName,
        type: "FoodService",
        price: item.price,
      })),
    ];
    prompt = `
      Tôi có một danh sách các điểm đến (destination), mỗi điểm có id, tên, địa chỉ, loại hình (Attraction, FoodService, Accommodation), hình ảnh và chi phí dự kiến.
      Hãy tạo một lịch trình du lịch trong vòng ${numDays} ngày, bắt đầu từ ngày ${startDate}, với tổng ngân sách là ${budget} VND.

      **Yêu cầu:**
      - Phân bổ ngân sách hợp lý để không quá chênh lệch với budget.
      - Chỉ định chi phí cho từng hoạt động dựa trên ngân sách đã cho (dựa vào cost của mỗi destination được cung cấp).
      - Mỗi ngày có ít nhất 4-5 hoạt động với chi tiết đầy đủ (giờ bắt đầu, giờ kết thúc, mô tả...).
      - Nếu có những địa điểm hay (nhưng bắt buộc phải cùng city nhé) nhưng lại không có trong data tôi cung cấp thì type của nó là Other(những biến này để lưu thông tin của Other: name, address, imgSrc, cost), idDestination của Other là sẽ được tạo ngẫu nhiên tuy nhiên nó cũng phải là Types.ObjectId (random mã hex 24 ký tự)
      
      **Danh sách điểm đến:**
      ${JSON.stringify(allDestinations, null, 2)}
      Hãy phân bổ hợp lý các điểm đến vào từng ngày, sắp xếp theo thời gian hợp lý và đảm bảo ngân sách phù hợp.
      **Lưu ý quan trọng:** Trả về sao cho reply có thể parse ra JSON bằng code bên dưới và đừng có những dấu làm cho JSON.parse bị lỗi, các destination phải lấy từ danh sách được cung cấp và phải có _id
      let reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      return res.status(200).json(JSON.parse(reply));
      **Định dạng phản hồi mong muốn:**
      json
      {
        "idUser": "${userId}",
        "scheduleName": "Tour ${city} ${numDays} ngày",
        "description": "Lịch trình được tạo từ AI",
        "address": "${city}" // CHỈ TRẢ VỀ GIÁ TRỊ CỦA BIẾN CITY, VÍ DỤ NẾU CITY LÀ "LÂM ĐỒNG" THÌ ADDRESS PHẢI LÀ "LÂM ĐỒNG". KHÔNG THAY ĐỔI, KHÔNG THÊM BẤT CỨ THÔNG TIN NÀO KHÁC.
        "numDays": ${numDays},
        "dateStart": "${startDate}",
        "dateEnd": "<tính toán dựa trên startDate + numDays>",
        "status": "Draft",
        "activities": [
          {
            "day": 1,
            "activity": [
              {
                "activityType": "Attraction || Accommodation || FoodService || Other" -- Nếu điểm đến không có trong danh sách tôi cung cấp thì activityType nhất định phải là Other,
                "idDestination": "destination._id",
                "cost": "Phân bổ hợp lí, riêng Accommodation phải lấy giá nhân với số ngày nữa",
                "address": "Địa chỉ của type Other, bình thường thì null"
                "costDescription": "Chi phí vé vào cửa",
                "description": "Mô tả hoạt động",
                "timeStart": "Sắp xếp hợp lý" (format: "HH:mm"),
                "timeEnd": "Sắp xếp hợp lý" (format: "HH:mm")
              }
            ]
          }
        ],
        "createdAt": "<thời gian hiện tại> (format: "YYYY-MM-DD HH:mm:ss") type: Date",
      }
    `;
    console.log("prompt:", prompt);
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
    console.log(reply);
    return res.status(200).json(JSON.parse(reply));
    //return res.status(200).json({ reply, allDestinations });
  } catch (error) {
    console.error(
      "Error with Gemini API:",
      error.response?.data || error.message
    );
    console.log("prompt:", prompt);
    return res.status(error.response?.status || 500).json({
      error: "Error generating itinerary from Gemini API",
      details: error.response?.data || error.message,
    });
  }
};
