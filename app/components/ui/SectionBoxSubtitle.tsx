import React from 'react';

interface SectionBoxSubtitleProps {
    children: React.ReactNode;
    className?: string;
}

export function SectionBoxSubtitle({
    children,
    className = '',
}: SectionBoxSubtitleProps) {
    return (
        <h1
            className={`text-3xl leading-snug font-semibold text-left mb-3 ${className}`}
        >
            {children}
        </h1>
    );
}
