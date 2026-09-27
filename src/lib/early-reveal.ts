/**
 * EARLY_REVEAL — inline script placed at the end of <body>. Before any bundle
 * runs, it marks the FadeUp blocks already ≥20% on screen so their CSS
 * transition starts with the first paint instead of after hydration (the page
 * intro and lead photograph are often the LCP). Everything further down is
 * still revealed by FadeUp's IntersectionObserver. Same motion either way.
 */
export const EARLY_REVEAL = `(function(){try{var h=innerHeight;document.querySelectorAll(".fade-up").forEach(function(el){var r=el.getBoundingClientRect();var v=Math.min(r.bottom,h)-Math.max(r.top,0);if(r.height&&v>=0.2*r.height)el.setAttribute("data-shown","")})}catch(e){}})()`;
