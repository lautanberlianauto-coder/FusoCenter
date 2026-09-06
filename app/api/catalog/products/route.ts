import { NextResponse } from "next/server";
import { normalizePublicProduct } from "@/lib/cms/public-products";
import { fetchWordPressCollection } from "@/lib/cms/wordpress";

export const runtime = "nodejs";

const DEFAULT_PER_PAGE = 12;
const MAX_PER_PAGE = 24;

function boundedPositiveInteger(value: string | null, fallback: number, max?: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

function unavailableResponse() {
  return NextResponse.json(
    { error: { code: "CATALOG_UNAVAILABLE", message: "Data katalog sementara tidak tersedia." } },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = boundedPositiveInteger(url.searchParams.get("page"), 1);
    const perPage = boundedPositiveInteger(url.searchParams.get("per_page"), DEFAULT_PER_PAGE, MAX_PER_PAGE);
    const search = url.searchParams.get("search")?.trim().slice(0, 100);
    const collection = await fetchWordPressCollection("products", { search });
    const start = (page - 1) * perPage;
    const items = collection.items.slice(start, start + perPage).map((item) => normalizePublicProduct(item));

    return NextResponse.json(
      {
        items,
        page,
        per_page: perPage,
        total: collection.total,
        total_pages: Math.ceil(collection.total / perPage),
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch {
    return unavailableResponse();
  }
}
