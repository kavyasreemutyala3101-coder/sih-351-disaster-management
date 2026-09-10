/**
 * Universal Geocoding & Sector Registry Utility
 * Converts Place Names into geographical coordinates and sector metadata.
 */

export const PRESET_SECTORS = [
  {
    id: 'bhadrachalam',
    name: 'Bhadrachalam',
    sector: 'Telangana: Bhadrachalam (Bhadradri) (Godavari River Basin)',
    river: 'Godavari River Basin',
    lat: 17.6688,
    lng: 80.8936,
    elevation: 38.0,
    drains: [
      { id: "BD01", name: "Bhadrachalam Ghat Main Sluice", offsetLat: 0.0022, offsetLng: -0.0016, color: "#ef4444", status: "OVERLOADED" },
      { id: "BD02", name: "Temple Road Collector Drain", offsetLat: -0.0015, offsetLng: 0.0035, color: "#f97316", status: "HIGH_STRESS" },
      { id: "BD03", name: "Godavari Bank Outfall (Blocked)", offsetLat: 0.0045, offsetLng: -0.0040, color: "#a855f7", status: "CRITICAL_BLOCKED" },
      { id: "BD04", name: "Kothagudem Road Channel", offsetLat: -0.0050, offsetLng: -0.0020, color: "#22c55e", status: "NORMAL" }
    ]
  },
  {
    id: 'vijayawada',
    name: 'Vijayawada',
    sector: 'Andhra Pradesh: Vijayawada (Krishna River Basin)',
    river: 'Krishna River Basin',
    lat: 16.5062,
    lng: 80.6480,
    elevation: 14.0,
    drains: [
      { id: "D101", name: "Benz Circle Main Trunk", offsetLat: 0.0003, offsetLng: -0.0005, color: "#f97316", status: "HIGH_STRESS" },
      { id: "D102", name: "NTR Circle Collector", offsetLat: 0.0016, offsetLng: 0.0012, color: "#ef4444", status: "OVERLOADED" },
      { id: "D103", name: "Governorpet Sluice", offsetLat: 0.0068, offsetLng: -0.0190, color: "#22c55e", status: "NORMAL" },
      { id: "D104", name: "One Town Outfall (Blocked)", offsetLat: 0.0113, offsetLng: -0.0365, color: "#a855f7", status: "CRITICAL_BLOCKED" }
    ]
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    sector: 'Telangana: Hyderabad (Musi River Basin)',
    river: 'Musi River Basin',
    lat: 17.3850,
    lng: 78.4867,
    elevation: 542.0,
    drains: [
      { id: "HYD01", name: "Musi River Nala Channel", offsetLat: -0.0020, offsetLng: 0.0030, color: "#ef4444", status: "OVERLOADED" },
      { id: "HYD02", name: "Hussain Sagar Overflow Outlet", offsetLat: 0.0250, offsetLng: -0.0080, color: "#a855f7", status: "CRITICAL_BLOCKED" }
    ]
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    sector: 'Andhra Pradesh: Visakhapatnam Coastal Zone',
    river: 'Bay of Bengal Coastal Catchment',
    lat: 17.6868,
    lng: 83.2185,
    elevation: 11.0,
    drains: [
      { id: "VSKP01", name: "RK Beach Outfall Trunk", offsetLat: -0.0050, offsetLng: 0.0080, color: "#f97316", status: "HIGH_STRESS" }
    ]
  },
  {
    id: 'warangal',
    name: 'Warangal',
    sector: 'Telangana: Warangal Urban Catchment',
    river: 'Kakatiya Canal Network',
    lat: 17.9784,
    lng: 79.5941,
    elevation: 270.0,
    drains: [
      { id: "WGL01", name: "Bhadrakali Tank Spillway", offsetLat: -0.0030, offsetLng: -0.0040, color: "#ef4444", status: "OVERLOADED" }
    ]
  },
  {
    id: 'khammam',
    name: 'Khammam',
    sector: 'Telangana: Khammam (Muneru River Basin)',
    river: 'Muneru River Basin',
    lat: 17.2473,
    lng: 80.1514,
    elevation: 107.0,
    drains: [
      { id: "KMM01", name: "Muneru Bridge Collector", offsetLat: 0.0010, offsetLng: 0.0020, color: "#f97316", status: "HIGH_STRESS" }
    ]
  }
];

/**
 * Geocodes any place name provided by the user.
 * Searches internal database first, then Nominatim API.
 */
export async function geocodePlaceName(query) {
  if (!query || typeof query !== 'string') {
    return PRESET_SECTORS[0]; // Fallback to Bhadrachalam
  }

  const cleanQuery = query.trim().toLowerCase();

  // 1. Exact or partial match in preset database
  const presetMatch = PRESET_SECTORS.find(s => 
    s.name.toLowerCase().includes(cleanQuery) || 
    s.sector.toLowerCase().includes(cleanQuery) ||
    cleanQuery.includes(s.name.toLowerCase()) ||
    cleanQuery.includes(s.id)
  );

  if (presetMatch) {
    return presetMatch;
  }

  // 2. Query OpenStreetMap Nominatim Geocoding API for global places
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const displayName = item.display_name.split(',')[0];
        return {
          id: cleanQuery.replace(/\s+/g, '_'),
          name: displayName || query,
          sector: `Sector: ${item.display_name}`,
          river: 'Local Hydrological Basin',
          lat: lat,
          lng: lng,
          elevation: 25.0,
          drains: [
            { id: "GEN01", name: `${displayName} Main Collector`, offsetLat: 0.0020, offsetLng: 0.0020, color: "#f97316", status: "HIGH_STRESS" },
            { id: "GEN02", name: `${displayName} River Outfall`, offsetLat: -0.0030, offsetLng: -0.0020, color: "#ef4444", status: "OVERLOADED" }
          ]
        };
      }
    }
  } catch (err) {
    console.warn("Live Nominatim geocoding failed, using fallback:", err);
  }

  // Fallback if search has no results
  return {
    id: cleanQuery.replace(/\s+/g, '_'),
    name: query,
    sector: `Sector: ${query} (Mapped)`,
    river: 'Regional Catchment',
    lat: 17.6688,
    lng: 80.8936,
    elevation: 35.0,
    drains: [
      { id: "FB01", name: `${query} Central Drain`, offsetLat: 0.0010, offsetLng: 0.0010, color: "#f97316", status: "HIGH_STRESS" }
    ]
  };
}
