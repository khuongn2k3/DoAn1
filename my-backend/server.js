require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

db.connect(err => {
  if (err) console.error('❌ DB connection error:', err);
  else console.log('✅ Connected to MySQL');
});

app.get('/search', (req, res) => {
  const q = req.query.q || '';
  db.query(
    'SELECT title, description, url, image FROM Places WHERE title LIKE ? OR description LIKE ?',
    [`%${q}%`, `%${q}%`],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(results);
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
