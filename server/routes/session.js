const express = require('express');
const router = express.Router();
const Session = require('../models/Session');


router.post('/', async (req, res) => {
  try {
    const { sessionId, userId, keystrokeData, pasteEvents, textContent, analytics } = req.body;

    if (!sessionId || !textContent) {
      return res.status(400).json({ 
        error: 'sessionId and textContent are required' 
      });
    }


    const session = new Session({
      sessionId,
      userId,
      keystrokeData: keystrokeData || [],
      pasteEvents: pasteEvents || [],
      textContent,
      analytics: analytics || {
        wpm: 0,
        pauseCount: 0,
        avgPauseTime: 0,
        authenticityFlag: 'Human'
      }
    });

    await session.save();

    res.status(201).json({
      message: 'Session saved successfully',
      sessionId: session.sessionId,
      keystrokeCount: session.keystrokeData.length,
      pasteCount: session.pasteEvents.length,
      analytics: session.analytics
    });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.id });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }); 

    res.json(sessions);
  } catch (error) {
    console.error('Error retrieving user sessions:', error);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

module.exports = router;
