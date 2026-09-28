document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('startModal');
  const btn = document.getElementById('startBtn');
  const music = document.getElementById('bgMusic');
  const soundBtn = document.getElementById('soundBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const galaxyUI = document.getElementById('galaxyUI');
  const pageLoader = document.getElementById('pageLoader');
  const loadingStartedAt = performance.now();
  let galaxyController = null;
  let galaxyReady = false;
  let pageReady = document.readyState === 'complete';

  function revealIntroWhenReady() {
    if (!galaxyReady || !pageReady) return;
    const wait = Math.max(0, 450 - (performance.now() - loadingStartedAt));
    setTimeout(function() {
      document.body.classList.remove('app-loading');
      // La portada termina de aparecer detrás del cargador antes de ocultarlo.
      // Así la galaxia no se alcanza a ver entre ambas pantallas.
      setTimeout(function() {
        pageLoader.classList.add('is-hidden');
        setTimeout(function() { pageLoader.remove(); }, 600);
      }, 350);
    }, wait);
  }

  if (!pageReady) {
    window.addEventListener('load', function() {
      pageReady = true;
      revealIntroWhenReady();
    }, { once:true });
  }

  if (music && soundBtn) {
    soundBtn.addEventListener('click', function() {
      music.muted = !music.muted;
      soundBtn.classList.toggle('is-muted', music.muted);
      soundBtn.setAttribute('aria-label', music.muted ? 'Activar música' : 'Silenciar música');
    });
  } else if (soundBtn) {
    soundBtn.style.display = 'none';
  }

  function updateFullscreenButton() {
    const isFullscreen = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    fullscreenBtn.classList.toggle('is-active', isFullscreen);
    fullscreenBtn.setAttribute('aria-label', isFullscreen ? 'Salir de pantalla completa' : 'Activar pantalla completa');
  }

  fullscreenBtn.addEventListener('click', function() {
    const page = document.documentElement;
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    try {
      const action = isFullscreen
        ? (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen())
        : (page.requestFullscreen ? page.requestFullscreen() : page.webkitRequestFullscreen());
      if (action && typeof action.catch === 'function') action.catch(function() {});
    } catch (_) {}
  });
  document.addEventListener('fullscreenchange', updateFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButton);

  btn.addEventListener('click', function() {
    btn.disabled = true;
    // Reproducir música (manejo de autoplay)
    if (music) {
      music.volume = 0.7;
      const playPromise = music.play();
      if (playPromise !== undefined) {
        playPromise.catch(()=>{});
      }
    }
    galaxyController.startCinematic();
    modal.classList.add('is-leaving');
    document.body.classList.add('galaxy-started');
    galaxyUI.setAttribute('aria-hidden', 'false');
  });

  // Construir la galaxia detrás de la pantalla de carga.
  requestAnimationFrame(function() {
    runGalaxy({
      onReady: function(controller) {
        galaxyController = controller;
        galaxyReady = true;
        revealIntroWhenReady();
      }
    });
  });

  function runGalaxy(opts={}){
    const err = document.getElementById('err');
    function showError(msg){ err.textContent = msg; err.style.display='block'; }
    let readyDelivered = false;
    function deliverReady(controller) {
      if (readyDelivered) return;
      readyDelivered = true;
      if(typeof opts.onReady === 'function') opts.onReady(controller);
    }

    // ====== WEBGL CHECK ======
    try { 
      const test = document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl');
      if(!test) throw new Error('Tu navegador no tiene WebGL activo');
    } catch(e) {
      showError('WebGL parece desactivado. Prueba con Chrome/Edge/Firefox, o habilita aceleración por hardware.');
      deliverReady({ startCinematic:function(){} });
      return;
    }

    // ====== THREE.JS GALAXY ======
    try {
      // ...existing code...
      // (todo el código de la galaxia va aquí, igual que antes)
      // ...existing code...
      // (copiado del bloque try original)

      // Setup
      const canvas = document.getElementById('galaxy-canvas');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false });
      const maxPixelRatio = window.innerWidth < 700 ? 1.5 : 1.75;
      renderer.setPixelRatio(Math.min(maxPixelRatio, window.devicePixelRatio||1));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;

      const scene = new THREE.Scene();
      let backgroundReady = false;
      const loadingManager = new THREE.LoadingManager();
      loadingManager.onLoad = function() {
        requestAnimationFrame(function(){ deliverReady(galaxyApi); });
      };
      // Forzar que el cargador nunca se quede colgado
      setTimeout(function() { deliverReady(galaxyApi); }, 300);

      const spaceBackgroundLoader = new THREE.CubeTextureLoader(loadingManager);
      spaceBackgroundLoader.load(window.ROMANTIC_SPACE_BG_FACES,function(spaceBackground){
        spaceBackground.encoding = THREE.sRGBEncoding;
        scene.background = spaceBackground;
        backgroundReady = true;
        cinematicStart = null;
        deliverReady(galaxyApi);
      }, undefined, function(){
        backgroundReady = true;
        deliverReady(galaxyApi);
      });
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.06;
  controls.minDistance = 10; controls.maxDistance = 220;
  controls.target.set(0,0,0);

  // Cinematic animation state
  let cinematicState = null;
  let cinematicStart = null;
  let cinematicDuration1 = 2.2; // acercamiento inicial
  let cinematicDuration2 = 3.5; // giro alrededor de la galaxia
  let cinematicDuration3 = 2.2; // alejamiento final
  let cinematicTotal = cinematicDuration1 + cinematicDuration2 + cinematicDuration3;
  const galaxyApi = {
    startCinematic: function() {
      cinematicState = 0;
      cinematicStart = null;
      controls.enabled = false;
    }
  };

      function setCam(){
        const w = window.innerWidth, h = window.innerHeight;
        const isMobile = w < 768 || w < h;
        camera.fov = isMobile ? 90 : 75;
        camera.position.set(0, isMobile? 26 : 22, isMobile? 110 : 75);
        camera.updateProjectionMatrix(); controls.update();
      }
      setCam();

      function resizeGalaxy(){
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(maxPixelRatio, window.devicePixelRatio || 1));
        renderer.setSize(width, height, false);
      }
      addEventListener('resize', resizeGalaxy);

      renderer.setClearColor(0x030106, 1);

      const explosions = [];
      function spawnExplosion() {
        const geo = new THREE.PlaneGeometry(60, 60);
        const c = document.createElement('canvas');
        c.width = c.height = 256;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(128,128,10,128,128,128);
        grad.addColorStop(0, 'rgba(255,255,200,0.85)');
        grad.addColorStop(0.2, 'rgba(255,220,120,0.45)');
        grad.addColorStop(0.5, 'rgba(255,180,255,0.18)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.fillRect(0,0,256,256);
        const tex = new THREE.CanvasTexture(c);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        const mesh = new THREE.Mesh(geo, mat);
        const angle = Math.random() * Math.PI * 2;
        const dist = 70 + Math.random() * 60;
        mesh.position.set(Math.cos(angle)*dist, (Math.random()-0.5)*40, Math.sin(angle)*dist);
        mesh.lookAt(0,0,0);
        mesh.material.opacity = 0.85;
        mesh.userData.life = 1.0;
        explosions.push(mesh);
        scene.add(mesh);
      }

      setInterval(()=>{
        if(Math.random()<0.85) spawnExplosion();
      }, 700);

      const galaxy = new THREE.Group(); scene.add(galaxy);
      const CFG = window.GALAXIA_INFINITA_DATA || {};
      const phrases = (Array.isArray(CFG.phrases) && CFG.phrases.length)
        ? CFG.phrases
        : ["Mi vida ", "Eres mi todo", "Mi Sol ☀️", "Mi corazón", "Mi Cielito 🌌", "Mi Tesoro 💎", "Mi Mundo", "Mi Todo", "Mi Amor", "Mi Universo", "Mi cielo", "Mi Luz 🌠", "Te amo!!!", "Mi Paz", "Quiero estar contigo siempre", "Mi Sueño", "Mi Pensamiento Favorito", "Mi Bombón", "Universo mio", "Te Admiro", "Te Quiero Mucho", "Eres especial en mi vida", "Eres lo que mas amo", "Eres Increíble", "Te Amo Infinitamente ♾️"];
      const phraseEmojis = ["💖", "🌟", "✨", "💫", "💘", "🌙", "❤️", "💝", "😍", "🥰", "💞", "🫶", "🌹", "💗", "🥹", "💐", "💎", "🤍", "💓", "💕", "🪐", "🌈", "💜", "⭐", "🔥"];
      const decoratedPhrases = phrases.map((phrase, index) => `${phrase.trim()} ${phraseEmojis[index % phraseEmojis.length]}`);
      const isCompactDevice = window.innerWidth < 700;
      const arms = 5, radius = 82, maxH = 22;
      const imageProxy = (url) => url;
      const ringImgs = (Array.isArray(CFG.ringImages) && CFG.ringImages.length)
        ? CFG.ringImages.slice()
        : [];
      const photoOrbit = new THREE.Group();
      photoOrbit.renderOrder = 0;
      galaxy.add(photoOrbit); // Dispersas junto con la galaxia 3D
      const textTextureCache = new Map();
      const imageTextureCache = new Map();
      const phraseColors = [
        ['#ff79b7', '#ffd1e6'],
        ['#77d9ff', '#d8f5ff'],
        ['#b997ff', '#eee5ff'],
        ['#ffd166', '#fff1b8'],
        ['#72f1b8', '#d9ffef'],
        ['#ff8a7a', '#ffd8d1']
      ];
      function makeTextTexture(text, colorIndex=0){
        const colors=phraseColors[colorIndex%phraseColors.length];
        const cacheKey=text+'|'+colorIndex;
        if(textTextureCache.has(cacheKey)) return textTextureCache.get(cacheKey);
        const c=document.createElement('canvas'); c.width=1280; c.height=240;
        const g=c.getContext('2d'); g.clearRect(0,0,c.width,c.height);
        const size=Math.max(60,Math.min(94,1900/text.length));
        g.font='700 '+size+'px "Cormorant Garamond",Georgia,serif';
        g.textAlign='center'; g.textBaseline='middle';
        g.lineJoin='round';
        g.shadowColor=colors[0]; g.shadowBlur=28;
        g.strokeStyle='rgba(5,1,12,.9)'; g.lineWidth=7;
        g.strokeText(text,c.width/2,c.height/2);
        const textGradient=g.createLinearGradient(250,0,1030,0);
        textGradient.addColorStop(0,colors[0]);
        textGradient.addColorStop(1,colors[1]);
        g.fillStyle=textGradient; g.fillText(text,c.width/2,c.height/2);
        g.shadowBlur=0;
        g.strokeStyle='rgba(255,255,255,.38)'; g.lineWidth=1.5;
        g.strokeText(text,c.width/2,c.height/2);
        const texture = new THREE.CanvasTexture(c);
        texture.encoding = THREE.sRGBEncoding;
        textTextureCache.set(cacheKey,texture);
        return texture;
      }
      function drawRoundRectHelper(cContext, x, y, w, h, r) {
        cContext.beginPath();
        cContext.moveTo(x + r, y);
        cContext.arcTo(x + w, y, x + w, y + h, r);
        cContext.arcTo(x + w, y + h, x, y + h, r);
        cContext.arcTo(x, y + h, x, y, r);
        cContext.arcTo(x, y, x + w, y, r);
        cContext.closePath();
      }

      // CARGAR LAS IMÁGENES .JPG DE LOS PERSONAJES DISPERSAS EN LA GALAXIA 3D
      const charList = (window.DEMON_SLAYER_CHARACTERS && window.DEMON_SLAYER_CHARACTERS.length)
        ? window.DEMON_SLAYER_CHARACTERS
        : [];
      
      const totalCardsToScatter = charList.length * 2; // 26 fotos dispersas por todo el universo
      for (let k = 0; k < totalCardsToScatter; k++) {
        const charItem = charList[k % charList.length];
        const armIndex = k % arms;
        const progress = k / totalCardsToScatter;
        
        // Radio disperso desde 24 hasta 84 unidades en los brazos de la galaxia
        const dist = 24 + progress * 60 + (Math.random() - 0.5) * 8;
        // Ángulo espiral disperso alrededor del universo
        const angle = armIndex * (Math.PI * 2 / arms) + progress * Math.PI * 2.5 + (Math.random() - 0.5) * 0.15;
        
        const cardX = Math.cos(angle) * dist;
        const cardZ = Math.sin(angle) * dist;
        // Altura Y dispersa por arriba y abajo en el espacio (-13 a +13)
        const cardY = (Math.random() - 0.5) * 26;

        // Cargar imagen de forma 100% segura y crear el Sprite SOLO cuando la textura esté lista
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = function() {
          const tex = new THREE.Texture(img);
          tex.encoding = THREE.sRGBEncoding;
          tex.needsUpdate = true;
          
          const sprMat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity: 0.98,
            depthWrite: false,
            depthTest: true
          });
          const spr = new THREE.Sprite(sprMat);
          spr.position.set(cardX, cardY, cardZ);

          const aspect = (img.width || 1) / (img.height || 1);
          const baseScale = isCompactDevice ? 8.0 : 10.5;
          if (aspect >= 1) {
            spr.scale.set(baseScale, baseScale / aspect, 1);
          } else {
            spr.scale.set(baseScale * aspect, baseScale, 1);
          }

          spr.renderOrder = 20;
          spr.userData = {
            isCharacter: true,
            charData: charItem,
            jpgTexture: tex,
            origScaleX: spr.scale.x,
            origScaleY: spr.scale.y,
            isPng: false
          };

          // Preload PNG texture for 3D sprite swap on click
          if (charItem.png) {
            const pngImg = new window.Image();
            pngImg.crossOrigin = "anonymous";
            pngImg.onload = function() {
              const pngTex = new THREE.Texture(pngImg);
              pngTex.encoding = THREE.sRGBEncoding;
              pngTex.needsUpdate = true;
              spr.userData.pngTexture = pngTex;
            };
            pngImg.src = charItem.png;
          }

          photoOrbit.add(spr);
        };
        img.src = charItem.jpg;
      }

      // FRASES 3D EN LOS BRAZOS DE LA GALAXIA
      const totalSprites = 40;
      for(let i=0;i<totalSprites;i++){
        const armIndex=i%arms;
        const step=Math.floor(i/arms);
        const stepsPerArm=Math.ceil(totalSprites/arms);
        const progress=step/Math.max(1,stepsPerArm-1);
        const dist=48+progress*62+(Math.random()-0.5)*5;
        const angle=armIndex*(Math.PI*2/arms)+progress*Math.PI*2.05+(Math.random()-0.5)*.09;
        const x=Math.cos(angle)*dist;
        const z=Math.sin(angle)*dist;
        const y=(Math.random()-.5)*(2.6+3*(1-progress));
        const text = decoratedPhrases[i%decoratedPhrases.length];
        const phraseIndex=i%decoratedPhrases.length;
        const tex=makeTextTexture(text,phraseIndex);
        const spr=new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, transparent:true, opacity:1, depthWrite:false, depthTest:true }));
        spr.isPhrase=true;
        spr.renderOrder=10;
        spr.position.set(x,y+2.2,z); spr.scale.set(isCompactDevice?30:36,isCompactDevice?5.625:6.75,1); galaxy.add(spr);
      }
      // Galaxia rosa: núcleo denso, cinco brazos, cúmulos y polvo exterior.
      function makeParticleTexture(){
        const particleCanvas = document.createElement('canvas');
        particleCanvas.width = particleCanvas.height = 64;
        const particleContext = particleCanvas.getContext('2d');
        const particleGlow = particleContext.createRadialGradient(32,32,0,32,32,32);
        particleGlow.addColorStop(0, 'rgba(255,255,255,1)');
        particleGlow.addColorStop(.16, 'rgba(255,238,248,.98)');
        particleGlow.addColorStop(.42, 'rgba(255,104,174,.62)');
        particleGlow.addColorStop(1, 'rgba(255,30,120,0)');
        particleContext.fillStyle = particleGlow;
        particleContext.fillRect(0,0,64,64);
        return new THREE.CanvasTexture(particleCanvas);
      }

      const particleTexture = makeParticleTexture();
      const starCount = isCompactDevice ? 20000 : 40000;
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const coreColor = new THREE.Color('#fff8fc');
      const armColor = new THREE.Color('#ff2f92');
      const edgeColor = new THREE.Color('#8f3cff');
      const mixedColor = new THREE.Color();
      const galaxyRadius = 96;

      function centeredRandom(){
        return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      }

      for(let i=0;i<starCount;i++){
        const index = i * 3;
        const radialProgress = Math.pow(Math.random(), 1.72);
        const dist = radialProgress * galaxyRadius;
        const armIndex = i % arms;
        const armAngle = armIndex / arms * Math.PI * 2;
        const spiral = dist * 0.082;
        const spread = (0.16 + radialProgress * 0.52) * centeredRandom();
        const angle = armAngle + spiral + spread;
        const radialNoise = centeredRandom() * (1.2 + radialProgress * 5.5);
        const finalRadius = Math.max(0, dist + radialNoise);
        const verticalThickness = 4.8 * Math.pow(1-radialProgress,.75) + .45;

        pos[index] = Math.cos(angle) * finalRadius;
        pos[index+1] = centeredRandom() * verticalThickness;
        pos[index+2] = Math.sin(angle) * finalRadius;

        if(radialProgress < .2){
          mixedColor.copy(coreColor).lerp(armColor, radialProgress / .2);
        } else {
          mixedColor.copy(armColor).lerp(edgeColor, (radialProgress-.2) / .8);
        }
        const sparkle = Math.random();
        if(sparkle > .965) mixedColor.lerp(coreColor, .82);
        else mixedColor.offsetHSL(centeredRandom()*.018, centeredRandom()*.06, centeredRandom()*.08);
        colors[index] = mixedColor.r;
        colors[index+1] = mixedColor.g;
        colors[index+2] = mixedColor.b;
      }

      geom.setAttribute('position', new THREE.BufferAttribute(pos,3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors,3));
      const starMaterial = new THREE.PointsMaterial({
        map: particleTexture,
        size: isCompactDevice ? .9 : .76,
        vertexColors: true,
        transparent: true,
        opacity: .96,
        depthWrite: false,
        alphaTest: .015,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
      });
      const spiralParticles = new THREE.Points(geom, starMaterial);
      galaxy.add(spiralParticles);

      // Polvo luminoso entre los brazos para dar una apariencia más densa.
      const dustCount = isCompactDevice ? 4200 : 7800;
      const dustGeometry = new THREE.BufferGeometry();
      const dustPositions = new Float32Array(dustCount*3);
      for(let i=0;i<dustCount;i++){
        const index=i*3;
        const dist=Math.sqrt(Math.random())*galaxyRadius*1.13;
        const angle=Math.random()*Math.PI*2;
        dustPositions[index]=Math.cos(angle)*dist;
        dustPositions[index+1]=centeredRandom()*(1.5+5*(1-dist/(galaxyRadius*1.13)));
        dustPositions[index+2]=Math.sin(angle)*dist;
      }
      dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
      galaxy.add(new THREE.Points(dustGeometry,new THREE.PointsMaterial({
        map:particleTexture,
        color:0xff89bd,
        size:.3,
        transparent:true,
        opacity:.4,
        depthWrite:false,
        blending:THREE.AdditiveBlending
      })));
      const coreR = 18;
      const coreTexCanvas = document.createElement('canvas');
      coreTexCanvas.width = coreTexCanvas.height = 256;
      const cg = coreTexCanvas.getContext('2d');
      const grd = cg.createRadialGradient(128,128,10,128,128,128);
      grd.addColorStop(0, '#3a7cff');
      grd.addColorStop(0.5, '#0a2a6b');
      grd.addColorStop(1, '#000a2a');
      cg.fillStyle = grd;
      cg.beginPath();
      cg.arc(128,128,128,0,Math.PI*2);
      cg.fill();
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(coreR,48,48),
        new THREE.MeshPhongMaterial({
          map:new THREE.CanvasTexture(coreTexCanvas),
          shininess:60,
          specular:0xff9ad8
        })
      );
      core.renderOrder = 1;
      scene.add(core);
      const light = new THREE.PointLight(0xff77c8, 1.2, 200);
      light.position.set(0, 30, 60);
      scene.add(light);
      const textGroup = new THREE.Group();
      scene.add(textGroup);
      let titleMesh=null;
      const textLoader = new THREE.FontLoader(loadingManager);
      textLoader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/optimer_regular.typeface.json',function(font){
        const titleGeometry=new THREE.TextGeometry(CFG.title3d || 'Te amo',{
          font,
          size:isCompactDevice?5.2:6.2,
          height:1.35,
          curveSegments:16,
          bevelEnabled:true,
          bevelThickness:.28,
          bevelSize:.14,
          bevelOffset:0,
          bevelSegments:6
        });
        titleGeometry.computeBoundingBox();
        const bounds=titleGeometry.boundingBox;
        titleGeometry.translate(
          -(bounds.max.x-bounds.min.x)/2-bounds.min.x,
          -(bounds.max.y-bounds.min.y)/2-bounds.min.y,
          -(bounds.max.z-bounds.min.z)/2-bounds.min.z
        );
        const titleFrontMaterial=new THREE.MeshPhongMaterial({
          color:0xffd6e8,
          emissive:0x8f174f,
          shininess:150,
          specular:0xffffff
        });
        const titleSideMaterial=new THREE.MeshPhongMaterial({
          color:0xb51f69,
          emissive:0x3f0929,
          shininess:95,
          specular:0xff9fc8
        });
        titleMesh=new THREE.Mesh(titleGeometry,[titleFrontMaterial,titleSideMaterial]);
        titleMesh.position.set(0,isCompactDevice?24:22,2);
        titleMesh.rotation.x=-.1;
        titleMesh.renderOrder=2;
        textGroup.add(titleMesh);

        const titleLight=new THREE.PointLight(0xff8fbd,1.1,75);
        titleLight.position.set(0,isCompactDevice?24:22,20);
        scene.add(titleLight);
      });
      let saturnWrap = null;
      const loader = new THREE.TextureLoader(loadingManager);
      loader.load((CFG.assetBase || '') + 'planet-heart-texture.webp', function(tex) {
        const sourceImage = tex.image;
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = sourceImage.width;
        maskCanvas.height = sourceImage.height;
        const maskContext = maskCanvas.getContext('2d');
        maskContext.drawImage(sourceImage,0,0);
        const imageData=maskContext.getImageData(0,0,maskCanvas.width,maskCanvas.height);
        const pixels=imageData.data;
        for(let i=0;i<pixels.length;i+=4){
          const red=pixels[i];
          const green=pixels[i+1];
          const blue=pixels[i+2];
          if(red>242&&green>235&&blue>232) pixels[i+3]=0;
        }
        maskContext.putImageData(imageData,0,0);
        const maskedTexture = new THREE.CanvasTexture(maskCanvas);
        maskedTexture.encoding = THREE.sRGBEncoding;
        maskedTexture.needsUpdate = true;
        core.material = new THREE.MeshBasicMaterial({
          map: maskedTexture,
          transparent: true,
          alphaTest:.02,
          side:THREE.DoubleSide
        });
        core.material.needsUpdate = true;
        if (saturnWrap) {
          saturnWrap.visible = false;
        }
      });
      function animate(){
        requestAnimationFrame(animate);
        if(!backgroundReady) return;
        const t = performance.now()*0.001;
        // Cinematic animation
        if (cinematicState !== null) {
          if (cinematicStart === null) cinematicStart = t;
          const elapsed = t - cinematicStart;
          if (elapsed < cinematicDuration1) {
            // Zoom in desde lejos al centro (no tan cerca)
            const prog = elapsed / cinematicDuration1;
            camera.position.lerpVectors(
              new THREE.Vector3(0, 0, 220), // inicio lejos
              new THREE.Vector3(0, 18, 38),  // más lejos y arriba
              prog
            );
            camera.lookAt(0,0,0);
            controls.enabled = false;
          } else if (elapsed < cinematicDuration1 + cinematicDuration2) {
            // Giro alrededor
            const prog = (elapsed-cinematicDuration1) / cinematicDuration2;
            const angle = Math.PI/2 + prog * Math.PI * 2 * 0.20;
            const radius = 38;
            const y = 18;
            camera.position.x = Math.cos(angle) * radius;
            camera.position.y = y;
            camera.position.z = Math.sin(angle) * radius;
            camera.lookAt(0,0,0);
            controls.enabled = false;
          } else if (elapsed < cinematicTotal) {
            // Zoom final alejándose al máximo y subiendo la cámara
            const prog = (elapsed - cinematicDuration1 - cinematicDuration2) / cinematicDuration3;
            const startAngle = Math.PI/2 + Math.PI * 2 * 0.85;
            const startRadius = 38;
            const endRadius = 120; // lo más lejos posible
            const startY = 18;
            const endY = 50; // vista elevada
            camera.position.x = Math.cos(startAngle) * (startRadius + (endRadius-startRadius)*prog);
            camera.position.y = startY + (endY-startY)*prog;
            camera.position.z = Math.sin(startAngle) * (startRadius + (endRadius-startRadius)*prog);
            camera.lookAt(0,0,0);
            controls.enabled = false;
          } else {
            // Fin de la animación, dejar la cámara en la posición final elevada y activar controles
            controls.enabled = true;
            cinematicState = null;
            // No llamar a setCam, mantener la posición final
          }
        }
        galaxy.rotation.y = t * 0.05;
        core.rotation.y = t * 0.12;
        photoOrbit.rotation.y = t * 0.05;
        if(titleMesh){
          titleMesh.lookAt(camera.position);
          titleMesh.rotateY(Math.sin(t*.65)*.08);
        }
        if(saturnWrap && saturnWrap.visible){
          saturnWrap.rotation.y = t * 0.12;
        }
        for(let i=explosions.length-1;i>=0;i--){
          const e = explosions[i];
          e.material.opacity *= 0.94;
          e.userData.life -= 0.018;
          if(e.userData.life<=0.05){
            scene.remove(e);
            e.geometry.dispose();
            e.material.map.dispose();
            e.material.dispose();
            explosions.splice(i,1);
          }
        }
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      // ====== RAYCASTING FOR 3D CLICK ON ROTATING CHARACTER JPGs ======
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let pointerDownCoords = { x: 0, y: 0 };

      window.addEventListener('pointerdown', function(e) {
        pointerDownCoords = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('pointerup', function(e) {
        const moveDist = Math.hypot(e.clientX - pointerDownCoords.x, e.clientY - pointerDownCoords.y);
        if (moveDist < 12) { // Drag vs click threshold
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(photoOrbit.children, true);

          if (intersects.length > 0) {
            const hitSprite = intersects[0].object;
            if (hitSprite.userData && hitSprite.userData.charData) {
              const cData = hitSprite.userData.charData;
              
              // 3D Texture swap between JPG and PNG on the 3D galaxy sprite!
              if (hitSprite.userData.isPng) {
                if (hitSprite.userData.jpgTexture) {
                  hitSprite.material.map = hitSprite.userData.jpgTexture;
                  hitSprite.material.needsUpdate = true;
                }
                hitSprite.userData.isPng = false;
              } else if (hitSprite.userData.pngTexture) {
                hitSprite.material.map = hitSprite.userData.pngTexture;
                hitSprite.material.needsUpdate = true;
                hitSprite.userData.isPng = true;
                
                const origX = hitSprite.userData.origScaleX || 10;
                const origY = hitSprite.userData.origScaleY || 10;
                hitSprite.scale.set(origX * 1.35, origY * 1.35, 1);
                setTimeout(() => {
                  hitSprite.scale.set(origX * 1.15, origY * 1.15, 1);
                }, 350);
              }

              if (typeof window.showCharMsg === 'function') {
                window.showCharMsg(cData.title, cData.msg, cData.png, cData.jpg);
              }
            }
          }
        }
      });

      // ====== HEARTS OVERLAY (double tap/click) ======
      const fx = document.getElementById('fx');
      const ctx2 = fx.getContext('2d');
      function resizeFx(){
        fx.width = Math.floor(innerWidth * Math.min(2, window.devicePixelRatio||1));
        fx.height = Math.floor(innerHeight * Math.min(2, window.devicePixelRatio||1));
        fx.style.width = innerWidth + 'px';
        fx.style.height = innerHeight + 'px';
      }
      addEventListener('resize', resizeFx); resizeFx();
      const DPR = Math.min(2, window.devicePixelRatio || 1);
      const hearts = [];
      const loveRings = [];
      const effectColors = ['#ff5ca8','#ff91c8','#ffd166','#7de2ff','#b99cff','#7ef2bd','#ffffff'];
      function spawnHearts(x,y,n=34){
        x *= DPR; y *= DPR;
        loveRings.push({x,y,radius:8*DPR,life:1,color:effectColors[Math.floor(Math.random()*effectColors.length)]});
        for(let i=0;i<n;i++){
          const a=(i/n)*Math.PI*2+(Math.random()-.5)*.3;
          const speed=(1.4+Math.random()*3)*DPR;
          const type=i%5===0?'star':i%3===0?'spark':'heart';
          hearts.push({
            x,y,
            vx:Math.cos(a)*speed,
            vy:Math.sin(a)*speed-1.1*DPR,
            life:1,
            decay:.012+Math.random()*.008,
            size:(7+Math.random()*13)*DPR,
            color:effectColors[i%effectColors.length],
            type,
            rotation:Math.random()*Math.PI,
            spin:(Math.random()-.5)*.12
          });
        }
      }
      function drawHeart(x,y,size,color,rotation){
        const s=size; ctx2.save(); ctx2.translate(x,y); ctx2.rotate(rotation);
        ctx2.beginPath(); ctx2.moveTo(0,-0.25*s);
        ctx2.bezierCurveTo(.5*s,-.9*s,1.4*s,-.1*s,0,.9*s);
        ctx2.bezierCurveTo(-1.4*s,-.1*s,-.5*s,-.9*s,0,-.25*s);
        ctx2.shadowColor=color; ctx2.shadowBlur=15*DPR;
        ctx2.fillStyle=color; ctx2.fill(); ctx2.restore();
      }
      function drawStar(x,y,size,color,rotation,points=5){
        ctx2.save(); ctx2.translate(x,y); ctx2.rotate(rotation); ctx2.beginPath();
        for(let i=0;i<points*2;i++){
          const radius=i%2===0?size:size*.38;
          const angle=-Math.PI/2+i*Math.PI/points;
          const px=Math.cos(angle)*radius,py=Math.sin(angle)*radius;
          if(i===0) ctx2.moveTo(px,py); else ctx2.lineTo(px,py);
        }
        ctx2.closePath(); ctx2.shadowColor=color; ctx2.shadowBlur=18*DPR;
        ctx2.fillStyle=color; ctx2.fill(); ctx2.restore();
      }
      function drawSpark(x,y,size,color,rotation){
        drawStar(x,y,size,color,rotation,4);
      }
      let lastTap={time:0,x:0,y:0};
      addEventListener('pointerup', (e)=>{
        const now=performance.now();
        const distance=Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y);
        if(now-lastTap.time<360&&distance<55){
          spawnHearts(e.clientX,e.clientY);
          lastTap.time=0;
        } else {
          lastTap={time:now,x:e.clientX,y:e.clientY};
        }
      }, {passive:true});
      function loopFx(){
        ctx2.clearRect(0,0,fx.width,fx.height);
        for(let i=loveRings.length-1;i>=0;i--){
          const ring=loveRings[i]; ring.radius+=5*DPR; ring.life-=.035;
          ctx2.globalAlpha=Math.max(0,ring.life);
          ctx2.beginPath(); ctx2.arc(ring.x,ring.y,ring.radius,0,Math.PI*2);
          ctx2.strokeStyle=ring.color; ctx2.lineWidth=3*DPR*ring.life;
          ctx2.shadowColor=ring.color; ctx2.shadowBlur=18*DPR; ctx2.stroke();
          ctx2.shadowBlur=0; ctx2.globalAlpha=1;
          if(ring.life<=0) loveRings.splice(i,1);
        }
        for(let i=hearts.length-1;i>=0;i--){
          const h=hearts[i];
          h.x+=h.vx; h.y+=h.vy; h.vx*=.985; h.vy=h.vy*.985+.025*DPR;
          h.rotation+=h.spin; h.life-=h.decay;
          const drawSize=h.size*(.65+h.life*.45);
          ctx2.globalAlpha=Math.max(0,h.life);
          if(h.type==='star') drawStar(h.x,h.y,drawSize,h.color,h.rotation);
          else if(h.type==='spark') drawSpark(h.x,h.y,drawSize,h.color,h.rotation);
          else drawHeart(h.x,h.y,drawSize,h.color,h.rotation);
          ctx2.globalAlpha=1;
          if(h.life<=0) hearts.splice(i,1);
        }
        requestAnimationFrame(loopFx);
      } loopFx();
    } catch(e) {
      showError('Error cargando la galaxia: '+e.message);
      console.error(e);
      deliverReady({ startCinematic:function(){} });
    }
  }
});
