import { useEffect, useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { getPersonalLogs } from "../utils/logStorage"

function PowerChart({ refreshTrigger }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const buildChartData = async () => {
      try {
        const personalLogs = await getPersonalLogs()
        if (!Array.isArray(personalLogs)) return

        const today = new Date()
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 6)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const dataMap = {}

        const formatDateKey = (date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, "0")
          const day = String(date.getDate()).padStart(2, "0")
          return `${year}-${month}-${day}`
        }

        for (let i = 0; i < 7; i += 1) {
          const date = new Date(startDate)
          date.setDate(startDate.getDate() + i)
          const dateStr = formatDateKey(date)
          const dayName = dayNames[date.getDay()]
          dataMap[dateStr] = { name: dayName, date: dateStr, "Supply %": 0 }
        }

        personalLogs.forEach((log) => {
          const createdAt = log.created_at || log.createdAt
          if (!createdAt) return

          const logDate = new Date(createdAt)
          const logDateStr = formatDateKey(logDate)

          if (dataMap[logDateStr]) {
            const totalHours = parseFloat(log.total_hours ?? log.totalHours ?? 0) || 0
            dataMap[logDateStr]["Supply %"] += totalHours
          }
        })

        const finalData = Object.values(dataMap).map((item) => ({
          name: item.name,
          "Supply %": Number(((item["Supply %"] / 24) * 100).toFixed(1)),
        }))

        setChartData(finalData)
      } catch (error) {
        console.error("Error formatting personal chart history:", error)
      }
    }

    buildChartData()
  }, [refreshTrigger])

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-md">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Personal Day Supply Trend</h3>
        <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
          7-Day Metrics
        </span>
      </div>

      <div className="relative mt-2 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
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
              domain={[0, 100]}
              unit="%"
              dx={-5}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Day Supply"]}
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
              dataKey="Supply %"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorSupply)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PowerChart