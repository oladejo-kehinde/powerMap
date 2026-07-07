// import LogForm from "./LogForm"
// import PowerChart from "./PowerChart"
// import HistoryFeed from "./HistoryFeed"
// import NationalOverview from "./NationalOverview"

// function MainContent({ activeView, refreshTrigger, onLogAdded, isPowerUp, setIsPowerUp, location }) {
//   if (activeView !== "home") {
//     return <NationalOverview />
//   }

//   return (
//     <div className="grid gap-6 lg:grid-cols-12 items-start">
//       <div className="lg:col-span-5">
//         <LogForm 
//           onLogAdded={onLogAdded} 
//           isPowerUp={isPowerUp} 
//           setIsPowerUp={setIsPowerUp}
//           location={location}
//         />
//       </div>
//       <div className="lg:col-span-7">
//         <PowerChart refreshTrigger={refreshTrigger} />
//       </div>
//     </div>
//   )
// }

// export default MainContent

import LogForm from "./LogForm"
import PowerChart from "./PowerChart"
import NationalOverview from "./NationalOverview"

function MainContent({ activeView, refreshTrigger, onLogAdded, isPowerUp, setIsPowerUp, location }) {
  // Graceful view conditional checking
  if (activeView !== "home") {
    return <NationalOverview />
  }

  return (
    <main className="grid items-start gap-6 lg:grid-cols-12 w-full max-w-7xl mx-auto px-4 md:px-6">
      {/* Dynamic Data Registry Entry Module */}
      <section className="lg:col-span-5 w-full">
        <LogForm 
          onLogAdded={onLogAdded} 
          isPowerUp={isPowerUp} 
          setIsPowerUp={setIsPowerUp}
          location={location}
        />
      </section>

      {/* Analytics Visualization Engine */}
      <section className="lg:col-span-7 w-full bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-1">
        <PowerChart refreshTrigger={refreshTrigger} />
      </section>
    </main>
  )
}

export default MainContent