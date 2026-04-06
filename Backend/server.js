import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are Jarvis, a helpful AI assistant.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // ✅ HERE
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "My App",
        },
      },
    );

    const reply = response.data.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.log(error.message);
    res.json({ reply: "Error from AI 🤖" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
