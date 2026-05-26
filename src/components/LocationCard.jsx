function LocationCard({ areaName, zone, status, lastUpdated }) {
  const isOn = status === "on";

  return (
    <article className="article w-full rounded-[1rem] border border-gray-100 bg-card p-[1.2rem] shadow-sm hover:shadow-md">
      <header className="flex items-start justify-between mb-3">
        <div>
          <p className="m-0 text-base font-semibold leading-5 text-gray-900">
            {areaName}
          </p>
          <p className="mt-0.5 m-0 text-xs text-gray-400">
            {zone}
          </p>
        </div>

        {/* Dynamic Status Badge */}
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
            isOn 
              ? "bg-status-green-bg text-status-green-text border-status-green-border" 
              : "bg-status-red-bg text-status-red-text border-status-red-border"
          }`}
        >
          {/* Status Dot */}
          <span className={`h-1.5 w-1.5 rounded-full ${isOn ? 'bg-status-green-dot' : 'bg-status-red-dot'}`} />
          {isOn ? "Power On" : "Power Off"}
        </span>
      </header>

      {/* Horizontal Divider */}
      <hr className="my-3 border-0 border-t border-gray-100" />
      
      <p className="m-0 text-xs text-gray-400">
        Updated: <span className="text-gray-600">{lastUpdated}</span>
      </p>
    </article>
  );
}

export default LocationCard;