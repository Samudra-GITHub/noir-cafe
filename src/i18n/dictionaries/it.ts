import type { CoreDictionary } from "./en";

export const it: CoreDictionary = {
  meta: {
    siteTitle: "Noir Café — Caffè specialty, New York",
    description:
      "Selezionato con pazienza, tostato con misura e servito come un piccolo gesto di attenzione. Caffè specialty a SoHo, a Brooklyn e nel West Village.",
    pages: {
      menu: {
        title: "Menù",
        description: "Espresso, latte, cappuccino, matcha, tè e forno — il menù d’autunno di Noir Café, preparato con calma e servito con semplicità.",
      },
      story: {
        title: "La nostra storia",
        description: "Noir è nato nel 2018 come piccola torrefazione dietro una libreria di Mercer Street — un caffè nato da una lunga conversazione.",
      },
      brewingLab: {
        title: "Laboratorio di estrazione",
        description:
          "Cinque trasformazioni, una tazza espressiva — segui un solo lotto dall’origine alla tazza, con ricette, timer e guide all’estrazione.",
      },
      studio: {
        title: "Studio delle ricette",
        description:
          "Sperimenta con le nostre ricette della casa — dose, rapporto, macinatura, acqua e tostatura — e guarda estrazione, aromi e tazza cambiare in tempo reale.",
      },
      cup: {
        title: "Dal seme alla tazza, in 3D",
        description: "Cinque trasformazioni, una tazza espressiva — segui il caffè di Noir Café dal seme al latte in un viaggio interattivo in 3D.",
      },
      locations: {
        title: "Sedi",
        description: "Tre caffè Noir a New York — Mercer Street a SoHo, Wythe Avenue a Brooklyn e West 10th nel West Village.",
      },
      reservation: {
        title: "Prenota un tavolo",
        description: "Prenota un tavolo da Noir Café Mercer Street per un caffè, la colazione o un pomeriggio senza fretta.",
      },
      shop: {
        title: "Negozio",
        description: "Caffè, ceramiche e oggetti scelti con cura per l’uso quotidiano. In piccole serie, durevoli e silenziosamente belli.",
      },
      concierge: {
        title: "Chiedi al barista",
        description: "Consigli su bevande e chicchi, suggerimenti per l’estrazione, abbinamenti e idee regalo dal barista-concierge di Noir Café.",
      },
      order: {
        title: "Ordina in anticipo",
        description:
          "Ordina il tuo caffè in anticipo in qualsiasi Noir Café — scegli latte, dolcezza e ghiaccio, l’orario di ritiro, e ritiralo al banco.",
      },
      offline: { title: "Offline", description: "" },
      orderConfirmed: { title: "Ordine confermato", description: "" },
    },
  },

  a11y: {
    skip: "Vai al contenuto",
    primaryNav: "Principale",
    mobileNav: "Mobile",
    moreNav: "Altro",
    siteMenu: "Menù del sito",
    openMenu: "Apri il menù",
    closeMenu: "Chiudi il menù",
    social: "Social",
    menuNotes: "Note sul menù",
  },

  nav: {
    "/": "Home",
    "/menu": "Menù",
    "/story": "Storia",
    "/brewing-lab": "Lab",
    "/locations": "Sedi",
    "/shop": "Negozio",
    "/reservation": "Prenota",
    "/order": "Ordina in anticipo",
    "/concierge": "Chiedi al barista",
    "/brewing-lab/studio": "Studio delle ricette",
    "/cup": "Dal seme alla tazza · 3D",
  },
  dock: {
    "/": "Home",
    "/menu": "Menù",
    "/locations": "Visita",
    "/reservation": "Prenota",
    "/shop": "Negozio",
  },

  site: {
    hours: "Lun–Dom · 07:00–20:00",
  },

  footer: {
    Instagram: "Instagram",
    Journal: "Journal",
    Careers: "Lavora con noi",
    Privacy: "Privacy",
  },

  newsletter: {
    eyebrow: "Note dal bancone",
    title: "Nuovi lotti, storie discrete e inviti.",
    label: "Il tuo indirizzo email",
    submit: "Iscriviti",
    sending: "Invio",
    fine: "Al massimo una volta al mese · Disiscriviti quando vuoi",
    invalid: "Inserisci un indirizzo email valido",
    success: "Sei in lista — la prossima nota è per te",
  },

  sound: {
    play: "Riproduci il suono del caffè",
    mute: "Disattiva il suono del caffè",
  },

  atmosphere: {
    light: "Luce",
    inNewYork: "{daypart} a New York",
    auto: "Auto",
    morning: "Mattina",
    afternoon: "Pomeriggio",
    evening: "Sera",
    rain: "Modalità pioggia",
    rainingNow: "Ora piove a New York",
    followsWeather: "Segue il meteo di New York",
    setByYou: "Impostata da te",
    followWeather: "Segui il meteo",
    sound: "Suono del caffè",
    soundDescription: "Il brusio della sala, pianoforte ovattato, il bancone al lavoro",
    haptics: "Feedback aptico",
    hapticsDescription: "Una leggera vibrazione a tocchi e scorrimenti",
    notifications: "Notifiche",
    notificationsDescription: "Nuovi lotti e notizie dal bancone",
  },

  locale: {
    language: "Lingua",
    currency: "Valuta",
    chargedIn: "I prezzi sono addebitati in dollari statunitensi. Le altre valute sono indicative, al tasso di riferimento BCE del {date}.",
  },

  pwa: {
    offline: "Offline · pagine salvate",
    installLabel: "Installa Noir Café",
    installTitle: "Noir Café nella schermata Home",
    iosHint: "Tocca Condividi, poi «Aggiungi alla schermata Home».",
    promptHint: "Si apre come un’app — il menù e i nostri caffè funzionano anche offline.",
    install: "Installa",
    notNow: "Non ora",
  },

  intro: {
    menu: {
      eyebrow: "Menù · Autunno 2026",
      title: "Preparato con calma. Servito con semplicità.",
      lead: "Il nostro menù segue il raccolto. Chiedi al barista l’espresso e i filtri monorigine di oggi.",
    },
    brewingLab: {
      eyebrow: "Laboratorio · Metodo 01",
      title: "Cinque trasformazioni. Una tazza espressiva.",
      lead: "Segui un solo lotto dal luogo d’origine all’ultima versata — misurato, assaggiato e rifinito a ogni passaggio.",
    },
    locations: {
      eyebrow: "New York · Tre sale",
      title: "Un angolo tranquillo, ovunque tu sia.",
      lead: "Ogni caffè Noir prende forma dal suo quartiere, con lo stesso caffè, gli stessi materiali e un generoso senso della pausa.",
    },
    reservation: {
      eyebrow: "Prenotazioni · Mercer Street",
      title: "Il tuo tavolo, tenuto con discrezione.",
      lead: "Prenota per un caffè, la colazione o un pomeriggio senza fretta. Chi arriva senza prenotazione è sempre il benvenuto.",
    },
    shop: {
      eyebrow: "Oggetti per il rito · Edizione 03",
      title: "I buoni strumenti invitano a mattine migliori.",
      lead: "Caffè, ceramiche e oggetti scelti con cura per l’uso quotidiano. In piccole serie, durevoli e silenziosamente belli.",
    },
  },


  menu: {
    extras: "Latte d’avena +{oat} · Shot extra +{shot} · Anche decaffeinato",
    allergy: "Segnalaci eventuali allergie. Prepariamo tutto in una cucina condivisa.",
  },

  offline: {
    eyebrow: "Offline",
    title: "Nessuna connessione — il caffè è ancora qui.",
    lead: "Il menù e i nostri caffè sono salvati su questo dispositivo. Il resto tornerà con la connessione.",
    daily: "Tutti i giorni {hours}",
  },
};
