// import { supabase } from './supabaseClient'

// // Checks if the user already has a session. If not, signs them in anonymously.
// export async function ensureSession() {
//   const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
//   if (sessionError) {
//     console.error("Error checking session failed:", sessionError.message)
//     return null
//   }

//   if (session) {
//     console.log("[Auth] Active session verified. User ID:", session.user.id)
//     return session.user.id
//   }

//   console.log("[Auth] No session found. Signing in anonymously...")
//   const { data, error } = await supabase.auth.signInAnonymously()
  
//   if (error) {
//     console.error("[Auth Error] Anonymous auth failed:", error.message)
//     return null
//   }
  
//   return data.user.id
// }

// // cloud syncing to both local and cloud
// // Fetches records from the last 7 days
// export async function getLogs() {
//   await ensureSession() 

//   // Use client time as fallback, but server timestamp (created_at) is what matters
//   // The backend assigns the authoritative timestamp when the record is received
//   const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

//   console.log("[Supabase] Fetching 7 days of logs since:", sevenDaysAgo)

//   // Query Supabase for a full week of records
//   // Supabase's created_at is the authoritative server timestamp
//   const { data, error } = await supabase
//     .from('powermap_logs')
//     .select('*')
//     .gte('created_at', sevenDaysAgo)
//     .order('created_at', { ascending: false })

//   if (error) {
//     console.error("Error fetching logs from database:", error.message)
//     const localFallback = localStorage.getItem("powermap_local_logs")
//     return localFallback ? JSON.parse(localFallback) : []
//   }

//   return data
// }const now = new Date();
// const upEvent = { 
//   date: now.toISOString().split('T')[0],  // UTC date
//   time: now.toISOString().split('T')[1].slice(0, 5),  // UTC time (HH:MM)
//   timestamp: now.getTime() 
// }
  
// // write a new log entry to both local storage and the cloud

// export async function addLog(logData) {
//   const localLogs = localStorage.getItem("powermap_local_logs")
//   const currentLogs = localLogs ? JSON.parse(localLogs) : []
  
//   const updatedLocalLogs = [logData, ...currentLogs]
//   localStorage.setItem("powermap_local_logs", JSON.stringify(updatedLocalLogs))

//   const userId = await ensureSession()
//   const finalUserId = userId || "anonymous-offline-user"

//   // ⚡ Supabase will automatically assign the exact global server time to `created_at`
//   const { data, error } = await supabase
//     .from('powermap_logs')
//     .insert([
//       {
//         user_id: finalUserId,
//         state: logData.state,
//         area: logData.area,
//         up_date: logData.upEvent?.date,     
//         up_time: logData.upEvent?.time,     
//         off_date: logData.offEvent?.date,   
//         off_time: logData.offEvent?.time,   
//         total_hours: parseFloat(logData.totalHours)
//       }
//     ])
//     .select()

//   return updatedLocalLogs
// }

// // Remove an individual log from both environments
// export async function removeLog(id, createdAt) {
//   // Remove locally
//   const localLogs = localStorage.getItem("powermap_local_logs")
//   if (localLogs) {
//     const currentLogs = JSON.parse(localLogs)
//     const filtered = currentLogs.filter(log => log.id !== id)
//     localStorage.setItem("powermap_local_logs", JSON.stringify(filtered))
//   }

//   // Remove from Cloud using database ID or timestamp matching
//   const { error } = await supabase
//     .from('powermap_logs')
//     .delete()
//     .eq('user_id', await ensureSession())
//     .eq('up_date', createdAt.split('T')[0]) // match simple date mapping

//   if (error) console.error("Database delete error:", error.message)
// }

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
        console.log("Accuracy (meters):", position.coords.accuracy)
        
        try {
          // Use an open reverse geocoding API to resolve exact administrative boundaries
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          
          if (!response.ok) throw new Error("Network location lookup failed.")
          
          const data = await response.json()
          const address = data.address
          
          // Fallback hierarchy matching regional structural naming rules
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

  // Establish a 7-day window fallback based on device time just in case the time API drops
  let absoluteISOString = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  try {
    console.log("[Time Sync] Synchronizing time window with global network clock...")
    const timeResponse = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC")
    
    if (timeResponse.ok) {
      const timeData = await timeResponse.json()
      const networkCurrentTime = new Date(timeData.utc_datetime)
      // Subtract exactly 7 days from the absolute, un-drifted network time
      absoluteISOString = new Date(networkCurrentTime.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      console.log("[Time Sync] Global network clock sync successful.")
    }
  } catch (timeError) {
    console.warn("[Time Sync Warning] World Time API unreachable. Using safe device fallback tracking.", timeError.message)
  }

  console.log("[Supabase] Fetching 7 days of logs since:", absoluteISOString)

  // Query Supabase using our device-independent timeline frame
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

  console.log("[Supabase Data Payload Received]:", data)
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

  // ⚡ Supabase will automatically assign the exact global server time to `created_at`
  const { data, error } = await supabase
    .from('powermap_logs')
    .insert([
      {
        user_id: finalUserId,
        state: logData.state,
        area: logData.area,
        up_date: logData.upEvent?.date,     
        up_time: logData.upEvent?.time,     
        off_date: logData.offEvent?.date,   
        off_time: logData.offEvent?.time,   
        total_hours: parseFloat(logData.totalHours) || 0
      }
    ])
    .select()

  if (error) {
    console.error("[Database Write Error] Cloud write failed:", error.message)
  }

  return updatedLocalLogs
}

// Remove an individual log from both environments
export async function removeLog(id, createdAt) {
  // Remove locally
  const localLogs = localStorage.getItem("powermap_local_logs")
  if (localLogs) {
    const currentLogs = JSON.parse(localLogs)
    const filtered = currentLogs.filter(log => log.id !== id)
    localStorage.setItem("powermap_local_logs", JSON.stringify(filtered))
  }

  // Remove from Cloud using database ID or timestamp matching
  const { error } = await supabase
    .from('powermap_logs')
    .delete()
    .eq('user_id', await ensureSession())
    .eq('up_date', createdAt.split('T')[0]) // match simple date mapping

  if (error) console.error("Database delete error:", error.message)
}