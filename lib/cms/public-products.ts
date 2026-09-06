import type { WordPressCollectionItem } from "./wordpress";

export type ProductFamily = "canter" | "fighter-x" | "tractor-head" | "e-canter";

export interface PublicMedia {
  id: number | null;
  source_url: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface PublicPrice {
  value: number | null;
  currency: "IDR";
  display: string | null;
  availability: "LIVE" | "CTA_ONLY" | "HOLD" | null;
}

export interface PublicFinancing {
  down_payment: number | null;
  installment: number | null;
}

export interface PublicProduct {
  title: string;
  slug: string;
  model_code: string | null;
  family: ProductFamily | null;
  featured: boolean | null;
  media: PublicMedia;
  price: PublicPrice;
  financing: PublicFinancing;
  specs: {
    engine_capacity: string | null;
    maximum_power: string | null;
    maximum_torque: string | null;
    transmission: string | null;
    fuel_type: string | null;
    gvwr: string | null;
    vehicle_dimensions: string | null;
  };
  features: string[];
  brochure_url: string | null;
  whatsapp_url: string | null;
}

export interface CommercialPolicyDecision {
  priceAvailability: "LIVE" | "CTA_ONLY" | "HOLD" | null;
  approveFinancing: boolean;
}

export interface CommercialPolicyResolver {
  resolve(item: WordPressCollectionItem, acf: Record<string, unknown>): CommercialPolicyDecision;
}

const denyByDefaultCommercialPolicy: CommercialPolicyResolver = {
  resolve: () => ({ priceAvailability: null, approveFinancing: false }),
};

const EMPTY_MEDIA: PublicMedia = {
  id: null,
  source_url: null,
  alt: null,
  width: null,
  height: null,
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

function asUrl(value: unknown): string | null {
  const candidate = typeof value === "string" ? value.trim() : isRecord(value) ? asString(value.url) : null;
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0).map((entry) => entry.trim());
}

function familyFromValue(value: unknown): ProductFamily | null {
  const family = asString(value)?.toLowerCase();
  return family === "canter" || family === "fighter-x" || family === "tractor-head" || family === "e-canter" ? family : null;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export function normalizePublicProduct(
  item: WordPressCollectionItem,
  policy: CommercialPolicyResolver = denyByDefaultCommercialPolicy,
): PublicProduct {
  const acf = item.acf;
  const decision = policy.resolve(item, acf);
  const trustedPrice = decision.priceAvailability === "LIVE" ? asPositiveNumber(acf.harga_mulai) : null;
  const trustedDownPayment = decision.approveFinancing ? asPositiveNumber(acf.dp_mulai) : null;
  const trustedInstallment = decision.approveFinancing ? asPositiveNumber(acf.angsuran_mulai) : null;
  const publicAvailability = decision.priceAvailability === "LIVE" ? (trustedPrice === null ? null : "LIVE") : decision.priceAvailability;

  return {
    title: item.title,
    slug: item.slug,
    model_code: asString(acf.kode_model),
    family: familyFromValue(acf.kategori_produk),
    featured: asBoolean(acf.produk_unggulan),
    media: { ...EMPTY_MEDIA },
    price: {
      value: trustedPrice,
      currency: "IDR",
      display: trustedPrice === null ? null : formatPrice(trustedPrice),
      availability: publicAvailability,
    },
    financing: { down_payment: trustedDownPayment, installment: trustedInstallment },
    specs: {
      engine_capacity: asString(acf.kapasitas_mesin),
      maximum_power: asString(acf.tenaga_maksimum),
      maximum_torque: asString(acf.torsi_maksimum),
      transmission: asString(acf.transmisi),
      fuel_type: asString(acf.jenis_bahan_bakar),
      gvwr: asString(acf.gvwr),
      vehicle_dimensions: asString(acf.dimensi_kendaraan),
    },
    features: asStringArray(acf.fitur_unggulan),
    brochure_url: asUrl(acf.brosur_pdf),
    whatsapp_url: asUrl(acf.whatsapp_url),
  };
}
