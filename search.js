const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = 'DULICHVIETNAM';

router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('diadiem'); 
    
    const results = await collection.find({
      title: { $regex: query, $options: 'i' }
    }).toArray();

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
