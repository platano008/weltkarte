/* Beta-Hinweis: großes Baustellen-Warnschild unten links, ohne Rahmen; oben rechts schwebt ein halb durchsichtiges ×.
   Weggeklickt bleibt es weg. Beta.zeigen(schluessel, text, {unten}) · Beta.verstecken() */
window.Beta = (function(){
  const CSS = `
.beta{position:fixed;z-index:60;left:max(12px,env(safe-area-inset-left));bottom:calc(max(12px,env(safe-area-inset-bottom)) + var(--beta-unten,0px));
  width:clamp(128px,34vw,156px);padding:0;border:0;background:none;animation:betaEin .55s cubic-bezier(.2,.8,.2,1) both}
.beta.weg{animation:betaWeg .3s ease-in both}
.beta svg.beta-schild{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 10px 18px rgba(0,0,0,.45))}
.beta button{position:absolute;right:-12px;top:-4px;width:30px;height:30px;display:grid;place-items:center;padding:0;border:0;border-radius:999px!important;
  background:rgba(20,20,22,.42);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:rgba(255,255,255,.88);cursor:pointer;transition:background .2s}
.beta button:hover{background:rgba(20,20,22,.7)}
.beta button svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
.beta .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@keyframes betaEin{from{opacity:0;transform:translateY(18px) scale(.9)}}
@keyframes betaWeg{to{opacity:0;transform:translateY(18px) scale(.9)}}
@media (prefers-reduced-motion:reduce){.beta,.beta.weg{animation:none}}`;
  /* Gelbes Dreieck mit abgerundeten Ecken, darin ein Bauarbeiter mit Schaufel und klein „UNDER CONSTRUCTION“ */
  const SCHILD = `<svg class="beta-schild" viewBox="0 0 120 106" aria-hidden="true">
    <path d="M60 9L112.5 97.5H7.5Z" fill="#f5c400" stroke="#111" stroke-width="7" stroke-linejoin="round"/>
    <g fill="#111" stroke="#111" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="57" cy="36" r="5.2" stroke="none"/>
      <path d="M55 45L62 62" stroke-width="7.5" fill="none"/>
      <path d="M62 62L55 76M62 62L71 74L71 77" stroke-width="5" fill="none"/>
      <path d="M56 49L46 56L42 52" stroke-width="4" fill="none"/>
      <path d="M36 45L46 70" stroke-width="2.6" fill="none"/>
      <path d="M41.5 68l8 -3.2 3 7.4 -5.4 3z" stroke-width="1.5"/>
      <path d="M68 80q8-11 17 0z" stroke-width="1.5"/>
    </g>
    <text x="60" y="89.5" text-anchor="middle" font-family="Arial Black,Arial,Helvetica,sans-serif" font-weight="900" font-size="6.4" letter-spacing=".25" fill="#111">UNDER CONSTRUCTION</text></svg>`;
  let box = null;
  const gemerkt = k=>{ try{ return !!localStorage.getItem("plyus-beta-" + k); }catch(e){ return false; } };
  function verstecken(){ if(!box) return; const b = box; box = null; b.classList.add("weg"); setTimeout(()=>b.remove(), 300); }
  function zeigen(k, text, o){
    if(gemerkt(k) || (box && box.dataset.k === k)) return;
    if(box){ box.remove(); box = null; }
    if(!document.getElementById("betaCss")){ const s = document.createElement("style"); s.id = "betaCss"; s.textContent = CSS; document.head.appendChild(s); }
    box = document.createElement("aside"); box.className = "beta"; box.dataset.k = k; box.setAttribute("role", "status");
    if(o && o.unten) box.style.setProperty("--beta-unten", o.unten + "px");
    box.innerHTML = SCHILD + `<span class="sr"></span><button type="button" aria-label="Hinweis schließen" title="Hinweis schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
    box.querySelector(".sr").textContent = text;
    box.querySelector("button").onclick = ()=>{ try{ localStorage.setItem("plyus-beta-" + k, "1"); }catch(e){} verstecken(); };
    document.body.appendChild(box);
  }
  return {zeigen, verstecken};
})();
