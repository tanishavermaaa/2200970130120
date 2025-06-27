const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  shortCode: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
  expiry: { type: Date, required: true },
  clicks: [{
    timestamp: { type: Date, default: Date.now },
    referrer: String,
    location: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('URL', urlSchema); // ✅ Critical!

// const mongoose = require('mongoose');

