// components/editor/BasicTipTapEditor.jsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Undo,
  Redo,
  X,
} from "lucide-react";

// Menu Button Component
const MenuButton = ({ onClick, active, disabled, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-all duration-150 ${
      active
        ? "bg-[var(--brand-primary)] text-white shadow-sm"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--brand-primary)]"
    } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

// Simple Link Modal
const SimpleLinkModal = ({ isOpen, onClose, onInsert }) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  if (!isOpen) return null;

  const handleInsert = () => {
    if (url.trim()) {
      let finalUrl = url.trim();
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://") && !finalUrl.startsWith("/") && !finalUrl.startsWith("#")) {
        finalUrl = `https://${finalUrl}`;
      }
      onInsert(finalUrl, text);
      setUrl("");
      setText("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">Insert Link</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com or /page"
              className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Link Text (Optional)</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Click here"
              className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button onClick={handleInsert} className="px-3 py-1.5 text-sm rounded-md bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity">
              Insert Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Basic Editor Component
const BasicTipTapEditor = ({
  content = "",
  onChange,
  placeholder = "Write something...",
  maxLength = null, // Maximum character limit (optional)
  minHeight = "200px",
  maxHeight = "400px",
  showWordCount = true,
  showCharCount = true,
  disabled = false,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  const updateCounts = useCallback((html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter((word) => word.length > 0).length;
    setCharCount(chars);
    setWordCount(words);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }, // Only H1-H3
        codeBlock: false, // No code blocks
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none px-3 py-2 text-gray-900 dark:text-gray-100`,
        style: `min-height: ${minHeight}; max-height: ${maxHeight}; overflow-y: auto;`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      
      // Enforce character limit
      if (maxLength && text.length > maxLength) {
        editor.commands.setContent(content || "");
        return;
      }
      
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

  const insertLink = (url, text) => {
    if (editor) {
      if (text) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`)
          .run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  };

  const isCharLimitReached = maxLength && charCount >= maxLength;

  if (!isMounted) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 p-3">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  const isCharLimitWarning = maxLength && charCount > maxLength * 0.9 && charCount < maxLength;

  return (
    <>
      <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all ${disabled ? "opacity-70" : ""}`}>
        {/* Toolbar - Simplified */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1.5 flex flex-wrap gap-0.5 items-center sticky top-0 z-10">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
              <Undo size={15} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
              <Redo size={15} />
            </MenuButton>
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Text Formatting */}
          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
              <Bold size={15} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
              <Italic size={15} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
              <UnderlineIcon size={15} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
              <Strikethrough size={15} />
            </MenuButton>
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
              <AlignLeft size={15} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
              <AlignCenter size={15} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
              <AlignRight size={15} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
              <AlignJustify size={15} />
            </MenuButton>
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
              <List size={15} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
              <ListOrdered size={15} />
            </MenuButton>
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Link */}
          <MenuButton onClick={() => setShowLinkModal(true)} active={editor.isActive("link")} title="Add Link">
            <LinkIcon size={15} />
          </MenuButton>

          {/* Character Limit Indicator - Right aligned */}
          {maxLength && (
            <div className="flex-1 flex justify-end">
              <div className={`text-xs px-2 py-1 rounded ${
                isCharLimitReached
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  : isCharLimitWarning
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500"
              }`}>
                {charCount} / {maxLength} characters
              </div>
            </div>
          )}
        </div>

        {/* Editor Content */}
        <div className="relative">
          <EditorContent editor={editor} />
          
          {/* Character Limit Overlay */}
          {isCharLimitReached && (
            <div className="absolute bottom-2 right-2 text-xs text-red-500 bg-white dark:bg-gray-900 px-2 py-1 rounded shadow-sm">
              Character limit reached
            </div>
          )}
        </div>

        {/* Footer with word/char count */}
        {(showWordCount || showCharCount) && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-500 flex justify-between">
            <div className="flex gap-3">
              {showWordCount && <span>📝 {wordCount} {wordCount === 1 ? "word" : "words"}</span>}
              {showCharCount && !maxLength && <span>🔤 {charCount} {charCount === 1 ? "character" : "characters"}</span>}
            </div>
            <div>
              {!disabled && <span className="text-gray-400">Tip: Select text to format</span>}
            </div>
          </div>
        )}
      </div>

      <SimpleLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsert={insertLink}
      />
    </>
  );
};

export default BasicTipTapEditor;