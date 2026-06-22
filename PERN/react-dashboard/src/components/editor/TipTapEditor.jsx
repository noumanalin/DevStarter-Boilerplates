// src/components/editor/TipTapEditor.jsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { FontFamily } from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { createLowlight } from "lowlight";
import "highlight.js/styles/github-dark.css";
import { useState, useEffect, useCallback } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
  Quote, Undo, Redo, Highlighter, Palette, Type, ChevronDown,
  Minus, Plus, X, Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon, Eraser, Columns, Trash2,
  FileCode, Maximize2, Minimize2,
  Eye, EyeOff, Download, Copy, Check, AlertCircle, Hash,
  Merge,
  Split,
} from "lucide-react";

// Initialize lowlight
const lowlight = createLowlight();

// Load languages
const loadLanguages = async () => {
  try {
    const javascript = await import("highlight.js/lib/languages/javascript");
    const python = await import("highlight.js/lib/languages/python");
    const css = await import("highlight.js/lib/languages/css");
    const xml = await import("highlight.js/lib/languages/xml");
    const json = await import("highlight.js/lib/languages/json");
    const bash = await import("highlight.js/lib/languages/bash");
    const typescript = await import("highlight.js/lib/languages/typescript");
    const sql = await import("highlight.js/lib/languages/sql");

    lowlight.register({
      javascript: javascript.default,
      python: python.default,
      css: css.default,
      xml: xml.default,
      json: json.default,
      bash: bash.default,
      typescript: typescript.default,
      sql: sql.default
    });
  } catch (error) {
    console.error("Failed to load languages:", error);
  }
};

loadLanguages();

