const RESOURCE_PATHS = {
  models: "models",
  products: "products",
  promotions: "promotions",
  branches: "branches",
  faqs: "faqs",
} as const;

const RESOURCE_POST_TYPES = {
  models: "fuso_model",
  products: "produk_fuso",
  promotions: "promo",
  branches: "cabang",
  faqs: "faq",
} as const;

export type WordPressResource = keyof typeof RESOURCE_PATHS;

export interface WordPressCollectionItem {
  id: number;
  type: string;
  title: string;
  slug: string;
  status: string;
  date: string;
  modified: string;
  acf: Record<string, unknown>;
}

export interface WordPressCollection {
  items: WordPressCollectionItem[];
  total: number;
  post_type: string;
}

export interface WordPressCollectionQuery {
  search?: string;
}

const MAX_PER_PAGE = 100;
const REQUEST_TIMEOUT_MS = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid CMS collection item field: ${field}`);
  }
  return value.trim();
}

function validateItem(value: unknown, expectedPostType: string): WordPressCollectionItem {
  if (!isRecord(value) || typeof value.id !== "number" || !Number.isInteger(value.id) || value.id <= 0) {
    throw new Error("Invalid CMS collection item identity");
  }

  const type = requiredNonEmptyString(value.type, "type");
  const title = requiredNonEmptyString(value.title, "title");
  const slug = requiredNonEmptyString(value.slug, "slug");
  const status = requiredNonEmptyString(value.status, "status");
  if (type !== expectedPostType || status !== "publish") {
    throw new Error("CMS collection contains an unexpected post type or unpublished item");
  }

  return {
    id: value.id,
    type,
    title,
    slug,
    status,
    date: typeof value.date === "string" ? value.date : "",
    modified: typeof value.modified === "string" ? value.modified : "",
    acf: isRecord(value.acf) ? value.acf : {},
  };
}

function validateCollection(value: unknown, expectedPostType: string): WordPressCollection {
  if (!isRecord(value) || !Array.isArray(value.items) || typeof value.total !== "number" || !Number.isInteger(value.total)) {
    throw new Error("Invalid CMS collection contract");
  }

  const postType = requiredNonEmptyString(value.post_type, "post_type");
  if (postType !== expectedPostType) {
    throw new Error("CMS collection post type does not match requested resource");
  }
  const items = value.items.map((item) => validateItem(item, expectedPostType));
  if (value.total < items.length) {
    throw new Error("Invalid CMS collection total");
  }
  if (value.total > items.length) {
    throw new Error("CMS collection is truncated: total exceeds returned items");
  }

  return {
    items,
    total: value.total,
    post_type: postType,
  };
}

function getCredentials(): { username: string; applicationPassword: string } {
  const username = process.env.WORDPRESS_API_USERNAME?.trim();
  const applicationPassword = process.env.WORDPRESS_API_APPLICATION_PASSWORD?.trim();
  if (!username || !applicationPassword) {
    throw new Error("CMS server credentials are not configured");
  }
  return { username, applicationPassword };
}

function getApiUrl(): string {
  const baseUrl = process.env.WORDPRESS_API_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("CMS server URL is not configured");
  }
  return baseUrl;
}

export async function fetchWordPressCollection(
  resource: WordPressResource,
  query: WordPressCollectionQuery = {},
): Promise<WordPressCollection> {
  const { username, applicationPassword } = getCredentials();
  const url = new URL(`${getApiUrl()}/fusocenter/v1/${RESOURCE_PATHS[resource]}`);

  // This is deliberately server-side and deliberately fixed to the public catalog state.
  url.searchParams.set("status", "publish");
  url.searchParams.set("per_page", String(MAX_PER_PAGE));
  const search = query.search?.trim().slice(0, 100);
  if (search) url.searchParams.set("search", search);

  const encodedCredentials = Buffer.from(`${username}:${applicationPassword}`).toString("base64");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
      next: { revalidate: 60, tags: [`cms:${resource}`] },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`CMS request failed with status ${response.status}`);
    }

    return validateCollection(await response.json(), RESOURCE_POST_TYPES[resource]);
  } finally {
    clearTimeout(timeout);
  }
}
