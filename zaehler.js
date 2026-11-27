/* Besucherstatistik ohne Cookies und ohne Speichern im Browser: jede Seite zählt einen Aufruf pro Tag,
   ein Besuch zählt, wenn man von außerhalb kommt. Nur Zahlen, über den freien Zähldienst abacus.jasoncameron.dev. */
(function(){
  if(navigator.webdriver || !/github\.io$/.test(location.hostname)) return;      // keine Testbrowser, keine lokalen Kopien
  const tag = new Intl.DateTimeFormat("sv-SE", {timeZone:"Europe/Berlin"}).format(new Date());
  const zaehl = k=>fetch(`https://abacus.jasoncameron.dev/hit/plyus-weltkarte/${k}-${tag}`, {keepalive:true}).catch(()=>{});
  zaehl("aufrufe");
  let extern = true; try{ extern = !document.referrer || new URL(document.referrer).host !== location.host; }catch(e){}
  if(extern) zaehl("besuche");
})();
