import Link from "next/link";
import { CtaLink } from "@/components/cta-link";
import { conversionNavigation, primaryNavigation } from "@/lib/site/navigation";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand-mark" href="/" aria-label="FusoCenter.com beranda">Fuso<span>Center</span>.com</Link>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {primaryNavigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="header-cta">
          <CtaLink href={conversionNavigation[0].href} variant="primary">{conversionNavigation[0].label}</CtaLink>
        </div>
        <details className="menu-disclosure">
          <summary className="menu-button" aria-label="Buka menu navigasi">Menu</summary>
          <nav className="mobile-nav" aria-label="Navigasi mobile">
            {[...primaryNavigation, ...conversionNavigation].map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
        </details>
      </div>
    </header>
  );
}
