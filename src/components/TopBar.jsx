import { useState, useEffect, useRef } from "react"

// 1. Put the helper function cleanly outside the component scope
function getDistanceKM(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
function TopBar({ isPowerUp, location, setLocation, setGpsActive, manualLocationMode, mobileMenuOpen, setMobileMenuOpen, activeView, setActiveView }) {
  // Local state for the live clock
  const [localTime, setLocalTime] = useState("--:-- --")
  
  // Track the last coordinates we actually ran an API fetch for
  const lastFetchedCoords = useRef({ lat: null, lng: null })

  // --- Clock Loop ---
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setLocalTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  // --- Location Tracker Loop ---
  useEffect(() => {
    // If the user is in manual mode, do not start or run the GPS watcher!
    if (manualLocationMode) {
      return 
    }

    if (!navigator.geolocation) {
      setLocation("GPS unavailable")
      setGpsActive(false)
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        if (manualLocationMode) return

        const { latitude, longitude } = position.coords
        const lastLat = lastFetchedCoords.current.lat
        const lastLng = lastFetchedCoords.current.lng

        if (lastLat !== null && lastLng !== null) {
          const distanceMoved = getDistanceKM(lastLat, lastLng, latitude, longitude)
          
          // THROTTLE: If they moved less than 0.5 km, skip API call
          if (distanceMoved < 0.5) {
            console.log(`User only moved ${distanceMoved.toFixed(3)} km. Skipping fetch.`)
            return 
          }
        }
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await response.json()
          
          // 🔍 Dig deeper into OpenStreetMap's address fields
          const locationName = data.address.city || 
                               data.address.town || 
                               data.address.village || 
                               data.address.suburb ||
                               data.address.neighbourhood ||
                               data.address.county || 
                               data.address.state_district ||
                               data.name || 
                               null; // Fallback to null if absolutely nothing matches
          
          if (locationName) {
            setLocation(locationName)
          } else {
            // If the database has no name for this patch of earth, show raw coordinates
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }
          
          setGpsActive(true)
          lastFetchedCoords.current = { lat: latitude, lng: longitude }
          
          console.log("Full address payload:", data.address) 
        } catch {
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
        }
      },
      (error) => { 
        console.error("Geolocation tracking error:", error)
        setGpsActive(false) 
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [manualLocationMode, setLocation, setGpsActive]) 

  // 3. The return block belongs INSIDE the function!
  return (
    <div className="h-16 bg-[#121215] border-b border-[#1e1e24] px-6 flex items-center justify-between shadow-md z-10 relative">
      
      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-zinc-800/60 rounded-lg transition"
          title="Menu"
        >
          <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 bg-[#1a1a1f] border border-[#1e1e24] rounded-lg shadow-lg z-50 w-48">
            <button
              onClick={() => {
                setActiveView("home")
                setMobileMenuOpen(false)
              }}
              className={`w-full text-left px-4 py-3 text-sm font-semibold transition border-b border-[#1e1e24] ${
                activeView === "home"
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              My Dashboard
            </button>
            <button
              onClick={() => {
                setActiveView("map")
                setMobileMenuOpen(false)
              }}
              className={`w-full text-left px-4 py-3 text-sm font-semibold transition ${
                activeView === "map"
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              Active Reports
            </button>
          </div>
        )}
      </div>
      
      {/* Left Area: Location */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="bg-[#1a1a1f] p-2 rounded-lg border border-[#1e1e24]">
          <span className="text-xs font-mono text-[#f59e0b] font-bold uppercase tracking-wider">Location: </span>
          <span className="text-xs font-bold text-zinc-200 truncate">{location}</span>
        </div>
      </div>

      {/* Center Area: Live Clock */}
      <div className="text-center mx-4">
        <p className="text-sm font-mono font-extrabold text-zinc-100 tracking-wider bg-[#0c0c0e] px-4 py-1 rounded-md border border-[#1e1e24] shadow-inner shadow-black/40">
          {localTime}
        </p>
      </div>

      {/* Right Area — Status Badge */}
      <div className={`flex items-center gap-2.5 border px-4 py-1.5 rounded-md font-mono shadow-sm transition-all duration-300 ${
        isPowerUp 
          ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/5" 
          : "bg-zinc-800/40 border-zinc-700/50 text-zinc-500"
      }`}>
        <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
          isPowerUp ? "bg-[#f59e0b] shadow-[0_0_10px_#f59e0b]" : "bg-zinc-600"
        }`}></span>
        <p className="text-[11px] font-bold uppercase tracking-widest">
          {isPowerUp ? "Power On" : "Power Off"}
        </p>
      </div>

    </div>
  )
} 

export default TopBar