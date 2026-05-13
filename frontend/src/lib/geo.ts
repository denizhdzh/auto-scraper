const CITY_COORDS: Record<string, [number, number]> = {
  // Netherlands
  amsterdam: [52.3676, 4.9041], rotterdam: [51.9244, 4.4777],
  'den haag': [52.0705, 4.3007], 'the hague': [52.0705, 4.3007],
  utrecht: [52.0907, 5.1214], eindhoven: [51.4416, 5.4697],
  groningen: [53.2194, 6.5665], tilburg: [51.5555, 5.0913],
  almere: [52.3508, 5.2647], breda: [51.5719, 4.7683],
  nijmegen: [51.8426, 5.8546], enschede: [52.2215, 6.8937],
  haarlem: [52.3874, 4.6462], arnhem: [51.9851, 5.8987],
  amersfoort: [52.1561, 5.3878], apeldoorn: [52.2112, 5.9699],
  zwolle: [52.5168, 6.0830], maastricht: [50.8514, 5.6910],
  leiden: [52.1601, 4.4970], dordrecht: [51.8133, 4.6901],
  delft: [52.0116, 4.3571], deventer: [52.2550, 6.1583],
  alkmaar: [52.6324, 4.7534], venlo: [51.3704, 6.1724],
  // Germany
  berlin: [52.5200, 13.4050], hamburg: [53.5753, 10.0153],
  munich: [48.1351, 11.5820], münchen: [48.1351, 11.5820],
  cologne: [50.9333, 6.9500], köln: [50.9333, 6.9500],
  frankfurt: [50.1109, 8.6821], düsseldorf: [51.2217, 6.7762],
  dusseldorf: [51.2217, 6.7762], stuttgart: [48.7758, 9.1829],
  dortmund: [51.5136, 7.4653], essen: [51.4556, 7.0116],
  bremen: [53.0793, 8.8017], hannover: [52.3759, 9.7320],
  nürnberg: [49.4521, 11.0767], nuremberg: [49.4521, 11.0767],
  bonn: [50.7374, 7.0982], münster: [51.9607, 7.6261],
  aachen: [50.7753, 6.0839], karlsruhe: [49.0069, 8.4037],
  // Belgium
  brussels: [50.8503, 4.3517], bruxelles: [50.8503, 4.3517],
  brussel: [50.8503, 4.3517], antwerp: [51.2213, 4.4051],
  antwerpen: [51.2213, 4.4051], ghent: [51.0543, 3.7174],
  gent: [51.0543, 3.7174], liege: [50.6326, 5.5797],
  bruges: [51.2093, 3.2240], brugge: [51.2093, 3.2240],
  // France
  paris: [48.8566, 2.3522], lyon: [45.7640, 4.8357],
  strasbourg: [48.5734, 7.7521], lille: [50.6292, 3.0573],
  // Austria
  vienna: [48.2082, 16.3738], wien: [48.2082, 16.3738],
  graz: [47.0707, 15.4395], linz: [48.3064, 14.2861],
  salzburg: [47.8095, 13.0550],
  // Switzerland
  zurich: [47.3769, 8.5417], zürich: [47.3769, 8.5417],
  geneva: [46.2044, 6.1432], basel: [47.5596, 7.5886],
  bern: [46.9480, 7.4474],
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function distanceKm(
  location: string | null | undefined,
  userLat: number,
  userLng: number,
): number | null {
  if (!location) return null
  const city = location.split(',')[0].trim().toLowerCase()
  const coords = CITY_COORDS[city]
  if (!coords) return null
  return Math.round(haversine(userLat, userLng, coords[0], coords[1]))
}
