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
