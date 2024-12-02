const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const MONGO_URI = 'mongodb+srv://nhatnguyen20092002:Bb0zjBrxtfHVGwt5@mymongodbverceltest.y37g5.mongodb.net/mymongodbverceltest?retryWrites=true&w=majority&appName=mymongodbverceltest';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Kết nối MongoDB thành công!'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

const logSchema = new mongoose.Schema({
  username: { type: String, required: true },
  ca: { type: String, required: true },
  timeType: { type: String, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  error: { type: String },
  errorDuration: { type: Number },
  duration: { type: Number },
  entryTime: { type: Date }
});

const Log = mongoose.model('Log', logSchema);

app.use(cors());
app.use(express.json());

app.post('/api/back', async (req, res) => {
  const { username, ca, timeType, startTime, endTime, error, errorDuration, duration } = req.body;

  if (!username || !ca || !timeType) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }

  try {
    const vietnamTime = new Date();
    vietnamTime.setHours(vietnamTime.getHours() + 7);

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
        entryTime: vietnamTime
      });
      await newLog.save();
    } else if (timeType === 'long') {
      if (duration === undefined || duration <= 0) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ cho thời gian dài.' });
      }

      const newLog = new Log({
        username,
        ca,
        timeType,
        duration,
        error: error || 'Không có lỗi',
        entryTime: vietnamTime
      });
      await newLog.save();
    } else {
      return res.status(400).json({ error: 'Loại thời gian không hợp lệ.' });
    }

    res.status(200).json({ message: 'Lưu dữ liệu thành công!' });
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu:', err.message);
    res.status(500).json({ error: 'Lỗi khi lưu dữ liệu.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint không hợp lệ.' });
});

module.exports = app;