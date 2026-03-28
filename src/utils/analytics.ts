import { KeystrokeData, PasteEvent, AnalyticsData } from '../types/session';

/**
 * Calculate typing speed in Words Per Minute (WPM)
 * Formula: WPM = (total characters / 5) / (time in minutes)
 */
export function calculateWPM(
  textLength: number,
  startTime: number,
  currentTime: number
): number {
  const timeInMinutes = (currentTime - startTime) / 60000; // Convert ms to minutes
  if (timeInMinutes === 0) return 0;
  
  const words = textLength / 5; // Standard: 5 characters = 1 word
  const wpm = Math.round(words / timeInMinutes);
  
  return wpm;
}

/**
 * Detect pauses in typing
 * A pause is when gap between keystrokes > 2 seconds (2000ms)
 */
export function detectPauses(keystrokeData: KeystrokeData[]): {
  pauseCount: number;
  avgPauseTime: number;
} {
  if (keystrokeData.length < 2) {
    return { pauseCount: 0, avgPauseTime: 0 };
  }

  const PAUSE_THRESHOLD = 2000; // 2 seconds in milliseconds
  let pauseCount = 0;
  let totalPauseTime = 0;

  for (const keystroke of keystrokeData) {
    if (keystroke.interval > PAUSE_THRESHOLD) {
      pauseCount++;
      totalPauseTime += keystroke.interval;
    }
  }

  const avgPauseTime = pauseCount > 0 
    ? Math.round(totalPauseTime / pauseCount) 
    : 0;

  return { pauseCount, avgPauseTime };
}

/**
 * Simple rule-based authenticity detection
 * Returns: "Human", "Suspicious", "Possibly AI", or "Unnatural typing"
 */
export function detectAuthenticity(
  textLength: number,
  pasteEvents: PasteEvent[],
  keystrokeData: KeystrokeData[],
  wpm: number
): string {
  // Rule 1: Check paste percentage
  const totalPastedChars = pasteEvents.reduce((sum, event) => sum + event.length, 0);
  const pastePercentage = textLength > 0 ? (totalPastedChars / textLength) * 100 : 0;
  
  if (pastePercentage > 30) {
    return 'Suspicious';
  }

  // Rule 2: Check for extremely constant typing speed (AI-like behavior)
  // Calculate variance in keystroke intervals
  if (keystrokeData.length > 10) {
    const intervals = keystrokeData
      .map(k => k.interval)
      .filter(i => i > 0 && i < 2000); // Exclude pauses and first keystroke
    
    if (intervals.length > 5) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => {
        return sum + Math.pow(interval - avgInterval, 2);
      }, 0) / intervals.length;
      
      // Very low variance = too consistent = possibly AI
      if (variance < 100 && intervals.length > 20) {
        return 'Possibly AI';
      }
    }
  }

  // Rule 3: Check for no pauses (unnatural)
  const { pauseCount } = detectPauses(keystrokeData);
  if (keystrokeData.length > 50 && pauseCount === 0) {
    return 'Unnatural typing';
  }

  // Default: appears to be human
  return 'Human';
}

/**
 * Calculate all analytics for a session
 */
export function calculateAnalytics(
  textLength: number,
  keystrokeData: KeystrokeData[],
  pasteEvents: PasteEvent[],
  startTime: number
): AnalyticsData {
  const currentTime = Date.now();
  const wpm = calculateWPM(textLength, startTime, currentTime);
  const { pauseCount, avgPauseTime } = detectPauses(keystrokeData);
  const authenticityFlag = detectAuthenticity(textLength, pasteEvents, keystrokeData, wpm);

  return {
    wpm,
    pauseCount,
    avgPauseTime,
    authenticityFlag
  };
}
