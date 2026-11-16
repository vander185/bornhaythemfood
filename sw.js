const V='hf-v4';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(['./','index.html'])).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
// Réseau d'abord ; une page d'erreur (404, maintenance de l'hébergeur…) n'est jamais affichée ni gardée :
// la borne reste sur sa dernière version qui fonctionne.
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 const nav=r.mode==='navigate';
 const old=()=>caches.match(r).then(m=>m||(nav?caches.match('index.html'):undefined)).then(m=>m||Response.error());
 const photo=/\/photos\/|\.(webp|png|jpg)$/.test(new URL(r.url).pathname);
 // pages et scripts : toujours revérifiés auprès du serveur (sinon l'ancienne version reste jusqu'à 10 min)
 e.respondWith(fetch(r,photo?undefined:{cache:'no-cache'}).then(x=>{
   if(!x.ok)return nav||!/\.json$/.test(new URL(r.url).pathname)?caches.match(r).then(m=>m||(nav?caches.match('index.html'):null)).then(m=>m||x):x;
   const c=x.clone();caches.open(V).then(h=>h.put(r,c));return x}).catch(old))});
