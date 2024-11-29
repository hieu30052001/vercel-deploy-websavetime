const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Cấu hình MongoDB (Thay `YOUR_MONGODB_URI` bằng URI MongoDB của bạn)
const MONGO_URI = 'mongodb+srv://nhatnguyen20092002:Bb0zjBrxtfHVGwt5@mymongodbverceltest.y37g5.mongodb.net/mymongodbverceltest?retryWrites=true&w=majority&appName=mymongodbverceltest';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Kết nối MongoDB thành công!'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Tạo Schema và Model cho MongoDB
const logSchema = new mongoose.Schema({
  username: { type: String, required: true },
  machinename: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  error: { type: String, required: true },
  errorDuration: { type: Number, required: true }
});

const Log = mongoose.model('Log', logSchema);

// Middleware
app.use(cors());
app.use(express.json());

// API xử lý lưu dữ liệu
app.post('/api/back', async (req, res) => {
  const { username, machinename, startTime, endTime, error, errorDuration } = req.body;

  if (!username || !machinename || !startTime || !endTime || !error || !errorDuration) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }

  try {
    const newLog = new Log({ username, machinename, startTime, endTime, error, errorDuration });
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
