import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variants = {
  primary:
    "bg-gold text-navy font-bold shadow-lg shadow-gold/15 hover:shadow-xl hover:shadow-gold/25 hover:-translate-y-0.5",
  secondary:
    "bg-navy text-white font-bold shadow-lg shadow-navy/15 hover:bg-navy-light hover:-translate-y-0.5",
  outline:
    "border-2 border-navy/15 text-navy font-semibold hover:border-gold hover:bg-gold/5",
  ghost:
    "text-navy font-semibold hover:bg-navy/5",
};

const sizes = {
  sm: "px-4 py-2 text-[11px] gap-1.5 rounded-lg",
  md: "px-6 py-3 text-xs gap-2 rounded-xl",
  lg: "px-8 py-4 text-sm gap-2 rounded-xl",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  icon = false,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center uppercase tracking-wider transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        {icon && <ArrowRight className="h-4 w-4" />}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} type={type} disabled={disabled}>
      {children}
      {icon && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}
