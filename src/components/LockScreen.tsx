import React from 'react';
import InkTrail from './InkTrail';

type LockScreenProps = {
  unlockProgress: number;
  isUnlocking: boolean;
  isUnlocked: boolean;
  imageRef: React.RefObject<HTMLDivElement>;
  progress: number;
};

export default function LockScreen({ unlockProgress, isUnlocking, isUnlocked, imageRef, progress }: LockScreenProps) {
  const textOpacity = progress >= 0.58 ? 0 : 1 - Math.min(1, progress * 1.25);
  const textTranslateY = -progress * 36;
  const textScale = 1 - progress * 0.04;
  const imageOpacity = Math.max(0, 1 - progress * 1.5);
  const footerOpacity = Math.max(0, 1 - progress * 1.8);
  const shellOpacity = 1 - Math.min(1, Math.max(0, (progress - 0.82) / 0.18));
  const hideLockCopy = progress >= 0.58;

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
            className="font-black text-[11.5vw] md:text-[10vw] lg:text-[9vw] leading-[0.9] tracking-tighter uppercase w-full transition-[opacity,transform] duration-300"
            style={{
              opacity: textOpacity,
              transform: `translateY(${textTranslateY}px) scale(${textScale})`,
              transformOrigin: 'center center',
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
              <div className="flex items-center gap-3 md:gap-6 lg:gap-8 w-full">
                <h1>NOT</h1>
                <div
                  ref={imageRef}
                  className="relative w-[28vw] md:w-[17vw] lg:w-[13vw] h-[14vw] md:h-[9vw] lg:h-[7.5vw] shrink-0 overflow-hidden translate-y-[1.8vw] md:translate-y-[1.1vw] lg:translate-y-[0.85vw]"
                  style={{ opacity: imageOpacity }}
                />
                <h1>PERFECTION</h1>
              </div>
            </div>
          </div>
        </section>

        <footer className="absolute bottom-6 md:bottom-10 left-0 w-full flex flex-col gap-1 md:gap-[6px] z-10 transition-opacity duration-300" style={{ opacity: footerOpacity }}>
          <div className="w-full h-[2px] md:h-[3px] bg-black"></div>
          <div className="w-full h-[8px] md:h-[14px] bg-black"></div>
          <div className="w-full h-[2px] md:h-[3px] bg-black"></div>
        </footer>
      </main>
    </div>
  );
}
