import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ImagePlus, X, ChevronDown, Globe, Search,
    FileText, Eye, Info, Plus, Loader2,
    BookOpen, BarChart2, Share2, Sparkles,
    AlertCircle, CheckCircle, ArrowLeft, Clock,
    Link as LinkIcon, List, HelpCircle
} from "lucide-react";
import { useCreateBlog, useGetAllCategoriesAdmin } from "../../api/blog/useBlog.js";
import { toast } from "react-toastify";
import TipTapEditor from "../../components/editor/TipTapEditor.jsx";
import SchemaMarkup from "../../components/utils/SchemaMarkup.jsx";  
import GoogleSearchPreview from "../../components/utils/GoogleSearchPreview.jsx"; 
import SocialSharePreview from "../../components/utils/SocialSharePreview.jsx";
import { SITE_URL, SITE_NAME } from "../../utils/info.js";

const Required = () => <span className="text-red-500 ml-1">*</span>;

const FormSection = ({ icon: Icon, title, description, children, className = "" }) => (
    <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-md overflow-hidden shadow-sm ${className}`}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-hover)]">
            {Icon && (
                <div className="p-1.5 rounded bg-[var(--brand-primary)]/10">
                    <Icon size={18} className="text-[var(--brand-primary)]" />
                </div>
            )}
            <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
                {description && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>}
            </div>
        </div>
        <div className="p-4 space-y-4">{children}</div>
    </div>
);

const Field = ({ label, required, hint, error, children }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-[var(--text-primary)]">
            {label}{required && <Required />}
        </label>
        {children}
        {hint && !error && <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5"><Info size={12} /> {hint}</p>}
        {error && <p className="text-xs text-red-500 flex items-center gap-1.5"><AlertCircle size={12} /> {error}</p>}
    </div>
);

const Input = ({ error, className = "", ...props }) => (
    <input
        className={`w-full px-3 py-2 rounded-md text-sm bg-[var(--background)] border text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all ${error ? "border-red-400" : "border-[var(--border)]"} ${className}`}
        {...props}
    />
);

const Textarea = ({ rows = 3, error, className = "", ...props }) => (
    <textarea
        rows={rows}
        className={`w-full px-3 py-2 rounded-md text-sm bg-[var(--background)] border text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] resize-none transition-all ${error ? "border-red-400" : "border-[var(--border)]"} ${className}`}
        {...props}
    />
);

const Toggle = ({ checked, onChange, label, description }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className={`w-10 h-5 rounded-full transition-colors duration-200 peer-focus:ring-2 peer-focus:ring-[var(--brand-primary)]/30 ${checked ? "bg-[var(--brand-primary)]" : "bg-[var(--border)]"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
            </div>
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
            {description && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>}
        </div>
    </label>
);

