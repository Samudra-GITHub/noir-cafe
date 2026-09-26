/**
 * Ambient video library. Each clip is 1080p H.264 (audio stripped, faststart)
 * with a 720p encode for small screens and a poster frame for first paint.
 */
export type VideoAsset = {
  src: string;
  mobile: string;
  poster: string;
};

function video(name: string): VideoAsset {
  return {
    src: `/videos/${name}.mp4`,
    mobile: `/videos/${name}-720.mp4`,
    poster: `/videos/${name}-poster.webp`,
  };
}

export const VIDEOS = {
  heroEspresso: video("hero-espresso"),
  latteArt: video("latte-art"),
  pourOver: video("pour-over"),
  coffeeBeans: video("coffee-beans"),
  perfectCup: video("perfect-cup"),
  ambienceCafe: video("ambience-cafe"),
} as const;
