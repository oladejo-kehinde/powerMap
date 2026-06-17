import { useEffect, useState } from "react"
import { getLogs, removeLog } from "../utils/logStorage"

function HistoryFeed({ refreshTrigger }) {
  const [todayLogs, setTodayLogs] = useState([])

  useEffect(() => {
    // Trace log added here 
    console.log(`[HistoryFeed] useEffect hook triggered! refreshTrigger changed. Fetching fresh logs...`)
    
    const fetchTodayLogs = () => {
      const allLogs = getLogs()
      const todayStr = new Date().toLocaleDateString('en-CA')

      const filtered = allLogs.filter((log) => {
        if (!log.createdAt) return false
        const logDateStr = new Date(log.createdAt).toLocaleDateString('en-CA')
        return logDateStr === todayStr
      })

      setTodayLogs(filtered)
    }

    fetchTodayLogs()
  }, [refreshTrigger]) 

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      const updated = removeLog(id)
      const todayStr = new Date().toLocaleDateString('en-CA')
      setTodayLogs(updated.filter(log => new Date(log.createdAt).toLocaleDateString('en-CA') === todayStr))
    }
  }

  return (
    <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 text-sm text-white max-w-lg w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-brand-accent uppercase tracking-wide">Today's History Feed</h3>
          <p className="text-xs text-brand-muted mt-0.5">Showing power events logged today</p>
        </div>
        <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-brand-accent border border-brand-border">
          {todayLogs.length} {todayLogs.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      {todayLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-brand-border rounded-2xl bg-zinc-900/40">
          <p className="text-sm text-brand-muted">No light state changes recorded today yet.</p>
        </div>
      ) : (
        <div className="relative border-l border-zinc-800 pl-4 ml-2 space-y-6">
          {todayLogs.map((log) => (
            <div key={log.id} className="relative group">
              <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-accent border-2 border-brand-surface group-hover:scale-125 transition-transform" />
              
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{log.area}</span>
                    <span className="text-xs text-brand-muted">• {log.state}</span>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-4 text-xs text-brand-muted bg-zinc-900/50 px-3 py-2 rounded-xl border border-brand-border/40">
                    <div>
                      <span className="text-green-400 font-medium mr-1">Up:</span> 
                      {log.upEvent.time}
                    </div>
                    <div className="border-l border-zinc-800 h-3" />
                    <div>
                      <span className="text-red-400 font-medium mr-1">Off:</span> 
                      {log.offEvent.time}
                    </div>
                    <div className="border-l border-zinc-800 h-3" />
                    <div className="font-semibold text-white bg-zinc-800 px-1.5 py-0.5 rounded">
                      {log.totalHours} hrs
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] text-brand-muted bg-zinc-800 px-2 py-0.5 rounded-md">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-xs text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-300 transition-all underline cursor-pointer"
                  >
                    Delete
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