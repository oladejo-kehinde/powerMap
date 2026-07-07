import { supabase } from './supabaseClient'

// Checks if the user already has a session. If not, signs them in anonymously.
export async function ensureSession() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error("Error checking session failed:", sessionError.message)
    return null
  }

  if (session) {
    console.log("[Auth] Active session verified. User ID:", session.user.id)
    return session.user.id
  }

  console.log("[Auth] No session found. Signing in anonymously...")
  const { data, error } = await supabase.auth.signInAnonymously()
  
  if (error) {
    console.error("[Auth Error] Anonymous auth failed:", error.message)
    return null
  }
  
  return data.user.id
}

// Automatically resolves clean, standardized map locations using the device's true GPS coordinates
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
            longitude
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

// Fetches records using an absolute network clock timeline window to eliminate device clock drifts
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
    .from('powermap_logs')
    .select('*')
    .gte('created_at', absoluteISOString)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching logs from database:", error.message)
    const localFallback = localStorage.getItem("powermap_local_logs")
    return localFallback ? JSON.parse(localFallback) : []
  }

  return data
}

// Writes a new log entry to both local storage and the cloud
export async function addLog(logData) {
  const localLogs = localStorage.getItem("powermap_local_logs")
  const currentLogs = localLogs ? JSON.parse(localLogs) : []
  
  const updatedLocalLogs = [logData, ...currentLogs]
  localStorage.setItem("powermap_local_logs", JSON.stringify(updatedLocalLogs))

  const userId = await ensureSession()
  const finalUserId = userId || "anonymous-offline-user"

  // ⚡ FIXED: Mapping incoming unified keys correctly matching your Database columns
  const { error } = await supabase
    .from('powermap_logs')
    .insert([
      {
        user_id: finalUserId,
        state: logData.state,
        area: logData.area,
        up_time: logData.up_time,     
        off_time: logData.off_time,   
        total_hours: parseFloat(logData.total_hours) || 0
      }
    ])

  if (error) {
    console.error("[Database Write Error] Cloud write failed:", error.message)
  }

  return updatedLocalLogs
}

// Remove an individual log from both environments
export async function removeLog(id) {
  const localLogs = localStorage.getItem("powermap_local_logs")
  if (localLogs) {
    const currentLogs = JSON.parse(localLogs)
    const filtered = currentLogs.filter(log => log.id !== id)
    localStorage.setItem("powermap_local_logs", JSON.stringify(filtered))
  }

  // Clear data matching reference ID directly
  const { error } = await supabase
    .from('powermap_logs')
    .delete()
    .eq('id', id)

  if (error) console.error("Database delete error:", error.message)
}