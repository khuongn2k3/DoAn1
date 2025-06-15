const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(secret.uri);
let collection;

// Kết nối đến MongoDB
async function connectDB() {
  try {
    await client.connect();
    const db = client.db('DULICHVIETNAM');
    collection = db.collection('diadiem'); // tên bảng bạn sẽ tạo
    console.log('✅ Đã kết nối MongoDB');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err);
  }
}
connectDB();

// API tìm kiếm
app.get('/search', async (req, res) => {
  const keyword = req.query.keyword || '';
  if (!collection) return res.status(500).send('Chưa kết nối database');

  try {
    const results = await collection.find({
      ten: { $regex: keyword, $options: 'i' }
    }).toArray();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy ở http://localhost:${PORT}`);
});
