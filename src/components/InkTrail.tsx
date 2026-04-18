import { useEffect, useRef } from 'react';

// Object pool to avoid GC pressure from constant allocation
const POOL_SIZE = 2000;
const pool: Particle[] = [];

class Particle {
  x = 0;
  y = 0;
  radius = 0;
  isHead = false;
  active = false;

  init(x: number, y: number, radius: number, isHead: boolean) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.isHead = isHead;
    this.active = true;
    return this;
  }

  update(extraDecay: number) {
    this.radius -= (this.isHead ? 1.7 : 2.0) + extraDecay;
    if (this.radius <= 0) {
      this.active = false;
      pool.push(this);
    }
  }
}

function acquireParticle(x: number, y: number, radius: number, isHead: boolean): Particle {
  const p = pool.length > 0 ? pool.pop()! : new Particle();
  return p.init(x, y, radius, isHead);
}

export default function InkTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const headPosRef = useRef({
    targetX: -100, targetY: -100,
    currentX: -100, currentY: -100
  });
  const lastMoveTimeRef = useRef(0);
  const headScaleRef = useRef(1);
  const dotScaleRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Pre-fill pool
    for (let i = 0; i < POOL_SIZE; i++) pool.push(new Particle());

    let particles: Particle[] = [];

    const onMouseMove = (e: MouseEvent) => {
      lastMoveTimeRef.current = performance.now();

      if (headPosRef.current.targetX === -100) {
        headPosRef.current.targetX = e.clientX;
        headPosRef.current.targetY = e.clientY;
        headPosRef.current.currentX = e.clientX;
        headPosRef.current.currentY = e.clientY;
      } else {
        headPosRef.current.targetX = e.clientX;
        headPosRef.current.targetY = e.clientY;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
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

      const headPos = headPosRef.current;

      // Hoist performance.now() — single call per frame
      const now = performance.now();
      const timeSinceLastMove = headPos.targetX !== -100 ? now - lastMoveTimeRef.current : 0;
      const isStopped = timeSinceLastMove > 32;
      const extraDecay = isStopped ? 3.5 : 0;

      if (headPos.targetX !== -100) {
        if (isStopped) {
          headScaleRef.current = Math.max(0, headScaleRef.current - 0.01);
          if (headScaleRef.current === 0 && particles.length === 0) {
            dotScaleRef.current = Math.max(0, dotScaleRef.current - 0.017);
          }
        } else {
          headScaleRef.current = Math.min(1, headScaleRef.current + 0.1);
          dotScaleRef.current = Math.min(1, dotScaleRef.current + 0.1);
        }

        const dx = headPos.targetX - headPos.currentX;
        const dy = headPos.targetY - headPos.currentY;

        headPos.currentX += dx * 0.35;
        headPos.currentY += dy * 0.35;

        const steps = Math.min(
          20, // cap to prevent particle explosion on lag spikes
          Math.max(1, Math.ceil(Math.hypot(dx * 0.35, dy * 0.35) / 2))
        );

        const prevX = headPos.currentX - dx * 0.35;
        const prevY = headPos.currentY - dy * 0.35;

        if (headScaleRef.current > 0) {
          const radius = 100 * headScaleRef.current;
          for (let i = 0; i < steps; i++) {
            const t = i / steps;
            particles.push(acquireParticle(
              prevX + (headPos.currentX - prevX) * t,
              prevY + (headPos.currentY - prevY) * t,
              radius, false
            ));
          }
          particles.push(acquireParticle(headPos.currentX, headPos.currentY, 150 * headScaleRef.current, true));
        }
      }

      // Batch all arcs into a single path — one fill() call total
      ctx.beginPath();
      let writeIdx = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(extraDecay);
        if (p.active) {
          ctx.moveTo(p.x + p.radius, p.y);
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          particles[writeIdx++] = p;
        }
      }
      particles.length = writeIdx; // swap-and-truncate, no new array
      ctx.fill();

      if (dotRef.current) {
        const s = dotScaleRef.current;
        const x = headScaleRef.current === 0 ? headPos.targetX : headPos.currentX;
        const y = headScaleRef.current === 0 ? headPos.targetY : headPos.currentY;
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      }

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
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 mix-blend-difference">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            filter: 'url(#ink-bleed)',
            willChange: 'filter',
          }}
        />
      </div>

      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[12px] h-[12px] bg-white rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          marginLeft: '-6px',
          marginTop: '-6px',
          transform: 'translate3d(-100px, -100px, 0) scale(1)'
        }}
      />
    </>
  );
}
