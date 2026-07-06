export async function getLocationName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    )
 
    if (!response.ok) {
      throw new Error("Geocoding API request failed")
    }
 
    const data = await response.json()
 
    if (data && data.address) {
      const address = data.address
      
      // Extract city, state, and country from the address object
      const city = address.city || address.town || address.village || address.county
      const state = address.state
      const country = address.country
 
      // Return formatted: "City, State" or just "City"
      if (city && state) {
        return `${city}, ${state}`
      } else if (city) {
        return city
      } else if (data.name) {
        return data.name
      } else {
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      }
    } else {
      console.warn("[Geocoding] No results found for coordinates")
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    }
  } catch (error) {
    console.error("[Geocoding Error]:", error.message)
    // Fallback to coordinates if API fails
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  }
}
 