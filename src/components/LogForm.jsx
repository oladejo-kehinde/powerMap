
import { useState } from "react"
import { addLog } from "../utils/logStorage"

function LogForm({ onLogAdded, isPowerUp, setIsPowerUp, location }) {
  const [activeTab, setActiveTab] = useState("live")
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0])
  const [manualUpTime, setManualUpTime] = useState("")
  const [manualOffTime, setManualOffTime] = useState("")
  const [feedback, setFeedback] = useState({ text: "", isError: false })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasLiveLocation = () => {
    const invalidStatuses = ["Detecting location...", "GPS unavailable", ""]
    return Boolean(location && !invalidStatuses.includes(location.trim()))
  }

  const getLocationDetails = () => {
    if (!hasLiveLocation()) {
      return { state: "Unknown Location", area: "Default Area" }
    }
    const parts = location.split(",").map((p) => p.trim()).filter(Boolean)
    return {
      state: parts[0] || "Unknown State",
      area: parts.length > 1 ? parts.slice(1).join(", ") : "General Area",
    }
  }

  const showFeedback = (text, isError = false) => {
    setFeedback({ text, isError })
    setTimeout(() => setFeedback({ text: "", isError: false }), 4000)
  }

  const handleLiveToggle = async () => {
    const now = new Date()
    const todayStr = now.toISOString().split("T")[0]
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    const { state, area } = getLocationDetails()

    if (!isPowerUp) {
      // Starting a power uptime log window
      const startMarker = { date: todayStr, time: timeStr, timestamp: now.getTime() }
      localStorage.setItem("power_session_marker", JSON.stringify(startMarker))
      setIsPowerUp(true)
      showFeedback("Tracking power uptime session started.")
    } else {
      // Ending the power window (Power has cut out)
      setIsSubmitting(true)
      const savedSession = localStorage.getItem("power_session_marker")
      
      if (!savedSession) {
        showFeedback("No active tracking session found. Resetting state.", true)
        setIsPowerUp(false)
        setIsSubmitting(false)
        return
      }

      try {
        const session = JSON.parse(savedSession)
        const durationHours = parseFloat(((now.getTime() - session.timestamp) / (1000 * 60 * 60)).toFixed(1))

        const completeLog = {
          state,
          area,
          up_time: `${session.date} T ${session.time}`,
          off_time: `${todayStr} T ${timeStr}`,
          total_hours: durationHours > 0 ? durationHours : 0.1,
          created_at: now.toISOString(),
        }

        await addLog(completeLog)
        localStorage.removeItem("power_session_marker")
        setIsPowerUp(false)
        if (onLogAdded) onLogAdded()
        showFeedback("Power cut log saved to registry!")
      } catch {
        showFeedback("Database error saving log. Try again.", true)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualUpTime || !manualOffTime) {
      return showFeedback("Please fill in both fields.", true)
    }

    setIsSubmitting(true)
    const [upH, upM] = manualUpTime.split(":").map(Number)
    const [offH, offM] = manualOffTime.split(":").map(Number)
    let duration = (offH + offM / 60) - (upH + upM / 60)
    if (duration < 0) duration += 24 // Handles overnight schedules

    const { state, area } = getLocationDetails()

    try {
      const completeLog = {
        state,
        area,
        up_time: `${manualDate} T ${manualUpTime}`,
        off_time: `${manualDate} T ${manualOffTime}`,
        total_hours: parseFloat(duration.toFixed(1)),
        created_at: new Date().toISOString(),
      }

      await addLog(completeLog)
      setManualUpTime("")
      setManualOffTime("")
      if (onLogAdded) onLogAdded()
      showFeedback("Manual log submitted successfully!")
    } catch {
      showFeedback("Failed to update remote registry.", true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-md space-y-6">
      {/* Navigation Tabs */}
      <div className="flex rounded-xl border border-zinc-800 bg-zinc-950 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("live")}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            activeTab === "live"
              ? "bg-zinc-800 text-white shadow border border-zinc-700/50"
              : "text-zinc-500 hover:text-zinc-400"
          }`}
        >
          Live Status Reporter
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            activeTab === "manual"
              ? "bg-zinc-800 text-white shadow border border-zinc-700/50"
              : "text-zinc-500 hover:text-zinc-400"
          }`}
        >
          Manual Log Entry
        </button>
      </div>

      {/* Main Tab Panels */}
      {activeTab === "live" ? (
        <div className="space-y-4 py-2 text-center">
          <button
            type="button"
            onClick={handleLiveToggle}
            disabled={!hasLiveLocation() || isSubmitting}
            className={`w-full transform rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg ${
              !hasLiveLocation()
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/30"
                : isPowerUp
                ? "bg-amber-500 hover:bg-amber-600 text-zinc-950"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {!hasLiveLocation()
              ? "Awaiting Valid Geolocation..."
              : isSubmitting
              ? "Syncing Grid Log..."
              : isPowerUp
              ? "⚡ Power is On (Tap if it goes Off)"
              : "🔌 Power is Off (Tap when restored)"}
          </button>
          <p className="text-xs font-medium text-zinc-500">
            {!hasLiveLocation()
              ? "Your local dynamic tracking requires active GPS metadata coordinates."
              : isPowerUp
              ? "Session actively running. Duration metric calculation is ongoing."
              : "System idle. Tap to timestamp whenever grid power is returned."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Date of Record</label>
            <input
              type="date"
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm font-medium text-white shadow-inner focus:border-zinc-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="upTime" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Power Restored</label>
              <input
                id="upTime"
                type="time"
                value={manualUpTime}
                onChange={(e) => setManualUpTime(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm font-medium text-white shadow-inner focus:border-zinc-600 focus:outline-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label htmlFor="offTime" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Power Outage</label>
              <input
                id="offTime"
                type="time"
                value={manualOffTime}
                onChange={(e) => setManualOffTime(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm font-medium text-white shadow-inner focus:border-zinc-600 focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-zinc-100 py-3 text-xs font-bold uppercase tracking-wider text-zinc-950 shadow-md transition-all hover:bg-white active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? "Uploading entry..." : "Commit Log Entry"}
          </button>
        </form>
      )}

      {/* Global Status Banner Notifications */}
      {feedback.text && (
        <p className={`text-center text-xs font-semibold tracking-wide ${feedback.isError ? "text-rose-400" : "text-emerald-400"}`}>
          {feedback.text}
        </p>
      )}
    </div>
  )
}

export default LogForm