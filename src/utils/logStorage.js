import { supabase } from './supabaseClient'

// Checks if the user already has a session. If not, signs them in anonymously.
export async function ensureSession() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error("Error checking session failed:", sessionError.message)
    return null
  }

  // If session exists, return user secure ID
  if (session) {
    console.log("[Auth] Active session verified. User ID:", session.user.id)
    return session.user.id
  }

  // No session? Sign them in anonymously
  console.log(" [Auth] No session found. Signing in anonymously...")
  const { data, error } = await supabase.auth.signInAnonymously()
  
  if (error) {
    console.error(" [Auth Error] Anonymous auth failed:", error.message)
    return null
  }
  
  return data.user.id
}

// Fetch today's logs from Supabase
export async function getLogs() {
  await ensureSession() 

  const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  console.log(` [Supabase] Fetching logs created on or after ${todayStr}...`)

  const { data, error } = await supabase
    .from('powermap_logs')
    .select('*')
    .gte('created_at', `${todayStr}T00:00:00.000Z`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching logs from database:", error.message)
    return []
  }
  return data
}

// Add a log to the crowdsourced cloud database
export async function addLog(logEntry) {
  const userId = await ensureSession()
  if (!userId) throw new Error("Authentication failed")

  // Map frontend fields to the backend table format
  const dbPayload = {
    user_id: userId,
    state: logEntry.state,
    area: logEntry.area,
    up_date: logEntry.upEvent.date,
    up_time: logEntry.upEvent.time,
    off_date: logEntry.offEvent.date,
    off_time: logEntry.offEvent.time,
    total_hours: parseFloat(logEntry.totalHours)
  }

  const { data, error } = await supabase
    .from('powermap_logs')
    .insert([dbPayload])
    .select()

  if (error) {
    console.error("Database insert error:", error.message)
    throw error
  }
  return data
}

// Remove an individual log and (Only works if RLS allows it)
export async function removeLog(id) {
  const { error } = await supabase
    .from('powermap_logs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Database delete error:", error.message)
    throw error
  }
}