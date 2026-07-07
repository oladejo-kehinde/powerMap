// import { useState, useEffect } from "react"
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
// } from "recharts"
// import { getLogs } from "../utils/logStorage"

// function PowerChart({ refreshTrigger }) {
//   const [chartData, setChartData] = useState([])

//   useEffect(() => {
//     const buildChartData = async() => {
//       const allLogs = await getLogs()
      
//       const today = new Date()
//       const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
//       const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
//       const dataMap = {}
      
//       for (let i = 0; i < 7; i++) {
//         const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
//         const dateStr = date.toISOString().split('T')[0]
//         const dayName = dayNames[date.getDay()]
//         dataMap[dateStr] = { name: dayName, date: dateStr, "Hours of Light": 0 }
//       }
      
//       // Aggregate logs by date
//       allLogs.forEach((log) => {
//         // 🔍 FIXED: Changed log.createdAt to log.created_at
//         if (!log.created_at) return
//         // Convert UTC to local date string for proper timezone handling
//         const logDate = new Date(log.created_at)
//         const logDateStr = logDate.getFullYear() + '-' + 
//                            String(logDate.getMonth() + 1).padStart(2, '0') + '-' + 
//                            String(logDate.getDate()).padStart(2, '0')
        
//         if (dataMap[logDateStr]) {
//           // 🔍 FIXED: Changed log.totalHours to log.total_hours
//           dataMap[logDateStr]["Hours of Light"] += parseFloat(log.total_hours) || 0
//         }
//       })
      
//       const finalData = Object.values(dataMap).map((item) => ({
//         name: item.name,
//         "Hours of Light": parseFloat(item["Hours of Light"].toFixed(1)),
//       }))
      
//       setChartData(finalData)
//     }

//     buildChartData()
//   }, [refreshTrigger])

//   return (
//     <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-6 w-full block shadow-2xl">
//       <div className="flex items-center justify-between mb-5">
//         <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Power Trend</h3>
//         <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
//           7-Day Metrics
//         </span>
//       </div>
      
//       {chartData.length === 0 || chartData.every(d => d["Hours of Light"] === 0) ? (
//         <div className="h-64 flex items-center justify-center text-center text-zinc-500 text-xs font-medium border border-dashed border-zinc-800/80 rounded-xl p-6 bg-zinc-950/30">
//           No power activity has been recorded yet.<br/>Turn the power on or off, or add a manual entry to start tracking your power history.
//         </div>
//       ) : (
//         <div className="h-64 w-full relative mt-2">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
//               <defs>
//                 <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
//                   <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="4 4" stroke="#1f1f23" vertical={false} />
//               <XAxis 
//                 dataKey="name" 
//                 stroke="#52525b" 
//                 fontSize={11} 
//                 fontWeight={600}
//                 tickLine={false} 
//                 axisLine={false} 
//                 dy={10}
//               />
//               <YAxis 
//                 stroke="#52525b" 
//                 fontSize={11} 
//                 fontWeight={600}
//                 tickLine={false} 
//                 axisLine={false} 
//                 allowDecimals={false} 
//                 unit="h" 
//                 dx={-5}
//               />
//               <Tooltip 
//                 contentStyle={{ 
//                   backgroundColor: "#09090b", 
//                   borderColor: "#27272a", 
//                   borderRadius: "12px", 
//                   color: "#fff",
//                   fontSize: "12px",
//                   fontWeight: "bold",
//                   boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
//                 }} 
//                 cursor={{ stroke: '#3f3f46', strokeWidth: 1.5, strokeDasharray: "3 3" }} 
//               />
//               <Area 
//                 type="monotone" 
//                 dataKey="Hours of Light" 
//                 stroke="#3b82f6" 
//                 strokeWidth={2.5} 
//                 fillOpacity={1} 
//                 fill="url(#colorHours)" 
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       )}
//     </div>
//   )
// }

// export default PowerChart



import { useState, useEffect } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { getLogs } from "../utils/logStorage"

function PowerChart({ refreshTrigger }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const buildChartData = async () => {
      try {
        const allLogs = await getLogs()
        if (!Array.isArray(allLogs)) return

        const today = new Date()
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const dataMap = {}

        // Pre-fill the last 7 calendar days
        for (let i = 0; i < 7; i++) {
          const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
          const dateStr = date.toISOString().split("T")[0]
          const dayName = dayNames[date.getDay()]
          dataMap[dateStr] = { name: dayName, date: dateStr, "Hours of Light": 0 }
        }

        // Aggregate matching entry values safely
        allLogs.forEach((log) => {
          if (!log.created_at) return
          const logDateStr = log.created_at.split("T")[0]

          if (dataMap[logDateStr]) {
            dataMap[logDateStr]["Hours of Light"] += parseFloat(log.total_hours) || 0
          }
        })

        const finalData = Object.values(dataMap).map((item) => ({
          name: item.name,
          "Hours of Light": parseFloat(item["Hours of Light"].toFixed(1)),
        }))

        setChartData(finalData)
      } catch (error) {
        console.error("Error formatting chart history metadata stream:", error)
      }
    }

    buildChartData()
  }, [refreshTrigger])

  const hasNoData = chartData.length === 0 || chartData.every((d) => d["Hours of Light"] === 0)

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 w-full shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Power Trend</h3>
        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
          7-Day Metrics
        </span>
      </div>

      {hasNoData ? (
        <div className="h-64 flex items-center justify-center text-center text-zinc-500 text-xs font-medium border border-dashed border-zinc-800 rounded-xl p-6 bg-zinc-950/40 leading-relaxed">
          No power activity has been recorded yet.<br /> Use live reporter or submit a manual entry to seed data.
        </div>
      ) : (
        <div className="h-64 w-full relative mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#1f1f23" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#52525b"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#52525b"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                unit="h"
                dx={-5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  borderColor: "#27272a",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                cursor={{ stroke: "#3f3f46", strokeWidth: 1.5, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="Hours of Light"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorHours)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default PowerChart