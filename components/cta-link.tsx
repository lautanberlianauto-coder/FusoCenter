import type { AnchorHTMLAttributes, ReactNode } from "react";

type CtaVariant = "primary" | "secondary" | "dark";

interface CtaLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: CtaVariant;
}

export function CtaLink({ children, className = "", variant = "primary", ...props }: CtaLinkProps) {
  return <a className={`cta-link cta-link-${variant} ${className}`.trim()} {...props}>{children}</a>;
}
