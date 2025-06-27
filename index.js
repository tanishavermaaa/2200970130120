const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const logger = require('./middlewares/logger');
const URL = require('./models/url');

const app = express();
app.use(express.json());
app.use(logger);


mongoose.connect('mongodb+srv://wwwtanishaverma:4GwkYAL7HE0jXgpl@cluster0.o86tnqj.mongodb.net/urlshortner', {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(console.error);

  app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity = 30, shortCode } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    let code = shortCode || uuidv4().slice(0, 6);

    const existing = await URL.findOne({ shortCode: code });
    if (existing) return res.status(400).json({ error: "Shortcode already exists" });

    const expiryDate = new Date(Date.now() + validity * 60000);

    const newUrl = await URL.create({ shortCode: code, originalUrl: url, expiry: expiryDate });
    res.status(201).json({
      shortLink: `http://localhost:3000/${code}`,
      expiry: expiryDate.toISOString()
    });
  } catch (err) {
    next(err);
    // console.error(err);
    // res.status(500).json({ error: "Server error" });
  }
});

app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const urlDoc = await URL.findOne({ shortCode });
    if (!urlDoc) return res.status(404).json({ error: "Shortcode not found" });

    if (urlDoc.expiry < new Date()) return res.status(410).json({ error: "Shortlink expired" });

    urlDoc.clicks.push({
      timestamp: new Date(),
      referrer: req.get('Referrer') || 'direct',
      location: "N/A"
    });
    await urlDoc.save();

    res.redirect(urlDoc.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/shorturls/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const urlDoc = await URL.findOne({ shortCode });
    if (!urlDoc) return res.status(404).json({ error: "Shortcode not found" });

    res.json({
      clicks: urlDoc.clicks.length,
      originalUrl: urlDoc.originalUrl,
      createdAt: urlDoc.createdAt,
      expiry: urlDoc.expiry,
      clickData: urlDoc.clicks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


