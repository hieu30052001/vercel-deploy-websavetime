const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/back', async (req, res) => {
  const { username, startTime, endTime, error } = req.body;

  if (!username || !startTime || !endTime || !error) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }

  const query = `INSERT INTO logs (username, start_time, end_time, error) VALUES (?, ?, ?, ?)`;

  db.run(query, [username, startTime, endTime, error], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Lỗi khi lưu dữ liệu.' });
    }
    return res.status(200).json({ message: 'Lưu thành công!', id: this.lastID });
  });
});

app.listen(3000, () => console.log('Server đang chạy trên cổng 3000.'));
