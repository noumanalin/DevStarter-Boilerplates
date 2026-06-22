import { useState, useEffect, useRef } from "react";
import {
  X, ZoomIn, ZoomOut, Play, Download, ExternalLink,
  FileText, FileSpreadsheet, File as FileIcon,
} from "lucide-react";

const OFFICE_VIEWER_BASE = "https://view.officeapps.live.com/op/embed.aspx?src=";

const detectKind = (type, mimeType, src) => {
  const mime = (mimeType || "").toLowerCase();
  const lowerSrc = (src || "").toLowerCase();

  if (type === "IMAGE" || mime.startsWith("image/")) return "image";
  if (type === "VIDEO" || mime.startsWith("video/")) return "video";
  if (type === "PDF" || mime === "application/pdf" || lowerSrc.endsWith(".pdf")) return "pdf";

  const isSpreadsheet = mime.includes("sheet") || mime.includes("excel") || /\.xlsx?$/.test(lowerSrc);
  const isPresentation = mime.includes("presentation") || mime.includes("powerpoint") || /\.pptx?$/.test(lowerSrc);
  const isWordDoc = mime.includes("word") || mime.includes("document") || /\.docx?$/.test(lowerSrc);

  if (type === "DOC" || isSpreadsheet || isPresentation || isWordDoc) {
    if (isSpreadsheet) return "spreadsheet";
    if (isPresentation) return "presentation";
    return "document";
  }

  return "other";
};

const getExtensionLabel = (src, mimeType) => {
  const fromSrc = src?.split("?")[0]?.split(".").pop();
  if (fromSrc && fromSrc.length <= 5 && fromSrc.length > 0) return fromSrc.toUpperCase();
  const fromMime = mimeType?.split("/").pop();
  return fromMime ? fromMime.toUpperCase() : "FILE";
};

const FileModal = ({
  src,
  alt = "file",
  type,
  mimeType,
  className = "",
  containerClassName = "",
  placeholder = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const kind = detectKind(type, mimeType, src);
  const isImage = kind === "image";
  const isVideo = kind === "video";
  const isPdf = kind === "pdf";
  const isOfficeDoc = kind === "spreadsheet" || kind === "presentation" || kind === "document";
  const isOther = kind === "other";

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && handleClose();
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.3, 4));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.3, 1));

  const handleWheel = (e) => {
    if (!isImage) return;
    e.preventDefault();
    e.deltaY < 0 ? zoomIn() : zoomOut();
  };

  const handleMouseDown = (e) => {
    if (!isImage) return;
    isDragging.current = true;
    start.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !isImage) return;
    setPosition({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };

  const handleMouseUp = () => (isDragging.current = false);

  const extensionLabel = getExtensionLabel(src, mimeType);

  const ThumbnailIcon =
    kind === "spreadsheet" ? FileSpreadsheet
    : kind === "pdf" || kind === "document" || kind === "presentation" ? FileText
    : FileIcon;

  return (
    <>
      {/* ---------- THUMBNAIL / PREVIEW ---------- */}
      <div className={`relative overflow-hidden ${containerClassName}`}>
        {isImage && (
          <>
            {placeholder && !isLoaded && (
              <img
                src={placeholder}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover blur-lg scale-110 ${className}`}
              />
            )}
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              onClick={() => setIsOpen(true)}
              className={`cursor-zoom-in transition-opacity duration-500 w-full h-full object-cover ${
                isLoaded ? "opacity-100" : "opacity-0"
              } ${className}`}
            />
          </>
        )}

        {isVideo && (
          <div className="relative w-full h-full cursor-pointer" onClick={() => setIsOpen(true)}>
            <video
              src={src}
              muted
              playsInline
              preload="metadata"
              className={`w-full h-full object-cover ${className}`}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="p-2.5 rounded-full bg-white/90 text-black">
                <Play size={16} fill="currentColor" />
              </div>
            </div>
          </div>
        )}

        {(isPdf || isOfficeDoc || isOther) && (
          <div
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-[var(--surface-hover)] text-[var(--text-secondary)] cursor-pointer w-full h-full"
          >
            <ThumbnailIcon size={22} />
            <span className="text-xs font-medium">{extensionLabel}</span>
          </div>
        )}
      </div>

      {/* ---------- FULLSCREEN VIEWER ---------- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
          {/* Top-right toolbar */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            {!isImage && (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new tab"
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <ExternalLink size={18} />
              </a>
            )}
            <button
              onClick={handleClose}
              title="Close"
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Zoom controls — images only */}
          {isImage && (
            <div className="absolute bottom-6 flex gap-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur z-40">
              <button onClick={zoomOut} className="text-white hover:text-gray-300 transition">
                <ZoomOut size={20} />
              </button>
              <button onClick={zoomIn} className="text-white hover:text-gray-300 transition">
                <ZoomIn size={20} />
              </button>
            </div>
          )}

          <div
            className="overflow-hidden flex items-center justify-center w-full h-full"
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isImage && (
              <img
                src={src}
                alt={alt}
                draggable={false}
                onMouseDown={handleMouseDown}
                style={{
                  transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging.current ? "none" : "transform 0.2s ease",
                  maxHeight: "90vh",
                  maxWidth: "90vw",
                  cursor: scale > 1 ? "grab" : "default",
                }}
                className="select-none"
              />
            )}

            {isVideo && (
              <video src={src} controls autoPlay className="max-h-[90vh] max-w-[90vw] rounded" />
            )}

            {isPdf && (
              <iframe src={src} title={alt} className="w-[90vw] h-[90vh] rounded bg-white" />
            )}

            {isOfficeDoc && (
              <div className="w-[90vw] h-[90vh] flex flex-col gap-2">
                <iframe
                  src={`${OFFICE_VIEWER_BASE}${encodeURIComponent(src)}`}
                  title={alt}
                  className="w-full h-full rounded bg-white"
                />
                <p className="text-xs text-white/70 text-center">
                  Preview not loading? Use the open-in-new-tab icon above to view or download the file directly.
                </p>
              </div>
            )}

            {isOther && (
              <div className="flex flex-col items-center gap-3 text-white">
                <ThumbnailIcon size={48} />
                <p className="text-sm">Preview isn't available for this file type.</p>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition text-sm"
                >
                  <Download size={16} />
                  Open / Download
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FileModal;