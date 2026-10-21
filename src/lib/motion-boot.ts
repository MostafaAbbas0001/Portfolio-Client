/**
 * Inlined in <head> so it runs before first paint, independent of React:
 *   [data-reveal]       fades in when scrolled into view (also for nodes added later)
 *   [data-magnetic]     drifts toward the cursor (--tx/--ty)
 *   [data-tilt]         turns to face the cursor anywhere inside its [data-tilt-scope]
 *                       (--rx/--ry) and gets the highlight position (--sx/--sy)
 *   [data-cursor-glow]  gets --gx/--gy for a soft light that follows the cursor
 *   [data-timeline]     gets --progress (0–1) while it scrolls through the viewport
 * Pointer effects only run with a fine pointer; nothing animates under reduced motion.
 */
export const MOTION_BOOT_SCRIPT = `(function(){
var d=document.documentElement;d.classList.add("js");
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function show(el){el.setAttribute("data-inview","")}
var io=("IntersectionObserver" in window)&&!reduce?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target)}})},{rootMargin:"0px 0px -6% 0px",threshold:0.08}):null;
function watch(el){if(io)io.observe(el);else show(el)}
function scan(root){if(root.matches&&root.matches("[data-reveal]:not([data-inview])"))watch(root);if(root.querySelectorAll)root.querySelectorAll("[data-reveal]:not([data-inview])").forEach(watch)}
new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n)})})}).observe(d,{childList:true,subtree:true});
document.addEventListener("DOMContentLoaded",function(){scan(document)});
var timelines=[];function measure(){timelines=[].slice.call(document.querySelectorAll("[data-timeline]"));timelines.forEach(function(t){var r=t.getBoundingClientRect(),vh=innerHeight;var p=(vh*0.65-r.top)/r.height;t.style.setProperty("--progress",Math.max(0,Math.min(1,p)).toFixed(3))})}
var sraf=0;addEventListener("scroll",function(){if(!sraf)sraf=requestAnimationFrame(function(){sraf=0;measure()})},{passive:true});
addEventListener("load",measure);new MutationObserver(function(){if(!sraf)sraf=requestAnimationFrame(function(){sraf=0;measure()})}).observe(d,{childList:true,subtree:true});
if(reduce||!(window.matchMedia&&matchMedia("(pointer: fine)").matches))return;
var raf=0,ev=null,pulled=null,tilted=null;
function reset(el,a,b){if(el){el.style.removeProperty(a);el.style.removeProperty(b)}}
document.addEventListener("pointermove",function(e){ev=e;if(!raf)raf=requestAnimationFrame(tick)},{passive:true});
function tick(){raf=0;var e=ev;if(!e||!(e.target instanceof Element))return;var t=e.target,r;
var sc=t.closest("[data-tilt-scope]"),b=sc&&sc.querySelector("[data-tilt]");if(b!==tilted){if(tilted)["--rx","--ry","--sx","--sy"].forEach(function(p){tilted.style.removeProperty(p)});tilted=b}
if(b){r=b.getBoundingClientRect();var sr=sc.getBoundingClientRect(),px=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/(sr.width/2))),py=Math.max(-1,Math.min(1,(e.clientY-r.top-r.height/2)/(sr.height/2)));
b.style.setProperty("--rx",(-py*16).toFixed(2)+"deg");b.style.setProperty("--ry",(px*22).toFixed(2)+"deg");b.style.setProperty("--sx",(50+px*32).toFixed(1)+"%");b.style.setProperty("--sy",(45+py*32).toFixed(1)+"%")}
var m=t.closest("[data-magnetic]");if(m!==pulled){reset(pulled,"--tx","--ty");pulled=m}
if(m){r=m.getBoundingClientRect();m.style.setProperty("--tx",((e.clientX-r.left-r.width/2)*0.22).toFixed(1)+"px");m.style.setProperty("--ty",((e.clientY-r.top-r.height/2)*0.32).toFixed(1)+"px")}
var g=document.querySelector("[data-cursor-glow]");if(g){r=g.getBoundingClientRect();if(e.clientY<r.bottom){g.style.setProperty("--gx",(e.clientX-r.left)+"px");g.style.setProperty("--gy",(e.clientY-r.top)+"px")}}}
document.addEventListener("pointerleave",function(){reset(pulled,"--tx","--ty");if(tilted)["--rx","--ry","--sx","--sy"].forEach(function(p){tilted.style.removeProperty(p)});pulled=tilted=null});
})();`;
