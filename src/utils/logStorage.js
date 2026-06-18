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

// 1. CLOUD SYNCING: READ ALL NATIONAL RECENT LOGS
// Fetches records from the last 24 hours for the overview page
export async function getLogs() {
  await ensureSession() 

  // Get the timestamp for exactly 24 hours ago
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  console.log("[Supabase] Fetching national logs since:", twentyFourHoursAgo)

  const { data, error } = await supabase
    .from('powermap_logs')
    .select('*')
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching logs from database:", error.message)
    // Fallback to local storage if network fails completely
    const localFallback = localStorage.getItem("powermap_local_logs")
    return localFallback ? JSON.parse(localFallback) : []
  }
  return data
}

// 2. CLOUD SYNCING: WRITE TO BOTH LOCAL AND CLOUD
export async function addLog(logData) {
  // --- Step A: Save to Local Storage first for instant personal math ---
  const localLogs = localStorage.getItem("powermap_local_logs")
  const currentLogs = localLogs ? JSON.parse(localLogs) : []
  
  // Keep your detailed frontend object intact locally
  const updatedLocalLogs = [logData, ...currentLogs]
  localStorage.setItem("powermap_local_logs", JSON.stringify(updatedLocalLogs))
  console.log("[Local Storage] Log saved locally.")

  // --- Step B: Push clean row to Supabase ---
  const userId = await ensureSession()
  const finalUserId = userId || "anonymous-offline-user"

  console.log("[Supabase] Syncing new log to the cloud...")

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
        total_hours: parseFloat(logData.totalHours)
      }
    ])
    .select()

  if (error) {
    console.error("[Supabase Sync Error] Cloud write failed:", error.message)
    // Don't crash the app, since it already saved locally
  }

  // Return the full updated local array so your UI state updates instantly
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