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

// Fetch today's logs 
export async function getLogs() {
  await ensureSession() 

  const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  console.log(`[Supabase] Fetching logs created on or after ${todayStr}...`)

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

export async function addLog(logData) {
  const userId = await ensureSession()
  const finalUserId = userId || "anonymous-offline-user"

  console.log("[Supabase] Pushing new log to the cloud...", logData)

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
    console.error("[Supabase Error] Failed to insert log:", error.message)
    throw error
  }

  return data[0]
}
    

// Remove an individual log 
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