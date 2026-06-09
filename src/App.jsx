import { useState } from "react";
import MainContent from "./components/MainContent";
import Sidebar from "./components/Sidebar";

function App() {
  const [activeView, setActiveView] = useState('home')

  return (
    <div className="min-h-screen md:flex">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div className="flex-1">

        {/* Mobile top bar */}
        <div className="md:hidden bg-brand-sidebar border-b border-brand-border text-white flex items-center justify-between px-4 py-3">
          
          {/* Logo */}
          <div className="text-brand-accent font-extrabold tracking-wide">POWERMAP</div>

          {/* Nav Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition border ${
                activeView === 'home'
                  ? 'bg-brand-hover text-white border-brand-border'
                  : 'bg-transparent text-brand-muted border-transparent hover:bg-brand-hover hover:border-brand-border'
              }`}
            >
              My Dashboard
            </button>
            <button
              onClick={() => setActiveView('map')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition border ${
                activeView === 'map'
                  ? 'bg-brand-hover text-white border-brand-border'
                  : 'bg-transparent text-brand-muted border-transparent hover:bg-brand-hover hover:border-brand-border'
              }`}
            >
              National Map
            </button>
          </div>

        </div>

        <MainContent activeView={activeView} />
      </div>

    </div>
  );
}

export default App;