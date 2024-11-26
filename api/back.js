const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Đảm bảo đã cài đặt: npm install cors
const express = require('express');
const app = express();

// Kết nối database SQLite trong bộ nhớ
const db = new sqlite3.Database(':memory:');

// Tạo bảng khi server được khởi chạy lần đầu
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    start_time TEXT,
    end_time TEXT,
    error TEXT
  )`);
});

// Middleware
app.use(cors()); // Bật CORS cho mọi nguồn gốc
app.use(express.json()); // Hỗ trợ parse JSON từ request body

// API để xử lý lưu dữ liệu
app.post('/api/back', (req, res) => {
  const { username, startTime, endTime, error } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!username || !startTime || !endTime || !error) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }

  // Thêm dữ liệu vào bảng SQLite
  const query = `INSERT INTO logs (username, start_time, end_time, error) VALUES (?, ?, ?, ?)`;
  db.run(query, [username, startTime, endTime, error], function (err) {
    if (err) {
      console.error('Lỗi khi lưu dữ liệu:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lưu dữ liệu.' });
    }
    console.log('Lưu dữ liệu thành công, ID:', this.lastID);
    return res.status(200).json({ message: 'Lưu thành công!', id: this.lastID });
  });
});

// Xử lý các endpoint không hợp lệ
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint không hợp lệ.' });
});

// Vercel cần export server
module.exports = app;
