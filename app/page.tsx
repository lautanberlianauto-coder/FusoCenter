import { CtaLink } from "@/components/cta-link";

export default function Home() {
  return (
    <main id="main-content" className="site-main">
      <section className="shell-preview" aria-labelledby="preview-title">
        <div className="eyebrow">Commercial vehicle platform</div>
        <h1 id="preview-title">Temukan Fuso yang siap mendukung bisnis Anda.</h1>
        <p>
          Foundation conversion FusoCenter.com telah disiapkan untuk membantu calon pelanggan menemukan pilihan kendaraan dan langkah berikutnya.
        </p>
        <div className="cta-row" aria-label="Pilihan tindakan utama">
          <CtaLink href="/harga-fuso/" variant="primary">Cek Harga</CtaLink>
          <CtaLink href="/mitsubishi-fuso/" variant="secondary">Cari Fuso Saya</CtaLink>
        </div>
        <p className="preview-note">Konten kendaraan, harga, dan promo akan dihadirkan dari CMS sesuai Product Data Contract.</p>
      </section>
    </main>
  );
}
