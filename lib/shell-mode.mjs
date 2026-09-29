// Shared "shell" script for hiutmc.com.
//
// Runs as the first thing in <head> on every portal page (app/layout.tsx) and on
// every connected app served through /apps/* (worker.mjs injects it). Because the
// connected apps are same-origin, they share one localStorage, so a single saved
// choice drives the whole ecosystem:
//
// 1. PC mode: when the member picked "PC", every page gets data-display-mode="pc"
//    and a desktop-width viewport, so each page's own desktop layout applies —
//    including apps that know nothing about the portal.
// 2. Transitions: every page opts into the same cross-document view transition,
//    so moving between portal pages and connected apps animates the same way.
//
// Keep this plain ES5-style JavaScript: it runs before any framework code and in
// third-party apps.

export const DISPLAY_MODE_STORAGE_KEY = "hiutmc-display-mode-v1";
export const PC_VIEWPORT_WIDTH = 1280;

const TRANSITION_CSS =
  "@view-transition{navigation:auto}" +
  "::view-transition-old(root),::view-transition-new(root){animation-duration:var(--hiu-navigation-duration,1200ms);animation-timing-function:cubic-bezier(.22,.72,.24,1)}" +
  "::view-transition-old(root){animation-name:hiu-page-out}" +
  "::view-transition-new(root){animation-name:hiu-page-in}" +
  "@keyframes hiu-page-out{to{opacity:0;transform:translateX(-1.25%)}}" +
  "@keyframes hiu-page-in{from{opacity:0;transform:translateX(1.25%)}}" +
  "@media(prefers-reduced-motion:reduce){::view-transition-old(root),::view-transition-new(root){animation-duration:1ms!important}}";

export const SHELL_MODE_SCRIPT = `(function(){
var K=${JSON.stringify(DISPLAY_MODE_STORAGE_KEY)},W=${PC_VIEWPORT_WIDTH},d=document,r=d.documentElement,DEV="width=device-width, initial-scale=1";
function read(){try{return localStorage.getItem(K)==="pc"?"pc":"auto"}catch(e){return"auto"}}
function viewport(m){var list=d.querySelectorAll('meta[name="viewport"]'),i,el;
if(!list.length){if(m!=="pc")return;el=d.createElement("meta");el.setAttribute("name","viewport");(d.head||r).appendChild(el);list=[el]}
for(i=0;i<list.length;i++){el=list[i];if(!el.hasAttribute("data-hiutmc-original"))el.setAttribute("data-hiutmc-original",el.getAttribute("content")||DEV);
el.setAttribute("content",m==="pc"?"width="+W:el.getAttribute("data-hiutmc-original"))}}
function apply(m){m=m==="pc"?"pc":"auto";r.setAttribute("data-display-mode",m);viewport(m)}
window.__hiutmcApplyDisplayMode=apply;
var mode=read();r.setAttribute("data-display-mode",mode);
if(mode==="pc"){viewport(mode);try{var o=new MutationObserver(function(){viewport(read())});o.observe(r,{childList:true,subtree:true});d.addEventListener("DOMContentLoaded",function(){viewport(read());o.disconnect()})}catch(e){}}
if(!d.getElementById("hiutmc-shell-transition")){var s=d.createElement("style");s.id="hiutmc-shell-transition";s.textContent=${JSON.stringify(TRANSITION_CSS)};(d.head||r).appendChild(s)}
window.addEventListener("storage",function(e){if(e.key===K)apply(read())});
})();`;
