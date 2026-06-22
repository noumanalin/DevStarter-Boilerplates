import React, { useState } from 'react';
import { SITE_NAME } from '../../utils/info.js';

const SchemaMarkup = ({ value, onChange, error, title, excerpt }) => {
    const [isValidating, setIsValidating] = useState(false);

    const loadExample = () => {
        const exampleSchema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title || "Your Article Title",
            "description": excerpt || "Article description",
            "author": {
                "@type": "Organization",
                "name": SITE_NAME || "Your Company Name"
            },
            "datePublished": new Date().toISOString().split('T')[0],
            "dateModified": new Date().toISOString().split('T')[0]
        };
        onChange(JSON.stringify(exampleSchema, null, 2));
    };

    const validateJSON = () => {
        setIsValidating(true);
        try {
            if (value && value.trim()) {
                const parsed = JSON.parse(value);
                alert("✓ Schema markup is valid JSON!");
            } else {
                alert("Please enter some schema markup first.");
            }
        } catch (err) {
            alert(`Invalid JSON: ${err.message}`);
        }
        setIsValidating(false);
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">
                    Custom Schema Markup
                    <span className="text-xs text-[var(--text-secondary)] ml-2">
                        (Optional - for advanced SEO)
                    </span>
                </label>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows="8"
                    className={`w-full px-3 py-2 rounded-md border font-mono text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none ${
                        error 
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                            : "border-[var(--border)] bg-[var(--background)]"
                    } text-[var(--text-primary)] transition-all`}
                    placeholder={`{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "description": "Article description",
  "author": {
    "@type": "Organization",
    "name": "${SITE_NAME}"
  }
}`}
                />
                {error && (
                    <p className="text-xs text-red-500 mt-1">
                        {error}
                    </p>
                )}
                {!error && value && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Valid JSON format
                    </p>
                )}
                {!error && !value && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Enter valid JSON-LD schema markup. This will be added to your page's &lt;head&gt; section.
                    </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={loadExample}
                        className="text-xs px-3 py-1.5 rounded bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors border border-[var(--border)]"
                    >
                        Load Example
                    </button>
                    <button
                        type="button"
                        onClick={validateJSON}
                        disabled={isValidating}
                        className="text-xs px-3 py-1.5 rounded bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors border border-[var(--border)] disabled:opacity-50"
                    >
                        {isValidating ? 'Validating...' : 'Validate JSON'}
                    </button>
                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="text-xs px-3 py-1.5 rounded bg-[var(--surface)] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-[var(--border)]"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>
            <div className="p-3 rounded bg-[var(--surface)] border border-[var(--border)]">
                <p className="text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold">Tip:</span> Schema markup helps search engines understand your content better. Common types include Article, BlogPosting, FAQPage, and HowTo.
                </p>
            </div>
        </div>
    );
};

export default SchemaMarkup;