import { useEffect, useState } from "react"
import { getLogs } from "../utils/logStorage"

function NationalOverview() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchNationalData() {
      setLoading(true)
      try {
        const data = await getLogs()
        setLogs(data)
      } catch (err) {
        console.error("Failed to load national data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchNationalData()
  }, [])

  // Process raw logs into aggregated state statistics with time tracking
  const stateSummary = logs.reduce((acc, log) => {
    const stateName = log.state
    if (!acc[stateName]) {
      acc[stateName] = { count: 0, totalHours: 0, lastUpdated: log.created_at }
    }
    acc[stateName].count += 1
    acc[stateName].totalHours += log.total_hours || 0
    
    // Track the latest update string
    if (new Date(log.created_at) > new Date(acc[stateName].lastUpdated)) {
      acc[stateName].lastUpdated = log.created_at
    }
    return acc
  }, {})

  // Helper to format timestamps to a friendly "human" relative format
  const formatRelativeTime = (isoString) => {
    if (!isoString) return ""
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return "Today"
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
        <span className="ml-3 text-sm text-brand-muted font-medium">Gathering updates across Nigeria...</span>
      </div>
    )
  }

  const activeStates = Object.entries(stateSummary).filter(([stateName]) => 
    stateName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Dynamic Search & Overview Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search your state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-brand-border bg-zinc-800 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-brand-accent"
          />
        </div>
        <div className="text-xs text-brand-muted sm:text-right">
          Showing updates from the past <span className="text-brand-accent font-bold">24 hours</span>
        </div>
      </div>

      {activeStates.length === 0 ? (
        <div className="rounded-2xl border border-brand-border bg-brand-sidebar p-8 text-center text-brand-muted">
          {searchTerm ? "No matching states found with recent updates." : "No reports shared across the country in the last 24 hours. Be the first to update your location!"}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeStates.map(([stateName, stats]) => {
            const avgHours = (stats.totalHours / stats.count).toFixed(1)
            
            // Determine grid status color badges using human terms
            let statusLabel = "Fluctuating"
            let statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20"
            
            if (avgHours >= 14) {
              statusLabel = "Stable Power"
              statusColor = "bg-green-500/10 text-green-400 border-green-500/20"
            } else if (avgHours < 5) {
              statusLabel = "Heavy Outages"
              statusColor = "bg-red-500/10 text-red-400 border-red-500/20"
            }

            return (
              <div 
                key={stateName} 
                className="rounded-2xl border border-brand-border bg-brand-sidebar p-5 transition hover:border-zinc-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{stateName}</h3>
                      <p className="text-[11px] text-brand-muted mt-0.5">
                        Active {formatRelativeTime(stats.lastUpdated)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border shrink-0 ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-brand-border/40 pt-3">
                    <div>
                      <p className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">Recent Updates</p>
                      <p className="text-lg font-extrabold text-white mt-0.5">
                        {stats.count} {stats.count === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">Avg. Light Received</p>
                      <p className="text-lg font-extrabold text-brand-accent mt-0.5">{avgHours} hrs</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NationalOverview