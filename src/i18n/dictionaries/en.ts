/**
 * English — the source dictionary. Every other locale must provide the same
 * shape (enforced by the `Dictionary` type). `{name}` marks an interpolation
 * (see `fill` in i18n/format).
 */
export const en = {
  meta: {
    siteTitle: "Noir Café — Specialty coffee, New York",
    description:
      "Sourced with patience, roasted with restraint, and poured as a small act of attention. Specialty coffee in SoHo, Brooklyn and the West Village.",
    pages: {
      menu: {
        title: "Menu",
        description: "Espresso, latte, cappuccino, matcha, tea and bakery — the Noir Café autumn menu, made slowly and served simply.",
      },
      story: {
        title: "Our Story",
        description: "Noir began in 2018 as a tiny roastery behind a bookshop on Mercer Street — a café born from a long conversation.",
      },
      brewingLab: {
        title: "Brewing Lab",
        description:
          "Five transformations, one expressive cup — follow a single lot from origin to pour, with live recipes, timers and brew guides.",
      },
      studio: {
        title: "Recipe Studio",
        description:
          "Experiment with our house brew recipes — dose, ratio, grind, water and roast — and watch extraction, flavour and the cup change in real time.",
      },
      cup: {
        title: "From seed to cup, in 3D",
        description: "Five transformations, one expressive cup — follow Noir Café's coffee from seed to latte in an interactive 3D journey.",
      },
      locations: {
        title: "Locations",
        description: "Three Noir cafés in New York — Mercer Street in SoHo, Wythe Avenue in Brooklyn and West 10th in the West Village.",
      },
      reservation: {
        title: "Reserve a table",
        description: "Reserve a table at Noir Café Mercer Street for coffee, breakfast, or an unhurried afternoon.",
      },
      shop: {
        title: "Shop",
        description: "Coffee, ceramics, and considered objects made for daily use. Small-batch, durable, and quietly beautiful.",
      },
      concierge: {
        title: "Ask the barista",
        description: "Drink and bean recommendations, brewing advice, pairings and gift ideas from Noir Café's barista-concierge.",
      },
      order: {
        title: "Order ahead",
        description: "Order your coffee ahead at any Noir Café — choose milk, sweetness and ice, pick a time, and collect it at the counter.",
      },
      offline: { title: "Offline", description: "" },
      orderConfirmed: { title: "Order confirmed", description: "" },
    },
  },

  a11y: {
    skip: "Skip to content",
    primaryNav: "Primary",
    mobileNav: "Mobile",
    moreNav: "More",
    siteMenu: "Site menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    social: "Social",
    menuNotes: "Menu notes",
  },

  /** Destination labels, keyed by path. */
  nav: {
    "/": "Home",
    "/menu": "Menu",
    "/story": "Story",
    "/brewing-lab": "Lab",
    "/locations": "Locations",
    "/shop": "Shop",
    "/reservation": "Reserve",
    "/order": "Order ahead",
    "/concierge": "Ask the barista",
    "/brewing-lab/studio": "Recipe studio",
    "/cup": "From seed to cup · 3D",
  },
  /** The phone dock's shorter labels. */
  dock: {
    "/": "Home",
    "/menu": "Menu",
    "/locations": "Visit",
    "/reservation": "Reserve",
    "/shop": "Shop",
  },

  site: {
    hours: "Mon–Sun · 07:00–20:00",
  },

  footer: {
    Instagram: "Instagram",
    Journal: "Journal",
    Careers: "Careers",
    Privacy: "Privacy",
  },

  newsletter: {
    eyebrow: "Notes from the bar",
    title: "New lots, quiet stories, and invitations.",
    label: "Your email address",
    submit: "Subscribe",
    sending: "Sending",
    fine: "Monthly at most · Unsubscribe anytime",
    invalid: "Enter a valid email address",
    success: "You’re on the list — the next note is yours",
  },

  sound: {
    play: "Play ambient café sound",
    mute: "Mute ambient café sound",
  },

  atmosphere: {
    light: "Light",
    inNewYork: "{daypart} in New York",
    auto: "Auto",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    rain: "Rain mode",
    rainingNow: "Raining in New York now",
    followsWeather: "Follows New York’s weather",
    setByYou: "Set by you",
    followWeather: "Follow the weather",
    sound: "Café sound",
    soundDescription: "Room tone, felt piano, the bar at work",
    haptics: "Haptics",
    hapticsDescription: "A light tap on presses and swipes",
    notifications: "Notifications",
    notificationsDescription: "New lots and news from the bar",
  },

  locale: {
    language: "Language",
    currency: "Currency",
    chargedIn: "Prices are charged in US dollars. Other currencies are approximate, at the ECB reference rate of {date}.",
  },

  pwa: {
    offline: "Offline · showing saved pages",
    installLabel: "Install Noir Café",
    installTitle: "Noir Café on your home screen",
    iosHint: "Tap Share, then “Add to Home Screen”.",
    promptHint: "Opens like an app — the menu and our cafés work offline.",
    install: "Install",
    notNow: "Not now",
  },

  intro: {
    menu: {
      eyebrow: "Menu · Autumn 2026",
      title: "Made slowly. Served simply.",
      lead: "Our menu follows the harvest. Ask your barista about today’s single-origin espresso and filter selections.",
    },
    brewingLab: {
      eyebrow: "Brewing lab · Method 01",
      title: "Five transformations. One expressive cup.",
      lead: "Follow a single lot from its place of origin to the final pour—measured, tasted, and refined at every stage.",
    },
    locations: {
      eyebrow: "New York · Three rooms",
      title: "A quiet corner, wherever you are.",
      lead: "Each Noir café is shaped by its neighborhood, with the same coffee, materials, and generous sense of pause.",
    },
    reservation: {
      eyebrow: "Reservations · Mercer Street",
      title: "Your table, held quietly.",
      lead: "Reserve for coffee, breakfast, or an unhurried afternoon. Walk-ins are always welcome.",
    },
    shop: {
      eyebrow: "Objects for ritual · Edition 03",
      title: "Good tools invite better mornings.",
      lead: "Coffee, ceramics, and considered objects made for daily use. Small-batch, durable, and quietly beautiful.",
    },
  },


  menu: {
    extras: "Oat +{oat} · Extra shot +{shot} · Decaf available",
    allergy: "Please tell us about allergies. We prepare everything in a shared kitchen.",
  },

  offline: {
    eyebrow: "Offline",
    title: "No connection — the café is still here.",
    lead: "The menu and our cafés are saved on this device. Everything else will return with your connection.",
    daily: "Daily {hours}",
  },
};

type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
export type CoreDictionary = Widen<typeof en>;
