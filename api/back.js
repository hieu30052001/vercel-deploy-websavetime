const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://koconik111:glhAYPHZa6XD8DP1@cluster0.hwbp9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Kết nối MongoDB thành công!'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Log Schema with Additional Validation
const logSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  ca: { type: String, required: true, trim: true },
  machineName: { type: String, required: true, trim: true },
  startTime: { type: Date, required: true },
  endTime: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(endTime) {
        return endTime >= this.startTime;
      },
      message: 'endTime must be after startTime'
    }
  },
  error: { type: String, required: true, trim: true },
  errorDuration: { 
    type: Number, 
    required: true, 
    min: [0, 'errorDuration must be non-negative'] 
  },
  solution: { type: String, trim: true },
  errorType: { 
    type: String, 
    enum: ['CM', 'HT', 'PM', 'IM', '5S', 'COT', 'RM'],
    trim: true 
  }
});

const Log = mongoose.model('Log', logSchema);

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// POST Endpoint
app.post('/api/back', async (req, res) => {
  const { username, ca, machineName, startTime, endTime, error, errorDuration, solution, errorType } = req.body;

  // Validate required fields
  if (!username || !ca || !machineName || !startTime || !endTime || !error || errorDuration == null) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ. Vui lòng cung cấp đầy đủ các trường bắt buộc.' });
  }

  try {
    const newLog = new Log({ 
      username, 
      ca, 
      machineName, 
      startTime: new Date(startTime),
      endTime: new Date(endTime), 
      error, 
      errorDuration, 
      solution,
      errorType
    });
    await newLog.save();
    res.status(201).json({ message: 'Lưu dữ liệu thành công!' });
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu:', err.message);
    res.status(500).json({ error: 'Lỗi khi lưu dữ liệu.' });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint không hợp lệ.' });
});

// Export for Vercel
module.exports = app;
