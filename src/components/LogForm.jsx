import { useState } from "react"

const nigerianStates = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu",
  "FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Nasarawa","Niger","Ogun","Ondo",
  "Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
]

function LogForm() {
  const [selectedState, setSelectedState] = useState("")
  const [area, setArea] = useState("")
  const [status, setStatus] = useState("up")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  return (
    <div className="w-full max-w-lg rounded-2xl border border-brand-border bg-brand-sidebar p-6 text-base leading-relaxed">

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

      {/* POWER STATUS */}
      <div className="mb-4">
        <label className="block mb-2 text-xs font-medium text-brand-muted tracking-normal">
          Power Status
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setStatus(status === "up" ? "off" : "up")}
            aria-pressed={status === "up"}
            className={`relative inline-flex h-8 w-22 items-center rounded-full p-1 transition-colors duration-300 border border-brand-border ${
              status === "up" ? "justify-end bg-green-500" : "justify-start bg-red-500"
            }`}
          >
            <span className="h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300" />
          </button>
          <span className="text-sm font-semibold text-brand-accent min-w-[70px]">
            {status === "up" ? "Light Up" : "Light Off"}
          </span>
        </div>
      </div>

      {/* DATE + TIME */}
      <div className="mb-4 grid grid-cols-2 gap-4">

        {/* DATE */}
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-bold text-brand-accent uppercase tracking-normal">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{ colorScheme: "dark" }}
            className="w-full rounded-xl border border-brand-border bg-zinc-800 px-4 py-3 text-base font-normal text-white outline-none transition focus:border-brand-accent"
          />
        </div>

        {/* TIME */}
        <div>
          <label htmlFor="time" className="mb-1 block text-sm font-bold text-brand-accent uppercase tracking-normal">
            Time
          </label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            style={{ colorScheme: "dark" }}
            className="w-full rounded-xl border border-brand-border bg-zinc-800 px-4 py-3 text-base font-normal text-white outline-none transition focus:border-brand-accent"
          />
        </div>
      </div>

      {/* BUTTON */}
      <button className="w-full rounded-xl border border-brand-border py-3 text-sm font-semibold text-white transition hover:bg-brand-hover">
        Log Event
      </button>

    </div>
  )
}

export default LogForm