import { useEffect, useRef } from 'react';

/**
 * CanvasScrollSequence
 *
 * Full-screen sticky HTML5 Canvas that stays pinned while the user scrolls.
 * Driven strictly by scroll progress through the parent container.
 *
 * Performance Optimizations:
 * - Preloads frames without triggering component re-renders (zero React state overhead)
 * - Cached gradient fills (computed once per resize, not 60 times a second)
 * - Only redraws when the rounded frame integer actually changes
 * - Idle detection stops rAF loop when scrolling settles (zero idle CPU/GPU burn)
 * - GPU composite layer promotion with translate3d and will-change
 * - Full prefers-reduced-motion support
 */
export default function CanvasScrollSequence({
  containerRef,
  totalFrames = 50,
  framePrefix = '/frames/ezgif-frame-',
  frameSuffix = '.png',
}) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const lastDrawnIntRef = useRef(-1);
  const animationFrameIdRef = useRef(null);
  const isRunningLoopRef = useRef(false);

  // Cached gradients
  const cachedRadialRef = useRef(null);
  const cachedBottomFadeRef = useRef(null);

  // Progressive preloader without React re-renders
  useEffect(() => {
    let isCancelled = false;
    const images = [];
    let initialDrawn = false;

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, '0');
      img.src = `${framePrefix}${paddedIndex}${frameSuffix}`;

      img.onload = () => {
        if (isCancelled) return;
        // Draw the very first frame as soon as frame 1 (or any initial frame) loads
        if (!initialDrawn && (i === 1 || i === Math.round(currentFrameRef.current))) {
          initialDrawn = true;
          renderFrame(i);
        }
      };
      images.push(img);
    }

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, [totalFrames, framePrefix, frameSuffix]);

  // Update cached canvas gradients upon resize
  const updateGradients = (ctx, cw, ch) => {
    if (!ctx || cw === 0 || ch === 0) return;

    const radial = ctx.createRadialGradient(
      cw * 0.5,
      ch * 0.45,
      Math.min(cw, ch) * 0.2,
      cw * 0.5,
      ch * 0.5,
      Math.max(cw, ch) * 0.75
    );
    radial.addColorStop(0, 'rgba(6, 4, 10, 0.05)');
    radial.addColorStop(0.5, 'rgba(12, 9, 20, 0.35)');
    radial.addColorStop(0.85, 'rgba(6, 4, 10, 0.85)');
    radial.addColorStop(1, 'rgba(6, 4, 10, 0.98)');
    cachedRadialRef.current = radial;

    const bottomFade = ctx.createLinearGradient(0, ch * 0.65, 0, ch);
    bottomFade.addColorStop(0, 'rgba(6, 4, 10, 0)');
    bottomFade.addColorStop(0.5, 'rgba(6, 4, 10, 0.5)');
    bottomFade.addColorStop(1, 'rgba(6, 4, 10, 1)');
    cachedBottomFadeRef.current = bottomFade;
  };

  // Render a specific frame onto canvas with cover aspect-ratio
  const renderFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const clampedIndex = Math.max(1, Math.min(totalFrames, Math.round(frameIndex)));
    const img = imagesRef.current[clampedIndex - 1];

    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback to closest available loaded image if current frame is still loading
      const fallbackImg = imagesRef.current.find((im) => im && im.complete && im.naturalWidth > 0);
      if (!fallbackImg) return;
      drawCover(ctx, fallbackImg, canvas.width, canvas.height);
      lastDrawnIntRef.current = clampedIndex;
      return;
    }

    drawCover(ctx, img, canvas.width, canvas.height);
    lastDrawnIntRef.current = clampedIndex;
  };

  const drawCover = (ctx, img, cw, ch) => {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const hRatio = cw / iw;
    const vRatio = ch / ih;
    const ratio = Math.max(hRatio, vRatio);

    const nw = iw * ratio;
    const nh = ih * ratio;
    const dx = (cw - nw) * 0.5;
    const dy = (ch - nh) * 0.5;

    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, nw, nh);

    // Apply cached seamless deep gold / dark luxury atmospheric gradient overlay
    if (cachedRadialRef.current) {
      ctx.fillStyle = cachedRadialRef.current;
      ctx.fillRect(0, 0, cw, ch);
    }

    // Apply cached golden bottom fade for smooth transition to sections below
    if (cachedBottomFadeRef.current) {
      ctx.fillStyle = cachedBottomFadeRef.current;
      ctx.fillRect(0, ch * 0.65, cw, ch * 0.35);
    }
  };

  // Resize canvas according to device pixel ratio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      const cw = width * dpr;
      const ch = height * dpr;

      canvas.width = cw;
      canvas.height = ch;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (ctx) {
        updateGradients(ctx, cw, ch);
      }

      lastDrawnIntRef.current = -1; // Force redraw on resize
      renderFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll tracking and smooth interpolation loop
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startLoopIfNeeded = () => {
      if (!isRunningLoopRef.current) {
        isRunningLoopRef.current = true;
        animationFrameIdRef.current = requestAnimationFrame(updateLoop);
      }
    };

    const updateLoop = () => {
      if (prefersReducedMotion) {
        currentFrameRef.current = targetFrameRef.current;
        const targetInt = Math.max(1, Math.min(totalFrames, Math.round(targetFrameRef.current)));
        if (targetInt !== lastDrawnIntRef.current) {
          renderFrame(targetInt);
        }
        isRunningLoopRef.current = false;
        return;
      }

      const diff = targetFrameRef.current - currentFrameRef.current;

      if (Math.abs(diff) > 0.005) {
        // High-precision smooth damping (0.1 provides fluid cinema movement)
        currentFrameRef.current += diff * 0.1;
        const nextInt = Math.max(1, Math.min(totalFrames, Math.round(currentFrameRef.current)));

        if (nextInt !== lastDrawnIntRef.current) {
          renderFrame(nextInt);
        }

        animationFrameIdRef.current = requestAnimationFrame(updateLoop);
      } else {
        // Settle cleanly at target
        currentFrameRef.current = targetFrameRef.current;
        const targetInt = Math.max(1, Math.min(totalFrames, Math.round(targetFrameRef.current)));
        if (targetInt !== lastDrawnIntRef.current) {
          renderFrame(targetInt);
        }
        isRunningLoopRef.current = false;
      }
    };

    const handleScroll = () => {
      const container = containerRef?.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      if (scrollableDistance <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
      const target = 1 + progress * (totalFrames - 1);
      targetFrameRef.current = target;

      startLoopIfNeeded();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      isRunningLoopRef.current = false;
    };
  }, [containerRef, totalFrames]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover block"
        style={{
          filter: 'contrast(1.04) brightness(0.98)',
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
