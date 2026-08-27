import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { DATA_DIR, onDataUpdated } from "../../lib/data-sync";

export interface CredentialEntry {
  manufacturer: string;
  name: string;
  icon: string;
  tags: string[];
  version: string;
  user: string;
  pass: string;
  comment: string;
  searchStr: string;
}

let cachedData: CredentialEntry[] | null = null;
onDataUpdated(() => {
  cachedData = null;
});

// Simple Icons slugs are lowercase letters, digits, and hyphens only.
// e.g. "cisco", "tp-link", "d-link"
const ICON_SLUG_RE = /^[a-z0-9-]+$/;
const FALLBACK_ICON = "";

function sanitizeIcon(raw: unknown): string {
  if (typeof raw !== "string" || raw.trim() === "") return FALLBACK_ICON;
  const slug = raw.trim().toLowerCase();
  return ICON_SLUG_RE.test(slug) ? slug : FALLBACK_ICON;
}

export function getAllData(): CredentialEntry[] {
  if (cachedData) return cachedData;

  if (!fs.existsSync(DATA_DIR)) {
    console.warn(`Data directory not found at ${DATA_DIR}`);
    return [];
  }

  const files = fs.readdirSync(DATA_DIR);
  const allResults: CredentialEntry[] = [];

  for (const file of files) {
    if (file.endsWith(".yaml") || file.endsWith(".yml")) {
      try {
        const content = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
        const doc = yaml.load(content) as any;

        if (!doc || !doc.entries || !Array.isArray(doc.entries)) continue;

        const manufacturerTags = Array.isArray(doc.tags) ? doc.tags : [];
        const manufacturerName =
          typeof doc.name === "string" ? doc.name : "Unknown";

        const rawIcon = doc.icon;
        const manufacturerIcon = sanitizeIcon(rawIcon);
        if (
          rawIcon &&
          manufacturerIcon === FALLBACK_ICON &&
          rawIcon !== FALLBACK_ICON
        ) {
          console.warn(
            `[search] Invalid icon slug "${rawIcon}" in ${file} — falling back to "${FALLBACK_ICON}".`,
          );
        }

        for (const entry of doc.entries) {
          allResults.push({
            manufacturer: manufacturerName,
            name: entry.name || "Generic Device",
            icon: manufacturerIcon,
            tags: manufacturerTags,
            version: entry.version || "all",
            user: String(entry.user ?? ""),
            pass: String(entry.pass ?? ""),
            comment: entry.comment || "",
            searchStr:
              `${manufacturerName} ${entry.name} ${entry.comment} ${manufacturerTags.join(" ")}`.toLowerCase(),
          });
        }
      } catch (e) {
        console.error(`Error parsing ${file}:`, e);
      }
    }
  }

  cachedData = allResults;
  return allResults;
}

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q")?.trim().toLowerCase() || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const size = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get("size") || "10")),
  );

  const allEntries = getAllData();

  let filtered = allEntries;
  if (query) {
    const queryTokens = query.split(/\s+/).filter((t) => t.length > 0);
    filtered = allEntries.filter((entry) =>
      queryTokens.every((token) => entry.searchStr.includes(token)),
    );
  }

  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / size);
  const start = (page - 1) * size;

  return new Response(
    JSON.stringify({
      results: filtered
        .slice(start, start + size)
        .map(({ searchStr: _, ...entry }) => entry),
      pagination: {
        totalResults,
        totalPages,
        currentPage: page,
        pageSize: size,
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
};
