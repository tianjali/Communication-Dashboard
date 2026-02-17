require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error(" MongoDB Connection Error:", err);
    process.exit(1);
  });


const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["email", "sms", "whatsapp"],
      required: true,
    },
    emailTo: String,
    mobileNumber: String,
    message: String,
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);


app.post("/send", async (req, res) => {
  try {
    const { type, emailTo, mobileNumber, message } = req.body;

    const newMessage = await Message.create({
      type,
      emailTo,
      mobileNumber,
      message,
    });

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save message",
      error: error.message,
    });
  }
});

app.get("/messages/:type", async (req, res) => {
  try {
    const { type } = req.params;

    const messages = await Message.find({ type }).sort({
      createdAt: -1,
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
