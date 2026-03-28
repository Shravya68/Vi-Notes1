const mongoose = require('mongoose');

// Keystroke data schema
const keystrokeSchema = new mongoose.Schema({
  keyDownTime: {
    type: Number,
    required: true
  },
  keyUpTime: {
    type: Number,
    required: true
  },
  interval: {
    type: Number,
    required: true
  }
}, { _id: false });

// Paste event schema
const pasteEventSchema = new mongoose.Schema({
  timestamp: {
    type: Number,
    required: true
  },
  length: {
    type: Number,
    required: true
  }
}, { _id: false });

// Analytics data schema
const analyticsSchema = new mongoose.Schema({
  wpm: {
    type: Number,
    default: 0
  },
  pauseCount: {
    type: Number,
    default: 0
  },
  avgPauseTime: {
    type: Number,
    default: 0
  },
  authenticityFlag: {
    type: String,
    enum: ['Human', 'Suspicious', 'Possibly AI', 'Unnatural typing'],
    default: 'Human'
  }
}, { _id: false });

// Main session schema
const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: false
  },
  keystrokeData: [keystrokeSchema],
  pasteEvents: [pasteEventSchema],
  textContent: {
    type: String,
    required: true
  },
  analytics: {
    type: analyticsSchema,
    default: () => ({
      wpm: 0,
      pauseCount: 0,
      avgPauseTime: 0,
      authenticityFlag: 'Human'
    })
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', sessionSchema);
