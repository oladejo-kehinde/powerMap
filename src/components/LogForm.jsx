import { useState } from "react"
import { addLog } from "../utils/logStorage"

function LogForm({ onLogAdded, isPowerUp, setIsPowerUp, location }) {
  const [activeTab, setActiveTab] = useState("live")
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0])
  const [manualUpTime, setManualUpTime] = useState("")
  const [manualOffTime, setManualOffTime] = useState("")
  const [feedback, setFeedback] = useState("")

  const hasLiveLocation = () => Boolean(location?.trim() && location !== "Detecting location..." && location !== "GPS unavailable")

  const getLocationDetails = () => {
    const cleanedLocation = location?.trim()

    if (!cleanedLocation || cleanedLocation === "Detecting location..." || cleanedLocation === "GPS unavailable") {
      return { state: "Unknown location", area: "Current location" }
    }

    const parts = cleanedLocation.split(",").map((part) => part.trim()).filter(Boolean)

    return {
      state: parts[0] || cleanedLocation,
      area: parts.length > 1 ? parts.slice(1).join(", ") : "Current area"
    }
  }

  const handleLiveToggle = () => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

    const { state, area } = getLocationDetails()

    if (!isPowerUp) {
      const startMarker = { date: todayStr, time: timeStr, timestamp: now.getTime() }
      localStorage.setItem("current_power_session", JSON.stringify(startMarker))
      setIsPowerUp(true)
    } else {
      const savedSession = localStorage.getItem("current_power_session")
      if (savedSession) {
        const session = JSON.parse(savedSession)
        const durationHours = parseFloat(((now.getTime() - session.timestamp) / (1000 * 60 * 60)).toFixed(1))
        
        const completeLog = {
          id: Date.now(),
          state,
          area,
          upEvent: { date: session.date, time: session.time },
          offEvent: { date: todayStr, time: timeStr },
          totalHours: durationHours > 0 ? durationHours : 0.5,
          createdAt: now.toISOString()
        }

        addLog(completeLog)
        if (onLogAdded) onLogAdded()
      }
      localStorage.removeItem("current_power_session")
      setIsPowerUp(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualUpTime || !manualOffTime) {
      setFeedback("Please fill in both fields")
      return
    }

    const [upH, upM] = manualUpTime.split(":").map(Number)
    const [offH, offM] = manualOffTime.split(":").map(Number)
    let duration = (offH + offM/60) - (upH + upM/60)
    if (duration < 0) duration += 24

    const { state, area } = getLocationDetails()

    const completeLog = {
      id: Date.now(),
      state,
      area,
      upEvent: { date: manualDate, time: manualUpTime },
      offEvent: { date: manualDate, time: manualOffTime },
      totalHours: parseFloat(duration.toFixed(1)),
      createdAt: new Date().toISOString()
    }

    addLog(completeLog)
    if (onLogAdded) onLogAdded()

    setManualUpTime("")
    setManualOffTime("")
    setFeedback("Log saved successfully!")
    setTimeout(() => setFeedback(""), 3000)
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-6 w-full space-y-6 shadow-2xl">
      <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-900">
        <button
          onClick={() => setActiveTab("live")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
            activeTab === "live" ? "bg-zinc-800 text-white shadow-md border border-zinc-700/50" : "text-zinc-500 hover:text-zinc-400"
          }`}
        >
          Live Report
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
            activeTab === "manual" ? "bg-zinc-800 text-white shadow-md border border-zinc-700/50" : "text-zinc-500 hover:text-zinc-400"
          }`}
        >
          History Log
        </button>
      </div>

      {activeTab === "live" ? (
        <div className="text-center py-2 space-y-4">
          <button
            onClick={handleLiveToggle}
            disabled={!hasLiveLocation()}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all duration-300 transform active:scale-[0.98] shadow-md ${
              isPowerUp 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {!hasLiveLocation() 
            ? "Enter your location to get started" 
            : isPowerUp ? "Power is on. Tap when it goes off." : "Power is off. Tap when it's back on."}
          </button>
          <p className="text-xs text-zinc-500 font-medium">
            {!hasLiveLocation()
              ? "Location is required to track when power goes on and off."
              : isPowerUp ? "Power is on. Timing how long it stays on." : "Power is off. Waiting for it to come back."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Date of Event</label>
            <input 
              type="date" 
              value={manualDate} 
              onChange={(e) => setManualDate(e.target.value)}
              className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-zinc-700 font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
  <label htmlFor="upTime" className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Power On</label>
  <input 
    id="upTime"
    type="time" 
    value={manualUpTime}
    onChange={(e) => setManualUpTime(e.target.value)}
    required
    className="w-full rounded-xl border border-brand-border bg-zinc-950/60 px-4 py-3 text-base text-white outline-none focus:border-brand-accent [color-scheme:dark]"  
  />
</div>
  <div>
  <label htmlFor="offTime" className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Power Off</label>
  <input 
    id="offTime"
    type="time" 
    value={manualOffTime}
    onChange={(e) => setManualOffTime(e.target.value)}
    required
    className="w-full rounded-xl border border-brand-border bg-zinc-950/60 px-4 py-3 text-base text-white outline-none focus:border-brand-accent [color-scheme:dark]"  
  />
</div>
          </div>
          <button type="submit" className="w-full bg-brand-accent hover:bg-amber-600 text-zinc-900 text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md active:scale-[0.99]">
            Submit Light Report
          </button>
          {feedback && <p className="text-xs font-medium text-center mt-2 text-emerald-400">{feedback}</p>}
        </form>
      )}
    </div>
  )
}

export default LogForm