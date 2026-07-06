import LogForm from "./LogForm"
import PowerChart from "./PowerChart"
import HistoryFeed from "./HistoryFeed"
import NationalOverview from "./NationalOverview"

function MainContent({ activeView, refreshTrigger, onLogAdded, isPowerUp, setIsPowerUp, location }) {
  if (activeView !== "home") {
    return <NationalOverview />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      <div className="lg:col-span-5">
        <LogForm 
          onLogAdded={onLogAdded} 
          isPowerUp={isPowerUp} 
          setIsPowerUp={setIsPowerUp}
          location={location}
        />
      </div>
      <div className="lg:col-span-7">
        <PowerChart refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}

export default MainContent