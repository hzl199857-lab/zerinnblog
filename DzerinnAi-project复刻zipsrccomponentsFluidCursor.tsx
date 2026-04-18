import { useEffect, useRef } from 'react';

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, vx: number, vy: number, radius: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.life = 1.0; // 1.0 down to 0.0
    this.maxLife = Math.random() * 0.5 + 0.5; // randomize decay slightly
  }

  update() {
    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;
    
    // Friction (damping)
    this.vx *= 0.85;
    this.vy *= 0.85;
    
    // Decay life and radius
    this.life -= 0.02 / this.maxLife;
    this.radius *= 0.92;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.radius < 0.5) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles: Particle[] = [];
    
    let lastX = -100;
    let lastY = -100;
    let currentX = -100;
    let currentY = -100;
    
    let isMoving = false;
    let moveTimeout: number;

    const onMouseMove = (e: MouseEvent) => {
      currentX = e.clientX;
      currentY = e.clientY;
      
      if (lastX === -100) {
        lastX = currentX;
        lastY = currentY;
      }
      
      isMoving = true;
      if (dotRef.current) {
        dotRef.current.style.opacity = '1';
        dotRef.current.style.transform = `translate(${currentX}px, ${currentY}px) scale(1)`;
      }

      window.clearTimeout(moveTimeout);
      moveTimeout = window.setTimeout(() => {
        isMoving = false;
        if (dotRef.current) {
          dotRef.current.style.opacity = '0';
          dotRef.current.style.transform = `translate(${currentX}px, ${currentY}px) scale(0)`;
        }
      }, 150);

      const dx = currentX - lastX;
      const dy = currentY - lastY;
      const dist = Math.hypot(dx, dy);
      
      // Calculate velocity vector for particles
      const speed = Math.min(dist * 0.5, 40); // Cap max speed factor
      
      // Dynamic base radius based on speed (faster = thicker/larger fluid chunk)
      const baseRadius = Math.min(Math.max(speed * 0.8 + 20, 25), 60);

      const steps = Math.max(1, Math.ceil(dist / 5));

      for (let i = 0; i < steps; i++) {
        const px = lastX + dx * (i / steps);
        const py = lastY + dy * (i / steps);
        
        // Add spread/randomness to velocity
        const pvx = dx * 0.15 + (Math.random() - 0.5) * 2;
        const pvy = dy * 0.15 + (Math.random() - 0.5) * 2;
        
        // Add random size variation
        const pradius = baseRadius * (Math.random() * 0.4 + 0.6);
        
        particles.push(new Particle(px, py, pvx, pvy, pradius));
      }

      lastX = currentX;
      lastY = currentY;
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
      
      // Draw fluid particles (black)
      ctx.fillStyle = 'black';
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
      }
      
      // Remove dead particles
      particles = particles.filter(p => p.life > 0 && p.radius > 0.5);
      
      // Update dot position if mouse is still but dot needs to follow
      if (dotRef.current && isMoving) {
        dotRef.current.style.transform = `translate(${currentX}px, ${currentY}px) scale(1)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(moveTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* SVG Filter for fluid/ink rough edges and viscosity */}
      <svg style={{ width: 0, height: 0, position: 'absolute' }}>
        <filter id="fluid-edge">
          {/* Add noise for rough edge */}
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          {/* Distort the black shapes with the noise */}
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          
          {/* Soften and threshold to create gooey liquid connections */}
          <feGaussianBlur in="displaced" stdDeviation="5" result="blurred" />
          <feColorMatrix in="blurred" mode="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 25 -10" result="goo" />
          
          {/* Composite back to retain solid black color */}
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>

      {/* Main Fluid Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
        style={{
          filter: 'url(#fluid-edge)',
          willChange: 'filter, transform',
        }}
      />
      
      {/* Center White Tracking Dot */}
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-[6px] h-[6px] bg-white rounded-full pointer-events-none z-[51] transition-all duration-300 ease-out origin-center"
        style={{ 
          marginLeft: '-3px',
          marginTop: '-3px',
          opacity: 0,
          transform: 'translate(-100px, -100px) scale(0)'
        }}
      />
    </>
  );
}
