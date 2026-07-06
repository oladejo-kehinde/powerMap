import { useState, useEffect } from "react"
import Sidebar from "./components/SideBar"
import TopBar from "./components/TopBar"
import MainContent from "./components/MainContent"
import { getLocationName } from "./utils/geocoding"

function App() {
  const [activeView, setActiveView] = useState("home")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Shared Live Global Tracking States
  const [isPowerUp, setIsPowerUp] = useState(() => {
    // Check if there is an unfinished live tracking session in cache on boot
    return localStorage.getItem("current_power_session") !== null
  })
  const [location, setLocation] = useState("Detecting location...")
  const [gpsActive, setGpsActive] = useState(false)
  // Added the missing state hook for manualLocationMode
  const [manualLocationMode, setManualLocationMode] = useState(false)

  // Request GPS automatically on mount
  useEffect(() => {
    if (navigator.geolocation) {
      const locationOptions = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          try {
            // Use reverse geocoding to get readable location name
            const locationName = await getLocationName(lat, lng)
            setLocation(locationName)
            setGpsActive(true)
            setManualLocationMode(false)
          } catch (error) {
            console.error("Geocoding error:", error)
            setLocation("")
            setManualLocationMode(true)
            setGpsActive(false)
          }
        },
        (error) => {
          // GPS denied or failed. show manual input instead
          console.error("Geolocation error:", error)
          setLocation("")
          setManualLocationMode(true)
          setGpsActive(false)
        },
        locationOptions
      )
    } else {
      setLocation("")
      setManualLocationMode(true)
    }
  }, [])

  return (
    <div className="flex h-screen w-screen bg-brand-main text-white overflow-hidden font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Pass states into TopBar */}
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
            onLogAdded={() => setRefreshTrigger(prev => prev + 1)}
          />
        </main>
      </div>
    </div>
  )
}

export default App