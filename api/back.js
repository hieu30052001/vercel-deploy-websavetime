const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Cấu hình MongoDB từ biến môi trường
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://koconik111:glhAYPHZa6XD8DP1@cluster0.hwbp9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Kết nối MongoDB thành công!'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Schema và Model
const logSchema = new mongoose.Schema({
  username: { type: String, required: true },
  ca: { type: String, required: true },
  machineName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  error: { type: String, required: true },
  errorDuration: { type: Number, required: true },
  solution: { type: String, required: false },
  errorType: { type: String, required: true }
});

const Log = mongoose.model('Log', logSchema);

// Middleware
app.use(cors());
app.use(express.json());

// API lưu dữ liệu
app.post('/api/back', async (req, res) => {
  const { username, ca, machineName, startTime, endTime, error, errorDuration, solution, errorType } = req.body;

  // Kiểm tra các trường bắt buộc
  const requiredFields = { username, ca, machineName, startTime, endTime, error, errorDuration, errorType };
  const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
  if (missingFields.length) {
    return res.status(400).json({ error: `Thiếu các trường bắt buộc: ${missingFields.join(', ')}` });
  }

  try {
    // Chuyển đổi thời gian thành Date
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Kiểm tra thời gian hợp lệ
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Định dạng thời gian không hợp lệ.' });
    }
    if (end < start) {
      return res.status(400).json({ error: 'Giờ kết thúc phải lớn hơn hoặc bằng giờ bắt đầu.' });
    }

    // Kiểm tra errorDuration có khớp với startTime và endTime
    const calculatedDuration = (end - start) / (1000 * 60);
    if (Math.abs(calculatedDuration - errorDuration) > 1) { // Cho phép sai số nhỏ
      return res.status(400).json({ error: 'Thời gian lỗi không khớp với giờ bắt đầu và kết thúc.' });
    }

    const newLog = new Log({ username, ca, machineName, startTime: start, endTime: end, error, errorDuration, solution, errorType });
    await newLog.save();
    res.status(200).json({ message: 'Lưu dữ liệu thành công!' });
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu:', err.message, err.stack);
    res.status(500).json({ error: 'Lỗi server khi lưu dữ liệu.' });
  }
});

// Xử lý endpoint không hợp lệ
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint không hợp lệ.' });
});
