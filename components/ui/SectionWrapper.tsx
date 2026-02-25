interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionWrapper({ children, className = "", id }: SectionWrapperProps) {
  return (
    <section className={`py-20 lg:py-28 ${className}`} id={id}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  light?: boolean;
  centered?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
  centered = true,
}: SectionHeadingProps) {
  return (
    <div className={`mb-16 ${centered ? "text-center max-w-3xl mx-auto" : ""}`}>
      {eyebrow && (
        <div className={`flex items-center gap-3 mb-4 ${centered ? "justify-center" : ""}`}>
          <div className="gold-divider" />
          <span className={`text-[11px] font-bold uppercase tracking-[0.3em] ${light ? "text-gold" : "text-gold-dark"}`}>
            {eyebrow}
          </span>
          <div className="gold-divider" />
        </div>
      )}
      <h2 className={`font-heading text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight ${light ? "text-white" : "text-navy"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-5 text-lg leading-relaxed font-light ${light ? "text-white/60" : "text-muted-text"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
