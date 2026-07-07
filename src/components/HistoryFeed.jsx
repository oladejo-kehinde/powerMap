// import { useEffect, useState } from "react"
// import { getLogs, removeLog } from "../utils/logStorage"

// function HistoryFeed({ refreshTrigger }) {
//   const [todayLogs, setTodayLogs] = useState([])

//   useEffect(() => {
//     // Trace log added here 
//     console.log(`[HistoryFeed] useEffect hook triggered! refreshTrigger changed. Fetching fresh logs...`)
    
//     const fetchTodayLogs = () => {
//       const allLogs = getLogs()
//       const todayStr = new Date().toLocaleDateString('en-CA')

//       const filtered = allLogs.filter((log) => {
//         if (!log.createdAt) return false
//         const logDateStr = new Date(log.createdAt).toLocaleDateString('en-CA')
//         return logDateStr === todayStr
//       })

//       setTodayLogs(filtered)
//     }

//     fetchTodayLogs()
//   }, [refreshTrigger]) 

//   const handleDelete = (id) => {
//     if (window.confirm("Are you sure you want to delete this log?")) {
//       const updated = removeLog(id)
//       const todayStr = new Date().toLocaleDateString('en-CA')
//       setTodayLogs(updated.filter(log => new Date(log.createdAt).toLocaleDateString('en-CA') === todayStr))
//     }
//   }

//   return (
//     <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 text-sm text-white max-w-lg w-full">
//       <div className="mb-4 flex items-center justify-between">
//         <div>
//           <h3 className="text-base font-bold text-brand-accent uppercase tracking-wide">Today's History Feed</h3>
//           <p className="text-xs text-brand-muted mt-0.5">Showing power events logged today</p>
//         </div>
//         <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-brand-accent border border-brand-border">
//           {todayLogs.length} {todayLogs.length === 1 ? 'event' : 'events'}
//         </span>
//       </div>

//       {todayLogs.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-brand-border rounded-2xl bg-zinc-900/40">
//           <p className="text-sm text-brand-muted">No light state changes recorded today yet.</p>
//         </div>
//       ) : (
//         <div className="relative border-l border-zinc-800 pl-4 ml-2 space-y-6">
//           {todayLogs.map((log) => (
//             <div key={log.id} className="relative group">
//               <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-accent border-2 border-brand-surface group-hover:scale-125 transition-transform" />
              
//               <div className="flex items-start justify-between gap-4">
//                 <div>
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <span className="font-semibold text-white">{log.area}</span>
//                     <span className="text-xs text-brand-muted">• {log.state}</span>
//                   </div>
                  
//                   <div className="mt-2 flex items-center gap-4 text-xs text-brand-muted bg-zinc-900/50 px-3 py-2 rounded-xl border border-brand-border/40">
//                     <div>
//                       <span className="text-green-400 font-medium mr-1">Up:</span> 
//                       {log.upEvent.time}
//                     </div>
//                     <div className="border-l border-zinc-800 h-3" />
//                     <div>
//                       <span className="text-red-400 font-medium mr-1">Off:</span> 
//                       {log.offEvent.time}
//                     </div>
//                     <div className="border-l border-zinc-800 h-3" />
//                     <div className="font-semibold text-white bg-zinc-800 px-1.5 py-0.5 rounded">
//                       {log.totalHours} hrs
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex flex-col items-end gap-2 shrink-0">
//                   <span className="text-[10px] text-brand-muted bg-zinc-800 px-2 py-0.5 rounded-md">
//                     {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </span>
//                   <button
//                     onClick={() => handleDelete(log.id)}
//                     className="text-xs text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-300 transition-all underline cursor-pointer"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// export default HistoryFeed


import { useEffect, useState } from "react"
import { getLogs, removeLog } from "../utils/logStorage"

function HistoryFeed({ refreshTrigger }) {
  const [todayLogs, setTodayLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTodayLogs = async () => {
    setIsLoading(true)
    try {
      const allLogs = await getLogs() // Fixed: added await keyword execution context
      
      // Target localized string format matching standard regional calendar timestamps
      const todayStr = new Date().toISOString().split("T")[0]

      const filtered = (allLogs || []).filter((log) => {
        if (!log.created_at) return false
        const logDateStr = log.created_at.split("T")[0]
        return logDateStr === todayStr
      })

      setTodayLogs(filtered)
    } catch (err) {
      console.error("Error resolving historical feed component logs:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTodayLogs()
  }, [refreshTrigger])

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return
    
    try {
      await removeLog(id)
      // Re-trigger localized data load from root state management rather than mutable arrays
      fetchTodayLogs()
    } catch (error) {
      alert("Failed to safely delete entry registration database row.")
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-white w-full max-w-xl shadow-2xl backdrop-blur-md">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Today's History Feed</h3>
          <p className="text-xs text-zinc-500 mt-1">Showing power events logged today</p>
        </div>
        <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-400 border border-zinc-800">
          {todayLogs.length} {todayLogs.length === 1 ? "event" : "events"}
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-xs text-zinc-500 font-semibold tracking-wide">
          Syncing power registries...
        </div>
      ) : todayLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
          <p className="text-xs font-medium text-zinc-500">No power structural records captured today yet.</p>
        </div>
      ) : (
        <div className="relative border-l border-zinc-800 pl-5 ml-2 space-y-6">
          {todayLogs.map((log) => (
            <div key={log.id} className="relative group animate-fade-in">
              {/* Timeline Bullet Anchor Pin */}
              <div className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-zinc-900 shadow group-hover:scale-125 transition-transform" />

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-100">{log.area}</span>
                    <span className="text-xs font-semibold text-zinc-500">({log.state})</span>
                  </div>

                  {/* Operational Time Window Badges */}
                  <div className="flex items-center gap-3 text-xs text-zinc-400 bg-zinc-950/60 px-3 py-2 rounded-xl border border-zinc-800/80">
                    <div>
                      <span className="text-emerald-400 font-bold mr-1">ON:</span>
                      <span className="font-medium text-zinc-300">{log.up_time?.split("T")[1] || log.up_time}</span>
                    </div>
                    <div className="border-l border-zinc-800 h-3" />
                    <div>
                      <span className="text-amber-500 font-bold mr-1">OFF:</span>
                      <span className="font-medium text-zinc-300">{log.off_time?.split("T")[1] || log.off_time}</span>
                    </div>
                    <div className="border-l border-zinc-800 h-3" />
                    <div className="font-bold text-blue-400 text-[11px] uppercase tracking-wider">
                      {log.total_hours} hrs
                    </div>
                  </div>
                </div>

                {/* Control Metadata Column Action Handles */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] font-medium text-zinc-500 bg-zinc-950 border border-zinc-800/60 px-2 py-0.5 rounded-md">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(log.id)}
                    className="text-xs text-rose-400/80 font-medium transition-all hover:text-rose-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoryFeed