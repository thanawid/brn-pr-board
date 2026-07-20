const CACHE = "brn-pr-v5-responsive";
const CORE = ["./","./index.html","./styles.css","./polish.css","./responsive.css","./app.js","./polish.js","./responsive.js","./assets/icon-192.png","./assets/mascot.png","./stage3d.js","./assets/vendor/three.min.js","./assets/logoBN-01.png","./assets/logoBN-02.png"];
self.addEventListener("install",(e)=>{
  e.waitUntil(caches.open(CACHE).then((c)=>c.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate",(e)=>{
  e.waitUntil(caches.keys().then((ks)=>Promise.all(ks.filter((k)=>k!==CACHE).map((k)=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch",(e)=>{
  if(e.request.method!=="GET")return;
  e.respondWith(
    caches.match(e.request).then((hit)=>{
      const net=fetch(e.request).then((res)=>{
        if(res && res.ok && e.request.url.startsWith(self.location.origin)){
          const clone=res.clone();
          caches.open(CACHE).then((c)=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>hit||caches.match("./index.html"));
      return hit||net;
    })
  );
});
