// import { useState } from 'react'

function LocationCard({ areaName, zone, status, lastUpdated }) {

  //information calculated from props
  const isOn = status === 'on'
  const statusText = isOn ? 'Power On' : 'Power Off'
  const statusColor = isOn
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200'
  const dotColor = isOn ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">

      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 leading-tight">
            {areaName}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{zone}</p>
        </div>

        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          {statusText}
        </span>
      </div>

      {/* ✅ divider is now OUTSIDE and BELOW the flex row */}
      <div className="border-t border-gray-100 my-3" />

      <p className="text-xs text-gray-400">
        Updated: <span className="text-gray-600">{lastUpdated}</span>
      </p>

    </div>
  )
}

export default LocationCard