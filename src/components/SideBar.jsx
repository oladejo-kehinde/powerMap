const NAV_ITEMS = [
  { id: "home", label: "My Dashboard" },
  { id: "map",  label: "Active Reports" },
];

const NavButton = ({ label, view, activeView, setActiveView }) => {
  const isActive = activeView === view;

  return (
    <button
      type="button"
      onClick={() => setActiveView(view)}
      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition border ${
        isActive
          ? 'bg-brand-hover text-white border-brand-border'
          : 'bg-transparent text-brand-muted border-transparent hover:bg-brand-hover hover:border-brand-border'
      }`}
    >
      {label}
    </button>
  );
};

function SideBar({ activeView, setActiveView }) {
  return (
    <aside className="w-72 bg-brand-sidebar border-r border-brand-border h-screen hidden md:flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-6 border-b border-brand-border">
        <div className="text-brand-accent font-extrabold text-xl tracking-wide">
          POWERMAP
        </div>
        <p className="text-xs text-brand-muted mt-1">
          Community-sourced power status
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              label={item.label}
              view={item.id}
              activeView={activeView}
              setActiveView={setActiveView}
            />
          ))}
        </div>
      </nav>

    </aside>
  );
}

export default SideBar;