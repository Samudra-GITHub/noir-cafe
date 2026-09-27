import type { Table } from "../index";

/**
 * Locations — the cafés, the NYC map, live hours and weather. Café names,
 * street addresses and subway stations stay as New York writes them.
 */
export const locations: Table = {
  "Our cafés": { ja: "私たちの店舗", fr: "Nos cafés", it: "I nostri caffè" },
  "Map of Noir cafés": { ja: "Noir の店舗マップ", fr: "Carte des cafés Noir", it: "Mappa dei caffè Noir" },
  "Open today": { ja: "本日営業", fr: "Ouvert aujourd’hui", it: "Aperto oggi" },
  "Closed now · opens {time}": { ja: "ただいま閉店中 · {time} 開店", fr: "Fermé · ouvre à {time}", it: "Chiuso ora · apre alle {time}" },
  "Get directions to {name} (opens in a new tab)": {
    ja: "{name} への道順（新しいタブで開きます）",
    fr: "Itinéraire vers {name} (s’ouvre dans un nouvel onglet)",
    it: "Indicazioni per {name} (si apre in una nuova scheda)",
  },
  "Get directions": { ja: "道順を見る", fr: "Itinéraire", it: "Indicazioni" },
  Open: { ja: "営業中", fr: "Ouvert", it: "Aperto" },
  Closed: { ja: "閉店中", fr: "Fermé", it: "Chiuso" },
  Hours: { ja: "営業時間", fr: "Horaires", it: "Orari" },
  Daily: { ja: "毎日", fr: "Tous les jours", it: "Tutti i giorni" },
  "New York": { ja: "ニューヨーク", fr: "New York", it: "New York" },
  "Sunset {time}": { ja: "日の入り {time}", fr: "Coucher du soleil {time}", it: "Tramonto {time}" },
  "Sunrise {time}": { ja: "日の出 {time}", fr: "Lever du soleil {time}", it: "Alba {time}" },
  "Hudson River": { ja: "ハドソン川", fr: "Hudson", it: "Hudson" },
  "East River": { ja: "イースト川", fr: "East River", it: "East River" },
  Manhattan: { ja: "マンハッタン", fr: "Manhattan", it: "Manhattan" },
  Brooklyn: { ja: "ブルックリン", fr: "Brooklyn", it: "Brooklyn" },
  Café: { ja: "カフェ", fr: "Café", it: "Caffè" },
  Evening: { ja: "夜", fr: "Soir", it: "Sera" },
  Daytime: { ja: "昼", fr: "Jour", it: "Giorno" },
  "Open · closes in {duration}": { ja: "営業中 · あと{duration}で閉店", fr: "Ouvert · ferme dans {duration}", it: "Aperto · chiude tra {duration}" },
  "Closed · opens in {duration}": { ja: "閉店中 · あと{duration}で開店", fr: "Fermé · ouvre dans {duration}", it: "Chiuso · apre tra {duration}" },
  "{h} h {m} min": { ja: "{h}時間{m}分", fr: "{h} h {m} min", it: "{h} h {m} min" },
  "{m} min": { ja: "{m}分", fr: "{m} min", it: "{m} min" },
  "Lines {lines}": { ja: "路線 {lines}", fr: "Lignes {lines}", it: "Linee {lines}" },
  "Walk here": { ja: "歩いて行く", fr: "Y aller à pied", it: "Vai a piedi" },
  "How far am I?": { ja: "ここからの距離は？", fr: "À quelle distance suis-je ?", it: "Quanto sono lontano?" },
  "You're right here.": { ja: "すぐそこです。", fr: "Vous y êtes.", it: "Sei proprio qui." },
  "{d} mi away · about {m} min on foot": { ja: "{d} マイル · 徒歩約{m}分", fr: "À {d} mi · environ {m} min à pied", it: "A {d} mi · circa {m} min a piedi" },
  "{d} km away · about {m} min on foot": { ja: "{d} km · 徒歩約{m}分", fr: "À {d} km · environ {m} min à pied", it: "A {d} km · circa {m} min a piedi" },
  "Location isn't available on this device.": { ja: "この端末では位置情報を利用できません。", fr: "La localisation n’est pas disponible sur cet appareil.", it: "La posizione non è disponibile su questo dispositivo." },
  "We couldn't get your location — you can still get walking directions.": {
    ja: "位置情報を取得できませんでした — 徒歩の道順はご覧いただけます。",
    fr: "Impossible d’obtenir votre position — l’itinéraire à pied reste disponible.",
    it: "Non riusciamo a ottenere la tua posizione — puoi comunque vedere il percorso a piedi.",
  },

  // Weather (lib/weather)
  Clear: { ja: "快晴", fr: "Dégagé", it: "Sereno" },
  "Partly cloudy": { ja: "晴れ時々曇り", fr: "Partiellement nuageux", it: "Parzialmente nuvoloso" },
  Overcast: { ja: "曇り", fr: "Couvert", it: "Coperto" },
  Fog: { ja: "霧", fr: "Brouillard", it: "Nebbia" },
  Drizzle: { ja: "霧雨", fr: "Bruine", it: "Pioviggine" },
  Rain: { ja: "雨", fr: "Pluie", it: "Pioggia" },
  Snow: { ja: "雪", fr: "Neige", it: "Neve" },
  Showers: { ja: "にわか雨", fr: "Averses", it: "Rovesci" },
  "Snow showers": { ja: "にわか雪", fr: "Averses de neige", it: "Rovesci di neve" },
  Thunderstorms: { ja: "雷雨", fr: "Orages", it: "Temporali" },

  // Cafés (data/locations)
  Flagship: { ja: "旗艦店", fr: "Adresse phare", it: "Sede principale" },
  "West Village": { ja: "ウエスト・ヴィレッジ", fr: "West Village", it: "West Village" },
  "A bright café bar with a stone counter, pastry case and shelves of coffee": {
    ja: "石のカウンター、ペストリーケース、コーヒーの棚がある明るいカフェのバー",
    fr: "Un comptoir lumineux en pierre, une vitrine de pâtisseries et des étagères de café",
    it: "Un bancone luminoso in pietra, una vetrina di dolci e scaffali di caffè",
  },
  "Brick walls, leather armchairs and round tables beside tall windows": {
    ja: "レンガの壁、革のアームチェア、背の高い窓辺の丸テーブル",
    fr: "Murs de brique, fauteuils en cuir et tables rondes près de hautes fenêtres",
    it: "Pareti di mattoni, poltrone in pelle e tavoli rotondi accanto ad alte finestre",
  },
  "Lit shopfronts on a quiet West Village street at night": {
    ja: "夜の静かなウエスト・ヴィレッジの通りに灯る店先",
    fr: "Des vitrines éclairées dans une rue calme du West Village, la nuit",
    it: "Vetrine illuminate in una via tranquilla del West Village, di notte",
  },
};
