import { useState, useEffect, useRef } from "react";
import { Paperclip, X, ZoomIn, ZoomOut } from "lucide-react";

const ImageModal = ({
  src,
  alt = "image",
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

  const isPDF = src?.toLowerCase().endsWith(".pdf");

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
    if (isPDF) return;
    e.preventDefault();
    e.deltaY < 0 ? zoomIn() : zoomOut();
  };

  const handleMouseDown = (e) => {
    if (isPDF) return;
    isDragging.current = true;
    start.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || isPDF) return;
    setPosition({
      x: e.clientX - start.current.x,
      y: e.clientY - start.current.y,
    });
  };

  const handleMouseUp = () => (isDragging.current = false);

  return (
    <>
      {/* Preview */}
      <div className={`relative overflow-hidden ${containerClassName}`}>
        {!isPDF && placeholder && !isLoaded && (
          <img
            src={placeholder}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover blur-lg scale-110 ${className}`}
          />
        )}

        {/* Image Preview */}
        {!isPDF && (
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
        )}

        {/* PDF Preview (simple icon box) */}
        {isPDF && (
          <div
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center gap-1 p-3 rounded-lg bg-gray-100 text-gray-600 cursor-pointer w-full h-full"
          >
            <Paperclip size={15} />
            <span className="text-sm font-medium">PDF</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
          <button onClick={handleClose} className="absolute top-4 right-4 text-white z-50">
            <X size={28} />
          </button>

          {/* Controls (only for images) */}
          {!isPDF && (
            <div className="absolute bottom-6 flex gap-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur z-40">
              <button onClick={zoomOut} className="text-white hover:text-gray-300 transition">
                <ZoomOut size={20} />
              </button>
              <button onClick={zoomIn} className="text-white hover:text-gray-300 transition">
                <ZoomIn size={20} />
              </button>
            </div>
          )}

          {/* Content */}
          <div
            className="overflow-hidden flex items-center justify-center"
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* IMAGE VIEW */}
            {!isPDF && (
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

            {/* PDF VIEW (multi-page supported by browser) */}
            {isPDF && (
              <iframe
                src={src}
                title="PDF Viewer"
                className="w-[90vw] h-[90vh] rounded"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageModal;