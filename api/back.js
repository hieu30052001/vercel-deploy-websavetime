const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Cấu hình MongoDB
const MONGO_URI = 'mongodb+srv://koconik111:glhAYPHZa6XD8DP1@cluster0.hwbp9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Kết nối MongoDB thành công!'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Tạo Schema và Model cho MongoDB
const logSchema = new mongoose.Schema({
  username: { type: String, required: true },
  ca: { type: String, required: true },
  machineName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  error: { type: String, required: true },
  errorDuration: { type: Number, required: true },
  solution: { type: String, required: false },
  errorType: { type: String, required: true },
  supporter: { type: String, required: true } // Thêm trường supporter
});

const Log = mongoose.model('Log', logSchema);

// Middleware
app.use(cors());
app.use(express.json());

// API xử lý lưu dữ liệu
app.post('/api/back', async (req, res) => {
  const { username, ca, machineName, startTime, endTime, error, errorDuration, solution, errorType, supporter } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!username || !ca || !machineName || !startTime || !endTime || !error || !errorDuration || !errorType || !supporter) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ. Vui lòng cung cấp đầy đủ các trường bắt buộc.' });
  }

  try {
    const newLog = new Log({ username, ca, machineName, startTime, endTime, error, errorDuration, solution, errorType, supporter });
    await newLog.save();
    res.status(200).json({ message: 'Lưu dữ liệu thành công!' });
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu:', err.message);
    res.status(500).json({ error: 'Lỗi khi lưu dữ liệu.' });
  }
});

// Xử lý endpoint không hợp lệ
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint không hợp lệ.' });
});

// Export server cho Vercel
module.exports = app;
