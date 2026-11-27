/* Beta-Hinweis: gelbes Warnschild unten links, wegklickbar (bleibt danach weg).
   Beta.zeigen(schluessel, text, {unten}) · Beta.verstecken() */
window.Beta = (function(){
  const CSS = `
.beta{position:fixed;z-index:60;left:max(16px,env(safe-area-inset-left));bottom:calc(max(16px,env(safe-area-inset-bottom)) + var(--beta-unten,0px));
  display:flex;align-items:center;gap:12px;max-width:min(330px,calc(100vw - 32px));padding:10px 10px 10px 12px;border:1px solid rgba(255,255,255,.16);border-radius:16px!important;
  background:rgba(14,15,18,.88);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:#fff;box-shadow:0 14px 34px -14px rgba(0,0,0,.9);
  animation:betaEin .5s cubic-bezier(.2,.8,.2,1) both}
.beta.weg{animation:betaWeg .3s ease-in both}
.beta svg.beta-schild{width:44px;height:40px;flex:none;overflow:visible}
.beta p{margin:0;display:flex;flex-direction:column;gap:3px;font-size:13.5px;line-height:1.3}
.beta p b{font-family:var(--mono,monospace);font-size:10.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#f5c400}
.beta button{flex:none;width:32px;height:32px;display:grid;place-items:center;margin-left:2px;padding:0;border:0;border-radius:999px!important;background:none;color:#9a9a9a;cursor:pointer}
.beta button:hover{color:#fff;background:rgba(255,255,255,.08)}
.beta button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
@keyframes betaEin{from{opacity:0;transform:translateX(-24px)}}
@keyframes betaWeg{to{opacity:0;transform:translateX(-24px)}}
@media (prefers-reduced-motion:reduce){.beta,.beta.weg{animation:none}}`;
  /* Warnschild wie auf Baustellen: gelbes Dreieck mit schwarzem Rand, darin Hammer und Schraubenschlüssel */
  const SCHILD = `<svg class="beta-schild" viewBox="0 0 48 44" aria-hidden="true">
    <path d="M24 4L45.5 40.5H2.5Z" fill="#f5c400" stroke="#111" stroke-width="3.4" stroke-linejoin="round"/>
    <g fill="#111" stroke="#111" stroke-linecap="round">
      <path d="M31.6 36.2L22 26.6" stroke-width="3.2"/><rect x="-5.6" y="-2.5" width="11.2" height="5" rx=".8" stroke="none" transform="translate(20.4 24.9) rotate(-45)"/>
      <path d="M16.4 36.2L27 25.6" stroke-width="3.2"/><circle cx="29.2" cy="23.4" r="4.6" stroke="none"/><rect x="-1.6" y="-6.4" width="3.2" height="5.2" fill="#f5c400" stroke="none" transform="translate(29.2 23.4) rotate(45)"/>
    </g></svg>`;
  let box = null;
  const gemerkt = k=>{ try{ return !!localStorage.getItem("plyus-beta-" + k); }catch(e){ return false; } };
  function verstecken(){ if(!box) return; const b = box; box = null; b.classList.add("weg"); setTimeout(()=>b.remove(), 300); }
  function zeigen(k, text, o){
    if(gemerkt(k) || (box && box.dataset.k === k)) return;
    if(box){ box.remove(); box = null; }
    if(!document.getElementById("betaCss")){ const s = document.createElement("style"); s.id = "betaCss"; s.textContent = CSS; document.head.appendChild(s); }
    box = document.createElement("aside"); box.className = "beta"; box.dataset.k = k; box.setAttribute("role", "status");
    if(o && o.unten) box.style.setProperty("--beta-unten", o.unten + "px");
    box.innerHTML = SCHILD + `<p><b>Beta</b><span></span></p><button type="button" aria-label="Hinweis schließen" title="Hinweis schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
    box.querySelector("span").textContent = text;
    box.querySelector("button").onclick = ()=>{ try{ localStorage.setItem("plyus-beta-" + k, "1"); }catch(e){} verstecken(); };
    document.body.appendChild(box);
  }
  return {zeigen, verstecken};
})();
