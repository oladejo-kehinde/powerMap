/**
 * Calculates total hours between a Light Up and Light Off event.
 * Handles same-day logging, cross-date logging, and unshifted midnight crossings.
 */
export function calculatePowerHours(upDate, upTime, offDate, offTime) {
  if (!upDate || !upTime || !offDate || !offTime) return 0;

  // 1. Build authentic JS timestamps
  const upTimestamp = Date.parse(`${upDate}T${upTime}`);
  let offTimestamp = Date.parse(`${offDate}T${offTime}`);

  if (isNaN(upTimestamp) || isNaN(offTimestamp)) return 0;

  let diffInMs = offTimestamp - upTimestamp;

  // 2. Catch the hidden midnight crossing:
  // If the light went off "before" it came on, and the user forgot to change the offDate 
  // to the next day, we automatically shift it forward by 24 hours.
  if (diffInMs < 0) {
    diffInMs += 24 * 60 * 60 * 1000; 
  }

  // 3. Convert ms to total hours 
  const totalHours = diffInMs / (1000 * 60 * 60);

  // Return formatted cleanly to 2 decimal places
  return Math.max(0, parseFloat(totalHours.toFixed(2)));
}