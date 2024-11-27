const sql = require('mssql'); // Sử dụng thư viện mssql
const cors = require('cors');
const express = require('express');
const app = express();

// Cấu hình kết nối với SQL Server
const dbConfig = {
  user: 'nhat', // Tên người dùng (username)
  password: 'minhnhat1', // Mật khẩu
  server: '203.0.113.10', // Địa chỉ IP công cộng của máy chủ SQL Server
  port: 1433, //
  database: 'master', // Tên cơ sở dữ liệu
  options: {
    encrypt: true, // Sử dụng mã hóa nếu cần (dành cho Azure)
    trustServerCertificate: true, // Bật tùy chọn này nếu dùng máy chủ cục bộ
    requestTimeout: 30000,
  },
};

// Kết nối với SQL Server
sql.connect(dbConfig)
  .then(() => {
    console.log('Đã kết nối đến SQL Server.');
  })
  .catch(err => {
    console.error('Lỗi kết nối SQL Server:', err.message);
  });

// Middleware
app.use(cors()); // Bật CORS cho mọi nguồn gốc
app.use(express.json()); // Hỗ trợ parse JSON từ request body

// API xử lý lưu dữ liệu
app.post('/api/back', async (req, res) => {
  const { username, startTime, endTime, error } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!username || !startTime || !endTime || !error) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }

  try {
    // Thêm dữ liệu vào bảng logs
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('startTime', sql.DateTime, startTime)
      .input('endTime', sql.DateTime, endTime)
      .input('error', sql.VarChar, error)
      .query(
        `INSERT INTO logs (username, start_time, end_time, error) 
         OUTPUT INSERTED.id 
         VALUES (@username, @startTime, @endTime, @error)`
      );

    const insertId = result.recordset[0]?.id; // Lấy ID của bản ghi vừa thêm
    console.log('Lưu dữ liệu thành công, ID:', insertId);
    res.status(200).json({ message: 'Lưu thành công!', id: insertId });
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu:', err.message);
    res.status(500).json({ error: 'Lỗi khi lưu dữ liệu.' });
  }
});

// Xử lý các endpoint không hợp lệ
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint không hợp lệ.' });
});

// Vercel cần export server
module.exports = app;
