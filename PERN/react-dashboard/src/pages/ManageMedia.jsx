import { useState, useRef } from "react";
import {
  Plus, X, Copy, Check, Trash2, Calendar,
  File, Image, Video, FileText,
  HardDrive, FolderOpen, Upload, Loader2,
  Grid3x3, List, RefreshCw, Edit2, Save,
  AlertCircle, Link as LinkIcon, Info, AlignLeft, Type,
  ChevronDown, BarChart3, Cloud, Activity, Layers,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  useMediaList, useMediaStats, useCloudinaryUsage,
  useUploadMedia, useDeleteMedia, useUpdateMedia,
} from "../api/media/useMedia.js";
import Model from "../components/Model.jsx";
import FileModal from "../components/FileModal.jsx";
import { toast } from "react-toastify";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Opacity-based colors so badges look right in both light/dark without
// relying on Tailwind's `dark:` variant (which won't fire since theming
// is driven by [data-theme] rather than a `.dark` class).
const getFileTypeBadge = (type) => {
  const badges = {
    IMAGE: "bg-purple-500/10 text-purple-500",
    VIDEO: "bg-blue-500/10 text-blue-500",
    PDF: "bg-red-500/10 text-red-500",
    DOC: "bg-green-500/10 text-green-500",
    OTHER: "bg-[var(--surface-hover)] text-[var(--text-secondary)]",
  };
  return badges[type] || badges.OTHER;
};

// Solid hex equivalents of the badge palette above — recharts needs real
// fill colors for SVG <Cell> nodes, CSS vars/opacity utilities don't apply there.
const TYPE_COLORS = {
  IMAGE: "#a855f7",
  VIDEO: "#3b82f6",
  PDF: "#ef4444",
  DOC: "#22c55e",
  OTHER: "#94a3b8",
};

const TYPE_LABELS = {
  IMAGE: "Images",
  VIDEO: "Videos",
  PDF: "PDFs",
  DOC: "Documents",
  OTHER: "Other",
};

