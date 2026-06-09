function TopBar() {
  return (
    <div className="h-16 bg-brand-sidebar border-b border-brand-border px-6 flex items-center justify-between">

      {/* Left — Location */}
      <div className="flex items-center gap-2">
        <span className="text-base">📍</span>
        <div>
          <p className="text-sm font-semibold text-brand-text">Detecting location...</p>
          <p className="text-xs text-brand-muted">Enable GPS for auto-detection</p>
        </div>
      </div>

      {/* Center — Live Clock */}
      <div className="text-center">
        <p className="text-sm font-semibold text-brand-text">--:-- --</p>
        <p className="text-xs text-brand-muted">Local Time</p>
      </div>

      {/* Right — Power Status */}
      <div className="flex items-center gap-2 bg-brand-hover border border-brand-border px-4 py-2 rounded-full">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-muted"></span>
        <p className="text-sm font-medium text-brand-muted">No status logged yet</p>
      </div>

    </div>
  )
}

export default TopBar