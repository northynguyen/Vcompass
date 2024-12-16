import OpenAI from "openai";

// Khởi tạo OpenAI với API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handleChatRequest = async (req, res) => {
  try {
    const { message } = req.body;

    // Kiểm tra nếu không có nội dung message
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    await delay(10000);

    // Gọi API OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Dùng model này thay vì gpt-4o-mini
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content;
    return res.status(200).json({ reply });
  } catch (error) {
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: "Quota exceeded",
        details:
          "You are sending requests too quickly. Please pace your requests.",
      });
    }

    // Kiểm tra nếu lỗi đến từ OpenAI API
    console.error(
      "Error with OpenAI API:",
      error.response?.data || error.message
    );

    // Trả về lỗi cho client
    return res.status(500).json({
      error: "Error generating response from OpenAI",
      details: error.response?.data || error.message,
    });
  }
};
