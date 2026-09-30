// Runs first in <head> on portal pages (app/layout.tsx) so the last chosen site theme is painted
// without a flash. It only reads a cache written by components/SiteTheme.tsx; if the cache is
// missing or malformed it does nothing and the approved default design shows.
// Not injected into the connected apps under /apps/*.
export const SITE_THEME_STORAGE_KEY = "hiutmc-site-theme-v1";

export const SITE_THEME_SCRIPT = `(function(){try{var raw=window.localStorage.getItem(${JSON.stringify(SITE_THEME_STORAGE_KEY)});if(!raw)return;var c=JSON.parse(raw);if(!c||typeof c.themeId!=="string"||!/^[a-z0-9-]{1,32}$/.test(c.themeId)||!c.vars||typeof c.vars!=="object")return;var r=document.documentElement;var n=0;for(var k in c.vars){if(/^--st-[a-z0-9-]+$/.test(k)&&/^#[0-9a-fA-F]{6}$/.test(c.vars[k])){r.style.setProperty(k,c.vars[k]);n++;}}if(n)r.setAttribute("data-site-theme",c.themeId);}catch(e){}})();`;
