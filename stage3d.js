/* BRN Pulse Stage — ทรงกลมอนุภาคม่วง-ทอง เต้นตุบ ๆ หลัง hero */
(function(){
  if(!window.THREE) return;
  const canvas=document.getElementById("stage3d");
  const stage=canvas && canvas.parentElement;
  if(!canvas||!stage) return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compact=matchMedia("(max-width: 760px)").matches;
  const saveData=Boolean(navigator.connection && navigator.connection.saveData);
  if(compact || saveData){ canvas.hidden=true; return; }

  let renderer;
  try {
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  } catch {
    canvas.hidden=true;
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(55,1,0.1,100);
  camera.position.z=7.2;

  /* จุดกลม ๆ นุ่ม ๆ จาก canvas texture */
  const dotCv=document.createElement("canvas");dotCv.width=dotCv.height=64;
  const g=dotCv.getContext("2d");
  const grad=g.createRadialGradient(32,32,0,32,32,30);
  grad.addColorStop(0,"rgba(255,255,255,1)");grad.addColorStop(.45,"rgba(255,255,255,.85)");grad.addColorStop(1,"rgba(255,255,255,0)");
  g.fillStyle=grad;g.fillRect(0,0,64,64);
  const dotTex=new THREE.CanvasTexture(dotCv);

  function cloud(count,radius,color,size){
    const geo=new THREE.BufferGeometry();
    const pos=new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const t=Math.acos(2*Math.random()-1), p=Math.random()*Math.PI*2;
      const r=radius*(0.86+Math.random()*0.2);
      pos[i*3]=r*Math.sin(t)*Math.cos(p);
      pos[i*3+1]=r*Math.sin(t)*Math.sin(p);
      pos[i*3+2]=r*Math.cos(t);
    }
    geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
    const mat=new THREE.PointsMaterial({color,size,map:dotTex,transparent:true,opacity:.9,
      depthWrite:false,blending:THREE.AdditiveBlending});
    return new THREE.Points(geo,mat);
  }
  const orb=new THREE.Group();
  orb.add(cloud(950,2.5,0xa78bfa,0.10));   /* ม่วง */
  orb.add(cloud(500,2.55,0xffd36d,0.085)); /* ทอง */
  orb.add(cloud(220,3.4,0xff8a5c,0.065));  /* ประกายส้มรอบนอก */
  scene.add(orb);
  orb.position.x=1.6;

  let mx=0,my=0;
  if(!reduced){
    window.addEventListener("pointermove",(e)=>{
      mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5);
    },{passive:true});
  }

  function resize(){
    const r=stage.getBoundingClientRect();
    const w=Math.max(1,r.width), h=Math.max(1,r.height);
    renderer.setSize(w,h,false);
    camera.aspect=w/h;camera.updateProjectionMatrix();
    orb.position.x=w>760?1.6:0;
  }
  resize();
  window.addEventListener("resize",resize,{passive:true});

  let running=true;
  if("IntersectionObserver" in window){
    new IntersectionObserver((es)=>{running=es[0].isIntersecting;},{threshold:0}).observe(stage);
  }

  const t0=performance.now();
  function tick(t){
    if(running){
      const s=(t-t0)/1000;
      const pulse=1+Math.sin(s*2.1)*0.06+Math.sin(s*4.7)*0.02; /* จังหวะ ON AIR */
      orb.scale.setScalar(pulse);
      orb.rotation.y=s*0.12+mx*0.5;
      orb.rotation.x=Math.sin(s*0.4)*0.08+my*0.3;
      renderer.render(scene,camera);
    }
    if(!reduced)requestAnimationFrame(tick);
  }
  if(reduced){renderer.render(scene,camera);} else {requestAnimationFrame(tick);}
})();
