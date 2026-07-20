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

const ENABLE_SAFARI_DOCK_ENTRY = false;
const DOCK_LONG_PRESS_MS = 300;
const DOCK_PRESS_MOVE_TOLERANCE = 8;
const DOCK_SEPARATOR_LEFTS = [224, 349, 474];

export default function DesktopScene({ isUnlocking, isUnlocked, revealProgress, backgroundProgress }: { isUnlocking: boolean; isUnlocked: boolean; revealProgress: number; backgroundProgress: number }) {
  const [activeWindows, setActiveWindows] = useState<ActiveWindow[]>([]);
  const [hoveredDockIcon, setHoveredDockIcon] = useState<string | null>(null);
  const [isContactWindowOpen, setIsContactWindowOpen] = useState(false);
  const [isSafariWindowOpen, setIsSafariWindowOpen] = useState(false);

  const toggleWindow = (project: Project) => {
    setActiveWindows((prev) => {
      const isWindowOpen = prev.some((w) => w.project.id === project.id);
      if (isWindowOpen) {
        return prev.filter((w) => w.project.id !== project.id);
      }

      const randomOffsetX = Math.round((Math.random() - 0.5) * 120);
      const randomOffsetY = Math.round(Math.random() * 48);

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
  const isDockTooltipHovered = hoveredDockIcon === '1-2';

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

      <div
        className="relative z-10 h-full w-full transition-all duration-200"
        style={{
          filter: isDockTooltipHovered ? 'blur(12px)' : undefined,
          backdropFilter: isDockTooltipHovered ? 'saturate(0.9)' : undefined,
        }}
      >
        <div className="relative z-10 w-full h-full p-8">
          {projects.map((project, index) => (
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
        {isSafariWindowOpen && <SafariWindow onClose={() => setIsSafariWindowOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isContactWindowOpen && (
          <ContactWindow onClose={() => setIsContactWindowOpen(false)} />
        )}
      </AnimatePresence>

      {isDockTooltipHovered && (
        <div className="pointer-events-none absolute inset-0 z-30 bg-white/12 backdrop-blur-md" />
      )}

      <Dock
        show={show}
        revealProgress={revealProgress}
        hoveredIcon={hoveredDockIcon}
        onHoverChange={setHoveredDockIcon}
        onIconClick={(iconName) => {
          if (iconName === '1-1') {
            if (!ENABLE_SAFARI_DOCK_ENTRY) return;
            setIsSafariWindowOpen(true);
          }

          if (iconName === '1-2') {
            setIsContactWindowOpen(true);
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
      className={`absolute max-w-[94vw] max-h-[calc(100dvh-150px)] bg-[#f5f5f5] text-black rounded-xl shadow-xl overflow-hidden flex flex-col border border-white/50 will-change-transform ${project.id === 'ai-live-drama-case' ? 'w-[clamp(640px,calc((100dvh-96px)*1),860px)]' : 'w-[clamp(460px,calc((100dvh-96px)*0.78),600px)]'}`}
      style={{
        left: project.id === 'ai-live-drama-case' ? 'max(3vw, calc(50vw - min(430px, max(320px, (100dvh - 96px) * 0.5))))' : 'max(3vw, calc(50vw - min(300px, max(230px, (100dvh - 96px) * 0.39))))',
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

      <div className="flex-1 overflow-y-auto no-scrollbar bg-white/95 backdrop-blur-md flex flex-col p-[clamp(16px,2.3dvh,24px)]">
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
function SafariWindow({ onClose }: { onClose: () => void }) {
  const safariTabs = [
    { id: 'kv', label: '一键详情页生成器', url: 'https://kv.zerinnai.online/', scale: 0.84 },
    { id: 'cover', label: '一键视频封面生成器', url: 'https://cover.zerinnai.online/', scale: 0.72 },
    { id: 'home', label: '无限画布', url: 'https://www.zerinnai.online/', scale: 0.9 },
  ] as const;
  const [activeTabId, setActiveTabId] = useState<(typeof safariTabs)[number]['id']>('kv');
  const activeTab = safariTabs.find((tab) => tab.id === activeTabId) ?? safariTabs[0];
  const iframeScale = activeTab.scale;
  const iframeWidth = `${100 / iframeScale}%`;
  const iframeHeight = `${100 / iframeScale}%`;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280, mass: 0.85 }}
      data-project-window
      className="absolute left-1/2 top-1/2 z-[120] flex h-[min(1090px,96vh)] w-[min(1240px,97vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-white/60 bg-[#f6f6f6]/95 text-black shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 border-b border-[#d8d2c4] bg-[#ece9e1]/95 px-4 py-2 select-none">
        <div className="flex gap-2">
          <button onClick={onClose} className="flex h-3 w-3 items-center justify-center rounded-full border border-[#e0443e] bg-[#ff5f56]" />
          <button className="flex h-3 w-3 items-center justify-center rounded-full border border-[#dea123] bg-[#ffbd2e]" />
          <button className="flex h-3 w-3 items-center justify-center rounded-full border border-[#1aab29] bg-[#27c93f]" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#5f5b69]">
            <img src="/dock-icons/1-1.png" alt="Safari" className="h-5 w-5 rounded-[6px]" draggable={false} />
            <span>Safari</span>
          </div>
          <div className="min-w-[220px] max-w-[680px] flex-1 rounded-full border border-[#d7d1c5] bg-white/90 px-4 py-1.5 text-center text-[13px] text-[#5a5568] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
            {activeTab.url}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#ddd7ca] bg-[#f2efe8]/95 px-4 py-2">
        {safariTabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${isActive ? 'bg-white text-[#2f2a3b] shadow-sm border border-[#d7d1c5]' : 'bg-transparent text-[#6b6677] border border-transparent hover:bg-white/70 hover:border-[#d7d1c5]'}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden bg-[#f3efe7] p-3">
        <div className="h-full w-full overflow-hidden rounded-[18px] border border-[#d9d3c6] bg-white">
          <div
            className="h-full w-full origin-top-left"
            style={{
              transform: `scale(${iframeScale})`,
            }}
          >
            <iframe
              src={activeTab.url}
              title={`Safari ${activeTab.label}`}
              className="border-0 bg-white"
              style={{ width: iframeWidth, height: iframeHeight }}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>
    </motion.div>
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

function Dock({ show, revealProgress, hoveredIcon, onHoverChange, onIconClick }: { show: boolean; revealProgress: number; hoveredIcon: string | null; onHoverChange: (iconName: string | null) => void; onIconClick: (iconName: string) => void }) {
  const [dockOrder, setDockOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [...DEFAULT_DOCK_ORDER];

    try {
      return parseDockOrder(window.localStorage.getItem(DOCK_ORDER_STORAGE_KEY));
    } catch {
      return [...DEFAULT_DOCK_ORDER];
    }
  });
  const [activeDragIcon, setActiveDragIcon] = useState<string | null>(null);

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
              hoveredIcon={hoveredIcon}
              isDockDragging={activeDragIcon !== null}
              hasGroupGap={DOCK_GROUP_ENDS.has(index + 1)}
              onHoverChange={onHoverChange}
              onIconClick={onIconClick}
              onDragStateChange={(isDragging) => {
                setActiveDragIcon(isDragging ? iconName : null);
                if (isDragging) onHoverChange(null);
              }}
            />
          ))}
          {DOCK_SEPARATOR_LEFTS.map((left) => (
            <div
              key={left}
              className="pointer-events-none absolute bottom-1 h-[34px] w-px rounded-full bg-black/12 shadow-[1px_0_0_rgba(255,255,255,0.25)]"
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

function DockIcon({ iconName, hoveredIcon, isDockDragging, hasGroupGap, onHoverChange, onIconClick, onDragStateChange }: {
  key?: React.Key;
  iconName: string;
  hoveredIcon: string | null;
  isDockDragging: boolean;
  hasGroupGap: boolean;
  onHoverChange: (iconName: string | null) => void;
  onIconClick: (iconName: string) => void;
  onDragStateChange: (isDragging: boolean) => void;
}) {
  const dragControls = useDragControls();
  const gestureRef = useRef<DockPressGesture | null>(null);
  const suppressNextClickRef = useRef(false);

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
      onMouseEnter={() => {
        if (!isDockDragging) onHoverChange(iconName);
      }}
      onMouseLeave={() => onHoverChange(null)}
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
      {!isDockDragging && ENABLE_SAFARI_DOCK_ENTRY && iconName === '1-1' && hoveredIcon === '1-1' && (
        <motion.div
          className="pointer-events-none absolute -top-16 left-1/2 flex -translate-x-1/2 flex-col items-center"
          initial={{ opacity: 0.92, y: 0, scale: 1 }}
          animate={hoveredIcon === '1-1' ? { opacity: [0.92, 1, 0.92], y: [0, -4, 0], scale: [1, 1.06, 1] } : { opacity: 0, y: 0, scale: 0.98 }}
          transition={{ duration: 1.9, ease: 'easeInOut', repeat: Infinity }}
        >
          <div className="whitespace-nowrap rounded-[18px] border border-white/80 bg-white px-4 py-2 text-[14px] font-bold tracking-[0.01em] text-[#121212] shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
            点击查看我的一些小项目
          </div>
          <div className="-mt-1.5 h-3.5 w-3.5 rotate-45 rounded-[3px] border-r border-b border-black/5 bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.06)]" />
        </motion.div>
      )}
      {!isDockDragging && iconName === '1-2' && hoveredIcon === '1-2' && (
        <motion.div
          className="pointer-events-none absolute -top-16 left-1/2 flex -translate-x-1/2 flex-col items-center"
          initial={{ opacity: 0.92, y: 0, scale: 1 }}
          animate={hoveredIcon === '1-2' ? { opacity: [0.92, 1, 0.92], y: [0, -4, 0], scale: [1, 1.06, 1] } : { opacity: 0, y: 0, scale: 0.98 }}
          transition={{ duration: 1.9, ease: 'easeInOut', repeat: Infinity }}
        >
          <div className="whitespace-nowrap rounded-[18px] border border-white/80 bg-white px-4 py-2 text-[14px] font-bold tracking-[0.01em] text-[#121212] shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
            联系我~
          </div>
          <div className="-mt-1.5 h-3.5 w-3.5 rotate-45 rounded-[3px] border-r border-b border-black/5 bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.06)]" />
        </motion.div>
      )}
      <img
        src={`/dock-icons/${iconName}.png`}
        alt={iconName}
        className={`h-[46px] w-[46px] rounded-[10px] object-contain drop-shadow-[0_6px_9px_rgba(0,0,0,0.15)] transition-[width,height] duration-200 ${isDockDragging ? '' : 'group-hover:h-[52px] group-hover:w-[52px]'}`}
        draggable={false}
      />
      <div className={`absolute -bottom-1.5 h-[4px] w-[4px] rounded-full bg-black/55 transition-opacity duration-200 ${isDockDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />
    </Reorder.Item>
  );
}
