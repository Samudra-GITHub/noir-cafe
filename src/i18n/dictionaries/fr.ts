import type { CoreDictionary } from "./en";

export const fr: CoreDictionary = {
  meta: {
    siteTitle: "Noir Café — Café de spécialité, New York",
    description:
      "Sourcé avec patience, torréfié avec retenue, servi comme un petit geste d’attention. Café de spécialité à SoHo, à Brooklyn et dans le West Village.",
    pages: {
      menu: {
        title: "Carte",
        description: "Espresso, latte, cappuccino, matcha, thé et boulangerie — la carte d’automne de Noir Café, préparée lentement et servie simplement.",
      },
      story: {
        title: "Notre histoire",
        description: "Noir est né en 2018, petite brûlerie cachée derrière une librairie de Mercer Street — un café né d’une longue conversation.",
      },
      brewingLab: {
        title: "Laboratoire d’extraction",
        description:
          "Cinq transformations, une tasse expressive — suivez un seul lot de l’origine à la tasse, avec recettes, minuteurs et guides d’extraction.",
      },
      studio: {
        title: "Studio de recettes",
        description:
          "Expérimentez avec nos recettes maison — dose, ratio, mouture, eau et torréfaction — et voyez l’extraction, les arômes et la tasse évoluer en temps réel.",
      },
      cup: {
        title: "De la graine à la tasse, en 3D",
        description: "Cinq transformations, une tasse expressive — suivez le café de Noir Café de la graine au latte, dans un voyage interactif en 3D.",
      },
      locations: {
        title: "Adresses",
        description: "Trois cafés Noir à New York — Mercer Street à SoHo, Wythe Avenue à Brooklyn et West 10th dans le West Village.",
      },
      reservation: {
        title: "Réserver une table",
        description: "Réservez une table chez Noir Café Mercer Street pour un café, un petit-déjeuner ou un après-midi sans hâte.",
      },
      shop: {
        title: "Boutique",
        description: "Café, céramiques et objets choisis avec soin pour le quotidien. En petites séries, durables et discrètement beaux.",
      },
      concierge: {
        title: "Demandez au barista",
        description: "Suggestions de boissons et de grains, conseils d’extraction, accords et idées cadeaux par le barista-concierge de Noir Café.",
      },
      order: {
        title: "Commander à l’avance",
        description:
          "Commandez votre café à l’avance dans n’importe quel Noir Café — choisissez le lait, le sucre et la glace, l’heure de retrait, puis récupérez-le au comptoir.",
      },
      offline: { title: "Hors ligne", description: "" },
      orderConfirmed: { title: "Commande confirmée", description: "" },
    },
  },

  a11y: {
    skip: "Aller au contenu",
    primaryNav: "Principale",
    mobileNav: "Mobile",
    moreNav: "Plus",
    siteMenu: "Menu du site",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    social: "Réseaux sociaux",
    menuNotes: "Notes sur la carte",
  },

  nav: {
    "/": "Accueil",
    "/menu": "Carte",
    "/story": "Histoire",
    "/brewing-lab": "Labo",
    "/locations": "Adresses",
    "/shop": "Boutique",
    "/reservation": "Réserver",
    "/order": "Commander à l’avance",
    "/concierge": "Demandez au barista",
    "/brewing-lab/studio": "Studio de recettes",
    "/cup": "De la graine à la tasse · 3D",
  },
  dock: {
    "/": "Accueil",
    "/menu": "Carte",
    "/locations": "Venir",
    "/reservation": "Réserver",
    "/shop": "Boutique",
  },

  site: {
    hours: "Lun–Dim · 07:00–20:00",
  },

  footer: {
    Instagram: "Instagram",
    Journal: "Journal",
    Careers: "Carrières",
    Privacy: "Confidentialité",
  },

  newsletter: {
    eyebrow: "Nouvelles du comptoir",
    title: "Nouveaux lots, histoires discrètes et invitations.",
    label: "Votre adresse e-mail",
    submit: "S’abonner",
    sending: "Envoi",
    fine: "Une fois par mois au plus · Désabonnement à tout moment",
    invalid: "Saisissez une adresse e-mail valide",
    success: "C’est noté — la prochaine lettre est pour vous",
  },

  sound: {
    play: "Lancer l’ambiance sonore du café",
    mute: "Couper l’ambiance sonore du café",
  },

  atmosphere: {
    light: "Lumière",
    inNewYork: "{daypart} à New York",
    auto: "Auto",
    morning: "Matin",
    afternoon: "Après-midi",
    evening: "Soir",
    rain: "Mode pluie",
    rainingNow: "Il pleut à New York en ce moment",
    followsWeather: "Suit la météo de New York",
    setByYou: "Réglé par vous",
    followWeather: "Suivre la météo",
    sound: "Son du café",
    soundDescription: "Ambiance de la salle, piano feutré, le comptoir au travail",
    haptics: "Retour haptique",
    hapticsDescription: "Une légère vibration aux appuis et aux balayages",
    notifications: "Notifications",
    notificationsDescription: "Nouveaux lots et nouvelles du comptoir",
  },

  locale: {
    language: "Langue",
    currency: "Devise",
    chargedIn: "Les prix sont facturés en dollars américains. Les autres devises sont indicatives, au taux de référence de la BCE du {date}.",
  },

  pwa: {
    offline: "Hors ligne · pages enregistrées",
    installLabel: "Installer Noir Café",
    installTitle: "Noir Café sur votre écran d’accueil",
    iosHint: "Touchez Partager, puis « Sur l’écran d’accueil ».",
    promptHint: "S’ouvre comme une app — la carte et nos cafés fonctionnent hors ligne.",
    install: "Installer",
    notNow: "Plus tard",
  },

  intro: {
    menu: {
      eyebrow: "Carte · Automne 2026",
      title: "Préparé lentement. Servi simplement.",
      lead: "Notre carte suit la récolte. Demandez à votre barista l’espresso et les filtres d’origine unique du jour.",
    },
    brewingLab: {
      eyebrow: "Laboratoire · Méthode 01",
      title: "Cinq transformations. Une tasse expressive.",
      lead: "Suivez un seul lot de son origine jusqu’à la dernière verse — mesuré, goûté et affiné à chaque étape.",
    },
    locations: {
      eyebrow: "New York · Trois lieux",
      title: "Un coin tranquille, où que vous soyez.",
      lead: "Chaque café Noir est façonné par son quartier, avec le même café, les mêmes matières et un sens généreux de la pause.",
    },
    reservation: {
      eyebrow: "Réservations · Mercer Street",
      title: "Votre table, gardée en toute discrétion.",
      lead: "Réservez pour un café, un petit-déjeuner ou un après-midi sans hâte. Sans réservation, vous êtes toujours les bienvenus.",
    },
    shop: {
      eyebrow: "Objets du rituel · Édition 03",
      title: "De bons outils appellent de meilleurs matins.",
      lead: "Café, céramiques et objets choisis avec soin pour le quotidien. En petites séries, durables et discrètement beaux.",
    },
  },


  menu: {
    extras: "Lait d’avoine +{oat} · Shot supplémentaire +{shot} · Décaféiné disponible",
    allergy: "Signalez-nous vos allergies. Tout est préparé dans une cuisine commune.",
  },

  offline: {
    eyebrow: "Hors ligne",
    title: "Pas de connexion — le café est toujours là.",
    lead: "La carte et nos cafés sont enregistrés sur cet appareil. Le reste reviendra avec votre connexion.",
    daily: "Tous les jours {hours}",
  },
};
