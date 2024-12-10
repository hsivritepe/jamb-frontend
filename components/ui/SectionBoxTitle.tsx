interface SectionBoxTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function SectionBoxTitle({
    children,
    className = '',
}: SectionBoxTitleProps) {
    return (
        <h1
            className={`text-5xl leading-snug font-semibold text-left mb-3 ${className}`}
        >
            {children}
        </h1>
    );
}
