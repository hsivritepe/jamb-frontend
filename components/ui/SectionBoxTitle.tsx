interface SectionBoxTitleProps {
    children: React.ReactNode;
    className?: string;
  }
  
  export function SectionBoxTitle({
    children,
    className = "",
  }: SectionBoxTitleProps) {
    return (
      <h1
        className={`
          text-3xl leading-snug        /* base: phones */
          md:text-5xl md:leading-snug  /* md: tablets/desktops */
          font-bold sm:font-semibold text-left mb-3
          ${className}
        `}
      >
        {children}
      </h1>
    );
  }