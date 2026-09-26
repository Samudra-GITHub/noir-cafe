import type { Drink } from "./types";

export const DRINKS = {
  noirCortado: {
    slug: "noir-cortado",
    name: "Noir Cortado",
    price: 6.5,
    origin: "Huila · Colombia",
    roast: "Medium",
    flavor: "Cacao, fig",
    brewTime: "03:30",
    image: "/images/home/drink-noir-cortado.jpg",
    imageAlt: "A cortado in a dark ceramic cup on a sunlit wooden bar",
  },
  caramelCloud: {
    slug: "caramel-cloud",
    name: "Caramel Cloud",
    price: 7,
    origin: "Sidama · Ethiopia",
    roast: "Light",
    flavor: "Honey, peach",
    brewTime: "04:00",
    image: "/images/home/drink-caramel-cloud.jpg",
    imageAlt: "A latte with rosetta art in a white cup and saucer on a worn wooden table",
  },
  midnightTonic: {
    slug: "midnight-tonic",
    name: "Midnight Tonic",
    price: 7.5,
    origin: "Cajamarca · Peru",
    roast: "Dark",
    flavor: "Citrus, cedar",
    brewTime: "02:45",
    image: "/images/home/drink-midnight-tonic.jpg",
    imageAlt: "An iced espresso tonic in a tall glass at a dimly lit bar",
  },
} satisfies Record<string, Drink>;

export const FEATURED_DRINKS: Drink[] = [DRINKS.noirCortado, DRINKS.caramelCloud, DRINKS.midnightTonic];

export type LovedSlide = { name: string; image: string; imageAlt: string };

/** "03 · Most loved" carousel — the signatures that define the bar. */
export const MOST_LOVED: LovedSlide[] = [
  {
    name: "Noir Cortado",
    image: "/images/home/loved-03.jpg",
    imageAlt: "Two iced coffees and a slice of cake on a wooden serving tray",
  },
  {
    name: "Caramel Cloud",
    image: "/images/home/loved-02.jpg",
    imageAlt: "A latte with rosetta art in a black cup on a black tray, seen from above",
  },
  {
    name: "Midnight Tonic",
    image: "/images/home/loved-01.jpg",
    imageAlt: "Iced coffees with orange and a cappuccino served on a dark tray",
  },
  {
    name: "Black Sesame",
    image: "/images/home/loved-04.jpg",
    imageAlt: "Coffee, tea and sweets arranged on a round black tray in low light",
  },
];
