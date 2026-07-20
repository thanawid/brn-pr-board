/* POLISH LAYER — ลูกเล่นมืออาชีพ (ไม่ยุ่งกับ app.js) */
(function(){
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* topbar เงาเมื่อเลื่อน */
  const bar=document.querySelector(".topbar");
  if(bar){
    const onS=()=>bar.classList.toggle("is-scrolled",window.scrollY>8);
    window.addEventListener("scroll",onS,{passive:true});onS();
  }

  /* reveal ตอนเลื่อนถึง */
  if(!reduced && "IntersectionObserver" in window){
    const els=document.querySelectorAll("main > section, .panel");
    const io=new IntersectionObserver(es=>es.forEach((e,i)=>{
      if(e.isIntersecting){setTimeout(()=>e.target.classList.add("pl-in"),(i%3)*80);io.unobserve(e.target);}
    }),{threshold:.06,rootMargin:"0px 0px -30px 0px"});
    els.forEach(el=>{el.classList.add("pl-fx");io.observe(el);});
  }

  /* ตัวเลขสรุปนับวิ่ง */
  const strip=document.querySelector(".summary-strip");
  if(strip && !reduced && "IntersectionObserver" in window){
    const io2=new IntersectionObserver(es=>{
      if(!es[0].isIntersecting)return;
      io2.disconnect();
      strip.querySelectorAll("span[id^='stat-']").forEach(sp=>{
        const target=parseInt(sp.textContent,10);
        if(isNaN(target)||target===0)return;
        const t0=performance.now(),dur=900;
        const tick=(t)=>{
          const p=Math.min(1,(t-t0)/dur);
          sp.textContent=Math.round(target*(1-Math.pow(1-p,3)));
          if(p<1)requestAnimationFrame(tick);else sp.textContent=target;
        };
        requestAnimationFrame(tick);
      });
    },{threshold:.4});
    io2.observe(strip);
  }

  /* การ์ดวันนี้เอียงตามเมาส์นิด ๆ */
  const tc=document.querySelector(".today-card");
  if(tc && !reduced && matchMedia("(pointer:fine)").matches){
    tc.style.transition="transform .2s ease-out";
    tc.addEventListener("pointermove",e=>{
      const r=tc.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      tc.style.transform=`perspective(700px) rotateY(${x*8}deg) rotateX(${-y*6}deg) translateY(-2px)`;
    });
    tc.addEventListener("pointerleave",()=>tc.style.transform="none");
  }
})();

/* PWA: ลงทะเบียน service worker (ใช้ได้บน https/GitHub Pages) */
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
