import type { Table } from "../index";

/** Shared interface copy: buttons, labels, roast levels, footer. */
export const common: Table = {
  Close: { ja: "閉じる", fr: "Fermer", it: "Chiudi" },
  Next: { ja: "次へ", fr: "Suivant", it: "Avanti" },
  Details: { ja: "詳細", fr: "Détails", it: "Dettagli" },
  Price: { ja: "価格", fr: "Prix", it: "Prezzo" },
  Social: { ja: "ソーシャル", fr: "Réseaux sociaux", it: "Social" },
  Roast: { ja: "焙煎", fr: "Torréfaction", it: "Tostatura" },
  Flavor: { ja: "風味", fr: "Arômes", it: "Aroma" },
  Brew: { ja: "抽出", fr: "Extraction", it: "Estrazione" },
  Light: { ja: "浅煎り", fr: "Claire", it: "Chiara" },
  Medium: { ja: "中煎り", fr: "Moyenne", it: "Media" },
  Dark: { ja: "深煎り", fr: "Foncée", it: "Scura" },
  "{roast} roast, {level} of 3": { ja: "焙煎度 {roast}（3段階中 {level}）", fr: "Torréfaction {roast}, {level} sur 3", it: "Tostatura {roast}, {level} su 3" },
  "Tasting notes": { ja: "テイスティングノート", fr: "Notes de dégustation", it: "Note di degustazione" },
  "Decrease quantity": { ja: "数量を減らす", fr: "Diminuer la quantité", it: "Diminuisci la quantità" },
  "Increase quantity": { ja: "数量を増やす", fr: "Augmenter la quantité", it: "Aumenta la quantità" },
  "Pinch or double-tap to zoom.": { ja: "ピンチまたはダブルタップで拡大できます。", fr: "Pincez ou touchez deux fois pour zoomer.", it: "Pizzica o tocca due volte per ingrandire." },
  "Preparing your coffee…": { ja: "コーヒーを準備しています…", fr: "Nous préparons votre café…", it: "Stiamo preparando il tuo caffè…" },
  "Coffee, composed with care.": { ja: "丁寧に仕立てた、一杯のコーヒーを。", fr: "Un café composé avec soin.", it: "Caffè, composto con cura." },
  "Every day, in every cup.": { ja: "毎日、どの一杯にも。", fr: "Chaque jour, dans chaque tasse.", it: "Ogni giorno, in ogni tazza." },
  "{label} (opens in a new tab)": { ja: "{label}（新しいタブで開きます）", fr: "{label} (s’ouvre dans un nouvel onglet)", it: "{label} (si apre in una nuova scheda)" },
  "The page reloads in the language you choose.": { ja: "選んだ言語でページを再読み込みします。", fr: "La page se recharge dans la langue choisie.", it: "La pagina si ricarica nella lingua scelta." },
};
