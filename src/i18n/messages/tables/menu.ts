import type { Table } from "../index";

/**
 * Menu — categories, descriptions and tasting notes. Drink names and the
 * internationally used coffee terms (Espresso, Latte, Cappuccino, Cortado,
 * Flat White) are left as they are; descriptions and notes are translated.
 */
export const menu: Table = {
  "Menu categories": { ja: "メニューのカテゴリー", fr: "Catégories de la carte", it: "Categorie del menù" },
  House: { ja: "定番", fr: "Maison", it: "Della casa" },
  "Choose a drink": { ja: "ドリンクを選ぶ", fr: "Choisir une boisson", it: "Scegli una bevanda" },
  "{name} details": { ja: "{name} の詳細", fr: "Détails de {name}", it: "Dettagli di {name}" },
  "Drink details": { ja: "ドリンクの詳細", fr: "Détails de la boisson", it: "Dettagli della bevanda" },
  "Make it yours": { ja: "お好みで", fr: "À votre goût", it: "A modo tuo" },
  "Reserve a table": { ja: "席を予約する", fr: "Réserver une table", it: "Prenota un tavolo" },
  "Coffee details": { ja: "コーヒーの詳細", fr: "Détails du café", it: "Dettagli del caffè" },
  "Brew guide": { ja: "抽出ガイド", fr: "Guide d’extraction", it: "Guida all’estrazione" },
  "Open in the studio": { ja: "スタジオで開く", fr: "Ouvrir dans le studio", it: "Apri nello studio" },

  // Categories
  Latte: { ja: "Latte", fr: "Latte", it: "Latte" },
  Cappuccino: { ja: "Cappuccino", fr: "Cappuccino", it: "Cappuccino" },
  Matcha: { ja: "抹茶", fr: "Matcha", it: "Matcha" },
  Tea: { ja: "お茶", fr: "Thé", it: "Tè" },
  Bakery: { ja: "ベーカリー", fr: "Boulangerie", it: "Forno" },

  // Descriptions
  "Single-origin · 36g": { ja: "シングルオリジン · 36g", fr: "Origine unique · 36 g", it: "Monorigine · 36 g" },
  "Espresso · filtered water": { ja: "エスプレッソ · ろ過水", fr: "Espresso · eau filtrée", it: "Espresso · acqua filtrata" },
  "Espresso · textured milk": { ja: "エスプレッソ · スチームミルク", fr: "Espresso · lait texturé", it: "Espresso · latte montato" },
  "Sesame praline · oat milk": { ja: "胡麻のプラリネ · オーツミルク", fr: "Praliné au sésame · lait d’avoine", it: "Pralinato al sesamo · latte d’avena" },
  "Double espresso · microfoam": { ja: "ダブルエスプレッソ · マイクロフォーム", fr: "Double espresso · micromousse", it: "Doppio espresso · microschiuma" },
  "Cacao nib · demerara": { ja: "カカオニブ · デメララ糖", fr: "Grué de cacao · demerara", it: "Granella di cacao · demerara" },
  "Uji matcha · water": { ja: "宇治抹茶 · 水", fr: "Matcha d’Uji · eau", it: "Matcha di Uji · acqua" },
  "Uji matcha · oat milk": { ja: "宇治抹茶 · オーツミルク", fr: "Matcha d’Uji · lait d’avoine", it: "Matcha di Uji · latte d’avena" },
  "Fujian · floral": { ja: "福建 · フローラル", fr: "Fujian · floral", it: "Fujian · floreale" },
  "Bergamot · lapsang": { ja: "ベルガモット · ラプサン", fr: "Bergamote · lapsang", it: "Bergamotto · lapsang" },
  "Brown butter · pearl sugar": { ja: "焦がしバター · パールシュガー", fr: "Beurre noisette · sucre perlé", it: "Burro nocciola · zucchero in granella" },
  "70% cacao · sea salt": { ja: "カカオ70% · 海塩", fr: "Cacao 70 % · sel de mer", it: "Cacao 70% · sale marino" },

  // Today at the bar
  "Today at the bar": { ja: "本日のバー", fr: "Aujourd’hui au comptoir", it: "Oggi al bancone" },
  "White peach · cacao nib · orange blossom": { ja: "白桃 · カカオニブ · オレンジブロッサム", fr: "Pêche blanche · grué de cacao · fleur d’oranger", it: "Pesca bianca · granella di cacao · fiori d’arancio" },
  "Espresso and croissants laid out on a dark table with a hand grinder, seen from above": {
    ja: "上から見た、ハンドグラインダーとともに暗いテーブルに並ぶエスプレッソとクロワッサン",
    fr: "Espresso et croissants disposés sur une table sombre avec un moulin manuel, vus du dessus",
    it: "Espresso e croissant disposti su un tavolo scuro con un macinino manuale, visti dall’alto",
  },

  // Flavour families (studio wheel) and tasting notes
  Fruity: { ja: "フルーティー", fr: "Fruité", it: "Fruttato" },
  Floral: { ja: "フローラル", fr: "Floral", it: "Floreale" },
  Sweet: { ja: "甘み", fr: "Sucré", it: "Dolce" },
  "Nutty & cocoa": { ja: "ナッツ & カカオ", fr: "Fruits à coque & cacao", it: "Frutta secca & cacao" },
  Spice: { ja: "スパイス", fr: "Épices", it: "Spezie" },
  Roasted: { ja: "ロースト", fr: "Torréfié", it: "Tostato" },
  Green: { ja: "グリーン", fr: "Végétal", it: "Vegetale" },
  Savoury: { ja: "セイボリー", fr: "Salé", it: "Sapido" },
  Fig: { ja: "イチジク", fr: "Figue", it: "Fico" },
  Honeydew: { ja: "ハニーデューメロン", fr: "Melon miel", it: "Melone bianco" },
  Bergamot: { ja: "ベルガモット", fr: "Bergamote", it: "Bergamotto" },
  Jasmine: { ja: "ジャスミン", fr: "Jasmin", it: "Gelsomino" },
  Caramel: { ja: "キャラメル", fr: "Caramel", it: "Caramello" },
  Vanilla: { ja: "バニラ", fr: "Vanille", it: "Vaniglia" },
  Molasses: { ja: "モラセス", fr: "Mélasse", it: "Melassa" },
  "Brown sugar": { ja: "黒糖", fr: "Cassonade", it: "Zucchero di canna" },
  Demerara: { ja: "デメララ糖", fr: "Demerara", it: "Demerara" },
  "Brown butter": { ja: "焦がしバター", fr: "Beurre noisette", it: "Burro nocciola" },
  Hazelnut: { ja: "ヘーゼルナッツ", fr: "Noisette", it: "Nocciola" },
  "Toasted almond": { ja: "ローストアーモンド", fr: "Amande grillée", it: "Mandorla tostata" },
  "Toasted sesame": { ja: "炒り胡麻", fr: "Sésame grillé", it: "Sesamo tostato" },
  "Milk chocolate": { ja: "ミルクチョコレート", fr: "Chocolat au lait", it: "Cioccolato al latte" },
  Cocoa: { ja: "ココア", fr: "Poudre de cacao", it: "Cacao in polvere" },
  Cacao: { ja: "カカオ", fr: "Cacao", it: "Cacao" },
  "Dark cacao": { ja: "ダークカカオ", fr: "Cacao noir", it: "Cacao fondente" },
  "Cacao nib": { ja: "カカオニブ", fr: "Grué de cacao", it: "Granella di cacao" },
  Cardamom: { ja: "カルダモン", fr: "Cardamome", it: "Cardamomo" },
  "Pine smoke": { ja: "松の燻香", fr: "Fumée de pin", it: "Fumo di pino" },
  Rye: { ja: "ライ麦", fr: "Seigle", it: "Segale" },
  "Green tea": { ja: "緑茶", fr: "Thé vert", it: "Tè verde" },
  "Sweet grass": { ja: "スイートグラス", fr: "Herbe douce", it: "Erba dolce" },
  Umami: { ja: "旨味", fr: "Umami", it: "Umami" },
  "Sea salt": { ja: "海塩", fr: "Sel de mer", it: "Sale marino" },
};
