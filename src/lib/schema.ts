import { SITE, SOCIAL_LINKS } from "@/constants/site";
import { CAFES } from "@/data/locations";
import { MENU } from "@/data/menu";
import { HOME_RITUAL_SET, PRODUCTS } from "@/data/shop";
import { DEFAULT_DESCRIPTION, SITE_URL } from "@/lib/seo";

const ADDRESS: Record<string, { streetAddress: string; addressLocality: string; postalCode: string }> = {
  mercer: { streetAddress: "14 Mercer Street", addressLocality: "New York", postalCode: "10013" },
  wythe: { streetAddress: "83 Wythe Avenue", addressLocality: "Brooklyn", postalCode: "11249" },
  "west-10th": { streetAddress: "207 West 10th Street", addressLocality: "New York", postalCode: "10014" },
};

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE.name,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
  email: SITE.email,
  telephone: SITE.phone,
  description: DEFAULT_DESCRIPTION,
  sameAs: SOCIAL_LINKS.map((l) => l.href),
});

/** The site itself, in the page's language, published by the organization above. */
export const websiteSchema = (inLanguage: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${url}#website`,
  name: SITE.name,
  url,
  inLanguage,
  publisher: { "@id": `${SITE_URL}/#organization` },
});

export const cafesSchema = () =>
  CAFES.map((cafe) => ({
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${SITE_URL}/locations#${cafe.id}`,
    name: `${SITE.name} — ${cafe.cardName}`,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    image: `${SITE_URL}${cafe.image}`,
    url: `${SITE_URL}/locations`,
    telephone: SITE.phone,
    servesCuisine: "Coffee",
    priceRange: "$$",
    menu: `${SITE_URL}/menu`,
    acceptsReservations: cafe.id === "mercer" ? `${SITE_URL}/reservation` : "False",
    address: { "@type": "PostalAddress", addressRegion: "NY", addressCountry: "US", ...ADDRESS[cafe.id] },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: cafe.opens,
      closes: cafe.closes,
    },
  }));

export const menuSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Menu",
  name: "Autumn 2026",
  url: `${SITE_URL}/menu`,
  inLanguage: "en",
  hasMenuSection: MENU.map((category) => ({
    "@type": "MenuSection",
    name: category.title,
    hasMenuItem: category.items.map((item) => ({
      "@type": "MenuItem",
      name: item.name,
      description: item.description,
      offers: { "@type": "Offer", price: item.price.toFixed(2), priceCurrency: "USD" },
    })),
  })),
});

export const productsSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Objects for ritual",
  itemListElement: [HOME_RITUAL_SET, ...PRODUCTS].map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: p.name,
      description: p.description,
      image: `${SITE_URL}${p.image}`,
      brand: { "@type": "Brand", name: SITE.name },
      offers: {
        "@type": "Offer",
        price: p.price.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    },
  })),
});
