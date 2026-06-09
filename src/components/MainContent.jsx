import LogForm from "./logForm"
import TopBar from "./TopBar"

function MainContent({ activeView }) {
  return (
    <div className="flex-1 flex flex-col h-screen">

      {/* Top Bar */}
      <TopBar />

      {/* Scrollable Content*/}
      <div className="flex-1 bg-brand-main p-8 overflow-y-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-brand-text tracking-tight">
            {activeView === "home" ? "Update Power Status" : "National Map"}
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
            <LogForm />
          ) : (
            <div className="bg-brand-surface rounded-2xl p-6 border border-brand-border">
              <p className="text-brand-muted">National map coming soon.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default MainContent