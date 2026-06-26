(function () {
  const canvas = document.querySelector(".motion-demo-canvas");
  const hero = document.querySelector(".motion-demo-hero");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionOff = new URLSearchParams(window.location.search).get("motion") === "off";

  if (!canvas || !hero) {
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: false });
  const image = new Image();
  image.decoding = "async";
  image.src = canvas.dataset.src;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let cover = { sx: 0, sy: 0, sw: 1, sh: 1, dx: 0, dy: 0, dw: 1, dh: 1 };
  let frameId = 0;
  let frames = 0;

  function random(seed) {
    let state = seed >>> 0;
    return function next() {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  const nextRandom = random(2026062602);
  const mistCells = Array.from({ length: 22 }, () => ({
    x: nextRandom(),
    y: 0.12 + nextRandom() * 0.48,
    rx: 0.12 + nextRandom() * 0.22,
    ry: 0.025 + nextRandom() * 0.055,
    speed: 0.0015 + nextRandom() * 0.0025,
    alpha: 0.018 + nextRandom() * 0.035,
    phase: nextRandom() * Math.PI * 2
  }));

  function resize() {
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    calculateCover();
  }

  function calculateCover() {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = width / height;

    if (!image.naturalWidth || !image.naturalHeight) {
      return;
    }

    if (imageRatio > canvasRatio) {
      const sw = image.naturalHeight * canvasRatio;
      cover = {
        sx: (image.naturalWidth - sw) / 2,
        sy: 0,
        sw,
        sh: image.naturalHeight,
        dx: 0,
        dy: 0,
        dw: width,
        dh: height
      };
    } else {
      const sh = image.naturalWidth / canvasRatio;
      cover = {
        sx: 0,
        sy: (image.naturalHeight - sh) / 2,
        sw: image.naturalWidth,
        sh,
        dx: 0,
        dy: 0,
        dw: width,
        dh: height
      };
    }
  }

  function canvasYToSource(y) {
    return cover.sy + (y / height) * cover.sh;
  }

  function drawBase() {
    ctx.drawImage(image, cover.sx, cover.sy, cover.sw, cover.sh, cover.dx, cover.dy, cover.dw, cover.dh);
  }

  function drawWater(time) {
    const waterTop = Math.floor(height * 0.53);
    const waterBottom = height;
    const strip = 3;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, waterTop, width, waterBottom - waterTop);
    ctx.clip();
    ctx.globalAlpha = 0.72;

    for (let y = waterTop; y < waterBottom; y += strip) {
      const depth = (y - waterTop) / (waterBottom - waterTop);
      const sourceY = canvasYToSource(y);
      const sourceH = (strip / height) * cover.sh;
      const wave =
        Math.sin(y * 0.035 + time * 0.75) * (1.2 + depth * 4.8) +
        Math.sin(y * 0.011 - time * 0.42) * (0.6 + depth * 2.4);
      const shimmer = Math.sin(time * 0.35 + y * 0.018) * 0.7;
      const dx = wave + shimmer;

      ctx.drawImage(
        image,
        cover.sx,
        sourceY,
        cover.sw,
        sourceH,
        dx - 7,
        y,
        width + 14,
        strip + 1
      );
    }

    const reflection = ctx.createLinearGradient(0, waterTop, 0, waterBottom);
    reflection.addColorStop(0, "rgba(255,255,255,0)");
    reflection.addColorStop(0.36, "rgba(210,235,231,0.025)");
    reflection.addColorStop(0.7, "rgba(177,214,213,0.045)");
    reflection.addColorStop(1, "rgba(9,25,26,0.035)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = reflection;
    ctx.fillRect(0, waterTop, width, waterBottom - waterTop);
    ctx.restore();
  }

  function drawMist(time) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    mistCells.forEach((cell) => {
      const x = ((cell.x + time * cell.speed) % 1.2 - 0.1) * width;
      const y = cell.y * height + Math.sin(time * 0.08 + cell.phase) * 7;
      const rx = cell.rx * width;
      const ry = cell.ry * height;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, rx);

      gradient.addColorStop(0, `rgba(234, 246, 243, ${cell.alpha})`);
      gradient.addColorStop(0.5, `rgba(197, 224, 221, ${cell.alpha * 0.55})`);
      gradient.addColorStop(1, "rgba(234, 246, 243, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function render(timestamp) {
    const time = timestamp / 1000;
    drawBase();

    if (!reduceMotion && !motionOff) {
      drawWater(time);
      drawMist(time);
      frames += 1;
      canvas.dataset.frames = String(frames);
      canvas.dataset.lastTime = time.toFixed(3);
    }

    frameId = window.requestAnimationFrame(render);
  }

  image.addEventListener("load", () => {
    resize();
    render(0);
  });

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(frameId);
  }, { once: true });
})();
