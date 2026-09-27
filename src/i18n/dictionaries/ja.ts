import type { CoreDictionary } from "./en";

export const ja: CoreDictionary = {
  meta: {
    siteTitle: "Noir Café — ニューヨークのスペシャルティコーヒー",
    description:
      "忍耐をもって調達し、節度をもって焙煎し、ささやかな心遣いとして注ぐ一杯。ソーホー、ブルックリン、ウエスト・ヴィレッジのスペシャルティコーヒー。",
    pages: {
      menu: {
        title: "メニュー",
        description: "エスプレッソ、ラテ、カプチーノ、抹茶、紅茶、ベーカリー — ゆっくりと作り、シンプルにお出しする Noir Café の秋のメニュー。",
      },
      story: {
        title: "私たちの物語",
        description: "Noir は2018年、マーサー・ストリートの書店の奥の小さなロースタリーとして始まりました — 長い対話から生まれたカフェです。",
      },
      brewingLab: {
        title: "ブリューイング・ラボ",
        description: "5つの変化、ひとつの豊かな一杯 — ひとつのロットを産地から抽出まで。レシピ、タイマー、抽出ガイドとともにたどります。",
      },
      studio: {
        title: "レシピスタジオ",
        description: "ハウスレシピで実験を — 粉量、比率、挽き目、湯、焙煎度。抽出、風味、カップの変化をリアルタイムで確かめられます。",
      },
      cup: {
        title: "種からカップまで、3Dで",
        description: "5つの変化、ひとつの豊かな一杯 — Noir Café のコーヒーを種からラテまで、インタラクティブな3Dの旅でたどります。",
      },
      locations: {
        title: "店舗",
        description: "ニューヨークに3つの Noir — ソーホーのマーサー・ストリート、ブルックリンのワイス・アベニュー、ウエスト・ヴィレッジのウエスト10丁目。",
      },
      reservation: {
        title: "席のご予約",
        description: "Noir Café マーサー・ストリートで、コーヒー、朝食、ゆったりとした午後のための席をご予約いただけます。",
      },
      shop: {
        title: "ショップ",
        description: "日々の暮らしのためのコーヒー、陶器、そして丁寧に選んだ道具。少量生産で、長く使えて、静かに美しいもの。",
      },
      concierge: {
        title: "バリスタに聞く",
        description: "Noir Café のバリスタ・コンシェルジュによる、ドリンクと豆のおすすめ、抽出のアドバイス、ペアリング、ギフトのアイデア。",
      },
      order: {
        title: "事前注文",
        description: "Noir Café 各店でコーヒーを事前注文 — ミルク、甘さ、氷を選び、受け取り時間を決めて、カウンターでお受け取りください。",
      },
      offline: { title: "オフライン", description: "" },
      orderConfirmed: { title: "ご注文を承りました", description: "" },
    },
  },

  a11y: {
    skip: "本文へスキップ",
    primaryNav: "メイン",
    mobileNav: "モバイル",
    moreNav: "その他",
    siteMenu: "サイトメニュー",
    openMenu: "メニューを開く",
    closeMenu: "メニューを閉じる",
    social: "ソーシャル",
    menuNotes: "メニューについて",
  },

  nav: {
    "/": "ホーム",
    "/menu": "メニュー",
    "/story": "ストーリー",
    "/brewing-lab": "ラボ",
    "/locations": "店舗",
    "/shop": "ショップ",
    "/reservation": "予約",
    "/order": "事前注文",
    "/concierge": "バリスタに聞く",
    "/brewing-lab/studio": "レシピスタジオ",
    "/cup": "種からカップへ · 3D",
  },
  dock: {
    "/": "ホーム",
    "/menu": "メニュー",
    "/locations": "店舗",
    "/reservation": "予約",
    "/shop": "ショップ",
  },

  site: {
    hours: "月–日 · 07:00–20:00",
  },

  footer: {
    Instagram: "Instagram",
    Journal: "ジャーナル",
    Careers: "採用情報",
    Privacy: "プライバシー",
  },

  newsletter: {
    eyebrow: "バーからの便り",
    title: "新しいロット、静かな物語、そしてご招待。",
    label: "メールアドレス",
    submit: "登録する",
    sending: "送信中",
    fine: "多くても月に一度 · いつでも解除できます",
    invalid: "有効なメールアドレスを入力してください",
    success: "登録が完了しました — 次の便りをお届けします",
  },

  sound: {
    play: "カフェの環境音を再生",
    mute: "カフェの環境音をミュート",
  },

  atmosphere: {
    light: "光",
    inNewYork: "ニューヨークは{daypart}",
    auto: "自動",
    morning: "朝",
    afternoon: "午後",
    evening: "夜",
    rain: "雨モード",
    rainingNow: "いまニューヨークは雨",
    followsWeather: "ニューヨークの天気に連動",
    setByYou: "手動で設定中",
    followWeather: "天気に合わせる",
    sound: "カフェの音",
    soundDescription: "ルームトーン、フェルトピアノ、働くバーの音",
    haptics: "触覚フィードバック",
    hapticsDescription: "タップやスワイプに軽い振動",
    notifications: "通知",
    notificationsDescription: "新しいロットとバーからのお知らせ",
  },

  locale: {
    language: "言語",
    currency: "通貨",
    chargedIn: "お支払いは米ドルです。その他の通貨は {date} の欧州中央銀行参考レートによる概算です。",
  },

  pwa: {
    offline: "オフライン · 保存済みのページを表示中",
    installLabel: "Noir Café をインストール",
    installTitle: "ホーム画面に Noir Café を",
    iosHint: "共有をタップし、「ホーム画面に追加」を選んでください。",
    promptHint: "アプリのように開けます — メニューと店舗情報はオフラインでも使えます。",
    install: "インストール",
    notNow: "今はしない",
  },

  intro: {
    menu: {
      eyebrow: "メニュー · 2026年 秋",
      title: "ゆっくりと作り、シンプルに。",
      lead: "メニューは収穫とともに移ろいます。本日のシングルオリジンのエスプレッソとフィルターは、バリスタにお尋ねください。",
    },
    brewingLab: {
      eyebrow: "ブリューイング・ラボ · メソッド 01",
      title: "5つの変化、ひとつの豊かな一杯。",
      lead: "ひとつのロットを産地から最後の一注ぎまで — 各段階で計り、味わい、磨き上げます。",
    },
    locations: {
      eyebrow: "ニューヨーク · 3つの空間",
      title: "どこにいても、静かなひと隅を。",
      lead: "Noir の各店はその街に形づくられながら、同じコーヒー、同じ素材、そしてゆったりとした間を大切にしています。",
    },
    reservation: {
      eyebrow: "ご予約 · マーサー・ストリート",
      title: "あなたの席を、静かにご用意して。",
      lead: "コーヒー、朝食、ゆったりとした午後のためにご予約ください。ご予約なしのご来店もいつでも歓迎です。",
    },
    shop: {
      eyebrow: "儀式のための道具 · エディション 03",
      title: "良い道具が、より良い朝を招く。",
      lead: "日々の暮らしのためのコーヒー、陶器、そして丁寧に選んだ道具。少量生産で、長く使えて、静かに美しいもの。",
    },
  },


  menu: {
    extras: "オーツミルク +{oat} · エクストラショット +{shot} · デカフェもございます",
    allergy: "アレルギーのある方はお知らせください。すべて共用のキッチンで調理しています。",
  },

  offline: {
    eyebrow: "オフライン",
    title: "接続がありません — カフェはここにあります。",
    lead: "メニューと店舗情報はこの端末に保存されています。そのほかの内容は、接続が戻るとご覧いただけます。",
    daily: "毎日 {hours}",
  },
};
