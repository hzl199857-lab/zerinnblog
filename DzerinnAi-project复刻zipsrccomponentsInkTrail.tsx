import { useEffect, useRef } from 'react';

export default function InkTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let points: { x: number; y: number; r: number }[] = [];

    const MAX_RADIUS = 65;
    const SHRINK_RATE = 1.5;

    let lastX = -100;
    let lastY = -100;

    const onMouseMove = (e: MouseEvent) => {
      if (lastX === -100) {
        lastX = e.clientX;
        lastY = e.clientY;
      }

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / 8));

      for (let i = 0; i < steps; i++) {
        points.push({
          x: lastX + dx * (i / steps),
          y: lastY + dy * (i / steps),
          r: MAX_RADIUS,
        });
      }

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', handleResize);

    let animationFrameId = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'white';
      ctx.beginPath();

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.r -= SHRINK_RATE;
        if (p.r > 0) {
          ctx.moveTo(p.x, p.y);
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      points = points.filter((p) => p.r > 0);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <svg style={{ width: 0, height: 0, position: 'absolute' }}>
        <filter id="ink-bleed">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 mix-blend-difference"
        style={{
          filter: 'url(#ink-bleed)',
          willChange: 'filter',
        }}
      />
    </>
  );
}
