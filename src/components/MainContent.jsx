import LogForm from "./LogForm"
import TopBar from "./TopBar"
import NationalOverview from "./NationalOverview" // 1. Import the new view

// Add onLogAdded to the destructured props
function MainContent({ activeView, onLogAdded }) {
  return (
    <div className="flex-1 flex flex-col h-screen">

      {/* Top Bar */}
      <TopBar />

      {/* Scrollable Content*/}
      <div className="flex-1 bg-brand-main p-8 overflow-y-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-brand-text tracking-tight">
            {activeView === "home" ? "Update Power Status" : "National Overview"}
          </h2>
          <p className="text-brand-muted text-sm mt-1">
            {activeView === "home"
              ? "Record when light came or went in your area"
              : "See power status across Nigeria"}
          </p>
        </div>

        {/* View Content */}
        <div>
          {activeView === "home" ? (
            // 2. Pass down onLogAdded to LogForm
            <LogForm onLogAdded={onLogAdded} />
          ) : (
            // 3. Swap out the placeholder for the real database-connected panel
            <NationalOverview />
          )}
        </div>

      </div>
    </div>
  )
}

export default MainContent