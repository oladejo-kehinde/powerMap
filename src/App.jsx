import { useState, useEffect } from "react"
import Sidebar from "./components/SideBar"
import TopBar from "./components/TopBar"
import MainContent from "./components/MainContent"
import { getLocationName } from "./utils/geocoding"

function App() {
  const [activeView, setActiveView] = useState("home")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPowerUp, setIsPowerUp] = useState(() => {
    return localStorage.getItem("current_power_session") !== null
  })
  const [location, setLocation] = useState("")
  const [gpsActive, setGpsActive] = useState(false)
  const [manualLocationMode, setManualLocationMode] = useState(false)
  const [locationReady, setLocationReady] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [manualState, setManualState] = useState("")

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation("")
      setGpsActive(false)
      setManualLocationMode(true)
      setLocationReady(true)
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        try {
          const locationName = await getLocationName(lat, lng)
          setLocation(locationName)
          setGpsActive(true)
          setManualLocationMode(false)
          setLocationReady(true)
        } catch (error) {
          console.error("Geocoding error:", error)
          setLocation("")
          setManualLocationMode(true)
          setGpsActive(false)
          setLocationReady(true)
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        setLocation("")
        setManualLocationMode(true)
        setGpsActive(false)
        setLocationReady(true)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      }
    )
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      requestLocation()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const handleManualStateSubmit = (event) => {
    event.preventDefault()
    const nextLocation = manualState.trim()

    if (!nextLocation) {
      return
    }

    setLocation(nextLocation)
    setGpsActive(false)
    setManualLocationMode(true)
    setLocationReady(true)
  }

  if (!locationReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-10 text-white">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur">
          <div className="mb-5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
              Welcome
            </p>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Enable Location Permissions
            </h1>
            <p className="text-sm leading-6 text-zinc-400">
              We need your location to unlock your personal dashboard and keep your household trend private.
            </p>
          </div>

          <button
            type="button"
            onClick={requestLocation}
            disabled={isLocating}
            className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70"
          >
            {isLocating ? "Requesting access..." : "Enable Location Permissions"}
          </button>

          <form onSubmit={handleManualStateSubmit} className="mt-5 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Or choose your state manually
            </label>
            <input
              type="text"
              value={manualState}
              onChange={(event) => setManualState(event.target.value)}
              placeholder="Enter your state"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
            <button
              type="submit"
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-700"
            >
              Continue with selected state
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen bg-brand-main text-white overflow-hidden font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          isPowerUp={isPowerUp}
          location={location}
          gpsActive={gpsActive}
          setLocation={setLocation}
          setGpsActive={setGpsActive}
          manualLocationMode={manualLocationMode}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-[#09090b]">
          <MainContent
            activeView={activeView}
            refreshTrigger={refreshTrigger}
            isPowerUp={isPowerUp}
            setIsPowerUp={setIsPowerUp}
            location={location}
            onLogAdded={() => setRefreshTrigger((prev) => prev + 1)}
          />
        </main>
      </div>
    </div>
  )
}

export default App