// import { useState, useEffect } from "react"
// import { getLogs } from "../utils/logStorage"

// function NationalOverview() {
//   const [stateStats, setStateStats] = useState([])

//   useEffect(() => {
//     const buildStateStats = async () => {
//       const allLogs = await getLogs()

//       // Group logs by state
//       const stateMap = {}

//       allLogs.forEach((log) => {
//         const state = log.state || "Unknown"

//         if (!stateMap[state]) {
//           stateMap[state] = {
//             state: state,
//             logs: [],
//             users: new Set(),
//             totalHours: 0,
//             lastUpdate: new Date(log.createdAt).toLocaleString(),
//           }
//         }

//         stateMap[state].logs.push(log)
//         stateMap[state].users.add(log.user_id || "anonymous")
//         stateMap[state].totalHours += parseFloat(log.totalHours) || 0
//         stateMap[state].lastUpdate = new Date(log.createdAt).toLocaleString()
//       })

//       // Transform into display format
//       const stats = Object.values(stateMap).map((state) => ({
//         state: state.state,
//         avgHours:
//           state.logs.length > 0
//             ? parseFloat((state.totalHours / state.logs.length).toFixed(1))
//             : 0,
//         peopleLogged: state.users.size,
//         lastUpdate: state.lastUpdate,
//         status: state.logs.length > 0 ? "Active" : "Offline",
//       }))

//       setStateStats(stats)
//     }

//     buildStateStats()
//   }, [])

//   return (
//     <div className="w-full">
//       <div className="mb-6">
//         <h2 className="text-xl font-bold text-white uppercase tracking-wide">
//           National Power Overview
//         </h2>
//         <p className="text-xs text-zinc-500 mt-1">
//           Real-time power status across all states
//         </p>
//       </div>

//       {stateStats.length === 0 ? (
//         <div className="flex items-center justify-center py-12 text-center border border-dashed border-zinc-800/80 rounded-xl p-6 bg-zinc-950/30">
//           <p className="text-sm text-zinc-500">
//             No state data available yet. Check back after logging power events.
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {stateStats.map((stateData) => (
//             <div
//               key={stateData.state}
//               className="bg-[#121215] border border-[#1e1e24] rounded-xl p-5 hover:border-amber-500/40 transition-all duration-300 shadow-lg group relative overflow-hidden"
//             >
//               {/* Subtle amber highlight line on top of active states */}
//               {stateData.status === "Active" && (
//                 <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/50 via-amber-500 to-transparent" />
//               )}

//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h3 className="text-base font-bold text-white tracking-wide">
//                     {stateData.state}
//                   </h3>
//                   <p className="text-[11px] font-mono font-medium text-zinc-500 mt-0.5 uppercase tracking-wider">
//                     {stateData.lastUpdate}
//                   </p>
//                 </div>

//                 <span
//                   className={`text-[10px] font-mono font-extrabold uppercase tracking-widest px-2.5 py-1 rounded border ${
//                     stateData.status === "Active"
//                       ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
//                       : "bg-zinc-900 border-zinc-800 text-zinc-500"
//                   }`}
//                 >
//                   ● {stateData.status === "Active" ? "Reporting Live" : "Offline"}
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#1e1e24]/60">
//                 <div className="bg-[#0c0c0e]/60 p-3 rounded-lg border border-[#1e1e24]/40">
//                   <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
//                     Metric Output
//                   </p>
//                   <p className="text-lg font-mono font-black text-white mt-0.5 group-hover:text-amber-400 transition-colors">
//                     {stateData.avgHours.toFixed(1)}{" "}
//                     <span className="text-xs font-normal text-zinc-400 font-sans">
//                       hrs
//                     </span>
//                   </p>
//                 </div>
//                 <div className="bg-[#0c0c0e]/60 p-3 rounded-lg border border-[#1e1e24]/40">
//                   <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
//                     Active Nodes
//                   </p>
//                   <p className="text-lg font-mono font-black text-zinc-300 mt-0.5">
//                     {stateData.peopleLogged}{" "}
//                     <span className="text-xs font-normal text-zinc-500 font-sans">
//                       {stateData.peopleLogged === 1 ? "user" : "users"}
//                     </span>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// export default NationalOverview

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
          // 1. Safely extract State and City boundaries
          const stateName = log.state || "Unknown State"
          const cityName = log.city || log.location || "Unknown District"

          // 2. Initialize the State bucket if it doesn't exist yet
          if (!nestedMap[stateName]) {
            nestedMap[stateName] = {
              name: stateName,
              cities: {}
            }
          }

          // 3. Initialize the City bucket inside that specific State
          if (!nestedMap[stateName].cities[cityName]) {
            nestedMap[stateName].cities[cityName] = {
              name: cityName,
              logs: [],
              users: new Set(),
              totalHours: 0
            }
          }

          // 4. Aggregate data inside the City node
          const cityNode = nestedMap[stateName].cities[cityName]
          cityNode.logs.push(log)
          cityNode.users.add(log.user_id || "anonymous")
          cityNode.totalHours += parseFloat(log.totalHours) || 0
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
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wide">
          National Grid Telemetry
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Localized district nodes nested by state regional jurisdiction
        </p>
      </div>

      {stateKeys.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-center border border-dashed border-zinc-800/80 rounded-xl p-6 bg-zinc-950/30">
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
              {/* High-Level Regional State Banner */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  Region
                </span>
                <h3 className="text-base font-black text-zinc-200 tracking-wide uppercase">
                  {stateName}
                </h3>
              </div>

              {/* Grid of Hyper-Local City Nodes under this State */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {citiesArray.map((city) => {
                  // Grab the single latest log to check current live grid status
                  const latestLog = city.logs[city.logs.length - 1]
                  const isPowerOn = latestLog?.status === "ON"
                  const lastUpdateString = latestLog 
                    ? new Date(latestLog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "--:--"

                  // Calculate historical performance metrics
                  const avgHours = city.logs.length > 0
                    ? parseFloat((city.totalHours / city.logs.length).toFixed(1))
                    : 0

                  return (
                    <div
                      key={city.name}
                      className="bg-[#121215] border border-[#1e1e24] rounded-xl p-5 hover:border-zinc-700/60 transition-all duration-300 shadow-lg relative overflow-hidden group"
                    >
                      {/* Live status top border layout strips */}
                      <div className={`absolute top-0 left-0 right-0 h-[2px] transition-colors duration-300 ${
                        isPowerOn ? "bg-emerald-500/40" : "bg-rose-500/40"
                      }`} />

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors">
                            {city.name}
                          </h4>
                          <p className="text-[10px] font-mono font-medium text-zinc-500 mt-0.5">
                            Last report: {lastUpdateString}
                          </p>
                        </div>

                        {/* Real-time Grid Status Pulse */}
                        <span className={`text-[9px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border transition-all duration-300 ${
                          isPowerOn
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}>
                          ● {isPowerOn ? "Online" : "Outage"}
                        </span>
                      </div>

                      {/* Local Analytics Sub-panel */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1e1e24]/60">
                        <div className="bg-[#0c0c0e]/60 p-2.5 rounded-lg border border-[#1e1e24]/40">
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
                        <div className="bg-[#0c0c0e]/60 p-2.5 rounded-lg border border-[#1e1e24]/40">
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