const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Cấu hình MongoDB
const MONGO_URI = 'mongodb+srv://nhatnguyen20092002:Bb0zjBrxtfHVGwt5@mymongodbverceltest.y37g5.mongodb.net/mymongodbverceltest?retryWrites=true&w=majority&appName=mymongodbverceltest';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Kết nối MongoDB thành công!'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Tạo Schema và Model cho MongoDB
const logSchema = new mongoose.Schema({
  username: { type: String, required: true },
  ca: { type: String, required: true },
  timeType: { type: String, required: true }, // 'short' hoặc 'long'
  startTime: { type: Date },                 // Chỉ bắt buộc cho thời gian ngắn
  endTime: { type: Date },                   // Chỉ bắt buộc cho thời gian ngắn
  error: { type: String },                   // Chỉ áp dụng cho thời gian ngắn
  errorDuration: { type: Number },           // Chỉ áp dụng cho thời gian ngắn
  duration: { type: Number },                // Chỉ áp dụng cho thời gian dài (phút)
  entryTime: { type: Date }                  // Thời gian lưu dữ liệu (theo giờ Việt Nam)
});

const Log = mongoose.model('Log', logSchema);

// Middleware
app.use(cors());
app.use(express.json());

// API xử lý lưu dữ liệu
app.post('/api/back', async (req, res) => {
  const { username, ca, timeType, startTime, endTime, error, errorDuration, duration } = req.body;

  // Kiểm tra dữ liệu cơ bản
  if (!username || !ca || !timeType) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }

  try {
    const vietnamTime = new Date();
    vietnamTime.setHours(vietnamTime.getHours() + 7); // Chuyển sang giờ Việt Nam

    // Logic xử lý thời gian ngắn
    if (timeType === 'short') {
      if (!startTime || !endTime || error === undefined || errorDuration === undefined) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ cho thời gian ngắn.' });
      }

      const newLog = new Log({
        username,
        ca,
        timeType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        error,
        errorDuration,
        entryTime: vietnamTime // Lưu thời gian nhập
      });
      await newLog.save();
    } 
    // Logic xử lý thời gian dài
    else if (timeType === 'long') {
      if (duration === undefined || duration <= 0) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ cho thời gian dài.' });
      }

      const newLog = new Log({
        username,
        ca,
        timeType,
        duration,
        entryTime: vietnamTime // Lưu thời gian nhập
      });
      await newLog.save();
    } 
    // Trường hợp không hợp lệ
    else {
      return res.status(400).json({ error: 'Loại thời gian không hợp lệ.' });
    }

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
