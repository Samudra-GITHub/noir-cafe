export const LIGHT_KEY = "noir:light";
export const RAIN_KEY = "noir:rain";

/**
 * Inline <head> script: applies the stored light / rain choice (or the New York
 * daypart) to <html> before first paint, so there is no flash or shift.
 */
export const ATMOSPHERE_BOOT = `try{var d=document.documentElement,l=localStorage.getItem("${LIGHT_KEY}"),h=+new Intl.DateTimeFormat("en-US",{hour:"numeric",hourCycle:"h23",timeZone:"America/New_York"}).format(new Date());d.dataset.daypart=l&&l!=="auto"?l:h>=5&&h<11?"morning":h>=11&&h<17?"afternoon":"evening";if(localStorage.getItem("${RAIN_KEY}")==="1")d.dataset.rain=""}catch(e){}`;

