const sqlite3 = require('sqlite3').verbose();

// Kết nối database SQLite trong bộ nhớ
const db = new sqlite3.Database(':memory:');

// Tạo bảng khi function được gọi lần đầu tiên
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    start_time TEXT,
    end_time TEXT,
    error TEXT
  )`);
});

// API xử lý lưu dữ liệu
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { username, startTime, endTime, error } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !startTime || !endTime || !error) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
    }

    // Câu lệnh SQL để lưu dữ liệu vào bảng
    const query = `INSERT INTO logs (username, start_time, end_time, error) VALUES (?, ?, ?, ?)`;

    db.run(query, [username, startTime, endTime, error], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Lỗi khi lưu dữ liệu.' });
      }
      return res.status(200).json({ message: 'Lưu thành công!', id: this.lastID });
    });
  } else {
    return res.status(404).json({ error: 'Endpoint không hợp lệ.' });
  }
};
