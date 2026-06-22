import React from 'react';
import { SITE_URL } from '../../utils/info.js';

const GoogleSearchPreview = ({ title, description, url }) => {
    if (!title && !description) {
        return null;
    }

    const displayUrl = url || SITE_URL;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-[var(--brand-primary)]/10">
                    <svg className="w-4 h-4 text-[var(--brand-primary)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                </div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Google Search Preview</h4>
            </div>
            <div className="p-4 bg-white dark:bg-[var(--surface)] rounded-lg border border-[var(--border)] max-w-2xl">
                <div className="space-y-0.5">
                    <div className="text-sm text-[#202124] dark:text-[#bdc1c6]">
                        {displayUrl.replace(/^https?:\/\//, '')}
                    </div>
                    <div className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1">
                        {title || 'Untitled'}
                    </div>
                    <div className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
                        {description || 'No description provided'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleSearchPreview;