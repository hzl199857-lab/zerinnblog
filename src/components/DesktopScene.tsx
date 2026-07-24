import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { projects, Project, PreviewItem } from '../data';
import {
  DEFAULT_DOCK_ORDER,
  DOCK_GROUP_ENDS,
  DOCK_ORDER_STORAGE_KEY,
  parseDockOrder,
} from './dockOrder';

type ActiveWindow = {
  project: Project;
  offsetX: number;
  offsetY: number;
};

const DOCK_LONG_PRESS_MS = 150;
const DOCK_PRESS_MOVE_TOLERANCE = 8;
const DOCK_SEPARATOR_LEFTS = [224, 461];
const DOCK_LABELS: Record<string, string> = {
  '1-1': '我的项目',
  '1-2': '联系我',
  '2-1': '我的简历',
};
const DOCK_BUBBLE_IDS = ['1-1', '1-2', '2-1'];
const promptCatcherProject = projects.find((project) => project.id === 'prompt-catcher');

export default function DesktopScene({ isUnlocking, isUnlocked, revealProgress, backgroundProgress }: { isUnlocking: boolean; isUnlocked: boolean; revealProgress: number; backgroundProgress: number }) {
  const [activeWindows, setActiveWindows] = useState<ActiveWindow[]>([]);
  const [isContactWindowOpen, setIsContactWindowOpen] = useState(false);
  const [isSafariWindowOpen, setIsSafariWindowOpen] = useState(false);
  const [isResumeWindowOpen, setIsResumeWindowOpen] = useState(false);

  const toggleWindow = (project: Project) => {
    setActiveWindows((prev) => {
      const isWindowOpen = prev.some((w) => w.project.id === project.id);
      if (isWindowOpen) {
        return prev.filter((w) => w.project.id !== project.id);
      }

      const randomOffsetX = project.caseStudy ? 0 : Math.round((Math.random() - 0.5) * 120);
      const randomOffsetY = project.caseStudy ? 0 : Math.round(Math.random() * 48);

      return [...prev, { project, offsetX: randomOffsetX, offsetY: randomOffsetY }];
    });
  };

  const bringToFront = (projectId: string) => {
    setActiveWindows((prev) => {
      const windowIndex = prev.findIndex((w) => w.project.id === projectId);
      if (windowIndex === -1 || windowIndex === prev.length - 1) return prev;

      const newWindows = [...prev];
      const [windowProject] = newWindows.splice(windowIndex, 1);
      newWindows.push(windowProject);
      return newWindows;
    });
  };

  const show = isUnlocking || isUnlocked;
  const progress = Math.min(1, backgroundProgress);
  const shellOpacity = 1;
  const shellBlur = progress * 8;

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white font-sans selection:bg-white/30">
      <div
        className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: 'url(/img/gen_20260413_0013.jpg)',
          opacity: shellOpacity,
          filter: `blur(${shellBlur}px)`,
        }}
      >
        <div className="absolute inset-0 bg-white/5" />
      </div>

      <div className="relative h-full w-full transition-all duration-200">
        <div className="relative z-10 w-full h-full p-8">
          {projects.filter((project) => !project.caseStudy).map((project, index) => (
            <DesktopIcon
              key={project.id}
              project={project}
              onClick={() => toggleWindow(project)}
              show={show}
              revealProgress={revealProgress}
              revealDelay={index * 0.08}
            />
          ))}
        </div>

        <AnimatePresence>
          {activeWindows.map((windowItem, index) => (
            <Window
              key={windowItem.project.id}
              project={windowItem.project}
              onClose={() => toggleWindow(windowItem.project)}
              onFocus={() => bringToFront(windowItem.project.id)}
              zIndex={50 + index}
              offsetX={windowItem.offsetX}
              offsetY={windowItem.offsetY}
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isSafariWindowOpen && promptCatcherProject && (
          <SafariWindow project={promptCatcherProject} onClose={() => setIsSafariWindowOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isContactWindowOpen && (
          <ContactWindow onClose={() => setIsContactWindowOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResumeWindowOpen && (
          <ResumeWindow onClose={() => setIsResumeWindowOpen(false)} />
        )}
      </AnimatePresence>

      <Dock
        show={show}
        revealProgress={revealProgress}
        onIconClick={(iconName) => {
          if (iconName === '1-1') {
            setIsSafariWindowOpen(true);
          }

          if (iconName === '1-2') {
            setIsContactWindowOpen(true);
          }

          if (iconName === '2-1') {
            setIsResumeWindowOpen(true);
          }
        }}
      />
    </div>
  );
}

function DesktopIcon(props: { project: Project; onClick: () => void; show: boolean; revealProgress: number; revealDelay: number; key?: React.Key }) {
  const { project, onClick, show, revealProgress, revealDelay } = props;
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setTimeout(() => setIsDragging(false), 150);
      }}
      className="absolute flex flex-col items-center justify-start gap-1.5 cursor-pointer group"
      style={{
        left: `${project.x}%`,
        top: `${project.y}%`,
        marginLeft: '-64px',
        marginTop: '-48px',
        width: '128px',
        zIndex: 10,
        pointerEvents: revealProgress > 0.92 ? 'auto' : 'none',
      }}
      initial={{ opacity: 0, y: -48, scale: 0.94 }}
      animate={show ? { opacity: revealProgress, y: (1 - revealProgress) * -10, scale: 0.985 + revealProgress * 0.015 } : { opacity: 0, y: -20, scale: 0.96 }}
      transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.95, delay: revealDelay }}
      onClick={() => {
        if (!isDragging) onClick();
      }}
    >
      <div className="relative p-[10px] rounded group-hover:bg-black/30 group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] transition-all duration-200 pointer-events-none inline-flex items-center justify-center">
        <div className="overflow-hidden rounded-sm shadow-md transition-transform duration-200 group-hover:scale-[1.15] flex">
          <img src={project.iconSrc} alt={project.title} className="max-w-[80px] max-h-[64px] w-auto h-auto object-contain block" draggable={false} />
        </div>
      </div>
      <span className="text-[11px] font-bold text-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-1.5 py-0.5 rounded-sm leading-tight max-w-full break-words pointer-events-none group-hover:bg-[#0058d0] group-hover:text-white group-hover:drop-shadow-none transition-all duration-200 mt-0 group-hover:mt-2">
        {project.title}
      </span>
    </motion.div>
  );
}

function Window(props: { project: Project; onClose: () => void; onFocus: () => void; zIndex: number; offsetX: number; offsetY: number; key?: React.Key }) {
  const { project, onClose, onFocus, zIndex, offsetX, offsetY } = props;
  const dragControls = useDragControls();
  const [showPreviews, setShowPreviews] = useState(false);
  const [lightboxPreview, setLightboxPreview] = useState<PreviewItem | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowPreviews(true), 140);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!lightboxPreview) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxPreview(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPreview]);

  const openLightbox = (preview: PreviewItem) => {
    if (preview.type === 'image') {
      setLightboxPreview(preview);
    }
  };

  const previewImageClassName = 'w-full rounded-xl shadow-sm object-contain bg-black/5 border border-gray-100 cursor-zoom-in';
  const previewImageProps = (preview: PreviewItem) => ({
    onClick: () => openLightbox(preview),
    onContextMenu: (event: React.MouseEvent<HTMLImageElement>) => {
      event.preventDefault();
      openLightbox(preview);
    },
  });
  const isWideProject = project.id === 'ai-live-drama-case' || Boolean(project.caseStudy);

  return (
    <>
      <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragConstraints={{ left: -260, right: 260, top: 0, bottom: 220 }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', damping: 20, stiffness: 280, mass: 0.8 }}
      onPointerDownCapture={onFocus}
      data-project-window
      className={`absolute max-w-[94vw] max-h-[calc(100dvh-150px)] bg-[#f5f5f5] text-black rounded-xl shadow-xl overflow-hidden flex flex-col border border-white/50 will-change-transform ${project.caseStudy ? 'w-[clamp(680px,calc((100dvh-96px)*1.15),920px)]' : project.id === 'ai-live-drama-case' ? 'w-[clamp(640px,calc((100dvh-96px)*1),860px)]' : 'w-[clamp(460px,calc((100dvh-96px)*0.78),600px)]'}`}
      style={{
        left: project.caseStudy
          ? 'max(3vw, calc(50vw - min(460px, max(340px, (100dvh - 96px) * 0.575))))'
          : isWideProject
            ? 'max(3vw, calc(50vw - min(430px, max(320px, (100dvh - 96px) * 0.5))))'
            : 'max(3vw, calc(50vw - min(300px, max(230px, (100dvh - 96px) * 0.39))))',
        top: 'clamp(18px, calc(50dvh - 340px), 72px)',
        x: offsetX,
        y: offsetY,
        transformOrigin: 'center center',
        zIndex,
        backfaceVisibility: 'hidden',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 bg-[#f6f6f6] border-b border-gray-300 select-none cursor-grab active:cursor-grabbing shrink-0"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex gap-2">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:bg-[#ff5f56]/80 flex items-center justify-center group">
            <i className="fa-solid fa-xmark text-[6px] text-black/50 opacity-0 group-hover:opacity-100"></i>
          </button>
          <button className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:bg-[#ffbd2e]/80 flex items-center justify-center group">
            <i className="fa-solid fa-minus text-[6px] text-black/50 opacity-0 group-hover:opacity-100"></i>
          </button>
          <button className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:bg-[#27c93f]/80 flex items-center justify-center group">
            <i className="fa-solid fa-up-right-and-down-left-from-center text-[5px] text-black/50 opacity-0 group-hover:opacity-100"></i>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800 tracking-wide">
          <i className="fa-regular fa-folder-open text-gray-500"></i>
          关于项目: {project.title}
        </div>
        <div className="w-12"></div>
      </div>

      <div className={`flex-1 overflow-y-auto no-scrollbar bg-white/95 backdrop-blur-md flex flex-col ${project.caseStudy ? 'p-0' : 'p-[clamp(16px,2.3dvh,24px)]'}`}>
        {project.caseStudy ? (
          <PromptCatcherCaseStudy
            project={project}
            show={showPreviews}
            onOpenImage={openLightbox}
          />
        ) : (
        <>
        <div className="flex items-start gap-4 mb-[clamp(16px,2.3dvh,24px)]">
          <div className="h-[clamp(52px,6dvh,64px)] w-[clamp(52px,6dvh,64px)] shrink-0 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
            <img src={project.iconSrc} alt={project.title} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="flex flex-col pt-1">
            <h2 className="text-[18px] font-bold text-gray-900 leading-tight">{project.title}</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">{project.details.topic.split(' > ')[0]}</p>
          </div>
        </div>

        <div className="text-[13px] text-gray-700 leading-relaxed mb-[clamp(16px,2.3dvh,24px)]">{project.description}</div>

        <div className="text-[13px] bg-gray-50/50 rounded-lg p-[clamp(12px,1.7dvh,16px)] border border-gray-100 mb-[clamp(16px,2.3dvh,24px)]">
          <h3 className="font-bold mb-1.5 text-gray-900">详情信息:</h3>
          <p className="text-gray-600">标签: {project.details.topic}</p>
        </div>

        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: showPreviews ? 1 : 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <h3 className="font-bold text-[13px] text-gray-900 mb-4">预览内容:</h3>
          <div className="flex flex-col gap-[clamp(16px,2.3dvh,24px)]">
            {(() => {
              const previewRows = project.previews.reduce<Array<{ type: 'single' | 'group'; items: typeof project.previews }>>((rows, preview) => {
                if (preview.rowGroup) {
                  const lastRow = rows[rows.length - 1];
                  if (lastRow?.type === 'group' && lastRow.items[0]?.rowGroup === preview.rowGroup) {
                    lastRow.items.push(preview);
                  } else {
                    rows.push({ type: 'group', items: [preview] });
                  }
                } else {
                  rows.push({ type: 'single', items: [preview] });
                }
                return rows;
              }, []);

              return project.id === 'ai-tesla-studio' && project.previews.length > 1 ? (
                <>
                  <div className="flex flex-col gap-3">
                    {project.previewIntro && (
                      <div className="text-[13px] bg-gray-50/80 rounded-lg p-4 border border-gray-100">
                        <h4 className="font-bold mb-1.5 text-gray-900">展示说明:</h4>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{project.previewIntro}</p>
                      </div>
                    )}
                    <img src={project.previews[0].src} alt={`${project.title} preview 1`} className={previewImageClassName} loading="lazy" decoding="async" {...previewImageProps(project.previews[0])} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {project.previews.slice(1, 5).map((preview, idx) => (
                      <img
                        key={idx + 1}
                        src={preview.src}
                        alt={`${project.title} preview ${idx + 2}`}
                        className={previewImageClassName}
                        loading="lazy"
                        decoding="async"
                        {...previewImageProps(preview)}
                      />
                    ))}
                  </div>
                  {project.previews.length > 5 && (
                    <div className="grid grid-cols-2 gap-4">
                      {project.previews.slice(5).map((preview, idx) => (
                        <img
                          key={idx + 5}
                          src={preview.src}
                          alt={`${project.title} preview ${idx + 6}`}
                          className={previewImageClassName}
                          loading="lazy"
                          decoding="async"
                          {...previewImageProps(preview)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {project.previewIntro && (
                    <div className="text-[13px] bg-gray-50/80 rounded-lg p-4 border border-gray-100">
                      <h4 className="font-bold mb-1.5 text-gray-900">展示说明:</h4>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">{project.previewIntro}</p>
                    </div>
                  )}
                  {previewRows.map((row, rowIdx) => (
                    row.type === 'group' ? (
                      <div key={`group-${rowIdx}`} className={`grid gap-4 ${row.items.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        {row.items.map((preview, itemIdx) => (
                          preview.type === 'video' ? (
                            <div
                              key={itemIdx}
                              className="flex justify-center rounded-xl overflow-hidden bg-black border border-gray-100 shadow-sm w-full"
                              style={{ aspectRatio: preview.aspectRatio ?? (preview.portrait ? '9 / 16' : '16 / 9') }}
                            >
                              <video
                                src={preview.src}
                                controls
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <img
                              key={itemIdx}
                              src={preview.src}
                              alt={`${project.title} preview ${rowIdx + itemIdx + 1}`}
                              className={previewImageClassName}
                              loading="lazy"
                              decoding="async"
                              {...previewImageProps(preview)}
                            />
                          )
                        ))}
                      </div>
                    ) : (
                      <div key={`single-${rowIdx}`} className="flex flex-col gap-3">
                        {row.items[0].type === 'embed' ? (
                          <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-black aspect-video">
                            <iframe
                              src={row.items[0].src}
                              title={row.items[0].title ?? `${project.title} preview ${rowIdx + 1}`}
                              className="h-full w-full"
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="strict-origin-when-cross-origin"
                            />
                          </div>
                        ) : row.items[0].type === 'video' ? (
                          <div
                            className="flex justify-center rounded-xl overflow-hidden bg-black border border-gray-100 shadow-sm w-full"
                            style={{ aspectRatio: row.items[0].aspectRatio ?? (row.items[0].portrait ? '9 / 16' : '16 / 9') }}
                          >
                            <video
                              src={row.items[0].src}
                              controls
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : row.items[0].type === 'note' ? (
                          <div className="text-[13px] bg-gray-50/80 rounded-lg p-4 border border-gray-100">
                            <h4 className="font-bold mb-1.5 text-gray-900">展示说明:</h4>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{row.items[0].title}</p>
                          </div>
                        ) : (
                          <img src={row.items[0].src} alt={`${project.title} preview ${rowIdx + 1}`} className={previewImageClassName} loading="lazy" decoding="async" {...previewImageProps(row.items[0])} />
                        )}
                      </div>
                    )
                  ))}
                </>
              );
            })()}
          </div>
        </motion.div>
        </>
        )}
      </div>
    </motion.div>

    <AnimatePresence>
      {lightboxPreview && (
        <motion.div
          data-lightbox
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={() => setLightboxPreview(null)}
          onContextMenu={(event) => event.preventDefault()}
        >
          <motion.div
            className="relative max-w-[92vw] max-h-[92vh]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button
              type="button"
              onClick={() => setLightboxPreview(null)}
              className="absolute -top-4 -right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition hover:bg-white"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
            <img
              src={lightboxPreview.src}
              alt={lightboxPreview.title ?? `${project.title} enlarged preview`}
              className="max-w-[92vw] max-h-[92vh] rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}

function PromptCatcherCaseStudy({
  project,
  show,
  onOpenImage,
}: {
  project: Project;
  show: boolean;
  onOpenImage: (preview: PreviewItem) => void;
}) {
  const caseStudy = project.caseStudy!;
  const [
    storePreview,
    demoPreview,
    reversePromptPreview,
    generationResultPreview,
    settingsPreview,
    adoptionPreview,
  ] = project.previews;

  const imageButton = (preview: PreviewItem, className: string) => (
    <button
      type="button"
      className={`group relative block w-full overflow-hidden text-left ${className}`}
      onClick={() => onOpenImage(preview)}
      aria-label={`放大查看：${preview.title ?? project.title}`}
    >
      <img
        src={preview.src}
        alt={preview.title ?? project.title}
        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.015]"
        loading="lazy"
        decoding="async"
      />
      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        <i className="fa-solid fa-magnifying-glass-plus text-xs" />
      </span>
    </button>
  );

  return (
    <motion.article
      className="bg-white text-[#111111]"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <section className="bg-[#111111] px-6 py-7 text-white md:px-10 md:py-10">
        <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[620px]">
            <div className="mb-5 flex items-center gap-3">
              <img src={project.iconSrc} alt="" className="h-12 w-12 rounded-md" />
              <div>
                <p className="text-[10px] font-black text-[#ffe45c]">{caseStudy.kicker}</p>
                <p className="mt-1 text-xs text-white/60">独立设计与开发 · 2026</p>
              </div>
            </div>
            <h1 className="max-w-[590px] text-3xl font-black leading-[1.15] md:text-[40px]">
              {caseStudy.headline}
            </h1>
            <p className="mt-5 max-w-[600px] text-sm leading-7 text-white/72">
              {project.description}
            </p>
          </div>
          <a
            href={caseStudy.storeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start bg-[#ffe45c] px-4 py-3 text-xs font-black text-black transition-colors hover:bg-white"
          >
            查看 Chrome 商店
            <i className="fa-solid fa-arrow-up-right-from-square" />
          </a>
        </div>
        <div className="mt-8 inline-flex items-center gap-2 border border-[#ffe45c]/50 px-3 py-2 text-[11px] font-bold text-[#ffe45c]">
          <span className="h-2 w-2 rounded-full bg-[#ffe45c]" />
          {caseStudy.status}
        </div>
      </section>

      <section className="grid grid-cols-2 border-b border-[#d8d8d8] md:grid-cols-4">
        {caseStudy.metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`px-5 py-5 md:px-7 ${index % 2 !== 0 ? '' : 'border-r border-[#d8d8d8]'} ${index > 1 ? 'border-t border-[#d8d8d8] md:border-t-0' : ''} ${index === 1 ? 'md:border-r' : ''}`}
          >
            <div className="text-2xl font-black md:text-3xl">{metric.value}</div>
            <div className="mt-1 text-[11px] font-medium text-black/55">{metric.label}</div>
          </div>
        ))}
      </section>

      <section className="grid border-b border-[#d8d8d8] md:grid-cols-2">
        {[caseStudy.problem, caseStudy.solution].map((item, index) => (
          <div key={item.title} className={`px-6 py-8 md:px-10 md:py-10 ${index === 0 ? 'md:border-r md:border-[#d8d8d8]' : ''}`}>
            <p className="text-[10px] font-black text-black/45">{index === 0 ? '01 / 问题' : '02 / 解法'}</p>
            <h2 className="mt-3 text-xl font-black leading-tight">{item.title}</h2>
            <p className="mt-4 text-[13px] leading-6 text-black/65">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="px-6 py-8 md:px-10 md:py-10">
        <div className="mb-5 flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-black text-black/45">03 / 上架结果</p>
            <h2 className="mt-2 text-2xl font-black">从可用工具到公开产品</h2>
          </div>
          <p className="hidden max-w-[290px] text-right text-xs leading-5 text-black/50 md:block">
            已通过 Chrome Web Store 审核公开发布，商店评分 5.0。
          </p>
        </div>
        {imageButton(storePreview, 'aspect-[1.353/1] border border-[#d8d8d8] bg-[#f6f6f6]')}
        <p className="mt-3 text-[11px] leading-5 text-black/50">{storePreview.title}</p>
      </section>

      <section className="border-y border-[#d8d8d8] bg-[#f5f5f2] px-6 py-8 md:px-10 md:py-10">
        <p className="text-[10px] font-black text-black/45">04 / 使用流程</p>
        <h2 className="mt-2 text-2xl font-black">一次点击，四步完成视觉反推</h2>
        <div className="mt-7 grid md:grid-cols-4">
          {caseStudy.workflow.map((item, index) => (
            <div key={item.step} className={`py-4 md:px-5 md:py-0 ${index > 0 ? 'border-t border-black/15 md:border-l md:border-t-0' : ''} ${index === 0 ? 'md:pl-0' : ''}`}>
              <span className="text-xs font-black text-[#ad8b00]">{item.step}</span>
              <h3 className="mt-2 text-sm font-black">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-black/55">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#111111] px-6 py-8 text-white md:px-10 md:py-10">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-black text-[#ffe45c]">05 / 产品演示</p>
            <h2 className="mt-2 text-2xl font-black">从网页灵感到可复用 Prompt</h2>
          </div>
          <p className="text-xs text-white/50">完整演示 · 04:35</p>
        </div>
        <video
          src={demoPreview.src}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full bg-black object-contain"
        />
        <p className="mt-3 text-[11px] leading-5 text-white/45">{demoPreview.title}</p>
      </section>

      <section className="px-6 py-8 md:px-10 md:py-10">
        <div className="max-w-[680px]">
          <p className="text-[10px] font-black text-black/45">06 / 实测闭环</p>
          <h2 className="mt-2 text-2xl font-black">反推不止复述画面，也能驱动定向改图</h2>
          <p className="mt-4 text-[13px] leading-6 text-black/60">
            这次测试从小红书网页中的商业人像开始。插件先拆解人物、构图、镜头、光色和空间关系，再追加“把人物手中的绿色饮料改为 iPhone 17 手机”的修改意图，最后将整理后的提示词投入生图流程。
          </p>
        </div>

        <figure className="mt-7">
          <div className="flex items-center justify-between border border-b-0 border-[#d8d8d8] bg-[#f5f5f2] px-4 py-3">
            <span className="text-[10px] font-black">STEP A · 原图反推与修改指令</span>
            <span className="text-[10px] font-bold text-black/40">网页内完成</span>
          </div>
          {imageButton(reversePromptPreview, 'aspect-[1.353/1] border border-[#d8d8d8] bg-[#f6f6f6]')}
          <figcaption className="mt-3 text-[11px] leading-5 text-black/50">{reversePromptPreview.title}</figcaption>
        </figure>

        <div className="my-7 grid border-y border-black/15 md:grid-cols-3">
          {[
            ['01', '捕捉网页原图'],
            ['02', '提取结构化视觉信息'],
            ['03', '注入明确修改意图'],
          ].map(([step, label], index) => (
            <div key={step} className={`flex items-center gap-3 py-4 md:px-5 ${index > 0 ? 'border-t border-black/15 md:border-l md:border-t-0' : 'md:pl-0'}`}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ffe45c] text-[10px] font-black">{step}</span>
              <span className="text-xs font-black">{label}</span>
            </div>
          ))}
        </div>

        <figure>
          <div className="flex items-center justify-between border border-b-0 border-[#d8d8d8] bg-[#111111] px-4 py-3 text-white">
            <span className="text-[10px] font-black text-[#ffe45c]">STEP B · 实际生图结果</span>
            <span className="text-[10px] font-bold text-white/45">左：原图 / 右：结果</span>
          </div>
          {imageButton(generationResultPreview, 'aspect-[1.353/1] border border-[#d8d8d8] bg-[#111111]')}
          <figcaption className="mt-3 text-[11px] leading-5 text-black/50">{generationResultPreview.title}</figcaption>
        </figure>

        <div className="mt-7 grid border-y border-black/15 md:grid-cols-3">
          {[
            ['人物与表情', '稳定保留'],
            ['构图与高调影调', '稳定保留'],
            ['绿色饮料 → 手机', '定向替换'],
          ].map(([label, value], index) => (
            <div key={label} className={`py-4 md:px-5 ${index > 0 ? 'border-t border-black/15 md:border-l md:border-t-0' : 'md:pl-0'}`}>
              <p className="text-[10px] font-bold text-black/45">{label}</p>
              <p className="mt-1 text-sm font-black">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#d8d8d8] px-6 py-8 md:px-10 md:py-10">
        <p className="text-[10px] font-black text-black/45">07 / 产品能力</p>
        <h2 className="mt-2 text-2xl font-black">不是一次性的提示词生成器</h2>
        <div className="mt-7 grid border-y border-black/15 md:grid-cols-2">
          {caseStudy.capabilities.map((item, index) => (
            <div
              key={item.title}
              className={`py-5 md:px-6 ${index % 2 === 0 ? 'md:border-r md:border-black/15 md:pl-0' : ''} ${index > 1 ? 'border-t border-black/15' : index === 1 ? 'border-t border-black/15 md:border-t-0' : ''}`}
            >
              <h3 className="text-sm font-black">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-black/58">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid border-y border-[#d8d8d8] bg-[#f5f5f2] md:grid-cols-[1.08fr_0.92fr]">
        <div className="border-b border-[#d8d8d8] p-5 md:border-b-0 md:border-r md:p-8">
          {imageButton(settingsPreview, 'aspect-[1.353/1] bg-white')}
        </div>
        <div className="flex flex-col justify-center px-6 py-8 md:px-9">
          <p className="text-[10px] font-black text-black/45">08 / 开放配置</p>
          <h2 className="mt-2 text-xl font-black">模型选择权留给用户</h2>
          <p className="mt-4 text-[13px] leading-6 text-black/62">
            插件不绑定单一模型或平台代理。用户可以选择常见服务商，也可以填写自己的 OpenAI 兼容接口、API Key 与模型名称；配置完成后保存在浏览器中。
          </p>
          <p className="mt-4 text-[11px] font-bold text-black/42">{settingsPreview.title}</p>
        </div>
      </section>

      <section className="bg-[#242424] px-6 py-8 text-white md:px-10 md:py-10">
        <p className="text-[10px] font-black text-[#ffe45c]">09 / 工程实现</p>
        <h2 className="mt-2 text-2xl font-black">为真实网页环境做的技术选择</h2>
        <div className="mt-7 grid gap-x-8 gap-y-6 md:grid-cols-2">
          {caseStudy.engineering.map((item) => (
            <div key={item.title} className="border-t border-white/18 pt-4">
              <h3 className="text-sm font-black">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-white/55">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-8 md:px-10 md:py-10">
        <div className="mb-5">
          <p className="text-[10px] font-black text-black/45">10 / 真实反馈</p>
          <h2 className="mt-2 text-2xl font-black">发布之后，产品开始被真实用户使用</h2>
          <p className="mt-3 max-w-[650px] text-[13px] leading-6 text-black/60">
            开发者后台记录了 118 次累计安装，用户来自美国、中国、日本等地区，并覆盖 Windows、ChromeOS 与 macOS。对一个独立开发的效率工具而言，上架不是终点，而是进入真实使用场景的开始。
          </p>
        </div>
        {imageButton(adoptionPreview, 'aspect-[1.535/1] border border-[#d8d8d8] bg-[#f6f6f6]')}
        <div className="mt-6 flex flex-col justify-between gap-4 border-t border-black/15 pt-6 md:flex-row md:items-center">
          <p className="max-w-[540px] text-sm font-bold leading-6">
            这个项目展示了我从需求判断、交互设计和模型接入，到扩展开发、隐私合规与商店发布的完整产品能力。
          </p>
          <a
            href={caseStudy.storeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 bg-black px-4 py-3 text-xs font-black text-white transition-colors hover:bg-[#ad8b00]"
          >
            打开 Chrome 商店
            <i className="fa-solid fa-arrow-up-right-from-square" />
          </a>
        </div>
      </section>
    </motion.article>
  );
}

function SafariWindow({ project, onClose }: { project: Project; onClose: () => void }) {
  const dragControls = useDragControls();
  const [lightboxPreview, setLightboxPreview] = useState<PreviewItem | null>(null);

  useEffect(() => {
    if (!lightboxPreview) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxPreview(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPreview]);

  return (
    <>
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280, mass: 0.85 }}
        data-project-window
        data-safari-project-window
        className="absolute left-1/2 top-1/2 z-[120] flex h-[min(940px,92dvh)] w-[min(1120px,96vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[12px] border border-black/15 bg-[#e9e9e9] text-black shadow-[0_34px_90px_rgba(0,0,0,0.32)]"
      >
        <div
          className="flex h-12 shrink-0 cursor-grab items-center gap-3 border-b border-black/12 bg-[#ececec]/95 px-4 select-none active:cursor-grabbing"
          onPointerDown={(event) => dragControls.start(event)}
        >
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={onClose} aria-label="关闭 Safari" className="h-3 w-3 rounded-full border border-[#e0443e] bg-[#ff5f56]" />
            <button type="button" aria-label="最小化" className="h-3 w-3 rounded-full border border-[#dea123] bg-[#ffbd2e]" />
            <button type="button" aria-label="全屏" className="h-3 w-3 rounded-full border border-[#1aab29] bg-[#27c93f]" />
          </div>

          <div className="hidden shrink-0 items-center gap-1 md:flex">
            <button type="button" title="后退" className="flex h-7 w-7 items-center justify-center rounded-[6px] text-black/35 hover:bg-black/7">
              <i className="fa-solid fa-chevron-left text-[11px]" />
            </button>
            <button type="button" title="前进" className="flex h-7 w-7 items-center justify-center rounded-[6px] text-black/25 hover:bg-black/7">
              <i className="fa-solid fa-chevron-right text-[11px]" />
            </button>
            <button type="button" title="显示边栏" className="flex h-7 w-7 items-center justify-center rounded-[6px] text-black/55 hover:bg-black/7">
              <i className="fa-regular fa-window-maximize text-[11px]" />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 justify-center">
            <div className="flex h-7 w-full max-w-[620px] items-center justify-center gap-2 rounded-[7px] border border-black/8 bg-white/75 px-3 text-[12px] text-black/62 shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]">
              <i className="fa-solid fa-lock text-[9px] text-black/35" />
              <span className="truncate">zerinn.local / 我的项目 / prompt-catcher</span>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-1 md:flex">
            <button type="button" title="分享" className="flex h-7 w-7 items-center justify-center rounded-[6px] text-black/55 hover:bg-black/7">
              <i className="fa-solid fa-arrow-up-from-bracket text-[11px]" />
            </button>
            <button type="button" title="新建标签页" className="flex h-7 w-7 items-center justify-center rounded-[6px] text-black/55 hover:bg-black/7">
              <i className="fa-solid fa-plus text-[11px]" />
            </button>
          </div>
        </div>

        <div className="flex h-9 shrink-0 items-end border-b border-black/12 bg-[#dedede] px-3 pt-1.5">
          <div className="flex h-8 min-w-0 max-w-[320px] flex-1 items-center gap-2 rounded-t-[8px] border border-b-0 border-black/10 bg-white px-3 text-[12px] font-medium text-black/72 shadow-[0_-1px_2px_rgba(0,0,0,0.03)]">
            <img src={project.iconSrc} alt="" className="h-4 w-4 rounded-[3px]" draggable={false} />
            <span className="truncate">我的项目 · {project.title}</span>
            <i className="fa-solid fa-xmark ml-auto text-[9px] text-black/30" />
          </div>
          <button type="button" title="新建标签页" className="ml-2 mb-1 flex h-6 w-6 items-center justify-center rounded-[5px] text-black/45 hover:bg-black/7">
            <i className="fa-solid fa-plus text-[10px]" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto bg-white">
          <PromptCatcherCaseStudy
            project={project}
            show
            onOpenImage={setLightboxPreview}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {lightboxPreview && (
          <motion.div
            data-lightbox
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/78 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPreview(null)}
          >
            <motion.div
              className="relative max-h-[92vh] max-w-[92vw]"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightboxPreview(null)}
                aria-label="关闭图片预览"
                className="absolute -right-4 -top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg"
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <img
                src={lightboxPreview.src}
                alt={lightboxPreview.title ?? `${project.title} enlarged preview`}
                className="max-h-[92vh] max-w-[92vw] rounded-[8px] object-contain shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ResumeWindow({ onClose }: { onClose: () => void }) {
  const dragControls = useDragControls();
  const workHistory = [
    {
      company: '广州太平洋电脑信息咨询有限公司',
      role: '其他技术职位',
      date: '2022.04 — 2026.01',
      summary: '担任素材组组长，对接投放团队，带领 4 人素材中台团队完成原创/AI 视频与图片素材的整理、剪辑、特效、调色和字幕制作。',
      bullets: [
        '东风风神 L8 原创素材计划当月消耗超 70 万，奔驰原创素材计划当月消耗超 43 万，客户次月追加预算。',
        '使用扣子制作工作流对接飞书，为小红书图文投放制作爆款二创智能体，在飞书表格输入链接即可生成对应结果。',
        '使用 ComfyUI 搭建 TTS 语音克隆工作流，让配音更具情感和拟人化，提高视频产出效率。',
        '使用 ComfyUI 为团队制作一键换背景应用，方便同事快速迭代车辆图片。',
      ],
    },
    {
      company: '广州素隐商贸有限公司',
      role: '后期制作',
      date: '2020.06 — 2022.02',
      summary: '独立负责留香珠、漱口水等 20 多个品类的信息流后期剪辑，服务巨量千川、UD、鲁班等平台及理然、素士等 S 级客户。',
      bullets: [
        '单条视频计划最高当天 GMV 超 16 万、ROI 超 1.3，当月总 GMV 超 28 万；迭代视频累计统计量超过 50 万。',
        '独立负责商务、市场部门的视频需求，以及直播间引流视频的贴图和视频后期制作。',
        '为部门制作素材查找指南、搬运裂变软件使用方法等 SOP，提高小组制作效率。',
        '参与外拍与配音工作，熟悉短视频素材从拍摄到交付的完整流程。',
      ],
    },
    {
      company: '广州前方高能网络科技有限公司',
      role: '编导',
      date: '2019.11 — 2020.06',
      summary: '负责短视频账号内容策划、数据监测与效果分析，与团队探索快速获取流量的方法。',
      bullets: [
        '账号从零开始运营，不到 3 个月涨粉 23 万；多个视频播放量过百万，最高播放量超过 980 万、点赞 71 万。',
        '作为组长完成脚本、分镜、拍摄、后期剪辑全流程，具备产品推广类剧情视频经验。',
        '在职期间表现优秀，获得公司资金奖励。',
      ],
    },
  ];

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280, mass: 0.85 }}
      data-project-window
      className="absolute left-1/2 top-1/2 z-[130] flex h-[min(900px,90dvh)] w-[min(940px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[16px] border border-black/12 bg-[#f7f7f5] text-[#171717] shadow-[0_34px_90px_rgba(0,0,0,0.3)]"
    >
      <div
        className="flex h-12 shrink-0 cursor-grab items-center justify-between border-b border-black/10 bg-[#ececea]/95 px-4 select-none active:cursor-grabbing"
        onPointerDown={(event) => dragControls.start(event)}
      >
        <div className="flex gap-2">
          <button type="button" onClick={onClose} aria-label="关闭简历" className="h-3 w-3 rounded-full border border-[#e0443e] bg-[#ff5f56]" />
          <button type="button" aria-label="最小化" className="h-3 w-3 rounded-full border border-[#dea123] bg-[#ffbd2e]" />
          <button type="button" aria-label="全屏" className="h-3 w-3 rounded-full border border-[#1aab29] bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-black/60">
          <i className="fa-regular fa-file-lines text-black/40" />
          我的简历
        </div>
        <div className="w-12" />
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto bg-[#fbfbfa]">
        <article className="mx-auto max-w-[820px] px-6 py-8 md:px-12 md:py-11">
          <header className="border-b border-black/12 pb-7">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <p className="text-[11px] font-bold tracking-[0.22em] text-[#9b7b00]">PERSONAL RESUME</p>
                <h1 className="mt-2 text-[38px] font-black tracking-[-0.04em] text-[#151515] md:text-[46px]">何泽霖</h1>
                <p className="mt-2 text-sm font-medium text-black/55">后期制作 · AIGC / 视频内容创作</p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs leading-5 text-black/60 sm:text-right">
                <span>男 · 28 岁</span>
                <span>6 年工作经验</span>
                <span>13104899857</span>
                <span>867491350@qq.com</span>
                <span>期望薪资 15 — 20K</span>
                <span>期望城市：广州</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold text-black/65">
              <span className="border border-black/12 bg-white px-3 py-1.5">求职意向：后期制作</span>
              <span className="border border-black/12 bg-white px-3 py-1.5">个人网站：zerinnai.online</span>
            </div>
          </header>

          <section className="border-b border-black/10 py-7">
            <SectionHeading index="01" title="个人优势" />
            <p className="mt-4 text-[13px] leading-6 text-black/65">我认为我最大的优势是保持好奇心与持续学习的能力。熟悉剪映、PS、PR、AE、达芬奇等软件，热爱剪辑并持续探索 AI 在内容生产中的落地。</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ['AIGC 实战', '模型训练与工作流搭建，个人模型和工作流累计使用量超过 50K。'],
                ['AI 工作流', '熟悉 ComfyUI、即梦、可灵等开源与闭源模型，具备 Vibe Coding 实战经验。'],
                ['内容制作', '有 20 多个品类的信息流剪辑经验，并运营过 10 万粉丝自媒体账号。'],
              ].map(([title, body]) => (
                <div key={title} className="border-l-2 border-[#e4c33c] bg-white px-4 py-3">
                  <h3 className="text-xs font-black">{title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-black/55">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-b border-black/10 py-7">
            <SectionHeading index="02" title="工作经历" />
            <div className="mt-5 space-y-7">
              {workHistory.map((item) => (
                <div key={`${item.company}-${item.role}`} className="relative border-l border-black/15 pl-5">
                  <div className="absolute -left-[4px] top-1.5 h-2 w-2 rounded-full bg-[#d4ae16]" />
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <h3 className="text-[15px] font-black">{item.company}</h3>
                    <span className="text-[11px] font-bold text-black/42">{item.date}</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-[#9b7b00]">{item.role}</p>
                  <p className="mt-2 text-[13px] leading-6 text-black/65">{item.summary}</p>
                  <ul className="mt-2 space-y-1.5 pl-4 text-[12px] leading-5 text-black/58">
                    {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-8 border-b border-black/10 py-7 md:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionHeading index="03" title="教育经历" />
              <div className="mt-5 border-l border-black/15 pl-5">
                <h3 className="text-[15px] font-black">广东财经大学</h3>
                <p className="mt-1 text-xs font-bold text-[#9b7b00]">本科 · 公共事业管理</p>
                <p className="mt-2 text-[11px] text-black/45">2016 — 2020</p>
              </div>
            </div>
            <div>
              <SectionHeading index="04" title="校内荣誉" />
              <ul className="mt-5 space-y-2 pl-4 text-[12px] leading-5 text-black/60">
                <li>2016 — 2017 年度“优秀共青团干部”（学院 5% 人获得）</li>
                <li>2018 — 2019 年度“优秀学生干部”专项奖学金</li>
                <li>大学期间录为中共党员</li>
                <li>担任 3 年班级组织委员、1 年辅导员助理、1 年院组织部成员</li>
              </ul>
            </div>
          </section>

          <section className="pt-7">
            <SectionHeading index="05" title="资格证书" />
            <div className="mt-5 flex flex-wrap gap-3">
              {['大学英语四级', '计算机二级'].map((certificate) => (
                <div key={certificate} className="flex items-center gap-2 border border-black/12 bg-white px-4 py-3 text-sm font-bold">
                  <i className="fa-solid fa-certificate text-[12px] text-[#c7a119]" />
                  {certificate}
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
    </motion.div>
  );
}

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black tracking-[0.16em] text-[#b2941d]">{index}</span>
      <h2 className="text-[18px] font-black tracking-[-0.02em]">{title}</h2>
      <span className="h-px flex-1 bg-black/10" />
    </div>
  );
}

function ContactWindow({ onClose }: { onClose: () => void }) {
  const contactItems = [
    { icon: 'fa-regular fa-envelope', label: '邮箱', value: '13104899857@163.com', href: 'mailto:13104899857@163.com', hoverTitle: '点击即可发送邮件', hoverSubtitle: '将打开默认邮箱应用' },
    { icon: 'fa-regular fa-message', label: '微信', value: 'WWxc010328' },
    { icon: 'fa-solid fa-r', label: 'RunningHub', value: '小何AI', href: 'https://www.runninghub.cn/user-center/1877649407008182273/webapp?inviteCode=262e1ef1', hoverTitle: '点击即可前往主页', hoverSubtitle: '将在新标签页打开 runninghub.cn' },
    { icon: 'fa-brands fa-tiktok', label: '抖音', value: '小何AIGC', href: 'https://v.douyin.com/U0pFkGM5cDo/', hoverTitle: '点击即可跳转主页', hoverSubtitle: '将在新标签页打开 Douyin' },
    { icon: 'fa-regular fa-circle-dot', label: 'LibLibAI', value: '小何AI', href: 'https://www.liblib.art/userpage/eddea37eeae745728c656e9774fd4381/publish/workflow', hoverTitle: '点击即可查看主页', hoverSubtitle: '将在新标签页打开 LibLibAI' },
    { icon: 'fa-brands fa-github', label: 'GitHub', value: '@Zerinn', href: 'https://github.com/hzl199857-lab', hoverTitle: '点击即可查看主页', hoverSubtitle: '将在新标签页打开 GitHub' },
  ];

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280, mass: 0.85 }}
      data-project-window
      className="absolute left-1/2 top-1/2 z-[120] flex max-h-[88vh] w-[min(880px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-white/60 bg-[#f5f3ea]/95 text-black shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-[#d8d2c4] bg-[#f3efe4]/90 px-4 py-2 select-none">
        <div className="flex gap-2">
          <button onClick={onClose} className="flex h-3 w-3 items-center justify-center rounded-full border border-[#e0443e] bg-[#ff5f56]" />
          <button className="flex h-3 w-3 items-center justify-center rounded-full border border-[#dea123] bg-[#ffbd2e]" />
          <button className="flex h-3 w-3 items-center justify-center rounded-full border border-[#1aab29] bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#6f6b80]">
          <i className="fa-regular fa-address-card text-[#8f8a7c]"></i>
          联系我
        </div>
        <div className="w-12"></div>
      </div>

      <div className="overflow-hidden px-8 py-10 md:px-12 md:py-12">
        <div className="mb-10 text-center">
          <h2 className="text-[76px] font-black leading-none tracking-[-0.06em] text-[#18182f] md:text-[112px]">你好</h2>
          <p className="mt-4 text-[18px] font-medium text-[#77758d]">欢迎探讨与合作。</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {contactItems.map((item) => {
            const card = (
              <div className="group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-[24px] border border-[#d9d3c6] bg-white/55 p-6 shadow-[0_18px_34px_rgba(56,43,22,0.08)] transition-all duration-200 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_22px_40px_rgba(56,43,22,0.14)]">
                {item.hoverTitle && (
                  <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 rounded-[18px] bg-[#2e2b42] px-4 py-3 text-white opacity-0 shadow-[0_18px_30px_rgba(30,22,16,0.22)] transition-all duration-200 translate-y-3 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="text-[14px] font-semibold leading-snug">{item.hoverTitle}</div>
                    <div className="mt-1.5 text-[11px] text-white/65">{item.hoverSubtitle}</div>
                  </div>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3efe4] text-[22px] text-[#a8a39a]">
                  <i className={item.icon}></i>
                </div>
                <div className="mt-8">
                  <h3 className="text-[16px] font-bold text-[#1c1c34]">{item.label}</h3>
                  <p className="mt-2 break-all text-[15px] text-[#8f8ca0]">{item.value}</p>
                </div>
              </div>
            );

            if (!item.href) {
              return <div key={item.label}>{card}</div>;
            }

            return (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="block">
                {card}
              </a>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function Dock({ show, revealProgress, onIconClick }: { show: boolean; revealProgress: number; onIconClick: (iconName: string) => void }) {
  const [dockOrder, setDockOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [...DEFAULT_DOCK_ORDER];

    try {
      return parseDockOrder(window.localStorage.getItem(DOCK_ORDER_STORAGE_KEY));
    } catch {
      return [...DEFAULT_DOCK_ORDER];
    }
  });
  const [activeDragIcon, setActiveDragIcon] = useState<string | null>(null);
  const [activeBubbleIcon, setActiveBubbleIcon] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DOCK_ORDER_STORAGE_KEY,
        JSON.stringify(dockOrder),
      );
    } catch {
      // The reordered state still works for this page session.
    }
  }, [dockOrder]);

  useEffect(() => {
    if (!show) {
      setActiveBubbleIcon(null);
      return;
    }

    let lastIcon: string | null = null;
    let hideTimer = 0;

    const showRandomBubble = () => {
      const candidates = DOCK_BUBBLE_IDS.filter((iconName) => iconName !== lastIcon);
      const nextIcon = candidates[Math.floor(Math.random() * candidates.length)];
      lastIcon = nextIcon;
      setActiveBubbleIcon(nextIcon);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setActiveBubbleIcon(null), 2200);
    };

    const firstBubbleTimer = window.setTimeout(showRandomBubble, 650);
    const bubbleInterval = window.setInterval(showRandomBubble, 4200);

    return () => {
      window.clearTimeout(firstBubbleTimer);
      window.clearTimeout(hideTimer);
      window.clearInterval(bubbleInterval);
    };
  }, [show]);

  return (
    <motion.div
      className="absolute bottom-10 left-1/2 z-40 -translate-x-1/2"
      initial={{ opacity: 0, y: 52, scale: 0.94 }}
      animate={show ? { opacity: revealProgress, y: (1 - revealProgress) * 26, scale: 0.98 + revealProgress * 0.02 } : { opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: 'spring', damping: 22, stiffness: 165, mass: 1, delay: 0.24 }}
      style={{ pointerEvents: revealProgress > 0.92 ? 'auto' : 'none' }}
    >
      <div className="origin-center rounded-[22px] border border-white/45 bg-white/18 px-8 py-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.18)] backdrop-blur-[18px] max-[640px]:scale-[0.64]">
        <Reorder.Group
          as="div"
          axis="x"
          values={dockOrder}
          onReorder={setDockOrder}
          className="relative flex items-end gap-3"
        >
          {dockOrder.map((iconName, index) => (
            <DockIcon
              key={iconName}
              iconName={iconName}
              isDockDragging={activeDragIcon !== null}
              showBubble={activeBubbleIcon === iconName}
              hasGroupGap={DOCK_GROUP_ENDS.has(index + 1)}
              onIconClick={onIconClick}
              onDragStateChange={(isDragging) => {
                setActiveDragIcon(isDragging ? iconName : null);
              }}
            />
          ))}
          {DOCK_SEPARATOR_LEFTS.map((left) => (
            <div
              key={left}
              className="pointer-events-none absolute bottom-1 h-[36px] w-px rounded-full bg-black/18 shadow-[1px_0_0_rgba(255,255,255,0.42)]"
              style={{ left }}
            />
          ))}
        </Reorder.Group>
      </div>
    </motion.div>
  );
}

type DockPressGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  activated: boolean;
  cancelled: boolean;
  timerId: number;
  element: HTMLElement;
};

function DockIcon({ iconName, isDockDragging, showBubble, hasGroupGap, onIconClick, onDragStateChange }: {
  key?: React.Key;
  iconName: string;
  isDockDragging: boolean;
  showBubble: boolean;
  hasGroupGap: boolean;
  onIconClick: (iconName: string) => void;
  onDragStateChange: (isDragging: boolean) => void;
}) {
  const dragControls = useDragControls();
  const gestureRef = useRef<DockPressGesture | null>(null);
  const suppressNextClickRef = useRef(false);
  const dockLabel = DOCK_LABELS[iconName];

  useEffect(() => {
    return () => {
      if (gestureRef.current) window.clearTimeout(gestureRef.current.timerId);
    };
  }, []);

  const releaseGesture = (suppressClick: boolean) => {
    const gesture = gestureRef.current;
    if (!gesture) return;

    window.clearTimeout(gesture.timerId);
    if (gesture.activated) onDragStateChange(false);
    if (suppressClick || gesture.activated || gesture.cancelled) {
      suppressNextClickRef.current = true;
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
    }
    gestureRef.current = null;
  };

  const startDockPress = (event: React.PointerEvent<HTMLElement>, pressedIcon: string) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;

    const element = event.currentTarget;
    const gesture: DockPressGesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      activated: false,
      cancelled: false,
      timerId: 0,
      element,
    };

    gestureRef.current = gesture;
    try {
      gesture.element.setPointerCapture(gesture.pointerId);
    } catch {
      // Pointer capture is an enhancement; Motion's window listeners still work.
    }

    gesture.timerId = window.setTimeout(() => {
      if (gestureRef.current !== gesture || gesture.cancelled) return;
      gesture.activated = true;
      suppressNextClickRef.current = true;
      onDragStateChange(true);
      dragControls.start(event);
    }, DOCK_LONG_PRESS_MS);

    if (pressedIcon !== iconName) releaseGesture(true);
  };

  const moveDockPress = (event: React.PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId || gesture.activated) return;

    const distance = Math.hypot(
      event.clientX - gesture.startX,
      event.clientY - gesture.startY,
    );
    if (distance <= DOCK_PRESS_MOVE_TOLERANCE) return;

    gesture.cancelled = true;
    window.clearTimeout(gesture.timerId);
  };

  const endDockPress = () => releaseGesture(false);
  const cancelDockPress = () => releaseGesture(true);

  return (
    <Reorder.Item
      value={iconName}
      dragListener={false}
      dragControls={dragControls}
      layout="position"
      data-dock-icon={iconName}
      className={`group relative flex h-[44px] w-[44px] shrink-0 cursor-pointer items-end justify-center ${hasGroupGap ? 'mr-[13px]' : ''}`}
      style={{ touchAction: 'none' }}
      whileHover={isDockDragging ? undefined : { y: -8 }}
      whileDrag={{ y: -8, scale: 1.12, zIndex: 60 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      onPointerDown={(event) => startDockPress(event, iconName)}
      onPointerMove={moveDockPress}
      onPointerUp={endDockPress}
      onPointerCancel={cancelDockPress}
      onDragEnd={() => releaseGesture(true)}
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        if (suppressNextClickRef.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressNextClickRef.current = false;
          return;
        }
        onIconClick(iconName);
      }}
    >
      <AnimatePresence>
        {!isDockDragging && showBubble && dockLabel && (
          <motion.div
            data-dock-label={iconName}
            className="pointer-events-none absolute -top-16 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center"
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="whitespace-nowrap rounded-[18px] border border-white/80 bg-white px-4 py-2 text-[14px] font-bold text-[#121212] shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
              {dockLabel}
            </div>
            <div className="-mt-1.5 h-3.5 w-3.5 rotate-45 rounded-[3px] border-r border-b border-black/5 bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.06)]" />
          </motion.div>
        )}
      </AnimatePresence>
      <img
        src={`/dock-icons/${iconName}.png`}
        alt={dockLabel ?? iconName}
        className={`h-[46px] w-[46px] rounded-[10px] object-contain drop-shadow-[0_6px_9px_rgba(0,0,0,0.15)] transition-[width,height] duration-200 ${isDockDragging ? '' : 'group-hover:h-[52px] group-hover:w-[52px]'}`}
        draggable={false}
      />
      <div className={`absolute -bottom-1.5 h-[4px] w-[4px] rounded-full bg-black/55 transition-opacity duration-200 ${isDockDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />
    </Reorder.Item>
  );
}
