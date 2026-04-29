import LocationCard from './components/LocationCard'

const locations = [
  { id: 1, areaName: 'Bodija, Ibadan',  zone: 'Zone B · Oyo State',  status: 'on',  lastUpdated: '2 mins ago' },
  { id: 2, areaName: 'Ikorodu, Lagos',  zone: 'Zone A · Lagos State', status: 'off', lastUpdated: '15 mins ago' },
  { id: 3, areaName: 'Asaba, Delta',    zone: 'Zone C · Delta State', status: 'on',  lastUpdated: '5 mins ago' },
  { id: 4, areaName: 'Kano Municipal',  zone: 'Zone D · Kano State',  status: 'off', lastUpdated: '1 hr ago' },
]

function App() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        mapPower Dashboard
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Real-time distribution updates across Nigeria
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            areaName={location.areaName}
            zone={location.zone}
            status={location.status}
            lastUpdated={location.lastUpdated}
          />
        ))}
      </div>
    </main>
  )
}

export default App