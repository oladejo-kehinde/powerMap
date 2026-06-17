import { useEffect, useState } from "react"
import { addLog, getLogs } from "../utils/logStorage"
import { calculatePowerHours } from "../utils/timeUtils"

const nigerianStates = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu",
  "FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Nasarawa","Niger","Ogun","Ondo",
  "Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
]

function LogForm({ onLogAdded }) {
  const [selectedState, setSelectedState] = useState("")
  const [area, setArea] = useState("")
  const [logs, setLogs] = useState([])
  
  const [upDate, setUpDate] = useState("")
  const [upTime, setUpTime] = useState("")
  const [offDate, setOffDate] = useState("")
  const [offTime, setOffTime] = useState("")

  const [feedback, setFeedback] = useState({ message: "", type: "" })

  useEffect(() => {
    const savedLogs = getLogs()
    setLogs(Array.isArray(savedLogs) ? savedLogs : [])
  }, [])

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback({ message: "", type: "" }), 5000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedState || !area || !upDate || !upTime || !offDate || !offTime) {
      showFeedback("Please fill out all fields before submitting.", "error")
      return
    }

    const upTimestamp = new Date(`${upDate}T${upTime}`)
    const offTimestamp = new Date(`${offDate}T${offTime}`)

    if (offTimestamp <= upTimestamp) {
      showFeedback("Error: 'Light Off' time must be after 'Light Up' time.", "error")
      return
    }

    const hours = calculatePowerHours(upDate, upTime, offDate, offTime)

    const logEntry = {
      id: Date.now(),
      state: selectedState,
      area,
      upEvent: { date: upDate, time: upTime },
      offEvent: { date: offDate, time: offTime },
      totalHours: hours,
      createdAt: new Date().toISOString(),
    }

    const updatedLogs = addLog(logEntry)
    setLogs(updatedLogs)

    setSelectedState("")
    setArea("")
    setUpDate("")
    setUpTime("")
    setOffDate("")
    setOffTime("")

    showFeedback(`Logged successfully! Total duration: ${hours} hours.`, "success")

    // Trace log added here 
    console.log(" [LogForm] Log submitted successfully. Calling onLogAdded() to trigger refresh...")
    if (onLogAdded) onLogAdded()
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl border border-brand-border bg-brand-sidebar p-6 text-base leading-relaxed">
        
        {feedback.message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border ${
            feedback.type === "error" 
              ? "bg-red-500/10 border-red-500/30 text-red-400" 
              : "bg-green-500/10 border-green-500/30 text-green-400"
          }`}>
            {feedback.message}
          </div>
        )}

        {/* STATE */}
        <div className="mb-4">
          <label htmlFor="state" className="mb-1 block text-sm font-bold text-brand-accent uppercase tracking-normal">
            State
          </label>
          <select
            id="state"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            required
            className="w-full rounded-xl border border-brand-border bg-zinc-800 px-4 py-3 text-base font-normal text-white outline-none transition-all focus:border-brand-accent"
          >
            <option value="">Select your state</option>
            {nigerianStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Input Area */}
        <div className="mb-4">
          <label htmlFor="area" className="mb-1 block text-sm font-bold text-brand-accent uppercase tracking-normal">
            Area / Neighbourhood
          </label>
          <input
            type="text"
            id="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="surulere, wuse2..."
            required
            className="w-full rounded-xl border border-brand-border bg-zinc-800 px-4 py-3 text-base font-normal text-white outline-none transition-all focus:border-brand-accent"
          />
        </div>

        <hr className="border-brand-border my-6" />

        {/* LIGHT UP INPUTS */}
        <h3 className="text-sm font-bold text-green-400 uppercase mb-3 tracking-wide"> Light Up </h3>
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="upDate" className="mb-1 block text-xs font-semibold text-brand-muted uppercase">Date</label>
            <input
              type="date"
              id="upDate"
              value={upDate}
              onChange={(e) => setUpDate(e.target.value)}
              required
              style={{ colorScheme: "dark" }}
              className="w-full rounded-xl border border-brand-border bg-zinc-800 px-4 py-3 text-base text-white outline-none focus:border-brand-accent"
            />
          </div>
          <div>
            <label htmlFor="upTime" className="mb-1 block text-xs font-semibold text-brand-muted uppercase">Time</label>
            <input
              type="time"
              id="upTime"
              value={upTime}
              onChange={(e) => setUpTime(e.target.value)}
              required
              style={{ colorScheme: "dark" }}
              className="w-full rounded-xl border border-brand-border bg-zinc-800 px-4 py-3 text-base text-white outline-none focus:border-brand-accent"
            />
          </div>
        </div>

        {/* LIGHT OFF INPUTS */}
        <h3 className="text-sm font-bold text-red-400 uppercase mb-3 tracking-wide"> Light Off </h3>
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="offDate" className="mb-1 block text-xs font-semibold text-brand-muted uppercase">Date</label>
            <input
              type="date"
              id="offDate"
              value={offDate}
              onChange={(e) => setOffDate(e.target.value)}
              required
              style={{ colorScheme: "dark" }}
              className="w-full rounded-xl border border-brand-border bg-zinc-800 px-4 py-3 text-base text-white outline-none focus:border-brand-accent"
            />
          </div>
          <div>
            <label htmlFor="offTime" className="mb-1 block text-xs font-semibold text-brand-muted uppercase">Time</label>
            <input
              type="time"
              id="offTime"
              value={offTime}
              onChange={(e) => setOffTime(e.target.value)}
              required
              style={{ colorScheme: "dark" }}
              className="w-full rounded-xl border border-brand-border bg-zinc-800 px-4 py-3 text-base text-white outline-none focus:border-brand-accent"
            />
          </div>
        </div>

        <button type="submit" className="w-full rounded-xl border border-brand-border bg-brand-accent/10 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">
          Log Event
        </button>
      </form>
    </div>
  )
}

export default LogForm