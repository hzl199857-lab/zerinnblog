import { useCallback, useEffect, useRef, useState } from 'react';
import DesktopScene from './components/DesktopScene';
import LockScreen from './components/LockScreen';

type LockImageRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

function getUnlockTarget() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let w, h;
  if (vw >= 1024) { w = vw * 0.13; h = vw * 0.075; }
  else if (vw >= 768) { w = vw * 0.17; h = vw * 0.09; }
  else { w = vw * 0.28; h = vw * 0.14; }
  const targetScale = Math.max(vw / w, vh / h);
  const threshold = (targetScale - 1) * 300;
  return { targetScale, threshold };
}

export default function App() {
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [unlockThreshold, setUnlockThreshold] = useState(() => getUnlockTarget().threshold);
  const [lockImageRect, setLockImageRect] = useState<LockImageRect | null>(null);
  const lockImageRef = useRef<HTMLDivElement>(null);

  const targetProgress = useRef(0);
  const displayProgress = useRef(0);
  const rafId = useRef(0);

  const autoCompleting = useRef(false);
  const progress = Math.min(1, unlockProgress / unlockThreshold);
  const isUnlocking = progress > 0.001;
  const isUnlocked = progress >= 0.999;
  const desktopRevealProgress = Math.min(1, Math.max(0, (progress - 0.72) / 0.18));
  const sharedLayerOpacity = 1 - Math.min(1, Math.max(0, (progress - 0.94) / 0.06));
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const viewportCenterX = viewportWidth / 2;
  const viewportCenterY = viewportHeight / 2;
  const startScale = lockImageRect && viewportWidth > 0 ? lockImageRect.width / viewportWidth : 1;
  const startTranslateX = lockImageRect ? lockImageRect.centerX - viewportCenterX : 0;
  const startTranslateY = lockImageRect ? lockImageRect.centerY - viewportCenterY : 0;
  const imageScale = startScale + (1 - startScale) * progress;
  const imageBlur = progress * 8;
  const offsetX = startTranslateX * (1 - progress);
  const offsetY = startTranslateY * (1 - progress);

  const tick = useCallback(() => {
    const normalizedProgress = unlockThreshold > 0 ? displayProgress.current / unlockThreshold : 0;
    const lerp = autoCompleting.current
      ? 0.08 + Math.min(0.22, Math.max(0, normalizedProgress - 0.7) * 0.55)
      : 0.08;
    const diff = targetProgress.current - displayProgress.current;

    if (Math.abs(diff) < 0.5) {
      displayProgress.current = targetProgress.current;
      setUnlockProgress(targetProgress.current);
      if (displayProgress.current < unlockThreshold) {
        autoCompleting.current = false;
      }
      rafId.current = 0;
      return;
    }
    displayProgress.current += diff * lerp;
    setUnlockProgress(displayProgress.current);
    if (displayProgress.current < unlockThreshold) {
      autoCompleting.current = false;
    }
    rafId.current = requestAnimationFrame(tick);
  }, [unlockThreshold]);

  const startAnimation = useCallback(() => {
    if (!rafId.current) rafId.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    const updateMetrics = () => {
      setUnlockThreshold(getUnlockTarget().threshold);
      if (lockImageRef.current) {
        const rect = lockImageRef.current.getBoundingClientRect();
        setLockImageRect({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
        });
      }
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  useEffect(() => {
    const triggerAt = unlockThreshold * 0.2;
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;

      const target = event.target;
      if (target instanceof Element && target.closest('[data-project-window], [data-lightbox]')) {
        return;
      }

      if (event.deltaY < 0) {
        autoCompleting.current = false;
      }

      targetProgress.current = Math.max(0, Math.min(unlockThreshold, targetProgress.current + event.deltaY));
      if (event.deltaY > 0 && targetProgress.current >= triggerAt) {
        autoCompleting.current = true;
        targetProgress.current = unlockThreshold;
      }
      startAnimation();
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [unlockThreshold, startAnimation]);

  useEffect(() => {
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-white">
      {lockImageRect && sharedLayerOpacity > 0.001 && (
        <div
          className="pointer-events-none fixed inset-0 overflow-hidden z-30"
          style={{
            opacity: sharedLayerOpacity,
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden will-change-transform"
            style={{
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${imageScale})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src="/img/gen_20260413_0013.jpg"
              alt="Desktop background"
              className="h-full w-full object-cover"
              style={{ filter: `blur(${imageBlur}px)` }}
              draggable={false}
            />
          </div>
        </div>
      )}

      <DesktopScene
        isUnlocking={isUnlocking}
        isUnlocked={isUnlocked}
        revealProgress={desktopRevealProgress}
        backgroundProgress={progress}
      />

      {!isUnlocked && (
        <div className="absolute inset-0 z-20" style={{ pointerEvents: isUnlocking ? 'none' : 'auto' }}>
          <LockScreen
            unlockProgress={unlockProgress}
            isUnlocking={isUnlocking}
            isUnlocked={isUnlocked}
            imageRef={lockImageRef}
            progress={progress}
          />
        </div>
      )}
    </div>
  );
}