const MediaCard = ({ media, onDelete, onCopy, onViewDetails, viewMode }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(media.url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onCopy?.(media.url);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(media);
  };

  if (viewMode === "list") {
    return (
      <div
        className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-lg bg-[var(--background)] flex items-center justify-center overflow-hidden">
              <FileModal
                src={media.url}
                alt={media.original_name}
                type={media.type}
                mimeType={media.mime_type}
                className="w-full h-full object-cover rounded-lg"
                containerClassName="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {media.original_name}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                <span>{formatFileSize(media.size)}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full ${getFileTypeBadge(media.type)}`}>
                  {media.type}
                </span>
                {media.alt_text && <span>• Alt: {media.alt_text.substring(0, 30)}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              title="Copy URL"
            >
              {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        onClick={handleDeleteClick}
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all ${isHovering ? "opacity-100" : "opacity-0"
          }`}
        title="Delete"
      >
        <Trash2 size={14} />
      </button>

      <div className="aspect-square bg-[var(--background)] overflow-hidden">
        <FileModal
          src={media.url}
          alt={media.original_name}
          type={media.type}
          mimeType={media.mime_type}
          className="w-full h-full object-cover"
          containerClassName="w-full h-full"
        />
      </div>

      <div className="p-3 space-y-2" onClick={() => onViewDetails(media)}>
        <p className="text-sm font-medium text-[var(--text-primary)] truncate" title={media.original_name}>
          {media.original_name}
        </p>

        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>{formatFileSize(media.size)}</span>
          <span className={`px-2 py-0.5 rounded-full ${getFileTypeBadge(media.type)}`}>
            {media.type}
          </span>
        </div>

        {media.alt_text && (
          <p className="text-xs text-[var(--text-secondary)] truncate">Alt: {media.alt_text}</p>
        )}

        <button
          onClick={handleCopy}
          className="w-full mt-2 py-1.5 rounded-md border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] transition-all flex items-center justify-center gap-1"
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          {isCopied ? "Copied!" : "Copy URL"}
        </button>
      </div>
    </div>
  );
};

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 80 * 1024 * 1024) {
        toast.error("File size must be less than 30MB");
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("alt_text", altText);
    formData.append("caption", caption);

    try {
      await onUpload(formData);
      setSelectedFile(null);
      setAltText("");
      setCaption("");
      setPreview(null);
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  return (
    <Model open={isOpen} onClose={onClose} title="Upload Media">
      <div className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${selectedFile
              ? "border-green-500 bg-green-500/5"
              : "border-[var(--border)] hover:border-[var(--brand-primary)]/50 hover:bg-[var(--brand-primary)]/5"
            }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
          />
          {preview ? (
            <div className="space-y-2">
              <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded" />
              <p className="text-sm font-medium text-[var(--text-primary)]">{selectedFile.name}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : selectedFile ? (
            <div className="space-y-2">
              <File size={32} className="mx-auto text-green-500" />
              <p className="text-sm font-medium text-[var(--text-primary)]">{selectedFile.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{formatFileSize(selectedFile.size)}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={32} className="mx-auto text-[var(--brand-primary)]" />
              <p className="text-sm font-medium text-[var(--text-primary)]">Click or drag to upload</p>
              <p className="text-xs text-[var(--text-secondary)]">Images, videos, PDFs (max 10MB)</p>
            </div>
          )}
        </div>

        {selectedFile && (
          <>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Alt Text <span className="text-xs text-[var(--text-secondary)]">(SEO & Accessibility)</span>
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image for screen readers..."
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional caption displayed below the image..."
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
              />
            </div>
          </>
        )}

        {selectedFile && (
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface-hover)] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-4 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}
      </div>
    </Model>
  );
};

const MediaDetailsModal = ({ isOpen, onClose, media, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    alt_text: "",
    caption: "",
    original_name: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  if (!media) return null;

  const handleEdit = () => {
    setEditData({
      alt_text: media.alt_text || "",
      caption: media.caption || "",
      original_name: media.original_name || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData.original_name?.trim()) {
      toast.error("Filename cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(media.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ alt_text: "", caption: "", original_name: "" });
  };

  return (
    <Model open={isOpen} onClose={onClose} title="Media Details">
      <div className="space-y-4">
        {/* Preview */}
        <div className="rounded-lg overflow-hidden bg-[var(--background)] max-h-64 flex items-center justify-center">
          <FileModal
            src={media.url}
            alt={media.alt_text || media.original_name}
            type={media.type}
            mimeType={media.mime_type}
            className="max-w-full max-h-64 object-contain"
            containerClassName="max-h-64 w-full flex items-center justify-center"
          />
        </div>

        {/* Details */}
        <div className="space-y-3 overflow-y-auto">
          {/* Filename */}
          <div className="flex items-start gap-3">
            <Type size={16} className="text-[var(--text-secondary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-secondary)]">Filename</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.original_name}
                  onChange={(e) => setEditData({ ...editData, original_name: e.target.value })}
                  className="w-full mt-1 px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)]"
                />
              ) : (
                <p className="text-sm text-[var(--text-primary)] break-all">{media.original_name}</p>
              )}
            </div>
          </div>

          {/* Alt Text */}
          <div className="flex items-start gap-3">
            <Info size={16} className="text-[var(--text-secondary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-secondary)]">Alt Text</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.alt_text}
                  onChange={(e) => setEditData({ ...editData, alt_text: e.target.value })}
                  placeholder="No alt text set"
                  className="w-full mt-1 px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)]"
                />
              ) : (
                <p className="text-sm text-[var(--text-primary)]">{media.alt_text || "—"}</p>
              )}
            </div>
          </div>

          {/* Caption */}
          <div className="flex items-start gap-3">
            <AlignLeft size={16} className="text-[var(--text-secondary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-secondary)]">Caption</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.caption}
                  onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                  placeholder="No caption set"
                  className="w-full mt-1 px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)]"
                />
              ) : (
                <p className="text-sm text-[var(--text-primary)]">{media.caption || "—"}</p>
              )}
            </div>
          </div>

          {/* File Size */}
          <div className="flex items-start gap-3">
            <HardDrive size={16} className="text-[var(--text-secondary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-secondary)]">Size</p>
              <p className="text-sm text-[var(--text-primary)]">{formatFileSize(media.size)}</p>
            </div>
          </div>

          {/* Type */}
          <div className="flex items-start gap-3">
            <FolderOpen size={16} className="text-[var(--text-secondary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-secondary)]">Type</p>
              <p className="text-sm text-[var(--text-primary)]">
                {media.type} {media.mime_type && `(${media.mime_type})`}
              </p>
            </div>
          </div>

          {/* Dimensions */}
          {(media.width || media.height) && (
            <div className="flex items-start gap-3">
              <Image size={16} className="text-[var(--text-secondary)] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[var(--text-secondary)]">Dimensions</p>
                <p className="text-sm text-[var(--text-primary)]">{media.width || "?"} × {media.height || "?"} px</p>
              </div>
            </div>
          )}

          {/* Upload Date */}
          <div className="flex items-start gap-3">
            <Calendar size={16} className="text-[var(--text-secondary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-secondary)]">Uploaded On</p>
              <p className="text-sm text-[var(--text-primary)]">{formatDate(media.created_at)}</p>
            </div>
          </div>

          {/* Last Updated */}
          {media.updated_at && media.updated_at !== media.created_at && (
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-[var(--text-secondary)] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[var(--text-secondary)]">Last Updated</p>
                <p className="text-sm text-[var(--text-primary)]">{formatDate(media.updated_at)}</p>
              </div>
            </div>
          )}

          {/* URL */}
          <div className="flex items-start gap-3">
            <LinkIcon size={16} className="text-[var(--text-secondary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-secondary)]">URL</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs text-[var(--text-primary)] bg-[var(--background)] p-1 rounded flex-1 truncate">
                  {media.url}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(media.url);
                    toast.success("URL copied!");
                  }}
                  className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] transition"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface-hover)] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating || !editData.original_name?.trim()}
                className="px-4 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="px-4 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition flex items-center gap-2"
            >
              <Edit2 size={16} />
              Edit Details
            </button>
          )}
        </div>
      </div>
    </Model>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, media }) => {
  if (!media) return null;

  return (
    <Model open={isOpen} onClose={onClose} title="Delete Media">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-500">
            Are you sure you want to delete <span className="font-semibold">"{media.original_name}"</span>?
            <br />
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface-hover)] transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </Model>
  );
};

/* =====================================================
   COLLAPSIBLE SECTION — native <details>/<summary>, themed
===================================================== */
const CollapsibleSection = ({ title, summaryRight, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(e) => {
        const nowOpen = e.currentTarget.open;
        setOpen(nowOpen);
        if (nowOpen) setHasOpenedOnce(true);
      }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-lg"
    >
      <summary className="list-none cursor-pointer select-none flex items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{title}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-[var(--text-secondary)] hidden sm:inline truncate max-w-[220px]">
            {summaryRight}
          </span>
          <ChevronDown
            size={16}
            className={`text-[var(--text-secondary)] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </summary>
      <div className="px-4 pb-4 pt-3 border-t border-[var(--border)]">
        {/* Only mount heavy children (charts) after first expand — avoids
           recharts measuring a 0x0 container while <details> is collapsed. */}
        {hasOpenedOnce ? children : null}
      </div>
    </details>
  );
};

/* =====================================================
   LIBRARY STATS UI
===================================================== */
const StatCard = ({ icon, label, value, tone = "text-[var(--text-primary)]" }) => (
  <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-3 flex items-center gap-3">
    <div className={`p-2 rounded-md bg-[var(--surface-hover)] ${tone}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-[var(--text-secondary)] truncate">{label}</p>
      <p className={`text-xl font-bold truncate ${tone}`}>{value}</p>
    </div>
  </div>
);

const InsightRow = ({ icon, label, value, sub }) => (
  <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-3 flex items-start gap-3">
    <div className="p-2 rounded-md bg-[var(--surface-hover)] text-[var(--text-secondary)] shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{value ?? "—"}</p>
      {sub && <p className="text-xs text-[var(--text-secondary)] truncate">{sub}</p>}
    </div>
  </div>
);

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--text-primary)",
};

const MediaTypeDonut = ({ breakdown = [] }) => {
  const data = breakdown.filter((item) => item.count > 0);

  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-[var(--text-secondary)]">
        No files yet
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="type"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.type} fill={TYPE_COLORS[entry.type] || TYPE_COLORS.OTHER} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, item) => [
              `${value} files`,
              TYPE_LABELS[item?.payload?.type] || item?.payload?.type,
            ]}
            contentStyle={tooltipStyle}
          />
          <Legend
            verticalAlign="bottom"
            height={24}
            formatter={(value) => TYPE_LABELS[value] || value}
            wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const UploadTrendChart = ({ trend = [] }) => {
  if (trend.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-[var(--text-secondary)]">
        No recent activity
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            formatter={(value) => [`${value} upload${value === 1 ? "" : "s"}`, "Uploads"]}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} className="fill-[var(--brand-primary)]" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const MediaStatsOverview = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={24} className="animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  const totals = stats?.totals;
  if (!totals?.files) {
    return (
      <p className="text-sm text-[var(--text-secondary)] text-center py-6">
        Upload a file to start seeing stats here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: core stat cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <StatCard icon={<FolderOpen size={18} />} label="Total Files" value={totals.files} />
          <StatCard icon={<Image size={18} />} label="Images" value={totals.images} tone="text-purple-500" />
          <StatCard icon={<Video size={18} />} label="Videos" value={totals.videos} tone="text-blue-500" />
          <StatCard icon={<HardDrive size={18} />} label="Total Size" value={formatFileSize(totals.totalSize)} />
        </div>

        {/* Right: charts */}
        <div className="lg:col-span-7 bg-[var(--background)] border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Library Overview</h3>
            <span className="text-xs text-[var(--text-secondary)]">Last 7 days</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <MediaTypeDonut breakdown={stats?.breakdown} />
            <UploadTrendChart trend={stats?.trend} />
          </div>
        </div>
      </div>

      {/* Extra insights row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InsightRow icon={<FileText size={16} />} label="Documents" value={totals.documents} />
        <InsightRow icon={<HardDrive size={16} />} label="Avg. File Size" value={formatFileSize(totals.avgSize)} />
        <InsightRow
          icon={<File size={16} />}
          label="Largest File"
          value={stats?.largestFile?.original_name}
          sub={stats?.largestFile?.size ? formatFileSize(stats.largestFile.size) : null}
        />
        <InsightRow
          icon={<Calendar size={16} />}
          label="Latest Upload"
          value={stats?.latestUpload?.original_name}
          sub={stats?.latestUpload?.created_at ? formatDate(stats.latestUpload.created_at) : null}
        />
      </div>
    </div>
  );
};

/* =====================================================
   CLOUDINARY USAGE UI
===================================================== */
const CLOUDINARY_METRIC_INFO = {
  storage: "Total space your uploaded files currently take up on Cloudinary's servers, right now.",
  bandwidth: "Data transferred whenever someone viewed, downloaded, or your app loaded a file — measured over the trailing 30 days, not a calendar month.",
  transformations: "How many times Cloudinary generated a different version of a file for you — resizing an image, compressing a video, converting a format, etc.",
};

const CloudinaryMetricCard = ({ icon, label, value, description }) => (
  <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-3">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-[var(--brand-primary)]">{icon}</span>
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
    </div>
    <p className="text-lg font-bold text-[var(--text-primary)]">{value}</p>
    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{description}</p>
  </div>
);

const CloudinaryUsagePanel = ({ usage, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={22} className="animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  if (isError || !usage) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] py-4">
        <AlertCircle size={16} />
        Couldn't load Cloudinary usage right now. Try the refresh button above.
      </div>
    );
  }

  const creditsUsed = usage.creditsUsed ?? 0;
  const creditsLimit = usage.creditsLimit ?? 0;
  const percentUsed = creditsLimit ? Math.min(100, (creditsUsed / creditsLimit) * 100) : 0;

  const barStyle =
    percentUsed >= 90
      ? { background: "#ef4444" }
      : percentUsed >= 70
        ? { background: "#f59e0b" }
        : { background: "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))" };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Cloudinary is the cloud service that actually stores and delivers every file you upload
        here — your database only keeps a link to it. Free accounts get a monthly credit
        allowance, where{" "}
        <strong className="text-[var(--text-primary)]">
          1 credit ≈ 1GB of storage, 1GB of bandwidth, or 1,000 file transformations
        </strong>
        , combined into one shared budget. Unlike most subscriptions, it resets on a rolling
        30-day window rather than a fixed calendar month.
      </p>

      {/* Credit usage bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {usage.plan || "Free"} Plan — Credits Used
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            {creditsUsed.toFixed(2)} / {creditsLimit}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[var(--surface-hover)] overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${percentUsed}%`, ...barStyle }} />
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {percentUsed.toFixed(1)}% of your monthly credit allowance used
          {percentUsed >= 70 && " — consider clearing out unused files"}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CloudinaryMetricCard
          icon={<HardDrive size={16} />}
          label="Storage"
          value={formatFileSize(usage.storageBytes)}
          description={CLOUDINARY_METRIC_INFO.storage}
        />
        <CloudinaryMetricCard
          icon={<Activity size={16} />}
          label="Bandwidth (30 days)"
          value={formatFileSize(usage.bandwidthBytes)}
          description={CLOUDINARY_METRIC_INFO.bandwidth}
        />
        <CloudinaryMetricCard
          icon={<Layers size={16} />}
          label="Transformations"
          value={usage.transformations ?? 0}
          description={CLOUDINARY_METRIC_INFO.transformations}
        />
      </div>
    </div>
  );
};

/* =====================================================
   MAIN PAGE
===================================================== */
const ManageMedia = () => {
  const { data: mediaList, isLoading, isFetching: mediaFetching, refetch: refetchMedia } = useMediaList();
  const { data: stats, isLoading: statsLoading, isFetching: statsFetching, refetch: refetchStats } = useMediaStats();
  const {
    data: cloudinaryUsage,
    isLoading: usageLoading,
    isFetching: usageFetching,
    isError: usageError,
    refetch: refetchUsage,
  } = useCloudinaryUsage();

  const { mutate: uploadMedia } = useUploadMedia();
  const { mutate: deleteMedia } = useDeleteMedia();
  const { mutate: updateMedia } = useUpdateMedia();

  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const mediaItems = mediaList || [];
  const isRefreshing = mediaFetching || statsFetching || usageFetching;

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch = item.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleUpload = async (formData) => {
    return new Promise((resolve, reject) => {
      uploadMedia(formData, {
        onSuccess: (data) => {
          refetchMedia();
          resolve(data);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };

  const handleUpdate = async (id, data) => {
    return new Promise((resolve, reject) => {
      updateMedia({ id, ...data }, {
        onSuccess: (updatedMedia) => {
          setSelectedMedia(updatedMedia);
          refetchMedia();
          resolve(updatedMedia);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };

  const handleDelete = () => {
    if (selectedMedia) {
      deleteMedia(selectedMedia.id, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setSelectedMedia(null);
          refetchMedia();
        },
      });
    }
  };

  const handleRefreshAll = () => {
    refetchMedia();
    refetchStats();
    refetchUsage();
  };

  const handleCopyUrl = (url) => {
    toast.success("URL copied to clipboard!");
  };

  const handleViewDetails = (media) => {
    setSelectedMedia(media);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (media) => {
    setSelectedMedia(media);
    setShowDeleteModal(true);
  };

  const statsSummary = statsLoading
    ? "Loading…"
    : stats?.totals?.files
      ? `${stats.totals.files} files · ${formatFileSize(stats.totals.totalSize)}`
      : "No data yet";

  const usageSummary = usageLoading
    ? "Loading…"
    : cloudinaryUsage
      ? `${cloudinaryUsage.plan || "Free"} · ${(cloudinaryUsage.creditsUsed ?? 0).toFixed(2)}/${cloudinaryUsage.creditsLimit ?? 25} credits`
      : "Unavailable";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Media Library</h1>
          <p className="text-base text-[var(--text-secondary)] mt-0.5">
            Manage your images, videos, and documents
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--brand-primary)] text-white text-base font-semibold hover:opacity-90 transition shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Upload Media
        </button>
      </div>

      <CollapsibleSection
        title="Library Statistics"
        summaryRight={statsSummary}
        icon={<BarChart3 size={18} className="text-[var(--brand-primary)]" />}
      >
        <MediaStatsOverview stats={stats} isLoading={statsLoading} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Cloudinary Storage & Bandwidth"
        summaryRight={usageSummary}
        icon={<Cloud size={18} className="text-[var(--brand-primary)]" />}
      >
        <CloudinaryUsagePanel usage={cloudinaryUsage} isLoading={usageLoading} isError={usageError} />
      </CollapsibleSection>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition ${viewMode === "grid"
                ? "bg-[var(--brand-primary)] text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              }`}
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition ${viewMode === "list"
                ? "bg-[var(--brand-primary)] text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              }`}
          >
            <List size={18} />
          </button>
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-2 p-2 rounded-md bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition disabled:opacity-50"
            title="Refresh files, stats, and Cloudinary usage"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
          >
            <option value="ALL">All Types</option>
            <option value="IMAGE">Images</option>
            <option value="VIDEO">Videos</option>
            <option value="PDF">PDFs</option>
            <option value="DOC">Documents</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files..."
            className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] w-48"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[var(--brand-primary)]" />
        </div>
      )}

      {!isLoading && filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen size={48} className="mx-auto text-[var(--text-secondary)] mb-3" />
          <p className="text-[var(--text-secondary)]">No media files found</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-3 text-sm text-[var(--brand-primary)] hover:underline"
          >
            Upload your first file
          </button>
        </div>
      )}

      {!isLoading && filteredMedia.length > 0 && (
        <div className={viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          : "space-y-2"
        }>
          {filteredMedia.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              onDelete={handleDeleteClick}
              onCopy={handleCopyUrl}
              onViewDetails={handleViewDetails}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      <MediaDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedMedia(null);
        }}
        media={selectedMedia}
        onUpdate={handleUpdate}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMedia(null);
        }}
        onConfirm={handleDelete}
        media={selectedMedia}
      />
    </div>
  );
};

export default ManageMedia;