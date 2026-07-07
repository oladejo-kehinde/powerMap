import { useState, useEffect } from "react"
import { getLogs } from "../utils/logStorage"

function NationalOverview() {
  const [stateGroups, setStateGroups] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const buildNestedStats = async () => {
      try {
        const allLogs = await getLogs()
        const nestedMap = {}

        allLogs.forEach((log) => {
          const stateName = log.state || "Unknown State"
          const cityName = log.area || "Unknown District"

          if (!nestedMap[stateName]) {
            nestedMap[stateName] = {
              name: stateName,
              cities: {}
            }
          }

          if (!nestedMap[stateName].cities[cityName]) {
            nestedMap[stateName].cities[cityName] = {
              name: cityName,
              logs: [],
              users: new Set(),
              totalHours: 0
            }
          }

          const cityNode = nestedMap[stateName].cities[cityName]
          cityNode.logs.push(log)
          cityNode.users.add(log.user_id || "anonymous")
          cityNode.totalHours += parseFloat(log.total_hours) || 0
        })

        setStateGroups(nestedMap)
      } catch (error) {
        console.error("Failed to build power telemetry overview:", error)
      } finally {
        setLoading(false)
      }
    }

    buildNestedStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-500 font-mono text-xs uppercase tracking-widest">
        ⏳ Calibrating Grid Telemetry...
      </div>
    )
  }

  const stateKeys = Object.keys(stateGroups)

  return (
    <div className="w-full space-y-8 max-w-7xl mx-auto px-4">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wide">
          National Grid Telemetry
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Localized district nodes nested by state regional jurisdiction
        </p>
      </div>

      {stateKeys.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-center border border-dashed border-zinc-800 rounded-xl p-6 bg-zinc-950/30">
          <p className="text-sm text-zinc-500 font-mono">
            No live node reports transmitted yet.
          </p>
        </div>
      ) : (
        stateKeys.map((stateName) => {
          const stateData = stateGroups[stateName]
          const citiesArray = Object.values(stateData.cities)

          return (
            <div key={stateName} className="border-l-2 border-amber-500/30 pl-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  Region
                </span>
                <h3 className="text-base font-black text-zinc-200 tracking-wide uppercase">
                  {stateName}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {citiesArray.map((city) => {
                  const latestLog = city.logs[0]
                  
                  // ⚡ DETERMINING LIVE STATUS: If up_time exists but there is no off_time yet, power is ON.
                  const isPowerOn = latestLog && latestLog.up_time && !latestLog.off_time;

                  const lastUpdateString = latestLog?.created_at
                    ? new Date(latestLog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "--:--"

                  const avgHours = city.logs.length > 0
                    ? parseFloat((city.totalHours / city.logs.length).toFixed(1))
                    : 0

                  return (
                    <div
                      key={city.name}
                      className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700 transition-all duration-300 shadow-lg relative overflow-hidden group"
                    >
                      {/* ⚡ DYNAMIC LIVE BARS: Shifts top border dynamically based on current Derived Status */}
                      <div className={`absolute top-0 left-0 right-0 h-[2px] transition-colors duration-300 ${
                        isPowerOn ? "bg-emerald-500/50" : "bg-rose-500/50"
                      }`} />

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors">
                            {city.name}
                          </h4>
                          <p className="text-[10px] font-mono font-medium text-zinc-500 mt-0.5">
                            Last update: {lastUpdateString}
                          </p>
                        </div>
                        
                        {/* ⚡ ACTIVE STATUS BADGE */}
                        <span className={`text-[9px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border transition-colors ${
                          isPowerOn 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}>
                          ● {isPowerOn ? "Online" : "Outage"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60">
                        <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/40">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                            Avg Supply
                          </p>
                          <p className="text-base font-mono font-black text-zinc-200 mt-0.5">
                            {avgHours.toFixed(1)}{" "}
                            <span className="text-[10px] font-normal text-zinc-500 font-sans">
                              hrs
                            </span>
                          </p>
                        </div>
                        <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/40">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                            Active Nodes
                          </p>
                          <p className="text-base font-mono font-black text-zinc-300 mt-0.5">
                            {city.users.size}{" "}
                            <span className="text-[10px] font-normal text-zinc-500 font-sans">
                              {city.users.size === 1 ? "node" : "nodes"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default NationalOverview