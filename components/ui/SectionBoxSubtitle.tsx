interface SectionBoxSubtitleProps {
    children: React.ReactNode;
    className?: string;
  }
  
  export function SectionBoxSubtitle({
    children,
    className = "",
  }: SectionBoxSubtitleProps) {
    return (
      <h2
        className={`
          text-2xl leading-snug        /* base for phones */
          md:text-3xl md:leading-snug /* from 768px and above */
          font-bold sm:font-semibold text-left mb-3
          ${className}
        `}
      >
        {children}
      </h2>
    );
  }