const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Kết nối database SQLite
const db = new sqlite3.Database(':memory:'); // Dùng database trong bộ nhớ
db.serialize(() => {
  db.run(`CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    start_time TEXT,
    end_time TEXT,
    error TEXT
  )`);
});

// API lưu dữ liệu
app.post('/api/save', (req, res) => {
  const { username, startTime, endTime, error } = req.body;
  if (!username || !startTime || !endTime || !error) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }

  const query = `INSERT INTO logs (username, start_time, end_time, error) VALUES (?, ?, ?, ?)`;
  db.run(query, [username, startTime, endTime, error], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Lỗi khi lưu dữ liệu.' });
    }
    res.status(200).json({ message: 'Lưu thành công!', id: this.lastID });
  });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
