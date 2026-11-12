// The flat chart that stands in for the globe (components/ReachPlate.jsx) is drawn on one Mercator plane, the
// same one the Indian state shapes were made on, so they are used exactly as they are. Shared with the script
// that bakes the map (scripts/build-reach-map.mjs).
const RAD = Math.PI / 180
export const LON0 = 68
export const K = 1942.2298140027908
export const YTOP = 0.7025571609587349

const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2))
export const project = (lon, lat) => [(lon - LON0) * RAD * K, (YTOP - merc(lat)) * K]
export const unproject = (x, y) => [x / K / RAD + LON0, (2 * Math.atan(Math.exp(YTOP - y / K)) - Math.PI / 2) / RAD]
// how many kilometres of ground one unit of the plane covers, at a latitude
export const kmPerUnit = (lat) => (6371 / K) * Math.cos(lat * RAD)
