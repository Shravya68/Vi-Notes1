// Type definitions for session data

export interface KeystrokeData {
  keyDownTime: number;
  keyUpTime: number;
  interval: number; // Time since previous keystroke
}

export interface PasteEvent {
  timestamp: number;
  length: number;
}

export interface AnalyticsData {
  wpm: number;
  pauseCount: number;
  avgPauseTime: number;
  authenticityFlag: string;
}

export interface Session {
  sessionId?: string;
  userId?: string;
  keystrokeData: KeystrokeData[];
  pasteEvents: PasteEvent[];
  textContent: string;
  analytics?: AnalyticsData;
  createdAt?: Date;
}
