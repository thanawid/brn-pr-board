const canvas = document.getElementById("brn-3d-scene");

if (canvas && window.THREE) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x160f22, 9, 28);

  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 80);
  camera.position.set(5.8, 3.45, 6.25);
  camera.lookAt(0.45, 1.55, -2.45);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

  const root = new THREE.Group();
  scene.add(root);

  const palette = {
    ink: 0x160f22,
    purple: 0x32155f,
    purpleSoft: 0x623293,
    gold: 0xd8b24c,
    orange: 0xff781f,
    teal: 0x0f766e,
    glass: 0xe9ddff,
    white: 0xfff7dc,
  };

  const materials = {
    floor: new THREE.MeshStandardMaterial({ color: 0x211734, roughness: 0.28, metalness: 0.42 }),
    wall: new THREE.MeshStandardMaterial({ color: 0x23172f, roughness: 0.46, metalness: 0.18 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x1b1326, roughness: 0.22, metalness: 0.72 }),
    purple: new THREE.MeshStandardMaterial({ color: palette.purple, roughness: 0.34, metalness: 0.2 }),
    gold: new THREE.MeshStandardMaterial({ color: palette.gold, roughness: 0.28, metalness: 0.36 }),
    orange: new THREE.MeshStandardMaterial({ color: palette.orange, roughness: 0.3, metalness: 0.12, emissive: 0x3b1200, emissiveIntensity: 0.35 }),
    teal: new THREE.MeshStandardMaterial({ color: palette.teal, roughness: 0.36, metalness: 0.16, emissive: 0x00231f, emissiveIntensity: 0.18 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: palette.glass,
      roughness: 0.06,
      metalness: 0.04,
      transparent: true,
      opacity: 0.32,
      transmission: 0.35,
      clearcoat: 0.8,
      clearcoatRoughness: 0.08,
    }),
    screen: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98 }),
    lightGold: new THREE.MeshBasicMaterial({ color: 0xffd66f }),
    lightOrange: new THREE.MeshBasicMaterial({ color: 0xff8b33 }),
  };

  const ambient = new THREE.HemisphereLight(0xfff4d5, 0x1a1030, 1.2);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffe2a5, 2.25);
  key.position.set(4.5, 6.8, 4.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 18;
  scene.add(key);

  const rim = new THREE.PointLight(0xff781f, 3.6, 16);
  rim.position.set(-4.2, 2.8, 2.6);
  scene.add(rim);

  const wallGlow = new THREE.PointLight(0x9066ff, 2.1, 12);
  wallGlow.position.set(2.6, 2.5, -3.1);
  scene.add(wallGlow);

  function mesh(geometry, material, position, rotation = [0, 0, 0], scale = [1, 1, 1]) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(...position);
    item.rotation.set(...rotation);
    item.scale.set(...scale);
    item.castShadow = true;
    item.receiveShadow = true;
    return item;
  }

  function box(size, material, position, rotation) {
    return mesh(new THREE.BoxGeometry(...size), material, position, rotation);
  }

  function makeLabelTexture(title, subtitle, accent = "#ff781f") {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
    grad.addColorStop(0, "rgba(27, 18, 44, 0.96)");
    grad.addColorStop(0.58, "rgba(50, 21, 95, 0.92)");
    grad.addColorStop(1, "rgba(255, 120, 31, 0.78)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 3;
    for (let x = 72; x < c.width; x += 88) {
      ctx.beginPath();
      ctx.moveTo(x, 54);
      ctx.lineTo(x, c.height - 54);
      ctx.stroke();
    }
    for (let y = 86; y < c.height; y += 78) {
      ctx.beginPath();
      ctx.moveTo(54, y);
      ctx.lineTo(c.width - 54, y);
      ctx.stroke();
    }
    ctx.fillStyle = accent;
    ctx.fillRect(64, 64, 168, 12);
    ctx.fillStyle = "#fff7dc";
    ctx.font = '900 70px "Segoe UI", Arial, sans-serif';
    ctx.fillText(title, 64, 176);
    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.font = '700 34px "Segoe UI", Arial, sans-serif';
    wrapText(ctx, subtitle, 66, 244, 820, 44);
    ctx.fillStyle = "#d8b24c";
    ctx.font = '900 28px "Segoe UI", Arial, sans-serif';
    ctx.fillText("BRN PR WAR BOARD", 64, 450);
    const texture = new THREE.CanvasTexture(c);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    if (THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
    return texture;
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    words.forEach((word, index) => {
      const test = `${line}${word} `;
      if (ctx.measureText(test).width > maxWidth && index > 0) {
        ctx.fillText(line, x, y);
        line = `${word} `;
        y += lineHeight;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, x, y);
  }

  const floor = mesh(new THREE.PlaneGeometry(16, 10), materials.floor, [0, 0, 0], [-Math.PI / 2, 0, 0]);
  floor.receiveShadow = true;
  root.add(floor);

  const backWall = mesh(new THREE.PlaneGeometry(15.5, 5.6), materials.wall, [0, 2.8, -4.65]);
  root.add(backWall);

  for (let i = 0; i < 8; i += 1) {
    const x = -6.2 + i * 1.78;
    const rail = box([0.025, 5.35, 0.035], materials.metal, [x, 2.7, -4.58]);
    root.add(rail);
  }

  const ceilingStrip = box([9.4, 0.06, 0.06], materials.lightGold, [1.2, 5.12, -4.5]);
  const sideStrip = box([0.07, 2.7, 0.05], materials.lightOrange, [-4.6, 2.85, -4.45]);
  root.add(ceilingStrip, sideStrip);

  const wallBoard = new THREE.Group();
  wallBoard.position.set(1.35, 2.52, -4.22);
  wallBoard.rotation.y = -0.12;
  root.add(wallBoard);

  const boardGlass = box([5.55, 2.85, 0.07], materials.glass, [0, 0, 0]);
  boardGlass.castShadow = false;
  wallBoard.add(boardGlass);
  wallBoard.add(box([5.68, 0.08, 0.1], materials.gold, [0, 1.48, 0.03]));
  wallBoard.add(box([0.08, 2.92, 0.1], materials.gold, [-2.84, 0, 0.03]));

  const calendarTiles = [];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const colorIndex = (row * 7 + col) % 5;
      const material = colorIndex === 0 ? materials.orange : colorIndex === 1 ? materials.gold : colorIndex === 2 ? materials.teal : materials.purple;
      const tile = box([0.54, 0.28, 0.055], material, [-2.1 + col * 0.68, 0.92 - row * 0.43, 0.08]);
      tile.userData.phase = row * 0.52 + col * 0.23;
      wallBoard.add(tile);
      calendarTiles.push(tile);
    }
  }

  const todayTexture = makeLabelTexture("TODAY", "Calendar, field notes, shots and captions in one view", "#d8b24c");
  const todayPanel = mesh(
    new THREE.PlaneGeometry(2.7, 1.35),
    new THREE.MeshBasicMaterial({ map: todayTexture, transparent: true }),
    [-3.5, 2.72, -4.18],
    [0, 0.18, 0]
  );
  root.add(todayPanel);

  const promptTexture = makeLabelTexture("READY", "Turn daily municipal work into clear public content", "#ff781f");
  const promptPanel = mesh(
    new THREE.PlaneGeometry(2.2, 1.1),
    new THREE.MeshBasicMaterial({ map: promptTexture, transparent: true }),
    [4.55, 2.02, -3.45],
    [0, -0.42, 0]
  );
  root.add(promptPanel);

  const table = new THREE.Group();
  table.position.set(1.15, 0.38, -0.82);
  table.rotation.y = -0.14;
  root.add(table);
  table.add(box([5.25, 0.24, 1.75], materials.metal, [0, 0.42, 0]));
  table.add(box([5.1, 0.045, 1.55], materials.glass, [0, 0.58, 0]));
  table.add(box([4.8, 0.035, 0.04], materials.lightOrange, [0, 0.62, 0.78]));

  const monitorTexture = makeLabelTexture("ON AIR", "Facebook  LINE  YouTube", "#ff781f");
  const screenMat = new THREE.MeshBasicMaterial({ map: monitorTexture, transparent: true });
  const monitorA = mesh(new THREE.PlaneGeometry(1.35, 0.72), screenMat, [-0.95, 1.04, -0.22], [-0.2, 0.18, 0]);
  const monitorB = mesh(new THREE.PlaneGeometry(1.16, 0.62), screenMat, [0.78, 1.02, 0.05], [-0.22, -0.16, 0]);
  table.add(monitorA, monitorB);
  table.add(box([1.18, 0.035, 0.09], materials.metal, [-0.95, 0.66, -0.22]));
  table.add(box([1.02, 0.035, 0.09], materials.metal, [0.78, 0.66, 0.05]));

  const cameraRig = new THREE.Group();
  cameraRig.position.set(-3.15, 0.05, -0.65);
  cameraRig.rotation.y = 0.42;
  root.add(cameraRig);
  cameraRig.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.05, 16), materials.metal, [0, 0.55, 0]));
  cameraRig.add(mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.0, 16), materials.metal, [-0.35, 0.22, 0.18], [0.62, 0.18, 0.35]));
  cameraRig.add(mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.0, 16), materials.metal, [0.35, 0.22, 0.18], [0.62, -0.18, -0.35]));
  cameraRig.add(mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.0, 16), materials.metal, [0, 0.22, -0.38], [-0.72, 0, 0]));
  cameraRig.add(box([0.62, 0.34, 0.34], materials.purple, [0, 1.18, 0]));
  const lens = mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.34, 32), materials.metal, [0.38, 1.18, 0], [0, Math.PI / 2, 0]);
  cameraRig.add(lens);
  const lensGlass = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.035, 32), materials.glass, [0.56, 1.18, 0], [0, Math.PI / 2, 0]);
  lensGlass.castShadow = false;
  cameraRig.add(lensGlass);

  const floatingPanels = [];
  for (let i = 0; i < 4; i += 1) {
    const panel = box([1.15, 0.12, 0.035], i % 2 ? materials.gold : materials.orange, [-2.3 + i * 0.72, 1.45 + (i % 2) * 0.22, -2.35 + i * 0.05]);
    panel.userData.phase = i * 0.8;
    root.add(panel);
    floatingPanels.push(panel);
  }

  const clock = new THREE.Clock();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function animate() {
    const t = clock.getElapsedTime();
    const drift = Math.sin(t * 0.28) * 0.08;
    camera.position.x = 5.8 + drift;
    camera.position.y = 3.45 + Math.sin(t * 0.2) * 0.035;
    camera.lookAt(0.45 + Math.sin(t * 0.18) * 0.08, 1.55, -2.45);

    wallBoard.rotation.y = -0.12 + Math.sin(t * 0.35) * 0.018;
    todayPanel.position.y = 2.72 + Math.sin(t * 0.8) * 0.035;
    promptPanel.position.y = 2.02 + Math.cos(t * 0.75) * 0.035;
    rim.intensity = 3.2 + Math.sin(t * 1.4) * 0.45;
    wallGlow.intensity = 1.9 + Math.sin(t * 1.1) * 0.35;

    calendarTiles.forEach((tile) => {
      const pulse = (Math.sin(t * 1.75 + tile.userData.phase) + 1) * 0.5;
      tile.position.z = 0.08 + pulse * 0.025;
      tile.scale.y = 1 + pulse * 0.03;
      if (tile.material.emissive) tile.material.emissiveIntensity = 0.12 + pulse * 0.22;
    });

    floatingPanels.forEach((panel) => {
      panel.position.y += Math.sin(t * 1.2 + panel.userData.phase) * 0.0009;
      panel.rotation.y = Math.sin(t * 0.6 + panel.userData.phase) * 0.08;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener("resize", resize);

  document.addEventListener("brn:data", (event) => {
    const count = Math.min(calendarTiles.length, Math.max(4, (event.detail?.todayCount || 1) * 4));
    calendarTiles.forEach((tile, index) => {
      if (index < count) {
        tile.material = index % 3 === 0 ? materials.orange : index % 3 === 1 ? materials.gold : materials.teal;
      } else {
        tile.material = materials.purple;
      }
    });
  });
}
