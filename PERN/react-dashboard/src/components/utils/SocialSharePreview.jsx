import React from 'react';

const SocialSharePreview = ({ title, description, image, type = 'article', siteName }) => {
    if (!title && !description) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-[var(--brand-primary)]/10">
                    <svg className="w-4 h-4 text-[var(--brand-primary)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                    </svg>
                </div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Social Share Preview</h4>
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] uppercase font-medium">
                    {type}
                </span>
            </div>
            <div className="p-4 bg-white dark:bg-[var(--surface)] rounded-lg border border-[var(--border)] max-w-md">
                <div className="space-y-2">
                    {image && (
                        <div className="aspect-video bg-[var(--surface)] rounded overflow-hidden">
                            <img 
                                src={image} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="space-y-0.5">
                        <div className="text-xs text-[var(--text-secondary)]/60 uppercase tracking-wide">
                            {siteName || 'Website'}
                        </div>
                        <div className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                            {title || 'Untitled'}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] line-clamp-2">
                            {description || 'No description provided'}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]/60">
                            {window.location.origin}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialSharePreview;