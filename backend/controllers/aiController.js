import axios from "axios";
import dotenv from "dotenv";

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