const TagInput = ({ tags, onChange, placeholder }) => {
    const [input, setInput] = useState("");
    const add = () => {
        const val = input.trim();
        if (val && !tags.includes(val)) onChange([...tags, val]);
        setInput("");
    };
    const remove = (t) => onChange(tags.filter((x) => x !== t));
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                    placeholder={placeholder ?? "Type and press Enter"}
                    className="flex-1 px-3 py-2 rounded-md text-sm bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all"
                />
                <button type="button" onClick={add} className="px-3 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition shadow-sm flex items-center gap-1">
                    <Plus size={14} /> Add
                </button>
            </div>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-medium border border-[var(--brand-primary)]/20">
                            {t}
                            <button type="button" onClick={() => remove(t)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

const ImageUploader = ({ file, preview, onChange, onClear, error }) => {
    const inputRef = useRef();
    return (
        <div className="space-y-2">
            {preview ? (
                <div className="relative rounded-md overflow-hidden border border-[var(--border)] aspect-video bg-[var(--background)] group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" onClick={() => inputRef.current?.click()} className="px-3 py-1.5 rounded bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition">Change</button>
                        <button type="button" onClick={onClear} className="px-3 py-1.5 rounded bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition">Remove</button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-xs">{file?.name || "Current image"}</div>
                </div>
            ) : (
                <div onClick={() => inputRef.current?.click()} className={`rounded-md border-2 border-dashed aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${error ? "border-red-400 bg-red-50/5" : "border-[var(--border)] hover:border-[var(--brand-primary)]/50 hover:bg-[var(--brand-primary)]/5"}`}>
                    <div className="w-14 h-14 rounded bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
                        <ImagePlus size={24} className="text-[var(--brand-primary)]" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-[var(--text-primary)]">Click to upload featured image</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">JPEG, PNG, WebP — max 5 MB</p>
                    </div>
                </div>
            )}
            <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" className="hidden" onChange={onChange} />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

// FAQ Component
const FAQItem = ({ faq, index, onUpdate, onRemove }) => {
    const [question, setQuestion] = useState(faq.question || "");
    const [answer, setAnswer] = useState(faq.answer || "");

    useEffect(() => {
        onUpdate(index, { question, answer });
    }, [question, answer]);

    const textareaRef = useRef(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [answer]);

    return (
        <div className="p-3 border border-[var(--border)] rounded-md bg-[var(--background)] space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                        Question <Required />
                    </label>
                    <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter FAQ question..."
                        className="text-sm"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="mt-6 p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Answer <Required />
                </label>
                <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => {
                        setAnswer(e.target.value);
                        adjustHeight();
                    }}
                    placeholder="Enter FAQ answer..."
                    className="w-full px-3 py-2 rounded-md text-sm bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all resize-none overflow-hidden"
                    rows={2}
                />
            </div>
        </div>
    );
};

const INITIAL = {
    title: "",
    excerpt: "",
    content: "",
    featured_img_alt: "",
    featured_img_caption: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    noIndex: false,
    noFollow: false,
    ogTitle: "",
    ogDescription: "",
    twitterTitle: "",
    twitterDescription: "",
    searchableSnippets: [],
    authorName: "",
    authorBio: "",
    status: "DRAFT",
    readingTime: "",
    categoryId: "",
    is_featured: false,
    faqs: [],
    schema_markup: "",
};

const AddBlog = () => {
    const navigate = useNavigate();
    const { mutate: createBlog, isPending } = useCreateBlog();

    const [form, setForm] = useState(INITIAL);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [errors, setErrors] = useState({});
    const [editorContent, setEditorContent] = useState("");
    const [schemaError, setSchemaError] = useState("");

    // Fetch categories
    const { data: categoriesData } = useGetAllCategoriesAdmin({});
    const categories = categoriesData?.categories || [];

    const set = (key, value) => {
        setForm((p) => ({ ...p, [key]: value }));
        if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setErrors((p) => ({ ...p, featuredImage: "Image must be under 5 MB." }));
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setErrors((p) => ({ ...p, featuredImage: "" }));
    };

    const handleFAQUpdate = (index, data) => {
        const updated = [...form.faqs];
        updated[index] = data;
        setForm((p) => ({ ...p, faqs: updated }));
    };

    const handleFAQRemove = (index) => {
        setForm((p) => ({
            ...p,
            faqs: p.faqs.filter((_, i) => i !== index)
        }));
    };

    const handleFAQAdd = () => {
        setForm((p) => ({
            ...p,
            faqs: [...p.faqs, { question: "", answer: "" }]
        }));
    };

    const validate = (data) => {
        const e = {};
        if (!data.title.trim()) e.title = "Title is required.";
        if (!data.excerpt.trim()) e.excerpt = "Excerpt is required.";
        if (!editorContent.trim() || editorContent === "<p></p>") e.content = "Content is required.";
        if (!data.metaTitle.trim()) e.metaTitle = "Meta title is required.";
        if (!data.metaDescription.trim()) e.metaDescription = "Meta description is required.";
        if (!data.authorName.trim()) e.authorName = "Author name is required.";
        if (!imageFile) e.featuredImage = "Featured image is required.";
        
        if (data.faqs && data.faqs.length > 0) {
            const invalidFAQs = data.faqs.some(f => !f.question?.trim() || !f.answer?.trim());
            if (invalidFAQs) e.faqs = "All FAQ questions and answers must be filled.";
        }

        if (data.schema_markup && data.schema_markup.trim()) {
            try {
                JSON.parse(data.schema_markup);
            } catch (err) {
                e.schema_markup = "Invalid JSON format. Please check your schema markup.";
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const cleanForm = { ...form };
        
        Object.keys(cleanForm).forEach(key => {
            if (cleanForm[key] === "" || cleanForm[key] === null || cleanForm[key] === undefined) {
                delete cleanForm[key];
            }
        });

        if (cleanForm.schema_markup) {
            try {
                cleanForm.schema_markup = JSON.parse(cleanForm.schema_markup);
            } catch (err) {
                delete cleanForm.schema_markup;
            }
        } else {
            delete cleanForm.schema_markup;
        }

        const formDataToSubmit = {
            ...cleanForm,
            content: editorContent,
            faqs: JSON.stringify(cleanForm.faqs || [])
        };

        if (formDataToSubmit.searchableSnippets?.length === 0) {
            delete formDataToSubmit.searchableSnippets;
        }

        if (!validate(formDataToSubmit)) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        const fd = new FormData();
        fd.append("featuredImage", imageFile);
        
        Object.entries(formDataToSubmit).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    fd.append(key, JSON.stringify(value));
                }
            } else if (value !== undefined && value !== null && value !== "") {
                fd.append(key, String(value));
            }
        });

        createBlog(fd, {
            onSuccess: (response) => {
                toast.success(response?.message || "Blog created successfully!");
                navigate("/dashboard/manage-blogs");
            },
            onError: (error) => {
                console.error("Blog creation error:", error);
                toast.error(error?.response?.data?.message || "Failed to create blog. Please try again.");
            }
        });
    };

    const getSchemaValue = () => form.schema_markup || "";
    const handleSchemaChange = (value) => {
        set("schema_markup", value);
        setSchemaError("");
        if (value.trim()) {
            try {
                JSON.parse(value);
            } catch (err) {
                setSchemaError("Invalid JSON format. Please check your schema markup.");
            }
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="mb-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/manage-blogs")}
                            className="p-2 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">Add New Post</h1>
                            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Create a new blog post for your audience</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/manage-blogs")}
                            className="px-4 py-2 rounded-md border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="flex items-center gap-2 px-5 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
                        >
                            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {isPending ? "Publishing..." : "Publish"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* LEFT COLUMN */}
                <div className="xl:col-span-2 space-y-4">
                    <FormSection icon={FileText} title="Content" description="Write your blog post content">
                        <Field label="Title" required error={errors.title} hint="Enter a compelling title for your post">
                            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Enter post title..." error={errors.title} />
                        </Field>

                        <Field label="Excerpt" required error={errors.excerpt} hint="Brief summary shown in blog listings">
                            <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Write a short excerpt..." rows={3} error={errors.excerpt} />
                        </Field>

                        <Field label="Content" required error={errors.content}>
                            <TipTapEditor
                                content={editorContent}
                                onChange={setEditorContent}
                                placeholder="Start writing your amazing content here..."
                            />
                        </Field>
                    </FormSection>

                    {/* SEO Section with Google Search Preview - Native details/summary */}
                    <details className="bg-[var(--surface)] border border-[var(--border)] rounded-md overflow-hidden shadow-sm group">
                        <summary className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-hover)] cursor-pointer hover:bg-[var(--surface-hover)]/80 transition-colors list-none">
                            <div className="p-1.5 rounded bg-[var(--brand-primary)]/10">
                                <Search size={18} className="text-[var(--brand-primary)]" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)]">SEO Settings</h3>
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Optimize for search engines</p>
                            </div>
                            <ChevronDown size={18} className="text-[var(--text-secondary)] transition-transform duration-200 group-open:rotate-180" />
                        </summary>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <Field label="Meta Title" required error={errors.metaTitle} hint="Recommended: 50-60 characters">
                                    <Input 
                                        value={form.metaTitle} 
                                        onChange={(e) => set("metaTitle", e.target.value)} 
                                        placeholder="SEO title..." 
                                        maxLength={70} 
                                        error={errors.metaTitle} 
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-[var(--text-secondary)]">{form.metaTitle.length} / 60 characters</p>
                                        {form.metaTitle.length > 60 && <p className="text-xs text-amber-500 font-medium">Title is too long</p>}
                                    </div>
                                </Field>
                                <Field label="Canonical URL" hint="Optional: Custom canonical URL">
                                    <Input 
                                        value={form.canonicalUrl} 
                                        onChange={(e) => set("canonicalUrl", e.target.value)} 
                                        placeholder="https://example.com/blog/post-slug" 
                                    />
                                </Field>
                            </div>

                            <Field label="Meta Description" required error={errors.metaDescription} hint="Recommended: 150-160 characters">
                                <Textarea 
                                    value={form.metaDescription} 
                                    onChange={(e) => set("metaDescription", e.target.value)} 
                                    placeholder="Write a compelling meta description..." 
                                    rows={3} 
                                    error={errors.metaDescription} 
                                    maxLength={170} 
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-[var(--text-secondary)]">{form.metaDescription.length} / 160 characters</p>
                                    {form.metaDescription.length > 160 && <p className="text-xs text-amber-500 font-medium">Description is too long</p>}
                                </div>
                            </Field>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                <Toggle checked={form.noIndex} onChange={(v) => set("noIndex", v)} label="No Index" description="Prevent search engines from indexing" />
                                <Toggle checked={form.noFollow} onChange={(v) => set("noFollow", v)} label="No Follow" description="Don't follow external links" />
                            </div>

                            {/* Google Search Preview */}
                            <div className="mt-3 pt-3 border-t border-[var(--border)]">
                                <GoogleSearchPreview
                                    title={form.metaTitle}
                                    description={form.metaDescription}
                                    url={form.canonicalUrl || `${SITE_URL}/blog/your-post-slug`}
                                />
                            </div>
                        </div>
                    </details>

                    {/* FAQ Section */}
                    <FormSection icon={HelpCircle} title="FAQs" description="Frequently asked questions about this post">
                        {form.faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                faq={faq}
                                index={index}
                                onUpdate={handleFAQUpdate}
                                onRemove={handleFAQRemove}
                            />
                        ))}
                        {errors.faqs && <p className="text-xs text-red-500">{errors.faqs}</p>}
                        <button
                            type="button"
                            onClick={handleFAQAdd}
                            className="w-full py-2.5 border-2 border-dashed border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Plus size={16} /> Add FAQ
                        </button>
                    </FormSection>

                    {/* Schema Markup Section */}
                    <FormSection icon={LinkIcon} title="Schema Markup" description="Add structured data for better SEO">
                        <SchemaMarkup
                            value={getSchemaValue()}
                            onChange={handleSchemaChange}
                            error={schemaError}
                            title={form.title}
                            excerpt={form.excerpt}
                        />
                    </FormSection>

                    {/* Social Media Section with Social Share Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <FormSection icon={Share2} title="Open Graph" description="Facebook & LinkedIn sharing">
                            <Field label="OG Title" hint="Defaults to meta title">
                                <Input 
                                    value={form.ogTitle} 
                                    onChange={(e) => set("ogTitle", e.target.value)} 
                                    placeholder="Social share title..." 
                                />
                            </Field>
                            <Field label="OG Description" hint="Defaults to meta description">
                                <Textarea 
                                    value={form.ogDescription} 
                                    onChange={(e) => set("ogDescription", e.target.value)} 
                                    placeholder="Social share description..." 
                                    rows={3} 
                                />
                            </Field>
                        </FormSection>

                        <FormSection icon={BarChart2} title="Twitter Card" description="X (Twitter) sharing preview">
                            <Field label="Twitter Title" hint="Defaults to OG title">
                                <Input 
                                    value={form.twitterTitle} 
                                    onChange={(e) => set("twitterTitle", e.target.value)} 
                                    placeholder="Twitter card title..." 
                                />
                            </Field>
                            <Field label="Twitter Description" hint="Defaults to OG description">
                                <Textarea 
                                    value={form.twitterDescription} 
                                    onChange={(e) => set("twitterDescription", e.target.value)} 
                                    placeholder="Twitter card description..." 
                                    rows={3} 
                                />
                            </Field>
                        </FormSection>
                    </div>

                    {/* Social Share Preview */}
                    <FormSection icon={Share2} title="Social Share Preview" description="How your post will appear when shared">
                        <SocialSharePreview
                            title={form.ogTitle || form.metaTitle}
                            description={form.ogDescription || form.metaDescription}
                            image={imagePreview}
                            type="article"
                            siteName={SITE_NAME}
                        />
                    </FormSection>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-4">
                    <FormSection icon={Eye} title="Publish" description="Visibility and scheduling">
                        <Field label="Status">
                            <div className="relative">
                                <select 
                                    value={form.status} 
                                    onChange={(e) => set("status", e.target.value)} 
                                    className="w-full appearance-none px-3 py-2 pr-8 rounded-md text-sm bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition cursor-pointer"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                            </div>
                        </Field>
                        <Field label="Reading Time (minutes)" hint="Auto-calculated if left blank">
                            <div className="relative">
                                <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                                <Input 
                                    type="number" 
                                    min="1" 
                                    value={form.readingTime} 
                                    onChange={(e) => set("readingTime", e.target.value)} 
                                    placeholder="Auto" 
                                    className="pl-8" 
                                />
                            </div>
                        </Field>
                        <Field label="Featured Post">
                            <Toggle 
                                checked={form.is_featured} 
                                onChange={(v) => set("is_featured", v)} 
                                label="Feature this post" 
                                description="Show this post in featured sections" 
                            />
                        </Field>
                    </FormSection>

                    <FormSection icon={ImagePlus} title="Featured Image" description="Main post image">
                        <ImageUploader 
                            file={imageFile} 
                            preview={imagePreview} 
                            onChange={handleImageChange} 
                            onClear={() => { setImageFile(null); setImagePreview(""); }} 
                            error={errors.featuredImage} 
                        />
                        <Field label="Alt Text" hint="For accessibility and SEO">
                            <Input 
                                value={form.featured_img_alt} 
                                onChange={(e) => set("featured_img_alt", e.target.value)} 
                                placeholder="Describe the image..." 
                            />
                        </Field>
                        <Field label="Caption" hint="Optional caption">
                            <Input 
                                value={form.featured_img_caption} 
                                onChange={(e) => set("featured_img_caption", e.target.value)} 
                                placeholder="Image caption..." 
                            />
                        </Field>
                    </FormSection>

                    <FormSection icon={List} title="Category" description="Categorize your post">
                        <Field label="Category" hint="Select a category for your blog">
                            <div className="relative">
                                <select 
                                    value={form.categoryId} 
                                    onChange={(e) => set("categoryId", e.target.value)} 
                                    className="w-full appearance-none px-3 py-2 pr-8 rounded-md text-sm bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition cursor-pointer"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                            </div>
                        </Field>
                    </FormSection>

                    <FormSection icon={BookOpen} title="Author" description="Post attribution">
                        <Field label="Author Name" required error={errors.authorName}>
                            <Input 
                                value={form.authorName} 
                                onChange={(e) => set("authorName", e.target.value)} 
                                placeholder="Author name..." 
                                error={errors.authorName} 
                            />
                        </Field>
                        <Field label="Author Bio" hint="Short biography">
                            <Textarea 
                                value={form.authorBio} 
                                onChange={(e) => set("authorBio", e.target.value)} 
                                placeholder="Author bio..." 
                                rows={3} 
                            />
                        </Field>
                    </FormSection>

                    <FormSection icon={Globe} title="Search Snippets" description="Test Google indexing">
                        <Field label="Search Queries" hint="Queries to test indexing">
                            <TagInput 
                                tags={form.searchableSnippets} 
                                onChange={(v) => set("searchableSnippets", v)} 
                                placeholder="Add search queries..." 
                            />
                        </Field>
                        {form.searchableSnippets.length > 0 && (
                            <div className="mt-3 p-3 bg-[var(--background)] rounded-md border border-[var(--border)]">
                                <p className="text-xs font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                                    <CheckCircle size={14} className="text-green-500" />
                                    Copy to test on Google:
                                </p>
                                <div className="space-y-1.5">
                                    {form.searchableSnippets.map((snippet, idx) => (
                                        <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-[var(--surface)] border border-[var(--border)]">
                                            <code className="text-xs text-[var(--text-primary)] flex-1 font-mono">{snippet}</code>
                                            <button 
                                                type="button" 
                                                onClick={() => { navigator.clipboard.writeText(snippet); toast.success("Copied!"); }} 
                                                className="px-2 py-0.5 text-xs text-[var(--brand-primary)] hover:underline font-medium"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </FormSection>

                    <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            <span className="font-semibold">Required fields</span> marked with * must be filled before publishing
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBlog;