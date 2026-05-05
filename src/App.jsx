import LocationCard from "./components/LocationCard";

const locations = [
  {
    id: 1,
    areaName: "Bodija, Ibadan",
    zone: "Zone B . Oyo State",
    status: "on",
    lastUpdated: "2023-10-01 10:00 AM",
  },
  {
    id: 2,
    areaName: "Ikorodu, Lagos",
    zone: "Zone A . Lagos State",
    status: "off",
    lastUpdated: "2023-10-01 9:30 AM",
  },  
  {
    id: 3,
    areaName: "Asaba, Delta",
    zone: "Zone C . Delta State",
    status: "on",
    lastUpdated: "2023-10-01 11:00 AM",
  },  
  {
    id: 4,
    areaName: "kano Municipal",
    zone: "Zone D . Kano State",
    status: "off",
    lastUpdated: "2023-10-01 8:45 AM",
  }
];

function App() {
  return (
    <div className="min-h-screen bg-[var(--background-color)] p-8">
      <header>
        <h1 className="m-0 text-2xl font-bold text-gray-900">
          powerMap
        </h1>
        <p className="mt-1 mb-8 text-sm text-gray-400">
          Real-time distribution updates
        </p>
      </header>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
        {locations.map((location) => (
          <LocationCard 
            key={location.id} 
            {...location} 
          />
        ))}
      </div>
    </div>
  );
}

export default App;