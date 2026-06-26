/**
 * src/components/myAuth/ui/ImageViewer.jsx
 *
 * Accessible image lightbox / zoom viewer, built on the native <dialog>
 * element rather than a div with role="dialog" — this gets focus
 * containment, initial focus, and Escape-to-close from the browser for
 * free instead of reimplementing them in JS.
 *
 * - Wrap any thumbnail; clicking/tapping it opens a full-screen preview.
 * - Close button top-right, zoom controls bottom-center.
 * - Keyboard: Esc closes (native), +/- zoom, 0 resets.
 * - Mouse: wheel to zoom, drag to pan when zoomed, double-click toggles zoom.
 * - Touch: single-finger pan, two-finger pinch to zoom.
 * - Renders via a portal so it always sits above whatever opened it, and
 *   stops its own clicks/keys from also being caught by a parent panel
 *   that listens on `document` (see stopPropagation calls below).
 *
 * Usage:
 *   <ImageViewer src={fullSizeUrl} alt="Profile photo" className="w-20 h-20 rounded-full overflow-hidden">
 *     <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
 *   </ImageViewer>
 *
 * Tip: pass a small/cheap `thumbnailUrl` inside children and a larger
 * `fullSizeUrl` as `src` — the large image is only requested once the
 * dialog is actually opened, since it isn't mounted until then.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Spinner } from "./AuthUI";
import Icons from "./icons";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.5;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const round = (value) => Math.round(value * 10) / 10;

function touchDistance(touches) {
  const [a, b] = touches;
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

function ZoomInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function ZoomOutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

export default function ImageViewer({
  src,
  alt = "",
  children,
  className = "",
  style,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(MIN_SCALE);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const stageRef = useRef(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const pinchRef = useRef({ distance: 0, scale: 1 });

  const resetView = useCallback(() => {
    setScale(MIN_SCALE);
    setPan({ x: 0, y: 0 });
  }, []);

  const openViewer = () => {
    if (disabled || !src) return;
    setOpen(true);
  };

  // Just asks the native dialog to close. Cleanup happens in the
  // 'close' event listener below, so every way of closing — this
  // button, Escape, or a future <form method="dialog"> — goes
  // through the same path.
  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  /* open the dialog modally once it's mounted */
  useEffect(() => {
    if (open) dialogRef.current?.showModal();
  }, [open]);

  /* sync React state + reset state when the dialog closes, by
     whatever means (Escape, .close(), etc.) */
  useEffect(() => {
    const node = dialogRef.current;
    if (!open || !node) return;
    const handleClose = () => {
      setOpen(false);
      resetView();
      setLoaded(false);
      triggerRef.current?.focus();
    };
    node.addEventListener("close", handleClose);
    return () => node.removeEventListener("close", handleClose);
  }, [open, resetView]);

  /* lock body scroll while open (showModal doesn't guarantee this
     on its own across browsers) */
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  const zoomBy = useCallback((delta) => {
    setScale((prev) => {
      const next = clamp(round(prev + delta), MIN_SCALE, MAX_SCALE);
      if (next === MIN_SCALE) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const zoomIn = () => zoomBy(SCALE_STEP);
  const zoomOut = () => zoomBy(-SCALE_STEP);
  const toggleZoom = () => {
    setScale((prev) => (prev > MIN_SCALE ? MIN_SCALE : 2));
    setPan({ x: 0, y: 0 });
  };

  /* wheel-to-zoom via a native listener: React's onWheel is passive
     by default, so calling preventDefault() inside it is ignored. */
  useEffect(() => {
    const node = stageRef.current;
    if (!open || !node) return;
    const handleWheel = (e) => {
      e.preventDefault();
      zoomBy(e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP);
    };
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [open, zoomBy]);

  /* drag to pan (mouse) */
  const onMouseDownImage = (e) => {
    if (scale <= MIN_SCALE) return;
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, originX: pan.x, originY: pan.y };
  };
  const onMouseMoveImage = (e) => {
    if (!dragRef.current.dragging) return;
    setPan({
      x: dragRef.current.originX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.originY + (e.clientY - dragRef.current.startY),
    });
  };
  const stopDrag = () => { dragRef.current.dragging = false; };

  /* one-finger pan, two-finger pinch */
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = { distance: touchDistance(e.touches), scale };
    } else if (e.touches.length === 1 && scale > MIN_SCALE) {
      const t = e.touches[0];
      dragRef.current = { dragging: true, startX: t.clientX, startY: t.clientY, originX: pan.x, originY: pan.y };
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const newDistance = touchDistance(e.touches);
      const ratio = newDistance / (pinchRef.current.distance || newDistance);
      setScale(clamp(round(pinchRef.current.scale * ratio), MIN_SCALE, MAX_SCALE));
    } else if (dragRef.current.dragging && e.touches.length === 1) {
      const t = e.touches[0];
      setPan({
        x: dragRef.current.originX + (t.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (t.clientY - dragRef.current.startY),
      });
    }
  };

  /* Escape is handled natively by the dialog itself (closes + fires
     the 'close' event above) — we only need to stop it from also
     reaching a parent panel/modal's own document-level key listener.
     +/-/0 are custom shortcuts, same treatment. */
  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.stopPropagation(); return; }
    if (e.key === "+" || e.key === "=") { e.stopPropagation(); zoomIn(); return; }
    if (e.key === "-" || e.key === "_") { e.stopPropagation(); zoomOut(); return; }
    if (e.key === "0") { e.stopPropagation(); resetView(); }
  };

  const percent = Math.round(scale * 100);

  return (
    <>
      <style>{`
        .iv-dialog {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          margin: 0;
          border: none;
          padding: 0;
          background: transparent;
          max-width: none;
          max-height: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .iv-dialog::backdrop {
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(6px);
        }
      `}</style>

      <button
        ref={triggerRef}
        type="button"
        onClick={openViewer}
        disabled={disabled || !src}
        className={className}
        style={style}
        aria-label={alt ? `View full size: ${alt}` : "View full size image"}
      >
        {children}
      </button>

      {open &&
        createPortal(
          <dialog
            ref={dialogRef}
            className="iv-dialog"
            aria-label={alt || "Image preview"}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            {/* Close — top right */}
            <button
              type="button"
              autoFocus
              onClick={close}
              aria-label="Close image preview"
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <Icons.X className="h-4 w-4" strokeWidth={2.5} />
            </button>

            <figure className="relative m-0 flex h-full w-full items-center justify-center">
              <div
                ref={stageRef}
                className="flex h-full w-full items-center justify-center select-none"
                onClick={(e) => { if (e.target === stageRef.current) close(); }}
                onDoubleClick={toggleZoom}
                onMouseDown={onMouseDownImage}
                onMouseMove={onMouseMoveImage}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={stopDrag}
                style={{ touchAction: "none", cursor: scale > MIN_SCALE ? "grab" : "zoom-in" }}
              >
                {!loaded && (
                  <div className="absolute" aria-hidden="true">
                    <Spinner size={28} />
                  </div>
                )}
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  onLoad={() => setLoaded(true)}
                  style={{
                    maxWidth: "92vw",
                    maxHeight: "78vh",
                    opacity: loaded ? 1 : 0,
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                    transition: dragRef.current.dragging ? "none" : "transform 150ms ease, opacity 150ms ease",
                  }}
                />
              </div>

              <figcaption className="sr-only">{alt}</figcaption>
            </figure>

            {/* Zoom controls — bottom center */}
            <div
              role="group"
              aria-label="Zoom controls"
              className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full px-2 py-1.5"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(6px)" }}
            >
              <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
                aria-label="Zoom out"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30"
              >
                <ZoomOutIcon className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={resetView}
                aria-label="Reset zoom"
                className="flex h-8 w-12 items-center justify-center rounded-full text-xs font-medium tabular-nums text-white"
              >
                {percent}%
              </button>

              <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
                aria-label="Zoom in"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30"
              >
                <ZoomInIcon className="h-4 w-4" />
              </button>
            </div>
          </dialog>,
          document.body
        )}
    </>
  );
}