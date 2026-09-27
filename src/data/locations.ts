/** Locations — content from design/locations.png. Hours are local New York time. */

export type Cafe = {
  id: string;
  index: string;
  label: string; // panel eyebrow
  name: string[]; // panel title lines
  cardName: string;
  shortAddress: string;
  address: string[];
  opens: string; // "07:00"
  closes: string; // "20:00"
  mapQuery: string;
  image: string;
  imageAlt: string;
  /** Pin position on the illustrated map, in % of the map panel. */
  pin: { x: number; y: number };
};

export const CAFES: Cafe[] = [
  {
    id: "mercer",
    index: "01",
    label: "Flagship",
    name: ["Mercer", "Street"],
    cardName: "Mercer Street",
    shortAddress: "14 Mercer St · SoHo",
    address: ["14 Mercer Street, SoHo", "New York, NY 10013"],
    opens: "07:00",
    closes: "20:00",
    mapQuery: "14 Mercer Street, New York, NY 10013",
    image: "/images/locations/mercer-street.jpg",
    imageAlt: "A bright café bar with a stone counter, pastry case and shelves of coffee",
    pin: { x: 28.0, y: 65.9 },
  },
  {
    id: "wythe",
    index: "02",
    label: "Brooklyn",
    name: ["Wythe", "Avenue"],
    cardName: "Wythe Avenue",
    shortAddress: "83 Wythe Ave · Brooklyn",
    address: ["83 Wythe Avenue, Williamsburg", "Brooklyn, NY 11249"],
    opens: "07:30",
    closes: "19:00",
    mapQuery: "83 Wythe Avenue, Brooklyn, NY 11249",
    image: "/images/locations/wythe-avenue.jpg",
    imageAlt: "Brick walls, leather armchairs and round tables beside tall windows",
    pin: { x: 52.7, y: 40.9 },
  },
  {
    id: "west-10th",
    index: "03",
    label: "West Village",
    name: ["West", "10th"],
    cardName: "West 10th",
    shortAddress: "207 W 10th St · West Village",
    address: ["207 West 10th Street", "New York, NY 10014"],
    opens: "08:00",
    closes: "19:00",
    mapQuery: "207 West 10th Street, New York, NY 10014",
    image: "/images/locations/west-10th.jpg",
    imageAlt: "Lit shopfronts on a quiet West Village street at night",
    pin: { x: 74.6, y: 74.8 },
  },
];

export const directionsUrl = (cafe: Cafe) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.mapQuery)}`;

/**
 * Where each café sits (approximate street-address coordinates, for distance
 * and the phone map) and its nearest subway stop.
 */
export type Transit = { station: string; lines: string[] };
export const CAFE_GEO: Record<string, { lat: number; lon: number; transit: Transit }> = {
  mercer: { lat: 40.7208, lon: -74.0023, transit: { station: "Canal St", lines: ["A", "C", "E", "N", "Q", "R", "W", "6", "J", "Z"] } },
  wythe: { lat: 40.7219, lon: -73.9581, transit: { station: "Bedford Av", lines: ["L"] } },
  "west-10th": { lat: 40.7339, lon: -74.0047, transit: { station: "Christopher St–Stonewall", lines: ["1"] } },
};

/** MTA line colours (trunk lines). */
export const LINE_COLORS: Record<string, string> = {
  A: "#0039A6", C: "#0039A6", E: "#0039A6",
  N: "#FCCC0A", Q: "#FCCC0A", R: "#FCCC0A", W: "#FCCC0A",
  "1": "#EE352E",
  "6": "#00933C",
  J: "#996633", Z: "#996633",
  L: "#A7A9AC",
};
/** Yellow-line bullets use dark type. */
export const LINE_DARK_TEXT = new Set(["N", "Q", "R", "W"]);

/** Walking directions in the visitor's own maps app. */
export const walkingUrl = (cafe: Cafe) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cafe.mapQuery)}&travelmode=walking`;
