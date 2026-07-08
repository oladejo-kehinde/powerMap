import { supabase } from './supabaseClient'

export async function ensureSession() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Error checking session failed:", sessionError.message)
    return null
  }

  if (session) {
    return session.user.id
  }

  const { data, error } = await supabase.auth.signInAnonymously()

  if (error) {
    console.error("[Auth Error] Anonymous auth failed:", error.message)
    return null
  }

  return data.user.id
}

export async function getStandardizedLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser framework."))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )

          if (!response.ok) throw new Error("Network location lookup failed.")

          const data = await response.json()
          const address = data.address

          const standardizedState = address.state || address.region || address.county || "Unknown State"
          const standardizedArea = address.suburb || address.city || address.town || address.village || "Unknown Area"

          resolve({
            state: standardizedState.trim(),
            area: standardizedArea.trim(),
            latitude,
            longitude,
          })
        } catch (err) {
          console.error("Geocoding resolution failed:", err)
          reject(err)
        }
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

export async function getLogs() {
  await ensureSession()

  let absoluteISOString = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const timeResponse = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC")
    if (timeResponse.ok) {
      const timeData = await timeResponse.json()
      const networkCurrentTime = new Date(timeData.utc_datetime)
      absoluteISOString = new Date(networkCurrentTime.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  } catch (timeError) {
    console.warn("[Time Sync Warning] World Time API unreachable. Using device fallback.", timeError.message)
  }

  const { data, error } = await supabase
    .from("powermap_logs")
    .select("*")
    .gte("created_at", absoluteISOString)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching logs from database:", error.message)
    const localFallback = localStorage.getItem("powermap_local_logs")
    return localFallback ? JSON.parse(localFallback) : []
  }

  return data
}

export async function addLog(logData) {
  const localLogs = localStorage.getItem("powermap_local_logs")
  const currentLogs = localLogs ? JSON.parse(localLogs) : []
  const userId = await ensureSession()
  const finalUserId = userId || "anonymous-offline-user"

  const normalizedLog = {
    ...logData,
    id: logData.id || Date.now(),
    user_id: logData.user_id || finalUserId,
    created_at: logData.created_at || new Date().toISOString(),
    state: logData.state || "Unknown State",
    area: logData.area || "Unknown Area",
    total_hours: parseFloat(logData.total_hours) || 0,
  }

  const updatedLocalLogs = [normalizedLog, ...currentLogs]
  localStorage.setItem("powermap_local_logs", JSON.stringify(updatedLocalLogs))

  const { error } = await supabase.from("powermap_logs").insert([
    {
      user_id: normalizedLog.user_id,
      state: normalizedLog.state,
      area: normalizedLog.area,
      up_time: normalizedLog.up_time,
      off_time: normalizedLog.off_time,
      total_hours: normalizedLog.total_hours,
      created_at: normalizedLog.created_at,
    },
  ])

  if (error) {
    console.error("[Database Write Error] Cloud write failed:", error.message)
  }

  return updatedLocalLogs
}

export async function removeLog(id) {
  const localLogs = localStorage.getItem("powermap_local_logs")
  if (localLogs) {
    const currentLogs = JSON.parse(localLogs)
    const filtered = currentLogs.filter((log) => log.id !== id)
    localStorage.setItem("powermap_local_logs", JSON.stringify(filtered))
  }

  const { error } = await supabase.from("powermap_logs").delete().eq("id", id)

  if (error) console.error("Database delete error:", error.message)
}

export async function getPersonalLogs() {
  const userId = await ensureSession()
  if (!userId) return []

  let absoluteISOString = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const timeResponse = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC")
    if (timeResponse.ok) {
      const timeData = await timeResponse.json()
      const networkCurrentTime = new Date(timeData.utc_datetime)
      absoluteISOString = new Date(networkCurrentTime.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  } catch (timeError) {
    console.warn("[Time Sync Warning] World Time API unreachable. Using device fallback.", timeError.message)
  }

  const { data, error } = await supabase
    .from("powermap_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", absoluteISOString)
    .order("created_at", { ascending: false })

  const remoteLogs = !error ? data || [] : []
  const localFallback = localStorage.getItem("powermap_local_logs")
  const localLogs = localFallback ? JSON.parse(localFallback) : []
  const personalLocalLogs = localLogs.filter((log) => (log.user_id || "anonymous-offline-user") === userId)

  return [...personalLocalLogs, ...remoteLogs]
}