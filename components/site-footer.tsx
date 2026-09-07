import { CtaLink } from "@/components/cta-link";
import { primaryNavigation } from "@/lib/site/navigation";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="footer-title">FusoCenter.com</p>
          <p className="footer-copy">Temukan kendaraan niaga dan langkah yang tepat untuk mendukung operasional bisnis Anda.</p>
        </div>
        <nav className="footer-links" aria-label="Navigasi footer">
          {primaryNavigation.slice(0, 4).map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div>
          <CtaLink href="/hubungi-sales/" variant="dark">Hubungi Sales</CtaLink>
        </div>
        <div className="footer-bottom">© FusoCenter.com. Informasi kendaraan, harga, dan promo mengikuti data resmi yang tersedia.</div>
      </div>
    </footer>
  );
}