// Menu Button Component
const MenuButton = ({ onClick, active, disabled, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-md transition-all duration-150 ${active
      ? "bg-[var(--brand-primary)] text-white shadow-sm"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--brand-primary)]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

// Dropdown Menu Component
const DropdownMenu = ({ options, value, onChange, icon: Icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--brand-primary)] flex items-center gap-1.5 text-sm font-medium transition-all"
      >
        {Icon && <Icon size={16} />}
        <span>{currentOption?.label || label}</span>
        <ChevronDown size={14} className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 min-w-[160px] py-1 max-h-64 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors ${value === opt.value ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium" : ""
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Custom Image Extension with Alignment and Margin Support
const CustomImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      alignment: { default: 'center' },
      marginRight: { default: '20px' },
      marginBottom: { default: '20px' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (dom) => ({
          src: dom.getAttribute('src'),
          alt: dom.getAttribute('alt'),
          title: dom.getAttribute('title'),
          width: dom.getAttribute('width'),
          height: dom.getAttribute('height'),
          alignment: dom.getAttribute('data-alignment') || 'center',
          marginRight: dom.getAttribute('data-margin-right') || '20px',
          marginBottom: dom.getAttribute('data-margin-bottom') || '20px',
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment, marginRight, marginBottom, width, height, ...attrs } = HTMLAttributes;

    let style = '';
    if (alignment === 'left') {
      style = `float: left; margin-right: ${marginRight || '20px'}; margin-bottom: ${marginBottom || '20px'}; max-width: 100%; height: auto; border-radius: 8px;`;
    } else if (alignment === 'right') {
      style = `float: right; margin-left: ${marginRight || '20px'}; margin-bottom: ${marginBottom || '20px'}; max-width: 100%; height: auto; border-radius: 8px;`;
    } else {
      style = `display: block; margin-left: auto; margin-right: auto; margin-bottom: ${marginBottom || '20px'}; max-width: 100%; height: auto; border-radius: 8px;`;
    }

    if (width) {
      style += ` width: ${width};`;
    }
    if (height) {
      style += ` height: ${height};`;
    }

    return ['img', {
      ...attrs,
      style,
      'data-alignment': alignment || 'center',
      'data-margin-right': marginRight || '20px',
      'data-margin-bottom': marginBottom || '20px',
      class: 'editor-image',
      loading: 'lazy',
      decoding: 'async'
    }];
  },
});

// Image Modal Component
const ImageModal = ({ isOpen, onClose, onInsert, onUpdate, imageData, isEditMode = false }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [alignment, setAlignment] = useState("center");
  const [marginRight, setMarginRight] = useState("20");
  const [marginBottom, setMarginBottom] = useState("20");
  const [widthUnit, setWidthUnit] = useState("px");
  const [heightUnit, setHeightUnit] = useState("px");

  useEffect(() => {
    if (isEditMode && imageData) {
      setImageUrl(imageData.src || "");
      setAltText(imageData.alt || "");
      const widthMatch = imageData.width?.match(/^(\d+)(px|%)?$/);
      const heightMatch = imageData.height?.match(/^(\d+)(px|%)?$/);
      setWidth(widthMatch ? widthMatch[1] : "");
      setWidthUnit(widthMatch?.[2] || "px");
      setHeight(heightMatch ? heightMatch[1] : "");
      setHeightUnit(heightMatch?.[2] || "px");
      setAlignment(imageData.alignment || "center");
      setMarginRight(imageData.marginRight?.toString().replace(/[^0-9]/g, '') || "20");
      setMarginBottom(imageData.marginBottom?.toString().replace(/[^0-9]/g, '') || "20");
    } else {
      setImageUrl("");
      setAltText("");
      setWidth("");
      setHeight("");
      setWidthUnit("px");
      setHeightUnit("px");
      setAlignment("center");
      setMarginRight("20");
      setMarginBottom("20");
    }
  }, [isEditMode, imageData, isOpen]);

  const handleSubmit = () => {
    if (!imageUrl.trim()) {
      alert('Please provide an image URL');
      return;
    }

    const imageDataObj = {
      src: imageUrl,
      alt: altText,
      width: width ? `${width}${widthUnit}` : null,
      height: height ? `${height}${heightUnit}` : null,
      alignment: alignment,
      marginRight: marginRight ? `${marginRight}px` : "20px",
      marginBottom: marginBottom ? `${marginBottom}px` : "20px",
    };

    if (isEditMode) {
      onUpdate(imageDataObj);
    } else {
      onInsert(imageDataObj);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditMode ? 'Edit Image' : 'Insert Image'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1.5">Image URL *</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
          </div>

          {imageUrl && (
            <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
              <img src={imageUrl} alt="Preview" className="max-w-full h-auto max-h-32 mx-auto rounded" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Alt Text (SEO)</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Important for SEO and screen readers</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Width</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Auto"
                  className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
                <select
                  value={widthUnit}
                  onChange={(e) => setWidthUnit(e.target.value)}
                  className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                >
                  <option value="px">px</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Height</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Auto"
                  className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
                <select
                  value={heightUnit}
                  onChange={(e) => setHeightUnit(e.target.value)}
                  className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                >
                  <option value="px">px</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Alignment</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAlignment("left")}
                className={`flex-1 px-3 py-2 rounded-md border transition-all flex items-center justify-center gap-2 ${alignment === "left"
                  ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                  : "border-gray-300 dark:border-gray-600 hover:border-[var(--brand-primary)]"
                }`}
              >
                <AlignLeft size={16} /> Left
              </button>
              <button
                type="button"
                onClick={() => setAlignment("center")}
                className={`flex-1 px-3 py-2 rounded-md border transition-all flex items-center justify-center gap-2 ${alignment === "center"
                  ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                  : "border-gray-300 dark:border-gray-600 hover:border-[var(--brand-primary)]"
                }`}
              >
                <AlignCenter size={16} /> Center
              </button>
              <button
                type="button"
                onClick={() => setAlignment("right")}
                className={`flex-1 px-3 py-2 rounded-md border transition-all flex items-center justify-center gap-2 ${alignment === "right"
                  ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                  : "border-gray-300 dark:border-gray-600 hover:border-[var(--brand-primary)]"
                }`}
              >
                <AlignRight size={16} /> Right
              </button>
            </div>
          </div>

          {(alignment === "left" || alignment === "right") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {alignment === "left" ? "Margin Right (px)" : "Margin Left (px)"}
                </label>
                <input
                  type="number"
                  value={marginRight}
                  onChange={(e) => setMarginRight(e.target.value)}
                  placeholder="20"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Space between image and text</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Margin Bottom (px)</label>
                <input
                  type="number"
                  value={marginBottom}
                  onChange={(e) => setMarginBottom(e.target.value)}
                  placeholder="20"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Space below image</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90">
            {isEditMode ? 'Update Image' : 'Insert Image'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Table Modal Component
const TableModal = ({ isOpen, onClose, onInsert }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insert Table</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Rows</label>
              <input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Columns</label>
              <input
                type="number"
                min="1"
                max="20"
                value={cols}
                onChange={(e) => setCols(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={withHeader}
              onChange={(e) => setWithHeader(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Include header row</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button onClick={() => { onInsert(rows, cols, withHeader); onClose(); }} className="px-4 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90">
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Link Modal Component
const LinkModal = ({ isOpen, onClose, onInsert }) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  if (!isOpen) return null;

  const normalizeUrl = (inputUrl) => {
    if (!inputUrl) return "";
    inputUrl = inputUrl.trim();
    if (inputUrl.startsWith("http://") || inputUrl.startsWith("https://")) {
      return inputUrl;
    }
    if (inputUrl.startsWith("//")) {
      return `https:${inputUrl}`;
    }
    if (inputUrl.startsWith("www.")) {
      return `https://${inputUrl}`;
    }
    if (inputUrl.startsWith("/")) {
      return inputUrl;
    }
    if (inputUrl.includes("@") && !inputUrl.startsWith("mailto:")) {
      return `mailto:${inputUrl}`;
    }
    if (!inputUrl.includes(".") || inputUrl.startsWith("#")) {
      return inputUrl;
    }
    return `https://${inputUrl}`;
  };

  const handleInsert = () => {
    if (url.trim()) {
      const normalizedUrl = normalizeUrl(url);
      onInsert(normalizedUrl, text);
      setUrl("");
      setText("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insert Link</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com or /blog/post"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Link Text (Optional)</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Click here"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button onClick={handleInsert} className="px-4 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90">
              Insert Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Table Context Menu Component
const TableContextMenu = ({ editor }) => {
  useEffect(() => {
    const handleContextMenu = (event) => {
      const target = event.target;
      const table = target.closest('table');

      if (table && editor) {
        event.preventDefault();

        const menu = document.createElement('div');
        menu.className = 'fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-1 min-w-[200px]';
        menu.style.top = `${event.clientY}px`;
        menu.style.left = `${event.clientX}px`;

        menu.innerHTML = `
          <div class="context-menu-item" data-action="add-row-before">➕ Add Row Above</div>
          <div class="context-menu-item" data-action="add-row-after">➕ Add Row Below</div>
          <div class="context-menu-item" data-action="add-col-before">➕ Add Column Left</div>
          <div class="context-menu-item" data-action="add-col-after">➕ Add Column Right</div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item" data-action="delete-row">🗑️ Delete Row</div>
          <div class="context-menu-item" data-action="delete-col">🗑️ Delete Column</div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item" data-action="delete-table">❌ Delete Table</div>
        `;

        const style = document.createElement('style');
        style.textContent = `
          .context-menu-item { padding: 8px 12px; cursor: pointer; transition: background 0.2s; border-radius: 6px; margin: 2px; }
          .context-menu-item:hover { background: #f3f4f6; }
          .dark .context-menu-item:hover { background: #374151; }
          .context-menu-divider { height: 1px; background: #e5e7eb; margin: 4px 0; }
          .dark .context-menu-divider { background: #374151; }
        `;
        document.head.appendChild(style);

        const handleAction = (action) => {
          switch (action) {
            case 'add-row-before': editor.chain().focus().addRowBefore().run(); break;
            case 'add-row-after': editor.chain().focus().addRowAfter().run(); break;
            case 'add-col-before': editor.chain().focus().addColumnBefore().run(); break;
            case 'add-col-after': editor.chain().focus().addColumnAfter().run(); break;
            case 'delete-row': editor.chain().focus().deleteRow().run(); break;
            case 'delete-col': editor.chain().focus().deleteColumn().run(); break;
            case 'delete-table': editor.chain().focus().deleteTable().run(); break;
          }
          if (document.body.contains(menu)) document.body.removeChild(menu);
          document.removeEventListener('click', removeMenu);
        };

        const removeMenu = (e) => {
          if (!menu.contains(e.target)) {
            if (document.body.contains(menu)) document.body.removeChild(menu);
            document.removeEventListener('click', removeMenu);
          }
        };

        menu.querySelectorAll('.context-menu-item').forEach(item => {
          item.addEventListener('click', () => handleAction(item.dataset.action));
        });

        document.body.appendChild(menu);
        setTimeout(() => document.addEventListener('click', removeMenu), 0);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [editor]);

  return null;
};

// Main Editor Component
const TipTapEditor = ({ content, onChange, placeholder = "Start writing your blog content..." }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentCodeLanguage, setCurrentCodeLanguage] = useState("javascript");
  const [isExpanded, setIsExpanded] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const updateCounts = useCallback((html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = text.replace(/\s/g, '').length;
    setWordCount(words);
    setCharacterCount(chars);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
      }),
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Typography,
      FontFamily,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
        HTMLAttributes: { class: "code-block" },
      }),
      CustomImage,
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "editor-table" },
      }),
      TableRow,
      TableHeader.configure({ HTMLAttributes: { class: "table-header-cell" } }),
      TableCell.configure({ HTMLAttributes: { class: "table-cell" } }),
      HorizontalRule,
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: `ProseMirror prose prose-lg max-w-none focus:outline-none min-h-[500px] px-6 py-4 text-gray-900 dark:text-gray-100 ${isPreviewMode ? 'preview-mode' : ''}`,
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      updateCounts(html);
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
      updateCounts(content || "");
    }
  }, [content, editor, updateCounts]);

  useEffect(() => {
    if (editor && editor.isActive("codeBlock")) {
      editor.chain().focus().setCodeBlock({ language: currentCodeLanguage }).run();
    }
  }, [currentCodeLanguage, editor]);

  useEffect(() => {
    if (!editor) return;

    const handleImageClick = (event) => {
      const target = event.target;
      if (target.tagName === 'IMG') {
        const pos = editor.view.posAtDOM(target, 0);
        const node = editor.view.state.doc.nodeAt(pos);
        if (node && node.type.name === 'image') {
          setSelectedImage({
            src: node.attrs.src,
            alt: node.attrs.alt || '',
            width: node.attrs.width || '',
            height: node.attrs.height || '',
            alignment: node.attrs.alignment || 'center',
            marginRight: node.attrs.marginRight || '20px',
            marginBottom: node.attrs.marginBottom || '20px',
          });
          setShowImageModal(true);
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleImageClick);

    return () => {
      editorElement.removeEventListener('click', handleImageClick);
    };
  }, [editor]);

  const safeTableOperation = (operation, ...args) => {
    if (!editor) return;

    try {
      const chain = editor.chain().focus();

      switch (operation) {
        case 'mergeCells':
          if (editor.state.selection && editor.can().mergeCells()) {
            chain.mergeCells().run();
          }
          break;
        case 'splitCell':
          if (editor.can().splitCell()) {
            chain.splitCell().run();
          }
          break;
        default:
          chain[operation]?.apply(chain, args).run();
      }
    } catch (error) {
      console.warn(`Table operation "${operation}" failed:`, error);
    }
  };

  const insertImage = (imageData) => {
    if (editor) {
      try {
        if (!imageData.src) {
          console.error('No image source provided');
          return;
        }
        editor.chain().focus().setImage(imageData).run();
      } catch (error) {
        console.error('Failed to insert image:', error);
        alert('Failed to insert image. Please check the URL and try again.');
      }
    }
  };

  const updateImage = (imageData) => {
    if (editor && selectedImage) {
      editor.chain().focus().setImage(imageData).run();
    }
    setSelectedImage(null);
  };

  const insertTable = (rows, cols, withHeader) => {
    if (editor) {
      try {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: withHeader }).run();
      } catch (error) {
        console.error("Failed to insert table:", error);
      }
    }
  };

  const insertLink = (url, text) => {
    if (editor) {
      if (text) {
        editor.chain().focus().insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  };

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const applyHighlight = (color) => {
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  const copyContent = async () => {
    const contentHtml = editor.getHTML();
    const textContent = editor.getText();

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([contentHtml], { type: 'text/html' }),
          'text/plain': new Blob([textContent], { type: 'text/plain' }),
        })
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadContent = () => {
    const contentHtml = editor.getHTML();
    const blob = new Blob([contentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const headingOptions = [
    { label: "Paragraph", value: "p" },
    { label: "Heading 1", value: "h1" },
    { label: "Heading 2", value: "h2" },
    { label: "Heading 3", value: "h3" },
    { label: "Heading 4", value: "h4" },
    { label: "Heading 5", value: "h5" },
    { label: "Heading 6", value: "h6" },
  ];

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    if (editor.isActive("heading", { level: 4 })) return "h4";
    if (editor.isActive("heading", { level: 5 })) return "h5";
    if (editor.isActive("heading", { level: 6 })) return "h6";
    return "p";
  };

  const setHeading = (value) => {
    if (value === "p") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value[1]);
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const fontSizes = [
    { label: "Small (14px)", value: "14px" },
    { label: "Normal (16px)", value: "16px" },
    { label: "Medium (18px)", value: "18px" },
    { label: "Large (20px)", value: "20px" },
    { label: "H1 (36px)", value: "36px" },
    { label: "H2 (30px)", value: "30px" },
    { label: "H3 (24px)", value: "24px" },
  ];

  const fontFamilies = [
    { label: "Default", value: "inherit" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Times New Roman", value: "Times New Roman, serif" },
    { label: "Courier New", value: "Courier New, monospace" },
  ];

  const textColors = [
    { label: "Default", value: "inherit" },
    { label: "🔴 Red", value: "#ef4444" },
    { label: "🔵 Blue", value: "#3b82f6" },
    { label: "🟢 Green", value: "#10b981" },
    { label: "🟣 Purple", value: "#8b5cf6" },
    { label: "🟠 Orange", value: "#f97316" },
    { label: "🩷 Pink", value: "#ec4899" },
    { label: "⚫ Black", value: "#000000" },
    { label: "⚪ Gray", value: "#6b7280" },
  ];

  const highlightColors = [
    { label: "🟡 Yellow", value: "#fef08a" },
    { label: "🟢 Green", value: "#bbf7d0" },
    { label: "🔵 Blue", value: "#bfdbfe" },
    { label: "🩷 Pink", value: "#fbcfe8" },
    { label: "🟣 Purple", value: "#e9d5ff" },
    { label: "🟠 Orange", value: "#fed7aa" },
    { label: "🔴 Red", value: "#fecaca" },
    { label: "⚪ Gray", value: "#e5e7eb" },
  ];

  const codeLanguages = [
    { label: "📝 JavaScript", value: "javascript" },
    { label: "📘 TypeScript", value: "typescript" },
    { label: "🐍 Python", value: "python" },
    { label: "🎨 CSS", value: "css" },
    { label: "🌐 HTML", value: "xml" },
    { label: "📦 JSON", value: "json" },
    { label: "🗄️ SQL", value: "sql" },
    { label: "💻 Bash", value: "bash" },
  ];

  const isInCodeBlock = editor?.isActive("codeBlock") || false;

  if (!isMounted) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
              <Undo size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
              <Redo size={18} />
            </MenuButton>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <DropdownMenu
            options={headingOptions}
            value={getCurrentHeading()}
            onChange={setHeading}
            label="Paragraph"
          />

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
              <Bold size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
              <Italic size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
              <UnderlineIcon size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
              <Strikethrough size={18} />
            </MenuButton>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript">
              <SubscriptIcon size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript">
              <SuperscriptIcon size={18} />
            </MenuButton>
            <MenuButton onClick={clearFormatting} title="Clear Formatting">
              <Eraser size={18} />
            </MenuButton>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
              <AlignLeft size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
              <AlignCenter size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
              <AlignRight size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
              <AlignJustify size={18} />
            </MenuButton>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
              <List size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
              <ListOrdered size={18} />
            </MenuButton>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => setShowLinkModal(true)} active={editor.isActive("link")} title="Add Link">
              <LinkIcon size={18} />
            </MenuButton>
            <MenuButton onClick={() => setShowImageModal(true)} title="Add Image">
              <ImageIcon size={18} />
            </MenuButton>
            <MenuButton onClick={() => setShowTableModal(true)} title="Insert Table">
              <TableIcon size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
              <FileCode size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
              <Quote size={18} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
              <Minus size={18} />
            </MenuButton>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {isInCodeBlock && (
            <div className="flex items-center gap-0.5">
              <DropdownMenu
                options={codeLanguages}
                value={currentCodeLanguage}
                onChange={(lang) => setCurrentCodeLanguage(lang)}
                icon={FileCode}
                label="Language"
              />
            </div>
          )}

          {editor.isActive("table") && (
            <div className="flex items-center gap-0.5">
              <MenuButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column Before">
                <Columns size={18} />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column After">
                <Columns size={18} />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Before">
                <Plus size={18} />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">
                <Plus size={18} />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">
                <Trash2 size={18} />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">
                <Trash2 size={18} />
              </MenuButton>
              {editor.can().mergeCells && (
                <MenuButton onClick={() => safeTableOperation('mergeCells')} title="Merge Cells">
                  <Merge size={18} />
                </MenuButton>
              )}
              {editor.can().splitCell && (
                <MenuButton onClick={() => safeTableOperation('splitCell')} title="Split Cell">
                  <Split size={18} />
                </MenuButton>
              )}
              <MenuButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
                <TableIcon size={18} className="text-red-500" />
              </MenuButton>
            </div>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs">
            <span className="flex items-center gap-1">
              <Hash size={12} />
              {wordCount}
            </span>
            <span className="text-gray-400">|</span>
            <span className="flex items-center gap-1">
              <AlertCircle size={12} />
              {characterCount}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <DropdownMenu
              options={fontSizes}
              value={editor.getAttributes("textStyle")?.fontSize || "16px"}
              onChange={(size) => editor.chain().focus().setMark("textStyle", { fontSize: size }).run()}
              icon={Type}
              label="Font Size"
            />
            <DropdownMenu
              options={fontFamilies}
              value={editor.getAttributes("textStyle")?.fontFamily || "inherit"}
              onChange={(font) => editor.chain().focus().setFontFamily(font).run()}
              label="Font Family"
            />
            <DropdownMenu
              options={textColors}
              value={editor.getAttributes("textStyle")?.color || "inherit"}
              onChange={(color) => editor.chain().focus().setColor(color).run()}
              icon={Palette}
              label="Text Color"
            />
            <DropdownMenu
              options={highlightColors}
              value={editor.getAttributes("highlight")?.color || "#fef08a"}
              onChange={applyHighlight}
              icon={Highlighter}
              label="Highlight"
            />
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => setIsPreviewMode(!isPreviewMode)} active={isPreviewMode} title="Preview Mode">
              {isPreviewMode ? <EyeOff size={18} /> : <Eye size={18} />}
            </MenuButton>
            <MenuButton onClick={copyContent} title="Copy Content">
              {copySuccess ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </MenuButton>
            <MenuButton onClick={downloadContent} title="Download HTML">
              <Download size={18} />
            </MenuButton>
            <MenuButton onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Exit Full Screen" : "Full Screen"}>
              {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </MenuButton>
          </div>
        </div>

        <div className={`overflow-auto ${isExpanded ? 'h-[calc(100%-120px)]' : ''}`}>
          <EditorContent editor={editor} />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs text-gray-500 flex flex-wrap justify-between items-center">
          <div className="flex gap-3">
            <span>💡 <strong>Tip:</strong> Right-click on tables for more options</span>
            <span>🖼️ <strong>Image:</strong> Click any image to edit alignment, dimensions, and margins</span>
          </div>
          <div className="flex gap-3">
            <span>📝 Semantic HTML output ready for API</span>
          </div>
        </div>
      </div>

      <TableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onInsert={insertTable}
      />
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsert={insertLink}
      />
      <ImageModal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setSelectedImage(null);
        }}
        onInsert={insertImage}
        onUpdate={updateImage}
        imageData={selectedImage}
        isEditMode={!!selectedImage}
      />
      <TableContextMenu editor={editor} />
    </>
  );
};

export default TipTapEditor;