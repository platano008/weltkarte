/* Plyus · Unterseiten: Menü und Einblenden */
(function(){ const m = document.getElementById("menu"), bt = document.getElementById("burger");
  const auf = on=>{ m.hidden = !on; bt.setAttribute("aria-expanded", on); document.documentElement.style.overflow = on ? "hidden" : ""; };
  bt.onclick = ()=>auf(true); document.getElementById("menuX").onclick = ()=>auf(false);
  m.querySelectorAll("a").forEach(a=>a.addEventListener("click", ()=>auf(false)));
  addEventListener("keydown", e=>{ if(e.key === "Escape") auf(false); });
  const rv = document.querySelectorAll(".rv");
  if("IntersectionObserver" in window){ const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }), {threshold:.12}); rv.forEach(r=>io.observe(r)); }
  else rv.forEach(r=>r.classList.add("in"));
  const j = document.getElementById("jahr"); if(j) j.textContent = new Date().getFullYear();
})();
