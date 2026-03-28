# Vi-Notes - Authenticity Verification Platform

A platform that detects human-written content using typing behavior and statistical analysis.

## Features

- Clean, distraction-free writing editor
- Keystroke timing capture (keydown/keyup events)
- Paste detection with length tracking
- Privacy-focused: no actual characters stored, only timing data
- MongoDB storage for session data

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express.js
- Database: MongoDB

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:
   - Install MongoDB locally or use MongoDB Atlas
   - Create a `.env` file based on `.env.example`
   - Update `MONGODB_URI` with your connection string

3. Start the application:
```bash
npm run dev
```

This runs both frontend (port 3000) and backend (port 5000) concurrently.

## API Endpoints

### POST /api/session
Save a writing session with keystroke and paste data.

**Request Body:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "userId": "optional_user_id",
  "keystrokeData": [
    {
      "keyDownTime": 1234567890123,
      "keyUpTime": 1234567890150,
      "interval": 200
    }
  ],
  "pasteEvents": [
    {
      "timestamp": 1234567890500,
      "length": 150
    }
  ],
  "textContent": "The actual text content"
}
```

**Response:**
```json
{
  "message": "Session saved successfully",
  "sessionId": "session_1234567890_abc123",
  "keystrokeCount": 45,
  "pasteCount": 1
}
```

### GET /api/session/:id
Retrieve a session by ID.

**Response:**
```json
{
  "_id": "...",
  "sessionId": "session_1234567890_abc123",
  "userId": "optional_user_id",
  "keystrokeData": [...],
  "pasteEvents": [...],
  "textContent": "The actual text content",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Data Structure

### KeystrokeData
- `keyDownTime`: Timestamp when key was pressed
- `keyUpTime`: Timestamp when key was released
- `interval`: Time since previous keystroke (ms)

### PasteEvent
- `timestamp`: When paste occurred
- `length`: Number of characters pasted

### Session
- `sessionId`: Unique session identifier
- `userId`: Optional user identifier
- `keystrokeData`: Array of keystroke timing data
- `pasteEvents`: Array of paste events
- `textContent`: The actual text written
- `createdAt`: Session creation timestamp

## Privacy

The application does NOT store individual keystrokes or characters in the keystroke data. Only timing information is captured for behavioral analysis.
