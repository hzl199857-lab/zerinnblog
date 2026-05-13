import React, { useEffect, useMemo, useRef, useState } from 'react';
import InkTrail from './InkTrail';

type LockScreenProps = {
  unlockProgress: number;
  isUnlocking: boolean;
  isUnlocked: boolean;
  imageRef: React.RefObject<HTMLDivElement>;
  progress: number;
};

export default function LockScreen({ unlockProgress, isUnlocking, isUnlocked, imageRef, progress }: LockScreenProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const idleResetTimeoutRef = useRef<number | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const clearIdleReset = () => {
      if (idleResetTimeoutRef.current !== null) {
        window.clearTimeout(idleResetTimeoutRef.current);
        idleResetTimeoutRef.current = null;
      }
    };

    const resetPointer = () => {
      clearIdleReset();
      setPointer((current) => ({ ...current, active: false }));
    };

    const scheduleIdleReset = () => {
      clearIdleReset();
      idleResetTimeoutRef.current = window.setTimeout(() => {
        setPointer((current) => ({ ...current, active: false }));
        idleResetTimeoutRef.current = null;
      }, 140);
    };

    const updatePointer = (clientX: number, clientY: number, active: boolean) => {
      setPointer({ x: clientX, y: clientY, active });
      if (active) {
        scheduleIdleReset();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      updatePointer(event.clientX, event.clientY, true);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      updatePointer(touch.clientX, touch.clientY, true);
    };

    const handleWheel = () => {
      resetPointer();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', resetPointer);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', resetPointer);
    window.addEventListener('touchcancel', resetPointer);

    return () => {
      clearIdleReset();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', resetPointer);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', resetPointer);
      window.removeEventListener('touchcancel', resetPointer);
    };
  }, []);

  const heroMotion = useMemo(() => {
    if (!pointer.active || !heroRef.current) {
      return { rotateX: 0, rotateY: 0, rotateZ: 0, shiftX: 0, shiftY: 0 };
    }

    const bounds = heroRef.current.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const offsetX = pointer.x - centerX;
    const offsetY = pointer.y - centerY;
    const normalizedX = bounds.width > 0 ? Math.max(-1, Math.min(1, offsetX / (bounds.width / 2))) : 0;
    const normalizedY = bounds.height > 0 ? Math.max(-1, Math.min(1, offsetY / (bounds.height / 2))) : 0;

    return {
      rotateX: normalizedY * -6,
      rotateY: normalizedX * 8,
      rotateZ: normalizedX * 2.8,
      shiftX: normalizedX * 10,
      shiftY: normalizedY * 8,
    };
  }, [pointer]);

  const textOpacity = progress >= 0.58 ? 0 : 1 - Math.min(1, progress * 1.25);
  const textTranslateY = -progress * 36;
  const textScale = 1 - progress * 0.04;
  const imageOpacity = Math.max(0, 1 - progress * 1.5);
  const footerOpacity = Math.max(0, 1 - progress * 1.8);
  const shellOpacity = 1 - Math.min(1, Math.max(0, (progress - 0.82) / 0.18));
  const hideLockCopy = progress >= 0.58;
  const scrollHintFadeProgress = Math.min(1, Math.max(0, (progress - 0.05) / 0.2));
  const scrollHintOpacity = Math.max(0, 1 - scrollHintFadeProgress);
  const scrollHintTranslateY = scrollHintFadeProgress * 18;

  return (
    <div
      data-lock-screen
      data-unlocking={isUnlocking}
      data-unlocked={isUnlocked}
      style={{ ['--unlock-progress' as string]: String(unlockProgress) }}
      className="relative min-h-screen"
      aria-hidden={isUnlocked}
    >
      <main className="relative min-h-screen overflow-hidden text-black font-sans selection:bg-pink-200 selection:text-black" style={{ backgroundColor: `rgba(255, 255, 255, ${shellOpacity})` }}>
        {progress < 0.02 && <InkTrail />}

        <section className="flex min-h-screen flex-col justify-center px-4 pt-20 pb-32 md:px-12 lg:px-20 z-0" style={{ visibility: hideLockCopy ? 'hidden' : 'visible' }}>
          <div
            ref={heroRef}
            className="font-black text-[11.5vw] md:text-[10vw] lg:text-[9vw] leading-[0.9] tracking-tighter uppercase w-full transition-[opacity,transform] duration-300"
            style={{
              opacity: textOpacity,
              transform: `perspective(1400px) translate3d(${heroMotion.shiftX}px, ${textTranslateY + heroMotion.shiftY}px, 0) rotateX(${heroMotion.rotateX}deg) rotateY(${heroMotion.rotateY}deg) rotateZ(${heroMotion.rotateZ}deg) scale(${textScale})`,
              transformOrigin: 'center center',
              transformStyle: 'preserve-3d',
              transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease',
            }}
          >
            <div className="flex flex-col w-full">
              <div className="flex items-start justify-between w-full">
                <h1>LIMITLESS</h1>
                <p className="font-sans font-medium text-xs md:text-sm leading-relaxed tracking-tight text-right max-w-[220px] normal-case mt-1 whitespace-pre-line">
                  {`欢迎来到我的网站
我是何泽霖 我始终相信
无限进步 莫贪圆满`}
                </p>
              </div>
              <h1 className="w-full text-left ml-[10vw] md:ml-[15vw]">PROGRESS</h1>
              <div className="flex items-center gap-3 md:gap-5 lg:gap-6 w-full">
                <h1>NOT</h1>
                <div
                  ref={imageRef}
                  className="relative w-[28vw] md:w-[17vw] lg:w-[13vw] h-[14vw] md:h-[9vw] lg:h-[7.5vw] shrink-0 overflow-hidden"
                  style={{
                    opacity: imageOpacity,
                    transform: 'translateY(1.8vw)',
                    transition: 'opacity 300ms ease',
                  }}
                />
                <h1>PERFECTION</h1>
              </div>
            </div>
          </div>
        </section>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-22 z-20 flex flex-col items-center justify-center mix-blend-difference transition-[opacity,transform] duration-300 md:bottom-28"
          style={{
            opacity: scrollHintOpacity,
            transform: `translateY(${scrollHintTranslateY}px)`,
          }}
          aria-hidden={progress > 0.24}
        >
          <p className="text-[10px] font-medium tracking-[0.28em] text-white uppercase md:text-[11px]">
            向下滚动进入桌面
          </p>
          <div className="mt-3 flex h-8 w-4 items-start justify-center overflow-hidden">
            <span
              className="block h-4 w-px bg-white"
              style={{
                animation: 'scroll-hint-drift 1.6s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        <footer className="absolute bottom-6 md:bottom-10 left-0 w-full flex flex-col gap-1 md:gap-[6px] z-10 transition-opacity duration-300" style={{ opacity: footerOpacity }}>
          <div className="w-full h-[2px] md:h-[3px] bg-black"></div>
          <div className="w-full h-[8px] md:h-[14px] bg-black"></div>
          <div className="w-full h-[2px] md:h-[3px] bg-black"></div>
        </footer>
      </main>
    </div>
  );
}
