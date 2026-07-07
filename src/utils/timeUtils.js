/**
 * Calculates total hours between a Light Up and Light Off event.
 * Eliminates browser-dependent string parsing drifts and handles unshifted midnight crossings.
 * * @param {string} upDate - Format: "YYYY-MM-DD"
 * @param {string} upTime - Format: "HH:MM"
 * @param {string} offDate - Format: "YYYY-MM-DD"
 * @param {string} offTime - Format: "HH:MM"
 * @returns {number} Clean decimal calculation of total hours
 */
export function calculatePowerHours(upDate, upTime, offDate, offTime) {
  if (!upDate || !upTime || !offDate || !offTime) return 0;

  try {
    // 1. Safely break down time elements to bypass volatile 'Date.parse' string sniffing
    const [upYear, upMonth, upDay] = upDate.split('-').map(Number);
    const [upHour, upMin] = upTime.split(':').map(Number);

    const [offYear, offMonth, offDay] = offDate.split('-').map(Number);
    const [offHour, offMin] = offTime.split(':').map(Number);

    // 2. Build explicit local calendar dates (Month parameter is 0-indexed in JS)
    const upDateObj = new Date(upYear, upMonth - 1, upDay, upHour, upMin, 0, 0);
    let offDateObj = new Date(offYear, offMonth - 1, offDay, offHour, offMin, 0, 0);

    let diffInMs = offDateObj.getTime() - upDateObj.getTime();

    // 3. Catch hidden midnight crossings
    // If the off timestamp lands chronologically behind the up event on identical calendars,
    // automatically increment by exactly one calendar cycle day.
    if (diffInMs < 0) {
      diffInMs += 24 * 60 * 60 * 1000;
    }

    // 4. Convert milliseconds to fractional hours
    const totalHours = diffInMs / (1000 * 60 * 60);

    // Ensure it never returns a negative number, formatted to 2 decimal places max
    return Math.max(0, parseFloat(totalHours.toFixed(2)));
  } catch (error) {
    console.error("Failed to parse calculated power log duration:", error);
    return 0;
  }
}