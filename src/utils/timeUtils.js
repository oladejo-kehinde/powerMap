/**
 * Calculates total hours between a Light Up and Light Off event.
 * @param {string} upDate - "YYYY-MM-DD"
 * @param {string} upTime - "HH:MM"
 * @param {string} offDate - "YYYY-MM-DD"
 * @param {string} offTime - "HH:MM"
 * @returns {number} Total hours rounded to two decimal places
 */
export function calculatePowerHours(upDate, upTime, offDate, offTime) {
  if (!upDate || !upTime || !offDate || !offTime) return 0;

  // ISO-friendly strings (e.g., "2026-06-09T22:00")
  const upTimestamp = Date.parse(`${upDate}T${upTime}`);
  const offTimestamp = Date.parse(`${offDate}T${offTime}`);

  // Check for invalid date strings
  if (isNaN(upTimestamp) || isNaN(offTimestamp)) return 0;

  // Calculates difference in milliseconds
  let diffInMs = offTimestamp - upTimestamp;

  // Handles midnight/overnight edge case if dates happen to be identical 
  
  if (diffInMs < 0 && upDate === offDate) {
    // Add 24 hours in milliseconds
    diffInMs += 24 * 60 * 60 * 1000; 
  }

  // Convert ms to hours (1 hour = 3,600,000 ms)
  const totalHours = diffInMs / (1000 * 60 * 60);

  // Return formatted to 2 decimal places (e.g., 4.50 hours)
  return Math.max(0, parseFloat(totalHours.toFixed(2)));
}